import { SCHOOL_TYPE_NAME_TO_CODE_MAP } from '@/lib/school-info.constant';
import {
  CHILD_ESTABLISH_TYPE,
  KINDER_ESTABLISH_TYPE,
  PRIVATE_CHILD_ESTABLISH_TYPE,
  PRIVATE_KINDER_ESTABLISH_TYPE,
  PUBLIC_CHILD_ESTABLISH_TYPE,
  PUBLIC_KINDER_ESTABLISH_TYPE,
} from '@/lib/school-info.constant';
import * as cheerio from 'cheerio';
import { ChildSchoolInfo, KindergartenSearch } from '@/types/school-finder/childschoolinfo';
import { getPagination } from '@/lib/util/common.util';
import { CACHE_TTL, createCacheDir, createLargeJsonCacheFile } from '@/lib/util/cache.util';
import path from 'path';
import fs from 'fs';
import { BaseResult, SchoolSearch } from '@/types/school-finder/school';
import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { Transform } from 'stream';
import { Pagination } from '@/types/school-finder/common';

export class ChildSchoolInfoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChildSchoolInfoError';
  }
}

/**
 * 유치원알리미 사이트에서 유치원 목록을 가져옵니다.
 *
 * @see https://e-childschoolinfo.moe.go.kr/kinderMt/combineFind.do
 *
 * @param {KindergartenSearch} params 유치원 검색 조건
 * @returns 유치원 목록
 * @throws {ChildSchoolInfoError} 유치원알리미에서 목록을 가져오는 중 오류가 발생했습니다.
 */
export const crawlChildSchoolInfo = async ({
  sidoCode = 99,
  sggCode = 99,
  ro = '99',
  sname = '',
  tab = '2',
  kinderEstablish = [],
  childEstablish = [],
  isIncludeSuspension = false,
  isIncludeClosure = false,
  ittld = '',
  page = 1,
  pageSize = 10,
}: KindergartenSearch) => {
  try {
    /**
     * 이름 검색어 키
     */
    let organName = 'organName';
    /**
     * 설립 유형 체크박스 키
     */
    let establishCB = 'establishCB';
    /**
     * 상태 체크박스 키
     */
    let statusCB = 'statusCB';

    const requestUrl = new URL('https://e-childschoolinfo.moe.go.kr/kinderMt/combineFind.do');
    const searchParams = new URLSearchParams();
    searchParams.set('combineSidoCode', sidoCode.toString());
    searchParams.set('kinderSidoCode', sidoCode.toString());
    searchParams.set('childSidoCode', sidoCode.toString());

    searchParams.set('combineSggCode', sggCode.toString());
    searchParams.set('kinderSggCode', sggCode.toString());
    searchParams.set('childSggCode', sggCode.toString());

    searchParams.set('combineRoName', ro);
    searchParams.set('kinderRoName', ro);
    searchParams.set('childRoName', ro);

    searchParams.set('listCntId', '');
    searchParams.set('ittId', ittld);
    searchParams.set('tabNum', tab);

    if (tab === '1') {
      // 1. 이름 검색
      organName = 'organName';
      searchParams.set(organName, sname);

      // 2. 설립 유형
      establishCB = 'establishCB';

      // 2.1. 국공립 선택.
      // 전체 탭에는 전체, 국공립, 사립만 선택할 수 있어
      // 국공립에 해당하는 유치원, 어린이집 설립 유형을 하나라도 선택하면 국공립 전체를 선택합니다.
      const isPublicEstablishTypeSelected =
        kinderEstablish.some((item) => PUBLIC_KINDER_ESTABLISH_TYPE.includes(item)) ||
        childEstablish.some((item) => PUBLIC_CHILD_ESTABLISH_TYPE.includes(item));

      if (isPublicEstablishTypeSelected) {
        PUBLIC_KINDER_ESTABLISH_TYPE.forEach((item) => {
          searchParams.append(establishCB, item);
        });
        PUBLIC_CHILD_ESTABLISH_TYPE.forEach((item) => {
          searchParams.append(establishCB, item);
        });
      }

      // 2.2. 사립 선택
      // 전체 탭에는 전체, 국공립, 사립만 선택할 수 있어
      // 사립에 해당하는 유치원, 어린이집 설립 유형을 하나라도 선택하면 사립 전체를 선택합니다.
      const isPrivateEstablishTypeSelected =
        kinderEstablish.some((item) => PRIVATE_KINDER_ESTABLISH_TYPE.includes(item)) ||
        childEstablish.some((item) => PRIVATE_CHILD_ESTABLISH_TYPE.includes(item));

      if (isPrivateEstablishTypeSelected) {
        PRIVATE_KINDER_ESTABLISH_TYPE.forEach((item) => {
          searchParams.append(establishCB, item);
        });
        PRIVATE_CHILD_ESTABLISH_TYPE.forEach((item) => {
          searchParams.append(establishCB, item);
        });
      }

      // 2.3. 유치원, 어린이집 설립 유형 전체 선택
      const establishCBs = searchParams.getAll(establishCB);
      const allEstablishTypes = [
        ...PUBLIC_KINDER_ESTABLISH_TYPE,
        ...PUBLIC_CHILD_ESTABLISH_TYPE,
        ...PRIVATE_KINDER_ESTABLISH_TYPE,
        ...PRIVATE_CHILD_ESTABLISH_TYPE,
      ];
      const isAllSelectedEstablishType =
        establishCBs.length === allEstablishTypes.length &&
        establishCBs.every((item) => allEstablishTypes.includes(item));

      if (isAllSelectedEstablishType) {
        searchParams.append(establishCB, 'on');
      }

      // 3. 유치원 휴·폐원 여부
      if (!isIncludeSuspension === true) {
        searchParams.append(statusCB, 'KDSP_YN');
      }
      if (!isIncludeClosure === true) {
        searchParams.append(statusCB, 'KDCL_YN');
      }
    }

    if (tab === '2') {
      // 1. 이름 검색
      organName = 'searchVal';
      searchParams.set(organName, sname); // 유치원, 어린이집 이름 검색어

      // 2. 설립 유형
      establishCB = 'kinderEstablishCB';

      kinderEstablish.forEach((item) => {
        searchParams.append(establishCB, item);
      });
      // 2.1. 유치원 국공립 전체 선택
      if (
        kinderEstablish.length === PUBLIC_KINDER_ESTABLISH_TYPE.length &&
        kinderEstablish.every((item) => PUBLIC_KINDER_ESTABLISH_TYPE.includes(item))
      ) {
        searchParams.append(establishCB, 'on');
      }
      // 2.2. 유치원 사립 전체 선택
      if (
        kinderEstablish.length === PRIVATE_KINDER_ESTABLISH_TYPE.length &&
        kinderEstablish.every((item) => PRIVATE_KINDER_ESTABLISH_TYPE.includes(item))
      ) {
        searchParams.append(establishCB, 'on');
      }
      // 2.3. 유치원 설립 유형 전체 선택
      if (kinderEstablish.length === [...PUBLIC_KINDER_ESTABLISH_TYPE, ...PRIVATE_KINDER_ESTABLISH_TYPE].length) {
        searchParams.append(establishCB, 'on');
      }

      // 3. 유치원 휴·폐원 여부
      statusCB = 'kinderStatusCB';

      if (isIncludeSuspension === true) {
        searchParams.append(statusCB, 'KDSP_YN');
      }
      if (isIncludeClosure === true) {
        searchParams.append(statusCB, 'KDCL_YN');
      }
    }

    if (tab === '3') {
      establishCB = 'childEstablishCB';
      statusCB = 'childStatusCB';

      if (childEstablish.length < 7) {
        childEstablish.forEach((item) => {
          searchParams.append(establishCB, item);
        });
      }
    }

    searchParams.set('pageIndex', page.toString());
    searchParams.set('pageCnt', pageSize.toString());

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: searchParams.toString(),
    });

    let htmlString = await response.text();

    // 안쓰는 부분 제거
    const $ = cheerio.load(htmlString);
    $('head > title').text('');
    $('link').remove();
    $('script').remove();
    $('img').remove();
    $('style').remove();
    $('meta').remove();
    $('#skipNaviGation').remove();
    $('#mobileSkipNaviGation').remove();
    $('#gnb').remove();
    $('#gnb_m').remove();
    $('#menus').remove();
    $('#pageTitle').remove();
    $('#subPageTitle').remove();
    $('.section').remove();
    $('#combineSearch').remove();
    $('#footer').remove();
    $('#message').remove();
    $('.tblInfo').remove();
    $('.footer').remove();
    $('.btns.iconBtn > a.homepage').remove();
    $('.btns.iconBtn > a.favorite').remove();
    $('input[name="arrIttId"]').remove();
    $('body > title').remove();
    $('li > label').remove();
    $('li h5 > .est.rested').remove();
    $('form').removeAttr('id');
    $('form').removeAttr('action');
    $('form').removeAttr('method');
    $('a').removeAttr('title');
    $('li h5 > .underline').removeAttr('href');
    $('li h5 > .underline').removeAttr('class');
    $('.info > span').removeClass('type1');

    htmlString = $.html()
      // 주석 제거
      .replace(/<!\-\-.+\-\->/g, '')
      // 빈 줄 제거
      .replace(/^\s*$\n/gm, '')
      // 들여쓰기 제거
      .replace(/^\s+/gm, '');

    return htmlString;
  } catch (error) {
    throw error;
  }
};

/**
 * 유치원알리미 사이트에서 유치원 목록을 파싱합니다.
 *
 * @param {string} htmlString 유치원알리미 사이트에서 유치원 목록을 가져온 HTML 문자열
 * @returns 유치원 목록
 */
export const parseChildSchoolInfo = (htmlString: string) => {
  try {
    const $ = cheerio.load(htmlString);

    const $resultArea = $('#resultArea');

    const $totalCount = $resultArea.find('.header > h4 > i');
    const totalCount = Number($totalCount.text().trim().replaceAll(',', ''));

    const $liEls = $resultArea.find('.lists > ul > li');
    const kindergartens = $liEls
      .map((_, liEl) => {
        const $liEl = $(liEl);
        if ($liEl.text().includes('조회결과가 존재하지 않습니다.')) {
          return null;
        }

        const $info = $liEl.find('div.info');
        const sname = $info.find('h5 > a').text();

        const stypeText = $info.find('span.org').text();

        // 어린이집의 구분이 02로 학교알리미의 초등학교(02)와 겹치기 때문에 00으로 변경.
        const stype =
          stypeText === '유' ? SCHOOL_TYPE_NAME_TO_CODE_MAP['유치원'] : SCHOOL_TYPE_NAME_TO_CODE_MAP['어린이집'];
        const establishTypeText = $info.find('h5 > span.type1').text();
        let establishType;
        if (stype === SCHOOL_TYPE_NAME_TO_CODE_MAP['유치원']) {
          establishType = Object.keys(KINDER_ESTABLISH_TYPE).find((key) => {
            const type = KINDER_ESTABLISH_TYPE[key as keyof typeof KINDER_ESTABLISH_TYPE];
            return type.includes(establishTypeText);
          });
        } else if (stype === SCHOOL_TYPE_NAME_TO_CODE_MAP['어린이집']) {
          establishType = Object.keys(CHILD_ESTABLISH_TYPE).find((key) => {
            const type = CHILD_ESTABLISH_TYPE[key as keyof typeof CHILD_ESTABLISH_TYPE];
            return type.includes(establishTypeText);
          });
        }

        const isSuspension = $info.find('h5 > span#rested2').text().trim() === '휴원';
        const isClosure = $info.find('h5 > span#closed5').text().trim() === '폐원';

        const [established, phone, address] = $info.find('p > span').map((_, spanEl) => {
          const $spanEl = $(spanEl);
          return $spanEl.text();
        });
        const establishedDate = established.match(/(\d{4}\-\d{2}\-\d{2})/)?.[0];
        const [sidoName, sggName, ro] = address.split(' ');

        const previewHref = $liEl.find('.btns.iconBtn > a.preview').attr('href');
        if (!previewHref) return null;

        const [, scode, kinderCode] = previewHref
          .matchAll(/'([^']+)'/g)
          .toArray()
          .map((m) => m[1]);

        return {
          sname,
          scode,
          stype,
          kinderCode,
          established: establishedDate,
          establishType,
          phone,
          address,
          sidoName,
          sggName,
          ro,
          isSuspension,
          isClosure,
        };
      })
      .toArray()
      .filter((kindergarten) => {
        return kindergarten;
      });

    return {
      items: kindergartens,
      pagination: {
        total: totalCount,
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * 유치원알리미 사이트에서 유치원 목록을 모두 가져와 캐시에 저장합니다.
 *
 * @returns 유치원 목록
 */
export const createKindergartensCache = async () => {
  const today = new Date();
  const time = today.getTime();
  const fileName = path.join('kindergartens', `kindergartens_${time}.json`);

  // 유치원이 약 8,500개 정도 있어 페이지 사이즈를 10,000개로 설정하여
  // 한 페이지에 모든 유치원을 가져온다.
  const page = 1;
  const pageSize = 10000;

  try {
    const htmlString = await crawlChildSchoolInfo({
      sidoCode: 99,
      sggCode: 99,
      ro: '99',
      sname: '',
      tab: '2',
      kinderEstablish: [],
      childEstablish: [],
      isIncludeSuspension: false,
      isIncludeClosure: false,
      ittld: '',
      page,
      pageSize,
    });

    const { items } = parseChildSchoolInfo(htmlString);

    const generator = async function* () {
      for (let i = 0; i < items.length; i++) {
        yield items[i];
      }
    };
    await createLargeJsonCacheFile(fileName, generator());
  } catch (error) {
    console.error('[services][childschoolinfo][createKindergartensCache]: ', error);
    throw error;
  }
};

/**
 * 캐시 폴더에서 가장 최신 유치원 캐시 파일 경로를 반환합니다.
 *
 * @returns 가장 최신 캐시 파일 경로
 */
const getLatestCacheFilePath = async () => {
  const cacheDir = await createCacheDir('kindergartens');
  const cacheFiles = await fs.promises.readdir(cacheDir);
  if (cacheFiles.length === 0) {
    return undefined;
  }
  const latestCacheFile = cacheFiles.sort((a, b) => {
    const aTimestamp = path.basename(a, '.json').split('_')[1];
    const bTimestamp = path.basename(b, '.json').split('_')[1];
    return Number(bTimestamp) - Number(aTimestamp);
  })[0];
  return path.join(cacheDir, latestCacheFile);
};

/**
 * 유치원 캐시 파일을 생성하고 가장 최신 캐시 파일 경로를 반환합니다.
 *
 * @returns 가장 최신 캐시 파일 경로
 */
const createCacheAndGetPath = async () => {
  await createKindergartensCache();
  const latestCacheFilePath = await getLatestCacheFilePath();
  if (!latestCacheFilePath) {
    throw new Error('캐시 파일을 생성하는데 실패했습니다.');
  }
  return latestCacheFilePath;
};

/**
 * 유치원 목록을 가져옵니다.
 *
 * @param {SchoolSearch} params 검색 조건
 * @returns 유치원 목록
 */
export const getKindergartens = async ({
  areaKos = [],
  stypes = ['00', '01'],
  snames = [],
  page = 1,
  pageSize = 10,
}: SchoolSearch) => {
  try {
    // 1. 캐시 폴더 읽기 _/cache/kindergartens
    // 2. 캐시 폴더에서 가장 최신 캐시 파일 확인
    let latestCacheFilePath = await getLatestCacheFilePath();

    if (!latestCacheFilePath) {
      console.log('캐시 파일이 없습니다. 캐시 파일을 생성합니다.');
      latestCacheFilePath = await createCacheAndGetPath();
    }

    // 3. 가장 최신 캐시 파일이 현재 시간보다 1일 이상 지났으면 캐시 파일 생성
    const cacheTimestamp = Number(path.basename(latestCacheFilePath, '.json').split('_')[1]);
    if (cacheTimestamp < Date.now() - CACHE_TTL) {
      console.log('캐시 파일이 1일 이상 지났습니다. 캐시 파일을 생성합니다.');
      latestCacheFilePath = await createCacheAndGetPath();
      console.log('캐시 파일을 생성했습니다. 경로: ', latestCacheFilePath);
    }

    // 4. 캐시 파일 읽으면서 검색 필터링 (페이지네이션 제외)
    let filteredItems: ChildSchoolInfo[] = [];
    const readStream = fs.createReadStream(latestCacheFilePath, { encoding: 'utf-8' });

    // 검색 조건 필터 스트림
    const filterTransform = new Transform({
      objectMode: true,
      transform(chunk, _, callback) {
        const item = chunk.value;

        // 조건 검사
        const isIncludedAreaKos = areaKos.length === 0 || areaKos.some((areaKos) => item.address.includes(areaKos));
        const isIncludedSTypes = stypes.length === 0 || stypes.some((stype) => ['00', '01'].includes(stype));
        const isIncludedSNames = snames.length === 0 || snames.some((sname) => item.sname.includes(sname));

        // 검색 조건에 맞는 아이템은 다음으로 넘김.
        if (isIncludedAreaKos && isIncludedSTypes && isIncludedSNames) {
          callback(null, item);
          return;
        }

        // 검색 조건에 맞지 않는 아이템은 거름.
        callback(null, undefined);
        return;
      },
    });

    return new Promise(async (resolve, reject) => {
      const pipeline = readStream.pipe(parser()).pipe(streamArray()).pipe(filterTransform);

      pipeline.on('data', (item) => {
        if (filteredItems) {
          filteredItems.push(item);
        }
      });

      pipeline.on('end', () => {
        // 5. 페이지네이션. (총 아이템 수, 총 페이지 수 구하기)
        const { total, totalPage, startIndex, endIndex } = getPagination(filteredItems.length, page, pageSize);
        // 6. 응답할 페이지만큼 자르기
        filteredItems = filteredItems.slice(startIndex, endIndex);
        // 7. 응답.
        resolve({
          items: filteredItems satisfies ChildSchoolInfo[],
          pagination: {
            total,
            totalPage: Math.max(totalPage, 1),
            page,
            pageSize,
          } satisfies Pagination,
        } satisfies BaseResult);
      });

      pipeline.on('error', (error) => reject(error));
    });
  } catch (error) {
    console.error('[services][childschoolinfo][getKindergartens]: ', error);
    throw error;
  }
};

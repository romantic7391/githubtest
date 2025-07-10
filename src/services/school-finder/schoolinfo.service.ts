import 'dotenv/config';
import { SCHOOL_TYPE, SCHOOL_TYPE_NAME_TO_CODE_MAP } from '@/lib/school-info.constant';
import type { BaseResult, SchoolSearch, SchoolType } from '@/types/school-finder/school';
import { SchoolInfo, SchoolInfoRaw, schoolInfoRawSchema } from '@/types/school-finder/schoolinfo';
import { getPagination } from '@/lib/util/common.util';
import path from 'path';
import fs from 'fs';
import { CACHE_TTL, createCacheDir, createLargeJsonCacheFile } from '@/lib/util/cache.util';
import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { Transform } from 'stream';
import { Pagination } from '@/types/school-finder/common';

export class SchoolInfoApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchoolInfoApiError';
  }
}

const copySchoolInfo = (source: SchoolInfoRaw, target: SchoolInfoRaw, keys: (keyof SchoolInfoRaw)[] = []) => {
  const copyKeys = keys.length > 0 ? keys : (Object.keys(source) as (keyof SchoolInfoRaw)[]);
  for (const key of copyKeys) {
    (target as Record<keyof SchoolInfoRaw, SchoolInfoRaw[keyof SchoolInfoRaw]>)[key] = source[key];
  }

  return target;
};

export const getSchoolsFromSchoolInfoApi = async (stypes: SchoolType[]) => {
  try {
    const filteredSTypes = stypes.filter((stype) => {
      return (
        [SCHOOL_TYPE_NAME_TO_CODE_MAP['어린이집'] as string, SCHOOL_TYPE_NAME_TO_CODE_MAP['유치원'] as string].includes(
          stype,
        ) === false
      );
    });
    const promises = filteredSTypes.map((stype) => getSchoolsBySTypeFromSchoolInfoApi(stype));
    const promiseResults = await Promise.all(promises);
    const schools = promiseResults.flat().map((school, _, arr) => {
      // 같은 위치의 학교인데 세계로국제중고등학교(중)에 일부 내용이 누락된 것을 보완.
      if (school.SCHUL_NM === '세계로국제중고등학교(중)') {
        const source = arr.find((s) => s.SCHUL_NM === '세계로국제중고등학교');
        if (source) {
          return copySchoolInfo(source, school, [
            'ADRCD_CD',
            'ADRCD_ID',
            'ADRCD_NM',
            'ADRES_BRKDN',
            'LGTUD',
            'LTTUD',
            'PERC_FAXNO',
            'USER_TELNO_GA',
            'USER_TELNO_SW',
          ]);
        }
      }

      return school;
    });

    return schools as SchoolInfoRaw[];
  } catch (error) {
    throw error;
  }
};

/**
 * 전체 학교 목록을 캐시 파일로 생성합니다.
 */
export const createSchoolInfoCache = async () => {
  try {
    const today = new Date();
    const time = today.getTime();
    const fileName = path.join('schoolinfo', `schoolinfo_${time}.json`);

    const schools = await getSchoolsFromSchoolInfoApi(SCHOOL_TYPE);

    const generator = async function* () {
      for (let i = 0; i < schools.length; i++) {
        yield parseSchoolInfo(schools[i]);
      }
    };
    await createLargeJsonCacheFile(fileName, generator());
  } catch (error) {
    console.error('[services][schoolinfo][createSchoolInfoCache]: ', error);
    throw error;
  }
};

/**
 * 캐시 폴더에서 가장 최신 학교 캐시 파일 경로를 반환합니다.
 *
 * @returns 가장 최신 학교 캐시 파일 경로
 */
const getLatestCacheFilePath = async () => {
  const cacheDir = await createCacheDir('schoolinfo');
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
 * 학교 캐시 파일을 생성하고 가장 최신 캐시 파일 경로를 반환합니다.
 *
 * @returns 가장 최신 캐시 파일 경로
 */
const createCacheAndGetPath = async () => {
  await createSchoolInfoCache();
  const latestCacheFilePath = await getLatestCacheFilePath();
  if (!latestCacheFilePath) {
    throw new Error('캐시 파일을 생성하는데 실패했습니다.');
  }
  return latestCacheFilePath;
};

const getSchoolsBySTypeFromSchoolInfoApi = async (stype: SchoolType) => {
  try {
    // TODO: 캐시 파일이 존재하는 지 확인.
    // TODO: 1. _/cache/schoolinfo/{YYYY}/{MM}/{DD}/{stype}/{stype}_{YYYYMMDD}.json 파일 조회.
    // TODO: 1.1. YYYYMMDD 기준은 요청 시점보다 7일 전에서 요청 시점까지를 찾는다.
    // TODO: 2. 캐시 파일이 존재하면 캐시 파일의 데이터를 반환.
    // TODO: 3. 캐시 파일이 없으면 코드를 계속 진행하여 학교알리미 API에 요청하여 데이터를 받아온다.

    const apiKey = process.env.SCHOOLINFO_API_KEY;
    if (typeof apiKey !== 'string') {
      throw new Error('학교알리미 API의 인증키가 없습니다.');
    }

    const requestUrl = new URL('http://www.schoolinfo.go.kr/openApi.do');
    requestUrl.searchParams.set('apiKey', apiKey as string);
    requestUrl.searchParams.set('apiType', '0');
    requestUrl.searchParams.set('schulKndCode', stype);

    const response = await fetch(requestUrl, { method: 'GET' });
    const { resultCode, resultMsg, list } = await response.json();

    if (resultCode !== 'success') {
      throw new SchoolInfoApiError(resultMsg);
    }

    const schools = schoolInfoRawSchema.array().parse(list) as SchoolInfoRaw[];

    // TODO: 결과를 _/cache/schoolinfo/{YYYY}/{MM}/{DD}/{stype}/{stype}_{YYYYMMDD}.json 파일에 저장.

    return schools;
  } catch (error) {
    throw error;
  }
};

const getDate = (date?: string) => {
  if (!date) return undefined;
  return date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
};

const getSCode = (JU_ORG_CODE: SchoolInfoRaw['JU_ORG_CODE'], SCHUL_CODE: SchoolInfoRaw['SCHUL_CODE']) => {
  return `${JU_ORG_CODE.slice(0, 3)}${SCHUL_CODE.slice(3)}`;
};

const getAddress = (school: SchoolInfoRaw) => {
  const { ADRES_BRKDN, DTLAD_BRKDN } = school; // 지번 주소
  const { SCHUL_RDNMA, SCHUL_RDNDA } = school; // 도로명 주소

  // 도로명 주소
  if (SCHUL_RDNMA && SCHUL_RDNDA) {
    return `${SCHUL_RDNMA.trim()} ${SCHUL_RDNDA.trim()}`;
  }

  // 도로명 주소가 없으면 지번 주소 사용 (e.g. 폐교)
  if (ADRES_BRKDN && DTLAD_BRKDN) {
    return `${ADRES_BRKDN.trim()} ${DTLAD_BRKDN.trim()}`;
  }

  return '';
};

export const parseSchoolInfo = (school: SchoolInfoRaw) => {
  try {
    const scode = getSCode(school.JU_ORG_CODE, school.SCHUL_CODE);
    const established = getDate(school.FOND_YMD);
    const closureDate = getDate(school.ABSCH_YMD);
    const isClosure = school.ABSCH_YN === 'Y';
    const isSuspension = school.CLOSE_YN === 'Y';

    return {
      sname: school.SCHUL_NM,
      scode,
      stype: school.SCHUL_KND_SC_CODE,
      established,
      establishType: school.SCHUL_FOND_TYP_CODE,
      phone: school.USER_TELNO,
      address: getAddress(school),
      zipCode: school.SCHUL_RDNZC ?? school.ZIP_CODE,
      isClosure,
      closureDate,
      isSuspension,
      coordinate: {
        type: 'WGS84',
        latitude: school.LTTUD,
        longitude: school.LGTUD,
      },
      // raw: school,
    } satisfies SchoolInfo;
  } catch (error) {
    throw error;
  }
};

export const getSchoolInfos = async ({
  areaKos = [],
  stypes = [],
  snames = [],
  page = 1,
  pageSize = 10,
}: SchoolSearch) => {
  try {
    let latestCacheFilePath = await getLatestCacheFilePath();

    if (!latestCacheFilePath) {
      console.log('캐시 파일이 없습니다. 캐시 파일을 생성합니다.');
      latestCacheFilePath = await createCacheAndGetPath();
    }

    const cacheTimestamp = Number(path.basename(latestCacheFilePath, '.json').split('_')[1]);
    if (cacheTimestamp < Date.now() - CACHE_TTL) {
      console.log('캐시 파일의 유효기간이 지났습니다. 캐시 파일을 생성합니다.');
      latestCacheFilePath = await createCacheAndGetPath();
      console.log('캐시 파일을 생성했습니다.');
    }

    let filteredSchools: SchoolInfo[] = [];
    const readStream = fs.createReadStream(latestCacheFilePath, { encoding: 'utf-8' });

    // 1. 캐시 파일 읽으면서 검색 필터링 (페이지네이션 제외)
    const filterTransform = new Transform({
      objectMode: true,
      transform(chunk, _, callback) {
        const item = chunk.value;

        // 조건 검사
        const isIncludedAreaKos = areaKos.length === 0 || areaKos.some((areaKos) => item.address.includes(areaKos));
        const isIncludedSTypes = stypes.length === 0 || stypes.some((stype) => item.stype.includes(stype));
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

    // 2. 파이프라인 생성
    return new Promise(async (resolve, reject) => {
      const pipeline = readStream.pipe(parser()).pipe(streamArray()).pipe(filterTransform);

      // 3. 파이프라인 실행
      pipeline.on('data', (item) => {
        if (filteredSchools) {
          filteredSchools.push(item);
        }
      });

      // 4. 파이프라인 종료
      pipeline.on('end', () => {
        // 5. 페이지네이션. (총 아이템 수, 총 페이지 수 구하기)
        const { total, totalPage, startIndex, endIndex } = getPagination(filteredSchools.length, page, pageSize);
        // 6. 응답할 페이지만큼 자르기
        filteredSchools = filteredSchools.slice(startIndex, endIndex);
        // 7. 응답.
        resolve({
          items: filteredSchools satisfies SchoolInfo[],
          pagination: {
            total,
            totalPage: Math.max(totalPage, 1),
            page,
            pageSize,
          } satisfies Pagination,
        } satisfies BaseResult);
      });

      pipeline.on('error', (error) => {
        reject(error);
      });
    });
  } catch (error) {
    throw error;
  }
};

import type { SchoolApiResponse } from '@/types/nies';
import { getRow } from '@/lib/mariadb/query';

// NEIS API 기본 URL
export const NEIS_API_URL = 'https://open.neis.go.kr/hub/schoolInfo';

// ===== 메인 검색 함수 =====

/**
 * 학교명과 지역명을 기반으로 학교를 검색하는 메인 함수
 * @param schoolName 학교명
 * @param areaInput 지역명
 * @returns 학교 목록 (중복 여부 포함)
 */
export async function fetchSchoolListByNameOrArea(schoolName?: string | null, areaInput?: string | null) {
  const matchedAreas = areaInput ? findAreaNamesByPartial(areaInput) : [];

  // 1. 학교명과 지역명 모두 있을 때: 각 지역별로 학교명 검색 후 합침
  if (schoolName && matchedAreas.length > 0) {
    const results = await Promise.all(matchedAreas.map((area) => fetchSchoolListByName(schoolName, area)));
    return results.flat();
  }
  // 2. 학교명만 있을 때: 전국에서 학교명 검색
  if (schoolName && !areaInput) {
    return fetchSchoolListByName(schoolName);
  }
  // 3. 지역명만 있을 때: 각 지역별로 전체 학교 검색 후 합침
  if (!schoolName && matchedAreas.length > 0) {
    const results = await Promise.all(matchedAreas.map((area) => fetchSchoolListByName('', area)));
    return results.flat();
  }
  // 4. 둘 다 없으면 전체 학교 (주의: 데이터 많음)
  return fetchSchoolList();
}

// ===== 상수 정의 =====

// 한글 지역명 → 영문 지역명 매핑 테이블
export const AREA_KR_TO_EN: Record<string, string> = {
  서울특별시: 'seoul',
  부산광역시: 'busan',
  대구광역시: 'daegu',
  인천광역시: 'incheon',
  광주광역시: 'gwangju',
  대전광역시: 'daejeon',
  울산광역시: 'ulsan',
  세종특별자치시: 'sejong',
  경기도: 'gyeonggi',
  강원도: 'gangwon',
  충청북도: 'chungbuk',
  충청남도: 'chungnam',
  전라북도: 'jeonbuk',
  전라남도: 'jeonnam',
  경상북도: 'gyeongbuk',
  경상남도: 'gyeongnam',
  제주특별자치도: 'jeju',
};

// 시도 전체 명칭 리스트 (공통 상수)
export const AREA_FULL_NAMES = [
  '서울특별시',
  '부산광역시',
  '대구광역시',
  '인천광역시',
  '광주광역시',
  '대전광역시',
  '울산광역시',
  '세종특별자치시',
  '경기도',
  '강원도',
  '충청북도',
  '충청남도',
  '전라북도',
  '전라남도',
  '경상북도',
  '경상남도',
  '제주특별자치도',
];

// ===== 유틸리티 함수 =====

/**
 * 입력된 지역명과 부분적으로 일치하는 시도명을 찾는 함수
 * @param input 검색할 지역명
 * @returns 일치하는 시도명 배열
 */
export function findAreaNamesByPartial(input: string | null): string[] {
  if (!input) return [];
  return AREA_FULL_NAMES.filter((full) => full.includes(input));
}

/**
 * 행정표준코드로 학교 존재 여부를 확인하는 함수
 * @param administrationcode 행정표준코드
 * @returns 존재 여부 (boolean)
 */
export async function existsRnSchoolByAdministrationCode(administrationcode: string): Promise<boolean> {
  const query = `SELECT 1 FROM rnschool WHERE administrationcode = ? LIMIT 1`;
  const row = await getRow(query, [administrationcode]);
  return !!row;
}

// ===== NEIS API 호출 함수 =====

/**
 * NEIS API를 호출하여 학교명과 지역명으로 학교를 검색하는 함수
 * @param schoolName 학교명
 * @param area 지역명
 * @returns 학교 목록 (중복 여부 포함)
 */
export async function fetchSchoolListByName(schoolName: string, area?: string) {
  let url = `${NEIS_API_URL}?KEY=${process.env.NEIS_API_KEY}&Type=json&SCHUL_NM=${encodeURIComponent(schoolName)}&pIndex=1&pSize=100`;
  if (area) {
    url += `&LCTN_SC_NM=${encodeURIComponent(area)}`;
  }

  const response = await fetch(url);
  const data = await response.json();
  if (!data.schoolInfo || !data.schoolInfo[1]?.row) return [];
  const schools = data.schoolInfo[1].row;

  return await Promise.all(
    schools.map(async (school: SchoolApiResponse) => {
      const administrationcode = school.SD_SCHUL_CODE;
      const isDup = await existsRnSchoolByAdministrationCode(administrationcode);

      const {
        ORG_RDNZC,
        ORG_RDNMA,
        ORG_RDNDA,
        ORG_TELNO,
        HMPG_ADRES,
        COEDU_SC_NM,
        ORG_FAXNO,
        HS_SC_NM,
        INDST_SPECL_CCCCL_EXST_YN,
        HS_GNRL_BUSNS_SC_NM,
        SPCLY_PURPS_HS_ORD_NM,
        ENE_BFE_SEHF_SC_NM,
        DGHT_SC_NM,
        FOND_YMD,
        FOAS_MEMRD,
        LOAD_DTM,
        ATPT_OFCDC_SC_NM,
        SCHUL_KND_SC_NM,
        FOND_SC_NM,
        JU_ORG_NM,
        ENG_SCHUL_NM,
      } = school;

      return {
        is_duplicated: isDup ? 'Y' : 'N',
        administrationcode: school.SD_SCHUL_CODE,
        area: school.LCTN_SC_NM,
        sname: school.SCHUL_NM,
        scode: school.ATPT_OFCDC_SC_CODE,
        ATPT_OFCDC_SC_NM, // 교육청명
        SCHUL_KND_SC_NM, // 학교종류
        FOND_SC_NM, // 설립구분
        JU_ORG_NM, // 관할교육청
        ENG_SCHUL_NM, // 영문명
        ORG_RDNZC,
        ORG_RDNMA,
        ORG_RDNDA,
        ORG_TELNO,
        HMPG_ADRES,
        COEDU_SC_NM,
        ORG_FAXNO,
        HS_SC_NM,
        INDST_SPECL_CCCCL_EXST_YN,
        HS_GNRL_BUSNS_SC_NM,
        SPCLY_PURPS_HS_ORD_NM,
        ENE_BFE_SEHF_SC_NM,
        DGHT_SC_NM,
        FOND_YMD,
        FOAS_MEMRD,
        LOAD_DTM,
      };
    }),
  );
}

/**
 * NEIS API를 호출하여 전체 학교 목록을 페이지네이션으로 조회하는 함수
 * @param page 페이지 번호
 * @param size 페이지당 항목 수
 * @returns 학교 목록 (중복 여부 포함)
 */
export async function fetchSchoolList(page = 1, size = 1000) {
  const url = `${NEIS_API_URL}?KEY=${process.env.NEIS_API_KEY}&Type=json&pIndex=${page}&pSize=${size}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!data.schoolInfo || !data.schoolInfo[1]?.row) return [];
  const schools = data.schoolInfo[1].row;

  return await Promise.all(
    schools.map(async (school: SchoolApiResponse) => {
      const administrationcode = school.SD_SCHUL_CODE;
      const isDup = await existsRnSchoolByAdministrationCode(administrationcode);

      const {
        ORG_RDNZC,
        ORG_RDNMA,
        ORG_RDNDA,
        ORG_TELNO,
        HMPG_ADRES,
        COEDU_SC_NM,
        ORG_FAXNO,
        HS_SC_NM,
        INDST_SPECL_CCCCL_EXST_YN,
        HS_GNRL_BUSNS_SC_NM,
        SPCLY_PURPS_HS_ORD_NM,
        ENE_BFE_SEHF_SC_NM,
        DGHT_SC_NM,
        FOND_YMD,
        FOAS_MEMRD,
        LOAD_DTM,
        ATPT_OFCDC_SC_NM,
        SCHUL_KND_SC_NM,
        FOND_SC_NM,
        JU_ORG_NM,
        ENG_SCHUL_NM,
      } = school;

      return {
        is_duplicated: isDup ? 'Y' : 'N',
        administrationcode: school.SD_SCHUL_CODE,
        area: school.LCTN_SC_NM,
        sname: school.SCHUL_NM,
        scode: school.ATPT_OFCDC_SC_CODE,
        ATPT_OFCDC_SC_NM, // 교육청명
        SCHUL_KND_SC_NM, // 학교종류
        FOND_SC_NM, // 설립구분
        JU_ORG_NM, // 관할교육청
        ENG_SCHUL_NM, // 영문명
        ORG_RDNZC,
        ORG_RDNMA,
        ORG_RDNDA,
        ORG_TELNO,
        HMPG_ADRES,
        COEDU_SC_NM,
        ORG_FAXNO,
        HS_SC_NM,
        INDST_SPECL_CCCCL_EXST_YN,
        HS_GNRL_BUSNS_SC_NM,
        SPCLY_PURPS_HS_ORD_NM,
        ENE_BFE_SEHF_SC_NM,
        DGHT_SC_NM,
        FOND_YMD,
        FOAS_MEMRD,
        LOAD_DTM,
      };
    }),
  );
}

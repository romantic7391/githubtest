import type { SchoolApiResponse } from '@/types/nies';

// import { findRnSchoolByScode } from '@/air.models/rn-school/rn-school.model'; // 실제 구현 필요

export const NEIS_API_URL = 'https://open.neis.go.kr/hub/schoolInfo';

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

// 부분 포함(Like) 검색 함수
export function findAreaNamesByPartial(input: string | null): string[] {
  if (!input) return [];
  return AREA_FULL_NAMES.filter((full) => full.includes(input));
}

export async function fetchSchoolList(page = 1, size = 1000) {
  const url = `${NEIS_API_URL}?KEY=${process.env.NEIS_API_KEY}&Type=json&pIndex=${page}&pSize=${size}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!data.schoolInfo || !data.schoolInfo[1]?.row) return [];
  const schools = data.schoolInfo[1].row;
  // DB 중복 체크 후 is_duplicated 추가 (administrationcode 기준)
  const schoolsWithDup = await Promise.all(
    schools.map(async (school: SchoolApiResponse) => {
      const administrationcode = school.SD_SCHUL_CODE;
      const isDup = await existsRnSchoolByAdministrationCode(administrationcode);

      // 필요한 부가 정보만 추출 (예시: 주소, 전화번호 등)
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
        // 부가 정보는 그대로
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
  return schoolsWithDup;
}

// export function mapNeisToRnSchool(row: any): Partial<insertRnSchoolDto> {
//   return {
//     sname: row.SCHUL_NM as string,
//     scode: undefined,
//     // 한글 → 영문 변환
//     area: AREA_KR_TO_EN[row.LCTN_SC_NM as string] ?? 'unknown',
//     administrationcode: row.SD_SCHUL_CODE as string,
//     modbus: undefined,
//     modbus_host: undefined,
//     modbus_port: undefined,
//     use_os: undefined,
//     parent_id: undefined,
//   };
// }

// 학교명과 지역(한글)으로 나이스에서 검색 (여러 학교 반환)
export async function fetchSchoolListByName(schoolName: string, area?: string) {
  let url = `${NEIS_API_URL}?KEY=${process.env.NEIS_API_KEY}&Type=json&SCHUL_NM=${encodeURIComponent(schoolName)}&pIndex=1&pSize=100`;
  if (area) {
    url += `&LCTN_SC_NM=${encodeURIComponent(area)}`;
  }
  console.log('나이스 호출 URL:', url);
  const response = await fetch(url);
  const data = await response.json();
  console.log('나이스 응답:', data);

  if (!data.schoolInfo || !data.schoolInfo[1]?.row) return [];
  const schools = data.schoolInfo[1].row;
  // DB 중복 체크 후 is_duplicated 추가 (administrationcode 기준)
  const schoolsWithDup = await Promise.all(
    schools.map(async (school: SchoolApiResponse) => {
      const administrationcode = school.SD_SCHUL_CODE;
      const isDup = await existsRnSchoolByAdministrationCode(administrationcode);

      // 필요한 부가 정보만 추출 (예시: 주소, 전화번호 등)
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
        // 부가 정보는 그대로
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
  return schoolsWithDup;
}

// 행정표준코드로 존재 여부 확인 (중복 체크)
import { getRow } from '@/lib/mariadb/query';
export async function existsRnSchoolByAdministrationCode(administrationcode: string): Promise<boolean> {
  const query = `SELECT 1 FROM rnschool WHERE administrationcode = ? LIMIT 1`;
  const row = await getRow(query, [administrationcode]);
  return !!row;
}

// 학교명, 지역명 둘 중 하나만 있어도 검색 가능 (OR 조건)
export async function fetchSchoolListByNameOrArea(schoolName?: string | null, areaInput?: string | null) {
  // 지역명 부분 일치로 여러 시도명 매칭
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

// // 학교 등록: 행정표준코드로 중복 체크 후 등록
// export async function createRnSchoolFromNeisByAdministrationCode(administrationcode: string, userInput: Partial<insertRnSchoolDto>) {
//   // 1. DB에서 행정표준코드로 중복 체크
//   const exists = await existsRnSchoolByAdministrationCode(administrationcode);
//   if (exists) throw new Error('이미 등록된 학교입니다.');

//   // 2. 나이스에서 정보 조회 (행정표준코드로)
//   const url = `${NEIS_API_URL}?KEY=${process.env.NEIS_API_KEY}&Type=json&SD_SCHUL_CODE=${encodeURIComponent(administrationcode)}&pIndex=1&pSize=1`;
//   const response = await fetch(url);
//   const data = await response.json();
//   const row = data.schoolInfo?.[1]?.row?.[0];
//   if (!row) throw new Error('나이스에서 학교 정보를 찾을 수 없습니다.');

//   // 3. 나이스 정보 + 유저 입력값 합치기
//   const neisDto = mapNeisToRnSchool(row);
//   const dto: Omit<insertRnSchoolDto, 'school_no'> = {
//     sname: neisDto.sname as string,
//     scode: '',
//     area: neisDto.area as string,
//     administrationcode: neisDto.administrationcode as string,
//     modbus: userInput.modbus ?? 0,
//     modbus_host: userInput.modbus_host ?? undefined,
//     modbus_port: userInput.modbus_port ?? undefined,
//     use_os: userInput.use_os ?? 'N',
//     parent_id: userInput.parent_id ?? undefined,
//   };

//   // 4. DB에 insert
//   await insertRnSchool(dto as insertRnSchoolDto);
//   return { type: 'insert', school: dto };
// }

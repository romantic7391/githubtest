import { findRnSchoolsByAreas } from '@/models/rn-school/rn-school.model';
import { School } from '@/types/school';

export async function getSchoolsByArea(area: string): Promise<School[]> {
  const schools = await findRnSchoolsByAreas(area);
  return schools;
}

export async function getSchoolHierarchy(
  area: string,
  targetSchoolNo: number,
): Promise<{
  current: School;
  upper?: School;
  upperUpper?: School;
  lower?: School[];
}> {
  // 1. 지역의 모든 학교 조회
  const schools = await getSchoolsByArea(area);

  // 2. 대상 학교 찾기
  const targetSchool = schools.find((s) => s.schoolNo === targetSchoolNo);
  if (!targetSchool) {
    throw new Error('School not found');
  }

  // 3. 학교 유형에 따라 계층 구조 반환
  const schoolType = targetSchool.schoolType;
  switch (schoolType) {
    case 'st_001': // 시도교육청
      return {
        current: targetSchool,
        lower: schools.filter((s) => s.parentNo === targetSchool.schoolNo),
      };

    case 'st_002': // 교육청
      return {
        current: targetSchool,
        upper: schools.find((s) => s.schoolNo === targetSchool.parentNo),
        lower: schools.filter((s) => s.parentNo === targetSchool.schoolNo),
      };

    case 'st_003': // 학교
      const upperSchool = schools.find((s) => s.schoolNo === targetSchool.parentNo);
      return {
        current: targetSchool,
        upper: upperSchool,
        upperUpper: upperSchool ? schools.find((s) => s.schoolNo === upperSchool.parentNo) : undefined,
      };

    default:
      throw new Error('Invalid school type');
  }
}

import { findRnSchoolsByAreas } from '@/models/rn-school/rn-school.model';
import { School } from '@/types/school';

export async function getSchoolsByArea(area: string): Promise<School[]> {
  // findRnSchoolsByAreas 모델이 이미 지역으로 필터링을 하고 있음
  return findRnSchoolsByAreas(area);
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
  // 0번 학교는 계층 구조가 없음
  if (targetSchoolNo === 0) {
    return {
      current: {
        schoolNo: 0,
        sname: '사랑',
        schoolType: 'st_000',
        parentNo: null,
        area: 'daegu',
      } as School,
    };
  }

  // 1. 해당 지역의 학교만 조회
  const schools = await getSchoolsByArea(area);

  // 2. 대상 학교 찾기
  const targetSchool = schools.find((s) => s.schoolNo === targetSchoolNo);
  if (!targetSchool) {
    console.log('학교를 찾을 수 없음:', { area, targetSchoolNo, schools });
    throw new Error(`학교를 찾을 수 없습니다. (학교번호: ${targetSchoolNo}, 지역: ${area})`);
  }

  // 3. 계층 구조는 parentNo로 파악
  const upperSchool = targetSchool.parentNo ? schools.find((s) => s.schoolNo === targetSchool.parentNo) : undefined;
  return {
    current: targetSchool,
    upper: upperSchool,
    upperUpper: upperSchool?.parentNo ? schools.find((s) => s.schoolNo === upperSchool.parentNo) : undefined,
    lower: schools.filter((s) => s.parentNo === targetSchool.schoolNo),
  };
}

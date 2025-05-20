import { findRnSchoolsByArea } from '@/models/rn-school/rn-school.model';
import { paginationSchema } from '@/types/common';
import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';

// 지역의 학교 목록
export async function getRnSchoolsByArea(
  area: string,
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
  filters?: {
    sname?: string;
    scode?: string;
    useOrderSheet?: 'Y' | 'N';
    active?: 'Y' | 'N';
    administrationCode?: string;
  },
) {
  try {
    // 페이지네이션 파라미터 검증
    const validatedPagination = paginationSchema.pick({ page: true, pageSize: true }).parse({
      page,
      pageSize,
    });

    return await findRnSchoolsByArea(area, validatedPagination.page, validatedPagination.pageSize, filters);
  } catch (error) {
    console.error('[getRnSchoolsByAreaService] 파라미터 검증 또는 DB 조회 에러:', error);
    throw new Error('학교 목록 조회 중 오류가 발생했습니다.');
  }
}

import { findRnSchoolsByArea } from '@/models/rn-school/rn-school.model';
import { paginationSchema } from '@/types/common';
import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';

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
  meta?: { manager_no: number; ip: string | null; user_agent: string | null },
) {
  let conn;
  try {
    conn = await beginTransaction();
    // 페이지네이션 파라미터 검증
    const validatedPagination = paginationSchema.pick({ page: true, pageSize: true }).parse({
      page,
      pageSize,
    });

    const result = await findRnSchoolsByArea(area, validatedPagination.page, validatedPagination.pageSize, filters);

    // 로그 기록
    if (meta) {
      await logAction(
        makeLogParams({
          manager_no: meta.manager_no,
          school_no: 0,
          ip: meta.ip,
          user_agent: meta.user_agent,
          action_type: 'S',
          target_table: 'rnschool',
          target_id: 'list',
          old_values: null,
          new_values: JSON.stringify({
            area,
            page: validatedPagination.page,
            pageSize: validatedPagination.pageSize,
            filters,
            total: result.total,
          }),
          reason: '학교 목록 조회',
        }),
        conn,
      );
    }

    await commitTransaction(conn);
    return result;
  } catch (error) {
    if (conn) await rollbackTransaction(conn);
    console.error('[getRnSchoolsByAreaService] 파라미터 검증 또는 DB 조회 에러:', error);
    throw new Error('학교 목록 조회 중 오류가 발생했습니다.');
  } finally {
    if (conn) {
      try {
        await conn.release();
      } catch (err) {
        console.error('Connection release error:', err);
      }
    }
  }
}

import { findRnSchoolsByArea } from '@/models/rn-school/rn-school.model';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { LogMeta } from '@/types/history';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { AppError } from '@/utils/error.utils';
import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import { paginationSchema } from '@/types/common';
import { School } from '@/types/school';
import { Pagination } from '@/types/common';

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
  meta?: LogMeta,
): Promise<{ schools: School[]; total: number; pagination: Pagination }> {
  let conn;
  try {
    conn = await beginTransaction();
    const result = await findRnSchoolsByArea(area, page, pageSize, filters);

    // 데이터가 없는 경우 404 에러
    if (result.total === 0) {
      throw new AppError('해당하는 지역의 학교 목록이 존재하지 않습니다.', 404);
    }

    if (meta) {
      await logAction(
        makeLogParams({
          manager_no: meta.manager_no,
          ip: meta.ip,
          user_agent: meta.user_agent,
          action_type: 'S',
          target_table: 'rnschool',
          target_id: area === 'all' ? 'all' : `area=${area}`,
          old_values: '',
          new_values: JSON.stringify(result),
          reason: `학교 목록 조회: ${area === 'all' ? '전체' : `지역 ${area}`}`,
        }),
        conn,
      );
    }

    await commitTransaction(conn);
    return {
      schools: result.schools,
      total: result.total,
      pagination: paginationSchema.parse({
        page,
        pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / pageSize),
      }),
    };
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    console.error('학교 목록 조회 중 오류 발생:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('학교 목록 조회 중 오류가 발생했습니다.', 500);
  } finally {
    if (conn) {
      try {
        await conn.release();
      } catch (error) {
        console.error('트랜잭션 커넥션 해제 중 오류:', error);
      }
    }
  }
}

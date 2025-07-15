import { findRnDevicesRelBySchoolNo } from '@/models/rnDevicesRel/rnDevicesRel.model';
import { deviceListParamsSchema } from '@/types/device';
import type { Device, DeviceListParams } from '@/types/device';
import type { Pagination } from '@/types/common';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import type { LogMeta } from '@/types/history';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { AppError } from '@/utils/error.utils';
/**
 * 지역 학교 센서 장치 목록 조회
 *
 * @todo (옵션) 필터링 추가: `model`을 받아서 모델로 학교 센서 장치 목록 조회.
 * @todo (옵션) 필터링 추가: `ip`를 받아서 IP로 학교 센서 장치 목록 조회.
 * @todo (옵션) 필터링 추가: `rip`를 받아서 외부 IP로 학교 센서 장치 목록 조회.
 * @todo (옵션) 필터링 추가: `interval`를 받아서 측정 주기로 학교 센서 장치 목록 조회.
 * @todo (옵션) 필터링 추가: `ver`를 받아서 버전으로 학교 센서 장치 목록 조회.
 * @todo (옵션) 필터링 추가: `tags`를 받아서 태그로 학교 센서 장치 목록 조회.
 *
 */

/**
 * 지역 학교 센서 장치 목록 조회
 */
export async function getRnDevicesRelBySchoolNo(
  params: DeviceListParams,
  meta: LogMeta,
): Promise<{
  devices: Device[];
  pagination: Pagination;
}> {
  let conn;
  try {
    conn = await beginTransaction();
    const validatedParams = deviceListParamsSchema.parse(params);

    const { devices, total } = await findRnDevicesRelBySchoolNo(validatedParams);

    // 센서 장치가 없는 경우는 비정상적인 상황으로 간주
    if (total === 0) {
      throw new AppError('해당 학교의 센서 장치가 존재하지 않습니다.', 404);
    }

    const pagination: Pagination = {
      page: validatedParams.page,
      pageSize: validatedParams.pageSize,
      total,
      totalPages: Math.ceil(total / validatedParams.pageSize),
    };

    await logAction(
      makeLogParams({
        managerNo: meta.managerNo,
        schoolNo: params.schoolNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'S',
        targetTable: 'rnDevicesRel',
        targetId: `${params.schoolNo}`,
        oldValues: JSON.stringify({ devices, pagination }),
        newValues: null,
        reason: '센서 목록 조회',
      }),
      conn,
    );

    await commitTransaction(conn);
    return { devices, pagination };
  } catch (error) {
    if (conn) {
      try {
        await rollbackTransaction(conn);
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('센서 장치 목록 조회 중 오류가 발생했습니다.', 500);
  }
}

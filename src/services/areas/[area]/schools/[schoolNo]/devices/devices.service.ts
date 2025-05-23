import { findRnDevicesRelBySchoolNo } from '@/models/rnDevicesRel/rnDevicesRel.model';
import { deviceListParamsSchema } from '@/types/device';
import type { Device, DeviceListParams } from '@/types/device';
import type { Pagination } from '@/types/common';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import type { LogMeta } from '@/types/history';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
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

    const result = await findRnDevicesRelBySchoolNo(validatedParams);

    // school_no가 없으면 params에서 가져옴
    const school_no = meta.school_no ?? params.school_no;

    await logAction(
      makeLogParams({
        manager_no: meta.manager_no ?? 1, // 기본값 설정
        school_no: school_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'S',
        target_table: 'rnDevicesRel',
        target_id: `${school_no}`,
        old_values: null,
        new_values: JSON.stringify(result),
        reason: '센서 목록 조회',
      }),
      conn,
    );

    await commitTransaction(conn);
    return result;
  } catch (error) {
    if (conn) {
      try {
        await rollbackTransaction(conn);
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }
    console.error('[getRnDevicesRelBySchoolNo] DB 조회 에러:', error);
    throw new Error('조회 중 오류가 발생했습니다.');
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

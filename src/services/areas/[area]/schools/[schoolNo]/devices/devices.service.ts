import { findRnDevicesRelBySchoolNo } from '@/models/rnDevicesRel/rnDevicesRel.model';
import { deviceListParamsSchema } from '@/types/device';
import type { Device, DeviceListParams } from '@/types/device';
import type { Pagination } from '@/types/common';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import type { LogMeta } from '@/types/history';
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
  // 1. 파라미터 검증
  const validatedParams = deviceListParamsSchema.parse(params);

  // 2. 센서 목록 조회
  const result = await findRnDevicesRelBySchoolNo(validatedParams);

  // 3. 히스토리 기록
  await logAction(
    makeLogParams({
      manager_no: meta.manager_no,
      ip: meta.ip,
      user_agent: meta.user_agent,
      action_type: 'S',
      target_table: 'rnDevicesRel',
      target_id: validatedParams.school_no.toString(),
      old_values: null,
      new_values: JSON.stringify(result),
      reason: '센서 목록 조회',
    }),
  );

  return result;
}

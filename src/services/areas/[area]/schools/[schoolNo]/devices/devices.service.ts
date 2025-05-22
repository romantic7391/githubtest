import { findRnDevicesRelBySchoolNo } from '@/models/rnDevicesRel/rnDevicesRel.model';
import { deviceListParamsSchema } from '@/types/device';
import type { Device } from '@/types/device';

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
export async function getRnDevicesRelBySchoolNo(params: {
  school_no: number;
  page?: number;
  pageSize?: number;
  filters?: {
    model?: string;
    ip?: string;
    rip?: string;
    interval?: number;
    ver?: string;
    tags?: string;
  };
}): Promise<{
  devices: Device[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}> {
  // 1. 파라미터 검증
  const validatedParams = deviceListParamsSchema.parse(params);

  // 2. 센서 목록 조회
  return await findRnDevicesRelBySchoolNo(validatedParams);
}

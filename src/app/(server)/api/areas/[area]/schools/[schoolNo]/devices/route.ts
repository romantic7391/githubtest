// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { DevicesApiResponse, DeviceListParams } from '@/types/device';
import { NextRequest, NextResponse } from 'next/server';
import { getRnDevicesRelBySchoolNo } from '@/services/areas/[area]/schools/[schoolNo]/devices/devices.service';
import { getClientInfo } from '@/services/log-action/log-action.service';
import { handleError, handleZodError } from '@/utils/error.utils';

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
export async function GET(request: NextRequest, { params }: { params: Promise<{ area: string; schoolNo: string }> }) {
  try {
    const { area, schoolNo } = await params; // eslint-disable-line @typescript-eslint/no-unused-vars
    const searchParams = request.nextUrl.searchParams;
    const { ip, userAgent } = getClientInfo(request);

    // 1. 쿼리 파라미터 파싱
    const queryParams: DeviceListParams = {
      schoolNo: parseInt(schoolNo),
      page: parseInt(searchParams.get('page') ?? '1'),
      pageSize: parseInt(searchParams.get('pageSize') ?? '10'),
      filters: {
        model: searchParams.get('model') || null,
        ip: searchParams.get('ip') || null,
        rip: searchParams.get('rip') || null,
        interval: searchParams.get('interval') ? parseInt(searchParams.get('interval')!) : null,
        ver: searchParams.get('ver') || null,
        tags: searchParams.get('tags') || null,
      },
    };

    // 2. 센서 목록 조회
    const result = await getRnDevicesRelBySchoolNo(queryParams, {
      managerNo: 1, // TODO: 실제 사용자의 manager_no로 변경 필요
      schoolNo: parseInt(schoolNo),
      ip: ip ?? 'unknown',
      userAgent: userAgent ?? 'unknown', // TODO: 실제 사용자의 user_agent로 변경 필요
    });

    return NextResponse.json(
      {
        success: true,
        message: '학교 센서 장치 목록 조회 성공',
        data: {
          items: result.devices,
          pagination: result.pagination,
        },
      } satisfies DevicesApiResponse,
      { status: 200 },
    );
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '학교 센서 장치 목록 조회');
  }
}

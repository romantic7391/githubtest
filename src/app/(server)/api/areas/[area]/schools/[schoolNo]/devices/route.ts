import type { DevicesApiResponse, DeviceListParams, DeviceCreateParams } from '@/types/device';
import { NextRequest, NextResponse } from 'next/server';
import { getRnDevicesRelBySchoolNo } from '@/services/areas/[area]/schools/[schoolNo]/devices/devices.service';
import { withPermissionCheck } from '@/utils/api-wrapper.utils';
import { CommonContext } from '@/types/api-wrapper';

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
export const GET = withPermissionCheck<DeviceCreateParams>(
  async (request: NextRequest, { params }: { params: Promise<DeviceCreateParams> }, commonContext: CommonContext) => {
    const { schoolNo } = await params;
    const searchParams = request.nextUrl.searchParams;

    // 쿼리 파라미터 파싱
    const queryParams: DeviceListParams = {
      schoolNo: parseInt(schoolNo),
      page: parseInt(searchParams.get('page') ?? '1'),
      pageSize: parseInt(searchParams.get('pageSize') ?? '10'),
      filters: {
        mac: searchParams.get('mac') || null,
        ip: searchParams.get('ip') || null,
        rip: searchParams.get('rip') || null,
        interval: searchParams.get('interval') ? parseInt(searchParams.get('interval')!) : null,
        ver: searchParams.get('ver') || null,
        tags: searchParams.get('tags') || null,
      },
    };

    // 센서 목록 조회
    const result = await getRnDevicesRelBySchoolNo(queryParams, {
      managerNo: commonContext.managerNo,
      schoolNo: parseInt(schoolNo),
      ip: commonContext.ip,
      userAgent: commonContext.userAgent,
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
  },
);

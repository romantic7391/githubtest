import { DEFAULT_ERROR_MESSAGE_500 } from '@/lib/default.constant';
import type { BaseApiResponse } from '@/types/common';
import type { DevicesApiResponse, DeviceListParams } from '@/types/device';
import { NextRequest, NextResponse } from 'next/server';
import { getRnDevicesRelBySchoolNo } from '@/services/areas/[area]/schools/[schoolNo]/devices/devices.service';
import { z } from 'zod';

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
export async function GET(request: NextRequest, { params }: { params: { area: string; schoolNo: string } }) {
  try {
    const { area, schoolNo } = params;
    const searchParams = request.nextUrl.searchParams;

    // 1. 쿼리 파라미터 파싱
    const queryParams: DeviceListParams = {
      school_no: parseInt(schoolNo),
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

    console.log('GET /api/areas/[area]/schools/[schoolNo]/devices', {
      area,
      schoolNo,
      ...queryParams,
    });

    // 2. 센서 목록 조회
    const result = await getRnDevicesRelBySchoolNo(queryParams, {
      manager_no: 1, // 임시로 1로 설정
      ip: searchParams.get('ip') || null,
      user_agent: request.headers.get('user-agent') || null,
    });

    return NextResponse.json({
      success: true,
      message: '',
      data: result,
    } satisfies DevicesApiResponse);
  } catch (error) {
    console.error('Error in GET /api/areas/[area]/schools/[schoolNo]/devices:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: '데이터 검증에 실패했습니다.',
          errors: error.errors,
        } satisfies BaseApiResponse,
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE_500,
      } satisfies BaseApiResponse,
      { status: 500 },
    );
  }
}

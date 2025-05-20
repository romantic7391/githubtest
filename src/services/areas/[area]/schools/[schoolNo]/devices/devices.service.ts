import { DEFAULT_ERROR_MESSAGE_500, DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import type { BaseApiResponse } from '@/types/common';
import type { DevicesApiResponse } from '@/types/device';
import { NextRequest, NextResponse } from 'next/server';

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
    console.log(
      'GET /api/areas/[area]/schools/[schoolNo]/devices',
      await params,
      request.nextUrl.searchParams.get('model'),
      request.nextUrl.searchParams.get('ip'),
      request.nextUrl.searchParams.get('rip'),
      request.nextUrl.searchParams.get('interval'),
      request.nextUrl.searchParams.get('ver'),
      request.nextUrl.searchParams.get('tags'),
    );

    return NextResponse.json({
      success: true,
      message: '',
      data: {
        devices: [],
        pagination: {
          page: 1,
          pageSize: DEFAULT_PAGE_SIZE,
          total: 0,
          totalPages: 0,
        },
      },
    } satisfies DevicesApiResponse);
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: DEFAULT_ERROR_MESSAGE_500,
    } satisfies BaseApiResponse);
  }
}

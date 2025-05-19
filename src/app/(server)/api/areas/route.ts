import { Area, AreasApiResponse } from '@/types/area';
import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_ERROR_MESSAGE_500, DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import { BaseApiResponse } from '@/types/common';

/**
 * 지역 목록 조회
 *
 * @todo 필터링 추가: `area`를 여러 개 받아서 여러 지역 조회.
 * @todo 필터링 추가: `areaCode`를 여러 개 받아서 여러 지역 조회.
 */
export async function GET(request: NextRequest) {
  try {
    console.log(`GET /api/areas${request.nextUrl.search.toString()}`, request.nextUrl.searchParams.getAll('area'));

    return NextResponse.json({
      success: true,
      message: '',
      data: {
        areas: [
          {
            areaNo: 1,
            area: 'daejeon',
            x: 67,
            y: 100,
            areaCode: 'G10',
          },
          {
            areaNo: 2,
            area: 'chuncheon',
            x: 73,
            y: 134,
            areaCode: 'K10',
          },
          {
            areaNo: 3,
            area: 'gunsan',
            x: 56,
            y: 92,
            areaCode: 'P10',
          },
        ],
        pagination: {
          page: 1,
          pageSize: DEFAULT_PAGE_SIZE,
          total: 3,
          totalPages: 1,
        },
      },
    } satisfies AreasApiResponse);
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: DEFAULT_ERROR_MESSAGE_500,
    } satisfies BaseApiResponse);
  }
}

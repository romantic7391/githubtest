import { z } from 'zod';
import { Area, AreasApiResponse } from '@/types/area';
import { NextResponse } from 'next/server';
import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';

/**
 * 지역 목록 조회
 * @todo 조회 필터링 추가
 */
export async function GET() {
  const sampleAreas: Area[] = [
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
  ];

  return NextResponse.json({
    success: true,
    message: '',
    data: {
      areas: sampleAreas,
      pagination: {
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        total: sampleAreas.length,
        totalPages: 1,
      },
    },
  } satisfies AreasApiResponse);
}

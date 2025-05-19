import { NextRequest, NextResponse } from 'next/server';
import type { Area, AreaApiResponse, AreaCreateOrUpdateApiResponse } from '@/types/area';
import type { BaseApiResponse } from '@/types/common';
import { DEFAULT_ERROR_MESSAGE_500 } from '@/lib/default.constant';

/**
 * 지역 조회
 *
 * @todo `area`가 `all`일 경우 모든 지역 조회. GET /api/areas 와 동일함.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ area: string }> }) {
  console.log('GET /api/areas/[area]', await params);

  const sampleArea: Area = {
    areaNo: 1,
    area: 'daejeon',
    x: 100,
    y: 100,
    areaCode: 'A10',
  };

  return NextResponse.json({
    success: true,
    message: '',
    data: sampleArea,
  } satisfies AreaApiResponse);
}

/**
 * 지역 수정
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ area: string }> }) {
  console.log('PUT /api/areas/[area]', await params, await request.json());

  return NextResponse.json({
    success: true,
    message: '',
    data: {
      area: 'daejeon',
    },
  } satisfies AreaCreateOrUpdateApiResponse);
}

/**
 * 지역 삭제
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ area: string }> }) {
  try {
    console.log('DELETE /api/areas/[area]', await params);

    return NextResponse.json({
      success: true,
      message: '',
    } satisfies BaseApiResponse);
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: DEFAULT_ERROR_MESSAGE_500,
    } satisfies BaseApiResponse);
  }
}

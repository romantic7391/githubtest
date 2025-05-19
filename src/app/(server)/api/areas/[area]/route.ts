import { NextRequest, NextResponse } from 'next/server';
import { Area, AreaApiResponse, AreaCreateOrUpdateApiResponse } from '@/types/area';
import { BaseApiResponse } from '@/types/common';

/**
 * 지역 조회
 *
 * @todo area가 `all`일 경우 모든 지역 조회
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ area: string }> }) {
  // const { area } = await params;

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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ area: string }> }) {
  // const { area } = await params;
  // const body = await request.json();

  return NextResponse.json({
    success: true,
    message: '',
    data: {
      area: 'daejeon',
    },
  } satisfies AreaCreateOrUpdateApiResponse);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ area: string }> }) {
  // const { area } = await params;

  return NextResponse.json({
    success: true,
    message: '',
  } satisfies BaseApiResponse);
}

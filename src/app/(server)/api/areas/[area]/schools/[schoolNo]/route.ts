import { NextRequest, NextResponse } from 'next/server';

/**
 * 지역 학교  조회
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ area: string; schoolNo: string }> }) {
  // const { area, schoolNo } = await params;

  return NextResponse.json({});
}

/**
 * 지역 학교 수정
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ area: string; schoolNo: string }> }) {
  // const { area, schoolNo } = await params;

  return NextResponse.json({});
}

/**
 * 지역 학교 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ area: string; schoolNo: string }> },
) {
  // const { area, schoolNo } = await params;

  return NextResponse.json({});
}

import { NextRequest, NextResponse } from 'next/server';

/**
 * 지역 학교 목록 조회
 * @todo 조회 필터링 추가
 * @todo area가 `all`일 경우 모든 지역의 학교 목록 조회
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ area: string }> }) {
  const { area } = await params;

  if (area === 'all') {
    // 모든 지역의 학교 목록
  } else {
    // 특정 지역의 학교 목록
  }

  NextResponse.json({});
}

import { NextRequest, NextResponse } from 'next/server';
import type { AreaCreateOrUpdateApiResponse } from '@/types/area';
import type { BaseApiResponse } from '@/types/common';
import { DEFAULT_ERROR_MESSAGE_500 } from '@/lib/default.constant';
/**
 * 지역 추가
 */
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/areas/create', await request.json());

    return NextResponse.json({
      success: true,
      message: '',
      data: {
        area: 'daejeon',
      },
    } satisfies AreaCreateOrUpdateApiResponse);
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: DEFAULT_ERROR_MESSAGE_500,
    } satisfies BaseApiResponse);
  }
}

import { DEFAULT_ERROR_MESSAGE_500 } from '@/lib/default.constant';
import { BaseApiResponse } from '@/types/common';
import { SchoolCreateOrUpdateApiResponse } from '@/types/school';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 지역 학교 추가
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ area: string }> }) {
  try {
    console.log('POST /api/areas/[area]/schools/create', await params, await request.json());

    return NextResponse.json({
      success: true,
      message: '',
      data: {
        schoolNo: 1,
      },
    } satisfies SchoolCreateOrUpdateApiResponse);
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: DEFAULT_ERROR_MESSAGE_500,
    } satisfies BaseApiResponse);
  }
}

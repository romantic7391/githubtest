import { DEFAULT_ERROR_MESSAGE_500 } from '@/lib/default.constant';
import { BaseApiResponse } from '@/types/common';
import { DeviceCreateOrUpdateApiResponse } from '@/types/device';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 지역 학교 센서 장치 추가
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ area: string; schoolNo: string }> }) {
  try {
    console.log('POST /api/areas/[area]/schools/[schoolNo]/devices/create', await params, await request.json());

    return NextResponse.json({
      success: true,
      message: '',
      data: {
        mac: '1234567890',
      },
    } satisfies DeviceCreateOrUpdateApiResponse);
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: DEFAULT_ERROR_MESSAGE_500,
    } satisfies BaseApiResponse);
  }
}

import { DEFAULT_ERROR_MESSAGE_500 } from '@/lib/default.constant';
import type { BaseApiResponse } from '@/types/common';
import { DeviceApiResponse, DeviceCreateOrUpdateApiResponse } from '@/types/device';
import type { SchoolApiResponse, SchoolCreateOrUpdateApiResponse } from '@/types/school';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 지역 학교 센서 장치 정보
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ area: string; schoolNo: string; mac: string }> },
) {
  try {
    console.log('GET /api/areas/[area]/schools/[schoolNo]/devices/[mac]', await params);

    return NextResponse.json({
      success: true,
      message: '',
      data: {
        mac: '1234567890',
        name: '1234567890',
        summary: '1234567890',
        kind: 1,
        extra: '1234567890',
        sdate: '1970-01-01 00:00:00',
        edate: '1970-01-01 00:00:00',
        created: '1970-01-01 00:00:00',
        device: {
          model: '1234567890',
          ip: '1234567890',
          rip: '1234567890',
          splrate: 10,
          interval: 10,
          ver: '1.0.0',
          tags: '1234567890',
          checkin: '1970-01-01 00:00:00',
          created: '1970-01-01 00:00:00',
        },
      },
    } satisfies DeviceApiResponse);
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: DEFAULT_ERROR_MESSAGE_500,
    } satisfies BaseApiResponse);
  }
}

/**
 * 지역 학교 수정
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ area: string; schoolNo: string; mac: string }> },
) {
  try {
    console.log('PUT /api/areas/[area]/schools/[schoolNo]/devices/[mac]', await params, await request.json());

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

/**
 * 지역 학교 센서 장치 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ area: string; schoolNo: string; mac: string }> },
) {
  try {
    console.log('DELETE /api/areas/[area]/schools/[schoolNo]/devices/[mac]', await params);

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

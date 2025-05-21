// import { DEFAULT_ERROR_MESSAGE_500 } from '@/lib/default.constant';
// import type { BaseApiResponse } from '@/types/common';
// import type { DeviceApiResponse, DeviceCreateOrUpdateApiResponse } from '@/types/device';
import { NextRequest, NextResponse } from 'next/server';
import {
  getDevice,
  updateDevice,
  deleteDevice,
} from '@/services/areas/[area]/schools/[schoolNo]/devices/[mac]/[mac].service';
import { deviceRelSchema } from '@/types/device';
import { z } from 'zod';

/**
 * 지역 학교 센서 장치 정보
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { area: string; schoolNo: string; mac: string } },
) {
  try {
    const { mac } = await params;
    const device = await getDevice(mac);

    if (!device) {
      return NextResponse.json({ success: false, message: '센서를 찾을 수 없습니다.' }, { status: 404 });
    }

    // Zod로 응답 데이터 검증
    const validatedDevice = deviceRelSchema.parse(device);
    return NextResponse.json({ success: true, data: validatedDevice });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: '데이터 검증에 실패했습니다.', errors: error.errors },
        { status: 400 },
      );
    }
    console.error('[GET] 센서 조회 에러:', error);
    return NextResponse.json({ success: false, message: '센서 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/**
 * 지역 학교 수정
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { area: string; schoolNo: string; mac: string } },
) {
  try {
    const { mac } = await params;
    const body = await request.json();

    // Zod로 요청 데이터 검증
    const validatedData = deviceRelSchema.parse(body);
    const dto = { ...validatedData, mac };

    await updateDevice(dto);
    return NextResponse.json({ success: true, message: '센서가 성공적으로 수정되었습니다.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: '데이터 검증에 실패했습니다.', errors: error.errors },
        { status: 400 },
      );
    }
    console.error('[PUT] 센서 수정 에러:', error);
    return NextResponse.json({ success: false, message: '센서 수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/**
 * 지역 학교 센서 장치 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { area: string; schoolNo: string; mac: string } },
) {
  try {
    const { mac } = await params;
    await deleteDevice({ mac });
    return NextResponse.json({ success: true, message: '센서가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('[DELETE] 센서 삭제 에러:', error);
    return NextResponse.json({ success: false, message: '센서 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

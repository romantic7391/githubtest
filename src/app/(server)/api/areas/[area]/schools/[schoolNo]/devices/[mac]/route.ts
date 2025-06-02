import { NextRequest, NextResponse } from 'next/server';
import {
  getDevice,
  updateDevice,
  deleteDevice,
} from '@/services/areas/[area]/schools/[schoolNo]/devices/[mac]/[mac].service';
import { deviceRelSchema } from '@/types/device';
import { getClientInfo } from '@/services/log-action/log-action.service';
import { z } from 'zod';
import { DEFAULT_ERROR_MESSAGE_500 } from '@/lib/default.constant';
import type { BaseApiResponse } from '@/types/common';

/**
 * 지역 학교 센서 장치 정보
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ area: string; schoolNo: string; mac: string }> },
) {
  try {
    const { mac, schoolNo, area } = await params;
    console.log('[GET] 요청 파라미터:', { mac, schoolNo, area });

    const { userAgent, ip } = getClientInfo(request);
    const device = await getDevice(
      { mac, school_no: parseInt(schoolNo, 10) },
      {
        manager_no: 1, // 임시로 1로 설정
        ip,
        user_agent: userAgent,
      },
    );
    console.log('[GET] 조회된 디바이스:', device);

    if (!device) {
      return NextResponse.json({ success: false, message: '센서를 찾을 수 없습니다.' }, { status: 404 });
    }

    // Zod로 응답 데이터 검증
    try {
      const validatedDevice = deviceRelSchema.parse(device);
      return NextResponse.json({ success: true, data: validatedDevice });
    } catch (validationError) {
      console.error('[GET] 데이터 검증 에러:', validationError);
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            message: '데이터 검증에 실패했습니다.',
          } satisfies BaseApiResponse,
          { status: 400 },
        );
      }
      throw validationError;
    }
  } catch (error) {
    console.error('[GET] 센서 조회 에러:', error);
    return NextResponse.json(
      {
        success: false,
        message: DEFAULT_ERROR_MESSAGE_500,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

/**
 * 지역 학교센서 수정
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ area: string; schoolNo: string; mac: string }> },
) {
  try {
    const { mac, schoolNo } = await params;
    const body = await request.json();

    // Zod로 요청 데이터 검증
    const validatedData = deviceRelSchema.parse(body);
    const dto = { ...validatedData, mac, school_no: parseInt(schoolNo, 10) };

    const { userAgent, ip } = getClientInfo(request);
    const result = await updateDevice(dto, {
      manager_no: 1, // 임시로 1로 설정
      ip,
      user_agent: userAgent,
    });
    return NextResponse.json({
      success: true,
      message: '센서가 성공적으로 수정되었습니다.',
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: '데이터 검증에 실패했습니다.' } satisfies BaseApiResponse, {
        status: 400,
      });
    }
    console.error('[PUT] 센서 수정 에러:', error);
    return NextResponse.json({ success: false, message: DEFAULT_ERROR_MESSAGE_500 } satisfies BaseApiResponse, {
      status: 500,
    });
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
    const { mac, schoolNo } = await params;
    const { userAgent, ip } = getClientInfo(request);
    await deleteDevice(
      { mac, school_no: parseInt(schoolNo, 10) },
      {
        manager_no: 1, // 임시로 1로 설정
        ip,
        user_agent: userAgent,
      },
    );
    return NextResponse.json({ success: true, message: '센서가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('[DELETE] 센서 삭제 에러:', error);
    return NextResponse.json({ success: false, message: DEFAULT_ERROR_MESSAGE_500 } satisfies BaseApiResponse, {
      status: 500,
    });
  }
}

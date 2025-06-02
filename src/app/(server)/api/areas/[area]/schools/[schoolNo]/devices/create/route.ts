import { DEFAULT_ERROR_MESSAGE_500 } from '@/lib/default.constant';
import { BaseApiResponse } from '@/types/common';
import { DeviceCreateOrUpdateApiResponse, deviceCreateSchema } from '@/types/device';
import { NextRequest, NextResponse } from 'next/server';
import { getClientInfo } from '@/services/log-action/log-action.service';
import { createRnDevicesRel } from '@/services/areas/[area]/schools/[schoolNo]/devices/create/craete.service';
import { z } from 'zod';

/**
 * 지역 학교 센서 장치 추가
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ area: string; schoolNo: string }> }) {
  try {
    const { area, schoolNo } = await params;
    const body = await request.json();
    console.log('POST /api/areas/[area]/schools/[schoolNo]/devices/create', { area, schoolNo, body });

    // 1. 요청 데이터 검증
    const validatedData = deviceCreateSchema.parse({
      ...body,
      schoolNo: parseInt(schoolNo, 10),
    });

    // 2. 클라이언트 정보 가져오기
    const { userAgent, ip } = getClientInfo(request);

    // 3. 센서 등록
    await createRnDevicesRel([validatedData], {
      manager_no: 1, // TODO: 실제 매니저 번호로 변경 필요
      school_no: parseInt(schoolNo, 10),
      ip,
      user_agent: userAgent,
    });

    return NextResponse.json({
      success: true,
      message: '센서가 성공적으로 등록되었습니다.',
      data: {
        mac: validatedData.mac,
      },
    } satisfies DeviceCreateOrUpdateApiResponse);
  } catch (error) {
    console.error('Error in POST /api/areas/[area]/schools/[schoolNo]/devices/create:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: '데이터 검증에 실패했습니다.',
        } satisfies BaseApiResponse,
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: DEFAULT_ERROR_MESSAGE_500,
      } satisfies BaseApiResponse,
      { status: 500 },
    );
  }
}

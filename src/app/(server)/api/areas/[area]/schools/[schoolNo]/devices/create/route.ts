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
      managerNo: 1, // TODO: 실제 사용자의 manager_no로 변경 필요
      schoolNo: parseInt(schoolNo, 10),
      ip,
      userAgent: userAgent,
    });

    return NextResponse.json(
      {
        success: true,
        message: '센서가 성공적으로 등록되었습니다.',
        data: {
          mac: validatedData.mac,
        },
      } satisfies DeviceCreateOrUpdateApiResponse,
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: error.issues[0].message,
        } satisfies BaseApiResponse,
        { status: 400 },
      );
    }

    // 비즈니스 로직 에러 처리
    if (error instanceof Error) {
      const errorMessage = error.message;
      if (errorMessage === '이미 등록된 MAC 주소입니다.') {
        return NextResponse.json(
          {
            success: false,
            message: errorMessage,
          } satisfies BaseApiResponse,
          { status: 409 },
        );
      }
      if (errorMessage === '등록할 센서 정보가 없습니다.') {
        return NextResponse.json(
          {
            success: false,
            message: errorMessage,
          } satisfies BaseApiResponse,
          { status: 400 },
        );
      }
    }

    // 실제 서버 오류만 로깅
    console.error('Error in POST /api/areas/[area]/schools/[schoolNo]/devices/create:', error);

    return NextResponse.json(
      {
        success: false,
        message: DEFAULT_ERROR_MESSAGE_500,
      } satisfies BaseApiResponse,
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import type { AreaCreateOrUpdateApiResponse } from '@/types/area';
import type { BaseApiResponse } from '@/types/common';
import { DEFAULT_ERROR_MESSAGE_500 } from '@/lib/default.constant';
import { createArea } from '@/services/areas/create/create.service';
import { areaCreateShcema } from '@/types/area';
import { ZodError } from 'zod';
import { getClientInfo } from '@/services/log-action/log-action.service';

/**
 * 지역 생성
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ area: string }> }) {
  try {
    await params; // area는 사용하지 않으므로 구조 분해 할당 제거
    const body = await request.json();

    const validatedData = areaCreateShcema.parse(body);

    const { userAgent, ip } = getClientInfo(request);
    await createArea(validatedData, {
      manager_no: 1, // 임시로 1로 설정
      school_no: 0, // 지역 생성 시에는 0으로 설정
      ip,
      user_agent: userAgent,
    });

    const response = {
      success: true,
      message: '지역이 성공적으로 생성되었습니다.',
      data: { area: validatedData.area },
    };

    return NextResponse.json(response satisfies AreaCreateOrUpdateApiResponse, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: '잘못된 데이터 형식입니다.',
        } satisfies BaseApiResponse,
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === '이미 존재하는 지역명입니다.') {
      return NextResponse.json(
        {
          success: false,
          message: '이미 존재하는 지역명입니다.',
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

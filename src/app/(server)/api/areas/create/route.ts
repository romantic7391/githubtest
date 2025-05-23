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
    console.log('[POST /api/areas/create] 요청 시작');
    const body = await request.json();
    console.log('[POST /api/areas/create] 요청 데이터:', body);

    const validatedData = areaCreateShcema.parse(body);
    console.log('[POST /api/areas/create] 검증된 데이터:', validatedData);

    const { userAgent, ip } = getClientInfo(request);
    await createArea(validatedData, {
      manager_no: 1, // 임시로 1로 설정
      ip,
      user_agent: userAgent,
    });
    console.log('[POST /api/areas/create] 지역 생성 완료');

    const response = {
      success: true,
      message: '지역이 성공적으로 생성되었습니다.',
      data: { area: validatedData.area },
    };
    console.log('[POST /api/areas/create] 응답:', response);

    return NextResponse.json(response satisfies AreaCreateOrUpdateApiResponse, { status: 200 });
  } catch (error) {
    console.error('[POST /api/areas/create] Error:', error);

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

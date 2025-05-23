import { NextRequest, NextResponse } from 'next/server';
import type { AreaApiResponse, AreaCreateOrUpdateApiResponse } from '@/types/area';
import type { BaseApiResponse } from '@/types/common';
import { DEFAULT_ERROR_MESSAGE_500 } from '@/lib/default.constant';
import { getAreaByArea, updateArea, deleteArea } from '@/services/areas/[area]/[area].service';
import { areaSchema } from '@/types/area';
import { ZodError } from 'zod';
import { getClientInfo } from '@/services/log-action/log-action.service';

/**
 * 지역 조회
 *
 * @todo `area`가 `all`일 경우 모든 지역 조회. GET /api/areas 와 동일함.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ area: string }> }) {
  try {
    const { area } = await params;
    const { userAgent, ip } = getClientInfo(request);

    const areas = await getAreaByArea(area, {
      manager_no: 1, // 임시로 1로 설정
      ip,
      user_agent: userAgent,
    });

    if (!areas || areas.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: '지역을 찾을 수 없습니다.',
        } satisfies BaseApiResponse,
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: '지역 목록 조회',
        data: areas[0],
      } satisfies AreaApiResponse,
      { status: 200 },
    );
  } catch (error) {
    console.error('[GET /api/areas] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: DEFAULT_ERROR_MESSAGE_500,
      } satisfies BaseApiResponse,
      { status: 500 },
    );
  }
}

/**
 * 지역 수정
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ area: string }> }) {
  try {
    await params; // area는 사용하지 않으므로 구조 분해 할당 제거
    const body = await request.json();
    const validatedData = areaSchema.parse(body);
    const { userAgent, ip } = getClientInfo(request);

    await updateArea(validatedData, {
      manager_no: 1, // 임시로 1로 설정
      ip,
      user_agent: userAgent,
    });

    return NextResponse.json(
      {
        success: true,
        message: '지역 정보가 수정되었습니다.',
        data: { area: validatedData.area },
      } satisfies AreaCreateOrUpdateApiResponse,
      { status: 200 },
    );
  } catch (error) {
    console.error('[PUT /api/areas] Error:', error);

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

/**
 * 지역 삭제
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ area: string }> }) {
  try {
    const { area } = await params;
    const { userAgent, ip } = getClientInfo(request);

    await deleteArea(area, {
      manager_no: 1, // 임시로 1로 설정
      ip,
      user_agent: userAgent,
    });

    return NextResponse.json(
      {
        success: true,
        message: '지역이 삭제되었습니다.',
      } satisfies BaseApiResponse,
      { status: 200 },
    );
  } catch (error) {
    console.error('[DELETE /api/areas] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: DEFAULT_ERROR_MESSAGE_500,
      } satisfies BaseApiResponse,
      { status: 500 },
    );
  }
}

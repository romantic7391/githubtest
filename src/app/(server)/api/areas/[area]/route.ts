import { NextRequest, NextResponse } from 'next/server';
import type { AreaApiResponse, AreaCreateOrUpdateApiResponse } from '@/types/area';
import { getAreaByArea, updateArea, deleteArea } from '@/services/areas/[area]/[area].service';
import { areaSchema } from '@/types/area';
import { getClientInfo } from '@/services/log-action/log-action.service';
import { handleError, handleZodError } from '@/utils/error.utils';

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
      managerNo: 1, // 임시로 1로 설정
      ip,
      userAgent: userAgent,
      schoolNo: 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: '지역 목록 조회',
        data: areas[0],
      } satisfies AreaApiResponse,
      { status: 200 },
    );
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '지역 조회');
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
      managerNo: 1, // 임시로 1로 설정
      ip,
      userAgent: userAgent,
      schoolNo: 0,
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
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '지역 수정');
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
      managerNo: 1, // 임시로 1로 설정
      ip,
      userAgent: userAgent,
      schoolNo: 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: '지역이 삭제되었습니다.',
      },
      { status: 204 },
    );
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '지역 삭제');
  }
}

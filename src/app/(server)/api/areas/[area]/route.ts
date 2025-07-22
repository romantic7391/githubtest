import { NextRequest, NextResponse } from 'next/server';
import type { AreaApiResponse, AreaCreateOrUpdateApiResponse } from '@/types/area';
import { getAreaByArea, updateArea, deleteArea } from '@/services/areas/[area]/[area].service';
import { areaSchema, AreaParams } from '@/types/area';
import { withPermissionCheck } from '@/utils/api-wrapper.utils';
import { CommonContext } from '@/types/api-wrapper';

/**
 * 지역 조회
 *
 * @todo `area`가 `all`일 경우 모든 지역 조회. GET /api/areas 와 동일함.
 */
export const GET = withPermissionCheck<AreaParams>(
  async (request: NextRequest, { params }: { params: Promise<AreaParams> }, commonContext: CommonContext) => {
    const resolvedParams = await params;
    const { area } = resolvedParams;

    if (!area) {
      return NextResponse.json({ success: false, message: '지역 정보가 필요합니다.' }, { status: 400 });
    }

    const areas = await getAreaByArea(area, {
      managerNo: commonContext.managerNo,
      ip: commonContext.ip,
      userAgent: commonContext.userAgent,
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
  },
);

/**
 * 지역 수정
 */
export const PUT = withPermissionCheck<AreaParams>(
  async (request: NextRequest, { params }: { params: Promise<AreaParams> }, commonContext: CommonContext) => {
    const resolvedParams = await params;
    const { area } = resolvedParams;

    if (!area) {
      return NextResponse.json({ success: false, message: '지역 정보가 필요합니다.' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = areaSchema.parse(body);

    await updateArea(validatedData, {
      managerNo: commonContext.managerNo,
      ip: commonContext.ip,
      userAgent: commonContext.userAgent,
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
  },
);

/**
 * 지역 삭제
 */
export const DELETE = withPermissionCheck<AreaParams>(
  async (request: NextRequest, { params }: { params: Promise<AreaParams> }, commonContext: CommonContext) => {
    const resolvedParams = await params;
    const { area } = resolvedParams;

    if (!area) {
      return NextResponse.json({ success: false, message: '지역 정보가 필요합니다.' }, { status: 400 });
    }

    await deleteArea(area, {
      managerNo: commonContext.managerNo,
      ip: commonContext.ip,
      userAgent: commonContext.userAgent,
      schoolNo: 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: '지역이 삭제되었습니다.',
      },
      { status: 204 },
    );
  },
);

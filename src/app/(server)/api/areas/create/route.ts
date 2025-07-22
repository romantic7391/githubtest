import { NextRequest, NextResponse } from 'next/server';
import type { AreaCreateOrUpdateApiResponse } from '@/types/area';
import { createArea } from '@/services/areas/create/create.service';
import { areaCreateShcema } from '@/types/area';
import { withPermissionCheck } from '@/utils/api-wrapper.utils';
import { CommonContext, PermissionParams } from '@/types/api-wrapper';

/**
 * 지역 생성
 */
export const POST = withPermissionCheck<PermissionParams>(
  async (request: NextRequest, { params }: { params: Promise<PermissionParams> }, commonContext: CommonContext) => {
    await params; // area는 사용하지 않으므로 구조 분해 할당 제거
    const body = await request.json();

    const validatedData = areaCreateShcema.parse(body);

    await createArea(validatedData, {
      managerNo: commonContext.managerNo,
      schoolNo: 0, // 지역 생성 시에는 0으로 설정
      ip: commonContext.ip,
      userAgent: commonContext.userAgent,
    });

    return NextResponse.json(
      {
        success: true,
        message: '지역이 성공적으로 생성되었습니다.',
        data: { area: validatedData.area },
      } satisfies AreaCreateOrUpdateApiResponse,
      { status: 201 },
    );
  },
);

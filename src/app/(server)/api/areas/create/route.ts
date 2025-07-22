import { NextRequest, NextResponse } from 'next/server';
import type { AreaCreateOrUpdateApiResponse } from '@/types/area';
import { createArea } from '@/services/areas/create/create.service';
import { areaCreateShcema } from '@/types/area';
import { withPermissionCheck } from '@/utils/api-wrapper.utils';
import { CommonContext } from '@/types/api-wrapper';

/**
 * 지역 생성
 */
export const POST = withPermissionCheck(async (request: NextRequest, commonContext: CommonContext) => {
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
});

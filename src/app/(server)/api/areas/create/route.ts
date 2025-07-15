import { NextRequest, NextResponse } from 'next/server';
import type { AreaCreateOrUpdateApiResponse } from '@/types/area';
import { createArea } from '@/services/areas/create/create.service';
import { areaCreateShcema } from '@/types/area';
import { handleError, handleZodError } from '@/utils/error.utils';
import { getCommonContext } from '@/utils/context.utils';

/**
 * 지역 생성
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ area: string }> }) {
  try {
    await params; // area는 사용하지 않으므로 구조 분해 할당 제거
    const body = await request.json();

    const validatedData = areaCreateShcema.parse(body);

    const commonContext = await getCommonContext(request);
    await createArea(validatedData, {
      managerNo: commonContext.managerNo,
      schoolNo: 0, // 지역 생성 시에는 0으로 설정
      ip: commonContext.ip,
      userAgent: commonContext.userAgent,
    });

    const response = {
      success: true,
      message: '지역이 성공적으로 생성되었습니다.',
      data: { area: validatedData.area },
    };

    return NextResponse.json(response satisfies AreaCreateOrUpdateApiResponse, { status: 201 });
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '지역 생성');
  }
}

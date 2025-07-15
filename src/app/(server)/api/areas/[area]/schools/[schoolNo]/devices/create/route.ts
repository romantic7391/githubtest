import { DeviceCreateOrUpdateApiResponse, deviceCreateSchema } from '@/types/device';
import { NextRequest, NextResponse } from 'next/server';
import { createRnDevicesRel } from '@/services/areas/[area]/schools/[schoolNo]/devices/create/craete.service';
import { handleError, handleZodError } from '@/utils/error.utils';
import { getCommonContext } from '@/utils/context.utils';
/**
 * 지역 학교 센서 장치 추가
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ schoolNo: string }> }) {
  try {
    const { schoolNo } = await params;

    const body = await request.json();

    // 1. 요청 데이터 검증
    const validatedData = deviceCreateSchema.parse({
      ...body,
      schoolNo: Number(schoolNo),
    });

    // 2. 공통 컨텍스트 가져오기
    const commonContext = await getCommonContext(request);

    // 3. 센서 등록
    await createRnDevicesRel([validatedData], {
      managerNo: commonContext.managerNo,
      schoolNo: Number(schoolNo),
      ip: commonContext.ip,
      userAgent: commonContext.userAgent,
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
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '센서 생성');
  }
}

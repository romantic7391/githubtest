import { DeviceCreateOrUpdateApiResponse, deviceCreateSchema, DeviceCreateParams } from '@/types/device';
import { NextRequest, NextResponse } from 'next/server';
import { createRnDevicesRel } from '@/services/areas/[area]/schools/[schoolNo]/devices/create/craete.service';
import { withPermissionCheck } from '@/utils/api-wrapper.utils';
import { CommonContext } from '@/types/api-wrapper';

/**
 * 지역 학교 센서 장치 추가
 */
export const POST = withPermissionCheck<DeviceCreateParams>(
  async (request: NextRequest, { params }: { params: Promise<DeviceCreateParams> }, commonContext: CommonContext) => {
    const { schoolNo } = await params;
    const body = await request.json();

    // 요청 데이터 검증
    const validatedData = deviceCreateSchema.parse({
      ...body,
      schoolNo: Number(schoolNo),
    });

    // 센서 등록
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
  },
);

import { NextRequest, NextResponse } from 'next/server';
import {
  getDevice,
  updateDevice,
  deleteDevice,
} from '@/services/areas/[area]/schools/[schoolNo]/devices/[mac]/[mac].service';
import { deviceRelSchema } from '@/types/device';
import { handleError, handleZodError } from '@/utils/error.utils';
import { getCommonContext } from '@/utils/context.utils';

/**
 * 지역 학교 센서 장치 정보
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ area: string; schoolNo: string; mac: string }> },
) {
  try {
    const { mac, schoolNo, area } = await params;
    console.log('[GET] 요청 파라미터:', { mac, schoolNo, area });

    const commonContext = await getCommonContext(request);
    const device = await getDevice(
      { mac, schoolNo: parseInt(schoolNo, 10) },
      {
        managerNo: commonContext.managerNo,
        ip: commonContext.ip,
        userAgent: commonContext.userAgent,
      },
    );
    console.log('[GET] 조회된 디바이스:', device);

    // Zod로 응답 데이터 검증
    try {
      const validatedDevice = deviceRelSchema.parse(device);
      return NextResponse.json(
        {
          success: true,
          message: '센서가 성공적으로 조회되었습니다.',
          data: validatedDevice,
        },
        { status: 200 },
      );
    } catch (validationError) {
      console.error('[GET] 데이터 검증 에러:', validationError);
      const zodError = handleZodError(validationError);
      if (zodError) return zodError;
      throw validationError;
    }
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '센서 조회');
  }
}

/**
 * 지역 학교센서 수정
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ area: string; schoolNo: string; mac: string }> },
) {
  try {
    const { mac: oldMac, schoolNo } = await params;
    const body = await request.json();

    // Zod로 요청 데이터 검증
    const validatedData = deviceRelSchema.parse(body);
    const dto = { ...validatedData, oldMac, schoolNo: parseInt(schoolNo, 10) };

    const commonContext = await getCommonContext(request);
    const result = await updateDevice(dto, {
      managerNo: commonContext.managerNo,
      ip: commonContext.ip,
      userAgent: commonContext.userAgent,
    });
    return NextResponse.json(
      {
        success: true,
        message: '센서가 성공적으로 수정되었습니다.',
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '센서 수정');
  }
}

/**
 * 지역 학교 센서 장치 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ area: string; schoolNo: string; mac: string }> },
) {
  try {
    const { mac, schoolNo } = await params;
    const commonContext = await getCommonContext(request);
    await deleteDevice(
      { mac, schoolNo: parseInt(schoolNo, 10) },
      {
        managerNo: commonContext.managerNo,
        ip: commonContext.ip,
        userAgent: commonContext.userAgent,
      },
    );
    return NextResponse.json({ success: true, message: '센서가 성공적으로 삭제되었습니다.' }, { status: 200 });
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '센서 삭제');
  }
}

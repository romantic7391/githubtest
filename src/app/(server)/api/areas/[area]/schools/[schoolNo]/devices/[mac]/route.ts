import type { BaseApiResponse } from '@/types/common';
import type { DeviceApiResponse, DeviceCreateOrUpdateApiResponse } from '@/types/device';
import { NextRequest, NextResponse } from 'next/server';
import {
  getDevice,
  updateDevice,
  deleteDevice,
} from '@/services/areas/[area]/schools/[schoolNo]/devices/[mac]/[mac].service';
import { deviceRelSchema, DeviceParams } from '@/types/device';
import { withPermissionCheck } from '@/utils/api-wrapper.utils';
import { CommonContext } from '@/types/api-wrapper';

/**
 * 지역 학교 센서 장치 정보
 */
export const GET = withPermissionCheck<DeviceParams>(
  async (request: NextRequest, { params }: { params: Promise<DeviceParams> }, commonContext: CommonContext) => {
    const resolvedParams = await params;
    const { mac, schoolNo } = resolvedParams;

    const device = await getDevice(
      { mac, schoolNo: Number(schoolNo) },
      {
        managerNo: commonContext.managerNo,
        ip: commonContext.ip,
        userAgent: commonContext.userAgent,
      },
    );

    // Zod로 응답 데이터 검증
    const validatedDevice = deviceRelSchema.parse(device);

    return NextResponse.json(
      {
        success: true,
        message: '센서가 성공적으로 조회되었습니다.',
        data: validatedDevice,
      } satisfies DeviceApiResponse,
      { status: 200 },
    );
  },
);

/**
 * 지역 학교센서 수정
 */
export const PUT = withPermissionCheck<DeviceParams>(
  async (request: NextRequest, { params }: { params: Promise<DeviceParams> }, commonContext: CommonContext) => {
    const resolvedParams = await params;
    const { mac: oldMac, schoolNo } = resolvedParams;
    const body = await request.json();

    // Zod로 요청 데이터 검증
    const validatedData = deviceRelSchema.parse(body);
    const dto = { ...validatedData, oldMac, schoolNo: parseInt(schoolNo, 10) };

    await updateDevice(dto, {
      managerNo: commonContext.managerNo,
      ip: commonContext.ip,
      userAgent: commonContext.userAgent,
    });

    return NextResponse.json(
      {
        success: true,
        message: '센서가 성공적으로 수정되었습니다.',
        data: {
          mac: oldMac,
        },
      } satisfies DeviceCreateOrUpdateApiResponse,
      { status: 200 },
    );
  },
);

/**
 * 지역 학교 센서 장치 삭제
 */
export const DELETE = withPermissionCheck<DeviceParams>(
  async (request: NextRequest, { params }: { params: Promise<DeviceParams> }, commonContext: CommonContext) => {
    const resolvedParams = await params;
    const { mac, schoolNo } = resolvedParams;

    await deleteDevice(
      { mac, schoolNo: parseInt(schoolNo, 10) },
      {
        managerNo: commonContext.managerNo,
        ip: commonContext.ip,
        userAgent: commonContext.userAgent,
      },
    );

    return NextResponse.json(
      {
        success: true,
        message: '센서가 성공적으로 삭제되었습니다.',
      } satisfies BaseApiResponse,
      { status: 200 },
    );
  },
);

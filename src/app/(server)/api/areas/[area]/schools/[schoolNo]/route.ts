import type { BaseApiResponse } from '@/types/common';
import type { SchoolApiResponse, SchoolCreateOrUpdateApiResponse, School, updateRnSchoolDto } from '@/types/school';

import { NextRequest, NextResponse } from 'next/server';
import {
  getSchoolBySchoolNo,
  updateRnSchool,
  deleteRnSchool,
} from '@/services/areas/[area]/schools/[schoolNo]/[schoolNo].service';
import { withPermissionCheck } from '@/utils/api-wrapper.utils';
import { CommonContext, PermissionParams } from '@/types/api-wrapper';
import { z } from 'zod';

const updateSchoolSchema = z.object({
  sname: z.string().min(1, '학교 이름은 필수입니다.'),
  scode: z.string().min(1, '학교 코드는 필수입니다.'),
  area: z.string().min(1, '지역은 필수입니다.'),
  administrationCode: z.string().min(1, '행정코드는 필수입니다.'),
});

// 학교 API의 파라미터 타입 정의
interface SchoolParams extends PermissionParams {
  area: string;
  schoolNo: string;
}

/**
 * 지역 학교 정보
 */
export const GET = withPermissionCheck<SchoolParams>(
  async (request: NextRequest, { params }: { params: Promise<SchoolParams> }, commonContext: CommonContext) => {
    const resolvedParams = await params;
    const schoolNoNum = Number(resolvedParams.schoolNo);

    const school = await getSchoolBySchoolNo(schoolNoNum, commonContext);

    return NextResponse.json(
      {
        success: true,
        message: '학교 정보를 성공적으로 조회했습니다.',
        data: school,
      } satisfies SchoolApiResponse,
      { status: 200 },
    );
  },
);

/**
 * 지역 학교 수정
 */
export const PUT = withPermissionCheck<SchoolParams>(
  async (request: NextRequest, { params }: { params: Promise<SchoolParams> }, commonContext: CommonContext) => {
    const resolvedParams = await params;
    const schoolNoNum = Number(resolvedParams.schoolNo);
    const body = await request.json();

    // 요청 데이터 검증
    const validatedData = updateSchoolSchema.parse(body);

    const dto: updateRnSchoolDto = {
      ...validatedData,
      schoolNo: schoolNoNum,
      modbus: 0,
      modbusHost: null,
      modbusPort: 502,
      useOrderSheet: 'N',
      active: 'Y',
      created: null,
      parentNo: null,
    };

    await updateRnSchool(dto, commonContext);

    return NextResponse.json(
      {
        success: true,
        message: '학교 정보가 성공적으로 수정되었습니다.',
        data: {
          schoolNo: schoolNoNum,
        },
      } satisfies SchoolCreateOrUpdateApiResponse,
      { status: 200 },
    );
  },
);

/**
 * 지역 학교 삭제
 */
export const DELETE = withPermissionCheck<SchoolParams>(
  async (request: NextRequest, { params }: { params: Promise<SchoolParams> }, commonContext: CommonContext) => {
    const resolvedParams = await params;
    const schoolNoNum = Number(resolvedParams.schoolNo);
    const dto: School = {
      schoolNo: schoolNoNum,
    } as School;

    await deleteRnSchool(dto, commonContext);

    return NextResponse.json(
      {
        success: true,
        message: '학교가 성공적으로 삭제되었습니다.',
      } satisfies BaseApiResponse,
      { status: 200 },
    );
  },
);

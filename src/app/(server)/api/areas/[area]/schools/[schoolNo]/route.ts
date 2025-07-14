import type { BaseApiResponse } from '@/types/common';
import type {
  SchoolApiResponse,
  SchoolCreateOrUpdateApiResponse,
  School,
  SchoolDto,
  updateRnSchoolDto,
} from '@/types/school';

import { NextRequest, NextResponse } from 'next/server';
import {
  getSchoolBySchoolNo,
  updateRnSchool,
  deleteRnSchool,
} from '@/services/areas/[area]/schools/[schoolNo]/[schoolNo].service';
// import { checkPermissionMiddleware } from '@/middleware/permission.middleware';
import { handleError, handleZodError } from '@/utils/error.utils';
import { getCommonContext } from '@/utils/context.utils';
import { z } from 'zod';

const updateSchoolSchema = z.object({
  sname: z.string().min(1, '학교 이름은 필수입니다.'),
  scode: z.string().min(1, '학교 코드는 필수입니다.'),
  area: z.string().min(1, '지역은 필수입니다.'),
  administrationCode: z.string().min(1, '행정코드는 필수입니다.'),
});

/**
 * 지역 학교 정보
 */
export async function GET(request: NextRequest, { params }: { params: Promise<SchoolDto> }) {
  try {
    const resolvedParams = await params;
    const schoolNoNum = Number(resolvedParams.schoolNo);

    // 테스트를 위해 권한 체크 주석 처리
    // const permissionError = await checkPermissionMiddleware(request, {
    //   params: Promise.resolve({ schoolNo: schoolNoNum, area: resolvedParams.area }),
    // });

    // if (permissionError) return permissionError;

    const context = await getCommonContext(request);
    const school = await getSchoolBySchoolNo(schoolNoNum, context);

    return NextResponse.json(
      {
        success: true,
        message: '학교 정보를 성공적으로 조회했습니다.',
        data: school,
      } satisfies SchoolApiResponse,
      { status: 200 },
    );
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, 'GET');
  }
}

/**
 * 지역 학교 수정
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<SchoolDto> }) {
  try {
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

    const context = await getCommonContext(request);
    await updateRnSchool(dto, context);

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
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, 'PUT');
  }
}

/**
 * 지역 학교 삭제
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<SchoolDto> }) {
  try {
    const resolvedParams = await params;
    const schoolNoNum = Number(resolvedParams.schoolNo);
    const dto: School = {
      schoolNo: schoolNoNum,
    } as School;

    const context = await getCommonContext(request);
    await deleteRnSchool(dto, context);

    return NextResponse.json(
      {
        success: true,
        message: '학교가 성공적으로 삭제되었습니다.',
      } satisfies BaseApiResponse,
      { status: 200 },
    );
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, 'DELETE');
  }
}

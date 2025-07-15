import { NextRequest, NextResponse } from 'next/server';
import { getCommonContext } from '@/utils/context.utils';
import { handleError, handleZodError } from '@/utils/error.utils';
import { AppError } from '@/utils/error.utils';
import { getPermissionsS, createPermissionS } from '@/services/permission-admin/permission.service';
import {
  createPermissionRequestSchema,
  permissionListRequestSchema,
  permissionListApiResponseSchema,
  permissionCreateApiResponseSchema,
  CreatePermissionDto,
} from '@/types/permission/permission';
import { paginationSchema } from '@/types/common';

/**
 * 권한 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const context = await getCommonContext(request);

    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const name = searchParams.get('name') || undefined;

    // 페이지네이션 검증
    const pagination = paginationSchema.parse({ page, pageSize });

    // 필터 검증
    const filters = permissionListRequestSchema.parse({
      name: name || undefined,
    });

    const result = await getPermissionsS(pagination, context, filters);

    return NextResponse.json(
      permissionListApiResponseSchema.parse({
        success: true,
        data: result,
        message: '권한 목록을 조회했습니다.',
      }),
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          code: error.code,
        },
        { status: error.statusCode },
      );
    }
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '권한 목록 조회');
  }
}

/**
 * 권한 생성
 */
export async function POST(request: NextRequest) {
  try {
    const context = await getCommonContext(request);

    const body = await request.json();
    const validatedData = createPermissionRequestSchema.parse(body);

    const dto: CreatePermissionDto = {
      name: validatedData.name,
      description: validatedData.description,
      defaultExtraCondition: validatedData.defaultExtraCondition,
      defaultExtraLimit: validatedData.defaultExtraLimit,
    };

    const result = await createPermissionS(dto, context);

    return NextResponse.json(
      permissionCreateApiResponseSchema.parse({
        success: true,
        data: result,
        message: '권한이 성공적으로 생성되었습니다.',
      }),
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.statusCode },
      );
    }
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return NextResponse.json(
      {
        success: false,
        message: '권한 생성 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}

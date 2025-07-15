import { NextRequest, NextResponse } from 'next/server';
import { getCommonContext } from '@/utils/context.utils';
import {
  PermissionRouteParams,
  permissionCreateOrUpdateApiResponseSchema,
  permissionDeleteResponseSchema,
  UpdatePermissionDto,
  createPermissionDtoSchema,
} from '@/types/permission/permission';
import { handleError, handleZodError } from '@/utils/error.utils';
import { AppError } from '@/utils/error.utils';
import { updatePermissionS, deletePermissionS, getPermissionS } from '@/services/permission-admin/permission.service';

/**
 * 권한 조회
 */
export async function GET(request: NextRequest, context: PermissionRouteParams) {
  try {
    const { permissionNo } = await context.params;
    const permissionNoNum = Number(permissionNo);

    const commonContext = await getCommonContext(request);

    const result = await getPermissionS(permissionNoNum, commonContext);

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: '권한을 조회했습니다.',
      },
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
    return handleError(error, '권한 조회');
  }
}

/**
 * 권한 수정
 */
export async function PUT(request: NextRequest, context: PermissionRouteParams) {
  try {
    const { permissionNo } = await context.params;
    const permissionNoNum = Number(permissionNo);
    const body = await request.json();

    const commonContext = await getCommonContext(request);

    // 요청 데이터 검증
    const validatedData = createPermissionDtoSchema.parse(body);

    const dto: UpdatePermissionDto = {
      permissionNo: permissionNoNum,
      name: validatedData.name,
      description: validatedData.description,
      defaultExtraCondition: validatedData.defaultExtraCondition,
      defaultExtraLimit: validatedData.defaultExtraLimit,
    };

    const result = await updatePermissionS(dto, commonContext);

    return NextResponse.json(
      permissionCreateOrUpdateApiResponseSchema.parse({
        success: true,
        data: result,
        message: '권한이 성공적으로 수정되었습니다.',
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
    return handleError(error, '권한 수정');
  }
}

/**
 * 권한 삭제
 */
export async function DELETE(request: NextRequest, context: PermissionRouteParams) {
  try {
    const { permissionNo } = await context.params;
    const permissionNoNum = Number(permissionNo);

    const commonContext = await getCommonContext(request);

    await deletePermissionS(permissionNoNum, commonContext);

    return NextResponse.json(
      permissionDeleteResponseSchema.parse({
        success: true,
        message: '권한이 성공적으로 삭제되었습니다.',
        data: {
          permissionNo: permissionNoNum,
        },
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
    return handleError(error, '권한 삭제');
  }
}

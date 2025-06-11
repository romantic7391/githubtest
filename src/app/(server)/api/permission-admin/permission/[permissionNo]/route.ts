import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import {
  Permission,
  PermissionRouteParams,
  permissionCreateOrUpdateApiResponseSchema,
  permissionUpdateRequestSchema,
  permissionDeleteResponseSchema,
} from '@/types/permission';
import { handleError, handleZodError } from '@/utils/error.utils';
import { updatePermissionS, deletePermissionS } from '@/services/permission-admin/permission.service';

/**
 * 권한 수정
 */
export async function PUT(request: NextRequest, context: PermissionRouteParams) {
  try {
    const { permissionNo } = await context.params;
    const permissionNoNum = Number(permissionNo);
    const body = await request.json();

    // 개발 환경에서 테스트를 위해 헤더 설정
    if (process.env.WORKING_ON_BACKEND_DEVELOPMENT === '1') {
      request.headers.set('x-manager-no', '1');
    }

    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: '인증되지 않은 요청입니다.',
        },
        { status: 401 },
      );
    }

    // 요청 데이터 검증
    const validatedData = permissionUpdateRequestSchema.parse(body);

    const permissionData: Permission = {
      permission_no: permissionNoNum,
      name: validatedData.name,
      description: validatedData.description,
      default_extra_condition: validatedData.defaultExtraCondition,
      default_extra_limit: validatedData.defaultExtraLimit,
    };

    const result = await updatePermissionS(permissionData, {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });

    return NextResponse.json(
      permissionCreateOrUpdateApiResponseSchema.parse({
        success: true,
        data: result,
        message: '권한이 성공적으로 수정되었습니다.',
      }),
      { status: 200 },
    );
  } catch (error) {
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

    // 개발 환경에서 테스트를 위해 헤더 설정
    if (process.env.WORKING_ON_BACKEND_DEVELOPMENT === '1') {
      request.headers.set('x-manager-no', '1');
    }

    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: '인증되지 않은 요청입니다.',
        },
        { status: 401 },
      );
    }

    await deletePermissionS(permissionNoNum, {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });

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
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '권한 삭제');
  }
}

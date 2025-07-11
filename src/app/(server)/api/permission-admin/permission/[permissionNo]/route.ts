import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDevSession } from '@/lib/auth/session';
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
 * 세션 정보 가져오기 (미들웨어와 연동)
 */
async function getSessionInfo(request: NextRequest) {
  // 개발 환경에서는 미들웨어에서 설정한 세션 사용
  if (process.env.WORKING_ON_BACKEND_DEVELOPMENT === '1') {
    const devSession = getDevSession(request);
    if (devSession) {
      return devSession;
    }
  }

  // 프로덕션 환경에서는 NextAuth 세션 사용
  return await auth();
}

/**
 * 권한 조회
 */
export async function GET(request: NextRequest, context: PermissionRouteParams) {
  try {
    const { permissionNo } = await context.params;
    const permissionNoNum = Number(permissionNo);

    const session = await getSessionInfo(request);
    if (!session?.user?.managerNo) {
      return NextResponse.json(
        {
          success: false,
          message: '인증되지 않은 요청입니다.',
        },
        { status: 401 },
      );
    }

    const result = await getPermissionS(permissionNoNum, {
      managerNo: session.user.managerNo,
      ip: request.headers.get('x-forwarded-for') || '',
      userAgent: request.headers.get('user-agent') || '',
      schoolNo: session.user.schoolNo || 0,
    });

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

    const session = await getSessionInfo(request);
    if (!session?.user?.managerNo) {
      return NextResponse.json(
        {
          success: false,
          message: '인증되지 않은 요청입니다.',
        },
        { status: 401 },
      );
    }

    // 요청 데이터 검증
    const validatedData = createPermissionDtoSchema.parse(body);

    const dto: UpdatePermissionDto = {
      permissionNo: permissionNoNum,
      name: validatedData.name,
      description: validatedData.description,
      defaultExtraCondition: validatedData.defaultExtraCondition,
      defaultExtraLimit: validatedData.defaultExtraLimit,
    };

    const result = await updatePermissionS(dto, {
      managerNo: session.user.managerNo,
      ip: request.headers.get('x-forwarded-for') || '',
      userAgent: request.headers.get('user-agent') || '',
      schoolNo: session.user.schoolNo || 0,
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

    const session = await getSessionInfo(request);
    if (!session?.user?.managerNo) {
      return NextResponse.json(
        {
          success: false,
          message: '인증되지 않은 요청입니다.',
        },
        { status: 401 },
      );
    }

    await deletePermissionS(permissionNoNum, {
      managerNo: session.user.managerNo,
      ip: request.headers.get('x-forwarded-for') || '',
      userAgent: request.headers.get('user-agent') || '',
      schoolNo: session.user.schoolNo || 0,
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

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDevSession } from '@/lib/auth/session';
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
 * 권한 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionInfo(request);

    if (!session?.user?.managerNo) {
      return NextResponse.json({ success: false, message: '인증되지 않은 요청입니다.' }, { status: 401 });
    }

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

    const result = await getPermissionsS(
      pagination,
      {
        managerNo: session.user.managerNo,
        ip: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
        schoolNo: session.user.schoolNo || 0,
      },
      filters,
    );

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
    const session = await getSessionInfo(request);
    if (!session?.user?.managerNo) {
      return NextResponse.json({ success: false, message: '인증되지 않은 요청입니다.' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createPermissionRequestSchema.parse(body);

    const dto: CreatePermissionDto = {
      name: validatedData.name,
      description: validatedData.description,
      defaultExtraCondition: validatedData.defaultExtraCondition,
      defaultExtraLimit: validatedData.defaultExtraLimit,
    };

    const result = await createPermissionS(dto, {
      managerNo: session.user.managerNo,
      ip: request.headers.get('x-forwarded-for') || '',
      userAgent: request.headers.get('user-agent') || '',
      schoolNo: session.user.schoolNo || 0,
    });

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

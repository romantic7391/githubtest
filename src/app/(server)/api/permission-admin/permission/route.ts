import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { Permission } from '@/types/permission';
import { handleError, handleZodError } from '@/utils/error.utils';
import { getPermissionsS, createPermissionS } from '@/services/permission-admin/permission.service';
import {
  createPermissionRequestSchema,
  permissionListRequestSchema,
  permissionListApiResponseSchema,
  permissionCreateApiResponseSchema,
} from '@/types/permission';
import { paginationSchema } from '@/types/common';

/**
 * 권한 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ success: false, message: '인증되지 않은 요청입니다.' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const name = searchParams.get('name') || undefined;

    const validatedData = permissionListRequestSchema.parse({
      page,
      pageSize,
      name: name || undefined,
    });

    const pagination = paginationSchema.parse({
      page: validatedData.page,
      pageSize: validatedData.pageSize,
    });

    const result = await getPermissionsS(
      pagination,
      {
        manager_no: session.manager_no,
        ip: request.headers.get('x-forwarded-for') || '',
        user_agent: request.headers.get('user-agent') || '',
      },
      { name: validatedData.name },
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
    // 개발 환경에서 테스트를 위해 헤더 설정
    if (process.env.WORKING_ON_BACKEND_DEVELOPMENT === '1') {
      request.headers.set('x-manager-no', '1');
    }

    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ success: false, message: '인증되지 않은 요청입니다.' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createPermissionRequestSchema.parse(body);

    const permissionData: Permission = {
      ...validatedData,
      permission_no: 0,
    };

    const result = await createPermissionS(permissionData, {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });

    return NextResponse.json(
      permissionCreateApiResponseSchema.parse({
        success: true,
        data: result,
        message: '권한이 성공적으로 생성되었습니다.',
      }),
      { status: 200 },
    );
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '권한 생성');
  }
}

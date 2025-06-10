import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { Permission } from '@/types/permission';
import { handleError, handleZodError } from '@/utils/error.utils';
import { getPermissionS, createPermissionS } from '@/services/permission-admin/permission.service';
import { permissionCreateOrUpdateApiResponseSchema, createPermissionSchema } from '@/types/permission';

/**
 * 권한 정보 조회
 */
export async function GET(request: NextRequest, { params }: { params: { permissionNo: string } }) {
  try {
    const permissionNo = Number(params.permissionNo);

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

    const result = await getPermissionS(permissionNo, {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });

    return NextResponse.json(
      permissionCreateOrUpdateApiResponseSchema.parse({
        success: true,
        data: result,
        message: '권한이 성공적으로 조회되었습니다.',
      }),
      { status: 200 },
    );
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '권한 조회');
  }
}

/**
 * 권한 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createPermissionSchema.parse(body);

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

    // 개발 환경에서 테스트를 위해 헤더 설정
    if (process.env.WORKING_ON_BACKEND_DEVELOPMENT === '1') {
      request.headers.set('x-manager-no', '1');
    }

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
      permissionCreateOrUpdateApiResponseSchema.parse({
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

import { NextRequest, NextResponse } from 'next/server';
import {
  createGroupPermissionS,
  updateGroupPermissionS,
  deleteGroupPermissionS,
  getGroupPermissionsS,
} from '@/services/permission-admin/group-permission.service';
import { getSession } from '@/lib/auth/session';
import { handleZodError, handleError } from '@/utils/error.utils';
import {
  createGroupPermissionSchema,
  updateGroupPermissionSchema,
  groupPermissionCreateOrUpdateApiResponseSchema,
  groupPermissionSchema,
  groupPermissionsApiResponseSchema,
  groupPermissionFilterSchema,
} from '@/types/permission';
import { paginationSchema } from '@/types/common';

/**
 * 그룹 권한 조회
 */
export async function GET(request: NextRequest) {
  try {
    console.log('=== Group Permission GET API Start ===');

    if (process.env.WORKING_ON_BACKEND_DEVELOPMENT === '1') {
      request.headers.set('x-manager-no', '1');
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const pageSize = searchParams.get('pageSize');
    const groupNo = searchParams.get('groupNo');
    const permissionNo = searchParams.get('permissionNo');

    console.log('Request Params:', {
      page,
      pageSize,
      groupNo,
      permissionNo,
    });

    // 페이지네이션 파라미터 검증
    const pagination = paginationSchema.parse({
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });

    console.log('Parsed Pagination:', pagination);

    // 필터 파라미터 검증
    const filters = groupPermissionFilterSchema.parse({
      groupNo: groupNo ? Number(groupNo) : undefined,
      permissionNo: permissionNo ? Number(permissionNo) : undefined,
    });

    console.log('Parsed Filters:', filters);

    const session = await getSession(request);
    console.log('Session:', session ? 'Found' : 'Not Found');

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: '인증되지 않은 요청입니다.',
        },
        { status: 401 },
      );
    }

    console.log('Calling getGroupPermissionsS with:', {
      pagination,
      filters,
      meta: {
        manager_no: session.manager_no,
        ip: request.headers.get('x-forwarded-for') || '',
        user_agent: request.headers.get('user-agent') || '',
      },
    });

    const result = await getGroupPermissionsS(pagination, filters, {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });

    console.log('API Result:', result);

    return NextResponse.json(
      groupPermissionsApiResponseSchema.parse({
        success: true,
        message: '그룹 권한 조회 성공',
        status: 200,
        data: result,
      }),
    );
  } catch (error) {
    console.error('Error in Group Permission GET API:', error);
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '그룹 권한 조회');
  }
}

/**
 * 그룹 권한 생성
 */
export async function POST(request: NextRequest) {
  try {
    console.log('=== Group Permission POST API Start ===');
    if (process.env.WORKING_ON_BACKEND_DEVELOPMENT === '1') {
      request.headers.set('x-manager-no', '1');
    }

    const body = await request.json();
    console.log('Request Body:', body);

    const validatedData = createGroupPermissionSchema.parse(body);
    console.log('Validated Data:', validatedData);

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

    const result = await createGroupPermissionS(validatedData, {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });

    return NextResponse.json(
      groupPermissionCreateOrUpdateApiResponseSchema.parse({
        success: true,
        data: {
          groupNo: result.groupNo,
          permissionNo: result.permissionNo,
        },
        message: '그룹 권한이 성공적으로 생성되었습니다.',
      }),
    );
  } catch (error) {
    console.error('Error in Group Permission POST API:', error);
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '그룹 권한 생성');
  }
}

/**
 * 그룹 권한 수정
 */
export async function PUT(request: NextRequest) {
  try {
    console.log('=== Group Permission PUT API Start ===');

    if (process.env.WORKING_ON_BACKEND_DEVELOPMENT === '1') {
      request.headers.set('x-manager-no', '1');
    }

    const body = await request.json();
    console.log('Request Body:', body);

    const validatedData = updateGroupPermissionSchema.parse(body);
    console.log('Validated Data:', validatedData);

    const session = await getSession(request);
    console.log('Session:', session ? 'Found' : 'Not Found');

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: '인증되지 않은 요청입니다.',
        },
        { status: 401 },
      );
    }

    // 서비스 함수에 전달할 데이터 변환
    const groupPermissionData = groupPermissionSchema.parse({
      ...validatedData,
      created: null,
    });
    console.log('Group Permission Data:', groupPermissionData);

    const result = await updateGroupPermissionS(groupPermissionData, {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });
    console.log('Update Result:', result);

    return NextResponse.json(
      groupPermissionCreateOrUpdateApiResponseSchema.parse({
        success: true,
        message: '그룹 권한 수정 성공',
        status: 200,
        data: {
          groupNo: groupPermissionData.groupNo,
          permissionNo: groupPermissionData.permissionNo,
        },
      }),
    );
  } catch (error) {
    console.error('Error in Group Permission PUT API:', error);
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '그룹 권한 수정');
  }
}

/**
 * 그룹 권한 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    console.log('=== Group Permission DELETE API Start ===');

    if (process.env.WORKING_ON_BACKEND_DEVELOPMENT === '1') {
      request.headers.set('x-manager-no', '1');
    }

    let groupNo: string | null = null;
    let permissionNo: string | null = null;

    // body에서 파라미터 확인
    try {
      const body = await request.json();
      groupNo = body.groupNo?.toString() || null;
      permissionNo = body.permissionNo?.toString() || null;
    } catch {
      // body가 없는 경우 query string에서 파라미터 확인
      const { searchParams } = new URL(request.url);
      groupNo = searchParams.get('groupNo');
      permissionNo = searchParams.get('permissionNo');
    }

    console.log('Delete Parameters:', { groupNo, permissionNo });

    if (!groupNo || !permissionNo) {
      return NextResponse.json(
        {
          success: false,
          message: '그룹 번호와 권한 번호는 필수입니다.',
        },
        { status: 400 },
      );
    }

    const session = await getSession(request);
    console.log('Session:', session ? 'Found' : 'Not Found');

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: '인증되지 않은 요청입니다.',
        },
        { status: 401 },
      );
    }

    await deleteGroupPermissionS(Number(groupNo), Number(permissionNo), {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });

    return NextResponse.json(
      groupPermissionCreateOrUpdateApiResponseSchema.parse({
        success: true,
        message: '그룹 권한 삭제 성공',
        status: 200,
        data: {
          groupNo: Number(groupNo),
          permissionNo: Number(permissionNo),
        },
      }),
    );
  } catch (error) {
    console.error('Error in Group Permission DELETE API:', error);
    return handleError(error, '그룹 권한 삭제');
  }
}

import { NextRequest, NextResponse } from 'next/server';
import {
  createGroupPermissionS,
  updateGroupPermissionS,
  deleteGroupPermissionS,
  getGroupPermissionsS,
} from '@/services/permission-admin/group-permission.service';
import { getCommonContext } from '@/utils/context.utils';
import { handleZodError, handleError } from '@/utils/error.utils';
import {
  createGroupPermissionSchema,
  updateGroupPermissionSchema,
  groupPermissionCreateOrUpdateApiResponseSchema,
  groupPermissionsApiResponseSchema,
  groupPermissionFilterSchema,
} from '@/types/permission/group-permission';
import { paginationSchema } from '@/types/common';
import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import { AppError } from '@/utils/error.utils';

/**
 * 그룹 권한 조회
 */
export async function GET(request: NextRequest) {
  try {
    const context = await getCommonContext(request);

    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE;
    const groupNo = searchParams.get('groupNo');
    const permissionNo = searchParams.get('permissionNo');
    const schoolNo = searchParams.get('schoolNo');

    // 페이지네이션 검증
    const pagination = paginationSchema.parse({ page, pageSize });

    // 필터 검증
    const filters = groupPermissionFilterSchema.parse({
      groupNo: groupNo ? Number(groupNo) : undefined,
      permissionNo: permissionNo ? Number(permissionNo) : undefined,
      schoolNo: schoolNo ? Number(schoolNo) : undefined,
    });

    const result = await getGroupPermissionsS(pagination, context, filters);

    return NextResponse.json(
      groupPermissionsApiResponseSchema.parse({
        success: true,
        message: '그룹 권한 조회 성공',
        data: result,
      }),
      { status: 200 },
    );
  } catch (error) {
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
    const context = await getCommonContext(request);

    const body = await request.json();
    const validatedData = createGroupPermissionSchema.parse(body);

    const result = await createGroupPermissionS(validatedData, context);

    return NextResponse.json(
      groupPermissionCreateOrUpdateApiResponseSchema.parse({
        success: true,
        data: {
          groupNo: result.groupNo,
          permissionNo: result.permissionNo,
        },
        message: '그룹 권한이 성공적으로 생성되었습니다.',
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
    return handleError(error, '그룹 권한 생성');
  }
}

/**
 * 그룹 권한 수정
 */
export async function PUT(request: NextRequest) {
  try {
    const context = await getCommonContext(request);

    const body = await request.json();
    const validatedData = updateGroupPermissionSchema.parse(body);

    await updateGroupPermissionS(validatedData, context);

    return NextResponse.json(
      groupPermissionCreateOrUpdateApiResponseSchema.parse({
        success: true,
        message: '그룹 권한이 성공적으로 수정되었습니다.',
        data: {
          groupNo: validatedData.groupNo,
          permissionNo: validatedData.permissionNo,
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
        },
        { status: error.statusCode },
      );
    }
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
    const context = await getCommonContext(request);

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

    // 입력값 검증
    const validatedData = groupPermissionFilterSchema.parse({
      groupNo: groupNo ? Number(groupNo) : undefined,
      permissionNo: permissionNo ? Number(permissionNo) : undefined,
    });

    if (!validatedData.groupNo || !validatedData.permissionNo) {
      return NextResponse.json(
        {
          success: false,
          message: '그룹 번호와 권한 번호는 필수입니다.',
        },
        { status: 400 },
      );
    }

    await deleteGroupPermissionS(validatedData.groupNo, validatedData.permissionNo, context);

    return NextResponse.json(
      groupPermissionCreateOrUpdateApiResponseSchema.parse({
        success: true,
        message: '그룹 권한이 성공적으로 삭제되었습니다.',
        data: {
          groupNo: validatedData.groupNo,
          permissionNo: validatedData.permissionNo,
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
        },
        { status: error.statusCode },
      );
    }
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '그룹 권한 삭제');
  }
}

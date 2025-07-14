import { NextRequest, NextResponse } from 'next/server';
import { getCommonContext } from '@/utils/context.utils';
import {
  CreateGroup,
  groupFilterSchema,
  groupCreateOrUpdateApiResponseSchema,
  createGroupSchema,
} from '@/types/permission/group';
import { handleError, handleZodError } from '@/utils/error.utils';
import { getGroupsS, createGroupS } from '@/services/permission-admin/group.service';
import { AppError } from '@/utils/error.utils';
import { paginationSchema } from '@/types/common';

/**
 * 그룹 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const context = await getCommonContext(request);

    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const name = searchParams.get('name') || undefined;
    const schoolNo = searchParams.get('schoolNo');

    // 페이지네이션 검증
    const pagination = paginationSchema.parse({ page, pageSize });

    // 필터 검증
    const filters = groupFilterSchema.parse({
      name,
      schoolNo: schoolNo ? Number(schoolNo) : undefined,
    });

    const result = await getGroupsS(pagination, context, filters);

    console.log('그룹 목록 조회 결과:', {
      total: result.pagination.total,
      totalPages: result.pagination.totalPages,
      items: result.groups.length,
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: '그룹 목록을 조회했습니다.',
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
    return handleError(error, '그룹 목록 조회');
  }
}

/**
 * 그룹 생성
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[POST] 그룹 생성 시작');

    const context = await getCommonContext(request);

    const body = await request.json();

    const validatedData = createGroupSchema.parse(body);

    const groupData: CreateGroup = {
      name: validatedData.name,
      schoolNo: validatedData.schoolNo,
      parentGroupNo: validatedData.parentGroupNo,
    };

    const result = await createGroupS(groupData, context);

    // 응답 데이터 검증
    const response = groupCreateOrUpdateApiResponseSchema.parse({
      success: true,
      data: result,
      message: '그룹이 성공적으로 생성되었습니다.',
    });
    console.log('[POST] response:', response);

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('[POST] 에러 발생:', error);

    // AppError를 먼저 체크
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.statusCode },
      );
    }

    // 그 다음 ZodError 체크
    const zodError = handleZodError(error);
    if (zodError) return zodError;

    // 예상치 못한 에러
    console.error('[POST] 예상치 못한 에러 발생:', error);
    return NextResponse.json(
      {
        success: false,
        message: '그룹 생성 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}

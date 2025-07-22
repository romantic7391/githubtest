import { NextRequest, NextResponse } from 'next/server';
import {
  createManagerGroupS,
  updateManagerGroupS,
  deleteManagerGroupS,
  getManagerGroupsS,
} from '@/services/permission-admin/manager-group.service';
import { getCommonContext } from '@/utils/context.utils';
import { handleError, handleZodError } from '@/utils/error.utils';
import { paginationSchema } from '@/types/common';
import {
  createManagerGroupSchema,
  updateManagerGroupSchema,
  managerGroupSchema,
  managerGroupCreateOrUpdateApiResponseSchema,
  managerGroupListRequestSchema,
  managerGroupsApiResponseSchema,
} from '@/types/permission/manager-group';
import { AppError } from '@/utils/error.utils';
import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';

/**
 * 관리자 그룹 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const context = await getCommonContext(request);

    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE;
    const groupNo = searchParams.get('groupNo');
    const schoolNo = searchParams.get('schoolNo');
    const managerNo = searchParams.get('managerNo');

    // 페이지네이션 검증
    const pagination = paginationSchema.parse({ page, pageSize });

    // 필터 검증
    const filters = managerGroupListRequestSchema.parse({
      groupNo: groupNo ? Number(groupNo) : undefined,
      schoolNo: schoolNo ? Number(schoolNo) : undefined,
      managerNo: managerNo ? Number(managerNo) : undefined,
    });

    const result = await getManagerGroupsS(context.managerNo, pagination, context, filters);

    return NextResponse.json(
      managerGroupsApiResponseSchema.parse({
        success: true,
        message: '관리자 그룹 목록을 조회했습니다.',
        data: result,
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
    return handleError(error, '관리자 그룹 목록 조회');
  }
}

/**
 * 관리자 그룹 생성
 */
export async function POST(request: NextRequest) {
  try {
    const context = await getCommonContext(request);

    const body = await request.json();
    const validatedData = createManagerGroupSchema.parse(body);

    // 서비스 함수에 전달할 데이터 변환
    const managerGroupData = managerGroupSchema.parse({
      managerNo: validatedData.managerNo,
      groupNo: validatedData.groupNo,
    });

    const result = await createManagerGroupS(managerGroupData, context);

    return NextResponse.json(
      managerGroupCreateOrUpdateApiResponseSchema.parse({
        success: true,
        message: '관리자 그룹이 성공적으로 생성되었습니다.',
        data: result,
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
    return handleError(error, '관리자 그룹 생성');
  }
}

/**
 * 관리자 그룹 수정
 */
export async function PUT(request: NextRequest) {
  try {
    const context = await getCommonContext(request);

    const body = await request.json();
    const validatedData = updateManagerGroupSchema.parse(body);

    // 서비스 함수에 전달할 데이터 변환
    const managerGroupData = managerGroupSchema.parse({
      managerNo: validatedData.managerNo,
      groupNo: validatedData.groupNo,
    });

    const result = await updateManagerGroupS(
      managerGroupData,
      validatedData.originalNo,
      validatedData.originalGroupNo,
      context,
    );

    return NextResponse.json(
      managerGroupCreateOrUpdateApiResponseSchema.parse({
        success: true,
        message: '관리자 그룹이 성공적으로 수정되었습니다.',
        data: result,
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
    return handleError(error, '관리자 그룹 수정');
  }
}

/**
 * 관리자 그룹 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    const context = await getCommonContext(request);

    let managerNo: string | null = null;
    let groupNo: string | null = null;

    // body에서 파라미터 확인
    try {
      const body = await request.json();
      managerNo = body.managerNo?.toString() || null;
      groupNo = body.groupNo?.toString() || null;
    } catch {
      // body가 없는 경우 query string에서 파라미터 확인
      const { searchParams } = new URL(request.url);
      managerNo = searchParams.get('managerNo');
      groupNo = searchParams.get('groupNo');
    }

    if (!managerNo || !groupNo) {
      return NextResponse.json(
        {
          success: false,
          message: '관리자 번호와 그룹 번호는 필수입니다.',
        },
        { status: 400 },
      );
    }

    await deleteManagerGroupS(Number(managerNo), Number(groupNo), context);

    return NextResponse.json(
      managerGroupCreateOrUpdateApiResponseSchema.parse({
        success: true,
        message: '관리자 그룹이 성공적으로 삭제되었습니다.',
        data: {
          groupNo: Number(groupNo),
          managerNo: Number(managerNo),
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
    return handleError(error, '관리자 그룹 삭제');
  }
}

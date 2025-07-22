import { NextRequest, NextResponse } from 'next/server';
import {
  CreateGroup,
  groupFilterSchema,
  groupCreateOrUpdateApiResponseSchema,
  createGroupSchema,
} from '@/types/permission/group';
import { getGroupsS, createGroupS } from '@/services/permission-admin/group.service';
import { paginationSchema } from '@/types/common';
import { withPermissionCheck } from '@/utils/api-wrapper.utils';
import { CommonContext } from '@/types/api-wrapper';

/**
 * 그룹 목록 조회
 */
export const GET = withPermissionCheck(async (request: NextRequest, commonContext: CommonContext) => {
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

  const result = await getGroupsS(pagination, commonContext, filters);

  return NextResponse.json(
    {
      success: true,
      data: result,
      message: '그룹 목록을 조회했습니다.',
    },
    { status: 200 },
  );
});

/**
 * 그룹 생성
 */
export const POST = withPermissionCheck(async (request: NextRequest, commonContext: CommonContext) => {
  const body = await request.json();

  const validatedData = createGroupSchema.parse(body);

  const groupData: CreateGroup = {
    name: validatedData.name,
    schoolNo: validatedData.schoolNo,
    parentGroupNo: validatedData.parentGroupNo,
  };

  const result = await createGroupS(groupData, commonContext);

  // 응답 데이터 검증
  const response = groupCreateOrUpdateApiResponseSchema.parse({
    success: true,
    data: result,
    message: '그룹이 성공적으로 생성되었습니다.',
  });

  return NextResponse.json(response, { status: 201 });
});

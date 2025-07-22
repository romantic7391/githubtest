import { NextRequest, NextResponse } from 'next/server';
import { getPermissionsS, createPermissionS } from '@/services/permission-admin/permission.service';
import {
  createPermissionRequestSchema,
  permissionListRequestSchema,
  permissionListApiResponseSchema,
  permissionCreateApiResponseSchema,
  CreatePermissionDto,
} from '@/types/permission/permission';
import { paginationSchema } from '@/types/common';
import { withPermissionCheck } from '@/utils/api-wrapper.utils';
import { CommonContext } from '@/types/api-wrapper';

/**
 * 권한 목록 조회
 */
export const GET = withPermissionCheck(async (request: NextRequest, commonContext: CommonContext) => {
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

  const result = await getPermissionsS(pagination, commonContext, filters);

  return NextResponse.json(
    permissionListApiResponseSchema.parse({
      success: true,
      data: result,
      message: '권한 목록을 조회했습니다.',
    }),
    { status: 200 },
  );
});

/**
 * 권한 생성
 */
export const POST = withPermissionCheck(async (request: NextRequest, commonContext: CommonContext) => {
  const body = await request.json();
  const validatedData = createPermissionRequestSchema.parse(body);

  const dto: CreatePermissionDto = {
    name: validatedData.name,
    description: validatedData.description,
    defaultExtraCondition: validatedData.defaultExtraCondition,
    defaultExtraLimit: validatedData.defaultExtraLimit,
  };

  const result = await createPermissionS(dto, commonContext);

  return NextResponse.json(
    permissionCreateApiResponseSchema.parse({
      success: true,
      data: result,
      message: '권한이 성공적으로 생성되었습니다.',
    }),
    { status: 201 },
  );
});

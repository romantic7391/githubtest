import { NextRequest, NextResponse } from 'next/server';
import {
  permissionCreateOrUpdateApiResponseSchema,
  permissionDeleteResponseSchema,
  UpdatePermissionDto,
  createPermissionDtoSchema,
} from '@/types/permission/permission';
import { updatePermissionS, deletePermissionS, getPermissionS } from '@/services/permission-admin/permission.service';
import { withPermissionCheck } from '@/utils/api-wrapper.utils';
import { CommonContext, PermissionParams } from '@/types/api-wrapper';

/**
 * 권한 조회
 */
export const GET = withPermissionCheck<PermissionParams>(
  async (request: NextRequest, { params }, commonContext: CommonContext) => {
    const resolvedParams = await params;
    const { permissionNo } = resolvedParams;
    const permissionNoNum = Number(permissionNo);

    const result = await getPermissionS(permissionNoNum, commonContext);

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: '권한을 조회했습니다.',
      },
      { status: 200 },
    );
  },
);

/**
 * 권한 수정
 */
export const PUT = withPermissionCheck<PermissionParams>(
  async (request: NextRequest, { params }, commonContext: CommonContext) => {
    const resolvedParams = await params;
    const { permissionNo } = resolvedParams;
    const permissionNoNum = Number(permissionNo);
    const body = await request.json();

    // 요청 데이터 검증
    const validatedData = createPermissionDtoSchema.parse(body);

    const dto: UpdatePermissionDto = {
      permissionNo: permissionNoNum,
      name: validatedData.name,
      description: validatedData.description,
      defaultExtraCondition: validatedData.defaultExtraCondition,
      defaultExtraLimit: validatedData.defaultExtraLimit,
    };

    const result = await updatePermissionS(dto, commonContext);

    return NextResponse.json(
      permissionCreateOrUpdateApiResponseSchema.parse({
        success: true,
        data: result,
        message: '권한이 성공적으로 수정되었습니다.',
      }),
      { status: 200 },
    );
  },
);

/**
 * 권한 삭제
 */
export const DELETE = withPermissionCheck<PermissionParams>(
  async (request: NextRequest, { params }, commonContext: CommonContext) => {
    const resolvedParams = await params;
    const { permissionNo } = resolvedParams;
    const permissionNoNum = Number(permissionNo);

    await deletePermissionS(permissionNoNum, commonContext);

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
  },
);

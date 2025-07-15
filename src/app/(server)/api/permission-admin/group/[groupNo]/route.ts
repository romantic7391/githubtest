// import type { BaseApiResponse } from '@/types/common';
import { NextRequest, NextResponse } from 'next/server';
import { updateGroupS, deleteGroupS, getGroupS } from '@/services/permission-admin/group.service';
import { getCommonContext } from '@/utils/context.utils';
import { handleZodError, handleError } from '@/utils/error.utils';
import {
  Group,
  GroupRouteParams,
  groupUpdateRequestSchema,
  groupCreateOrUpdateApiResponseSchema,
  groupDeleteApiResponseSchema,
  groupApiResponseSchema,
  FindGroupDto,
} from '@/types/permission/group';
// import {updateGroupSchema,groupCreateOrUpdateApiResponseSchema ,RouteParams} from '@/types/permission'
import { AppError } from '@/utils/error.utils';
import { findGroup } from '@/models/group/group-model';

/**
 * 특정 그룹 조회
 */
export async function GET(request: NextRequest, context: GroupRouteParams) {
  try {
    const { groupNo } = await context.params;
    const groupNoNum = Number(groupNo);

    const commonContext = await getCommonContext(request);

    // 그룹 정보 조회 (서비스 함수 사용)
    const group = await getGroupS(groupNoNum, commonContext);

    return NextResponse.json(
      groupApiResponseSchema.parse({
        success: true,
        data: group,
        message: '그룹을 조회했습니다.',
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
    return handleError(error, '그룹 조회');
  }
}

/**
 * 그룹 수정
 */
export async function PUT(request: NextRequest, context: GroupRouteParams) {
  try {
    const { groupNo } = await context.params;
    const groupNoNum = Number(groupNo);
    const body = await request.json();

    const commonContext = await getCommonContext(request);

    // 요청 데이터 검증
    const validatedData = groupUpdateRequestSchema.parse(body);

    // 기존 그룹 정보 조회
    const findDto: FindGroupDto = {
      groupNo: groupNoNum,
    };
    const existingGroup = await findGroup(findDto);
    if (!existingGroup) {
      throw new AppError('존재하지 않는 그룹입니다.', 404);
    }

    const groupData: Group = {
      groupNo: groupNoNum,
      name: validatedData.name ?? existingGroup.name,
      schoolNo: validatedData.schoolNo ?? existingGroup.schoolNo,
      parentGroupNo: validatedData.parentGroupNo ?? existingGroup.parentGroupNo,
      schoolName: existingGroup.schoolName,
      parentGroupName: existingGroup.parentGroupName,
    };

    const result = await updateGroupS(groupData, commonContext);

    // 응답 데이터 검증
    return NextResponse.json(
      groupCreateOrUpdateApiResponseSchema.parse({
        success: true,
        data: result,
        message: '그룹이 성공적으로 수정되었습니다.',
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
    return handleError(error, '그룹 수정');
  }
}

/**
 * 그룹 삭제
 */
export async function DELETE(request: NextRequest, context: GroupRouteParams) {
  try {
    const { groupNo } = await context.params;
    const groupNoNum = Number(groupNo);

    const commonContext = await getCommonContext(request);

    // 1. 그룹 존재 여부 확인

    await deleteGroupS(groupNoNum, commonContext);

    return NextResponse.json(
      groupDeleteApiResponseSchema.parse({
        success: true,
        data: { groupNo: groupNoNum },
        message: '그룹이 성공적으로 삭제되었습니다.',
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
    return handleError(error, '그룹 삭제');
  }
}

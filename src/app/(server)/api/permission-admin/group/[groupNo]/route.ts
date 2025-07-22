// import type { BaseApiResponse } from '@/types/common';
import { NextRequest, NextResponse } from 'next/server';
import { updateGroupS, deleteGroupS, getGroupS } from '@/services/permission-admin/group.service';
import {
  Group,
  groupUpdateRequestSchema,
  groupCreateOrUpdateApiResponseSchema,
  groupDeleteApiResponseSchema,
  groupApiResponseSchema,
  FindGroupDto,
} from '@/types/permission/group';
import { withPermissionCheck } from '@/utils/api-wrapper.utils';
import { CommonContext, PermissionParams } from '@/types/api-wrapper';
import { findGroup } from '@/models/group/group-model';

// 그룹 번호 파라미터 타입 정의
interface GroupNoParams extends PermissionParams {
  groupNo: string;
}

/**
 * 특정 그룹 조회
 */
export const GET = withPermissionCheck<GroupNoParams>(
  async (request: NextRequest, { params }, commonContext: CommonContext) => {
    const resolvedParams = await params;
    const { groupNo } = resolvedParams;
    const groupNoNum = Number(groupNo);

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
  },
);

/**
 * 그룹 수정
 */
export const PUT = withPermissionCheck<GroupNoParams>(
  async (request: NextRequest, { params }, commonContext: CommonContext) => {
    const resolvedParams = await params;
    const { groupNo } = resolvedParams;
    const groupNoNum = Number(groupNo);
    const body = await request.json();

    // 요청 데이터 검증
    const validatedData = groupUpdateRequestSchema.parse(body);

    // 기존 그룹 정보 조회
    const findDto: FindGroupDto = {
      groupNo: groupNoNum,
    };
    const existingGroup = await findGroup(findDto);
    if (!existingGroup) {
      throw new Error('존재하지 않는 그룹입니다.');
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
  },
);

/**
 * 그룹 삭제
 */
export const DELETE = withPermissionCheck<GroupNoParams>(
  async (request: NextRequest, { params }, commonContext: CommonContext) => {
    const resolvedParams = await params;
    const { groupNo } = resolvedParams;
    const groupNoNum = Number(groupNo);

    await deleteGroupS(groupNoNum, commonContext);

    return NextResponse.json(
      groupDeleteApiResponseSchema.parse({
        success: true,
        data: { groupNo: groupNoNum },
        message: '그룹이 성공적으로 삭제되었습니다.',
      }),
      { status: 200 },
    );
  },
);

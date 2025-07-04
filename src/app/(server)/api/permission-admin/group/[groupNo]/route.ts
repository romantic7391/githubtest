// import type { BaseApiResponse } from '@/types/common';
import { NextRequest, NextResponse } from 'next/server';
import { updateGroupS, deleteGroupS } from '@/services/permission-admin/group.service';
import { getSession } from '@/lib/auth/session';
import { handleZodError, handleError } from '@/utils/error.utils';
import {
  Group,
  GroupRouteParams,
  groupUpdateRequestSchema,
  groupCreateOrUpdateApiResponseSchema,
  groupDeleteApiResponseSchema,
  FindGroupDto,
} from '@/types/permission/group';
// import {updateGroupSchema,groupCreateOrUpdateApiResponseSchema ,RouteParams} from '@/types/permission'
import { AppError } from '@/utils/error.utils';
import { findGroup } from '@/models/group/group-model';

/**
 * 그룹 수정
 */
export async function PUT(request: NextRequest, context: GroupRouteParams) {
  try {
    const { groupNo } = await context.params;
    const groupNoNum = Number(groupNo);
    const body = await request.json();

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

    const result = await updateGroupS(groupData, {
      managerNo: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      userAgent: request.headers.get('user-agent') || '',
      schoolNo: 0,
    });

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

    // 1. 그룹 존재 여부 확인

    await deleteGroupS(groupNoNum, {
      managerNo: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      userAgent: request.headers.get('user-agent') || '',
      schoolNo: 0,
    });

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

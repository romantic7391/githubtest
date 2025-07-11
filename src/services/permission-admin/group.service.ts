import { Group, CreateGroup } from '@/types/permission/group';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { LogMeta } from '@/types/history';
import { Pagination } from '@/types/common';
import { AppError } from '@/utils/error.utils';
import {
  findGroups,
  insertGroup,
  updateGroup,
  deleteGroup,
  checkGroupExists,
  checkGroupDuplicate,
  findGroup,
} from '@/models/group/group-model';
import {
  FindGroupsDto,
  InsertGroupDto,
  UpdateGroupDto,
  DeleteGroupDto,
  CheckGroupExistsDto,
  CheckGroupDuplicateDto,
  FindGroupDto,
} from '@/types/permission/group';

// 그룹 목록 조회
export async function getGroupsS(
  pagination: Pagination,
  meta: LogMeta,
  filters?: { name?: string; schoolNo?: number | null },
) {
  try {
    const dto: FindGroupsDto = {
      pagination,
      filters,
    };

    const result = await findGroups(dto);

    if (result.groups.length === 0) {
      throw new AppError('해당하는 학교에 그룹 목록이 존재하지 않습니다.', 404);
    }

    // 로그 기록
    await logAction(
      makeLogParams({
        schoolNo: meta.schoolNo,
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'S',
        targetTable: 'group',
        targetId: '',
        oldValues: JSON.stringify(result),
        newValues: null,
        reason: `그룹 목록 조회`,
      }),
    );

    return {
      groups: result.groups,
      pagination: {
        ...pagination,
        total: result.total,
        totalPages: Math.ceil(result.total / pagination.pageSize),
      },
    };
  } catch (error) {
    console.error('그룹 목록 조회 중 오류 발생:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('그룹 목록 조회 중 오류가 발생했습니다.', 500);
  }
}

// 그룹 생성
export async function createGroupS(group: CreateGroup, meta: LogMeta): Promise<{ groupNo: number }> {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. 그룹 중복 체크
    const duplicateDto: CheckGroupDuplicateDto = {
      name: group.name,
      schoolNo: group.schoolNo,
    };
    const existingGroupDuplicate = await checkGroupDuplicate(duplicateDto);
    if (existingGroupDuplicate && existingGroupDuplicate.count > 0) {
      throw new AppError('이미 존재하는 그룹입니다.', 409);
    }

    const dto: InsertGroupDto = {
      name: group.name,
      schoolNo: group.schoolNo,
      parentGroupNo: group.parentGroupNo,
    };

    // 1. 그룹 생성
    const result = await insertGroup(dto, conn);

    // 2. 로그 기록
    await logAction(
      makeLogParams({
        schoolNo: meta.schoolNo,
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'I',
        targetTable: 'group',
        targetId: result.insertId.toString(),
        oldValues: null,
        newValues: JSON.stringify(group),
        reason: `그룹 생성: ${group.name}`,
      }),
      conn,
    );

    await commitTransaction(conn);
    return {
      groupNo: result.insertId,
    };
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('그룹 생성 중 오류가 발생했습니다.', 500);
  }
}

// 그룹 수정
export async function updateGroupS(group: Group, meta: LogMeta): Promise<{ groupNo: number }> {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. 기존 그룹 정보 조회
    const findDto: FindGroupDto = {
      groupNo: group.groupNo,
    };
    const existingGroup = await findGroup(findDto);
    if (!existingGroup) {
      throw new AppError('존재하지 않는 그룹입니다.', 404);
    }

    // 3. 다른 그룹과의 중복 체크 (name이나 schoolNo가 변경된 경우에만)
    if (
      (group.name && group.name !== existingGroup.name) ||
      (group.schoolNo !== undefined && group.schoolNo !== existingGroup.schoolNo)
    ) {
      const duplicateDto: CheckGroupDuplicateDto = {
        name: group.name || existingGroup.name,
        schoolNo: group.schoolNo ?? existingGroup.schoolNo,
        groupNo: group.groupNo, // 자기 자신 제외
      };
      const existingGroupDuplicate = await checkGroupDuplicate(duplicateDto);
      if (existingGroupDuplicate && existingGroupDuplicate.count > 0) {
        throw new AppError('이미 존재하는 그룹입니다.', 409);
      }
    }

    // 4. 그룹 수정 (변경된 필드만 업데이트)
    const updateDto: UpdateGroupDto = {
      ...existingGroup,
      ...group, // 변경된 필드만 덮어쓰기
    };
    await updateGroup(updateDto, conn);

    // 5. 로그 기록
    await logAction(
      makeLogParams({
        schoolNo: meta.schoolNo,
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'U',
        targetTable: 'group',
        targetId: group.groupNo.toString(),
        oldValues: JSON.stringify(existingGroup),
        newValues: JSON.stringify(updateDto),
        reason: `그룹 수정: ${group.name || existingGroup.name}`,
      }),
      conn,
    );

    await commitTransaction(conn);
    return { groupNo: group.groupNo };
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    throw error;
  }
}

// 그룹 삭제
export async function deleteGroupS(groupNo: number, meta: LogMeta) {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. 그룹 존재 여부 확인
    const existsDto: CheckGroupExistsDto = {
      groupNo,
    };
    const exists = await checkGroupExists(existsDto);
    if (!exists) {
      throw new AppError('존재하지 않는 그룹입니다.', 404);
    }

    // 2. 그룹 삭제
    const deleteDto: DeleteGroupDto = {
      groupNo,
    };
    await deleteGroup(deleteDto, conn);

    // 3. 로그 기록
    await logAction(
      makeLogParams({
        schoolNo: meta.schoolNo,
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'D',
        targetTable: 'group',
        targetId: groupNo.toString(),
        oldValues: JSON.stringify(exists),
        newValues: null,
        reason: `그룹 삭제: ${groupNo}`,
      }),
      conn,
    );

    await commitTransaction(conn);
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('그룹 삭제 중 오류가 발생했습니다.', 500);
  }
}

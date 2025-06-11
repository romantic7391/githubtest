import { Group } from '@/types/permission';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { LogMeta } from '@/types/history';
import { Pagination } from '@/types/common';
import { AppError } from '@/utils/error.utils';
import { findGroups, insertGroup, updateGroup, deleteGroup, findGroup } from '@/models/group/group-model';

// 그룹 목록 조회
export async function getGroupsS(
  pagination: Pagination,
  meta: LogMeta,
  filters?: { name?: string; schoolNo?: number | null },
) {
  // let conn;
  try {
    const result = await findGroups(pagination, filters);

    // 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'S',
        target_table: 'group',
        target_id: '',
        old_values: null,
        new_values: JSON.stringify(result),
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
    throw new AppError('그룹 목록 조회 중 오류가 발생했습니다.', 500, 'GROUP_LIST_ERROR');
  }
}

// 그룹 생성
export async function createGroupS(group: Omit<Group, 'group_no'>, meta: LogMeta): Promise<{ groupNo: number }> {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. 그룹 생성
    const result = await insertGroup(group, conn);

    // 2. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'I',
        target_table: 'group',
        target_id: result.insertId.toString(),
        old_values: JSON.stringify({}),
        new_values: JSON.stringify(group),
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
    console.error('그룹 생성 중 오류 발생:', error);
    throw new AppError('그룹 생성 중 오류가 발생했습니다.', 500, 'GROUP_CREATE_ERROR');
  } finally {
    if (conn) {
      try {
        await conn.release();
      } catch (error) {
        console.error('트랜잭션 커넥션 해제 중 오류:', error);
      }
    }
  }
}

// 그룹 수정
export async function updateGroupS(group: Group, meta: LogMeta): Promise<{ groupNo: number }> {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. 그룹 존재 여부 확인
    const existingGroup = await findGroup(group.group_no);
    if (!existingGroup) {
      throw new AppError('존재하지 않는 그룹입니다.', 404, 'GROUP_NOT_FOUND');
    }

    // 2. 그룹 수정
    await updateGroup(group, conn);

    // 3. 로그 기록
    await logAction(
      makeLogParams({
        ...meta,
        action_type: 'U',
        target_table: 'group',
        target_id: group.group_no.toString(),
        old_values: JSON.stringify(existingGroup),
        new_values: JSON.stringify(group),
        reason: `그룹 수정: ${group.name}`,
      }),
      conn,
    );

    await commitTransaction(conn);
    return { groupNo: group.group_no };
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    if (error instanceof AppError) {
      throw error;
    }
    console.error('그룹 수정 중 오류 발생:', error);
    throw new AppError('그룹 수정 중 오류가 발생했습니다.', 500, 'GROUP_UPDATE_ERROR');
  } finally {
    if (conn) {
      try {
        await conn.release();
      } catch (error) {
        console.error('트랜잭션 커넥션 해제 중 오류:', error);
      }
    }
  }
}

// 그룹 삭제
export async function deleteGroupS(groupNo: number, meta: LogMeta) {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. 그룹 존재 여부 확인
    const existingGroup = await findGroup(groupNo);
    if (!existingGroup) {
      throw new AppError('존재하지 않는 그룹입니다.', 404, 'GROUP_NOT_FOUND');
    }

    // 2. 그룹 삭제
    await deleteGroup(groupNo, conn);

    // 3. 로그 기록
    await logAction(
      makeLogParams({
        ...meta,
        action_type: 'D',
        target_table: 'group',
        target_id: groupNo.toString(),
        old_values: JSON.stringify(existingGroup),
        new_values: null,
        reason: `그룹 삭제: ${existingGroup.name}`,
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
    console.error('그룹 삭제 중 오류 발생:', error);
    throw new AppError('그룹 삭제 중 오류가 발생했습니다.', 500, 'GROUP_DELETE_ERROR');
  } finally {
    if (conn) {
      try {
        await conn.release();
      } catch (error) {
        console.error('트랜잭션 커넥션 해제 중 오류:', error);
      }
    }
  }
}

import {
  insertManagerGroup,
  findManagerGroups,
  updateManagerGroup,
  deleteManagerGroup,
  findManagerGroup,
} from '@/models/manager-group/manager-group.model';

import { ManagerGroup, ManagerGroupCreateOrUpdateResponse } from '@/types/permission';
import { LogMeta } from '@/types/history';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { Pagination, paginationSchema } from '@/types/common';
import { AppError } from '@/utils/error.utils';

// 관리자 그룹 목록 조회
export async function getManagerGroupsS(managerNo: number, pagination: Pagination, filters?: { groupNo?: number }) {
  try {
    const result = await findManagerGroups(managerNo, pagination, filters);

    return {
      managerGroups: result.managerGroups,
      pagination: paginationSchema.parse({
        page: pagination.page,
        pageSize: pagination.pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / pagination.pageSize),
      }),
    };
  } catch (error) {
    console.error('관리자 그룹 목록 조회 중 오류 발생:', error);
    throw new AppError('관리자 그룹 목록 조회 중 오류가 발생했습니다.', 500, 'MANAGER_GROUP_LIST_ERROR');
  }
}

// 관리자 그룹 생성
export async function createManagerGroupS(managerGroup: ManagerGroup, meta: LogMeta) {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. 중복 체크
    const existingGroup = await findManagerGroup(managerGroup.no, managerGroup.groupNo);
    if (existingGroup) {
      throw new AppError('이미 존재하는 관리자 그룹입니다.', 400, 'MANAGER_GROUP_ALREADY_EXISTS');
    }

    // 2. 관리자 그룹 생성
    await insertManagerGroup(managerGroup, conn);

    // 3. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'I',
        target_table: 'managerGroup',
        target_id: `${managerGroup.no}_${managerGroup.groupNo}`,
        old_values: JSON.stringify({}),
        new_values: JSON.stringify(managerGroup),
        reason: `관리자 그룹 생성: manager_no ${managerGroup.no}, group_no ${managerGroup.groupNo}`,
      }),
      conn,
    );

    await commitTransaction(conn);
    return {
      groupNo: managerGroup.groupNo,
      no: managerGroup.no,
    };
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    console.error('관리자 그룹 생성 중 오류 발생:', error);
    throw error instanceof AppError
      ? error
      : new AppError('관리자 그룹 생성 중 오류가 발생했습니다.', 500, 'MANAGER_GROUP_CREATE_ERROR');
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

// 관리자 그룹 수정
export async function updateManagerGroupS(
  managerGroup: ManagerGroup,
  originalNo: number,
  originalGroupNo: number,
  meta: LogMeta,
): Promise<ManagerGroupCreateOrUpdateResponse> {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. 기존 그룹 존재 여부 확인
    const existingGroup = await findManagerGroup(originalNo, originalGroupNo);
    if (!existingGroup) {
      throw new AppError('존재하지 않는 관리자 그룹입니다.', 404, 'MANAGER_GROUP_NOT_FOUND');
    }

    // 2. 중복 체크 (변경된 경우에만)
    if (managerGroup.no !== originalNo || managerGroup.groupNo !== originalGroupNo) {
      const duplicateGroup = await findManagerGroup(managerGroup.no, managerGroup.groupNo);
      if (duplicateGroup) {
        throw new AppError('이미 존재하는 관리자 그룹입니다.', 400, 'MANAGER_GROUP_ALREADY_EXISTS');
      }
    }

    // 3. 관리자 그룹 수정
    await updateManagerGroup(managerGroup, originalNo, originalGroupNo, conn);

    // 4. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'U',
        target_table: 'managerGroup',
        target_id: `${managerGroup.no}_${managerGroup.groupNo}`,
        old_values: JSON.stringify({ no: originalNo, groupNo: originalGroupNo }),
        new_values: JSON.stringify(managerGroup),
        reason: `관리자 그룹 수정: manager_no ${originalNo}->${managerGroup.no}, group_no ${originalGroupNo}->${managerGroup.groupNo}`,
      }),
      conn,
    );

    await commitTransaction(conn);
    return {
      groupNo: managerGroup.groupNo,
      no: managerGroup.no,
    };
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    console.error('관리자 그룹 수정 중 오류 발생:', error);
    throw error instanceof AppError
      ? error
      : new AppError('관리자 그룹 수정 중 오류가 발생했습니다.', 500, 'MANAGER_GROUP_UPDATE_ERROR');
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

// 관리자 그룹 삭제
export async function deleteManagerGroupS(no: number, groupNo: number, meta: LogMeta) {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. 기존 그룹 존재 여부 확인
    const existingGroup = await findManagerGroup(no, groupNo);
    if (!existingGroup) {
      throw new AppError('존재하지 않는 관리자 그룹입니다.', 404, 'MANAGER_GROUP_NOT_FOUND');
    }

    // 2. 관리자 그룹 삭제
    const result = await deleteManagerGroup(no, groupNo, conn);

    // 3. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'D',
        target_table: 'managerGroup',
        target_id: `${no}_${groupNo}`,
        old_values: JSON.stringify({ no, groupNo }),
        new_values: JSON.stringify({}),
        reason: `관리자 그룹 삭제: manager_no ${no}, group_no ${groupNo}`,
      }),
      conn,
    );

    await commitTransaction(conn);
    return result;
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    console.error('관리자 그룹 삭제 중 오류 발생:', error);
    throw error instanceof AppError
      ? error
      : new AppError('관리자 그룹 삭제 중 오류가 발생했습니다.', 500, 'MANAGER_GROUP_DELETE_ERROR');
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

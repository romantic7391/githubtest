import {
  insertManagerGroup,
  findManagerGroups,
  updateManagerGroup,
  deleteManagerGroup,
} from '@/models/manager-group/manager-group.model';

import { ManagerGroup } from '@/types/permission';
import { LogMeta } from '@/types/history';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { Pagination } from '@/types/common';

// 관리자 그룹 목록 조회
export async function getManagerGroupsS(managerNo: number, pagination: Pagination, filters?: { groupNo?: number }) {
  return findManagerGroups(managerNo, pagination, filters);
}

// 관리자 그룹 생성
export async function createManagerGroupS(managerGroup: ManagerGroup, meta: LogMeta) {
  let conn;
  try {
    // 1. 관리자 그룹 생성
    conn = await beginTransaction();
    const result = await insertManagerGroup(managerGroup, conn);

    // 2. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'I',
        target_table: 'managerGroup',
        target_id: `${managerGroup.no}_${managerGroup.group_no}`,
        new_values: JSON.stringify(managerGroup),
        reason: `관리자 그룹 생성: manager_no ${managerGroup.no}, group_no ${managerGroup.group_no}`,
      }),
      conn,
    );

    await commitTransaction(conn);
    return result;
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    throw error;
  }
}

// 관리자 그룹 수정
export async function updateManagerGroupS(managerGroup: ManagerGroup, meta: LogMeta) {
  let conn;
  try {
    // 1. 관리자 그룹 수정
    conn = await beginTransaction();
    const result = await updateManagerGroup(managerGroup, conn);

    // 2. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'U',
        target_table: 'managerGroup',
        target_id: `${managerGroup.no}_${managerGroup.group_no}`,
        new_values: JSON.stringify(managerGroup),
        reason: `관리자 그룹 수정: manager_no ${managerGroup.no}, group_no ${managerGroup.group_no}`,
      }),
      conn,
    );

    await commitTransaction(conn);
    return result;
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    throw error;
  }
}

// 관리자 그룹 삭제
export async function deleteManagerGroupS(no: number, group_no: number, meta: LogMeta) {
  let conn;
  try {
    // 1. 관리자 그룹 삭제
    conn = await beginTransaction();
    const result = await deleteManagerGroup(no, group_no, conn);

    // 2. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'D',
        target_table: 'managerGroup',
        target_id: `${no}_${group_no}`,
        reason: `관리자 그룹 삭제: manager_no ${no}, group_no ${group_no}`,
      }),
      conn,
    );

    await commitTransaction(conn);
    return result;
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    throw error;
  }
}

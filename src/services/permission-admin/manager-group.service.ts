import { insertManagerGroup, updateManagerGroup, deleteManagerGroup } from '@/models/manager-group/manager-group.model';

import { ManagerGroup } from '@/types/permission';
import { LogMeta } from '@/types/history';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';

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
        target_id: result.insertId.toString(),
        new_values: JSON.stringify(managerGroup),
        reason: `관리자 그룹 생성: group_no ${managerGroup.group_no}`,
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
        target_id: managerGroup.group_no.toString(),
        new_values: JSON.stringify(managerGroup),
        reason: `관리자 그룹 수정: group_no ${managerGroup.group_no}`,
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
export async function deleteManagerGroupS(groupNo: number, meta: LogMeta) {
  let conn;
  try {
    // 1. 관리자 그룹 삭제
    conn = await beginTransaction();
    if (!meta.manager_no) {
      throw new Error('관리자 번호가 필요합니다.');
    }
    const result = await deleteManagerGroup(meta.manager_no, groupNo, conn);

    // 2. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'D',
        target_table: 'managerGroup',
        target_id: groupNo.toString(),
        reason: `관리자 그룹 삭제: group_no ${groupNo}`,
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

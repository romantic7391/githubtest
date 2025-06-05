import { insertGroup, updateGroup, deleteGroup } from '@/models/group/group-model';
import { Group } from '@/types/permission';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { LogMeta } from '@/types/history';

// 그룹 생성
export async function createGroupS(group: Group, meta: LogMeta) {
  let conn;
  try {
    // 1. 그룹 생성
    conn = await beginTransaction();
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
        new_values: JSON.stringify(group),
        reason: `그룹 생성: ${group.name}`,
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

// 그룹 수정
export async function updateGroupS(group: Group, meta: LogMeta) {
  let conn;
  try {
    // 1. 그룹 수정
    conn = await beginTransaction();
    const result = await updateGroup(group, conn);

    // 2. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'U',
        target_table: 'group',
        target_id: group.group_no.toString(),
        new_values: JSON.stringify(group),
        reason: `그룹 수정: ${group.name}`,
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

// 그룹 삭제
export async function deleteGroupS(groupNo: number, meta: LogMeta) {
  let conn;
  try {
    // 1. 그룹 삭제
    conn = await beginTransaction();
    const result = await deleteGroup(groupNo);

    // 2. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'D',
        target_table: 'group',
        target_id: groupNo.toString(),
        reason: `그룹 삭제: group_no ${groupNo}`,
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

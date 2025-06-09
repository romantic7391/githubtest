import { insertGroup, updateGroup, deleteGroup, findGroup } from '@/models/group/group-model';
import { Group } from '@/types/permission';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { LogMeta } from '@/types/history';

// 그룹 조회회
export async function getGroupS(groupNo: number, meta: LogMeta) {
  let conn;
  try {
    conn = await beginTransaction();
    const result = await findGroup(groupNo);

    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'S',
        target_table: 'group',
        target_id: groupNo.toString(),
        old_values: null,
        new_values: JSON.stringify(result),
        reason: `그룹 조회: ${groupNo}`,
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
  } finally {
    if (conn) {
      await conn.release();
    }
  }
}

// 그룹 생성
export async function createGroupS(dto: Group, meta: LogMeta) {
  let conn;
  try {
    // 1. 그룹 생성
    conn = await beginTransaction();
    const result = await insertGroup(dto, conn);

    // 2. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'I',
        target_table: 'group',
        target_id: result.insertId.toString(),
        new_values: JSON.stringify(dto),
        reason: `그룹 생성: ${dto.name}`,
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
export async function updateGroupS(dto: Group, meta: LogMeta) {
  let conn;
  try {
    // 1. 그룹 수정
    conn = await beginTransaction();
    const result = await updateGroup(dto, conn);

    // 2. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'U',
        target_table: 'group',
        target_id: dto.group_no.toString(),
        new_values: JSON.stringify(dto),
        reason: `그룹 수정: ${dto.name}`,
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

import { insertPermission, updatePermission, deletePermission } from '@/models/permission/permission.model';
import { Permission } from '@/types/permission';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { LogMeta } from '@/types/history';

// 권한 생성
export async function createPermissionS(permission: Permission, meta: LogMeta) {
  let conn;
  try {
    // 1. 권한 생성
    conn = await beginTransaction();

    const result = await insertPermission(permission, conn);

    // 2. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'I',
        target_table: 'permission',
        target_id: result.insertId.toString(),
        new_values: JSON.stringify(permission),
        reason: `권한 생성: ${permission.name}`,
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

// 권한 수정
export async function updatePermissionS(permission: Permission, meta: LogMeta) {
  let conn;
  try {
    // 1. 권한 수정
    conn = await beginTransaction();
    const result = await updatePermission(permission, conn);

    // 2. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'U',
        target_table: 'permission',
        target_id: permission.permission_no.toString(),
        new_values: JSON.stringify(permission),
        reason: `권한 수정: ${permission.name}`,
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

// 권한 삭제
export async function deletePermissionS(permissionNo: number, meta: LogMeta) {
  let conn;
  try {
    // 1. 권한 삭제
    conn = await beginTransaction();
    const result = await deletePermission(permissionNo, conn);

    // 2. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'D',
        target_table: 'permission',
        target_id: permissionNo.toString(),
        reason: `권한 삭제: permission_no ${permissionNo}`,
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

import {
  insertGroupPermission,
  updateGroupPermission,
  deleteGroupPermission,
  selectGroupPermission,
} from '@/models/group-permission/group-permission.model';
import { GroupPermission } from '@/types/permission';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { LogMeta } from '@/types/history';
import { Pagination } from '@/types/common';

// 그룹 권한 생성
export async function createGroupPermissionS(groupPermission: GroupPermission, meta: LogMeta) {
  let conn;
  try {
    // 1. 그룹 권한 생성
    conn = await beginTransaction();
    const result = await insertGroupPermission(groupPermission, conn);

    // 2. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'I',
        target_table: 'groupPermission',
        target_id: `${groupPermission.group_no}|${groupPermission.permission_no}`,
        old_values: JSON.stringify({}),
        new_values: JSON.stringify(groupPermission),
        reason: `그룹 권한 생성: group_no ${groupPermission.group_no}, permission_no ${groupPermission.permission_no}`,
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

// 그룹 권한 수정
export async function updateGroupPermissionS(groupPermission: GroupPermission, meta: LogMeta) {
  let conn;
  try {
    // 1. 그룹 권한 수정
    conn = await beginTransaction();
    const result = await updateGroupPermission(groupPermission, conn);

    // 2. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'U',
        target_table: 'groupPermission',
        target_id: `${groupPermission.group_no}|${groupPermission.permission_no}`,
        old_values: JSON.stringify({}),
        new_values: JSON.stringify(groupPermission),
        reason: `그룹 권한 수정: group_no ${groupPermission.group_no}, permission_no ${groupPermission.permission_no}`,
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

// 그룹 권한 삭제
export async function deleteGroupPermissionS(groupNo: number, permissionNo: number, meta: LogMeta) {
  let conn;
  try {
    // 1. 그룹 권한 삭제
    conn = await beginTransaction();
    const result = await deleteGroupPermission(groupNo, permissionNo, conn);

    // 2. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'D',
        target_table: 'groupPermission',
        target_id: `${groupNo}|${permissionNo}`,
        reason: `그룹 권한 삭제: group_no ${groupNo}, permission_no ${permissionNo}`,
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

// 그룹 권한 조회
export async function getGroupPermissionsS(
  pagination: Pagination,
  filters?: {
    groupNo?: number;
    permissionNo?: number;
  },
  meta?: LogMeta,
) {
  let conn;
  try {
    conn = await beginTransaction();
    const result = await selectGroupPermission(pagination, filters);

    if (meta) {
      await logAction(
        makeLogParams({
          manager_no: meta.manager_no,
          ip: meta.ip,
          user_agent: meta.user_agent,
          action_type: 'S',
          target_table: 'groupPermission',
          target_id: filters?.groupNo ? `group_no=${filters.groupNo}` : 'all',
          reason: `그룹 권한 조회: ${filters?.groupNo ? `group_no ${filters.groupNo}` : '전체'}`,
        }),
        conn,
      );
    }

    await commitTransaction(conn);
    return result;
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    throw error;
  }
}

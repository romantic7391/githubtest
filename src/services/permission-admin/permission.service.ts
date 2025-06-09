import {
  insertPermission,
  updatePermission,
  deletePermission,
  findPermissions,
} from '@/models/permission/permission.model';
import { Permission } from '@/types/permission';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { LogMeta } from '@/types/history';
import { Pagination } from '@/types/common';

// 권한 목록 조회
export async function findPermissionsS(pagination: Pagination, meta: LogMeta, filters?: { name?: string }) {
  try {
    const result = await findPermissions(pagination, filters);
    // 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        school_no: meta.school_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'S',
        target_table: 'permission',
        target_id: '',
        old_values: null,
        new_values: JSON.stringify(result),
        reason: `권한 목록 조회`,
      }),
    );
    return {
      permissions: result.permissions,
      pagination: {
        ...pagination,
        total: result.total,
        totalPages: Math.ceil(result.total / pagination.pageSize),
      },
    };
  } catch (error) {
    console.error('권한 목록 조회 중 오류 발생:', error);
    throw error;
  }
}

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
        old_values: null,
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
    console.error('권한 생성 중 오류 발생:', error);
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
        old_values: null,
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
    console.error('권한 수정 중 오류 발생:', error);
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
        old_values: null,
        new_values: null,
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
    console.error('권한 삭제 중 오류 발생:', error);
    throw error;
  }
}

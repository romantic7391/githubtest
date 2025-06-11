import {
  insertPermission,
  updatePermission,
  deletePermission,
  findPermissions,
  findPermission,
} from '@/models/permission/permission.model';
import { Permission } from '@/types/permission';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { LogMeta } from '@/types/history';
import { Pagination } from '@/types/common';
import { AppError } from '@/utils/error.utils';

// 권한 목록 조회
export async function getPermissionsS(pagination: Pagination, meta: LogMeta, filters?: { name?: string }) {
  try {
    const result = await findPermissions(pagination, filters);

    // 데이터베이스 필드명을 카멜케이스로 변환
    const transformedPermissions = result.permissions.map((permission) => ({
      permissionNo: permission.permission_no,
      name: permission.name,
      description: permission.description,
      defaultExtraCondition: permission.default_extra_condition,
      defaultExtraLimit: permission.default_extra_limit,
    }));

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
      permissions: transformedPermissions,
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
export async function createPermissionS(permission: Permission, meta: LogMeta): Promise<{ permissionNo: number }> {
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
        old_values: JSON.stringify({}),
        new_values: JSON.stringify(permission),
        reason: `권한 생성: ${permission.name}`,
      }),
      conn,
    );

    await commitTransaction(conn);
    return {
      permissionNo: result.insertId,
    };
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    console.error('권한 생성 중 오류 발생:', error);
    throw error;
  }
}

// 권한 수정
export async function updatePermissionS(permission: Permission, meta: LogMeta): Promise<{ permissionNo: number }> {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. 권한 존재 여부 확인
    const existingPermission = await findPermission(permission.permission_no);
    if (!existingPermission) {
      throw new AppError('존재하지 않는 권한입니다.', 404, 'PERMISSION_NOT_FOUND');
    }

    // 2. 권한 수정
    await updatePermission(permission, conn);

    // 3. 로그 기록
    await logAction(
      makeLogParams({
        ...meta,
        action_type: 'U',
        target_table: 'permission',
        target_id: permission.permission_no.toString(),
        old_values: JSON.stringify(existingPermission),
        new_values: JSON.stringify(permission),
        reason: `권한 수정: ${permission.name}`,
      }),
      conn,
    );

    await commitTransaction(conn);
    return { permissionNo: permission.permission_no };
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
    conn = await beginTransaction();

    // 1. 권한 존재 여부 확인
    const existingPermission = await findPermission(permissionNo);
    if (!existingPermission) {
      throw new AppError('존재하지 않는 권한입니다.', 404, 'PERMISSION_NOT_FOUND');
    }

    // 2. 권한 삭제
    await deletePermission(permissionNo, conn);

    // 3. 로그 기록
    await logAction(
      makeLogParams({
        ...meta,
        action_type: 'D',
        target_table: 'permission',
        target_id: permissionNo.toString(),
        old_values: JSON.stringify(existingPermission),
        new_values: null,
        reason: `권한 삭제: ${existingPermission.name}`,
      }),
      conn,
    );

    await commitTransaction(conn);
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    throw error;
  }
}

// 권한 조회
export async function getPermissionS(permissionNo: number, meta: LogMeta): Promise<{ permissionNo: number }> {
  try {
    const permission = await findPermission(permissionNo);
    if (!permission) {
      throw new Error('권한을 찾을 수 없습니다.');
    }

    // 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'S',
        target_table: 'permission',
        target_id: permissionNo.toString(),
        old_values: null,
        new_values: JSON.stringify(permission),
        reason: `권한 조회: ${permission.name}`,
      }),
    );

    return {
      permissionNo: permission.permission_no,
    };
  } catch (error) {
    console.error('권한 조회 중 오류 발생:', error);
    throw error;
  }
}

import { insertPermission, updatePermission, deletePermission } from '@/models/permission/permission.model';
import { Permission } from '@/types/permission';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { handleError } from '@/utils/error.utils';

export async function createPermissionS(permission: Permission, managerNo: number, ip: string, userAgent: string) {
  const connection = await beginTransaction();
  try {
    // 1. 권한 생성
    const result = await insertPermission(permission, connection);

    // 2. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: managerNo,
        ip,
        user_agent: userAgent,
        action_type: 'I',
        target_table: 'permission',
        target_id: result.insertId.toString(),
        new_values: JSON.stringify(permission),
        reason: `권한 생성: ${permission.name}`,
      }),
      connection,
    );

    await commitTransaction(connection);
    return result;
  } catch (error) {
    await rollbackTransaction(connection);
    throw handleError(error, 'createPermissionS');
  }
}

export async function updatePermissionS(permission: Permission, managerNo: number, ip: string, userAgent: string) {
  const connection = await beginTransaction();
  try {
    // 1. 권한 수정
    const result = await updatePermission(permission, connection);

    // 2. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: managerNo,
        ip,
        user_agent: userAgent,
        action_type: 'U',
        target_table: 'permission',
        target_id: permission.permission_no.toString(),
        new_values: JSON.stringify(permission),
        reason: `권한 수정: ${permission.name}`,
      }),
      connection,
    );

    await commitTransaction(connection);
    return result;
  } catch (error) {
    await rollbackTransaction(connection);
    throw handleError(error, 'updatePermissionS');
  }
}

export async function deletePermissionS(permissionNo: number, managerNo: number, ip: string, userAgent: string) {
  const connection = await beginTransaction();
  try {
    // 1. 권한 삭제
    const result = await deletePermission(permissionNo, connection);

    // 2. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: managerNo,
        ip,
        user_agent: userAgent,
        action_type: 'D',
        target_table: 'permission',
        target_id: permissionNo.toString(),
        reason: `권한 삭제: permission_no ${permissionNo}`,
      }),
      connection,
    );

    await commitTransaction(connection);
    return result;
  } catch (error) {
    await rollbackTransaction(connection);
    throw handleError(error, 'deletePermissionS');
  }
}

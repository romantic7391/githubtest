import {
  insertGroupPermission,
  updateGroupPermission,
  deleteGroupPermission,
  selectGroupPermission,
  findGroupPermission,
} from '@/models/group-permission/group-permission.model';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { LogMeta } from '@/types/history';
import { Pagination } from '@/types/common';
import { AppError } from '@/utils/error.utils';

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
          old_values: '',
          new_values: JSON.stringify(result),
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

// 그룹 권한 생성
export async function createGroupPermissionS(
  groupPermission: {
    groupNo: number;
    permissionNo: number;
    isAllowed: 'Y' | 'N' | null;
    override: 'Y' | 'N' | null;
    extraCondition: string | null;
    extraLimit: string | null;
  },
  meta: LogMeta,
) {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. 중복 체크
    const existingPermission = await findGroupPermission(groupPermission.groupNo, groupPermission.permissionNo);
    if (existingPermission) {
      throw new AppError('이미 존재하는 그룹 권한입니다.', 400);
    }

    // 2. 그룹 권한 생성
    await insertGroupPermission(
      {
        groupNo: groupPermission.groupNo,
        permissionNo: groupPermission.permissionNo,
        isAllowed: groupPermission.isAllowed,
        override: groupPermission.override,
        extraCondition: groupPermission.extraCondition,
        extraLimit: groupPermission.extraLimit,
      },
      conn,
    );

    // 3. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'I',
        target_table: 'groupPermission',
        target_id: `${groupPermission.groupNo}|${groupPermission.permissionNo}`,
        old_values: '',
        new_values: JSON.stringify(groupPermission),
        reason: `그룹 권한 생성: group_no ${groupPermission.groupNo}, permission_no ${groupPermission.permissionNo}`,
      }),
      conn,
    );

    await commitTransaction(conn);
    return {
      groupNo: groupPermission.groupNo,
      permissionNo: groupPermission.permissionNo,
    };
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    throw error;
  }
}

// 그룹 권한 수정
export async function updateGroupPermissionS(
  groupPermission: {
    groupNo: number;
    permissionNo: number;
    isAllowed: 'Y' | 'N' | null;
    override: 'Y' | 'N' | null;
    extraCondition: string | null;
    extraLimit: string | null;
    originalGroupNo: number;
    originalPermissionNo: number;
  },
  meta: LogMeta,
) {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. 원본 권한 존재 여부 확인
    const originalPermission = await findGroupPermission(
      groupPermission.originalGroupNo,
      groupPermission.originalPermissionNo,
    );
    if (!originalPermission) {
      throw new AppError('수정할 그룹 권한이 존재하지 않습니다.', 404);
    }

    // 2. 새로운 권한이 이미 존재하는지 확인 (그룹/권한 번호가 변경된 경우)
    if (
      groupPermission.groupNo !== groupPermission.originalGroupNo ||
      groupPermission.permissionNo !== groupPermission.originalPermissionNo
    ) {
      const existingPermission = await findGroupPermission(groupPermission.groupNo, groupPermission.permissionNo);
      if (existingPermission) {
        throw new AppError('이미 존재하는 그룹 권한입니다.', 400);
      }
    }

    // 3. 그룹 권한 수정
    const result = await updateGroupPermission(
      {
        groupNo: groupPermission.groupNo,
        permissionNo: groupPermission.permissionNo,
        isAllowed: groupPermission.isAllowed,
        override: groupPermission.override,
        extraCondition: groupPermission.extraCondition,
        extraLimit: groupPermission.extraLimit,
      },
      {
        originalGroupNo: groupPermission.originalGroupNo,
        originalPermissionNo: groupPermission.originalPermissionNo,
      },
      conn,
    );

    if (result.affectedRows === 0) {
      throw new AppError('그룹 권한 수정에 실패했습니다.', 400, 'UPDATE_FAILED');
    }

    // 4. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'U',
        target_table: 'groupPermission',
        target_id: `${groupPermission.originalGroupNo}|${groupPermission.originalPermissionNo}`,
        old_values: JSON.stringify(originalPermission),
        new_values: JSON.stringify(groupPermission),
        reason: `그룹 권한 수정: group_no ${groupPermission.groupNo}, permission_no ${groupPermission.permissionNo}`,
      }),
      conn,
    );

    await commitTransaction(conn);
    return {
      groupNo: groupPermission.groupNo,
      permissionNo: groupPermission.permissionNo,
    };
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
    conn = await beginTransaction();

    // 1. 삭제할 권한 존재 여부 확인
    const existingPermission = await findGroupPermission(groupNo, permissionNo);
    if (!existingPermission) {
      throw new AppError('삭제할 그룹 권한이 존재하지 않습니다.', 404, 'GROUP_PERMISSION_NOT_FOUND');
    }

    // 2. 그룹 권한 삭제
    const result = await deleteGroupPermission(groupNo, permissionNo, conn);

    if (result.affectedRows === 0) {
      throw new AppError('그룹 권한 삭제에 실패했습니다.', 400, 'DELETE_FAILED');
    }

    // 3. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'D',
        target_table: 'groupPermission',
        target_id: `${groupNo}|${permissionNo}`,
        old_values: JSON.stringify(existingPermission),
        new_values: null,
        reason: `그룹 권한 삭제: group_no ${groupNo}, permission_no ${permissionNo}`,
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

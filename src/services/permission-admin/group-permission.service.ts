import {
  insertGroupPermission,
  updateGroupPermission,
  deleteGroupPermission,
  selectGroupPermission,
} from '@/models/group-permission/group-permission.model';
import { CreateGroupPermission, UpdateGroupPermission } from '@/types/permission';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { LogMeta } from '@/types/history';
import { Pagination } from '@/types/common';

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
  groupPermission: CreateGroupPermission,
  meta: { manager_no: number; ip: string; user_agent: string },
) {
  console.log('=== createGroupPermissionS Start ===');
  console.log('Input:', { groupPermission, meta });

  try {
    const result = await insertGroupPermission(groupPermission);

    // 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        action_type: 'I',
        target_table: 'groupPermission',
        target_id: `${groupPermission.groupNo}|${groupPermission.permissionNo}`,
        old_values: '',
        new_values: JSON.stringify(groupPermission),
        ip: meta.ip,
        user_agent: meta.user_agent,
        reason: `그룹 권한 생성: groupNo ${groupPermission.groupNo}, permissionNo ${groupPermission.permissionNo}`,
      }),
    );

    console.log('Create Result:', result);
    console.log('=== createGroupPermissionS End ===');
    return {
      groupNo: groupPermission.groupNo,
      permissionNo: groupPermission.permissionNo,
    };
  } catch (error) {
    console.error('Error in createGroupPermissionS:', error);
    throw error;
  }
}

// 그룹 권한 수정
export async function updateGroupPermissionS(
  groupPermission: UpdateGroupPermission,
  meta: { manager_no: number; ip: string; user_agent: string },
) {
  console.log('=== updateGroupPermissionS Start ===');
  console.log('Input:', { groupPermission, meta });

  try {
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
    );

    // 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        action_type: 'U',
        target_table: 'groupPermission',
        target_id: `${groupPermission.originalGroupNo}|${groupPermission.originalPermissionNo}`,
        old_values: JSON.stringify({
          groupNo: groupPermission.originalGroupNo,
          permissionNo: groupPermission.originalPermissionNo,
        }),
        new_values: JSON.stringify({
          groupNo: groupPermission.groupNo,
          permissionNo: groupPermission.permissionNo,
          isAllowed: groupPermission.isAllowed,
          override: groupPermission.override,
          extraCondition: groupPermission.extraCondition,
          extraLimit: groupPermission.extraLimit,
        }),
        ip: meta.ip,
        user_agent: meta.user_agent,
        reason: `그룹 권한 수정: groupNo ${groupPermission.originalGroupNo}->${groupPermission.groupNo}, permissionNo ${groupPermission.originalPermissionNo}->${groupPermission.permissionNo}`,
      }),
    );

    console.log('Update Result:', result);
    console.log('=== updateGroupPermissionS End ===');
    return {
      groupNo: groupPermission.groupNo,
      permissionNo: groupPermission.permissionNo,
    };
  } catch (error) {
    console.error('Error in updateGroupPermissionS:', error);
    throw error;
  }
}

// 그룹 권한 삭제
export async function deleteGroupPermissionS(
  groupNo: number,
  permissionNo: number,
  meta: { manager_no: number; ip: string; user_agent: string },
) {
  console.log('=== deleteGroupPermissionS Start ===');
  console.log('Input:', { groupNo, permissionNo, meta });

  try {
    const result = await deleteGroupPermission(groupNo, permissionNo);

    // 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        action_type: 'D',
        target_table: 'groupPermission',
        target_id: `${groupNo}|${permissionNo}`,
        old_values: JSON.stringify({ groupNo, permissionNo }),
        new_values: JSON.stringify({ groupNo, permissionNo, deleted: true }),
        ip: meta.ip,
        user_agent: meta.user_agent,
        reason: `그룹 권한 삭제: groupNo ${groupNo}, permissionNo ${permissionNo}`,
      }),
    );

    console.log('Delete Result:', result);
    console.log('=== deleteGroupPermissionS End ===');
    return result;
  } catch (error) {
    console.error('Error in deleteGroupPermissionS:', error);
    throw error;
  }
}

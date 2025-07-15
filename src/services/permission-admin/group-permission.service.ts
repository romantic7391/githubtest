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
import {
  CreateGroupPermission,
  UpdateGroupPermission,
  GroupPermissionFilter,
  GroupPermissionCreateOrUpdateResponse,
} from '@/types/permission/group-permission';

// 그룹 권한 조회
export async function getGroupPermissionsS(pagination: Pagination, meta: LogMeta, filters?: GroupPermissionFilter) {
  let conn;
  try {
    conn = await beginTransaction();

    const result = await selectGroupPermission(pagination, filters);

    // 데이터가 없는 경우 404 에러
    if (result.groupPermissions.length === 0) {
      throw new AppError('해당하는 학교에 그룹 권한 목록이 존재하지 않습니다.', 404);
    }

    // 로그 기록
    await logAction(
      makeLogParams({
        schoolNo: meta.schoolNo, // 현재 사용자가 접속한 학교 번호
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'S',
        targetTable: 'groupPermission',
        targetId: filters?.groupNo ? `groupNo=${filters.groupNo}` : 'all',
        oldValues: JSON.stringify(result),
        newValues: null,
        reason: `그룹 권한 조회: ${filters?.groupNo ? `groupNo ${filters.groupNo}` : '전체'}`,
      }),
      conn,
    );

    await commitTransaction(conn);
    return result;
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('그룹 권한 목록 조회 중 오류가 발생했습니다.', 500);
  }
}

// 그룹 권한 생성
export async function createGroupPermissionS(
  groupPermission: CreateGroupPermission,
  meta: LogMeta,
): Promise<GroupPermissionCreateOrUpdateResponse> {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. 중복 체크
    const existingPermission = await findGroupPermission({
      groupNo: groupPermission.groupNo,
      permissionNo: groupPermission.permissionNo,
    });

    if (existingPermission) {
      throw new AppError('이미 존재하는 그룹 권한입니다.', 409);
    }

    // 2. 그룹 권한 생성
    await insertGroupPermission(groupPermission, conn);

    // 3. 로그 기록
    await logAction(
      makeLogParams({
        schoolNo: meta.schoolNo,
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'I',
        targetTable: 'groupPermission',
        targetId: `${groupPermission.groupNo}|${groupPermission.permissionNo}`,
        oldValues: null,
        newValues: JSON.stringify(groupPermission),
        reason: `그룹 권한 생성: groupNo ${groupPermission.groupNo}, permissionNo ${groupPermission.permissionNo}`,
      }),
      conn,
    );

    await commitTransaction(conn);

    return {
      groupNo: groupPermission.groupNo,
      permissionNo: groupPermission.permissionNo,
    };
  } catch (error) {
    console.error('그룹 권한 생성 중 오류:', error);
    if (conn) {
      await rollbackTransaction(conn);
    }
    throw error instanceof AppError ? error : new AppError('그룹 권한 생성 중 오류가 발생했습니다.', 500);
  }
}

// 그룹 권한 수정
export async function updateGroupPermissionS(
  groupPermission: UpdateGroupPermission,
  meta: LogMeta,
): Promise<GroupPermissionCreateOrUpdateResponse> {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. 원본 권한 존재 여부 확인
    const originalPermission = await findGroupPermission({
      groupNo: groupPermission.originalGroupNo,
      permissionNo: groupPermission.originalPermissionNo,
    });
    if (!originalPermission) {
      throw new AppError('수정할 그룹 권한이 존재하지 않습니다.', 404);
    }

    // 2. 새로운 권한이 이미 존재하는지 확인 (그룹/권한 번호가 변경된 경우)
    if (
      groupPermission.groupNo !== groupPermission.originalGroupNo ||
      groupPermission.permissionNo !== groupPermission.originalPermissionNo
    ) {
      const existingPermission = await findGroupPermission({
        groupNo: groupPermission.groupNo,
        permissionNo: groupPermission.permissionNo,
      });
      if (existingPermission) {
        throw new AppError('이미 존재하는 그룹 권한입니다.', 400);
      }
    }

    // 3. 그룹 권한 수정
    const result = await updateGroupPermission(groupPermission, conn);

    if (result.affectedRows === 0) {
      throw new AppError('그룹 권한 수정에 실패했습니다.', 400, 'UPDATE_FAILED');
    }

    // 4. 로그 기록
    await logAction(
      makeLogParams({
        schoolNo: meta.schoolNo,
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'U',
        targetTable: 'groupPermission',
        targetId: `${groupPermission.originalGroupNo}|${groupPermission.originalPermissionNo}`,
        oldValues: JSON.stringify(originalPermission),
        newValues: JSON.stringify(groupPermission),
        reason: `그룹 권한 수정: groupNo ${groupPermission.groupNo}, permissionNo ${groupPermission.permissionNo}`,
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
    throw error instanceof AppError ? error : new AppError('그룹 권한 수정 중 오류가 발생했습니다.', 500);
  }
}

// 그룹 권한 삭제
export async function deleteGroupPermissionS(groupNo: number, permissionNo: number, meta: LogMeta) {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. 삭제할 권한 존재 여부 확인
    const existingPermission = await findGroupPermission({
      groupNo,
      permissionNo,
    });
    if (!existingPermission) {
      throw new AppError('삭제할 그룹 권한이 존재하지 않습니다.', 404);
    }

    // 2. 그룹 권한 삭제
    const result = await deleteGroupPermission({ groupNo, permissionNo }, conn);

    if (result.affectedRows === 0) {
      throw new AppError('그룹 권한 삭제에 실패했습니다.', 400, 'DELETE_FAILED');
    }

    // 3. 로그 기록
    await logAction(
      makeLogParams({
        schoolNo: meta.schoolNo,
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'D',
        targetTable: 'groupPermission',
        targetId: `${groupNo}|${permissionNo}`,
        oldValues: JSON.stringify(existingPermission),
        newValues: null,
        reason: `그룹 권한 삭제: groupNo ${groupNo}, permissionNo ${permissionNo}`,
      }),
      conn,
    );

    await commitTransaction(conn);
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
      console.error('그룹 권한 삭제 중 오류:', error);
    }
    throw error instanceof AppError ? error : new AppError('그룹 권한 삭제 중 오류가 발생했습니다.', 500);
  }
}

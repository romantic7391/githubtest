import {
  insertPermission,
  updatePermission,
  deletePermission,
  findPermissions,
  findPermission,
  findPermissionByName,
} from '@/models/permission/permission.model';
import { CreatePermissionDto, UpdatePermissionDto, FindPermissionsDto } from '@/types/permission/permission';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { LogMeta } from '@/types/history';
import { AppError } from '@/utils/error.utils';
import { Pagination } from '@/types/common';

// 권한 목록 조회
export async function getPermissionsS(
  pagination: Pagination,
  meta: LogMeta,
  filters?: { name?: string; schoolNo?: number | null },
) {
  try {
    const dto: FindPermissionsDto = {
      pagination,
      filters,
    };

    const result = await findPermissions(dto);

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
        ...dto.pagination,
        total: result.total,
        totalPages: Math.ceil(result.total / dto.pagination.pageSize),
      },
    };
  } catch (error) {
    console.error('권한 목록 조회 중 오류 발생:', error);
    throw new AppError('권한 목록 조회 중 오류가 발생했습니다.', 500);
  }
}

// 권한 생성
export async function createPermissionS(dto: CreatePermissionDto, meta: LogMeta): Promise<{ permissionNo: number }> {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. 이름 중복 체크
    const existingPermission = await findPermissionByName(dto.name);
    if (existingPermission) {
      throw new AppError('이미 존재하는 권한 이름입니다.', 400, 'DUPLICATE_PERMISSION_NAME');
    }

    const result = await insertPermission(dto, conn);

    // 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'I',
        target_table: 'permission',
        target_id: result.insertId.toString(),
        old_values: JSON.stringify({}),
        new_values: JSON.stringify(dto),
        reason: `권한 생성: ${dto.name}`,
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
    if (error instanceof AppError) {
      throw error;
    }
    console.error('권한 생성 중 오류 발생:', error);
    throw new AppError('권한 생성 중 오류가 발생했습니다.', 500);
  }
}

// 권한 수정
export async function updatePermissionS(dto: UpdatePermissionDto, meta: LogMeta): Promise<{ permissionNo: number }> {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. 권한 존재 여부 확인
    const existingPermission = await findPermission({ permission_no: dto.permission_no });
    if (!existingPermission) {
      throw new AppError('존재하지 않는 권한입니다.', 404);
    }

    // 2. 권한 수정
    await updatePermission(dto, conn);

    // 3. 로그 기록
    await logAction(
      makeLogParams({
        ...meta,
        action_type: 'U',
        target_table: 'permission',
        target_id: dto.permission_no.toString(),
        old_values: JSON.stringify(existingPermission),
        new_values: JSON.stringify(dto),
        reason: `권한 수정: ${dto.name}`,
      }),
      conn,
    );

    await commitTransaction(conn);
    return { permissionNo: dto.permission_no };
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    if (error instanceof AppError) {
      throw error;
    }
    console.error('권한 수정 중 오류 발생:', error);
    throw new AppError('권한 수정 중 오류가 발생했습니다.', 500);
  }
}

// 권한 삭제
export async function deletePermissionS(permissionNo: number, meta: LogMeta) {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. 권한 존재 여부 확인
    const existingPermission = await findPermission({ permission_no: permissionNo });
    if (!existingPermission) {
      throw new AppError('존재하지 않는 권한입니다.', 404);
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
    if (error instanceof AppError) {
      throw error;
    }
    console.error('권한 삭제 중 오류 발생:', error);
    throw new AppError('권한 삭제 중 오류가 발생했습니다.', 500);
  }
}

// 권한 조회
export async function getPermissionS(permissionNo: number, meta: LogMeta): Promise<{ permissionNo: number }> {
  try {
    const permission = await findPermission({ permission_no: permissionNo });
    if (!permission) {
      throw new AppError('존재하지 않는 권한입니다.', 404);
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
      permissionNo: permission.permissionNo,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('권한 조회 중 오류 발생:', error);
    throw new AppError('권한 조회 중 오류가 발생했습니다.', 500);
  }
}

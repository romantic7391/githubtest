import {
  insertPermission,
  updatePermission,
  deletePermission,
  findPermissions,
  findPermission,
  findPermissionByNameNormalized,
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

    // 데이터가 없는 경우 404 에러
    if (result.permissions.length === 0) {
      throw new AppError('해당하는 학교에 권한 목록이 존재하지 않습니다.', 404);
    }

    // 로그 기록
    await logAction(
      makeLogParams({
        managerNo: meta.managerNo,
        schoolNo: meta.schoolNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'S',
        targetTable: 'permission',
        targetId: null, // 목록 조회는 PK가 없음
        oldValues: null,
        newValues: JSON.stringify(result),
        reason: '권한 목록 조회',
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
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('권한 목록 조회 중 오류가 발생했습니다.', 500);
  }
}

// 권한 생성
export async function createPermissionS(dto: CreatePermissionDto, meta: LogMeta): Promise<{ permissionNo: number }> {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. 이름 중복 체크 (공백/대소문자 무시)
    const existingPermission = await findPermissionByNameNormalized(dto.name);
    if (existingPermission) {
      throw new AppError(`이미 존재하는 권한 이름입니다: `, 409);
    }

    const result = await insertPermission(dto, conn);

    // 로그 기록
    await logAction(
      makeLogParams({
        managerNo: meta.managerNo,
        schoolNo: meta.schoolNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'I',
        targetTable: 'permission',
        targetId: result.insertId.toString(),
        oldValues: null,
        newValues: JSON.stringify(dto),
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
      try {
        await rollbackTransaction(conn);
      } catch (rollbackError) {
        // 롤백 실패 시에도 원래 에러를 유지
        console.error('롤백 실패:', rollbackError);
      }
    }
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('권한 생성 중 오류가 발생했습니다.', 500);
  }
}

// 권한 수정
export async function updatePermissionS(dto: UpdatePermissionDto, meta: LogMeta): Promise<{ permissionNo: number }> {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. 수정 전 데이터 조회 (로그용)
    const existingPermission = await findPermission({ permissionNo: dto.permissionNo });

    // 2. 권한 수정
    const result = await updatePermission(dto, conn);

    // 3. 수정 성공 여부 확인
    if (result.affectedRows === 0) {
      throw new AppError('권한 수정에 실패했습니다.', 400);
    }

    // 4. 로그 기록
    await logAction(
      makeLogParams({
        ...meta,
        actionType: 'U',
        targetTable: 'permission',
        targetId: dto.permissionNo.toString(),
        oldValues: JSON.stringify(existingPermission),
        newValues: JSON.stringify(dto),
        reason: `권한 수정: ${dto.name}`,
      }),
      conn,
    );

    await commitTransaction(conn);
    return { permissionNo: dto.permissionNo };
  } catch (error) {
    if (conn) {
      try {
        await rollbackTransaction(conn);
      } catch (rollbackError) {
        // 롤백 실패 시에도 원래 에러를 유지
        console.error('롤백 실패:', rollbackError);
      }
    }
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('권한 수정 중 오류가 발생했습니다.', 500);
  }
}

// 권한 삭제
export async function deletePermissionS(permissionNo: number, meta: LogMeta) {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. 권한 존재 여부 확인
    const existingPermission = await findPermission({ permissionNo: permissionNo });
    if (!existingPermission) {
      throw new AppError('존재하지 않는 권한입니다.', 404);
    }

    // 2. 권한 삭제
    await deletePermission(permissionNo, conn);

    // 3. 로그 기록
    await logAction(
      makeLogParams({
        ...meta,
        actionType: 'D',
        targetTable: 'permission',
        targetId: permissionNo.toString(),
        oldValues: JSON.stringify(existingPermission),
        newValues: null,
        reason: `권한 삭제: ${existingPermission.name}`,
      }),
      conn,
    );

    await commitTransaction(conn);
  } catch (error) {
    if (conn) {
      try {
        await rollbackTransaction(conn);
      } catch (rollbackError) {
        // 롤백 실패 시에도 원래 에러를 유지
        console.error('롤백 실패:', rollbackError);
      }
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
    const permission = await findPermission({ permissionNo: permissionNo });
    if (!permission) {
      throw new AppError('존재하지 않는 권한입니다.', 404);
    }

    // 로그 기록
    await logAction(
      makeLogParams({
        managerNo: meta.managerNo,
        schoolNo: meta.schoolNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'S',
        targetTable: 'permission',
        targetId: permissionNo.toString(),
        oldValues: JSON.stringify(permission),
        newValues: null,
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
    throw new AppError('권한 조회 중 오류가 발생했습니다.', 500);
  }
}

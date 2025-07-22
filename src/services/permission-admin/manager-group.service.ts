import {
  insertManagerGroup,
  findManagerGroups,
  updateManagerGroup,
  deleteManagerGroup,
  findManagerGroup,
} from '@/models/manager-group/manager-group.model';

import {
  ManagerGroup,
  ManagerGroupCreateOrUpdateResponse,
  FindManagerGroupsDto,
  InsertManagerGroupDto,
  UpdateManagerGroupDto,
  DeleteManagerGroupDto,
} from '@/types/permission/manager-group';
import { LogMeta } from '@/types/history';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { Pagination, paginationSchema } from '@/types/common';
import { AppError } from '@/utils/error.utils';

// 관리자 그룹 목록 조회
export async function getManagerGroupsS(
  managerNo: number,
  pagination: Pagination,
  meta: LogMeta,
  filters?: {
    groupNo?: number;
    schoolNo?: number;
    managerNo?: number;
  },
) {
  let conn;
  try {
    conn = await beginTransaction();

    const params: FindManagerGroupsDto = {
      managerNo,
      filters,
    };
    const result = await findManagerGroups(params, pagination);

    // 데이터가 없는 경우 404 에러
    if (result.total === 0) {
      throw new AppError('해당하는 학교에 관리자 그룹 목록이 존재하지 않습니다.', 404);
    }

    if (meta) {
      await logAction(
        makeLogParams({
          schoolNo: meta.schoolNo,
          managerNo: meta.managerNo,
          ip: meta.ip,
          userAgent: meta.userAgent,
          actionType: 'S',
          targetTable: 'managerGroup',
          targetId: filters?.groupNo ? `groupNo=${filters.groupNo}` : 'all',
          oldValues: JSON.stringify(result),
          newValues: null,
          reason: `관리자 그룹 조회: ${filters?.groupNo ? `groupNo ${filters.groupNo}` : '전체'}`,
        }),
        conn,
      );
    }

    await commitTransaction(conn);
    return {
      managerGroups: result.managerGroups,
      pagination: paginationSchema.parse({
        page: pagination.page,
        pageSize: pagination.pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / pagination.pageSize),
      }),
    };
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('관리자 그룹 목록 조회 중 오류가 발생했습니다.', 500);
  }
}

// 관리자 그룹 생성
export async function createManagerGroupS(managerGroup: ManagerGroup, meta: LogMeta) {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. 중복 체크
    const existingGroup = await findManagerGroup(managerGroup.managerNo, managerGroup.groupNo);
    if (existingGroup) {
      throw new AppError('이미 존재하는 관리자 그룹입니다.', 409);
    }

    // 2. 관리자 그룹 생성
    const dto: InsertManagerGroupDto = managerGroup;
    await insertManagerGroup(dto, conn);

    // 3. 로그 기록
    await logAction(
      makeLogParams({
        schoolNo: meta.schoolNo,
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'I',
        targetTable: 'managerGroup',
        targetId: `${managerGroup.managerNo}_${managerGroup.groupNo}`,
        oldValues: null,
        newValues: JSON.stringify(managerGroup),
        reason: `관리자 그룹 생성: managerNo ${managerGroup.managerNo}, groupNo ${managerGroup.groupNo}`,
      }),
      conn,
    );

    await commitTransaction(conn);
    return {
      groupNo: managerGroup.groupNo,
      managerNo: managerGroup.managerNo,
    };
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    throw error instanceof AppError ? error : new AppError('관리자 그룹 생성 중 오류가 발생했습니다.', 500);
  }
}

// 관리자 그룹 수정
export async function updateManagerGroupS(
  managerGroup: ManagerGroup,
  originalNo: number,
  originalGroupNo: number,
  meta: LogMeta,
): Promise<ManagerGroupCreateOrUpdateResponse> {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. 기존 그룹 존재 여부 확인
    const existingGroup = await findManagerGroup(originalNo, originalGroupNo);
    if (!existingGroup) {
      throw new AppError('존재하지 않는 관리자 그룹입니다.', 404);
    }

    // 2. 중복 체크 (변경된 경우에만)
    if (managerGroup.managerNo !== originalNo || managerGroup.groupNo !== originalGroupNo) {
      const duplicateGroup = await findManagerGroup(managerGroup.managerNo, managerGroup.groupNo);
      if (duplicateGroup) {
        throw new AppError('이미 존재하는 관리자 그룹입니다.', 400);
      }
    }

    // 3. 관리자 그룹 수정
    const dto: UpdateManagerGroupDto = {
      ...managerGroup,
      originalNo,
      originalGroupNo,
    };
    await updateManagerGroup(dto, conn);

    // 4. 로그 기록
    await logAction(
      makeLogParams({
        schoolNo: meta.schoolNo,
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'U',
        targetTable: 'managerGroup',
        targetId: `${managerGroup.managerNo}_${managerGroup.groupNo}`,
        oldValues: JSON.stringify({ managerNo: originalNo, groupNo: originalGroupNo }),
        newValues: JSON.stringify(managerGroup),
        reason: `관리자 그룹 수정: managerNo ${originalNo}->${managerGroup.managerNo}, groupNo ${originalGroupNo}->${managerGroup.groupNo}`,
      }),
      conn,
    );

    await commitTransaction(conn);
    return {
      groupNo: managerGroup.groupNo,
      managerNo: managerGroup.managerNo,
    };
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('관리자 그룹 수정 중 오류가 발생했습니다.', 500);
  }
}

// 관리자 그룹 삭제
export async function deleteManagerGroupS(managerNo: number, groupNo: number, meta: LogMeta) {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. 기존 그룹 존재 여부 확인
    const existingGroup = await findManagerGroup(managerNo, groupNo);
    if (!existingGroup) {
      throw new AppError('존재하지 않는 관리자 그룹입니다.', 404);
    }

    // 2. 관리자 그룹 삭제
    const dto: DeleteManagerGroupDto = {
      managerNo,
      groupNo,
    };
    const result = await deleteManagerGroup(dto, conn);

    // 3. 로그 기록
    await logAction(
      makeLogParams({
        schoolNo: meta.schoolNo,
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'D',
        targetTable: 'managerGroup',
        targetId: `${managerNo}_${groupNo}`,
        oldValues: JSON.stringify(existingGroup), // 실제 삭제되는 데이터
        newValues: null,
        reason: `관리자 그룹 삭제: managerNo ${managerNo}, groupNo ${groupNo}`,
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
    throw new AppError('관리자 그룹 삭제 중 오류가 발생했습니다.', 500);
  }
}

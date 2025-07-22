import {
  deleteManager,
  findManagerByNo,
  findManagers,
  findPasswordByNo,
  updateManager,
  updatePassword,
} from '@/models/manager/manager.model';
import { Pagination } from '@/types/common';
import { LogMeta } from '@/types/history';
import { AppError } from '@/utils/error.utils';
import { logAction } from '@/services/log-action/log-action.service';
import { makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { UpdateManagerDto } from '@/types/manager';
import bcrypt from 'bcrypt';
import { auth } from '@/auth';
import { deleteManagerGroup, findManagerGroups } from '@/models/manager-group/manager-group.model';
import { deleteGroup } from '@/models/group/group-model';

export async function getManagersS(
  pagination: Pagination,
  meta: LogMeta,
  filters: {
    name?: string;
    signInId?: string;
    schoolNo?: number | 'all';
    scode?: string;
    area?: string;
  },
) {
  let conn;
  try {
    conn = await beginTransaction();
    const result = await findManagers(
      {
        pagination,
        filters: {
          ...filters,
          schoolNo: filters.schoolNo === 'all' ? undefined : filters.schoolNo,
          scode: filters.scode,
        },
      },
      conn,
    );

    if (result.managers.length === 0) {
      throw new AppError('해당하는 학교에 관리자가 존재하지 않습니다.', 404);
    }

    await logAction(
      makeLogParams({
        managerNo: meta.managerNo,
        schoolNo: meta.schoolNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'S',
        targetTable: 'manager',
        targetId: null,
        oldValues: JSON.stringify(result),
        newValues: null,
        reason: '관리자 목록 조회',
      }),
      conn,
    );

    await commitTransaction(conn);
    return {
      managers: result.managers,
      pagination: {
        ...pagination,
        total: result.total,
        totalPages: Math.ceil(result.total / pagination.pageSize),
      },
    };
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('관리자 목록 조회 중 오류가 발생했습니다.', 500);
  }
}

export async function getManagerS(managerNo: number, meta: LogMeta) {
  let conn;
  try {
    conn = await beginTransaction();
    const manager = await findManagerByNo(managerNo, conn);
    if (!manager) {
      throw new AppError('해당하는 관리자가 존재하지 않습니다.', 404);
    }

    await logAction(
      makeLogParams({
        managerNo: meta.managerNo,
        schoolNo: meta.schoolNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'S',
        targetTable: 'manager',
        targetId: managerNo.toString(),
        oldValues: JSON.stringify(manager),
        newValues: null,
        reason: '관리자 조회',
      }),
      conn,
    );
    await commitTransaction(conn);
    return manager;
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('관리자 조회 중 오류가 발생했습니다.', 500);
  }
}

export async function updateManagerS(dto: UpdateManagerDto, meta: LogMeta) {
  let conn;
  try {
    conn = await beginTransaction();

    const manager = await findManagerByNo(dto.managerNo, conn);
    if (!manager) {
      throw new AppError('해당하는 관리자가 존재하지 않습니다.', 404);
    }

    const password = await findPasswordByNo(dto.managerNo, conn);
    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(dto.password, salt);
      await updatePassword(
        {
          managerNo: dto.managerNo,
          password: hashedPassword,
          salt,
        },
        conn,
      );
    } else if (
      manager.name === dto.name &&
      manager.approvedStatus === dto.approvedStatus &&
      manager.locked === dto.locked
    ) {
      throw new AppError('수정할 내용이 없습니다.', 400);
    }

    const result = await updateManager(
      {
        managerNo: dto.managerNo,
        name: dto.name,
        approvedStatus: dto.approvedStatus,
        locked: dto.locked,
      },
      conn,
    );

    const newManager = await findManagerByNo(dto.managerNo, conn);
    const newPassword = await findPasswordByNo(dto.managerNo, conn);

    await logAction(
      makeLogParams({
        managerNo: meta.managerNo,
        schoolNo: meta.schoolNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'U',
        targetTable: 'manager',
        targetId: dto.managerNo.toString(),
        oldValues: JSON.stringify({ ...manager, ...password }),
        newValues: JSON.stringify({ ...newManager, ...newPassword }),
        reason: '관리자 수정',
      }),
      conn,
    );

    await commitTransaction(conn);
    return result.affectedRows > 0;
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('관리자 수정 중 오류가 발생했습니다.', 500);
  }
}

export async function deleteManagerS(managerNo: number, meta: LogMeta) {
  let conn;
  try {
    conn = await beginTransaction();

    const session = await auth();
    if (session?.user.managerNo === managerNo) {
      throw new AppError('본인을 삭제할 수 없습니다.', 400);
    }

    const manager = await findManagerByNo(managerNo, conn);
    if (!manager) {
      throw new AppError('해당하는 관리자가 존재하지 않습니다.', 404);
    }

    const managerGroups = await findManagerGroups(
      {
        managerNo,
        filters: {
          schoolNo: meta.schoolNo,
        },
      },
      {
        page: 1,
        pageSize: Number.MAX_SAFE_INTEGER,
        total: 0,
        totalPages: 0,
      },
    );

    for (const mg of managerGroups.managerGroups) {
      await deleteGroup({ groupNo: mg.groupNo }, conn);
      await logAction(
        makeLogParams({
          ...meta,
          actionType: 'D',
          targetTable: 'group',
          targetId: mg.groupNo.toString(),
          oldValues: JSON.stringify(mg),
          newValues: null,
          reason: '그룹 삭제',
        }),
        conn,
      );

      await deleteManagerGroup(
        {
          managerNo: mg.managerNo,
          groupNo: mg.groupNo,
        },
        conn,
      );
      await logAction(
        makeLogParams({
          ...meta,
          actionType: 'D',
          targetTable: 'managerGroup',
          targetId: `${mg.managerNo}_${mg.groupNo}`,
          oldValues: JSON.stringify(mg),
          newValues: null,
          reason: '관리자 그룹 삭제',
        }),
        conn,
      );
    }

    const result = await deleteManager(managerNo, conn);

    await logAction(
      makeLogParams({
        ...meta,
        actionType: 'D',
        targetTable: 'manager',
        targetId: managerNo.toString(),
        oldValues: JSON.stringify(manager),
        newValues: null,
        reason: '관리자 삭제',
      }),
      conn,
    );

    await commitTransaction(conn);
    return result.affectedRows > 0;
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('관리자 삭제 중 오류가 발생했습니다.', 500);
  }
}

import { History, historySchema } from '@/types/history';
import { insertLogAction } from '@/models/history-action/history-action.model';
import type { PoolConnection } from 'mariadb';
import { ManagerSignInHistory, managerSignInHistorySchema } from '@/types/manager-signin-history';
import {
  insertSignInLogAction,
  selectLastSignInHistory,
  updateSignInHistory,
} from '@/models/manager-signin-history/manager-signin-history.model';
import { headers } from 'next/headers';
import { AppError } from '@/utils/error.utils';
import dayjs from '@/lib/dayjs';
import { User } from '@/types/next-auth';
// import { auth } from '@/auth';

// 로그 파라미터를 History 타입으로 변환
export function makeLogParams(params: Partial<History>) {
  return historySchema.parse({
    ...params,
    schoolNo: params.schoolNo, // null을 그대로 유지
    oldValues: params.oldValues ?? null,
    newValues: params.newValues ?? null,
  });
}

// 로그 기록
export async function logAction(history: History, conn?: PoolConnection) {
  await insertLogAction(history, conn);
}

/**
 * 로그인 로그 기록
 * @param dto 로그 기록 데이터
 * @param conn 데이터베이스 연결
 */
export async function signInLogAction(dto: Omit<ManagerSignInHistory, 'remoteAddr'>, conn?: PoolConnection) {
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for');
  const parsedDto = managerSignInHistorySchema.parse({
    ...dto,
    remoteAddr: ip,
  });
  await insertSignInLogAction(parsedDto, conn);
}

export function getClientInfo(req: import('next/server').NextRequest) {
  return {
    userAgent: req.headers.get('user-agent'),
    ip: req.headers.get('x-forwarded-for'),
  };
}

export async function signOutLogAction(user: User, conn?: PoolConnection) {
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for');
  const remoteAddr = managerSignInHistorySchema.shape.remoteAddr.parse(ip);
  if (!user) {
    throw new AppError('로그인 정보가 없습니다.', 400);
  }

  const lastSignInHistory = await selectLastSignInHistory(user.managerNo, remoteAddr, conn);
  console.log('===============================================');
  console.log('lastSignInHistory: ', lastSignInHistory);
  console.log('user: ', user);
  console.log('===============================================');
  if (!lastSignInHistory) {
    throw new AppError('로그인 기록이 없습니다.', 400);
  }
  if (lastSignInHistory.signOutTime) {
    throw new AppError('이미 로그아웃 되었습니다.', 400);
  }
  await updateSignInHistory(
    {
      ...lastSignInHistory,
      signOutTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      success: 'Y',
    },
    conn,
  );
}

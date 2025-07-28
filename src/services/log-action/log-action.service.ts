import { History, historySchema } from '@/types/history';
import { insertLogAction } from '@/models/history-action/history-action.model';
import type { PoolConnection } from 'mariadb';
import { ManagerSignInHistory, managerSignInHistorySchema } from '@/types/manager-signin-history';
import { insertSignInLogAction } from '@/models/manager-signin-history/manager-signin-history.model';
import { headers } from 'next/headers';
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

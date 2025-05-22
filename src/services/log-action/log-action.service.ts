import { History, historySchema } from '@/types/history';
import { insertLogAction } from '@/models/history-action/history-action.model';
import type { PoolConnection } from 'mariadb';

// 로그 파라미터를 History 타입으로 변환
export function makeLogParams(params: Partial<History>) {
  return historySchema.parse(params);
}

// 로그 기록
export async function logAction(history: History, conn?: PoolConnection) {
  await insertLogAction(history, conn);
}

export function getClientInfo(req: import('next/server').NextRequest) {
  return {
    userAgent: req.headers.get('user-agent'),
    ip: req.headers.get('x-forwarded-for'),
  };
}

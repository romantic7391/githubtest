import { LogActionInsertDto, LogActionParams } from '@/interfaces/log-action/log-action.d';
import { insertLogAction } from '@/models/log-action/log-action.model';

// LogActionInsertDto 타입의 파라미터를 받아 로그를 기록하는 함수로 리팩터링
export async function logAction(log: LogActionInsertDto) {
  await insertLogAction(log);
}

// target_id가 배열이면 '|'로 join, 아니면 그대로 반환
function normalizeTargetId(target_id?: string | string[] | null): string | null {
  if (Array.isArray(target_id)) return target_id.join('|');
  return target_id ?? null;
}

// 객체를 JSON 문자열로 변환 (null/undefined면 null 반환)
function toJsonString(obj: object | null | undefined): string | null {
  return obj === null || obj === undefined ? null : JSON.stringify(obj);
}

// 삽입 로그 등록
export function makeInsertLogParams(params: LogActionParams): LogActionInsertDto {
  return {
    manager_no: params.manager_no ?? 0,
    school_no: params.school_no ?? 0,
    ip: params.ip ?? null,
    user_agent: params.user_agent ?? null,
    action_type: params.action_type,
    target_table: params.target_table ?? null,
    target_id: normalizeTargetId(params.target_id),
    old_values: null,
    new_values: toJsonString(params.new_values),
    reason: params.reason ?? null,
    created: undefined,
  };
}

// 수정 로그 등록
export function makeUpdateLogParams(params: LogActionParams): LogActionInsertDto {
  return {
    manager_no: params.manager_no ?? 0,
    school_no: params.school_no ?? 0,
    ip: params.ip ?? null,
    user_agent: params.user_agent ?? null,
    action_type: params.action_type,
    target_table: params.target_table ?? null,
    target_id: normalizeTargetId(params.target_id),
    old_values: toJsonString(params.old_values),
    new_values: toJsonString(params.new_values),
    reason: params.reason ?? null,
    created: undefined,
  };
}

// 삭제 로그 등록
export function makeDeleteLogParams(params: LogActionParams): LogActionInsertDto {
  return {
    manager_no: params.manager_no ?? 0,
    school_no: params.school_no ?? 0,
    ip: params.ip ?? null,
    user_agent: params.user_agent ?? null,
    action_type: params.action_type,
    target_table: params.target_table ?? null,
    target_id: normalizeTargetId(params.target_id),
    old_values: toJsonString(params.old_values),
    new_values: null,
    reason: params.reason ?? null,
    created: undefined,
  };
}

// 조회 로그 등록
export function makeSelectLogParams(params: LogActionParams): LogActionInsertDto {
  return {
    manager_no: params.manager_no ?? 0,
    school_no: params.school_no ?? 0,
    ip: params.ip ?? null,
    user_agent: params.user_agent ?? null,
    action_type: params.action_type,
    target_table: params.target_table ?? null,
    target_id: normalizeTargetId(params.target_id),
    old_values: toJsonString(params.old_values),
    new_values: null,
    reason: params.reason ?? null,
    created: undefined,
  };
}

export function getClientInfo(req: import('next/server').NextRequest) {
  return {
    userAgent: req.headers.get('user-agent'),
    ip: req.headers.get('x-forwarded-for'),
  };
}

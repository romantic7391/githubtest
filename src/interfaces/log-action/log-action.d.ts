export interface LogActionInsertDto {
  manager_no: number; // 회원 PK
  school_no: number; // 학교 PK
  ip?: string | null; // 행위 발생 IP
  user_agent?: string | null; // User-Agent
  actionType: string; // 'S' | 'I' | 'U' | 'D'
  targetTable?: string | null; // 대상 테이블명(조회 등에서 없을 수 있음)
  targetId?: string | null; // 대상 테이블 PK(복합키는 파이프라인(|) 구분)
  oldValues?: string | null; // 조회 및 수정 전 값(JSON 문자열)
  newValues?: string | null; // 수정 후 값(JSON 문자열)
  reason?: string | null; // 행위의 이유
  created?: string | null; // 이력 발생 시각(생략 시 DB 기본값)
}

// 로그 파라미터용 DTO
export interface LogActionParams {
  managerNo?: number;
  schoolNo?: number;
  ip?: string | null;
  userAgent?: string | null;
  actionType: string;
  targetTable?: string | null;
  targetId?: string | string[] | null;
  reason?: string | null;
  newValues?: object;
  oldValues?: object;
}

export interface RequestMeta {
  managerNo: number;
  schoolNo: number;
  req?: Request;
}

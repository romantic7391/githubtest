export interface LogActionInsertDto {
  manager_no: number; // 회원 PK
  school_no: number; // 학교 PK
  ip?: string | null; // 행위 발생 IP
  user_agent?: string | null; // User-Agent
  action_type: string; // 'S' | 'I' | 'U' | 'D'
  target_table?: string | null; // 대상 테이블명(조회 등에서 없을 수 있음)
  target_id?: string | null; // 대상 테이블 PK(복합키는 파이프라인(|) 구분)
  old_values?: string | null; // 조회 및 수정 전 값(JSON 문자열)
  new_values?: string | null; // 수정 후 값(JSON 문자열)
  reason?: string | null; // 행위의 이유
  created?: string | null; // 이력 발생 시각(생략 시 DB 기본값)
}

// 로그 파라미터용 DTO
export interface LogActionParams {
  manager_no?: number;
  school_no?: number;
  ip?: string | null;
  user_agent?: string | null;
  action_type: string;
  target_table?: string | null;
  target_id?: string | string[] | null;
  reason?: string | null;
  new_values?: object;
  old_values?: object;
}

export interface RequestMeta {
  manager_no: number;
  school_no: number;
  req?: Request;
}

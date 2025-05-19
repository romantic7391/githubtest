import type { PoolConnection } from 'mariadb';
import { pool } from './conn';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 중첩된 키를 처리하기 위해 경로를 점(.)으로 분리하여 값을 탐색합니다.
 *
 * @param {Record<string, any>} obj 중첩된 키를 포함한 객체
 * @param {string} path 중첩된 키를 포함한 경로 문자열
 * @returns {any} 중첩된 키를 포함한 값
 */
export function resolveNestedValue(obj: Record<string, any>, path: string): any {
  // 중첩된 키를 처리하기 위해 경로를 점(.)으로 분리하여 값을 탐색
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

/**
 * 결과의 행을 ```keyMapping```으로 설정한 객체 타입으로 변환합니다.
 *
 * @param {Record<string, any>} row 결과 객체
 * @param {Record<keyof T, any> | (keyof T | string)[]} keyMapping 매핑 설정 객체
 * @returns {T}
 */
export function mapRow<T = any>(
  row: Record<string, any>, // row를 객체로 명시
  keyMapping?: Record<keyof T, any> | (keyof T | string)[],
): T {
  if (!keyMapping) {
    // `keyMapping`이 없으면 결과를 그대로 반환
    return row as T;
  }

  if (Array.isArray(keyMapping)) {
    // 배열로 변환: 순서를 보장하면서 객체 생성
    return keyMapping.reduce((acc, mappingKey) => {
      (acc as any)[mappingKey] = resolveNestedValue(row, mappingKey as string);
      return acc;
    }, {} as T);
  }

  if (typeof keyMapping === 'object') {
    // 객체로 변환: 중첩된 객체를 처리
    return Object.entries(keyMapping).reduce((acc, [key, mappingKey]) => {
      if (typeof mappingKey === 'string') {
        // 단일 키 매핑
        (acc as Partial<T>)[key as keyof T] = resolveNestedValue(row, mappingKey) as T[keyof T];
      } else if (mappingKey && typeof mappingKey === 'object' && !Array.isArray(mappingKey)) {
        // 중첩 객체 매핑 (null 방지 및 타입 확인 추가)
        (acc as Partial<T>)[key as keyof T] = mapRow(row, mappingKey as Record<keyof T, any>) as T[keyof T];
      }
      return acc;
    }, {} as Partial<T>) as T;
  }

  throw new Error('유효하지 않은 keyMapping 매개변수입니다.');
}

/**
 * 트랜잭션을 시작하면서 커넥션 객체를 반환합니다.
 *
 * @returns {Promise<PoolConnection>} 트랜잭션 커넥션 객체
 */
export async function beginTransaction(): Promise<PoolConnection> {
  let conn;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    return conn;
  } catch (error) {
    if (conn) {
      conn.release();
    }
    throw error;
  }
}

/**
 * 트랜잭션을 커밋합니다.
 *
 * @param {PoolConnection} conn 트랜잭션 커넥션 객체
 */
export async function commitTransaction(conn: PoolConnection): Promise<void> {
  try {
    await conn.commit();
  } catch (error) {
    throw error;
  }
}

/**
 * 트랜잭션을 롤백합니다.
 *
 * @param {PoolConnection} conn 트랜잭션 커넥션 객체
 */
export async function rollbackTransaction(conn: PoolConnection): Promise<void> {
  try {
    await conn.rollback();
  } catch (error) {
    throw error;
  }
}

/**
 * SELECT 쿼리 결과를 모두 가져옵니다.
 *
 * @param {string} query 쿼리 문자열
 * @param {string | number} params 쿼리 파라미터
 * @param {Record<keyof T, any> | (keyof T | string)[]} keyMapping 매핑 객체
 * @param {PoolConnection} externalConn 외부 커넥션 객체
 * @returns {Promise<T[]>}
 *
 * @example
 * // 기본 사용
 * const result = await getAll('SELECT school_no, scode, sname FROM rnSchool WHERE school_no = ?', [1]);
 * // result = [{ school_no: 1, scode: '123456', sname: 'MySchool' }]
 *
 * // 매핑 사용
 * const result = await getAll('SELECT school_no, scode, sname FROM rnSchool WHERE school_no = ?', [1], {
 *   schoolNo: 'school_no',
 *   schoolCode: 'scode',
 *   schoolName: 'sname',
 * });
 * // result = [{ schoolNo: 1, schoolCode: '123456', schoolName: 'MySchool' }]
 *
 * // 중첩 매핑 사용
 * const result = await getAll('SELECT school_no, scode, sname FROM rnSchool WHERE school_no = ?', [1], {
 *   school: {
 *     no: 'school_no',
 *     code: 'scode',
 *     name: 'sname',
 *   },
 * });
 * // result = [{ school: { no: 1, code: '123456', name: 'MySchool' } }]
 *
 * // 트랜잭션 사용 시 함수 외부에서 커넥션 객체 생성 후 외부에서 커밋, 롤백을 처리해야 합니다.
 * const conn = await beginTransaction();
 * const result = await getAll('SELECT school_no, scode, sname FROM rnSchool WHERE school_no = ?', [1], {
 *   school: {
 *     no: 'school_no',
 *     code: 'scode',
 *     name: 'sname',
 *   },
 * }, conn);
 * await commitTransaction(conn); // or await rollbackTransaction(conn);
 */
export async function getAll<T = any>(
  query: string,
  params: (string | number)[] = [],
  keyMapping?: Record<keyof T, any> | (keyof T | string)[],
  externalConn?: PoolConnection,
): Promise<T[]> {
  let result: T[] = [];
  let conn = externalConn;

  try {
    if (!conn) {
      conn = await pool.getConnection();
    }

    const [rows] = await conn.query(query, params);

    if (Array.isArray(rows) && rows.length > 0) {
      result = rows.map((row) => mapRow<T>(row, keyMapping));
    }
  } catch (error) {
    // mariadb 에러는 SqlError 타입
    console.error('[query] getAll error: ', error);
    throw error;
  } finally {
    if (conn && !externalConn) {
      conn.release();
    }
  }

  return result;
}

/**
 * SELECT 쿼리 결과 중 첫 번째 행을 가져옵니다.
 *
 * @param {string} query 쿼리 문자열
 * @param {string | number} params 쿼리 파라미터
 * @param {Record<keyof T, any> | (keyof T | string)[]} keyMapping 매핑 객체
 * @param {PoolConnection} externalConn 외부 커넥션 객체
 * @returns {Promise<T[]>}
 *
 * @example
 * // 기본 사용
 * const result = await getRow('SELECT school_no, scode, sname FROM rnSchool WHERE school_no = ?', [1]);
 * // result = { school_no: 1, scode: '123456', sname: 'MySchool' }
 *
 * // 매핑 사용
 * const result = await getRow('SELECT school_no, scode, sname FROM rnSchool WHERE school_no = ?', [1], {
 *   schoolNo: 'school_no',
 *   schoolCode: 'scode',
 *   schoolName: 'sname',
 * });
 * // result = { schoolNo: 1, schoolCode: '123456', schoolName: 'MySchool' }
 *
 * // 중첩 매핑 사용
 * const result = await getRow('SELECT school_no, scode, sname FROM rnSchool WHERE school_no = ?', [1], {
 *   school: {
 *     no: 'school_no',
 *     code: 'scode',
 *     name: 'sname',
 *   },
 * });
 * // result = { school: { no: 1, code: '123456', name: 'MySchool' } }
 *
 * // 트랜잭션 사용 시 함수 외부에서 커넥션 객체 생성 후 외부에서 커밋, 롤백을 처리해야 합니다.
 * const conn = await beginTransaction();
 * const result = await getRow('SELECT school_no, scode, sname FROM rnSchool WHERE school_no = ?', [1], {
 *   school: { no: 'school_no', code: 'scode', name: 'sname' },
 * }, conn);
 * await commitTransaction(conn); // or await rollbackTransaction(conn);
 */
export async function getRow<T = any>(
  query: string,
  params: (string | number)[] = [],
  keyMapping?: Record<keyof T, any> | (keyof T | string)[],
  externalConn?: PoolConnection,
): Promise<T | null> {
  let result: T | null = null;
  let conn = externalConn;

  try {
    if (!conn) {
      conn = await pool.getConnection();
    }

    const [rows] = await conn.query(query, params);

    if (Array.isArray(rows) && rows.length > 0) {
      result = mapRow<T>(rows[0], keyMapping);
    }
  } catch (error) {
    // mariadb 에러는 SqlError 타입
    console.error('[query] getAll error: ', error);
    throw error;
  } finally {
    if (conn && !externalConn) {
      conn.release();
    }
  }

  return result;
}

/**
 * SELECT 쿼리 결과 중 첫 번째 행의 첫 번째 열을 가져옵니다.
 *
 * @param {string} query 쿼리 문자열
 * @param {string | number} params 쿼리 파라미터
 * @param {PoolConnection} externalConn 외부 커넥션 객체
 * @returns {Promise<T>}
 *
 * @example
 * // 기본 사용
 * const result = await getOne('SELECT school_no FROM rnSchool WHERE school_no = ?', [1]);
 * // result = 1
 *
 * // 트랜잭션 사용 시 함수 외부에서 커넥션 객체 생성 후 외부에서 커밋, 롤백을 처리해야 합니다.
 * const conn = await beginTransaction();
 * const result = await getOne('SELECT school_no FROM rnSchool WHERE school_no = ?', [1], conn);
 * await commitTransaction(conn); // or await rollbackTransaction(conn);
 */
export async function getOne<T = any>(
  query: string,
  params: (string | number)[] = [],
  externalConn?: PoolConnection,
): Promise<T | null> {
  let result: T | null = null;
  let conn = externalConn;

  try {
    if (!conn) {
      conn = await pool.getConnection();
    }

    const [rows] = await conn.query(query, params);

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    const row = rows[0] as Record<string, T>;
    const keys = Object.keys(row);

    result = row[keys[0]];
  } catch (error) {
    // mariadb 에러는 SqlError 타입
    console.error('[query] getAll error: ', error);
    throw error;
  } finally {
    if (conn && !externalConn) {
      conn.release();
    }
  }

  return result;
}

/**
 * SELECT 쿼리를 제외한 모든 쿼리를 실행합니다.
 *
 * @param {string} query 쿼리 문자열
 * @param {string | number} params 쿼리 파라미터
 * @param {PoolConnection} externalConn 외부 커넥션 객체
 * @returns {Promise<{ affectedRows: number, insertId: number, warningStatus: number }>}
 *
 * @example
 * // 기본 사용
 * const result = await exec('INSERT INTO test (col01) VALUES (?)', [1]);
 *
 * // 트랜잭션 사용 시 함수 외부에서 커넥션 객체 생성 후 외부에서 커밋, 롤백을 처리해야 합니다.
 * const conn = await beginTransaction();
 * const result = await exec('INSERT INTO test (col01) VALUES (?)', [1], conn);
 * await commitTransaction(conn); // or await rollbackTransaction(conn);
 */
export async function exec(
  query: string,
  params: (string | number | null)[] = [],
  externalConn?: PoolConnection,
): Promise<{ affectedRows: number; insertId: number; warningStatus: number }> {
  let conn = externalConn;

  try {
    if (query.toUpperCase().startsWith('SELECT')) {
      throw new Error('SELECT 쿼리는 exec 함수를 사용할 수 없습니다.');
    }

    if (!conn) {
      conn = await pool.getConnection();
    }

    const [{ affectedRows, insertId, warningStatus }] = await conn.execute(query, params);
    return {
      affectedRows: Number(affectedRows),
      insertId: Number(insertId),
      warningStatus: Number(warningStatus),
    };
  } catch (error) {
    // mariadb 에러는 SqlError 타입
    console.error('[query] getAll error: ', error);
    throw error;
  } finally {
    if (conn && !externalConn) {
      conn.release();
    }
  }
}

/* eslint-enable @typescript-eslint/no-explicit-any */

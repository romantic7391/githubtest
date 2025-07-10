/**
 * @jest-environment node
 */

import {
  resolveNestedValue,
  mapRow,
  getAll,
  getRow,
  getOne,
  exec,
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
} from '@/lib/mariadb/query';
import { pool } from '@/lib/mariadb/conn';
import type { PoolConnection } from 'mariadb';

jest.mock('@/lib/mariadb/conn', () => {
  return {
    pool: {
      getConnection: jest.fn(),
    },
  };
});

describe('resolveNestedValue', () => {
  it('중첩된 키를 처리하기 위해 경로를 점(.)으로 분리하여 값을 탐색', () => {
    const obj = {
      a: {
        b: {
          c: 'test',
        },
      },
    };

    expect(resolveNestedValue(obj, 'a.b.c')).toBe('test');
  });

  it('중첩된 키가 없는 경우 undefined를 반환', () => {
    const obj = {
      a: {
        b: {
          c: 'test',
        },
      },
    };

    expect(resolveNestedValue(obj, 'a.b.d')).toBeUndefined();
  });
});

describe('mapRow', () => {
  it('행을 객체로 변환', () => {
    const row = {
      a: 'test',
      b: 1,
      c: true,
    };

    const keyMapping = {
      col: 'a',
      col2: 'b',
      col3: 'c',
    };

    expect(mapRow(row, keyMapping)).toEqual({ col: 'test', col2: 1, col3: true });
  });

  it('타입 설정이 없는 경우 결과를 그대로 반환', () => {
    const row = {
      a: 'test',
      b: 1,
      c: true,
    };

    expect(mapRow(row)).toEqual({ a: 'test', b: 1, c: true });
  });

  it('중첩된 키를 포함한 경로 문자열을 탐색', () => {
    const row = {
      a: {
        b: {
          c: 'test',
        },
      },
    };

    const keyMapping = {
      col: 'a.b.c',
    };

    expect(mapRow(row, keyMapping)).toEqual({ col: 'test' });
  });

  it('배열 타입으로 매핑', () => {
    const row = {
      a: 'test',
      b: 1,
      c: true,
    };

    const keyMapping = ['a', 'b', 'c'];

    expect(mapRow(row, keyMapping)).toEqual({ a: 'test', b: 1, c: true });
  });

  it('중첩된 객체 매핑', () => {
    const row = {
      user: {
        name: 'John',
        age: 30,
      },
      settings: {
        theme: 'dark',
        notifications: true,
      },
    };

    const keyMapping = {
      userInfo: {
        fullName: 'user.name',
        userAge: 'user.age',
      },
      preferences: {
        currentTheme: 'settings.theme',
        notifyEnabled: 'settings.notifications',
      },
    };

    expect(mapRow(row, keyMapping)).toEqual({
      userInfo: {
        fullName: 'John',
        userAge: 30,
      },
      preferences: {
        currentTheme: 'dark',
        notifyEnabled: true,
      },
    });
  });

  it('중첩된 객체에 매핑', () => {
    const row = {
      school_no: 1,
      school_code: '123456',
      school_name: 'MySchool',
      user_no: 1,
      user_name: 'John',
      user_age: 30,
      user_email: 'john@example.com',
    };

    const keyMapping = {
      school: {
        no: 'school_no',
        code: 'school_code',
        name: 'school_name',
      },
      user: {
        no: 'user_no',
        name: 'user_name',
        age: 'user_age',
        email: 'user_email',
      },
    };

    expect(mapRow(row, keyMapping)).toEqual({
      school: {
        no: 1,
        code: '123456',
        name: 'MySchool',
      },
      user: {
        no: 1,
        name: 'John',
        age: 30,
        email: 'john@example.com',
      },
    });
  });

  it('유효하지 않은 keyMapping 매개변수에 대해 에러 발생', () => {
    const row = { a: 'test' };
    const invalidkeyMapping = 123;

    // eslint-disable-next-line
    expect(() => mapRow(row, invalidkeyMapping as any)).toThrow('유효하지 않은 keyMapping 매개변수입니다.');
  });

  it('null 또는 undefined 값을 포함한 매핑', () => {
    const row = {
      a: null,
      b: undefined,
      c: {
        d: null,
      },
    };

    const keyMapping = {
      col1: 'a',
      col2: 'b',
      col3: 'c.d',
    };

    expect(mapRow(row, keyMapping)).toEqual({
      col1: null,
      col2: undefined,
      col3: null,
    });
  });

  it('존재하지 않는 중첩 경로에 대한 매핑', () => {
    const row = {
      a: {
        b: 'test',
      },
    };

    const keyMapping = {
      col1: 'a.b.c',
      col2: 'x.y.z',
    };

    expect(mapRow(row, keyMapping)).toEqual({
      col1: undefined,
      col2: undefined,
    });
  });
});

describe('getAll', () => {
  let mockQuery: jest.Mock;
  let mockRelease: jest.Mock;
  const mockGetConnection = pool.getConnection as jest.Mock; // 타입 단언
  let mockConsoleError: jest.SpyInstance;

  // 테스트용 기본 데이터
  const mockDbRows = [
    { id: 1, name_db: 'TestUser1', email_db: 'test1@example.com' },
    { id: 2, name_db: 'TestUser2', email_db: 'test2@example.com' },
  ];
  const mockKeyMapping = { userId: 'id', userName: 'name_db', userEmail: 'email_db' };
  const mockMappedRows = [
    { userId: 1, userName: 'TestUser1', userEmail: 'test1@example.com' },
    { userId: 2, userName: 'TestUser2', userEmail: 'test2@example.com' },
  ];

  beforeEach(() => {
    // 각 테스트 전에 mock 함수들 초기화
    mockQuery = jest.fn();
    mockRelease = jest.fn();

    // pool.getConnection이 모킹된 커넥션 객체를 반환하도록 설정
    mockGetConnection.mockResolvedValue({
      query: mockQuery,
      release: mockRelease,
      // PoolConnection 타입 만족을 위한 추가적인 메서드들 (getAll에서 직접 사용되진 않음)
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      execute: jest.fn(),
      ping: jest.fn().mockResolvedValue(true),
      reset: jest.fn().mockResolvedValue(undefined),
      changeUser: jest.fn().mockResolvedValue(undefined),
      destroy: jest.fn(),
      queryStream: jest.fn(),
      batch: jest.fn(),
      prepare: jest.fn(),
      close: jest.fn(),
      isValid: jest.fn().mockReturnValue(true),
      threadId: 1,
    } as unknown as PoolConnection); // PoolConnection으로 타입 캐스팅

    // console.error를 스파이하여 테스트 중 실제 출력을 막고 호출 여부 확인
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // 모든 모킹 함수 클리어 및 스파이 복원
    jest.clearAllMocks();
    mockConsoleError.mockRestore();
  });

  it('외부 커넥션 없이 호출 시, 데이터를 조회하고 keyMapping에 따라 변환하여 반환해야 합니다.', async () => {
    mockQuery.mockResolvedValueOnce([mockDbRows, []]); // conn.query 결과 시뮬레이션

    const result = await getAll('SELECT * FROM users', [], mockKeyMapping);

    expect(mockGetConnection).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM users', []);
    expect(result).toEqual(mockMappedRows);
    expect(mockRelease).toHaveBeenCalledTimes(1); // 내부적으로 얻은 커넥션은 해제되어야 함
  });

  it('keyMapping이 제공되지 않으면, 조회된 데이터를 그대로 반환해야 합니다 (params 기본값 사용).', async () => {
    mockQuery.mockResolvedValueOnce([mockDbRows, {}]);

    const result = await getAll('SELECT * FROM users'); // params와 keyMapping 생략

    expect(mockGetConnection).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM users', []); // params 기본값 [] 확인
    expect(result).toEqual(mockDbRows); // mapRow가 원본 row를 반환
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });

  it('외부 커넥션이 제공되면, 해당 커넥션을 사용하고 해제하지 않아야 합니다.', async () => {
    const mockExternalQuery = jest.fn().mockResolvedValueOnce([mockDbRows, {}]);
    const mockExternalConnRelease = jest.fn();
    const mockExternalConn = {
      query: mockExternalQuery,
      release: mockExternalConnRelease, // getAll 함수는 이 release를 호출하지 않아야 함
      // PoolConnection 타입 만족을 위한 나머지 메서드들
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      execute: jest.fn(),
      ping: jest.fn().mockResolvedValue(true),
      reset: jest.fn().mockResolvedValue(undefined),
      changeUser: jest.fn().mockResolvedValue(undefined),
      destroy: jest.fn(),
      queryStream: jest.fn(),
      batch: jest.fn(),
      prepare: jest.fn(),
      close: jest.fn(),
      isValid: jest.fn().mockReturnValue(true),
      threadId: 2,
    } as unknown as PoolConnection;

    const result = await getAll('SELECT * FROM users', [], mockKeyMapping, mockExternalConn);

    expect(mockGetConnection).not.toHaveBeenCalled(); // 새 커넥션을 얻지 않아야 함
    expect(mockExternalQuery).toHaveBeenCalledTimes(1);
    expect(mockExternalQuery).toHaveBeenCalledWith('SELECT * FROM users', []);
    expect(result).toEqual(mockMappedRows);
    expect(mockExternalConnRelease).not.toHaveBeenCalled(); // 외부 커넥션의 release는 호출되지 않아야 함
    expect(mockRelease).not.toHaveBeenCalled(); // 내부 release 로직도 호출되지 않아야 함
  });

  it('쿼리 결과 행이 없으면 빈 배열을 반환해야 합니다.', async () => {
    mockQuery.mockResolvedValueOnce([[], []]); // 빈 배열 결과 시뮬레이션

    const result = await getAll('SELECT * FROM users WHERE id = ?', [999]);

    expect(mockGetConnection).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?', [999]);
    expect(result).toEqual([]);
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });

  it('쿼리 결과의 rows 부분이 배열이 아니면 빈 배열을 반환해야 합니다.', async () => {
    // conn.query가 [rows, fields] 형태를 반환한다고 가정할 때, rows가 undefined인 경우
    // eslint-disable-next-line
    mockQuery.mockResolvedValueOnce([undefined as any, []]);

    const result = await getAll('SELECT * FROM users');

    expect(mockGetConnection).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]); // Array.isArray(rows)가 false가 되어 빈 배열 반환
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });

  it('pool.getConnection에서 에러 발생 시, 에러를 로깅하고 다시 throw해야 합니다.', async () => {
    const connectionError = new Error('DB 연결 실패');
    mockGetConnection.mockRejectedValueOnce(connectionError);

    await expect(getAll('SELECT * FROM users', [])).rejects.toThrow(connectionError);

    expect(mockGetConnection).toHaveBeenCalledTimes(1);
    expect(mockQuery).not.toHaveBeenCalled(); // query는 호출되지 않아야 함
    expect(mockConsoleError).toHaveBeenCalledWith('[query] getAll error: ', connectionError);
    expect(mockRelease).not.toHaveBeenCalled(); // 커넥션을 얻지 못했으므로 release도 호출되지 않아야 함
  });

  it('conn.query에서 에러 발생 시 (외부 커넥션 없음), 에러를 로깅하고 커넥션을 해제한 후 다시 throw해야 합니다.', async () => {
    const queryError = new Error('쿼리 실행 실패');
    mockQuery.mockRejectedValueOnce(queryError);

    await expect(getAll('SELECT * FROM users', [])).rejects.toThrow(queryError);

    expect(mockGetConnection).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockConsoleError).toHaveBeenCalledWith('[query] getAll error: ', queryError);
    expect(mockRelease).toHaveBeenCalledTimes(1); // 에러 발생 시에도 커넥션은 해제되어야 함
  });

  it('conn.query에서 에러 발생 시 (외부 커넥션 사용), 에러를 로깅하고 외부 커넥션은 해제하지 않은 채 다시 throw해야 합니다.', async () => {
    const queryError = new Error('외부 커넥션 쿼리 실행 실패');
    const mockExternalQuery = jest.fn().mockRejectedValueOnce(queryError);
    const mockExternalConnRelease = jest.fn();
    const mockExternalConn = {
      query: mockExternalQuery,
      release: mockExternalConnRelease,
      // PoolConnection 타입 만족
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      execute: jest.fn(),
      ping: jest.fn().mockResolvedValue(true),
      reset: jest.fn().mockResolvedValue(undefined),
      changeUser: jest.fn().mockResolvedValue(undefined),
      destroy: jest.fn(),
      queryStream: jest.fn(),
      batch: jest.fn(),
      prepare: jest.fn(),
      close: jest.fn(),
      isValid: jest.fn().mockReturnValue(true),
      threadId: 3,
    } as unknown as PoolConnection;

    await expect(getAll('SELECT * FROM users', [], undefined, mockExternalConn)).rejects.toThrow(queryError);

    expect(mockGetConnection).not.toHaveBeenCalled();
    expect(mockExternalQuery).toHaveBeenCalledTimes(1);
    expect(mockConsoleError).toHaveBeenCalledWith('[query] getAll error: ', queryError);
    expect(mockExternalConnRelease).not.toHaveBeenCalled(); // 외부 커넥션은 여기서 해제하지 않음
    expect(mockRelease).not.toHaveBeenCalled();
  });
});

describe('getRow', () => {
  let mockQuery: jest.Mock;
  let mockRelease: jest.Mock;
  const mockGetConnection = pool.getConnection as jest.Mock;
  let mockConsoleError: jest.SpyInstance;

  const mockDbRow = { id: 1, name_db: 'TestUser', email_db: 'test@example.com' };
  const mockKeyMapping = { userId: 'id', userName: 'name_db', userEmail: 'email_db' };
  const mockMappedRow = { userId: 1, userName: 'TestUser', userEmail: 'test@example.com' };

  beforeEach(() => {
    mockQuery = jest.fn();
    mockRelease = jest.fn();

    mockGetConnection.mockResolvedValue({
      query: mockQuery,
      release: mockRelease,
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      execute: jest.fn(),
      ping: jest.fn().mockResolvedValue(true),
      reset: jest.fn().mockResolvedValue(undefined),
      changeUser: jest.fn().mockResolvedValue(undefined),
      destroy: jest.fn(),
      queryStream: jest.fn(),
      batch: jest.fn(),
      prepare: jest.fn(),
      close: jest.fn(),
      isValid: jest.fn().mockReturnValue(true),
      threadId: 1,
    } as unknown as PoolConnection);

    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockRestore();
  });

  it('외부 커넥션 없이 호출 시, 첫 번째 행을 조회하고 keyMapping에 따라 변환하여 반환해야 함', async () => {
    mockQuery.mockResolvedValueOnce([[mockDbRow], []]);

    const result = await getRow('SELECT * FROM users WHERE id = ?', [1], mockKeyMapping);

    expect(mockGetConnection).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?', [1]);
    expect(result).toEqual(mockMappedRow);
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });

  it('keyMapping이 제공되지 않으면, 첫 번째 행을 그대로 반환해야 함', async () => {
    mockQuery.mockResolvedValueOnce([[mockDbRow], {}]);

    const result = await getRow('SELECT * FROM users WHERE id = ?', [1]);

    expect(mockGetConnection).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?', [1]);
    expect(result).toEqual(mockDbRow);
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });

  it('외부 커넥션이 제공되면, 해당 커넥션을 사용하고 해제하지 않아야 함', async () => {
    const mockExternalQuery = jest.fn().mockResolvedValueOnce([[mockDbRow], {}]);
    const mockExternalConnRelease = jest.fn();
    const mockExternalConn = {
      query: mockExternalQuery,
      release: mockExternalConnRelease,
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      execute: jest.fn(),
      ping: jest.fn().mockResolvedValue(true),
      reset: jest.fn().mockResolvedValue(undefined),
      changeUser: jest.fn().mockResolvedValue(undefined),
      destroy: jest.fn(),
      queryStream: jest.fn(),
      batch: jest.fn(),
      prepare: jest.fn(),
      close: jest.fn(),
      isValid: jest.fn().mockReturnValue(true),
      threadId: 2,
    } as unknown as PoolConnection;

    const result = await getRow('SELECT * FROM users WHERE id = ?', [1], mockKeyMapping, mockExternalConn);

    expect(mockGetConnection).not.toHaveBeenCalled();
    expect(mockExternalQuery).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?', [1]);
    expect(result).toEqual(mockMappedRow);
    expect(mockExternalConnRelease).not.toHaveBeenCalled();
    expect(mockRelease).not.toHaveBeenCalled();
  });

  it('쿼리 결과 행이 없으면 null을 반환해야 함', async () => {
    mockQuery.mockResolvedValueOnce([[], []]);

    const result = await getRow('SELECT * FROM users WHERE id = ?', [999]);

    expect(mockGetConnection).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?', [999]);
    expect(result).toBeNull();
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });

  it('쿼리 결과의 rows 부분이 배열이 아니면 null을 반환해야 함', async () => {
    mockQuery.mockResolvedValueOnce([undefined, []]);

    const result = await getRow('SELECT * FROM users');

    expect(mockGetConnection).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });

  it('pool.getConnection에서 에러 발생 시, 에러를 로깅하고 다시 throw해야 함', async () => {
    const connectionError = new Error('DB 연결 실패');
    mockGetConnection.mockRejectedValueOnce(connectionError);

    await expect(getRow('SELECT * FROM users WHERE id = ?', [1])).rejects.toThrow(connectionError);

    expect(mockGetConnection).toHaveBeenCalledTimes(1);
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockConsoleError).toHaveBeenCalledWith('[query] getAll error: ', connectionError);
    expect(mockRelease).not.toHaveBeenCalled();
  });

  it('conn.query에서 에러 발생 시, 에러를 로깅하고 커넥션을 해제한 후 다시 throw해야 함', async () => {
    const queryError = new Error('쿼리 실행 실패');
    mockQuery.mockRejectedValueOnce(queryError);

    await expect(getRow('SELECT * FROM users WHERE id = ?', [1])).rejects.toThrow(queryError);

    expect(mockGetConnection).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockConsoleError).toHaveBeenCalledWith('[query] getAll error: ', queryError);
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });
});

describe('getOne', () => {
  let mockQuery: jest.Mock;
  let mockRelease: jest.Mock;
  const mockGetConnection = pool.getConnection as jest.Mock;
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    mockQuery = jest.fn();
    mockRelease = jest.fn();

    mockGetConnection.mockResolvedValue({
      query: mockQuery,
      release: mockRelease,
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      execute: jest.fn(),
      ping: jest.fn().mockResolvedValue(true),
      reset: jest.fn().mockResolvedValue(undefined),
      changeUser: jest.fn().mockResolvedValue(undefined),
      destroy: jest.fn(),
      queryStream: jest.fn(),
      batch: jest.fn(),
      prepare: jest.fn(),
      close: jest.fn(),
      isValid: jest.fn().mockReturnValue(true),
      threadId: 1,
    } as unknown as PoolConnection);

    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockRestore();
  });

  it('외부 커넥션 없이 호출 시, 첫 번째 행의 첫 번째 열을 반환해야 함', async () => {
    mockQuery.mockResolvedValueOnce([[{ id: 1 }], []]);

    const result = await getOne('SELECT id FROM users WHERE id = ?', [1]);

    expect(mockGetConnection).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith('SELECT id FROM users WHERE id = ?', [1]);
    expect(result).toBe(1);
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });

  it('외부 커넥션이 제공되면, 해당 커넥션을 사용하고 해제하지 않아야 함', async () => {
    const mockExternalQuery = jest.fn().mockResolvedValueOnce([[{ count: 5 }], {}]);
    const mockExternalConnRelease = jest.fn();
    const mockExternalConn = {
      query: mockExternalQuery,
      release: mockExternalConnRelease,
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      execute: jest.fn(),
      ping: jest.fn().mockResolvedValue(true),
      reset: jest.fn().mockResolvedValue(undefined),
      changeUser: jest.fn().mockResolvedValue(undefined),
      destroy: jest.fn(),
      queryStream: jest.fn(),
      batch: jest.fn(),
      prepare: jest.fn(),
      close: jest.fn(),
      isValid: jest.fn().mockReturnValue(true),
      threadId: 2,
    } as unknown as PoolConnection;

    const result = await getOne('SELECT COUNT(*) as count FROM users', [], mockExternalConn);

    expect(mockGetConnection).not.toHaveBeenCalled();
    expect(mockExternalQuery).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM users', []);
    expect(result).toBe(5);
    expect(mockExternalConnRelease).not.toHaveBeenCalled();
    expect(mockRelease).not.toHaveBeenCalled();
  });

  it('쿼리 결과 행이 없으면 null을 반환해야 함', async () => {
    mockQuery.mockResolvedValueOnce([[], []]);

    const result = await getOne('SELECT id FROM users WHERE id = ?', [999]);

    expect(mockGetConnection).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith('SELECT id FROM users WHERE id = ?', [999]);
    expect(result).toBeNull();
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });

  it('쿼리 결과의 rows 부분이 배열이 아니면 null을 반환해야 함', async () => {
    mockQuery.mockResolvedValueOnce([undefined, []]);

    const result = await getOne('SELECT id FROM users');

    expect(mockGetConnection).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });

  it('pool.getConnection에서 에러 발생 시, 에러를 로깅하고 다시 throw해야 함', async () => {
    const connectionError = new Error('DB 연결 실패');
    mockGetConnection.mockRejectedValueOnce(connectionError);

    await expect(getOne('SELECT id FROM users WHERE id = ?', [1])).rejects.toThrow(connectionError);

    expect(mockGetConnection).toHaveBeenCalledTimes(1);
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockConsoleError).toHaveBeenCalledWith('[query] getAll error: ', connectionError);
    expect(mockRelease).not.toHaveBeenCalled();
  });

  it('conn.query에서 에러 발생 시, 에러를 로깅하고 커넥션을 해제한 후 다시 throw해야 함', async () => {
    const queryError = new Error('쿼리 실행 실패');
    mockQuery.mockRejectedValueOnce(queryError);

    await expect(getOne('SELECT id FROM users WHERE id = ?', [1])).rejects.toThrow(queryError);

    expect(mockGetConnection).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockConsoleError).toHaveBeenCalledWith('[query] getAll error: ', queryError);
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });
});

describe('exec', () => {
  let mockExecute: jest.Mock;
  let mockRelease: jest.Mock;
  const mockGetConnection = pool.getConnection as jest.Mock;
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    mockExecute = jest.fn();
    mockRelease = jest.fn();

    mockGetConnection.mockResolvedValue({
      query: jest.fn(),
      release: mockRelease,
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      execute: mockExecute,
      ping: jest.fn().mockResolvedValue(true),
      reset: jest.fn().mockResolvedValue(undefined),
      changeUser: jest.fn().mockResolvedValue(undefined),
      destroy: jest.fn(),
      queryStream: jest.fn(),
      batch: jest.fn(),
      prepare: jest.fn(),
      close: jest.fn(),
      isValid: jest.fn().mockReturnValue(true),
      threadId: 1,
    } as unknown as PoolConnection);

    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockRestore();
  });

  it('INSERT 쿼리를 정상적으로 실행해야 함', async () => {
    const mockResult = { affectedRows: 1, insertId: 123, warningStatus: 0 };
    mockExecute.mockResolvedValueOnce([mockResult]);

    const result = await exec('INSERT INTO users (name, email) VALUES (?, ?)', ['Test', 'test@example.com']);

    expect(mockGetConnection).toHaveBeenCalledTimes(1);
    expect(mockExecute).toHaveBeenCalledWith('INSERT INTO users (name, email) VALUES (?, ?)', [
      'Test',
      'test@example.com',
    ]);
    expect(result).toEqual({
      affectedRows: 1,
      insertId: 123,
      warningStatus: 0,
    });
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });

  it('UPDATE 쿼리를 정상적으로 실행해야 함', async () => {
    const mockResult = { affectedRows: 2, insertId: 0, warningStatus: 0 };
    mockExecute.mockResolvedValueOnce([mockResult]);

    const result = await exec('UPDATE users SET name = ? WHERE id = ?', ['NewName', 1]);

    expect(mockGetConnection).toHaveBeenCalledTimes(1);
    expect(mockExecute).toHaveBeenCalledWith('UPDATE users SET name = ? WHERE id = ?', ['NewName', 1]);
    expect(result).toEqual({
      affectedRows: 2,
      insertId: 0,
      warningStatus: 0,
    });
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });

  it('DELETE 쿼리를 정상적으로 실행해야 함', async () => {
    const mockResult = { affectedRows: 1, insertId: 0, warningStatus: 0 };
    mockExecute.mockResolvedValueOnce([mockResult]);

    const result = await exec('DELETE FROM users WHERE id = ?', [1]);

    expect(mockGetConnection).toHaveBeenCalledTimes(1);
    expect(mockExecute).toHaveBeenCalledWith('DELETE FROM users WHERE id = ?', [1]);
    expect(result).toEqual({
      affectedRows: 1,
      insertId: 0,
      warningStatus: 0,
    });
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });

  it('외부 커넥션이 제공되면, 해당 커넥션을 사용하고 해제하지 않아야 함', async () => {
    const mockExternalExecute = jest.fn().mockResolvedValueOnce([{ affectedRows: 1, insertId: 456, warningStatus: 0 }]);
    const mockExternalConnRelease = jest.fn();
    const mockExternalConn = {
      query: jest.fn(),
      release: mockExternalConnRelease,
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      execute: mockExternalExecute,
      ping: jest.fn().mockResolvedValue(true),
      reset: jest.fn().mockResolvedValue(undefined),
      changeUser: jest.fn().mockResolvedValue(undefined),
      destroy: jest.fn(),
      queryStream: jest.fn(),
      batch: jest.fn(),
      prepare: jest.fn(),
      close: jest.fn(),
      isValid: jest.fn().mockReturnValue(true),
      threadId: 2,
    } as unknown as PoolConnection;

    const result = await exec('INSERT INTO users (name) VALUES (?)', ['Test'], mockExternalConn);

    expect(mockGetConnection).not.toHaveBeenCalled();
    expect(mockExternalExecute).toHaveBeenCalledWith('INSERT INTO users (name) VALUES (?)', ['Test']);
    expect(result).toEqual({
      affectedRows: 1,
      insertId: 456,
      warningStatus: 0,
    });
    expect(mockExternalConnRelease).not.toHaveBeenCalled();
    expect(mockRelease).not.toHaveBeenCalled();
  });

  it('SELECT 쿼리일 때 에러를 발생시켜야 함', async () => {
    await expect(exec('SELECT * FROM users')).rejects.toThrow('SELECT 쿼리는 exec 함수를 사용할 수 없습니다.');

    expect(mockGetConnection).not.toHaveBeenCalled();
    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockRelease).not.toHaveBeenCalled();
  });

  it('소문자 select 쿼리일 때도 에러를 발생시켜야 함', async () => {
    await expect(exec('select * from users')).rejects.toThrow('SELECT 쿼리는 exec 함수를 사용할 수 없습니다.');

    expect(mockGetConnection).not.toHaveBeenCalled();
    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockRelease).not.toHaveBeenCalled();
  });

  it('pool.getConnection에서 에러 발생 시, 에러를 로깅하고 다시 throw해야 함', async () => {
    const connectionError = new Error('DB 연결 실패');
    mockGetConnection.mockRejectedValueOnce(connectionError);

    await expect(exec('INSERT INTO users (name) VALUES (?)', ['Test'])).rejects.toThrow(connectionError);

    expect(mockGetConnection).toHaveBeenCalledTimes(1);
    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockConsoleError).toHaveBeenCalledWith('[query] getAll error: ', connectionError);
    expect(mockRelease).not.toHaveBeenCalled();
  });

  it('conn.execute에서 에러 발생 시, 에러를 로깅하고 커넥션을 해제한 후 다시 throw해야 함', async () => {
    const executeError = new Error('쿼리 실행 실패');
    mockExecute.mockRejectedValueOnce(executeError);

    await expect(exec('INSERT INTO users (name) VALUES (?)', ['Test'])).rejects.toThrow(executeError);

    expect(mockGetConnection).toHaveBeenCalledTimes(1);
    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(mockConsoleError).toHaveBeenCalledWith('[query] getAll error: ', executeError);
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });
});

describe('트랜잭션 함수들', () => {
  let mockQuery: jest.Mock;
  let mockRelease: jest.Mock;
  let mockBeginTransaction: jest.Mock;
  let mockCommit: jest.Mock;
  let mockRollback: jest.Mock;
  const mockGetConnection = pool.getConnection as jest.Mock;
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    mockQuery = jest.fn();
    mockRelease = jest.fn();
    mockBeginTransaction = jest.fn();
    mockCommit = jest.fn();
    mockRollback = jest.fn();

    mockGetConnection.mockResolvedValue({
      query: mockQuery,
      release: mockRelease,
      beginTransaction: mockBeginTransaction,
      commit: mockCommit,
      rollback: mockRollback,
      ping: jest.fn().mockResolvedValue(true),
      reset: jest.fn().mockResolvedValue(undefined),
      changeUser: jest.fn().mockResolvedValue(undefined),
      destroy: jest.fn(),
      queryStream: jest.fn(),
      batch: jest.fn(),
      prepare: jest.fn(),
      close: jest.fn(),
      isValid: jest.fn().mockReturnValue(true),
      threadId: 1,
    } as unknown as PoolConnection);

    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockRestore();
  });

  describe('beginTransaction', () => {
    it('트랜잭션을 정상적으로 시작해야 함', async () => {
      const conn = await beginTransaction();

      expect(mockGetConnection).toHaveBeenCalledTimes(1);
      expect(mockBeginTransaction).toHaveBeenCalledTimes(1);
      expect(conn).toBeDefined();
      expect(mockRelease).not.toHaveBeenCalled(); // 성공 시에는 release 호출 안됨
    });

    it('getConnection 실패 시 에러를 발생시켜야 함', async () => {
      const connectionError = new Error('DB 연결 실패');
      mockGetConnection.mockRejectedValueOnce(connectionError);

      await expect(beginTransaction()).rejects.toThrow(connectionError);
      expect(mockGetConnection).toHaveBeenCalledTimes(1);
      expect(mockBeginTransaction).not.toHaveBeenCalled();
    });

    it('beginTransaction 실패 시 커넥션을 해제하고 에러를 발생시켜야 함', async () => {
      const transactionError = new Error('트랜잭션 시작 실패');
      mockBeginTransaction.mockRejectedValueOnce(transactionError);

      await expect(beginTransaction()).rejects.toThrow(transactionError);
      expect(mockGetConnection).toHaveBeenCalledTimes(1);
      expect(mockBeginTransaction).toHaveBeenCalledTimes(1);
      expect(mockRelease).toHaveBeenCalledTimes(1); // 실패 시 커넥션 해제
    });
  });

  describe('commitTransaction', () => {
    it('트랜잭션을 정상적으로 커밋해야 함', async () => {
      const mockConn = {
        commit: mockCommit,
        release: mockRelease,
      } as unknown as PoolConnection;

      await commitTransaction(mockConn);

      expect(mockCommit).toHaveBeenCalledTimes(1);
      expect(mockRelease).toHaveBeenCalledTimes(1);
    });

    it('커밋 실패 시 에러를 발생시켜야 함', async () => {
      const commitError = new Error('커밋 실패');
      mockCommit.mockRejectedValueOnce(commitError);

      const mockConn = {
        commit: mockCommit,
        release: mockRelease,
      } as unknown as PoolConnection;

      await expect(commitTransaction(mockConn)).rejects.toThrow(commitError);
      expect(mockCommit).toHaveBeenCalledTimes(1);
      expect(mockRelease).toHaveBeenCalledTimes(1); // finally 블록에서 실행
    });

    it('커밋 성공 후에도 커넥션을 해제해야 함', async () => {
      const mockConn = {
        commit: mockCommit,
        release: mockRelease,
      } as unknown as PoolConnection;

      await commitTransaction(mockConn);

      expect(mockCommit).toHaveBeenCalledTimes(1);
      expect(mockRelease).toHaveBeenCalledTimes(1);
    });
  });

  describe('rollbackTransaction', () => {
    it('트랜잭션을 정상적으로 롤백해야 함', async () => {
      const mockConn = {
        rollback: mockRollback,
        release: mockRelease,
      } as unknown as PoolConnection;

      await rollbackTransaction(mockConn);

      expect(mockRollback).toHaveBeenCalledTimes(1);
      expect(mockRelease).toHaveBeenCalledTimes(1);
    });

    it('롤백 실패 시 에러를 발생시켜야 함', async () => {
      const rollbackError = new Error('롤백 실패');
      mockRollback.mockRejectedValueOnce(rollbackError);

      const mockConn = {
        rollback: mockRollback,
        release: mockRelease,
      } as unknown as PoolConnection;

      await expect(rollbackTransaction(mockConn)).rejects.toThrow(rollbackError);
      expect(mockRollback).toHaveBeenCalledTimes(1);
      expect(mockRollback).toHaveBeenCalledTimes(1);
      expect(mockRelease).toHaveBeenCalledTimes(1); // finally 블록에서 실행
    });

    it('롤백 성공 후에도 커넥션을 해제해야 함', async () => {
      const mockConn = {
        rollback: mockRollback,
        release: mockRelease,
      } as unknown as PoolConnection;

      await rollbackTransaction(mockConn);

      expect(mockRollback).toHaveBeenCalledTimes(1);
      expect(mockRelease).toHaveBeenCalledTimes(1);
    });
  });

  describe('트랜잭션 통합 테스트', () => {
    it('전체 트랜잭션 플로우가 정상적으로 작동해야 함', async () => {
      // 1. 트랜잭션 시작
      const conn = await beginTransaction();
      expect(conn).toBeDefined();

      // 2. 트랜잭션 커밋
      await commitTransaction(conn);

      expect(mockGetConnection).toHaveBeenCalledTimes(1);
      expect(mockBeginTransaction).toHaveBeenCalledTimes(1);
      expect(mockCommit).toHaveBeenCalledTimes(1);
      expect(mockRelease).toHaveBeenCalledTimes(1);
    });

    it('롤백 플로우가 정상적으로 작동해야 함', async () => {
      // 1. 트랜잭션 시작
      const conn = await beginTransaction();
      expect(conn).toBeDefined();

      // 2. 트랜잭션 롤백
      await rollbackTransaction(conn);

      expect(mockGetConnection).toHaveBeenCalledTimes(1);
      expect(mockBeginTransaction).toHaveBeenCalledTimes(1);
      expect(mockRollback).toHaveBeenCalledTimes(1);
      expect(mockRelease).toHaveBeenCalledTimes(1);
    });
  });
});

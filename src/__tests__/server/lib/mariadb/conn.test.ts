/**
 * @jest-environment node
 */

// 1. 테스트할 모의 함수를 jest.mock보다 먼저, 외부에서 생성합니다.
const mockCreatePoolImplementation = jest.fn();

// 2. jest.mock의 팩토리 함수가 위에서 생성한 모의 함수를 사용하도록 합니다.
//    이렇게 하면 conn.ts 내부에서 import하는 mariadb.createPool도 이 mockCreatePoolImplementation을 참조하게 됩니다.
jest.mock('mariadb', () => ({
  createPool: mockCreatePoolImplementation.mockReturnValue({
    // mockReturnValue는 여기에 연결
    getConnection: jest.fn().mockResolvedValue({
      query: jest.fn(),
      release: jest.fn(),
    }),
  }),
}));

// 이제 테스트 파일 내에서 'mariadb'를 직접 import하여 createPool을 참조할 필요는 없습니다.
// 대신 'mockCreatePoolImplementation'을 직접 검사합니다.
// import mariadb from 'mariadb'; // 이 줄은 더 이상 expect의 대상이 아님

describe('MariaDB Connection Pool', () => {
  beforeEach(() => {
    process.env.MARIADB_HOST = 'localhost';
    process.env.MARIADB_USER = 'user';
    process.env.MARIADB_PASSWORD = 'password';
    process.env.MARIADB_DATABASE = 'testdb';
    delete process.env.MARIADB_PORT;

    // mockCreatePoolImplementation의 호출 기록과 상태를 각 테스트 전에 초기화합니다.
    // mockCreatePoolImplementation.mockClear();
    jest.clearAllMocks();

    // 모듈 캐시를 리셋하여 각 테스트에서 conn.ts가 새로 로드되도록 합니다.
    jest.resetModules();
  });

  it('should create a pool with correct configuration', () => {
    process.env.MARIADB_PORT = '3307';

    // conn.ts 모듈을 require합니다.
    // 이 시점에 conn.ts는 내부적으로 mockCreatePoolImplementation을 호출합니다.
    const { pool } = require('@/lib/mariadb/conn');

    // 디버깅 로그 (선택 사항, 이제 mock.calls에 기록이 있어야 함)
    console.log(
      '[Test file scope] mockCreatePoolImplementation.mock.calls for 3307:',
      JSON.stringify(mockCreatePoolImplementation.mock.calls, null, 2),
    );

    // 이제 공유된 mockCreatePoolImplementation을 직접 검사합니다.
    expect(mockCreatePoolImplementation).toHaveBeenCalledWith({
      host: 'localhost',
      user: 'user',
      password: 'password',
      database: 'testdb',
      port: 3307,
      dateStrings: true,
      bigIntAsNumber: true,
      insertIdAsNumber: true,
      metaAsArray: true,
    });
  });

  it('should use default port 3306 when MARIADB_PORT is undefined', () => {
    // conn.ts 모듈을 require합니다.
    const { pool } = require('@/lib/mariadb/conn');

    // 디버깅 로그 (선택 사항)
    console.log(
      '[Test file scope - default] mockCreatePoolImplementation.mock.calls for 3306:',
      JSON.stringify(mockCreatePoolImplementation.mock.calls, null, 2),
    );

    expect(mockCreatePoolImplementation).toHaveBeenCalledWith({
      host: 'localhost',
      user: 'user',
      password: 'password',
      database: 'testdb',
      port: 3306,
      dateStrings: true,
      bigIntAsNumber: true,
      insertIdAsNumber: true,
      metaAsArray: true,
    });
  });
});

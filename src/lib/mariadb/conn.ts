import mariadb from 'mariadb';

const {
  MARIADB_HOST: host,
  MARIADB_USER: user,
  MARIADB_PASSWORD: password,
  MARIADB_DATABASE: database = 'test_air',
  MARIADB_PORT: port,
} = process.env;

function registerService(name: string, initFn: () => mariadb.Pool): mariadb.Pool {
  if (process.env.NODE_ENV === 'development') {
    if (!(name in (global as typeof globalThis & Record<string, mariadb.Pool>))) {
      (global as typeof globalThis & Record<string, mariadb.Pool>)[name] = initFn();
    }
    return (global as typeof globalThis & Record<string, mariadb.Pool>)[name];
  }
  return initFn();
}

function logConnection(pool: mariadb.Pool) {
  pool.on('acquire', (conn) => {
    console.log(
      `[db][conn] Connection#${conn.threadId} 획득 (active: ${pool.activeConnections()} / idle: ${pool.idleConnections()} / total: ${pool.totalConnections()})`,
    );
  });

  pool.on('release', (conn) => {
    console.log(
      `[db][conn] Connection#${conn.threadId} 반환 (active: ${pool.activeConnections()} / idle: ${pool.idleConnections()} / total: ${pool.totalConnections()})`,
    );
  });

  pool.on('connection', (conn) => {
    console.log(
      `[db][conn] Connection#${conn.threadId} 연결 (active: ${pool.activeConnections()} / idle: ${pool.idleConnections()} / total: ${pool.totalConnections()})`,
    );
  });

  pool.on('enqueue', () => {
    console.log(
      `[db][conn] 대기 중인 쿼리가 있습니다. (active: ${pool.activeConnections()} / idle: ${pool.idleConnections()} / total: ${pool.totalConnections()})`,
    );
  });
}

let pool: mariadb.Pool;

try {
  pool = registerService('pool', () => {
    const _pool = mariadb.createPool({
      host,
      user,
      password,
      database,
      port: Number(port ?? '3306'),

      connectionLimit: 5,
      idleTimeout: 60 * 30,
      acquireTimeout: 1000 * 10,
      connectTimeout: 1000 * 10,

      // 날짜 타입을 문자열로 변환
      dateStrings: true,
      // BIGINT 타입을 number로 변환
      bigIntAsNumber: true,
      insertIdAsNumber: true,

      metaAsArray: true,
    });

    if (process.env.NODE_ENV === 'development' && process.env.MARIADB_CONN_LOG === '1') {
      logConnection(_pool);
    }

    return _pool;
  });
} catch (error) {
  console.error(`[db][conn] 데이터베이스 연결 실패: ${error}`);
}

export { pool };

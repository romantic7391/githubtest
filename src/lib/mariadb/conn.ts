import mariadb from 'mariadb';

const {
  MARIADB_HOST: host,
  MARIADB_USER: user,
  MARIADB_PASSWORD: password,
  MARIADB_DATABASE: database = 'test_air',
  MARIADB_PORT: port,
} = process.env;

export const pool = mariadb.createPool({
  host,
  user,
  password,
  database,
  port: Number(port ?? '3306'),

  connectionLimit: 10,
  idleTimeout: 1000 * 60,
  acquireTimeout: 1000 * 10,

  // 날짜 타입을 문자열로 변환
  dateStrings: true,
  // BIGINT 타입을 number로 변환
  bigIntAsNumber: true,
  insertIdAsNumber: true,

  metaAsArray: true,
});

// DB 커넥션 로깅
// if (process.env.NODE_ENV === 'development') {
//   pool.on('acquire', (conn) => {
//     console.log(`[db][conn] Connection#${conn.threadId} 획득 (active: ${pool.activeConnections()} / idle: ${pool.idleConnections()} / total: ${pool.totalConnections()})`);
//   });

//   pool.on('release', (conn) => {
//     console.log(`[db][conn] Connection#${conn.threadId} 반환 (active: ${pool.activeConnections()} / idle: ${pool.idleConnections()} / total: ${pool.totalConnections()})`);
//   });

//   pool.on('connection', (conn) => {
//     console.log(`[db][conn] Connection#${conn.threadId} 연결 (active: ${pool.activeConnections()} / idle: ${pool.idleConnections()} / total: ${pool.totalConnections()})`);
//   });

//   pool.on('enqueue', () => {
//     console.log(`[db][conn] 대기 중인 쿼리가 있습니다. (active: ${pool.activeConnections()} / idle: ${pool.idleConnections()} / total: ${pool.totalConnections()})`);
//   });
// }

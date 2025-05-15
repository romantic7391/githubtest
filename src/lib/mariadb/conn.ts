import mariadb from 'mariadb';

const {
  MARIADB_HOST: host,
  MARIADB_USER: user,
  MARIADB_PASSWORD: password,
  MARIADB_DATABASE: database,
  MARIADB_PORT: port,
} = process.env;

export const pool = mariadb.createPool({
  host,
  user,
  password,
  database,
  port: Number(port ?? '3306'),

  // 날짜 타입을 문자열로 변환
  dateStrings: true,
  // BIGINT 타입을 number로 변환
  bigIntAsNumber: true,
  insertIdAsNumber: true,

  metaAsArray: true,
});

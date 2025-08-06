/**
 * 이 함수는 새로운 Next.js 서버 인스턴스가 시작될 때 한 번만 호출됩니다.
 */
export function register() {
  console.info('[instrumentation] checking environment variables...');
  console.info(`[instrumentation] runtime: ${process.env.NEXT_RUNTIME}`);
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.table({
      TZ: process.env.TZ,
      NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED,
      NODE_EXTRA_CA_CERTS: process.env.NODE_EXTRA_CA_CERTS,
      NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
      PORT: process.env.PORT,
      MARIADB_HOST: process.env.MARIADB_HOST,
      MARIADB_PORT: process.env.MARIADB_PORT,
      MARIADB_USER: process.env.MARIADB_USER,
      MARIADB_PASSWORD: process.env.MARIADB_PASSWORD,
      MARIADB_DATABASE: process.env.MARIADB_DATABASE,
      MARIADB_CONN_LOG: process.env.MARIADB_CONN_LOG,
      PLAYWRIGHT_HTML_OUTPUT_DIR: process.env.PLAYWRIGHT_HTML_OUTPUT_DIR,
      AUTH_SECRET: process.env.AUTH_SECRET,
      AUTH_TRUST: process.env.AUTH_TRUST,
      AUTH_URL: process.env.AUTH_URL,
      WORKING_ON_BACKEND_DEVELOPMENT: process.env.WORKING_ON_BACKEND_DEVELOPMENT,
      SCHOOLINFO_API_KEY: process.env.SCHOOLINFO_API_KEY,
      CACHE_TTL: process.env.CACHE_TTL,
    });

    // new Promise(async (resolve, reject) => {
    //   const { beginTransaction, commitTransaction, rollbackTransaction } = await import('@/lib/mariadb/query');
    //   let conn;
    //   try {
    //     console.info('[instrumentation] Initializing data...');
    //     conn = await beginTransaction();

    //     // TODO: 서비스 처음 실행 시 필요한 데이터 생성

    //     await commitTransaction(conn);
    //     resolve(true);
    //   } catch (error) {
    //     if (conn) {
    //       await rollbackTransaction(conn);
    //     }

    //     reject(error);
    //   }
    // }).catch((error) => {
    //   throw error;
    // });
  }
}

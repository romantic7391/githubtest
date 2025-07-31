/**
 * 이 함수는 새로운 Next.js 서버 인스턴스가 시작될 때 한 번만 호출됩니다.
 */
export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    new Promise(async (resolve, reject) => {
      const { beginTransaction, commitTransaction, rollbackTransaction } = await import('@/lib/mariadb/query');
      let conn;
      try {
        conn = await beginTransaction();

        // TODO: 서비스 처음 실행 시 필요한 데이터 생성

        await commitTransaction(conn);
        resolve(true);
      } catch (error) {
        if (conn) {
          await rollbackTransaction(conn);
        }

        reject(error);
      }
    }).catch((error) => {
      throw error;
    });
  }
}

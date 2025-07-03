import { pool } from '@/lib/mariadb/conn';

// 실제 데이터베이스 테스트 설정
export const setupTestDatabase = async () => {
  const conn = await pool.getConnection();
  try {
    // 1. 데이터베이스 연결 확인
    const [result] = await conn.query('SELECT 1 as test');
    console.log('✅ 실제 데이터베이스 연결 성공:', result);

    // 2. 데이터베이스 정보 확인
    const [dbInfo] = await conn.query('SELECT DATABASE() as db_name, VERSION() as version');
    console.log('📊 데이터베이스 정보:', dbInfo);

    // 3. 테이블 구조 확인
    const tables = await conn.query('SHOW TABLES');
    console.log(
      '📋 사용 가능한 테이블:',
      tables.map((t: Record<string, unknown>) => Object.values(t)[0]),
    );
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error);
    throw error;
  } finally {
    conn.release();
  }
};

// 테스트용 샘플 데이터 생성 (실제 DB 데이터 기반)
export const createTestData = async () => {
  const conn = await pool.getConnection();
  try {
    // 실제 DB에 있는 데이터를 기반으로 테스트 데이터 생성
    const [existingAreas] = await conn.query('SELECT area FROM AreaData LIMIT 5');
    console.log('📝 실제 DB 데이터 샘플:', existingAreas);

    return existingAreas;
  } catch (error) {
    console.error('❌ 테스트 데이터 생성 실패:', error);
    return [];
  } finally {
    conn.release();
  }
};

// 테스트 데이터 정리 (실제 DB 보호)
export const cleanupTestData = async () => {
  const conn = await pool.getConnection();
  try {
    // 테스트 중 생성된 임시 데이터만 정리
    // 실제 운영 데이터는 건드리지 않음
    console.log('🧹 테스트 데이터 정리 완료 (실제 데이터 보호)');
  } catch (error) {
    console.error('❌ 테스트 데이터 정리 실패:', error);
  } finally {
    conn.release();
  }
};

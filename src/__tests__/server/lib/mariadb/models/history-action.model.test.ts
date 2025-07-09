import { insertLogAction } from '@/models/history-action/history-action.model';
import { setupTestDatabase, cleanupTestData } from './setup';
import { History } from '@/types/history';
import { pool } from '@/lib/mariadb/conn';
import type { PoolConnection } from 'mariadb';

describe('HistoryAction Model - 실제 데이터베이스 테스트', () => {
  beforeAll(async () => {
    // 실제 데이터베이스 연결 및 정보 확인
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestData();
    // 데이터베이스 연결 풀 정리
    if (pool) {
      await pool.end();
    }
  });

  describe('실제 데이터베이스 로그 삽입 테스트', () => {
    it('로그 액션을 실제 DB에 삽입해야 함', async () => {
      const testLogData: History = {
        managerNo: 1,
        schoolNo: 1,
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        actionType: 'I',
        targetTable: 'rnSchool',
        targetId: '1',
        oldValues: null,
        newValues: JSON.stringify({ sname: '테스트학교', scode: 'TEST001' }),
        reason: '테스트 로그 삽입',
      };

      // 실제 DB에 로그 삽입
      const result = await insertLogAction(testLogData);
      expect(result).toBeDefined();
      console.log('✅ 로그 액션 삽입 성공:', result);

      // 삽입된 로그 확인 (log_no 컬럼명 사용)
      const { getAll } = await import('@/lib/mariadb/query');
      const insertedLogs = await getAll(
        'SELECT * FROM history WHERE manager_no = ? AND school_no = ? AND action_type = ? ORDER BY log_no DESC LIMIT 1',
        [testLogData.managerNo, testLogData.schoolNo, testLogData.actionType],
      );

      expect(insertedLogs).toHaveLength(1);
      const insertedLog = insertedLogs[0];
      expect(insertedLog.manager_no).toBe(testLogData.managerNo);
      expect(insertedLog.school_no).toBe(testLogData.schoolNo);
      expect(insertedLog.action_type).toBe(testLogData.actionType);
      expect(insertedLog.target_table).toBe(testLogData.targetTable);
      expect(insertedLog.target_id).toBe(testLogData.targetId);
      expect(insertedLog.reason).toBe(testLogData.reason);

      console.log('✅ 로그 액션 검증 성공');
    });

    it('다양한 액션 타입으로 로그를 삽입해야 함', async () => {
      const actionTypes: Array<'S' | 'I' | 'U' | 'D'> = ['S', 'I', 'U', 'D'];

      for (const actionType of actionTypes) {
        const testLogData: History = {
          managerNo: 1,
          schoolNo: 1,
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          actionType,
          targetTable: 'rnSchool',
          targetId: '1',
          oldValues: null,
          newValues: null,
          reason: `다양한 액션 타입 테스트 ${actionType}`,
        };

        const result = await insertLogAction(testLogData);
        expect(result).toBeDefined();
        console.log(`✅ ${actionType} 액션 타입 삽입 성공`);
      }
    });

    it('null 값이 포함된 로그를 삽입해야 함', async () => {
      // school_no는 NOT NULL이므로 유효한 값 사용
      const testLogData: History = {
        managerNo: 1,
        schoolNo: 1, // school_no는 NOT NULL이므로 유효한 값 사용
        ip: null,
        userAgent: null,
        actionType: 'S',
        targetTable: null,
        targetId: null,
        oldValues: null,
        newValues: null,
        reason: null,
      };

      const result = await insertLogAction(testLogData);
      expect(result).toBeDefined();
      console.log('✅ null 값 포함 로그 삽입 성공');

      // 삽입된 로그 확인
      const { getAll } = await import('@/lib/mariadb/query');
      const insertedLogs = await getAll(
        'SELECT * FROM history WHERE manager_no = ? AND action_type = ? ORDER BY log_no DESC LIMIT 1',
        [testLogData.managerNo, testLogData.actionType],
      );

      expect(insertedLogs).toHaveLength(1);
      const insertedLog = insertedLogs[0];
      expect(insertedLog.ip).toBeNull();
      expect(insertedLog.user_agent).toBeNull();
      expect(insertedLog.target_table).toBeNull();
      expect(insertedLog.target_id).toBeNull();
      expect(insertedLog.old_values).toBeNull();
      expect(insertedLog.new_values).toBeNull();
      expect(insertedLog.reason).toBeNull();

      console.log('✅ null 값 포함 로그 검증 성공');
    });

    it('JSON 형태의 old_values와 new_values를 삽입해야 함', async () => {
      const oldValues = JSON.stringify({
        sname: '이전학교명',
        scode: 'OLD001',
        area: '서울',
        active: 'Y',
      });

      const newValues = JSON.stringify({
        sname: '새학교명',
        scode: 'NEW001',
        area: '부산',
        active: 'N',
      });

      const testLogData: History = {
        managerNo: 1,
        schoolNo: 1,
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        actionType: 'U',
        targetTable: 'rnSchool',
        targetId: '1',
        oldValues,
        newValues,
        reason: '학교 정보 업데이트',
      };

      const result = await insertLogAction(testLogData);
      expect(result).toBeDefined();
      console.log('✅ JSON 형태 로그 삽입 성공');

      // 삽입된 로그 확인 (log_no 컬럼명 사용)
      const { getAll } = await import('@/lib/mariadb/query');
      const insertedLogs = await getAll(
        'SELECT * FROM history WHERE action_type = ? AND target_id = ? ORDER BY log_no DESC LIMIT 1',
        [testLogData.actionType, testLogData.targetId],
      );

      expect(insertedLogs).toHaveLength(1);
      const insertedLog = insertedLogs[0];
      expect(insertedLog.old_values).toBe(oldValues);
      expect(insertedLog.new_values).toBe(newValues);

      // JSON 파싱 테스트
      const parsedOldValues = JSON.parse(insertedLog.old_values);
      const parsedNewValues = JSON.parse(insertedLog.new_values);
      expect(parsedOldValues.sname).toBe('이전학교명');
      expect(parsedNewValues.sname).toBe('새학교명');

      console.log('✅ JSON 형태 로그 검증 성공');
    });
  });

  describe('에러 처리 테스트', () => {
    it('잘못된 파라미터로 로그 삽입 시 에러가 발생해야 함', async () => {
      // 잘못된 데이터 타입으로 테스트 (숫자 대신 문자열)
      const invalidLogData = {
        managerNo: 'invalid' as unknown as number,
        schoolNo: 'invalid' as unknown as number,
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        actionType: 'I',
        targetTable: 'rnSchool',
        targetId: '1',
        oldValues: null,
        newValues: null,
        reason: '잘못된 데이터 타입 테스트',
      } as History;

      await expect(insertLogAction(invalidLogData)).rejects.toThrow();
      console.log('✅ 잘못된 파라미터 에러 처리 성공');
    });

    it('DB 연결 에러 시 에러 처리가 되어야 함', async () => {
      // 잘못된 연결 객체로 테스트
      const testLogData: History = {
        managerNo: 1,
        schoolNo: 1,
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        actionType: 'I',
        targetTable: 'rnSchool',
        targetId: '1',
        oldValues: null,
        newValues: null,
        reason: 'DB 연결 에러 테스트',
      };

      // 잘못된 연결 객체 생성
      const invalidConnection = {} as unknown as PoolConnection;

      await expect(insertLogAction(testLogData, invalidConnection)).rejects.toThrow();
      console.log('✅ DB 연결 에러 처리 성공');
    });
  });

  describe('트랜잭션 테스트', () => {
    it('트랜잭션 내에서 로그를 삽입해야 함', async () => {
      const testLogData: History = {
        managerNo: 1,
        schoolNo: 1,
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        actionType: 'I',
        targetTable: 'rnSchool',
        targetId: '1',
        oldValues: null,
        newValues: JSON.stringify({ sname: '트랜잭션테스트학교' }),
        reason: '트랜잭션 테스트',
      };

      // 트랜잭션 시작
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // 트랜잭션 내에서 로그 삽입
        const result = await insertLogAction(testLogData, connection);
        expect(result).toBeDefined();
        console.log('✅ 트랜잭션 내 로그 삽입 성공');

        // 트랜잭션 커밋
        await connection.commit();
        console.log('✅ 트랜잭션 커밋 성공');

        // 삽입된 로그 확인 (log_no 컬럼명 사용)
        const { getAll } = await import('@/lib/mariadb/query');
        const insertedLogs = await getAll('SELECT * FROM history WHERE reason = ? ORDER BY log_no DESC LIMIT 1', [
          testLogData.reason,
        ]);

        expect(insertedLogs).toHaveLength(1);
        const insertedLog = insertedLogs[0];
        expect(insertedLog.reason).toBe(testLogData.reason);
        console.log('✅ 트랜잭션 로그 검증 성공');
      } catch {
        // 에러 발생 시 롤백
        await connection.rollback();
        console.log('❌ 트랜잭션 롤백');
        throw new Error('트랜잭션 에러');
      } finally {
        connection.release();
      }
    });

    it('트랜잭션 롤백 시 로그가 삽입되지 않아야 함', async () => {
      const testLogData: History = {
        managerNo: 1,
        schoolNo: 1,
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        actionType: 'I',
        targetTable: 'rnSchool',
        targetId: '1',
        oldValues: null,
        newValues: null,
        reason: '트랜잭션 롤백 테스트',
      };

      // 트랜잭션 시작
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // 트랜잭션 내에서 로그 삽입
        const result = await insertLogAction(testLogData, connection);
        expect(result).toBeDefined();
        console.log('✅ 트랜잭션 내 로그 삽입 성공');

        // 의도적으로 에러 발생시켜 롤백
        throw new Error('의도적인 롤백 테스트');
      } catch {
        // 트랜잭션 롤백
        await connection.rollback();
        console.log('✅ 트랜잭션 롤백 성공');

        // 롤백 후 로그가 삽입되지 않았는지 확인
        const { getAll } = await import('@/lib/mariadb/query');
        const insertedLogs = await getAll('SELECT * FROM history WHERE reason = ?', [testLogData.reason]);

        expect(insertedLogs).toHaveLength(0);
        console.log('✅ 롤백 후 로그 미삽입 확인 성공');
      } finally {
        connection.release();
      }
    });
  });

  describe('성능 테스트', () => {
    it('여러 로그를 연속으로 삽입해야 함', async () => {
      const logCount = 5;
      const startTime = Date.now();

      for (let i = 0; i < logCount; i++) {
        const testLogData: History = {
          managerNo: 1,
          schoolNo: 1,
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          actionType: 'I',
          targetTable: 'rnSchool',
          targetId: i.toString(),
          oldValues: null,
          newValues: JSON.stringify({ sname: `성능테스트학교${i}` }),
          reason: `성능 테스트 ${Date.now()}_${i}`, // 고유한 reason으로 중복 방지
        };

        const result = await insertLogAction(testLogData);
        expect(result).toBeDefined();
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(`✅ ${logCount}개 로그 삽입 완료 (${duration}ms)`);

      // 삽입된 로그 수 확인 (고유한 reason으로 필터링)
      const { getAll } = await import('@/lib/mariadb/query');
      const insertedLogs = await getAll('SELECT COUNT(*) as count FROM history WHERE reason LIKE ?', ['성능 테스트 %']);

      // 최소한 logCount개 이상은 있어야 함 (이전 테스트와 중복될 수 있음)
      expect(insertedLogs[0].count).toBeGreaterThanOrEqual(logCount);
      console.log('✅ 성능 테스트 로그 수 검증 성공');
    });
  });

  describe('커버리지 100% 달성을 위한 추가 테스트', () => {
    it('모든 액션 타입을 테스트해야 함', async () => {
      const actionTypes: Array<'S' | 'I' | 'U' | 'D'> = ['S', 'I', 'U', 'D'];

      for (const actionType of actionTypes) {
        const testLogData: History = {
          managerNo: 1,
          schoolNo: 1,
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          actionType,
          targetTable: 'rnSchool',
          targetId: '1',
          oldValues: null,
          newValues: null,
          reason: `커버리지 테스트 ${actionType}`,
        };

        const result = await insertLogAction(testLogData);
        expect(result).toBeDefined();
        console.log(`✅ ${actionType} 액션 타입 테스트 완료`);
      }
    });

    it('다양한 target_table을 테스트해야 함', async () => {
      const targetTables = ['rnSchool', 'manager', 'area', 'device'];

      for (const targetTable of targetTables) {
        const testLogData: History = {
          managerNo: 1,
          schoolNo: 1,
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          actionType: 'S',
          targetTable,
          targetId: '1',
          oldValues: null,
          newValues: null,
          reason: `target_table 테스트 ${targetTable}`,
        };

        const result = await insertLogAction(testLogData);
        expect(result).toBeDefined();
        console.log(`✅ ${targetTable} target_table 테스트 완료`);
      }
    });

    it('긴 문자열을 포함한 로그를 삽입해야 함', async () => {
      const longString = 'A'.repeat(1000); // 긴 문자열 생성

      const testLogData: History = {
        managerNo: 1,
        schoolNo: 1,
        ip: '192.168.1.100',
        userAgent: longString, // 긴 user_agent
        actionType: 'I',
        targetTable: 'rnSchool',
        targetId: '1',
        oldValues: longString, // 긴 old_values
        newValues: longString, // 긴 new_values
        reason: longString, // 긴 reason
      };

      const result = await insertLogAction(testLogData);
      expect(result).toBeDefined();
      console.log('✅ 긴 문자열 포함 로그 삽입 성공');

      // 삽입된 로그 확인
      const { getAll } = await import('@/lib/mariadb/query');
      const insertedLogs = await getAll(
        'SELECT * FROM history WHERE manager_no = ? AND action_type = ? ORDER BY log_no DESC LIMIT 1',
        [testLogData.managerNo, testLogData.actionType],
      );

      expect(insertedLogs).toHaveLength(1);
      const insertedLog = insertedLogs[0];
      expect(insertedLog.user_agent).toBe(longString);
      expect(insertedLog.old_values).toBe(longString);
      expect(insertedLog.new_values).toBe(longString);
      expect(insertedLog.reason).toBe(longString);

      console.log('✅ 긴 문자열 포함 로그 검증 성공');
    });
  });
});

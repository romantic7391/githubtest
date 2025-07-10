import {
  findAreas,
  findAreaByArea,
  insertArea,
  updateAreaInfo,
  deleteAreaFromDB,
  checkAreaExists,
} from '@/models/area/area.model';
import { setupTestDatabase, cleanupTestData, createTestData } from './setup';

describe('Area Model - 실제 데이터베이스 테스트', () => {
  let realData: Array<{ area: string }> = [];

  beforeAll(async () => {
    // 실제 데이터베이스 연결 및 정보 확인
    await setupTestDatabase();

    // 실제 DB 데이터 샘플 가져오기
    realData = await createTestData();
    console.log('📊 테스트에 사용할 실제 데이터:', realData);
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('실제 데이터베이스 조회 테스트', () => {
    it('실제 DB에서 모든 지역을 조회해야 함', async () => {
      const result = await findAreas(1, 10);

      // 실제 DB 응답 구조 확인
      expect(result).toHaveProperty('areas');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.areas)).toBe(true);
      expect(result.total).toBeGreaterThan(0);

      console.log(`📋 실제 DB에서 조회된 지역 수: ${result.total}`);

      // 실제 DB 스키마와 일치하는지 확인
      if (result.areas.length > 0) {
        const firstArea = result.areas[0];
        expect(firstArea).toHaveProperty('areaNo');
        expect(firstArea).toHaveProperty('area');
        expect(firstArea).toHaveProperty('x');
        expect(firstArea).toHaveProperty('y');
        expect(firstArea).toHaveProperty('areaCode');

        console.log('✅ 첫 번째 지역 데이터:', firstArea);
      }
    });

    it('빈 배열로 필터링하여 모든 지역을 조회해야 함', async () => {
      const result = await findAreas(1, 10, []);

      expect(result).toHaveProperty('areas');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.areas)).toBe(true);
      expect(result.total).toBeGreaterThan(0);

      console.log(`📋 빈 배열 필터링으로 조회된 지역 수: ${result.total}`);
    });

    it('특정 지역들로 필터링하여 조회해야 함', async () => {
      if (realData.length < 2) {
        console.log('⚠️ 실제 DB에 데이터가 부족해 테스트를 건너뜁니다.');
        return;
      }

      const testAreas = [realData[0].area, realData[1].area];
      console.log(`🔍 특정 지역들로 필터링: ${testAreas}`);

      const result = await findAreas(1, 10, testAreas);

      expect(result.areas.length).toBeGreaterThan(0);
      expect(result.areas.length).toBeLessThanOrEqual(2);

      // 조회된 지역들이 필터링 조건에 맞는지 확인
      result.areas.forEach((area) => {
        expect(testAreas).toContain(area.area);
      });

      console.log(`✅ 필터링된 지역 수: ${result.areas.length}`);
    });

    it('실제 DB 데이터로 특정 지역 조회해야 함', async () => {
      if (realData.length === 0) {
        console.log('⚠️ 실제 DB에 데이터가 없어 테스트를 건너뜁니다.');
        return;
      }

      const realAreaName = realData[0].area;
      console.log(`🔍 실제 DB 데이터로 테스트: ${realAreaName}`);

      const areas = await findAreaByArea(realAreaName);

      expect(Array.isArray(areas)).toBe(true);
      expect(areas.length).toBeGreaterThan(0);
      expect(areas[0].area).toBe(realAreaName);

      console.log('✅ 실제 지역 조회 성공:', areas[0]);
    });

    it('실제 DB에서 존재하지 않는 지역 조회 시 빈 배열 반환해야 함', async () => {
      const nonExistentArea = '존재하지않는지역_' + Date.now();

      const areas = await findAreaByArea(nonExistentArea);

      expect(Array.isArray(areas)).toBe(true);
      expect(areas.length).toBe(0);

      console.log('✅ 존재하지 않는 지역 조회 테스트 성공');
    });
  });

  describe('실제 데이터베이스 존재 여부 테스트', () => {
    it('실제 DB에 존재하는 지역은 true 반환해야 함', async () => {
      if (realData.length === 0) {
        console.log('⚠️ 실제 DB에 데이터가 없어 테스트를 건너뜁니다.');
        return;
      }

      const realAreaName = realData[0].area;
      const exists = await checkAreaExists(realAreaName);

      expect(exists).toBe(true);
      console.log(`✅ 실제 지역 존재 확인: ${realAreaName} = ${exists}`);
    });

    it('실제 DB에 존재하지 않는 지역은 false 반환해야 함', async () => {
      const nonExistentArea = '존재하지않는지역_' + Date.now();
      const exists = await checkAreaExists(nonExistentArea);

      expect(exists).toBe(false);
      console.log(`✅ 존재하지 않는 지역 확인: ${nonExistentArea} = ${exists}`);
    });
  });

  describe('실제 데이터베이스 CRUD 테스트 (안전한 테스트)', () => {
    const testAreaName = `테스트지역_${Date.now()}`;

    it('새로운 지역을 실제 DB에 삽입하고 조회해야 함', async () => {
      const newArea = {
        area: testAreaName,
        x: 127, // 정수로 변경 (BIGINT 컬럼)
        y: 37, // 정수로 변경 (BIGINT 컬럼)
        areaCode: 'TEST001',
      };

      // 삽입 전 존재하지 않음 확인
      const beforeInsert = await checkAreaExists(testAreaName);
      expect(beforeInsert).toBe(false);

      // 실제 DB에 삽입
      await insertArea(newArea);
      console.log(`✅ 실제 DB에 지역 삽입: ${testAreaName}`);

      // 삽입된 데이터 확인
      const insertedAreas = await findAreaByArea(testAreaName);
      expect(insertedAreas.length).toBeGreaterThan(0);
      expect(insertedAreas[0].area).toBe(newArea.area);
      expect(insertedAreas[0].x).toBe(newArea.x); // 타입 정의에 맞는 속성명 사용
      expect(insertedAreas[0].y).toBe(newArea.y); // 타입 정의에 맞는 속성명 사용
      expect(insertedAreas[0].areaCode).toBe(newArea.areaCode);

      console.log('✅ 삽입된 데이터 검증 성공:', insertedAreas[0]);
    });

    it('실제 DB에서 지역 정보를 업데이트해야 함', async () => {
      const updateData = {
        areaNo: 999, // 임시 값
        area: testAreaName,
        x: 128, // 정수로 변경 (BIGINT 컬럼)
        y: 38, // 정수로 변경 (BIGINT 컬럼)
        areaCode: 'TEST002',
      };

      // 실제 DB에서 업데이트
      await updateAreaInfo(updateData);
      console.log(`✅ 실제 DB에서 지역 업데이트: ${testAreaName}`);

      // 업데이트된 데이터 확인
      const updatedAreas = await findAreaByArea(testAreaName);
      expect(updatedAreas[0].x).toBe(128); // 타입 정의에 맞는 속성명 사용
      expect(updatedAreas[0].y).toBe(38); // 타입 정의에 맞는 속성명 사용
      expect(updatedAreas[0].areaCode).toBe('TEST002');

      console.log('✅ 업데이트된 데이터 검증 성공:', updatedAreas[0]);
    });

    it('실제 DB에서 지역을 삭제해야 함', async () => {
      // 삭제 전 존재 확인
      const beforeDelete = await checkAreaExists(testAreaName);
      expect(beforeDelete).toBe(true);

      // 실제 DB에서 삭제
      await deleteAreaFromDB(testAreaName);
      console.log(`✅ 실제 DB에서 지역 삭제: ${testAreaName}`);

      // 삭제 후 존재하지 않음 확인
      const afterDelete = await checkAreaExists(testAreaName);
      expect(afterDelete).toBe(false);

      console.log('✅ 삭제 검증 성공');
    });
  });
});

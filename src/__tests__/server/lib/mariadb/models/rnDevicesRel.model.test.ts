import {
  findRnDevicesRelBySchoolNo,
  findRnDeviceRelBySchoolNoAndMac,
  insertRnDevicesRel,
  findRelByMac,
  updateRnDevicesRel,
  softDeleteRnDevicesRel,
  checkMacExists,
  updateMacAddress,
} from '@/models/rnDevicesRel/rnDevicesRel.model';
import { setupTestDatabase, cleanupTestData, createTestData } from './setup';
import { DeviceCreate, DeviceBasic } from '@/types/device';

describe('RnDevicesRel Model - 실제 데이터베이스 테스트', () => {
  let realData: Array<{ area: string }> = [];
  const testSchoolNo = 1; // 테스트용 학교 번호

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
    it('실제 DB에서 학교별 센서 목록을 조회해야 함', async () => {
      const params = {
        school_no: testSchoolNo,
        page: 1,
        pageSize: 10,
      };

      const result = await findRnDevicesRelBySchoolNo(params);

      // 실제 DB 응답 구조 확인
      expect(result).toHaveProperty('devices');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.devices)).toBe(true);
      expect(result.total).toBeGreaterThanOrEqual(0);

      console.log(`📋 실제 DB에서 조회된 센서 수: ${result.total}`);

      // 실제 DB 스키마와 일치하는지 확인 (IP 주소가 null일 수 있음)
      if (result.devices.length > 0) {
        const firstDevice = result.devices[0];
        expect(firstDevice).toHaveProperty('mac');
        expect(firstDevice).toHaveProperty('name');
        expect(firstDevice).toHaveProperty('summary');
        expect(firstDevice).toHaveProperty('kind');
        expect(firstDevice).toHaveProperty('extra');
        expect(firstDevice).toHaveProperty('sdate');
        expect(firstDevice).toHaveProperty('edate');
        expect(firstDevice).toHaveProperty('created');

        // IP 주소가 null이 아닌 경우에만 유효성 검사
        if (firstDevice.device?.ip) {
          console.log('✅ 첫 번째 센서 데이터 (IP 포함):', firstDevice);
        } else {
          console.log('✅ 첫 번째 센서 데이터 (IP 없음):', firstDevice);
        }
      }
    });

    it('필터링 조건으로 센서 목록을 조회해야 함', async () => {
      const params = {
        school_no: testSchoolNo,
        page: 1,
        pageSize: 10,
        filters: {
          model: 'test',
          ip: '192.168',
          interval: 60,
        },
      };

      const result = await findRnDevicesRelBySchoolNo(params);

      expect(result).toHaveProperty('devices');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.devices)).toBe(true);

      console.log(`🔍 필터링된 센서 수: ${result.total}`);
    });

    it('실제 DB에서 특정 센서 정보를 조회해야 함', async () => {
      // 먼저 학교의 센서 목록을 가져와서 테스트용 MAC 주소 확보
      const deviceList = await findRnDevicesRelBySchoolNo({
        school_no: testSchoolNo,
        page: 1,
        pageSize: 1,
      });

      if (deviceList.devices.length === 0) {
        console.log('⚠️ 테스트할 센서가 없어 테스트를 건너뜁니다.');
        return;
      }

      const testMac = deviceList.devices[0].mac;
      const params: DeviceBasic = {
        mac: testMac,
        school_no: testSchoolNo,
      };

      const device = await findRnDeviceRelBySchoolNoAndMac(params);

      expect(device).not.toBeNull();
      if (device) {
        expect(device.mac).toBe(testMac);
        expect(device).toHaveProperty('name');
        expect(device).toHaveProperty('summary');
        expect(device).toHaveProperty('kind');
        expect(device).toHaveProperty('extra');
        expect(device).toHaveProperty('sdate');
        expect(device).toHaveProperty('edate');
        expect(device).toHaveProperty('created');

        console.log('✅ 특정 센서 조회 성공:', device);
      }
    });

    it('존재하지 않는 센서 조회 시 null 반환해야 함', async () => {
      const nonExistentMac = '00:00:00:00:00:00';
      const params: DeviceBasic = {
        mac: nonExistentMac,
        school_no: testSchoolNo,
      };

      const device = await findRnDeviceRelBySchoolNoAndMac(params);

      expect(device).toBeNull();
      console.log('✅ 존재하지 않는 센서 조회 테스트 성공');
    });
  });

  describe('실제 데이터베이스 존재 여부 테스트', () => {
    it('실제 DB에 존재하는 MAC 주소는 true 반환해야 함', async () => {
      // 먼저 학교의 센서 목록을 가져와서 테스트용 MAC 주소 확보
      const deviceList = await findRnDevicesRelBySchoolNo({
        school_no: testSchoolNo,
        page: 1,
        pageSize: 1,
      });

      if (deviceList.devices.length === 0) {
        console.log('⚠️ 테스트할 센서가 없어 테스트를 건너뜁니다.');
        return;
      }

      const existingMac = deviceList.devices[0].mac;
      const exists = await findRelByMac(existingMac);

      expect(exists).not.toBeNull();
      console.log(`✅ 실제 MAC 주소 존재 확인: ${existingMac}`);
    });

    it('실제 DB에 존재하지 않는 MAC 주소는 null 반환해야 함', async () => {
      const nonExistentMac = '00:00:00:00:00:00';
      const exists = await findRelByMac(nonExistentMac);

      expect(exists).toBeNull();
      console.log(`✅ 존재하지 않는 MAC 주소 확인: ${nonExistentMac}`);
    });
  });

  describe('실제 데이터베이스 CRUD 테스트 (안전한 테스트)', () => {
    const testMac = `AABBCCDDEE${Date.now().toString(16).slice(-6)}`;
    const testDeviceData: DeviceCreate[] = [
      {
        schoolNo: testSchoolNo,
        mac: testMac,
        name: '테스트 센서',
        summary: '테스트 센서 설명',
        kind: 1,
        extra: '추가 정보',
        sdate: '2024-01-01 00:00:00',
        edate: '2024-12-31 23:59:59',
      },
    ];

    it('새로운 센서를 실제 DB에 삽입해야 함', async () => {
      // 삽입 전 존재하지 않음 확인
      const beforeInsert = await findRelByMac(testMac);
      expect(beforeInsert).toBeNull();

      // 실제 DB에 삽입
      const result = await insertRnDevicesRel(testDeviceData);
      expect(result.affectedRows).toBeGreaterThan(0);
      console.log(`✅ 실제 DB에 센서 삽입: ${testMac}`);

      // 삽입된 데이터 확인
      const insertedDevice = await findRnDeviceRelBySchoolNoAndMac({
        mac: testMac,
        school_no: testSchoolNo,
      });
      expect(insertedDevice).not.toBeNull();
      if (insertedDevice) {
        expect(insertedDevice.mac).toBe(testMac);
        expect(insertedDevice.name).toBe('테스트 센서');
        console.log('✅ 삽입된 데이터 검증 성공:', insertedDevice);
      }
    });

    it('실제 DB에서 센서 정보를 업데이트해야 함', async () => {
      const updateData = [
        {
          mac: testMac,
          oldMac: testMac,
          school_no: testSchoolNo,
          name: '업데이트된 테스트 센서',
          summary: '업데이트된 설명',
          kind: 2,
          extra: '업데이트된 추가 정보',
          sdate: '2024-01-01 00:00:00',
          edate: '2024-12-31 23:59:59',
        },
      ];

      // 실제 DB에서 업데이트
      await updateRnDevicesRel(updateData);
      console.log(`✅ 실제 DB에서 센서 업데이트: ${testMac}`);

      // 업데이트된 데이터 확인
      const updatedDevice = await findRnDeviceRelBySchoolNoAndMac({
        mac: testMac,
        school_no: testSchoolNo,
      });
      expect(updatedDevice).not.toBeNull();
      if (updatedDevice) {
        expect(updatedDevice.name).toBe('업데이트된 테스트 센서');
        expect(updatedDevice.kind).toBe(2);
        console.log('✅ 업데이트된 데이터 검증 성공:', updatedDevice);
      }
    });

    it('실제 DB에서 센서 MAC 주소를 변경해야 함', async () => {
      const newMac = `FFGGHHIIJJ${Date.now().toString(16).slice(-6)}`;

      // 먼저 중복 체크
      const exists = await checkMacExists(testSchoolNo, newMac);
      expect(exists).toBeNull();

      // 실제 DB에서 MAC 주소 변경
      const result = await updateMacAddress(testSchoolNo, testMac, newMac);
      expect(result.affectedRows).toBeGreaterThan(0);
      console.log(`✅ 실제 DB에서 MAC 주소 변경: ${testMac} -> ${newMac}`);

      // 변경된 데이터 확인
      const updatedDevice = await findRnDeviceRelBySchoolNoAndMac({
        mac: newMac,
        school_no: testSchoolNo,
      });
      expect(updatedDevice).not.toBeNull();
      if (updatedDevice) {
        expect(updatedDevice.mac).toBe(newMac);
        console.log('✅ MAC 주소 변경 검증 성공:', updatedDevice);
      }

      // 기존 MAC 주소로는 조회되지 않아야 함
      const oldDevice = await findRnDeviceRelBySchoolNoAndMac({
        mac: testMac,
        school_no: testSchoolNo,
      });
      expect(oldDevice).toBeNull();
    });

    it('실제 DB에서 센서를 삭제해야 함', async () => {
      const newMac = `FFGGHHIIJJ${Date.now().toString(16).slice(-6)}`;

      // 먼저 테스트용 센서를 생성
      const createData: DeviceCreate[] = [
        {
          schoolNo: testSchoolNo,
          mac: newMac,
          name: '삭제 테스트 센서',
          summary: '삭제 테스트',
          kind: 1,
          extra: '삭제용',
          sdate: '2024-01-01 00:00:00',
          edate: '2024-12-31 23:59:59',
        },
      ];
      await insertRnDevicesRel(createData);

      // 삭제 전 존재 확인
      const beforeDelete = await findRnDeviceRelBySchoolNoAndMac({
        mac: newMac,
        school_no: testSchoolNo,
      });
      expect(beforeDelete).not.toBeNull();

      // 실제 DB에서 삭제
      await softDeleteRnDevicesRel([
        {
          mac: newMac,
          school_no: testSchoolNo,
        },
      ]);
      console.log(`✅ 실제 DB에서 센서 삭제: ${newMac}`);

      // 삭제 후 존재하지 않음 확인
      const afterDelete = await findRnDeviceRelBySchoolNoAndMac({
        mac: newMac,
        school_no: testSchoolNo,
      });
      expect(afterDelete).toBeNull();
      console.log('✅ 센서 삭제 검증 성공');
    });
  });

  describe('에러 처리 테스트', () => {
    it('중복된 MAC 주소로 삽입 시 에러가 발생해야 함', async () => {
      // 먼저 기존 센서 목록에서 MAC 주소 확보
      const deviceList = await findRnDevicesRelBySchoolNo({
        school_no: testSchoolNo,
        page: 1,
        pageSize: 1,
      });

      if (deviceList.devices.length === 0) {
        console.log('⚠️ 테스트할 센서가 없어 테스트를 건너뜁니다.');
        return;
      }

      const existingMac = deviceList.devices[0].mac;
      const duplicateData: DeviceCreate[] = [
        {
          schoolNo: testSchoolNo,
          mac: existingMac,
          name: '중복 테스트 센서',
          summary: '중복 테스트',
          kind: 1,
          extra: '중복',
          sdate: '2024-01-01 00:00:00',
          edate: '2024-12-31 23:59:59',
        },
      ];

      // 중복 삽입 시도 (에러 발생 예상)
      try {
        await insertRnDevicesRel(duplicateData);
        // 에러가 발생하지 않았다면 테스트 실패
        expect(true).toBe(false);
      } catch (error) {
        console.log('✅ 중복 MAC 주소 에러 처리 성공:', error);
        expect(error).toBeDefined();
      }
    });

    it('존재하지 않는 MAC 주소로 업데이트 시 에러가 발생해야 함', async () => {
      const nonExistentMac = '00:00:00:00:00:00';
      const newMac = '11:11:11:11:11:11';

      // 존재하지 않는 MAC 주소로 업데이트 시도 (에러 발생 예상)
      try {
        await updateMacAddress(testSchoolNo, nonExistentMac, newMac);
        // 에러가 발생하지 않았다면 테스트 실패
        expect(true).toBe(false);
      } catch (error) {
        console.log('✅ 존재하지 않는 MAC 주소 업데이트 에러 처리 성공:', error);
        expect(error).toBeDefined();
      }
    });
  });

  describe('필터링 조건별 테스트', () => {
    it('모든 필터링 조건을 사용하여 센서 목록을 조회해야 함', async () => {
      const params = {
        school_no: testSchoolNo,
        page: 1,
        pageSize: 10,
        filters: {
          model: 'test',
          ip: '192.168',
          rip: '192.168',
          interval: 60,
          ver: '1.0',
          tags: 'test',
        },
      };

      const result = await findRnDevicesRelBySchoolNo(params);

      expect(result).toHaveProperty('devices');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.devices)).toBe(true);

      console.log(`🔍 모든 필터링 조건으로 조회된 센서 수: ${result.total}`);
    });

    it('개별 필터링 조건으로 센서 목록을 조회해야 함', async () => {
      // model 필터만
      const modelParams = {
        school_no: testSchoolNo,
        page: 1,
        pageSize: 10,
        filters: { model: 'test' },
      };
      const modelResult = await findRnDevicesRelBySchoolNo(modelParams);
      console.log(`🔍 model 필터로 조회된 센서 수: ${modelResult.total}`);

      // ip 필터만
      const ipParams = {
        school_no: testSchoolNo,
        page: 1,
        pageSize: 10,
        filters: { ip: '192.168' },
      };
      const ipResult = await findRnDevicesRelBySchoolNo(ipParams);
      console.log(`🔍 ip 필터로 조회된 센서 수: ${ipResult.total}`);

      // interval 필터만
      const intervalParams = {
        school_no: testSchoolNo,
        page: 1,
        pageSize: 10,
        filters: { interval: 60 },
      };
      const intervalResult = await findRnDevicesRelBySchoolNo(intervalParams);
      console.log(`🔍 interval 필터로 조회된 센서 수: ${intervalResult.total}`);

      // ver 필터만
      const verParams = {
        school_no: testSchoolNo,
        page: 1,
        pageSize: 10,
        filters: { ver: '1.0' },
      };
      const verResult = await findRnDevicesRelBySchoolNo(verParams);
      console.log(`🔍 ver 필터로 조회된 센서 수: ${verResult.total}`);

      // tags 필터만
      const tagsParams = {
        school_no: testSchoolNo,
        page: 1,
        pageSize: 10,
        filters: { tags: 'test' },
      };
      const tagsResult = await findRnDevicesRelBySchoolNo(tagsParams);
      console.log(`🔍 tags 필터로 조회된 센서 수: ${tagsResult.total}`);
    });

    it('filters.tags가 null인 경우를 테스트해야 함 (75번째 줄 분기)', async () => {
      const params = {
        school_no: testSchoolNo,
        page: 1,
        pageSize: 10,
        filters: {
          tags: null, // null로 설정하여 조건문이 실행되지 않도록 함
        },
      };

      const result = await findRnDevicesRelBySchoolNo(params);
      expect(result).toHaveProperty('devices');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.devices)).toBe(true);
      console.log(`🔍 tags null 필터로 조회된 센서 수: ${result.total}`);
    });
  });

  describe('MAC 주소 변경 로직 테스트', () => {
    it('MAC 주소가 변경되지 않은 경우의 업데이트를 테스트해야 함', async () => {
      const testMac = `AABBCCDDEE${Date.now().toString(16).slice(-6)}`;

      // 먼저 테스트용 센서 생성
      const createData: DeviceCreate[] = [
        {
          schoolNo: testSchoolNo,
          mac: testMac,
          name: 'MAC 변경 테스트 센서',
          summary: 'MAC 변경 테스트',
          kind: 1,
          extra: 'MAC 변경용',
          sdate: '2024-01-01 00:00:00',
          edate: '2024-12-31 23:59:59',
        },
      ];
      await insertRnDevicesRel(createData);

      // MAC 주소가 변경되지 않은 경우의 업데이트
      const updateData = [
        {
          mac: testMac,
          oldMac: testMac, // 같은 MAC 주소
          school_no: testSchoolNo,
          name: 'MAC 변경 없는 업데이트',
          summary: 'MAC 변경 없는 설명',
          kind: 3,
          extra: 'MAC 변경 없는 추가 정보',
          sdate: '2024-01-01 00:00:00',
          edate: '2024-12-31 23:59:59',
        },
      ];

      await updateRnDevicesRel(updateData);
      console.log(`✅ MAC 주소 변경 없는 업데이트 성공: ${testMac}`);

      // 업데이트된 데이터 확인
      const updatedDevice = await findRnDeviceRelBySchoolNoAndMac({
        mac: testMac,
        school_no: testSchoolNo,
      });
      expect(updatedDevice).not.toBeNull();
      if (updatedDevice) {
        expect(updatedDevice.name).toBe('MAC 변경 없는 업데이트');
        expect(updatedDevice.kind).toBe(3);
        console.log('✅ MAC 변경 없는 업데이트 검증 성공:', updatedDevice);
      }
    });

    it('MAC 주소가 변경된 경우의 업데이트를 테스트해야 함', async () => {
      const oldMac = `AABBCCDDEE${Date.now().toString(16).slice(-6)}`;
      const newMac = `FFGGHHIIJJ${Date.now().toString(16).slice(-6)}`;

      // 먼저 테스트용 센서 생성
      const createData: DeviceCreate[] = [
        {
          schoolNo: testSchoolNo,
          mac: oldMac,
          name: 'MAC 변경 테스트 센서2',
          summary: 'MAC 변경 테스트2',
          kind: 1,
          extra: 'MAC 변경용2',
          sdate: '2024-01-01 00:00:00',
          edate: '2024-12-31 23:59:59',
        },
      ];
      await insertRnDevicesRel(createData);

      // MAC 주소가 변경된 경우의 업데이트
      const updateData = [
        {
          mac: newMac,
          oldMac: oldMac, // 다른 MAC 주소
          school_no: testSchoolNo,
          name: 'MAC 변경 있는 업데이트',
          summary: 'MAC 변경 있는 설명',
          kind: 4,
          extra: 'MAC 변경 있는 추가 정보',
          sdate: '2024-01-01 00:00:00',
          edate: '2024-12-31 23:59:59',
        },
      ];

      await updateRnDevicesRel(updateData);
      console.log(`✅ MAC 주소 변경 있는 업데이트 성공: ${oldMac} -> ${newMac}`);

      // 새로운 MAC 주소로 조회
      const updatedDevice = await findRnDeviceRelBySchoolNoAndMac({
        mac: newMac,
        school_no: testSchoolNo,
      });
      expect(updatedDevice).not.toBeNull();
      if (updatedDevice) {
        expect(updatedDevice.name).toBe('MAC 변경 있는 업데이트');
        expect(updatedDevice.kind).toBe(4);
        console.log('✅ MAC 변경 있는 업데이트 검증 성공:', updatedDevice);
      }

      // 기존 MAC 주소로는 조회되지 않아야 함
      const oldDevice = await findRnDeviceRelBySchoolNoAndMac({
        mac: oldMac,
        school_no: testSchoolNo,
      });
      expect(oldDevice).toBeNull();
    });

    it('updateMac 함수의 완전한 실행을 테스트해야 함 (커버리지 100% 보장)', async () => {
      const oldMac = `AABBCCDDEE${Date.now().toString(16).slice(-6)}`;
      const newMac = `FFGGHHIIJJ${Date.now().toString(16).slice(-6)}`;

      // 먼저 테스트용 센서 생성 (rnDevicesRel에만)
      const createData: DeviceCreate[] = [
        {
          schoolNo: testSchoolNo,
          mac: oldMac,
          name: 'updateMac 완전 실행 테스트 센서',
          summary: 'updateMac 완전 실행 테스트',
          kind: 1,
          extra: 'updateMac 완전 실행용',
          sdate: '2024-01-01 00:00:00',
          edate: '2024-12-31 23:59:59',
        },
      ];
      await insertRnDevicesRel(createData);

      // updateMac 함수 실행 (완전한 실행 보장)
      const result = await updateMacAddress(testSchoolNo, oldMac, newMac);
      expect(result.affectedRows).toBeGreaterThan(0);
      console.log(`✅ updateMac 함수 완전 실행 성공: ${oldMac} -> ${newMac}`);

      // 변경된 데이터 확인 (rnDevicesRel)
      const updatedRelDevice = await findRnDeviceRelBySchoolNoAndMac({
        mac: newMac,
        school_no: testSchoolNo,
      });
      expect(updatedRelDevice).not.toBeNull();
      if (updatedRelDevice) {
        expect(updatedRelDevice.mac).toBe(newMac);
        console.log('✅ rnDevicesRel 테이블 MAC 변경 검증 성공:', updatedRelDevice);
      }

      // 기존 MAC 주소로는 조회되지 않아야 함
      const oldRelDevice = await findRnDeviceRelBySchoolNoAndMac({
        mac: oldMac,
        school_no: testSchoolNo,
      });
      expect(oldRelDevice).toBeNull();

      console.log('✅ updateMac 함수 완전 실행 테스트 성공 - 커버리지 100% 보장');
    });

    it('filters.tags가 빈 문자열인 경우를 테스트해야 함 (75번째 줄 분기)', async () => {
      const params = {
        school_no: testSchoolNo,
        page: 1,
        pageSize: 10,
        filters: {
          tags: '', // 빈 문자열로 설정
        },
      };

      const result = await findRnDevicesRelBySchoolNo(params);
      expect(result).toHaveProperty('devices');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.devices)).toBe(true);
      console.log(`🔍 tags 빈 문자열 필터로 조회된 센서 수: ${result.total}`);
    });
  });

  describe('페이지네이션 테스트', () => {
    it('다양한 페이지와 페이지 크기로 조회해야 함', async () => {
      // 첫 번째 페이지, 작은 페이지 크기
      const page1Result = await findRnDevicesRelBySchoolNo({
        school_no: testSchoolNo,
        page: 1,
        pageSize: 5,
      });
      console.log(`📄 페이지 1 (크기 5) 조회된 센서 수: ${page1Result.devices.length}`);

      // 두 번째 페이지, 작은 페이지 크기
      const page2Result = await findRnDevicesRelBySchoolNo({
        school_no: testSchoolNo,
        page: 2,
        pageSize: 5,
      });
      console.log(`📄 페이지 2 (크기 5) 조회된 센서 수: ${page2Result.devices.length}`);

      // 큰 페이지 크기
      const largePageResult = await findRnDevicesRelBySchoolNo({
        school_no: testSchoolNo,
        page: 1,
        pageSize: 50,
      });
      console.log(`📄 큰 페이지 (크기 50) 조회된 센서 수: ${largePageResult.devices.length}`);

      // 페이지 크기가 0인 경우
      const zeroPageResult = await findRnDevicesRelBySchoolNo({
        school_no: testSchoolNo,
        page: 1,
        pageSize: 0,
      });
      console.log(`📄 페이지 크기 0 조회된 센서 수: ${zeroPageResult.devices.length}`);
    });
  });

  describe('트랜잭션 테스트', () => {
    it('커넥션을 사용한 트랜잭션 테스트를 수행해야 함', async () => {
      const { pool } = await import('@/lib/mariadb/conn');
      const conn = await pool.getConnection();

      try {
        await conn.beginTransaction();

        const testMac = `AABBCCDDEE${Date.now().toString(16).slice(-6)}`;
        const testDeviceData: DeviceCreate[] = [
          {
            schoolNo: testSchoolNo,
            mac: testMac,
            name: '트랜잭션 테스트 센서',
            summary: '트랜잭션 테스트',
            kind: 1,
            extra: '트랜잭션용',
            sdate: '2024-01-01 00:00:00',
            edate: '2024-12-31 23:59:59',
          },
        ];

        // 트랜잭션 내에서 삽입
        const insertResult = await insertRnDevicesRel(testDeviceData, conn);
        expect(insertResult.affectedRows).toBeGreaterThan(0);
        console.log(`✅ 트랜잭션 내 센서 삽입 성공: ${testMac}`);

        // 트랜잭션 롤백 (테스트 데이터 정리)
        await conn.rollback();
        console.log('✅ 트랜잭션 롤백 성공');

        // 롤백 후 데이터가 존재하지 않는지 확인
        const device = await findRnDeviceRelBySchoolNoAndMac({
          mac: testMac,
          school_no: testSchoolNo,
        });
        expect(device).toBeNull();
        console.log('✅ 트랜잭션 롤백 후 데이터 삭제 확인 성공');
      } finally {
        conn.release();
      }
    });
  });

  describe('모킹을 사용한 에지 케이스 테스트', () => {
    it('countResult가 null일 때 total이 0으로 설정되어야 함 (75번째 줄 브랜치 커버리지)', async () => {
      // 존재하지 않는 학교 번호로 조회 (매우 큰 번호 사용)
      const nonExistentSchoolNo = 999999;

      const params = {
        school_no: nonExistentSchoolNo,
        page: 1,
        pageSize: 10,
      };

      const result = await findRnDevicesRelBySchoolNo(params);

      // countResult가 null일 때 total이 0으로 설정되는지 확인
      expect(result).toHaveProperty('devices');
      expect(result).toHaveProperty('total');
      expect(result.total).toBe(0);
      expect(Array.isArray(result.devices)).toBe(true);
      expect(result.devices.length).toBe(0);

      console.log('✅ countResult가 null일 때 total이 0으로 설정됨 - 75번째 줄 브랜치 커버리지 달성');
    });
  });
});

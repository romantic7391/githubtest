import {
  insertRnDevices,
  findDeviceByMac,
  findDevicesByMacs,
  softDeleteRnDevice,
  updateDeviceMac,
} from '@/models/rnDevices/rnDevices.model';
import { setupTestDatabase, cleanupTestData, createTestData } from './setup';
import { DeviceCreate } from '@/types/device';

describe('RnDevices Model - 실제 데이터베이스 테스트', () => {
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
    it('실제 DB에서 특정 MAC 주소의 센서를 조회해야 함', async () => {
      // 먼저 rnDevicesRel에서 MAC 주소를 가져와서 테스트
      const { getAll } = await import('@/lib/mariadb/query');
      const deviceList = await getAll<{ mac: string }>('SELECT mac FROM rnDevicesRel WHERE school_no = ? LIMIT 1', [
        testSchoolNo,
      ]);

      if (deviceList.length === 0) {
        console.log('⚠️ 테스트할 센서가 없어 테스트를 건너뜁니다.');
        return;
      }

      const testMac = deviceList[0].mac;
      const result = await findDeviceByMac(testMac, testSchoolNo);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.mac).toBe(testMac);
        console.log('✅ 특정 MAC 주소 센서 조회 성공:', result);
      }
    });

    it('존재하지 않는 MAC 주소 조회 시 null 반환해야 함', async () => {
      const nonExistentMac = '00:00:00:00:00:00';
      const result = await findDeviceByMac(nonExistentMac, testSchoolNo);

      expect(result).toBeNull();
      console.log('✅ 존재하지 않는 MAC 주소 조회 테스트 성공');
    });

    it('실제 DB에서 여러 MAC 주소로 센서들을 조회해야 함', async () => {
      // 먼저 rnDevicesRel에서 MAC 주소들을 가져와서 테스트
      const { getAll } = await import('@/lib/mariadb/query');
      const deviceList = await getAll<{ mac: string }>('SELECT mac FROM rnDevicesRel WHERE school_no = ? LIMIT 3', [
        testSchoolNo,
      ]);

      if (deviceList.length === 0) {
        console.log('⚠️ 테스트할 센서가 없어 테스트를 건너뜁니다.');
        return;
      }

      const macList = deviceList.map((device) => device.mac);
      const results = await findDevicesByMacs(macList);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);

      // 조회된 MAC 주소들이 요청한 것과 일치하는지 확인
      const resultMacs = results.map((result) => result.mac);
      macList.forEach((mac) => {
        expect(resultMacs).toContain(mac);
      });

      console.log(`✅ 여러 MAC 주소 조회 성공: ${results.length}개`);
    });

    it('빈 MAC 주소 리스트로 조회 시 빈 배열 반환해야 함', async () => {
      const results = await findDevicesByMacs([]);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
      console.log('✅ 빈 MAC 주소 리스트 조회 테스트 성공');
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
        device: {
          model: 'TEST_MODEL',
          ip: '192.168.1.100',
          rip: '192.168.1.101',
          splrate: 44100,
          interval: 60,
          ver: '1.0.0',
          tags: 'test,device',
          checkin: '2024-01-01T00:00:00Z',
          created: '2024-01-01T00:00:00Z',
        },
      },
    ];

    it('새로운 센서를 실제 DB에 삽입해야 함', async () => {
      // 실제 DB에 삽입
      const result = await insertRnDevices(testDeviceData);
      expect(result.affectedRows).toBeGreaterThan(0);
      console.log(`✅ 실제 DB에 센서 삽입: ${testMac}`);

      // 삽입된 데이터 확인
      const insertedDevice = await findDevicesByMacs([testMac]);
      expect(insertedDevice.length).toBeGreaterThan(0);
      expect(insertedDevice[0].mac).toBe(testMac);
      console.log('✅ 삽입된 데이터 검증 성공:', insertedDevice[0]);
    });

    it('실제 DB에서 센서 MAC 주소를 변경해야 함', async () => {
      const newMac = `FFGGHHIIJJ${Date.now().toString(16).slice(-6)}`;

      // 실제 DB에서 MAC 주소 변경
      const result = await updateDeviceMac(testMac, newMac);
      expect(result.affectedRows).toBeGreaterThan(0);
      console.log(`✅ 실제 DB에서 MAC 주소 변경: ${testMac} -> ${newMac}`);

      // 변경된 데이터 확인
      const updatedDevice = await findDevicesByMacs([newMac]);
      expect(updatedDevice.length).toBeGreaterThan(0);
      expect(updatedDevice[0].mac).toBe(newMac);
      console.log('✅ MAC 주소 변경 검증 성공:', updatedDevice[0]);

      // 기존 MAC 주소로는 조회되지 않아야 함
      const oldDevice = await findDevicesByMacs([testMac]);
      expect(oldDevice.length).toBe(0);
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
          device: {
            model: 'DELETE_TEST',
            ip: '192.168.1.200',
            rip: '192.168.1.201',
            splrate: 22050,
            interval: 30,
            ver: '1.0.0',
            tags: 'delete,test',
            checkin: '2024-01-01T00:00:00Z',
            created: '2024-01-01T00:00:00Z',
          },
        },
      ];
      await insertRnDevices(createData);

      // 삭제 전 존재 확인
      const beforeDelete = await findDevicesByMacs([newMac]);
      expect(beforeDelete.length).toBeGreaterThan(0);

      // 실제 DB에서 삭제
      const result = await softDeleteRnDevice([{ mac: newMac }]);
      expect(result.affectedRows).toBeGreaterThan(0);
      console.log(`✅ 실제 DB에서 센서 삭제: ${newMac}`);

      // 삭제 후 존재하지 않음 확인
      const afterDelete = await findDevicesByMacs([newMac]);
      expect(afterDelete.length).toBe(0);
      console.log('✅ 센서 삭제 검증 성공');
    });
  });

  describe('에러 처리 테스트', () => {
    it('존재하지 않는 MAC 주소로 업데이트 시 에러가 발생해야 함', async () => {
      const nonExistentMac = '00:00:00:00:00:00';
      const newMac = '11:11:11:11:11:11';

      // 존재하지 않는 MAC 주소로 업데이트 시도
      const result = await updateDeviceMac(nonExistentMac, newMac);

      // affectedRows가 0이면 업데이트된 행이 없음을 의미
      expect(result.affectedRows).toBe(0);
      console.log('✅ 존재하지 않는 MAC 주소 업데이트 처리 성공');
    });

    it('존재하지 않는 MAC 주소로 삭제 시 에러가 발생해야 함', async () => {
      const nonExistentMac = '00:00:00:00:00:00';

      // 존재하지 않는 MAC 주소로 삭제 시도
      const result = await softDeleteRnDevice([{ mac: nonExistentMac }]);

      // affectedRows가 0이면 삭제된 행이 없음을 의미
      expect(result.affectedRows).toBe(0);
      console.log('✅ 존재하지 않는 MAC 주소 삭제 처리 성공');
    });
  });

  describe('데이터 무결성 테스트', () => {
    it('rnDevicesRel과 rnDevices 테이블 간의 MAC 주소 일관성을 확인해야 함', async () => {
      const { getAll } = await import('@/lib/mariadb/query');

      // rnDevicesRel에 있는 MAC 주소들
      const relDevices = await getAll<{ mac: string }>('SELECT mac FROM rnDevicesRel WHERE school_no = ?', [
        testSchoolNo,
      ]);

      if (relDevices.length === 0) {
        console.log('⚠️ 테스트할 센서가 없어 테스트를 건너뜁니다.');
        return;
      }

      const relMacs = relDevices.map((device) => device.mac);

      // rnDevices에 있는 MAC 주소들
      const devices = await findDevicesByMacs(relMacs);
      const deviceMacs = devices.map((device) => device.mac);

      // rnDevicesRel에 있는 모든 MAC 주소가 rnDevices에도 있어야 함
      relMacs.forEach((mac) => {
        expect(deviceMacs).toContain(mac);
      });

      console.log(`✅ 데이터 무결성 검증 성공: ${relMacs.length}개 MAC 주소 일치`);
    });
  });

  describe('findDeviceByMac 함수 테스트', () => {
    it('실제 DB에서 findDeviceByMac 함수로 센서를 조회해야 함', async () => {
      // 먼저 rnDevicesRel에서 MAC 주소를 가져와서 테스트
      const { getAll } = await import('@/lib/mariadb/query');
      const deviceList = await getAll<{ mac: string }>('SELECT mac FROM rnDevicesRel WHERE school_no = ? LIMIT 1', [
        testSchoolNo,
      ]);

      if (deviceList.length === 0) {
        console.log('⚠️ 테스트할 센서가 없어 테스트를 건너뜁니다.');
        return;
      }

      const testMac = deviceList[0].mac;
      const result = await findDeviceByMac(testMac, testSchoolNo);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.mac).toBe(testMac);
        console.log('✅ findDeviceByMac 함수 조회 성공:', result);
      }
    });

    it('findDeviceByMac 함수로 존재하지 않는 센서 조회 시 null 반환해야 함', async () => {
      const nonExistentMac = '00:00:00:00:00:00';
      const result = await findDeviceByMac(nonExistentMac, testSchoolNo);

      expect(result).toBeNull();
      console.log('✅ findDeviceByMac 함수로 존재하지 않는 센서 조회 테스트 성공');
    });
  });

  describe('여러 MAC 주소 조회 테스트', () => {
    it('다양한 개수의 MAC 주소로 센서들을 조회해야 함', async () => {
      // 먼저 rnDevicesRel에서 MAC 주소들을 가져와서 테스트
      const { getAll } = await import('@/lib/mariadb/query');
      const deviceList = await getAll<{ mac: string }>('SELECT mac FROM rnDevicesRel WHERE school_no = ? LIMIT 5', [
        testSchoolNo,
      ]);

      if (deviceList.length === 0) {
        console.log('⚠️ 테스트할 센서가 없어 테스트를 건너뜁니다.');
        return;
      }

      // 1개 MAC 주소
      const singleMac = [deviceList[0].mac];
      const singleResult = await findDevicesByMacs(singleMac);
      expect(singleResult.length).toBeGreaterThan(0);
      console.log(`✅ 1개 MAC 주소 조회 성공: ${singleResult.length}개`);

      // 2개 MAC 주소
      if (deviceList.length >= 2) {
        const twoMacs = [deviceList[0].mac, deviceList[1].mac];
        const twoResult = await findDevicesByMacs(twoMacs);
        expect(twoResult.length).toBeGreaterThan(0);
        console.log(`✅ 2개 MAC 주소 조회 성공: ${twoResult.length}개`);
      }

      // 여러 개 MAC 주소
      const multipleMacs = deviceList.map((device) => device.mac);
      const multipleResult = await findDevicesByMacs(multipleMacs);
      expect(multipleResult.length).toBeGreaterThan(0);
      console.log(`✅ 여러 개 MAC 주소 조회 성공: ${multipleResult.length}개`);
    });

    it('존재하지 않는 MAC 주소가 포함된 리스트로 조회해야 함', async () => {
      const { getAll } = await import('@/lib/mariadb/query');
      const deviceList = await getAll<{ mac: string }>('SELECT mac FROM rnDevicesRel WHERE school_no = ? LIMIT 2', [
        testSchoolNo,
      ]);

      if (deviceList.length === 0) {
        console.log('⚠️ 테스트할 센서가 없어 테스트를 건너뜁니다.');
        return;
      }

      const mixedMacs = [deviceList[0].mac, 'NONEXISTENT_MAC', deviceList[1]?.mac].filter(Boolean);
      const result = await findDevicesByMacs(mixedMacs);

      // 존재하는 MAC 주소만 조회되어야 함
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(mixedMacs.length);
      console.log(`✅ 혼합 MAC 주소 조회 성공: ${result.length}개 (요청: ${mixedMacs.length}개)`);
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
            device: {
              model: 'TRANSACTION_TEST',
              ip: '192.168.1.100',
              rip: '192.168.1.101',
              splrate: 44100,
              interval: 60,
              ver: '1.0.0',
              tags: 'transaction,test',
              checkin: '2024-01-01T00:00:00Z',
              created: '2024-01-01T00:00:00Z',
            },
          },
        ];

        // 트랜잭션 내에서 삽입
        const insertResult = await insertRnDevices(testDeviceData, conn);
        expect(insertResult.affectedRows).toBeGreaterThan(0);
        console.log(`✅ 트랜잭션 내 센서 삽입 성공: ${testMac}`);

        // 트랜잭션 내에서 조회
        const devices = await findDevicesByMacs([testMac], conn);
        expect(devices.length).toBeGreaterThan(0);
        console.log('✅ 트랜잭션 내 센서 조회 성공');

        // 트랜잭션 롤백 (테스트 데이터 정리)
        await conn.rollback();
        console.log('✅ 트랜잭션 롤백 성공');
      } finally {
        conn.release();
      }
    });
  });

  describe('에러 케이스 테스트', () => {
    it('빈 MAC 주소 리스트로 조회 시 빈 배열 반환해야 함', async () => {
      const results = await findDevicesByMacs([]);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
      console.log('✅ 빈 MAC 주소 리스트 조회 테스트 성공');
    });

    it('존재하지 않는 MAC 주소로 업데이트 시 affectedRows가 0이어야 함', async () => {
      const nonExistentMac = '00:00:00:00:00:00';
      const newMac = '11:11:11:11:11:11';

      // 존재하지 않는 MAC 주소로 업데이트 시도
      const result = await updateDeviceMac(nonExistentMac, newMac);

      // affectedRows가 0이면 업데이트된 행이 없음을 의미
      expect(result.affectedRows).toBe(0);
      console.log('✅ 존재하지 않는 MAC 주소 업데이트 처리 성공');
    });

    it('존재하지 않는 MAC 주소로 삭제 시 affectedRows가 0이어야 함', async () => {
      const nonExistentMac = '00:00:00:00:00:00';

      // 존재하지 않는 MAC 주소로 삭제 시도
      const result = await softDeleteRnDevice([{ mac: nonExistentMac }]);

      // affectedRows가 0이면 삭제된 행이 없음을 의미
      expect(result.affectedRows).toBe(0);
      console.log('✅ 존재하지 않는 MAC 주소 삭제 처리 성공');
    });
  });

  describe('대량 데이터 처리 테스트', () => {
    it('여러 센서를 한 번에 삽입해야 함', async () => {
      const testMacs = [
        `AABBCCDDEE${Date.now().toString(16).slice(-6)}`,
        `FFGGHHIIJJ${Date.now().toString(16).slice(-6)}`,
        `KKLLMMNNOO${Date.now().toString(16).slice(-6)}`,
      ];

      const multipleDeviceData: DeviceCreate[] = testMacs.map((mac, index) => ({
        schoolNo: testSchoolNo,
        mac: mac,
        name: `대량 테스트 센서 ${index + 1}`,
        summary: `대량 테스트 설명 ${index + 1}`,
        kind: index + 1,
        extra: `대량 테스트 추가 정보 ${index + 1}`,
        sdate: '2024-01-01 00:00:00',
        edate: '2024-12-31 23:59:59',
        device: {
          model: `BULK_TEST_${index + 1}`,
          ip: `192.168.1.${100 + index}`,
          rip: `192.168.1.${200 + index}`,
          splrate: 44100 + index * 1000,
          interval: 60 + index * 10,
          ver: `1.${index}.0`,
          tags: `bulk,test,${index}`,
          checkin: '2024-01-01T00:00:00Z',
          created: '2024-01-01T00:00:00Z',
        },
      }));

      // 여러 센서를 한 번에 삽입
      const result = await insertRnDevices(multipleDeviceData);
      expect(result.affectedRows).toBe(testMacs.length);
      console.log(`✅ 대량 센서 삽입 성공: ${result.affectedRows}개`);

      // 삽입된 센서들 확인
      const insertedDevices = await findDevicesByMacs(testMacs);
      expect(insertedDevices.length).toBe(testMacs.length);
      console.log(`✅ 대량 센서 삽입 검증 성공: ${insertedDevices.length}개`);

      // 테스트 데이터 정리
      await softDeleteRnDevice(testMacs.map((mac) => ({ mac })));
      console.log('✅ 대량 센서 삭제 성공');
    });
  });
});

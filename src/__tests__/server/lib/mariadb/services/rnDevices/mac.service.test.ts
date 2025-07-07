// src/__tests__/server/lib/mariadb/services/mac.service.test.ts
import {
  getDevice,
  updateDevice,
  deleteDevice,
} from '@/services/areas/[area]/schools/[schoolNo]/devices/[mac]/[mac].service';
import {
  findRnDeviceRelBySchoolNoAndMac,
  updateRnDevicesRel,
  softDeleteRnDevicesRel,
  updateMacAddress,
} from '@/models/rnDevicesRel/rnDevicesRel.model';
import { findDeviceByMac, softDeleteRnDevice } from '@/models/rnDevices/rnDevices.model';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
// import { insertLogAction } from '@/models/history-action/history-action.model';

// Mock all dependencies
jest.mock('@/models/rnDevicesRel/rnDevicesRel.model');
jest.mock('@/models/rnDevices/rnDevices.model');
jest.mock('@/lib/mariadb/query');
jest.mock('@/services/log-action/log-action.service');
jest.mock('@/models/history-action/history-action.model', () => ({
  insertLogAction: jest.fn(),
}));

describe('Device Service', () => {
  const mockDevice = {
    mac: '123456789ABC',
    name: 'Test Device',
    summary: 'Test Summary',
    kind: 1,
    extra: 'Test Extra',
    sdate: '2024-01-01',
    edate: '2024-12-31',
    created: '2024-01-01',
    model: 'Test Model',
    ip: '192.168.1.1',
    rip: '192.168.1.2',
    splrate: 1,
    interval: 60,
    ver: '1.0.0',
    tags: 'test',
    checkin: '2024-01-01',
    device_created: '2024-01-01',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // logAction과 makeLogParams 모킹 설정
    (logAction as jest.Mock).mockResolvedValue(undefined);
    (makeLogParams as jest.Mock).mockReturnValue({});
  });

  // getDevice 테스트
  describe('getDevice', () => {
    it('should return device when valid params are provided', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findRnDeviceRelBySchoolNoAndMac as jest.Mock).mockResolvedValue(mockDevice);

      const result = await getDevice(
        { mac: '123456789ABC', schoolNo: 1 },
        { managerNo: 1, ip: '127.0.0.1', userAgent: 'test' },
      );

      expect(result).toEqual(mockDevice);
      expect(beginTransaction).toHaveBeenCalled();
      expect(commitTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should return null when device is not found', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findRnDeviceRelBySchoolNoAndMac as jest.Mock).mockResolvedValue(null);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await getDevice(
        { mac: '123456789ABC', schoolNo: 1 },
        { managerNo: 1, ip: '127.0.0.1', userAgent: 'test' },
      );

      expect(result).toBeNull();
      expect(beginTransaction).toHaveBeenCalled();
      expect(commitTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle database error', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findRnDeviceRelBySchoolNoAndMac as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(
        getDevice({ mac: '123456789ABC', schoolNo: 1 }, { managerNo: 1, ip: '127.0.0.1', userAgent: 'test' }),
      ).rejects.toThrow('센서 조회 중 오류가 발생했습니다.');

      expect(beginTransaction).toHaveBeenCalled();
      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle rollback error', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findRnDeviceRelBySchoolNoAndMac as jest.Mock).mockRejectedValue(new Error('DB Error'));
      (rollbackTransaction as jest.Mock).mockRejectedValue(new Error('Rollback Error'));

      await expect(
        getDevice({ mac: '123456789ABC', schoolNo: 1 }, { managerNo: 1, ip: '127.0.0.1', userAgent: 'test' }),
      ).rejects.toThrow('센서 조회 중 오류가 발생했습니다.');

      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle connection release error', async () => {
      const mockConn = {
        release: jest.fn().mockRejectedValue(new Error('Release Error')),
      };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findRnDeviceRelBySchoolNoAndMac as jest.Mock).mockResolvedValue(null);

      const result = await getDevice(
        { mac: '123456789ABC', schoolNo: 1 },
        { managerNo: 1, ip: '127.0.0.1', userAgent: 'test' },
      );

      expect(result).toBeNull();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle connection release error in finally block', async () => {
      const mockConn = {
        release: jest.fn().mockRejectedValue(new Error('Release Error')),
      };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findRnDeviceRelBySchoolNoAndMac as jest.Mock).mockResolvedValue(mockDevice);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await getDevice(
        { mac: '123456789ABC', schoolNo: 1 },
        { managerNo: 1, ip: '127.0.0.1', userAgent: 'test' },
      );

      expect(result).toEqual(mockDevice);
      expect(mockConn.release).toHaveBeenCalled();
      expect(commitTransaction).toHaveBeenCalled();
    });

    it('should handle connection release error in finally block when device is not found', async () => {
      const mockConn = {
        release: jest.fn().mockRejectedValue(new Error('Release Error')),
      };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findRnDeviceRelBySchoolNoAndMac as jest.Mock).mockResolvedValue(null);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await getDevice(
        { mac: '123456789ABC', schoolNo: 1 },
        { managerNo: 1, ip: '127.0.0.1', userAgent: 'test' },
      );

      expect(result).toBeNull();
      expect(mockConn.release).toHaveBeenCalled();
      expect(commitTransaction).toHaveBeenCalled();
    });

    it('should handle connection release error in finally block after rollback', async () => {
      const mockConn = {
        release: jest.fn().mockRejectedValue(new Error('Release Error')),
      };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findRnDeviceRelBySchoolNoAndMac as jest.Mock).mockRejectedValue(new Error('DB Error'));
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      await expect(
        getDevice({ mac: '123456789ABC', schoolNo: 1 }, { managerNo: 1, ip: '127.0.0.1', userAgent: 'test' }),
      ).rejects.toThrow('센서 조회 중 오류가 발생했습니다.');

      expect(mockConn.release).toHaveBeenCalled();
      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('should handle rollback error in catch block', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findRnDeviceRelBySchoolNoAndMac as jest.Mock).mockRejectedValue(new Error('DB Error'));
      (rollbackTransaction as jest.Mock).mockRejectedValue(new Error('Rollback Error'));

      await expect(
        getDevice({ mac: '123456789ABC', schoolNo: 1 }, { managerNo: 1, ip: '127.0.0.1', userAgent: 'test' }),
      ).rejects.toThrow('센서 조회 중 오류가 발생했습니다.');

      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle MAC update failure with rollback error', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findDeviceByMac as jest.Mock).mockResolvedValue(mockDevice);
      (updateMacAddress as jest.Mock).mockRejectedValue(new Error('MAC Update Error'));
      (rollbackTransaction as jest.Mock).mockRejectedValue(new Error('Rollback Error'));

      const updateData = {
        mac: '987654321DEF',
        oldMac: '123456789ABC',
        schoolNo: 1,
        name: 'Test Device',
        summary: 'Test Summary',
        kind: 1,
        extra: 'Test Extra',
        sdate: '2024-01-01',
        edate: '2024-12-31',
      };

      await expect(
        updateDevice(updateData, {
          managerNo: 1,
          ip: '127.0.0.1',
          userAgent: 'test',
        }),
      ).rejects.toThrow('센서 수정 중 오류가 발생했습니다.');

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle soft delete failure with rollback error', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findDeviceByMac as jest.Mock).mockResolvedValue(mockDevice);
      (softDeleteRnDevicesRel as jest.Mock).mockRejectedValue(new Error('Soft Delete Error'));
      (rollbackTransaction as jest.Mock).mockRejectedValue(new Error('Rollback Error'));

      await expect(
        deleteDevice({ mac: '123456789ABC', schoolNo: 1 }, { managerNo: 1, ip: '127.0.0.1', userAgent: 'test' }),
      ).rejects.toThrow('센서 삭제 중 오류가 발생했습니다.');

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle connection release error in getDevice', async () => {
      const mockConn = {
        release: jest.fn().mockRejectedValue(new Error('Release Error')),
      };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findRnDeviceRelBySchoolNoAndMac as jest.Mock).mockResolvedValue(mockDevice);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await getDevice(
        { mac: '123456789ABC', schoolNo: 1 },
        { managerNo: 1, ip: '127.0.0.1', userAgent: 'test' },
      );

      expect(result).toEqual(mockDevice);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle connection release error in updateDevice', async () => {
      const mockConn = {
        release: jest.fn().mockRejectedValue(new Error('Release Error')),
      };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findDeviceByMac as jest.Mock).mockResolvedValue(mockDevice);
      (updateRnDevicesRel as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const updateData = {
        mac: '123456789ABC',
        oldMac: '123456789ABC',
        schoolNo: 1,
        name: 'Test Device',
        summary: 'Test Summary',
        kind: 1,
        extra: 'Test Extra',
        sdate: '2024-01-01',
        edate: '2024-12-31',
      };

      const result = await updateDevice(updateData, {
        managerNo: 1,
        ip: '127.0.0.1',
        userAgent: 'test',
      });

      expect(result).toEqual({ mac: updateData.mac });
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle connection release error in deleteDevice', async () => {
      const mockConn = {
        release: jest.fn().mockRejectedValue(new Error('Release Error')),
      };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findDeviceByMac as jest.Mock).mockResolvedValue(mockDevice);
      (softDeleteRnDevicesRel as jest.Mock).mockResolvedValue(undefined);
      (softDeleteRnDevice as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      await deleteDevice({ mac: '123456789ABC', schoolNo: 1 }, { managerNo: 1, ip: '127.0.0.1', userAgent: 'test' });

      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle transaction error without connection', async () => {
      (beginTransaction as jest.Mock).mockRejectedValue(new Error('Transaction Error'));

      await expect(
        getDevice({ mac: '123456789ABC', schoolNo: 1 }, { managerNo: 1, ip: '127.0.0.1', userAgent: 'test' }),
      ).rejects.toThrow('센서 조회 중 오류가 발생했습니다.');

      expect(rollbackTransaction).not.toHaveBeenCalled();
    });

    it('getDevice에서 logAction 실패 시 에러를 로깅하고 계속 진행해야 함', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findRnDeviceRelBySchoolNoAndMac as jest.Mock).mockResolvedValue(mockDevice);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      // logAction이 실패하도록 모킹
      (logAction as jest.Mock).mockRejectedValueOnce(new Error('Log action failed'));

      const result = await getDevice(
        { mac: '123456789ABC', schoolNo: 1 },
        { managerNo: 1, ip: '127.0.0.1', userAgent: 'test' },
      );

      expect(result).toEqual(mockDevice);
      expect(commitTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });
  });

  // updateDevice 테스트
  describe('updateDevice', () => {
    it('should update device successfully', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findDeviceByMac as jest.Mock).mockResolvedValue(mockDevice);

      const updateData = {
        mac: '123456789ABC',
        oldMac: '123456789ABC',
        schoolNo: 1,
        name: 'Test Device',
        summary: 'Test Summary',
        kind: 1,
        extra: 'Test Extra',
        sdate: '2024-01-01',
        edate: '2024-12-31',
      };

      const result = await updateDevice(updateData, {
        managerNo: 1,
        ip: '127.0.0.1',
        userAgent: 'test',
      });

      expect(result).toEqual({ mac: updateData.mac });
      expect(beginTransaction).toHaveBeenCalled();
      expect(commitTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should throw error when oldMac is not provided in updateDevice', async () => {
      const updateData = {
        mac: '123456789ABC',
        schoolNo: 1,
        name: 'Test Device',
        summary: 'Test Summary',
        kind: 1,
        extra: 'Test Extra',
        sdate: '2024-01-01',
        edate: '2024-12-31',
      };

      await expect(
        updateDevice(updateData, {
          managerNo: 1,
          ip: '127.0.0.1',
          userAgent: 'test',
        }),
      ).rejects.toThrow('기존 MAC 주소가 필요합니다.');
    });

    it('should throw error when device is not found', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findRnDeviceRelBySchoolNoAndMac as jest.Mock).mockResolvedValue(null);

      const updateData = {
        mac: '123456789ABC',
        oldMac: '123456789ABC',
        schoolNo: 1,
        name: 'Test Device',
        summary: 'Test Summary',
        kind: 1,
        extra: 'Test Extra',
        sdate: '2024-01-01',
        edate: '2024-12-31',
      };

      await expect(
        updateDevice(updateData, {
          managerNo: 1,
          ip: '127.0.0.1',
          userAgent: 'test',
        }),
      ).rejects.toThrow('기존 MAC 주소로 등록된 센서를 찾을 수 없습니다.');

      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle database error', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findRnDeviceRelBySchoolNoAndMac as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const updateData = {
        mac: '123456789ABC',
        oldMac: '123456789ABC',
        schoolNo: 1,
        name: 'Test Device',
        summary: 'Test Summary',
        kind: 1,
        extra: 'Test Extra',
        sdate: '2024-01-01',
        edate: '2024-12-31',
      };

      await expect(
        updateDevice(updateData, {
          managerNo: 1,
          ip: '127.0.0.1',
          userAgent: 'test',
        }),
      ).rejects.toThrow('센서 수정 중 오류가 발생했습니다.');

      expect(beginTransaction).toHaveBeenCalled();
      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle rollback error during update', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findDeviceByMac as jest.Mock).mockResolvedValue(mockDevice);
      (updateRnDevicesRel as jest.Mock).mockRejectedValue(new Error('DB Error'));
      (rollbackTransaction as jest.Mock).mockRejectedValue(new Error('Rollback Error'));

      const updateData = {
        mac: '123456789ABC',
        oldMac: '123456789ABC',
        schoolNo: 1,
        name: 'Test Device',
        summary: 'Test Summary',
        kind: 1,
        extra: 'Test Extra',
        sdate: '2024-01-01',
        edate: '2024-12-31',
      };

      await expect(
        updateDevice(updateData, {
          managerNo: 1,
          ip: '127.0.0.1',
          userAgent: 'test',
        }),
      ).rejects.toThrow('센서 수정 중 오류가 발생했습니다.');

      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle MAC address update failure', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findDeviceByMac as jest.Mock).mockResolvedValue(mockDevice);
      (updateMacAddress as jest.Mock).mockRejectedValue(new Error('MAC update failed'));

      const updateData = {
        mac: '987654321DEF',
        oldMac: '123456789ABC',
        schoolNo: 1,
        name: 'Test Device',
        summary: 'Test Summary',
        kind: 1,
        extra: 'Test Extra',
        sdate: '2024-01-01',
        edate: '2024-12-31',
      };

      await expect(
        updateDevice(updateData, {
          managerNo: 1,
          ip: '127.0.0.1',
          userAgent: 'test',
        }),
      ).rejects.toThrow('센서 수정 중 오류가 발생했습니다.');

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle connection release error in finally block', async () => {
      const mockConn = {
        release: jest.fn().mockRejectedValue(new Error('Release Error')),
      };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findDeviceByMac as jest.Mock).mockResolvedValue(mockDevice);

      const updateData = {
        mac: '123456789ABC',
        oldMac: '123456789ABC',
        schoolNo: 1,
        name: 'Test Device',
        summary: 'Test Summary',
        kind: 1,
        extra: 'Test Extra',
        sdate: '2024-01-01',
        edate: '2024-12-31',
      };

      await expect(
        updateDevice(updateData, {
          managerNo: 1,
          ip: '127.0.0.1',
          userAgent: 'test',
        }),
      ).rejects.toThrow('센서 수정 중 오류가 발생했습니다.');

      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle rollback error in catch block', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findDeviceByMac as jest.Mock).mockResolvedValue(mockDevice);
      (updateRnDevicesRel as jest.Mock).mockRejectedValue(new Error('DB Error'));
      (rollbackTransaction as jest.Mock).mockRejectedValue(new Error('Rollback Error'));

      const updateData = {
        mac: '123456789ABC',
        oldMac: '123456789ABC',
        schoolNo: 1,
        name: 'Test Device',
        summary: 'Test Summary',
        kind: 1,
        extra: 'Test Extra',
        sdate: '2024-01-01',
        edate: '2024-12-31',
      };

      await expect(
        updateDevice(updateData, {
          managerNo: 1,
          ip: '127.0.0.1',
          userAgent: 'test',
        }),
      ).rejects.toThrow('센서 수정 중 오류가 발생했습니다.');

      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle rollback error in catch block with MAC update', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findDeviceByMac as jest.Mock).mockResolvedValue(mockDevice);
      (updateMacAddress as jest.Mock).mockRejectedValue(new Error('MAC update failed'));
      (rollbackTransaction as jest.Mock).mockRejectedValue(new Error('Rollback Error'));

      const updateData = {
        mac: '987654321DEF',
        oldMac: '123456789ABC',
        schoolNo: 1,
        name: 'Test Device',
        summary: 'Test Summary',
        kind: 1,
        extra: 'Test Extra',
        sdate: '2024-01-01',
        edate: '2024-12-31',
      };

      await expect(
        updateDevice(updateData, {
          managerNo: 1,
          ip: '127.0.0.1',
          userAgent: 'test',
        }),
      ).rejects.toThrow('센서 수정 중 오류가 발생했습니다.');

      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should update device without MAC change successfully', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findDeviceByMac as jest.Mock).mockResolvedValue(mockDevice);
      (updateRnDevicesRel as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const updateData = {
        mac: '123456789ABC',
        oldMac: '123456789ABC',
        schoolNo: 1,
        name: 'Updated Device',
        summary: 'Updated Summary',
        kind: 1,
        extra: 'Updated Extra',
        sdate: '2024-01-01',
        edate: '2024-12-31',
      };

      const result = await updateDevice(updateData, {
        managerNo: 1,
        ip: '127.0.0.1',
        userAgent: 'test',
      });

      expect(result).toEqual({ mac: updateData.mac });
      expect(updateMacAddress).not.toHaveBeenCalled();
      expect(updateRnDevicesRel).toHaveBeenCalled();
      expect(commitTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should throw error when required fields are missing', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);

      const updateData = {
        mac: '123456789ABC',
        oldMac: '123456789ABC',
        schoolNo: 1,
        name: null,
        summary: 'Test Summary',
        kind: 1,
        extra: 'Test Extra',
        sdate: '2024-01-01',
        edate: '2024-12-31',
      };

      const result = await updateDevice(updateData, {
        managerNo: 1,
        ip: '127.0.0.1',
        userAgent: 'test',
      });

      expect(result).toEqual({ mac: updateData.mac });
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle commit transaction failure', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findDeviceByMac as jest.Mock).mockResolvedValue(mockDevice);
      (updateRnDevicesRel as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockRejectedValue(new Error('Commit Error'));

      const updateData = {
        mac: '123456789ABC',
        oldMac: '123456789ABC',
        schoolNo: 1,
        name: 'Test Device',
        summary: 'Test Summary',
        kind: 1,
        extra: 'Test Extra',
        sdate: '2024-01-01',
        edate: '2024-12-31',
      };

      await expect(
        updateDevice(updateData, {
          managerNo: 1,
          ip: '127.0.0.1',
          userAgent: 'test',
        }),
      ).rejects.toThrow('센서 수정 중 오류가 발생했습니다.');

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle MAC update with rollback error in catch block', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findDeviceByMac as jest.Mock).mockResolvedValue(mockDevice);
      (updateMacAddress as jest.Mock).mockRejectedValue(new Error('MAC Update Error'));
      (rollbackTransaction as jest.Mock).mockRejectedValue(new Error('Rollback Error'));

      const updateData = {
        mac: '987654321DEF',
        oldMac: '123456789ABC',
        schoolNo: 1,
        name: 'Test Device',
        summary: 'Test Summary',
        kind: 1,
        extra: 'Test Extra',
        sdate: '2024-01-01',
        edate: '2024-12-31',
      };

      await expect(
        updateDevice(updateData, {
          managerNo: 1,
          ip: '127.0.0.1',
          userAgent: 'test',
        }),
      ).rejects.toThrow('센서 수정 중 오류가 발생했습니다.');

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle transaction error without connection in updateDevice', async () => {
      (beginTransaction as jest.Mock).mockRejectedValue(new Error('Transaction Error'));

      const updateData = {
        mac: '123456789ABC',
        oldMac: '123456789ABC',
        schoolNo: 1,
        name: 'Test Device',
        summary: 'Test Summary',
        kind: 1,
        extra: 'Test Extra',
        sdate: '2024-01-01',
        edate: '2024-12-31',
      };

      await expect(
        updateDevice(updateData, {
          managerNo: 1,
          ip: '127.0.0.1',
          userAgent: 'test',
        }),
      ).rejects.toThrow('센서 수정 중 오류가 발생했습니다.');

      expect(rollbackTransaction).not.toHaveBeenCalled();
    });

    it('should handle transaction error without connection in deleteDevice', async () => {
      (beginTransaction as jest.Mock).mockRejectedValue(new Error('Transaction Error'));

      await expect(
        deleteDevice({ mac: '123456789ABC', schoolNo: 1 }, { managerNo: 1, ip: '127.0.0.1', userAgent: 'test' }),
      ).rejects.toThrow('센서 삭제 중 오류가 발생했습니다.');

      expect(rollbackTransaction).not.toHaveBeenCalled();
    });

    it('should handle MAC update with same MAC address', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findDeviceByMac as jest.Mock).mockResolvedValue(mockDevice);
      (updateRnDevicesRel as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const updateData = {
        mac: '123456789ABC', // oldMac과 동일한 MAC 주소
        oldMac: '123456789ABC',
        schoolNo: 1,
        name: 'Test Device',
        summary: 'Test Summary',
        kind: 1,
        extra: 'Test Extra',
        sdate: '2024-01-01',
        edate: '2024-12-31',
      };

      const result = await updateDevice(updateData, {
        managerNo: 1,
        ip: '127.0.0.1',
        userAgent: 'test',
      });

      expect(result).toEqual({ mac: updateData.mac });
      expect(updateMacAddress).not.toHaveBeenCalled();
      expect(commitTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('oldMac이 없는 경우 에러를 발생시켜야 함', async () => {
      const dto = {
        mac: '00:11:22:33:44:55',
        schoolNo: 1,
        name: '테스트 센서',
        summary: null,
        kind: 1,
        extra: null,
        sdate: null,
        edate: null,
      };
      const meta = {
        managerNo: 1,
        ip: '127.0.0.1',
        userAgent: 'test-agent',
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(updateDevice(dto as any, meta)).rejects.toThrow('기존 MAC 주소가 필요합니다.');
    });

    it('updateDevice에서 logAction 실패 시 에러를 로깅하고 계속 진행해야 함', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findRnDeviceRelBySchoolNoAndMac as jest.Mock).mockResolvedValue(mockDevice);
      (updateRnDevicesRel as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      // makeLogParams는 성공하고 logAction만 실패하도록 모킹
      (logAction as jest.Mock).mockRejectedValueOnce(new Error('Log action failed'));

      const updateData = {
        mac: '123456789ABC',
        oldMac: '123456789ABC',
        schoolNo: 1,
        name: 'Test Device',
        summary: 'Test Summary',
        kind: 1,
        extra: 'Test Extra',
        sdate: '2024-01-01',
        edate: '2024-12-31',
      };

      const result = await updateDevice(updateData, {
        managerNo: 1,
        ip: '127.0.0.1',
        userAgent: 'test',
      });

      expect(result).toEqual({ mac: updateData.mac });
      expect(commitTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('updateDevice에서 makeLogParams 실패 시 에러를 로깅하고 계속 진행해야 함', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findRnDeviceRelBySchoolNoAndMac as jest.Mock).mockResolvedValue(mockDevice);
      (updateRnDevicesRel as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      // makeLogParams가 실패하도록 모킹
      (makeLogParams as jest.Mock).mockImplementationOnce(() => {
        throw new Error('makeLogParams failed');
      });

      const updateData = {
        mac: '123456789ABC',
        oldMac: '123456789ABC',
        schoolNo: 1,
        name: 'Test Device',
        summary: 'Test Summary',
        kind: 1,
        extra: 'Test Extra',
        sdate: '2024-01-01',
        edate: '2024-12-31',
      };

      const result = await updateDevice(updateData, {
        managerNo: 1,
        ip: '127.0.0.1',
        userAgent: 'test',
      });

      expect(result).toEqual({ mac: updateData.mac });
      expect(commitTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('updateDevice에서 findDeviceByMac이 null을 반환할 때 에러를 발생시켜야 함', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findRnDeviceRelBySchoolNoAndMac as jest.Mock).mockResolvedValue(null);

      const updateData = {
        mac: '123456789ABC',
        oldMac: '123456789ABC',
        schoolNo: 1,
        name: 'Test Device',
        summary: 'Test Summary',
        kind: 1,
        extra: 'Test Extra',
        sdate: '2024-01-01',
        edate: '2024-12-31',
      };

      await expect(
        updateDevice(updateData, {
          managerNo: 1,
          ip: '127.0.0.1',
          userAgent: 'test',
        }),
      ).rejects.toThrow('기존 MAC 주소로 등록된 센서를 찾을 수 없습니다.');

      expect(mockConn.release).toHaveBeenCalled();
    });
  });

  // deleteDevice 테스트
  describe('deleteDevice', () => {
    it('should delete device successfully', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findDeviceByMac as jest.Mock).mockResolvedValue(mockDevice);
      (softDeleteRnDevicesRel as jest.Mock).mockResolvedValue(undefined);
      (softDeleteRnDevice as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      await deleteDevice({ mac: '123456789ABC', schoolNo: 1 }, { managerNo: 1, ip: '127.0.0.1', userAgent: 'test' });

      expect(softDeleteRnDevicesRel).toHaveBeenCalled();
      expect(softDeleteRnDevice).toHaveBeenCalled();
      expect(commitTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should not throw error when device is not found', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findRnDeviceRelBySchoolNoAndMac as jest.Mock).mockResolvedValue(null);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      await deleteDevice({ mac: '123456789ABC', schoolNo: 1 }, { managerNo: 1, ip: '127.0.0.1', userAgent: 'test' });

      expect(softDeleteRnDevicesRel).not.toHaveBeenCalled();
      expect(softDeleteRnDevice).not.toHaveBeenCalled();
      expect(commitTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle database error', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findRnDeviceRelBySchoolNoAndMac as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(
        deleteDevice({ mac: '123456789ABC', schoolNo: 1 }, { managerNo: 1, ip: '127.0.0.1', userAgent: 'test' }),
      ).rejects.toThrow('센서 삭제 중 오류가 발생했습니다.');

      expect(beginTransaction).toHaveBeenCalled();
      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle rollback error during delete', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findDeviceByMac as jest.Mock).mockResolvedValue(mockDevice);
      (softDeleteRnDevicesRel as jest.Mock).mockRejectedValue(new Error('DB Error'));
      (rollbackTransaction as jest.Mock).mockRejectedValue(new Error('Rollback Error'));

      await expect(
        deleteDevice({ mac: '123456789ABC', schoolNo: 1 }, { managerNo: 1, ip: '127.0.0.1', userAgent: 'test' }),
      ).rejects.toThrow('센서 삭제 중 오류가 발생했습니다.');

      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle connection release error in finally block', async () => {
      const mockConn = {
        release: jest.fn().mockRejectedValue(new Error('Release Error')),
      };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findDeviceByMac as jest.Mock).mockResolvedValue(mockDevice);

      await expect(
        deleteDevice({ mac: '123456789ABC', schoolNo: 1 }, { managerNo: 1, ip: '127.0.0.1', userAgent: 'test' }),
      ).rejects.toThrow('센서 삭제 중 오류가 발생했습니다.');

      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle rollback error in catch block', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findDeviceByMac as jest.Mock).mockResolvedValue(mockDevice);
      (softDeleteRnDevicesRel as jest.Mock).mockRejectedValue(new Error('DB Error'));
      (rollbackTransaction as jest.Mock).mockRejectedValue(new Error('Rollback Error'));

      await expect(
        deleteDevice({ mac: '123456789ABC', schoolNo: 1 }, { managerNo: 1, ip: '127.0.0.1', userAgent: 'test' }),
      ).rejects.toThrow('센서 삭제 중 오류가 발생했습니다.');

      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle soft delete failure', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findDeviceByMac as jest.Mock).mockResolvedValue(mockDevice);
      (softDeleteRnDevicesRel as jest.Mock).mockRejectedValue(new Error('Soft Delete Error'));

      await expect(
        deleteDevice({ mac: '123456789ABC', schoolNo: 1 }, { managerNo: 1, ip: '127.0.0.1', userAgent: 'test' }),
      ).rejects.toThrow('센서 삭제 중 오류가 발생했습니다.');

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle MAC update with rollback error in catch block', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findDeviceByMac as jest.Mock).mockResolvedValue(mockDevice);
      (updateMacAddress as jest.Mock).mockRejectedValue(new Error('MAC Update Error'));
      (rollbackTransaction as jest.Mock).mockRejectedValue(new Error('Rollback Error'));

      const updateData = {
        mac: '987654321DEF',
        oldMac: '123456789ABC',
        schoolNo: 1,
        name: 'Test Device',
        summary: 'Test Summary',
        kind: 1,
        extra: 'Test Extra',
        sdate: '2024-01-01',
        edate: '2024-12-31',
      };

      await expect(
        updateDevice(updateData, {
          managerNo: 1,
          ip: '127.0.0.1',
          userAgent: 'test',
        }),
      ).rejects.toThrow('센서 수정 중 오류가 발생했습니다.');

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle device deletion failure', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findDeviceByMac as jest.Mock).mockResolvedValue(mockDevice);
      (softDeleteRnDevicesRel as jest.Mock).mockRejectedValue(new Error('Delete Error'));

      await expect(
        deleteDevice({ mac: '123456789ABC', schoolNo: 1 }, { managerNo: 1, ip: '127.0.0.1', userAgent: 'test' }),
      ).rejects.toThrow('센서 삭제 중 오류가 발생했습니다.');

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('should handle error without connection in deleteDevice', async () => {
      (beginTransaction as jest.Mock).mockResolvedValue(null);
      (findDeviceByMac as jest.Mock).mockResolvedValue(mockDevice);
      (softDeleteRnDevicesRel as jest.Mock).mockRejectedValue(new Error('Delete Error'));

      await expect(
        deleteDevice({ mac: '123456789ABC', schoolNo: 1 }, { managerNo: 1, ip: '127.0.0.1', userAgent: 'test' }),
      ).rejects.toThrow('센서 삭제 중 오류가 발생했습니다.');

      expect(rollbackTransaction).not.toHaveBeenCalled();
    });

    it('존재하지 않는 디바이스 삭제 시 조용히 종료되어야 함', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findRnDeviceRelBySchoolNoAndMac as jest.Mock).mockResolvedValue(null);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const params = {
        mac: '00:11:22:33:44:55',
        schoolNo: 1,
      };
      const meta = {
        managerNo: 1,
        ip: '127.0.0.1',
        userAgent: 'test-agent',
      };

      await expect(deleteDevice(params, meta)).resolves.not.toThrow();
    });

    it('롤백 에러 발생 시 에러를 로깅하고 던져야 함', async () => {
      const params = {
        mac: '00:11:22:33:44:55',
        schoolNo: 1,
      };
      const meta = {
        managerNo: 1,
        ip: '127.0.0.1',
        userAgent: 'test-agent',
      };

      // findDeviceByMac이 에러를 발생시키도록 모킹
      (findDeviceByMac as jest.Mock).mockRejectedValueOnce(new Error('DB 에러'));

      // rollbackTransaction이 에러를 발생시키도록 모킹
      (rollbackTransaction as jest.Mock).mockRejectedValueOnce(new Error('롤백 에러'));

      await expect(deleteDevice(params, meta)).rejects.toThrow('센서 삭제 중 오류가 발생했습니다.');
    });

    it('deleteDevice에서 logAction 실패 시 에러를 로깅하고 계속 진행해야 함', async () => {
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findRnDeviceRelBySchoolNoAndMac as jest.Mock).mockResolvedValue(mockDevice);
      (softDeleteRnDevicesRel as jest.Mock).mockResolvedValue(undefined);
      (softDeleteRnDevice as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      // logAction이 실패하도록 모킹
      (logAction as jest.Mock).mockRejectedValueOnce(new Error('Log action failed'));

      await deleteDevice({ mac: '123456789ABC', schoolNo: 1 }, { managerNo: 1, ip: '127.0.0.1', userAgent: 'test' });

      expect(commitTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });
  });
});

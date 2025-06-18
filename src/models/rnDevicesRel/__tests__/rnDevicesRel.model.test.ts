import {
  findRnDevicesRelBySchoolNo,
  findRnDeviceRelBySchoolNoAndMac,
  insertRnDevicesRel,
  findRelByMac,
  updateRnDevicesRel,
  softDeleteRnDevicesRel,
  updateMac,
} from '../rnDevicesRel.model';
import { exec, getAll, getRow } from '@/lib/mariadb/query';
import { deviceDbSchema } from '@/types/device';

// Mock dependencies
jest.mock('@/lib/mariadb/query');
jest.mock('@/models/rnDevices/rnDevices.model', () => ({
  updateDeviceMac: jest.fn(),
}));

describe('rnDevicesRel Model', () => {
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
  });

  describe('findRnDevicesRelBySchoolNo', () => {
    it('should return devices with total count', async () => {
      const mockTotal = { total: 1 };
      const mockDevices = [mockDevice];

      (getRow as jest.Mock).mockResolvedValue(mockTotal);
      (getAll as jest.Mock).mockResolvedValue(mockDevices);

      const result = await findRnDevicesRelBySchoolNo({
        school_no: 1,
        page: 1,
        pageSize: 10,
      });

      expect(result).toEqual({
        devices: [deviceDbSchema.parse(mockDevice)],
        total: 1,
      });
    });

    it('should handle filters correctly', async () => {
      const mockTotal = { total: 1 };
      const mockDevices = [mockDevice];

      (getRow as jest.Mock).mockResolvedValue(mockTotal);
      (getAll as jest.Mock).mockResolvedValue(mockDevices);

      const result = await findRnDevicesRelBySchoolNo({
        school_no: 1,
        page: 1,
        pageSize: 10,
        filters: {
          model: 'Test',
          ip: '192.168.1.1',
          rip: '192.168.1.2',
          interval: 60,
          ver: '1.0.0',
          tags: 'test',
        },
      });

      expect(result).toEqual({
        devices: [deviceDbSchema.parse(mockDevice)],
        total: 1,
      });
    });

    it('should handle empty result', async () => {
      const mockTotal = { total: 0 };
      (getRow as jest.Mock).mockResolvedValue(mockTotal);
      (getAll as jest.Mock).mockResolvedValue([]);

      const result = await findRnDevicesRelBySchoolNo({
        school_no: 1,
        page: 1,
        pageSize: 10,
      });

      expect(result).toEqual({
        devices: [],
        total: 0,
      });
    });
  });

  describe('findRnDeviceRelBySchoolNoAndMac', () => {
    it('should return device when found', async () => {
      (getRow as jest.Mock).mockResolvedValue(mockDevice);

      const result = await findRnDeviceRelBySchoolNoAndMac({
        mac: '123456789ABC',
        school_no: 1,
      });

      expect(result).toEqual(deviceDbSchema.parse(mockDevice));
    });

    it('should return null when device not found', async () => {
      (getRow as jest.Mock).mockResolvedValue(null);

      const result = await findRnDeviceRelBySchoolNoAndMac({
        mac: '123456789ABC',
        school_no: 1,
      });

      expect(result).toBeNull();
    });
  });

  describe('insertRnDevicesRel', () => {
    it('should insert devices successfully', async () => {
      const mockResult = { affectedRows: 1, insertId: 1 };
      (exec as jest.Mock).mockResolvedValue(mockResult);

      const result = await insertRnDevicesRel([
        {
          schoolNo: 1,
          mac: '123456789ABC',
          name: 'Test Device',
          summary: 'Test Summary',
          kind: 1,
          extra: 'Test Extra',
          sdate: '2024-01-01',
          edate: '2024-12-31',
        },
      ]);

      expect(result).toEqual(mockResult);
    });

    it('should handle multiple devices', async () => {
      const mockResult = { affectedRows: 2, insertId: 1 };
      (exec as jest.Mock).mockResolvedValue(mockResult);

      const result = await insertRnDevicesRel([
        {
          schoolNo: 1,
          mac: '123456789ABC',
          name: 'Test Device 1',
          summary: 'Test Summary 1',
          kind: 1,
          extra: 'Test Extra 1',
          sdate: '2024-01-01',
          edate: '2024-12-31',
        },
        {
          schoolNo: 1,
          mac: '987654321DEF',
          name: 'Test Device 2',
          summary: 'Test Summary 2',
          kind: 1,
          extra: 'Test Extra 2',
          sdate: '2024-01-01',
          edate: '2024-12-31',
        },
      ]);

      expect(result).toEqual(mockResult);
    });
  });

  describe('findRelByMac', () => {
    it('should return true when device exists', async () => {
      (getRow as jest.Mock).mockResolvedValue({ 1: 1 });

      const result = await findRelByMac('123456789ABC');

      expect(result).toBeTruthy();
    });

    it('should return false when device does not exist', async () => {
      (getRow as jest.Mock).mockResolvedValue(null);

      const result = await findRelByMac('123456789ABC');

      expect(result).toBeFalsy();
    });
  });

  describe('updateRnDevicesRel', () => {
    it('should update device with new MAC', async () => {
      const mockResult = { affectedRows: 1 };
      (exec as jest.Mock).mockResolvedValue(mockResult);

      await updateRnDevicesRel([
        {
          mac: '987654321DEF',
          oldMac: '123456789ABC',
          school_no: 1,
          name: 'Updated Device',
          summary: 'Updated Summary',
          kind: 1,
          extra: 'Updated Extra',
          sdate: '2024-01-01',
          edate: '2024-12-31',
        },
      ]);

      expect(exec).toHaveBeenCalled();
    });

    it('should update device without MAC change', async () => {
      const mockResult = { affectedRows: 1 };
      (exec as jest.Mock).mockResolvedValue(mockResult);

      await updateRnDevicesRel([
        {
          mac: '123456789ABC',
          oldMac: '123456789ABC',
          school_no: 1,
          name: 'Updated Device',
          summary: 'Updated Summary',
          kind: 1,
          extra: 'Updated Extra',
          sdate: '2024-01-01',
          edate: '2024-12-31',
        },
      ]);

      expect(exec).toHaveBeenCalled();
    });
  });

  describe('softDeleteRnDevicesRel', () => {
    it('should delete devices successfully', async () => {
      const mockResult = { affectedRows: 1 };
      (exec as jest.Mock).mockResolvedValue(mockResult);

      await softDeleteRnDevicesRel([
        { mac: '123456789ABC', school_no: 1 },
        { mac: '987654321DEF', school_no: 1 },
      ]);

      expect(exec).toHaveBeenCalled();
    });
  });

  describe('updateMac', () => {
    it('should update MAC successfully', async () => {
      (getRow as jest.Mock).mockResolvedValue(null);
      (exec as jest.Mock).mockResolvedValue({ affectedRows: 1 });

      await updateMac([
        {
          school_no: 1,
          oldMac: '123456789ABC',
          newMac: '987654321DEF',
        },
      ]);

      expect(exec).toHaveBeenCalled();
    });

    it('should throw error when new MAC already exists', async () => {
      (getRow as jest.Mock).mockResolvedValue({ 1: 1 });

      await expect(
        updateMac([
          {
            school_no: 1,
            oldMac: '123456789ABC',
            newMac: '987654321DEF',
          },
        ]),
      ).rejects.toThrow('이미 존재하는 mac입니다');
    });

    it('should throw error when update fails', async () => {
      (getRow as jest.Mock).mockResolvedValue(null);
      (exec as jest.Mock).mockResolvedValue({ affectedRows: 0 });

      await expect(
        updateMac([
          {
            school_no: 1,
            oldMac: '123456789ABC',
            newMac: '987654321DEF',
          },
        ]),
      ).rejects.toThrow('mac 변경 실패');
    });
  });
});

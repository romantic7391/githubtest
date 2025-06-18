import {
  insertRnDevices,
  findDeviceByMac,
  findDevicesByMacs,
  softDeleteRnDevice,
  updateDeviceMac,
} from '../rnDevices.model';
import { exec, getAll, getRow } from '@/lib/mariadb/query';
import type { DeviceCreate } from '@/types/device';

// Mock dependencies
jest.mock('@/lib/mariadb/query');

describe('rnDevices Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('insertRnDevices', () => {
    it('should insert devices successfully', async () => {
      const mockResult = { affectedRows: 1, insertId: 1 };
      (exec as jest.Mock).mockResolvedValue(mockResult);

      const devices: DeviceCreate[] = [
        {
          mac: '123456789ABC',
          name: 'Test Device',
          summary: 'Test Summary',
          kind: 1,
          extra: 'Test Extra',
          sdate: '2024-01-01',
          edate: '2024-12-31',
          schoolNo: 1,
          device: {
            created: '2024-01-01',
            model: 'Test Model',
            ip: '192.168.1.1',
            rip: '192.168.1.2',
            splrate: 1,
            interval: 60,
            ver: '1.0.0',
            tags: 'test',
            checkin: '2024-01-01',
          },
        },
      ];

      const result = await insertRnDevices(devices);

      expect(result).toEqual(mockResult);
    });

    it('should handle null device properties', async () => {
      const mockResult = { affectedRows: 1, insertId: 1 };
      (exec as jest.Mock).mockResolvedValue(mockResult);

      const devices: DeviceCreate[] = [
        {
          mac: '123456789ABC',
          name: 'Test Device',
          summary: 'Test Summary',
          kind: 1,
          extra: 'Test Extra',
          sdate: '2024-01-01',
          edate: '2024-12-31',
          schoolNo: 1,
          device: undefined,
        },
      ];

      const result = await insertRnDevices(devices);

      expect(result).toEqual(mockResult);
    });

    it('should handle multiple devices', async () => {
      const mockResult = { affectedRows: 2, insertId: 1 };
      (exec as jest.Mock).mockResolvedValue(mockResult);

      const devices: DeviceCreate[] = [
        {
          mac: '123456789ABC',
          name: 'Test Device 1',
          summary: 'Test Summary 1',
          kind: 1,
          extra: 'Test Extra 1',
          sdate: '2024-01-01',
          edate: '2024-12-31',
          schoolNo: 1,
          device: {
            created: '2024-01-01',
            model: 'Test Model 1',
            ip: '192.168.1.1',
            rip: '192.168.1.2',
            splrate: 1,
            interval: 60,
            ver: '1.0.0',
            tags: 'test1',
            checkin: '2024-01-01',
          },
        },
        {
          mac: '987654321DEF',
          name: 'Test Device 2',
          summary: 'Test Summary 2',
          kind: 1,
          extra: 'Test Extra 2',
          sdate: '2024-01-01',
          edate: '2024-12-31',
          schoolNo: 1,
          device: {
            created: '2024-01-02',
            model: 'Test Model 2',
            ip: '192.168.1.3',
            rip: '192.168.1.4',
            splrate: 2,
            interval: 120,
            ver: '1.0.1',
            tags: 'test2',
            checkin: '2024-01-02',
          },
        },
      ];

      const result = await insertRnDevices(devices);

      expect(result).toEqual(mockResult);
    });
  });

  describe('findDeviceByMac', () => {
    it('should return device when found', async () => {
      const mockDevice = { mac: '123456789ABC' };
      (getRow as jest.Mock).mockResolvedValue(mockDevice);

      const result = await findDeviceByMac('123456789ABC', 1);

      expect(result).toEqual(mockDevice);
    });

    it('should return null when device not found', async () => {
      (getRow as jest.Mock).mockResolvedValue(null);

      const result = await findDeviceByMac('123456789ABC', 1);

      expect(result).toBeNull();
    });

    it('should handle database error', async () => {
      (getRow as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(findDeviceByMac('123456789ABC', 1)).rejects.toThrow('DB Error');
    });
  });

  describe('findDevicesByMacs', () => {
    it('should return devices when found', async () => {
      const mockDevices = [{ mac: '123456789ABC' }, { mac: '987654321DEF' }];
      (getAll as jest.Mock).mockResolvedValue(mockDevices);

      const result = await findDevicesByMacs(['123456789ABC', '987654321DEF']);

      expect(result).toEqual(mockDevices);
    });

    it('should return empty array when no devices found', async () => {
      (getAll as jest.Mock).mockResolvedValue([]);

      const result = await findDevicesByMacs(['123456789ABC', '987654321DEF']);

      expect(result).toEqual([]);
    });

    it('should return empty array when macList is empty', async () => {
      const result = await findDevicesByMacs([]);

      expect(result).toEqual([]);
    });

    it('should handle database error', async () => {
      (getAll as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(findDevicesByMacs(['123456789ABC'])).rejects.toThrow('DB Error');
    });
  });

  describe('softDeleteRnDevice', () => {
    it('should delete devices successfully', async () => {
      const mockResult = { affectedRows: 2 };
      (exec as jest.Mock).mockResolvedValue(mockResult);

      const result = await softDeleteRnDevice([{ mac: '123456789ABC' }, { mac: '987654321DEF' }]);

      expect(result).toEqual(mockResult);
    });

    it('should handle single device deletion', async () => {
      const mockResult = { affectedRows: 1 };
      (exec as jest.Mock).mockResolvedValue(mockResult);

      const result = await softDeleteRnDevice([{ mac: '123456789ABC' }]);

      expect(result).toEqual(mockResult);
    });

    it('should handle database error', async () => {
      (exec as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(softDeleteRnDevice([{ mac: '123456789ABC' }])).rejects.toThrow('DB Error');
    });

    it('should handle empty device list', async () => {
      const mockResult = { affectedRows: 0 };
      (exec as jest.Mock).mockResolvedValue(mockResult);

      const result = await softDeleteRnDevice([]);

      expect(result).toEqual(mockResult);
      expect(exec).toHaveBeenCalled();
    });
  });

  describe('updateDeviceMac', () => {
    it('should update MAC address successfully', async () => {
      const mockResult = { affectedRows: 1 };
      (exec as jest.Mock).mockResolvedValue(mockResult);

      const result = await updateDeviceMac('123456789ABC', '987654321DEF');

      expect(result).toEqual(mockResult);
      expect(exec).toHaveBeenCalled();
    });

    it('should handle database error', async () => {
      (exec as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(updateDeviceMac('123456789ABC', '987654321DEF')).rejects.toThrow('DB Error');
    });

    it('should handle update failure', async () => {
      const mockResult = { affectedRows: 0 };
      (exec as jest.Mock).mockResolvedValue(mockResult);

      const result = await updateDeviceMac('123456789ABC', '987654321DEF');

      expect(result).toEqual(mockResult);
    });

    it('should handle same MAC address update', async () => {
      const mockResult = { affectedRows: 1 };
      (exec as jest.Mock).mockResolvedValue(mockResult);

      const result = await updateDeviceMac('123456789ABC', '123456789ABC');

      expect(result).toEqual(mockResult);
      expect(exec).toHaveBeenCalled();
    });
  });
});

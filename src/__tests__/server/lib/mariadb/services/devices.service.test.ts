import { getRnDevicesRelBySchoolNo } from '@/services/areas/[area]/schools/[schoolNo]/devices/devices.service';
import { findRnDevicesRelBySchoolNo } from '@/models/rnDevicesRel/rnDevicesRel.model';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { AppError } from '@/utils/error.utils';

// Next.js 모듈 모킹
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

jest.mock('@/models/rnDevicesRel/rnDevicesRel.model');
jest.mock('@/lib/mariadb/query');
jest.mock('@/services/log-action/log-action.service', () => ({
  logAction: jest.fn(),
  makeLogParams: jest.fn(),
}));

describe('Devices Service', () => {
  const mockConn = {
    release: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
  });

  describe('getRnDevicesRelBySchoolNo', () => {
    const params = {
      school_no: 1,
      page: 1,
      pageSize: 10,
    };

    const meta = {
      manager_no: 1,
      ip: '127.0.0.1',
      user_agent: 'test',
    };

    it('학교의 센서 장치 목록을 성공적으로 조회해야 함', async () => {
      const mockDevices = [
        { mac: '00:11:22:33:44:55', school_no: 1 },
        { mac: 'AA:BB:CC:DD:EE:FF', school_no: 1 },
      ];

      (findRnDevicesRelBySchoolNo as jest.Mock).mockResolvedValue({
        devices: mockDevices,
        total: 2,
      });

      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await getRnDevicesRelBySchoolNo(params, meta);

      expect(result).toEqual({
        devices: mockDevices,
        pagination: {
          page: 1,
          pageSize: 10,
          total: 2,
          totalPages: 1,
        },
      });

      expect(findRnDevicesRelBySchoolNo).toHaveBeenCalledWith(params);
      expect(commitTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('센서 장치가 없는 경우 404 에러를 발생시켜야 함', async () => {
      (findRnDevicesRelBySchoolNo as jest.Mock).mockResolvedValue({
        devices: [],
        total: 0,
      });

      await expect(getRnDevicesRelBySchoolNo(params, meta)).rejects.toThrow(
        new AppError('해당 학교의 센서 장치가 존재하지 않습니다.', 404),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('DB 조회 중 에러가 발생하면 500 에러를 발생시켜야 함', async () => {
      (findRnDevicesRelBySchoolNo as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(getRnDevicesRelBySchoolNo(params, meta)).rejects.toThrow(
        new AppError('센서 장치 목록 조회 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('트랜잭션 롤백 중 에러가 발생해도 원래 에러를 유지해야 함', async () => {
      (findRnDevicesRelBySchoolNo as jest.Mock).mockRejectedValue(new Error('DB Error'));
      (rollbackTransaction as jest.Mock).mockRejectedValue(new Error('Rollback Error'));

      await expect(getRnDevicesRelBySchoolNo(params, meta)).rejects.toThrow(
        new AppError('센서 장치 목록 조회 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('커넥션 해제 중 에러가 발생해도 원래 에러를 유지해야 함', async () => {
      (findRnDevicesRelBySchoolNo as jest.Mock).mockRejectedValue(new Error('DB Error'));
      mockConn.release.mockRejectedValue(new Error('Release Error'));

      await expect(getRnDevicesRelBySchoolNo(params, meta)).rejects.toThrow(
        new AppError('센서 장치 목록 조회 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });
  });
});

import { getRnDevicesRelBySchoolNo } from '@/services/areas/[area]/schools/[schoolNo]/devices/devices.service';
import { findRnDevicesRelBySchoolNo } from '@/models/rnDevicesRel/rnDevicesRel.model';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { AppError } from '@/utils/error.utils';
import type { Device } from '@/types/device';

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
      schoolNo: 1,
      page: 1,
      pageSize: 10,
    };

    const meta = {
      managerNo: 1,
      schoolNo: 1,
      ip: '127.0.0.1',
      userAgent: 'test',
    };

    it('학교의 센서 장치 목록을 성공적으로 조회해야 함', async () => {
      const mockDevices: Device[] = [
        {
          mac: '00:11:22:33:44:55',
          name: null,
          summary: null,
          kind: 0,
          extra: null,
          sdate: null,
          edate: null,
          device: {
            model: '',
            ip: null,
            rip: null,
            splrate: 0,
            interval: 0,
            ver: '',
            tags: null,
            checkin: null,
            created: null,
          },
        },
        {
          mac: 'AA:BB:CC:DD:EE:FF',
          name: null,
          summary: null,
          kind: 0,
          extra: null,
          sdate: null,
          edate: null,
          device: {
            model: '',
            ip: null,
            rip: null,
            splrate: 0,
            interval: 0,
            ver: '',
            tags: null,
            checkin: null,
            created: null,
          },
        },
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

    it('total이 0일 때 totalPages가 1이 되어야 함', async () => {
      const mockDevices: Device[] = [];
      (findRnDevicesRelBySchoolNo as jest.Mock).mockResolvedValue({
        devices: mockDevices,
        total: 0,
      });

      await expect(getRnDevicesRelBySchoolNo(params, meta)).rejects.toThrow(
        new AppError('해당 학교의 센서 장치가 존재하지 않습니다.', 404),
      );
    });

    it('Math.ceil(total / pageSize)가 0이 될 때 totalPages가 1이 되어야 함', async () => {
      const mockDevices: Device[] = [
        {
          mac: '00:11:22:33:44:55',
          name: null,
          summary: null,
          kind: 0,
          extra: null,
          sdate: null,
          edate: null,
          device: {
            model: '',
            ip: null,
            rip: null,
            splrate: 0,
            interval: 0,
            ver: '',
            tags: null,
            checkin: null,
            created: null,
          },
        },
      ];

      const largePageSizeParams = {
        ...params,
        pageSize: 999999,
      };

      (findRnDevicesRelBySchoolNo as jest.Mock).mockResolvedValue({
        devices: mockDevices,
        total: 1,
      });

      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await getRnDevicesRelBySchoolNo(largePageSizeParams, meta);

      expect(result.pagination.totalPages).toBe(1);
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

    it('AppError가 발생하면 상태 코드와 메시지가 그대로 전달되어야 함', async () => {
      const customError = new AppError('커스텀 에러 메시지', 418); // 임의의 상태 코드 사용
      (findRnDevicesRelBySchoolNo as jest.Mock).mockRejectedValue(customError);

      await expect(getRnDevicesRelBySchoolNo(params, meta)).rejects.toThrow(customError);

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('findRnDevicesRelBySchoolNo에서 AppError가 발생하면 그대로 전달되어야 함', async () => {
      const dbError = new AppError('데이터베이스 조회 권한이 없습니다.', 403);
      (findRnDevicesRelBySchoolNo as jest.Mock).mockRejectedValue(dbError);

      await expect(getRnDevicesRelBySchoolNo(params, meta)).rejects.toThrow(dbError);

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('트랜잭션 롤백 중 에러가 발생해도 원래 에러를 유지해야 함', async () => {
      const originalError = new Error('원본 에러');
      (findRnDevicesRelBySchoolNo as jest.Mock).mockRejectedValue(originalError);
      (rollbackTransaction as jest.Mock).mockRejectedValue(new Error('Rollback Error'));

      await expect(getRnDevicesRelBySchoolNo(params, meta)).rejects.toThrow(
        new AppError('센서 장치 목록 조회 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('커넥션 해제 중 에러가 발생해도 원래 에러를 유지해야 함', async () => {
      const originalError = new Error('원본 에러');
      (findRnDevicesRelBySchoolNo as jest.Mock).mockRejectedValue(originalError);
      mockConn.release.mockRejectedValue(new Error('Release Error'));

      await expect(getRnDevicesRelBySchoolNo(params, meta)).rejects.toThrow(
        new AppError('센서 장치 목록 조회 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('일반 에러가 발생하면 500 에러로 변환되어야 함', async () => {
      // Given
      (findRnDevicesRelBySchoolNo as jest.Mock).mockRejectedValue(new Error('일반 에러'));

      // When & Then
      await expect(getRnDevicesRelBySchoolNo(params, meta)).rejects.toThrow(
        new AppError('센서 장치 목록 조회 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });
  });
});

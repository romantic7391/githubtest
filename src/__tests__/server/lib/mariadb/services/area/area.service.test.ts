import { getAreas } from '@/services/areas/areas.service';
import { findAreas } from '@/models/area/area.model';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';

// Mock dependencies
jest.mock('@/models/area/area.model');
jest.mock('@/services/log-action/log-action.service');
jest.mock('@/lib/mariadb/query');

describe('지역 서비스 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // makeLogParams mock 설정
    (makeLogParams as jest.Mock).mockImplementation((params) => ({
      ...params,
      oldValues: params.oldValues ?? '',
    }));

    // logAction mock 설정
    (logAction as jest.Mock).mockResolvedValue(undefined);
  });

  describe('getAreas', () => {
    it('지역 목록을 성공적으로 조회해야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const mockAreas = [
        { area: 'seoul', X: 123, Y: 456 },
        { area: 'daejeon', X: 789, Y: 12 },
      ];
      const mockResult = {
        areas: mockAreas,
        total: 2,
      };
      (findAreas as jest.Mock).mockResolvedValue(mockResult);

      const mockMeta = {
        managerNo: 1,
        schoolNo: 0,
        ip: '127.0.0.1',
        userAgent: 'test-agent',
      };

      // Execute
      const result = await getAreas(1, 10, [], mockMeta);

      // Assert
      expect(result).toEqual(mockResult);
      expect(findAreas).toHaveBeenCalledWith(1, 10, []);
      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: 1,
        schoolNo: 0,
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        actionType: 'S',
        targetTable: 'AreaData',
        targetId: 'seoul,daejeon',
        oldValues: null,
        newValues: JSON.stringify({ data: mockAreas }),
        reason: '지역 목록 조회',
      });
      expect(logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          managerNo: 1,
          schoolNo: 0,
          ip: '127.0.0.1',
          userAgent: 'test-agent',
          actionType: 'S',
          targetTable: 'AreaData',
          targetId: 'seoul,daejeon',
          oldValues: '',
          newValues: JSON.stringify({ data: mockAreas }),
          reason: '지역 목록 조회',
        }),
        mockConn,
      );
      expect(commitTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('meta가 없을 때 로그를 기록하지 않아야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const mockResult = {
        areas: [{ area: 'seoul', X: 123, Y: 456 }],
        total: 1,
      };
      (findAreas as jest.Mock).mockResolvedValue(mockResult);

      // Execute
      const result = await getAreas(1, 10, []);

      // Assert
      expect(result).toEqual(mockResult);
      expect(logAction).not.toHaveBeenCalled();
      expect(commitTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('DB 조회 실패 시 에러를 발생시켜야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      const dbError = new Error('Database connection failed');
      (findAreas as jest.Mock).mockRejectedValue(dbError);

      // Execute & Assert
      await expect(getAreas(1, 10, [])).rejects.toThrow('학교 목록 조회 중 오류가 발생했습니다.');
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('트랜잭션 커밋 실패 시 에러를 발생시켜야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (commitTransaction as jest.Mock).mockRejectedValue(new Error('Commit failed'));

      const mockResult = {
        areas: [{ area: 'seoul', X: 123, Y: 456 }],
        total: 1,
      };
      (findAreas as jest.Mock).mockResolvedValue(mockResult);

      // Execute & Assert
      await expect(getAreas(1, 10, [])).rejects.toThrow('학교 목록 조회 중 오류가 발생했습니다.');
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('커넥션 해제 실패 시 에러를 로깅해야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn().mockRejectedValue(new Error('Release failed')) };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const mockResult = {
        areas: [{ area: 'seoul', X: 123, Y: 456 }],
        total: 1,
      };
      (findAreas as jest.Mock).mockResolvedValue(mockResult);

      // Spy on console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Execute
      const result = await getAreas(1, 10, []);

      // Assert
      expect(result).toEqual(mockResult);
      expect(consoleSpy).toHaveBeenCalledWith('Connection release error:', expect.any(Error));
      expect(mockConn.release).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('지역 필터링이 올바르게 작동해야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const mockResult = {
        areas: [{ area: 'seoul', X: 123, Y: 456 }],
        total: 1,
      };
      (findAreas as jest.Mock).mockResolvedValue(mockResult);

      const areasFilter = ['seoul', 'daejeon'];

      // Execute
      await getAreas(1, 10, areasFilter);

      // Assert
      expect(findAreas).toHaveBeenCalledWith(1, 10, areasFilter);
    });

    it('페이지네이션 파라미터가 올바르게 전달되어야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const mockResult = {
        areas: [],
        total: 0,
      };
      (findAreas as jest.Mock).mockResolvedValue(mockResult);

      // Execute
      await getAreas(2, 5, []);

      // Assert
      expect(findAreas).toHaveBeenCalledWith(2, 5, []);
    });

    it('빈 결과일 때 target_id가 null이어야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const mockResult = {
        areas: [],
        total: 0,
      };
      (findAreas as jest.Mock).mockResolvedValue(mockResult);

      const mockMeta = {
        managerNo: 1,
        schoolNo: 0,
        ip: '127.0.0.1',
        userAgent: 'test-agent',
      };

      // Execute
      const result = await getAreas(1, 10, [], mockMeta);

      // Assert
      expect(result).toEqual(mockResult);
      expect(logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          targetId: null,
        }),
        mockConn,
      );
    });

    it('commitTransaction 실패 시 38번째 줄이 실행되지 않아야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (commitTransaction as jest.Mock).mockRejectedValue(new Error('Commit failed'));

      const mockResult = {
        areas: [{ area: 'seoul', X: 123, Y: 456 }],
        total: 1,
      };
      (findAreas as jest.Mock).mockResolvedValue(mockResult);

      // Execute & Assert
      await expect(getAreas(1, 10, [])).rejects.toThrow('학교 목록 조회 중 오류가 발생했습니다.');
      // 38번째 줄이 실행되지 않음 (catch 블록으로 이동)
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('findAreas 실패 시 38번째 줄이 실행되지 않아야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      const dbError = new Error('findAreas failed');
      (findAreas as jest.Mock).mockRejectedValue(dbError);

      // Execute & Assert
      await expect(getAreas(1, 10, [])).rejects.toThrow('학교 목록 조회 중 오류가 발생했습니다.');
      // 38번째 줄이 실행되지 않음 (catch 블록으로 이동)
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('beginTransaction 실패 시 38번째 줄이 실행되지 않아야 함', async () => {
      // Mock setup
      (beginTransaction as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      // Execute & Assert
      await expect(getAreas(1, 10, [])).rejects.toThrow('학교 목록 조회 중 오류가 발생했습니다.');
      // 38번째 줄이 실행되지 않음 (catch 블록으로 이동)
    });

    it('meta가 undefined일 때 38번째 줄이 실행되어야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const mockResult = {
        areas: [{ area: 'seoul', X: 123, Y: 456 }],
        total: 1,
      };
      (findAreas as jest.Mock).mockResolvedValue(mockResult);

      // Execute - meta를 undefined로 명시적 전달
      const result = await getAreas(1, 10, [], undefined);

      // Assert
      expect(result).toEqual(mockResult);
      expect(logAction).not.toHaveBeenCalled(); // meta가 없으므로 로그 기록 안됨
      expect(commitTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });
  });
});

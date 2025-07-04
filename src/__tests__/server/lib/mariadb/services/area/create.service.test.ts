import { createArea, existsAreaByAreaName } from '@/services/areas/create/create.service';
import { insertArea, checkAreaExists } from '@/models/area/area.model';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import type { AreaCreate } from '@/types/area';

// Mock dependencies
jest.mock('@/models/area/area.model');
jest.mock('@/services/log-action/log-action.service');
jest.mock('@/lib/mariadb/query');

describe('지역 생성 서비스 테스트', () => {
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

  describe('existsAreaByAreaName', () => {
    it('지역이 존재할 때 true를 반환해야 함', async () => {
      // Mock setup
      (checkAreaExists as jest.Mock).mockResolvedValue(true);

      // Execute
      const result = await existsAreaByAreaName('seoul');

      // Assert
      expect(result).toBe(true);
      expect(checkAreaExists).toHaveBeenCalledWith('seoul');
    });

    it('지역이 존재하지 않을 때 false를 반환해야 함', async () => {
      // Mock setup
      (checkAreaExists as jest.Mock).mockResolvedValue(false);

      // Execute
      const result = await existsAreaByAreaName('newarea');

      // Assert
      expect(result).toBe(false);
      expect(checkAreaExists).toHaveBeenCalledWith('newarea');
    });
  });

  describe('createArea', () => {
    const mockAreaData: AreaCreate = {
      area: 'newarea',
      x: 123.456,
      y: 789.012,
      areaCode: 'NEW001',
    };

    const mockMeta = {
      managerNo: 1,
      schoolNo: 0,
      ip: '127.0.0.1',
      userAgent: 'test-agent',
    };

    it('지역을 성공적으로 생성해야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (checkAreaExists as jest.Mock).mockResolvedValue(false);
      (insertArea as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute
      await createArea(mockAreaData, mockMeta);

      // Assert
      expect(beginTransaction).toHaveBeenCalled();
      expect(checkAreaExists).toHaveBeenCalledWith('newarea');
      expect(insertArea).toHaveBeenCalledWith(mockAreaData);
      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: 1,
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        actionType: 'I',
        targetTable: 'AreaData',
        targetId: 'newarea',
        oldValues: null,
        newValues: JSON.stringify(mockAreaData),
        reason: '지역 생성',
      });
      expect(logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          managerNo: 1,
          ip: '127.0.0.1',
          userAgent: 'test-agent',
          actionType: 'I',
          targetTable: 'AreaData',
          targetId: 'newarea',
          oldValues: '',
          newValues: JSON.stringify(mockAreaData),
          reason: '지역 생성',
        }),
        mockConn,
      );
      expect(commitTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('이미 존재하는 지역명일 때 에러를 발생시켜야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (checkAreaExists as jest.Mock).mockResolvedValue(true);
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute & Assert
      await expect(createArea(mockAreaData, mockMeta)).rejects.toThrow('이미 존재하는 지역명입니다.');
      expect(checkAreaExists).toHaveBeenCalledWith('newarea');
      expect(insertArea).not.toHaveBeenCalled();
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('insertArea 실패 시 에러를 발생시켜야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (checkAreaExists as jest.Mock).mockResolvedValue(false);
      (insertArea as jest.Mock).mockRejectedValue(new Error('Insert failed'));
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute & Assert
      await expect(createArea(mockAreaData, mockMeta)).rejects.toThrow('Insert failed');
      expect(insertArea).toHaveBeenCalledWith(mockAreaData);
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('commitTransaction 실패 시 에러를 발생시켜야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (checkAreaExists as jest.Mock).mockResolvedValue(false);
      (insertArea as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockRejectedValue(new Error('Commit failed'));
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute & Assert
      await expect(createArea(mockAreaData, mockMeta)).rejects.toThrow('Commit failed');
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('rollbackTransaction 실패 시 에러를 로깅해야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (checkAreaExists as jest.Mock).mockResolvedValue(true);
      (rollbackTransaction as jest.Mock).mockRejectedValue(new Error('Rollback failed'));

      // Spy on console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Execute & Assert
      await expect(createArea(mockAreaData, mockMeta)).rejects.toThrow('이미 존재하는 지역명입니다.');
      expect(consoleSpy).toHaveBeenCalledWith('Rollback error:', expect.any(Error));
      expect(mockConn.release).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('커넥션 해제 실패 시 에러를 로깅해야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn().mockRejectedValue(new Error('Release failed')) };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (checkAreaExists as jest.Mock).mockResolvedValue(false);
      (insertArea as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      // Spy on console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Execute
      await createArea(mockAreaData, mockMeta);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Connection release error:', expect.any(Error));
      expect(mockConn.release).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('beginTransaction 실패 시 에러를 발생시켜야 함', async () => {
      // Mock setup
      (beginTransaction as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      // Execute & Assert
      await expect(createArea(mockAreaData, mockMeta)).rejects.toThrow('Connection failed');
    });

    it('checkAreaExists 실패 시 에러를 발생시켜야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (checkAreaExists as jest.Mock).mockRejectedValue(new Error('Check failed'));
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute & Assert
      await expect(createArea(mockAreaData, mockMeta)).rejects.toThrow('Check failed');
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('logAction 실패 시 에러를 발생시켜야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (checkAreaExists as jest.Mock).mockResolvedValue(false);
      (insertArea as jest.Mock).mockResolvedValue(undefined);
      (logAction as jest.Mock).mockRejectedValue(new Error('Log failed'));
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute & Assert
      await expect(createArea(mockAreaData, mockMeta)).rejects.toThrow('Log failed');
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('makeLogParams 실패 시 에러를 발생시켜야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (checkAreaExists as jest.Mock).mockResolvedValue(false);
      (insertArea as jest.Mock).mockResolvedValue(undefined);
      (makeLogParams as jest.Mock).mockImplementation(() => {
        throw new Error('MakeLogParams failed');
      });
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute & Assert
      await expect(createArea(mockAreaData, mockMeta)).rejects.toThrow('MakeLogParams failed');
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('다른 타입의 에러가 발생할 때 기본 에러 메시지를 반환해야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (checkAreaExists as jest.Mock).mockResolvedValue(false);
      (insertArea as jest.Mock).mockRejectedValue('String error');
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute & Assert
      await expect(createArea(mockAreaData, mockMeta)).rejects.toThrow('지역 생성 중 오류가 발생했습니다.');
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });
  });
});

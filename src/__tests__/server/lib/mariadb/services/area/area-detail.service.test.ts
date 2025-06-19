import { getAreaByArea, updateArea, deleteArea } from '@/services/areas/[area]/[area].service';
import { findAreaByArea, updateAreaInfo, deleteAreaFromDB, checkAreaExists } from '@/models/area/area.model';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import type { Area } from '@/types/area';

// Mock dependencies
jest.mock('@/models/area/area.model');
jest.mock('@/services/log-action/log-action.service');
jest.mock('@/lib/mariadb/query');

describe('지역 상세 서비스 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // makeLogParams mock 설정
    (makeLogParams as jest.Mock).mockImplementation((params) => ({
      ...params,
      old_values: params.old_values ?? '',
    }));

    // logAction mock 설정
    (logAction as jest.Mock).mockResolvedValue(undefined);
  });

  const mockMeta = {
    manager_no: 1,
    school_no: 0,
    ip: '127.0.0.1',
    user_agent: 'test-agent',
  };

  describe('getAreaByArea', () => {
    it('지역 정보를 성공적으로 조회해야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const mockAreaData = [
        {
          areaNo: 1,
          area: 'seoul',
          x: 123.456,
          y: 789.012,
          areaCode: 'SEO001',
        },
      ];
      (findAreaByArea as jest.Mock).mockResolvedValue(mockAreaData);

      // Execute
      const result = await getAreaByArea('seoul', mockMeta);

      // Assert
      expect(result).toEqual(mockAreaData);
      expect(findAreaByArea).toHaveBeenCalledWith('seoul');
      expect(makeLogParams).toHaveBeenCalledWith({
        manager_no: 1,
        ip: '127.0.0.1',
        user_agent: 'test-agent',
        action_type: 'S',
        target_table: 'AreaData',
        target_id: 'seoul',
        old_values: null,
        new_values: JSON.stringify(mockAreaData[0]),
        reason: '지역 정보 조회',
      });
      expect(logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          manager_no: 1,
          ip: '127.0.0.1',
          user_agent: 'test-agent',
          action_type: 'S',
          target_table: 'AreaData',
          target_id: 'seoul',
          old_values: '',
          new_values: JSON.stringify(mockAreaData[0]),
          reason: '지역 정보 조회',
        }),
        mockConn,
      );
      expect(commitTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('DB 조회 실패 시 에러를 발생시켜야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      const dbError = new Error('Database connection failed');
      (findAreaByArea as jest.Mock).mockRejectedValue(dbError);

      // Execute & Assert
      await expect(getAreaByArea('seoul', mockMeta)).rejects.toThrow('지역 목록 조회 중 오류가 발생했습니다.');
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('커넥션 해제 실패 시 에러를 로깅해야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn().mockRejectedValue(new Error('Release failed')) };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const mockAreaData = [{ area: 'seoul', x: 123, y: 456 }];
      (findAreaByArea as jest.Mock).mockResolvedValue(mockAreaData);

      // Spy on console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Execute
      const result = await getAreaByArea('seoul', mockMeta);

      // Assert
      expect(result).toEqual(mockAreaData);
      expect(consoleSpy).toHaveBeenCalledWith('Connection release error:', expect.any(Error));
      expect(mockConn.release).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('성공 시 37-38번째 줄이 실행되어야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const mockAreaData = [{ area: 'seoul', x: 123, y: 456 }];
      (findAreaByArea as jest.Mock).mockResolvedValue(mockAreaData);

      // Execute
      const result = await getAreaByArea('seoul', mockMeta);

      // Assert - 37-38번째 줄이 실행되었는지 확인
      expect(commitTransaction).toHaveBeenCalledWith(mockConn);
      expect(result).toEqual(mockAreaData);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('beginTransaction 실패 시 conn이 undefined여야 함', async () => {
      // Mock setup
      (beginTransaction as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      // Execute & Assert
      await expect(getAreaByArea('seoul', mockMeta)).rejects.toThrow('지역 목록 조회 중 오류가 발생했습니다.');
      // conn이 undefined이므로 if (conn) 블록이 실행되지 않음
    });

    it('rollbackTransaction 실패 시 에러를 로깅해야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findAreaByArea as jest.Mock).mockRejectedValue(new Error('Find failed'));
      (rollbackTransaction as jest.Mock).mockRejectedValue(new Error('Rollback failed'));

      // Spy on console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Execute & Assert
      await expect(getAreaByArea('seoul', mockMeta)).rejects.toThrow('지역 목록 조회 중 오류가 발생했습니다.');
      expect(consoleSpy).toHaveBeenCalledWith('Rollback error:', expect.any(Error));
      expect(mockConn.release).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('updateArea', () => {
    const mockAreaData: Area = {
      areaNo: 1,
      area: 'seoul',
      x: 123.456,
      y: 789.012,
      areaCode: 'SEO001',
    };

    it('지역 정보를 성공적으로 수정해야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (checkAreaExists as jest.Mock).mockResolvedValue(false);
      (findAreaByArea as jest.Mock).mockResolvedValue([{ ...mockAreaData }]);
      (updateAreaInfo as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute
      await updateArea(mockAreaData, mockMeta);

      // Assert
      expect(checkAreaExists).toHaveBeenCalledWith('seoul');
      expect(findAreaByArea).toHaveBeenCalledWith('seoul');
      expect(updateAreaInfo).toHaveBeenCalledWith(mockAreaData, mockConn);
      expect(makeLogParams).toHaveBeenCalledWith({
        manager_no: 1,
        ip: '127.0.0.1',
        user_agent: 'test-agent',
        action_type: 'U',
        target_table: 'AreaData',
        target_id: 'seoul',
        old_values: JSON.stringify([{ ...mockAreaData }]),
        new_values: JSON.stringify(mockAreaData),
        reason: '지역 정보 수정',
      });
      expect(logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          manager_no: 1,
          ip: '127.0.0.1',
          user_agent: 'test-agent',
          action_type: 'U',
          target_table: 'AreaData',
          target_id: 'seoul',
          old_values: JSON.stringify([{ ...mockAreaData }]),
          new_values: JSON.stringify(mockAreaData),
          reason: '지역 정보 수정',
        }),
        mockConn,
      );
      expect(commitTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('지역명이 없을 때 에러를 발생시켜야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      const areaDataWithoutName = { ...mockAreaData, area: null };

      // Execute & Assert
      await expect(updateArea(areaDataWithoutName, mockMeta)).rejects.toThrow('지역명이 필요합니다.');
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('이미 존재하는 지역명일 때 에러를 발생시켜야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (checkAreaExists as jest.Mock).mockResolvedValue(true);
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute & Assert
      await expect(updateArea(mockAreaData, mockMeta)).rejects.toThrow('이미 존재하는 지역명입니다.');
      expect(checkAreaExists).toHaveBeenCalledWith('seoul');
      expect(updateAreaInfo).not.toHaveBeenCalled();
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('updateAreaInfo 실패 시 에러를 발생시켜야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (checkAreaExists as jest.Mock).mockResolvedValue(false);
      (findAreaByArea as jest.Mock).mockResolvedValue([{ ...mockAreaData }]);
      (updateAreaInfo as jest.Mock).mockRejectedValue(new Error('Update failed'));
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute & Assert
      await expect(updateArea(mockAreaData, mockMeta)).rejects.toThrow('Update failed');
      expect(updateAreaInfo).toHaveBeenCalledWith(mockAreaData, mockConn);
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('다른 타입의 에러가 발생할 때 기본 에러 메시지를 반환해야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (checkAreaExists as jest.Mock).mockResolvedValue(false);
      (findAreaByArea as jest.Mock).mockResolvedValue([{ ...mockAreaData }]);
      (updateAreaInfo as jest.Mock).mockRejectedValue('String error');
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute & Assert
      await expect(updateArea(mockAreaData, mockMeta)).rejects.toThrow('지역 수정 중 오류가 발생했습니다.');
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('성공 시 96번째 줄이 실행되어야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (checkAreaExists as jest.Mock).mockResolvedValue(false);
      (findAreaByArea as jest.Mock).mockResolvedValue([{ ...mockAreaData }]);
      (updateAreaInfo as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute
      await updateArea(mockAreaData, mockMeta);

      // Assert - 96번째 줄이 실행되었는지 확인
      expect(commitTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('beginTransaction 실패 시 conn이 undefined여야 함', async () => {
      // Mock setup
      (beginTransaction as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      // Execute & Assert
      await expect(updateArea(mockAreaData, mockMeta)).rejects.toThrow('Connection failed');
      // conn이 undefined이므로 if (conn) 블록이 실행되지 않음
    });

    it('rollbackTransaction 실패 시 에러를 로깅해야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (checkAreaExists as jest.Mock).mockResolvedValue(false);
      (findAreaByArea as jest.Mock).mockResolvedValue([{ ...mockAreaData }]);
      (updateAreaInfo as jest.Mock).mockRejectedValue(new Error('Update failed'));
      (rollbackTransaction as jest.Mock).mockRejectedValue(new Error('Rollback failed'));

      // Spy on console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Execute & Assert
      await expect(updateArea(mockAreaData, mockMeta)).rejects.toThrow('Update failed');
      expect(consoleSpy).toHaveBeenCalledWith('Rollback error:', expect.any(Error));
      expect(mockConn.release).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('deleteArea', () => {
    it('지역을 성공적으로 삭제해야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findAreaByArea as jest.Mock).mockResolvedValue([
        {
          areaNo: 1,
          area: 'seoul',
          x: 123.456,
          y: 789.012,
          areaCode: 'SEO001',
        },
      ]);
      (deleteAreaFromDB as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute
      await deleteArea('seoul', mockMeta);

      // Assert
      expect(findAreaByArea).toHaveBeenCalledWith('seoul');
      expect(deleteAreaFromDB).toHaveBeenCalledWith('seoul');
      expect(makeLogParams).toHaveBeenCalledWith({
        manager_no: 1,
        ip: '127.0.0.1',
        user_agent: 'test-agent',
        action_type: 'D',
        target_table: 'AreaData',
        target_id: 'seoul',
        old_values: JSON.stringify([
          {
            areaNo: 1,
            area: 'seoul',
            x: 123.456,
            y: 789.012,
            areaCode: 'SEO001',
          },
        ]),
        new_values: null,
        reason: '지역 삭제',
      });
      expect(logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          manager_no: 1,
          ip: '127.0.0.1',
          user_agent: 'test-agent',
          action_type: 'D',
          target_table: 'AreaData',
          target_id: 'seoul',
          old_values: JSON.stringify([
            {
              areaNo: 1,
              area: 'seoul',
              x: 123.456,
              y: 789.012,
              areaCode: 'SEO001',
            },
          ]),
          new_values: null,
          reason: '지역 삭제',
        }),
        mockConn,
      );
      expect(commitTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('findAreaByArea 실패 시 에러를 발생시켜야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findAreaByArea as jest.Mock).mockRejectedValue(new Error('Find failed'));
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute & Assert
      await expect(deleteArea('seoul', mockMeta)).rejects.toThrow('지역 삭제 중 오류가 발생했습니다.');
      expect(findAreaByArea).toHaveBeenCalledWith('seoul');
      expect(deleteAreaFromDB).not.toHaveBeenCalled();
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('deleteAreaFromDB 실패 시 에러를 발생시켜야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findAreaByArea as jest.Mock).mockResolvedValue([
        {
          areaNo: 1,
          area: 'seoul',
          x: 123.456,
          y: 789.012,
          areaCode: 'SEO001',
        },
      ]);
      (deleteAreaFromDB as jest.Mock).mockRejectedValue(new Error('Delete failed'));
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute & Assert
      await expect(deleteArea('seoul', mockMeta)).rejects.toThrow('지역 삭제 중 오류가 발생했습니다.');
      expect(deleteAreaFromDB).toHaveBeenCalledWith('seoul');
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('commitTransaction 실패 시 에러를 발생시켜야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findAreaByArea as jest.Mock).mockResolvedValue([
        {
          areaNo: 1,
          area: 'seoul',
          x: 123.456,
          y: 789.012,
          areaCode: 'SEO001',
        },
      ]);
      (deleteAreaFromDB as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockRejectedValue(new Error('Commit failed'));
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute & Assert
      await expect(deleteArea('seoul', mockMeta)).rejects.toThrow('지역 삭제 중 오류가 발생했습니다.');
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('rollbackTransaction 실패 시 에러를 로깅해야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findAreaByArea as jest.Mock).mockRejectedValue(new Error('Find failed'));
      (rollbackTransaction as jest.Mock).mockRejectedValue(new Error('Rollback failed'));

      // Spy on console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Execute & Assert
      await expect(deleteArea('seoul', mockMeta)).rejects.toThrow('지역 삭제 중 오류가 발생했습니다.');
      expect(consoleSpy).toHaveBeenCalledWith('Rollback error:', expect.any(Error));
      expect(mockConn.release).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('커넥션 해제 실패 시 에러를 로깅해야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn().mockRejectedValue(new Error('Release failed')) };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findAreaByArea as jest.Mock).mockResolvedValue([
        {
          areaNo: 1,
          area: 'seoul',
          x: 123.456,
          y: 789.012,
          areaCode: 'SEO001',
        },
      ]);
      (deleteAreaFromDB as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      // Spy on console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Execute
      await deleteArea('seoul', mockMeta);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Connection release error:', expect.any(Error));
      expect(mockConn.release).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('성공 시 106번째 줄이 실행되어야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findAreaByArea as jest.Mock).mockResolvedValue([
        {
          areaNo: 1,
          area: 'seoul',
          x: 123.456,
          y: 789.012,
          areaCode: 'SEO001',
        },
      ]);
      (deleteAreaFromDB as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute
      await deleteArea('seoul', mockMeta);

      // Assert - 106번째 줄이 실행되었는지 확인
      expect(commitTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('beginTransaction 실패 시 conn이 undefined여야 함', async () => {
      // Mock setup
      (beginTransaction as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      // Execute & Assert
      await expect(deleteArea('seoul', mockMeta)).rejects.toThrow('지역 삭제 중 오류가 발생했습니다.');
      // conn이 undefined이므로 if (conn) 블록이 실행되지 않음
    });

    it('logAction 실패 시 에러를 발생시켜야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findAreaByArea as jest.Mock).mockResolvedValue([
        {
          areaNo: 1,
          area: 'seoul',
          x: 123.456,
          y: 789.012,
          areaCode: 'SEO001',
        },
      ]);
      (deleteAreaFromDB as jest.Mock).mockResolvedValue(undefined);
      (logAction as jest.Mock).mockRejectedValue(new Error('Log failed'));
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute & Assert
      await expect(deleteArea('seoul', mockMeta)).rejects.toThrow('지역 삭제 중 오류가 발생했습니다.');
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('makeLogParams 성공 시 106-107번째 줄이 실행되어야 함', async () => {
      // Mock setup - makeLogParams가 성공하도록 명시적으로 설정
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findAreaByArea as jest.Mock).mockResolvedValue([
        {
          areaNo: 1,
          area: 'seoul',
          x: 123.456,
          y: 789.012,
          areaCode: 'SEO001',
        },
      ]);
      (deleteAreaFromDB as jest.Mock).mockResolvedValue(undefined);
      (makeLogParams as jest.Mock).mockReturnValue({
        manager_no: 1,
        ip: '127.0.0.1',
        user_agent: 'test-agent',
        action_type: 'D',
        target_table: 'AreaData',
        target_id: 'seoul',
        old_values: 'test',
        new_values: null,
        reason: '지역 삭제',
      });
      (logAction as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute
      await deleteArea('seoul', mockMeta);

      // Assert - 106-107번째 줄이 실행되었는지 확인
      expect(commitTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });
  });
});

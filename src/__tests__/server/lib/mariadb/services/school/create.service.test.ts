import { createRnSchool } from '@/services/areas/[area]/schools/create/create.service';
import { existsRnSchoolByAdministrationCode, insertRnSchool } from '@/models/rn-school/rn-school.model';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { AppError } from '@/utils/error.utils';
import type { SchoolCreate } from '@/types/school';

// Mock Next.js modules
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

// Mock dependencies
jest.mock('@/models/rn-school/rn-school.model');
jest.mock('@/services/log-action/log-action.service');
jest.mock('@/lib/mariadb/query');
jest.mock('@/utils/error.utils', () => ({
  AppError: class AppError extends Error {
    public statusCode: number;

    constructor(message: string, statusCode: number = 500) {
      super(message);
      this.name = 'AppError';
      this.statusCode = statusCode;
    }
  },
}));

describe('학교 등록 서비스 테스트', () => {
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

  const mockMeta = {
    managerNo: 1,
    schoolNo: 0,
    ip: '127.0.0.1',
    userAgent: 'test-agent',
  };

  const mockUserInput: Partial<SchoolCreate> = {
    sname: '테스트 학교',
    scode: 'TEST001',
    area: 'seoul',
    modbus: 1,
    modbusHost: '192.168.1.100',
    modbusPort: 502,
    useOrderSheet: 'Y',
    active: 'Y',
  };

  const administrationCode = 'B000000123';

  describe('createRnSchool', () => {
    it('학교를 성공적으로 등록해야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (existsRnSchoolByAdministrationCode as jest.Mock).mockResolvedValue(false);
      (insertRnSchool as jest.Mock).mockResolvedValue(123);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute
      const result = await createRnSchool(administrationCode, mockUserInput, mockMeta);

      // Assert
      expect(existsRnSchoolByAdministrationCode).toHaveBeenCalledWith({ administrationCode });
      expect(insertRnSchool).toHaveBeenCalledWith({
        sname: '테스트 학교',
        scode: 'TEST001',
        area: 'seoul',
        administrationCode: 'B000000123',
        modbus: 1,
        modbusHost: '192.168.1.100',
        modbusPort: 502,
        useOrderSheet: 'Y',
        active: 'Y',
        parentNo: null,
      });
      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: 1,
        schoolNo: 123,
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        actionType: 'I',
        targetTable: 'rnschool',
        targetId: '123',
        oldValues: null,
        newValues: JSON.stringify({
          sname: '테스트 학교',
          scode: 'TEST001',
          area: 'seoul',
          administrationCode: 'B000000123',
          modbus: 1,
          modbusHost: '192.168.1.100',
          modbusPort: 502,
          useOrderSheet: 'Y',
          active: 'Y',
          parentNo: null,
          schoolNo: 123,
        }),
        reason: '학교 등록',
      });
      expect(logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          managerNo: 1,
          schoolNo: 123,
          ip: '127.0.0.1',
          userAgent: 'test-agent',
          actionType: 'I',
          targetTable: 'rnschool',
          targetId: '123',
          oldValues: '',
          newValues: JSON.stringify({
            sname: '테스트 학교',
            scode: 'TEST001',
            area: 'seoul',
            administrationCode: 'B000000123',
            modbus: 1,
            modbusHost: '192.168.1.100',
            modbusPort: 502,
            useOrderSheet: 'Y',
            active: 'Y',
            parentNo: null,
            schoolNo: 123,
          }),
          reason: '학교 등록',
        }),
        mockConn,
      );
      expect(commitTransaction).toHaveBeenCalledWith(mockConn);
      expect(result).toEqual({
        type: 'insert',
        school: {
          sname: '테스트 학교',
          scode: 'TEST001',
          area: 'seoul',
          administrationCode: 'B000000123',
          modbus: 1,
          modbusHost: '192.168.1.100',
          modbusPort: 502,
          useOrderSheet: 'Y',
          active: 'Y',
          parentNo: null,
          schoolNo: 123,
        },
      });
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('이미 등록된 학교일 때 에러를 발생시켜야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (existsRnSchoolByAdministrationCode as jest.Mock).mockResolvedValue(true);
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute & Assert
      await expect(createRnSchool(administrationCode, mockUserInput, mockMeta)).rejects.toThrow(
        '이미 등록된 학교입니다.',
      );
      expect(existsRnSchoolByAdministrationCode).toHaveBeenCalledWith({ administrationCode });
      expect(insertRnSchool).not.toHaveBeenCalled();
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('기본값이 올바르게 설정되어야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (existsRnSchoolByAdministrationCode as jest.Mock).mockResolvedValue(false);
      (insertRnSchool as jest.Mock).mockResolvedValue(456);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const minimalInput = {
        sname: '최소 학교',
        scode: 'MIN001',
      };

      // Execute
      const result = await createRnSchool(administrationCode, minimalInput, mockMeta);

      // Assert
      expect(insertRnSchool).toHaveBeenCalledWith({
        sname: '최소 학교',
        scode: 'MIN001',
        area: null,
        administrationCode: 'B000000123',
        modbus: 0,
        modbusHost: null,
        modbusPort: 502,
        useOrderSheet: 'N',
        active: 'Y',
        parentNo: null,
      });
      expect(result.school).toEqual({
        sname: '최소 학교',
        scode: 'MIN001',
        area: null,
        administrationCode: 'B000000123',
        modbus: 0,
        modbusHost: null,
        modbusPort: 502,
        useOrderSheet: 'N',
        active: 'Y',
        parentNo: null,
        schoolNo: 456,
      });
    });

    it('insertRnSchool 실패 시 에러를 발생시켜야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (existsRnSchoolByAdministrationCode as jest.Mock).mockResolvedValue(false);
      (insertRnSchool as jest.Mock).mockRejectedValue(new Error('Insert failed'));
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute & Assert
      await expect(createRnSchool(administrationCode, mockUserInput, mockMeta)).rejects.toThrow(
        '학교 등록 중 오류가 발생했습니다.',
      );
      expect(insertRnSchool).toHaveBeenCalled();
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('commitTransaction 실패 시 에러를 발생시켜야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (existsRnSchoolByAdministrationCode as jest.Mock).mockResolvedValue(false);
      (insertRnSchool as jest.Mock).mockResolvedValue(123);
      (commitTransaction as jest.Mock).mockRejectedValue(new Error('Commit failed'));
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute & Assert
      await expect(createRnSchool(administrationCode, mockUserInput, mockMeta)).rejects.toThrow(
        '학교 등록 중 오류가 발생했습니다.',
      );
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('logAction 실패 시 에러를 발생시켜야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (existsRnSchoolByAdministrationCode as jest.Mock).mockResolvedValue(false);
      (insertRnSchool as jest.Mock).mockResolvedValue(123);
      (logAction as jest.Mock).mockRejectedValue(new Error('Log failed'));
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute & Assert
      await expect(createRnSchool(administrationCode, mockUserInput, mockMeta)).rejects.toThrow(
        '학교 등록 중 오류가 발생했습니다.',
      );
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('makeLogParams 실패 시 에러를 발생시켜야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (existsRnSchoolByAdministrationCode as jest.Mock).mockResolvedValue(false);
      (insertRnSchool as jest.Mock).mockResolvedValue(123);
      (makeLogParams as jest.Mock).mockImplementation(() => {
        throw new Error('MakeLogParams failed');
      });
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute & Assert
      await expect(createRnSchool(administrationCode, mockUserInput, mockMeta)).rejects.toThrow(
        '학교 등록 중 오류가 발생했습니다.',
      );
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('beginTransaction 실패 시 에러를 발생시켜야 함', async () => {
      // Mock setup
      (beginTransaction as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      // Execute & Assert
      await expect(createRnSchool(administrationCode, mockUserInput, mockMeta)).rejects.toThrow(
        '학교 등록 중 오류가 발생했습니다.',
      );
    });

    it('existsRnSchoolByAdministrationCode 실패 시 에러를 발생시켜야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (existsRnSchoolByAdministrationCode as jest.Mock).mockRejectedValue(new Error('Check failed'));
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute & Assert
      await expect(createRnSchool(administrationCode, mockUserInput, mockMeta)).rejects.toThrow(
        '학교 등록 중 오류가 발생했습니다.',
      );
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('커넥션 해제 실패 시 에러를 로깅해야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn().mockRejectedValue(new Error('Release failed')) };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (existsRnSchoolByAdministrationCode as jest.Mock).mockResolvedValue(false);
      (insertRnSchool as jest.Mock).mockResolvedValue(123);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      // Spy on console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Execute
      const result = await createRnSchool(administrationCode, mockUserInput, mockMeta);

      // Assert
      expect(result).toBeDefined();
      expect(consoleSpy).toHaveBeenCalledWith('Connection release error:', expect.any(Error));
      expect(mockConn.release).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('AppError가 발생할 때 원본 에러를 그대로 던져야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (existsRnSchoolByAdministrationCode as jest.Mock).mockResolvedValue(false);
      (insertRnSchool as jest.Mock).mockRejectedValue(new AppError('커스텀 에러', 400));
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute & Assert
      await expect(createRnSchool(administrationCode, mockUserInput, mockMeta)).rejects.toThrow('커스텀 에러');
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('rollbackTransaction 실패 시 에러를 로깅해야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (existsRnSchoolByAdministrationCode as jest.Mock).mockResolvedValue(true);
      (rollbackTransaction as jest.Mock).mockRejectedValue(new Error('Rollback failed'));

      // Spy on console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Execute & Assert
      await expect(createRnSchool(administrationCode, mockUserInput, mockMeta)).rejects.toThrow(
        '이미 등록된 학교입니다.',
      );
      expect(consoleSpy).toHaveBeenCalledWith('Rollback 실패:', expect.any(Error));
      expect(mockConn.release).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('beginTransaction 실패 시 finally 블록이 실행되지 않아야 함', async () => {
      // Mock setup
      (beginTransaction as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      // Execute & Assert
      await expect(createRnSchool(administrationCode, mockUserInput, mockMeta)).rejects.toThrow(
        '학교 등록 중 오류가 발생했습니다.',
      );
      // beginTransaction 실패 시 conn이 undefined이므로 finally 블록의 conn.release()가 실행되지 않음
    });

    it('conn이 undefined인 경우에도 정상 동작해야 함', async () => {
      // Mock setup
      (beginTransaction as jest.Mock).mockResolvedValue(undefined);
      (existsRnSchoolByAdministrationCode as jest.Mock).mockResolvedValue(false);
      (insertRnSchool as jest.Mock).mockResolvedValue(123);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute
      const result = await createRnSchool(administrationCode, mockUserInput, mockMeta);

      // Assert
      expect(result).toBeDefined();
      // conn이 undefined이므로 release가 호출되지 않음
    });

    it('다른 타입의 에러가 발생할 때 기본 에러 메시지를 반환해야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (existsRnSchoolByAdministrationCode as jest.Mock).mockResolvedValue(false);
      (insertRnSchool as jest.Mock).mockRejectedValue('String error');
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute & Assert
      await expect(createRnSchool(administrationCode, mockUserInput, mockMeta)).rejects.toThrow(
        '학교 등록 중 오류가 발생했습니다.',
      );
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('Error가 아닌 다양한 타입의 에러가 발생해도 기본 에러 메시지를 반환해야 함', async () => {
      // Mock setup
      const mockConn = { release: jest.fn() };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (existsRnSchoolByAdministrationCode as jest.Mock).mockResolvedValue(false);
      (insertRnSchool as jest.Mock).mockResolvedValue(123);
      (logAction as jest.Mock).mockRejectedValue({ message: 'Object error' });
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute & Assert
      await expect(createRnSchool(administrationCode, mockUserInput, mockMeta)).rejects.toThrow(
        '학교 등록 중 오류가 발생했습니다.',
      );
      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('release 함수가 없는 경우에도 예외 없이 종료되어야 함', async () => {
      // Mock setup
      const mockConn = {}; // release 함수가 없는 객체
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (existsRnSchoolByAdministrationCode as jest.Mock).mockResolvedValue(false);
      (insertRnSchool as jest.Mock).mockResolvedValue(123);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute
      const result = await createRnSchool(administrationCode, mockUserInput, mockMeta);

      // Assert
      expect(result).toBeDefined();
      // conn 객체는 있지만 release 함수가 없으므로 if (conn) 조건은 true가 되지만 conn.release()는 호출되지 않음
    });

    it('conn이 null인 경우에도 정상 동작해야 함', async () => {
      // Mock setup
      (beginTransaction as jest.Mock).mockResolvedValue(null);
      (existsRnSchoolByAdministrationCode as jest.Mock).mockResolvedValue(false);
      (insertRnSchool as jest.Mock).mockResolvedValue(123);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute
      const result = await createRnSchool(administrationCode, mockUserInput, mockMeta);

      // Assert
      expect(result).toBeDefined();
      // conn이 null이므로 if (conn) 조건이 false가 되어 finally 블록 안의 코드가 실행되지 않음
    });

    it('conn이 빈 문자열인 경우에도 정상 동작해야 함', async () => {
      // Mock setup
      (beginTransaction as jest.Mock).mockResolvedValue('');
      (existsRnSchoolByAdministrationCode as jest.Mock).mockResolvedValue(false);
      (insertRnSchool as jest.Mock).mockResolvedValue(123);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute
      const result = await createRnSchool(administrationCode, mockUserInput, mockMeta);

      // Assert
      expect(result).toBeDefined();
      // conn이 빈 문자열이므로 if (conn) 조건이 false가 되어 finally 블록 안의 코드가 실행되지 않음
    });

    it('conn이 숫자 0인 경우에도 정상 동작해야 함', async () => {
      // Mock setup
      (beginTransaction as jest.Mock).mockResolvedValue(0);
      (existsRnSchoolByAdministrationCode as jest.Mock).mockResolvedValue(false);
      (insertRnSchool as jest.Mock).mockResolvedValue(123);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      // Execute
      const result = await createRnSchool(administrationCode, mockUserInput, mockMeta);

      // Assert
      expect(result).toBeDefined();
      // conn이 숫자 0이므로 if (conn) 조건이 false가 되어 finally 블록 안의 코드가 실행되지 않음
    });
  });
});

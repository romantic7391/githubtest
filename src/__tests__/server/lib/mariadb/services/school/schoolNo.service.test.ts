import {
  getSchoolBySchoolNo,
  updateRnSchool,
  deleteRnSchool,
} from '@/services/areas/[area]/schools/[schoolNo]/[schoolNo].service';
import {
  findSchoolBySchoolNo,
  updateRnSchool as updateRnSchoolModel,
  deleteRnSchool as deleteRnSchoolModel,
} from '@/models/rn-school/rn-school.model';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { AppError } from '@/utils/error.utils';
import type { School, updateRnSchoolDto, deleteRnSchoolDto } from '@/types/school';

// Next.js 모듈 모킹
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

jest.mock('@/models/rn-school/rn-school.model');
jest.mock('@/lib/mariadb/query');
jest.mock('@/services/log-action/log-action.service', () => ({
  logAction: jest.fn(),
  makeLogParams: jest.fn(),
}));

describe('SchoolNo Service', () => {
  const mockConn = {
    release: jest.fn(),
  };

  const mockSchool: School = {
    schoolNo: 1,
    sname: '테스트 학교',
    scode: 'TEST001',
    useOrderSheet: 'Y',
    active: 'Y',
    administrationCode: '1234567890',
    area: '서울',
    modbus: 0,
    modbusHost: null,
    modbusPort: 502,
    created: '2024-01-01T00:00:00.000Z',
    parentNo: null,
  };

  const meta = {
    managerNo: 1,
    ip: '127.0.0.1',
    userAgent: 'test-agent',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
    (logAction as jest.Mock).mockResolvedValue(undefined);
    (makeLogParams as jest.Mock).mockReturnValue({});
  });

  describe('getSchoolBySchoolNo', () => {
    it('학교 정보를 성공적으로 조회해야 함', async () => {
      const schoolNo = 1;

      (findSchoolBySchoolNo as jest.Mock).mockResolvedValue(mockSchool);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await getSchoolBySchoolNo(schoolNo, meta);

      expect(result).toEqual(mockSchool);
      expect(findSchoolBySchoolNo).toHaveBeenCalledWith({ schoolNo });
      expect(commitTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();

      // logAction 호출 검증
      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        schoolNo: schoolNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'S',
        targetTable: 'rnschool',
        targetId: `${schoolNo}`,
        oldValues: JSON.stringify({}),
        newValues: JSON.stringify(mockSchool),
        reason: '학교 정보 조회',
      });
      expect(logAction).toHaveBeenCalledWith({}, mockConn);
    });

    it('존재하지 않는 학교 조회 시 404 에러를 발생시켜야 함', async () => {
      const schoolNo = 999;

      (findSchoolBySchoolNo as jest.Mock).mockResolvedValue(null);

      await expect(getSchoolBySchoolNo(schoolNo, meta)).rejects.toThrow(new AppError('학교를 찾을 수 없습니다.', 404));

      expect(findSchoolBySchoolNo).toHaveBeenCalledWith({ schoolNo });
      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('DB 조회 중 오류 발생 시 500 에러를 발생시켜야 함', async () => {
      const schoolNo = 1;

      (findSchoolBySchoolNo as jest.Mock).mockRejectedValue(new Error('DB 오류'));

      await expect(getSchoolBySchoolNo(schoolNo, meta)).rejects.toThrow(
        new AppError('학교 정보 조회 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('Connection release 에러가 발생해도 처리되어야 함', async () => {
      const schoolNo = 1;

      (findSchoolBySchoolNo as jest.Mock).mockResolvedValue(mockSchool);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);
      (mockConn.release as jest.Mock).mockRejectedValue(new Error('Release error'));

      const result = await getSchoolBySchoolNo(schoolNo, meta);

      expect(result).toEqual(mockSchool);
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('beginTransaction 실패 시에도 처리되어야 함', async () => {
      const schoolNo = 1;

      (beginTransaction as jest.Mock).mockRejectedValue(new Error('Connection error'));

      await expect(getSchoolBySchoolNo(schoolNo, meta)).rejects.toThrow(
        new AppError('학교 정보 조회 중 오류가 발생했습니다.', 500),
      );

      expect(beginTransaction).toHaveBeenCalled();
      expect(mockConn.release).not.toHaveBeenCalled();
    });

    it('getSchoolBySchoolNo에서 beginTransaction 실패 후 다른 에러가 발생할 때 conn이 undefined인 상태에서 처리되어야 함', async () => {
      const schoolNo = 1;

      // beginTransaction은 성공하지만 findSchoolBySchoolNo에서 에러 발생
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findSchoolBySchoolNo as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(getSchoolBySchoolNo(schoolNo, meta)).rejects.toThrow(
        new AppError('학교 정보 조회 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
    });
  });

  describe('updateRnSchool', () => {
    const updateDto: updateRnSchoolDto = {
      schoolNo: 1,
      sname: '수정된 학교',
      scode: 'TEST001',
      useOrderSheet: 'Y',
      active: 'Y',
      administrationCode: '1234567890',
      area: '서울',
      modbus: 0,
      modbusHost: null,
      modbusPort: 502,
      created: '2024-01-01T00:00:00.000Z',
      parentNo: null,
    };

    it('학교 정보를 성공적으로 수정해야 함', async () => {
      (findSchoolBySchoolNo as jest.Mock).mockResolvedValue(mockSchool);
      (updateRnSchoolModel as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      await updateRnSchool(updateDto, meta);

      expect(findSchoolBySchoolNo).toHaveBeenCalledWith({ schoolNo: updateDto.schoolNo });
      expect(updateRnSchoolModel).toHaveBeenCalledWith(updateDto, mockConn);
      expect(commitTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();

      // logAction 호출 검증
      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        schoolNo: updateDto.schoolNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'U',
        targetTable: 'rnschool',
        targetId: `${updateDto.schoolNo}`,
        oldValues: JSON.stringify(mockSchool),
        newValues: JSON.stringify(updateDto),
        reason: '학교 정보 수정',
      });
      expect(logAction).toHaveBeenCalledWith({}, mockConn);
    });

    it('수정할 학교가 존재하지 않을 때 404 에러를 발생시켜야 함', async () => {
      (findSchoolBySchoolNo as jest.Mock).mockResolvedValue(null);

      await expect(updateRnSchool(updateDto, meta)).rejects.toThrow(
        new AppError('수정할 학교를 찾을 수 없습니다.', 404),
      );

      expect(findSchoolBySchoolNo).toHaveBeenCalledWith({ schoolNo: updateDto.schoolNo });
      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('학교 수정 중 오류 발생 시 500 에러를 발생시켜야 함', async () => {
      (findSchoolBySchoolNo as jest.Mock).mockResolvedValue(mockSchool);
      (updateRnSchoolModel as jest.Mock).mockRejectedValue(new Error('수정 오류'));

      await expect(updateRnSchool(updateDto, meta)).rejects.toThrow(
        new AppError('학교 정보 수정 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('Connection release 에러가 발생해도 처리되어야 함', async () => {
      (findSchoolBySchoolNo as jest.Mock).mockResolvedValue(mockSchool);
      (updateRnSchoolModel as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);
      (mockConn.release as jest.Mock).mockRejectedValue(new Error('Release error'));

      await updateRnSchool(updateDto, meta);

      expect(mockConn.release).toHaveBeenCalled();
    });

    it('beginTransaction 실패 시에도 처리되어야 함', async () => {
      (beginTransaction as jest.Mock).mockRejectedValue(new Error('Connection error'));

      await expect(updateRnSchool(updateDto, meta)).rejects.toThrow(
        new AppError('학교 정보 수정 중 오류가 발생했습니다.', 500),
      );

      expect(beginTransaction).toHaveBeenCalled();
      expect(mockConn.release).not.toHaveBeenCalled();
    });

    it('updateRnSchool에서 beginTransaction 실패 후 다른 에러가 발생할 때 conn이 undefined인 상태에서 처리되어야 함', async () => {
      const updateDto: updateRnSchoolDto = {
        schoolNo: 1,
        sname: '수정된 학교',
        scode: 'TEST001',
        useOrderSheet: 'Y',
        active: 'Y',
        administrationCode: '1234567890',
        area: '서울',
        modbus: 0,
        modbusHost: null,
        modbusPort: 502,
        created: '2024-01-01T00:00:00.000Z',
        parentNo: null,
      };

      // beginTransaction은 성공하지만 updateRnSchoolModel에서 에러 발생
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findSchoolBySchoolNo as jest.Mock).mockResolvedValue(mockSchool);
      (updateRnSchoolModel as jest.Mock).mockRejectedValue(new Error('Update error'));

      await expect(updateRnSchool(updateDto, meta)).rejects.toThrow(
        new AppError('학교 정보 수정 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
    });
  });

  describe('deleteRnSchool', () => {
    const deleteDto: deleteRnSchoolDto = {
      schoolNo: 1,
    };

    it('학교를 성공적으로 삭제해야 함', async () => {
      (findSchoolBySchoolNo as jest.Mock).mockResolvedValue(mockSchool);
      (deleteRnSchoolModel as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      await deleteRnSchool(deleteDto, meta);

      expect(findSchoolBySchoolNo).toHaveBeenCalledWith({ schoolNo: deleteDto.schoolNo });
      expect(deleteRnSchoolModel).toHaveBeenCalledWith(deleteDto, mockConn);
      expect(commitTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();

      // logAction 호출 검증
      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        schoolNo: deleteDto.schoolNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'D',
        targetTable: 'rnschool',
        targetId: `${deleteDto.schoolNo}`,
        oldValues: JSON.stringify(mockSchool),
        newValues: null,
        reason: '학교 삭제',
      });
      expect(logAction).toHaveBeenCalledWith({}, mockConn);
    });

    it('삭제할 학교가 존재하지 않을 때 404 에러를 발생시켜야 함', async () => {
      (findSchoolBySchoolNo as jest.Mock).mockResolvedValue(null);

      await expect(deleteRnSchool(deleteDto, meta)).rejects.toThrow(
        new AppError('삭제할 학교를 찾을 수 없습니다.', 404),
      );

      expect(findSchoolBySchoolNo).toHaveBeenCalledWith({ schoolNo: deleteDto.schoolNo });
      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('학교 삭제 중 오류 발생 시 500 에러를 발생시켜야 함', async () => {
      (findSchoolBySchoolNo as jest.Mock).mockResolvedValue(mockSchool);
      (deleteRnSchoolModel as jest.Mock).mockRejectedValue(new Error('삭제 오류'));

      await expect(deleteRnSchool(deleteDto, meta)).rejects.toThrow(
        new AppError('학교 삭제 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('Connection release 에러가 발생해도 처리되어야 함', async () => {
      (findSchoolBySchoolNo as jest.Mock).mockResolvedValue(mockSchool);
      (deleteRnSchoolModel as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);
      (mockConn.release as jest.Mock).mockRejectedValue(new Error('Release error'));

      await deleteRnSchool(deleteDto, meta);

      expect(mockConn.release).toHaveBeenCalled();
    });

    it('beginTransaction 실패 시에도 처리되어야 함', async () => {
      (beginTransaction as jest.Mock).mockRejectedValue(new Error('Connection error'));

      await expect(deleteRnSchool(deleteDto, meta)).rejects.toThrow(
        new AppError('학교 삭제 중 오류가 발생했습니다.', 500),
      );

      expect(beginTransaction).toHaveBeenCalled();
      expect(mockConn.release).not.toHaveBeenCalled();
    });

    it('deleteRnSchool에서 beginTransaction 실패 후 다른 에러가 발생할 때 conn이 undefined인 상태에서 처리되어야 함', async () => {
      const deleteDto: deleteRnSchoolDto = {
        schoolNo: 1,
      };

      // beginTransaction은 성공하지만 deleteRnSchoolModel에서 에러 발생
      (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
      (findSchoolBySchoolNo as jest.Mock).mockResolvedValue(mockSchool);
      (deleteRnSchoolModel as jest.Mock).mockRejectedValue(new Error('Delete error'));

      await expect(deleteRnSchool(deleteDto, meta)).rejects.toThrow(
        new AppError('학교 삭제 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
    });

    it('getSchoolBySchoolNo에서 beginTransaction이 실패해서 conn이 undefined인 상태에서 다른 에러가 발생할 때 if (conn) 조건문이 false가 되어야 함', async () => {
      const schoolNo = 1;

      // beginTransaction이 실패해서 conn이 undefined
      (beginTransaction as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      await expect(getSchoolBySchoolNo(schoolNo, meta)).rejects.toThrow(
        new AppError('학교 정보 조회 중 오류가 발생했습니다.', 500),
      );

      // conn이 undefined이므로 rollbackTransaction이 호출되지 않아야 함
      expect(rollbackTransaction).not.toHaveBeenCalled();
    });
  });

  describe('트랜잭션 처리', () => {
    it('성공 시 트랜잭션이 커밋되어야 함', async () => {
      const schoolNo = 1;

      (findSchoolBySchoolNo as jest.Mock).mockResolvedValue(mockSchool);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      await getSchoolBySchoolNo(schoolNo, meta);

      expect(beginTransaction).toHaveBeenCalled();
      expect(commitTransaction).toHaveBeenCalled();
      expect(rollbackTransaction).not.toHaveBeenCalled();
    });

    it('오류 발생 시 트랜잭션이 롤백되어야 함', async () => {
      const schoolNo = 999;

      (findSchoolBySchoolNo as jest.Mock).mockResolvedValue(null);

      await expect(getSchoolBySchoolNo(schoolNo, meta)).rejects.toThrow();

      expect(beginTransaction).toHaveBeenCalled();
      expect(rollbackTransaction).toHaveBeenCalled();
      expect(commitTransaction).not.toHaveBeenCalled();
    });

    it('Connection release가 항상 호출되어야 함', async () => {
      const schoolNo = 1;

      (findSchoolBySchoolNo as jest.Mock).mockResolvedValue(mockSchool);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      await getSchoolBySchoolNo(schoolNo, meta);

      expect(mockConn.release).toHaveBeenCalled();
    });

    it('오류 발생 시에도 Connection release가 호출되어야 함', async () => {
      const schoolNo = 999;

      (findSchoolBySchoolNo as jest.Mock).mockResolvedValue(null);

      await expect(getSchoolBySchoolNo(schoolNo, meta)).rejects.toThrow();

      expect(mockConn.release).toHaveBeenCalled();
    });
  });

  describe('로그 기록', () => {
    it('조회 시 올바른 로그 파라미터가 생성되어야 함', async () => {
      const schoolNo = 1;

      (findSchoolBySchoolNo as jest.Mock).mockResolvedValue(mockSchool);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      await getSchoolBySchoolNo(schoolNo, meta);

      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        schoolNo: schoolNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'S',
        targetTable: 'rnschool',
        targetId: `${schoolNo}`,
        oldValues: JSON.stringify({}),
        newValues: JSON.stringify(mockSchool),
        reason: '학교 정보 조회',
      });
    });

    it('수정 시 올바른 로그 파라미터가 생성되어야 함', async () => {
      const updateDto: updateRnSchoolDto = {
        schoolNo: 1,
        sname: '수정된 학교',
        scode: 'TEST001',
        useOrderSheet: 'Y',
        active: 'Y',
        administrationCode: '1234567890',
        area: '서울',
        modbus: 0,
        modbusHost: null,
        modbusPort: 502,
        created: '2024-01-01T00:00:00.000Z',
        parentNo: null,
      };

      (findSchoolBySchoolNo as jest.Mock).mockResolvedValue(mockSchool);
      (updateRnSchoolModel as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      await updateRnSchool(updateDto, meta);

      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        schoolNo: updateDto.schoolNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'U',
        targetTable: 'rnschool',
        targetId: `${updateDto.schoolNo}`,
        oldValues: JSON.stringify(mockSchool),
        newValues: JSON.stringify(updateDto),
        reason: '학교 정보 수정',
      });
    });

    it('삭제 시 올바른 로그 파라미터가 생성되어야 함', async () => {
      const deleteDto: deleteRnSchoolDto = {
        schoolNo: 1,
      };

      (findSchoolBySchoolNo as jest.Mock).mockResolvedValue(mockSchool);
      (deleteRnSchoolModel as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      await deleteRnSchool(deleteDto, meta);

      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        schoolNo: deleteDto.schoolNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'D',
        targetTable: 'rnschool',
        targetId: `${deleteDto.schoolNo}`,
        oldValues: JSON.stringify(mockSchool),
        newValues: null,
        reason: '학교 삭제',
      });
    });
  });

  describe('에러 처리 엣지 케이스', () => {
    it('AppError가 아닌 다른 에러가 발생했을 때 500 에러로 변환되어야 함', async () => {
      const schoolNo = 1;
      const customError = new Error('Custom error');

      (findSchoolBySchoolNo as jest.Mock).mockRejectedValue(customError);

      await expect(getSchoolBySchoolNo(schoolNo, meta)).rejects.toThrow(
        new AppError('학교 정보 조회 중 오류가 발생했습니다.', 500),
      );
    });

    it('updateRnSchool에서 AppError가 아닌 다른 에러가 발생했을 때 500 에러로 변환되어야 함', async () => {
      const updateDto: updateRnSchoolDto = {
        schoolNo: 1,
        sname: '수정된 학교',
        scode: 'TEST001',
        useOrderSheet: 'Y',
        active: 'Y',
        administrationCode: '1234567890',
        area: '서울',
        modbus: 0,
        modbusHost: null,
        modbusPort: 502,
        created: '2024-01-01T00:00:00.000Z',
        parentNo: null,
      };

      (findSchoolBySchoolNo as jest.Mock).mockResolvedValue(mockSchool);
      (updateRnSchoolModel as jest.Mock).mockRejectedValue(new Error('Custom update error'));

      await expect(updateRnSchool(updateDto, meta)).rejects.toThrow(
        new AppError('학교 정보 수정 중 오류가 발생했습니다.', 500),
      );
    });

    it('deleteRnSchool에서 AppError가 아닌 다른 에러가 발생했을 때 500 에러로 변환되어야 함', async () => {
      const deleteDto: deleteRnSchoolDto = {
        schoolNo: 1,
      };

      (findSchoolBySchoolNo as jest.Mock).mockResolvedValue(mockSchool);
      (deleteRnSchoolModel as jest.Mock).mockRejectedValue(new Error('Custom delete error'));

      await expect(deleteRnSchool(deleteDto, meta)).rejects.toThrow(
        new AppError('학교 삭제 중 오류가 발생했습니다.', 500),
      );
    });

    it('updateRnSchool에서 beginTransaction이 실패해서 conn이 undefined인 상태에서 다른 에러가 발생할 때 if (conn) 조건문이 false가 되어야 함', async () => {
      const updateDto: updateRnSchoolDto = {
        schoolNo: 1,
        sname: '수정된 학교',
        scode: 'TEST001',
        useOrderSheet: 'Y',
        active: 'Y',
        administrationCode: '1234567890',
        area: '서울',
        modbus: 0,
        modbusHost: null,
        modbusPort: 502,
        created: '2024-01-01T00:00:00.000Z',
        parentNo: null,
      };

      // beginTransaction이 실패해서 conn이 undefined
      (beginTransaction as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      await expect(updateRnSchool(updateDto, meta)).rejects.toThrow(
        new AppError('학교 정보 수정 중 오류가 발생했습니다.', 500),
      );

      // conn이 undefined이므로 rollbackTransaction이 호출되지 않아야 함
      expect(rollbackTransaction).not.toHaveBeenCalled();
    });

    it('deleteRnSchool에서 beginTransaction이 실패해서 conn이 undefined인 상태에서 다른 에러가 발생할 때 if (conn) 조건문이 false가 되어야 함', async () => {
      const deleteDto: deleteRnSchoolDto = {
        schoolNo: 1,
      };

      // beginTransaction이 실패해서 conn이 undefined
      (beginTransaction as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      await expect(deleteRnSchool(deleteDto, meta)).rejects.toThrow(
        new AppError('학교 삭제 중 오류가 발생했습니다.', 500),
      );

      // conn이 undefined이므로 rollbackTransaction이 호출되지 않아야 함
      expect(rollbackTransaction).not.toHaveBeenCalled();
    });
  });
});

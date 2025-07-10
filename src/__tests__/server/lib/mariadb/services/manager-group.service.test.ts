import {
  getManagerGroupsS,
  createManagerGroupS,
  updateManagerGroupS,
  deleteManagerGroupS,
} from '@/services/permission-admin/manager-group.service';
import {
  insertManagerGroup,
  findManagerGroups,
  updateManagerGroup,
  deleteManagerGroup,
  findManagerGroup,
} from '@/models/manager-group/manager-group.model';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { AppError } from '@/utils/error.utils';

// Mock 모듈들
jest.mock('@/models/manager-group/manager-group.model');
jest.mock('@/services/log-action/log-action.service');
jest.mock('@/lib/mariadb/query');

describe('Manager Group Service', () => {
  const mockConn = {
    release: jest.fn().mockResolvedValue(undefined),
  };

  const meta = {
    managerNo: 1,
    ip: '127.0.0.1',
    userAgent: 'test',
    schoolNo: 1,
  };

  const pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  };

  const mockManagerGroup = {
    no: 1,
    groupNo: 1,
  };

  const mockManagerGroups = [
    {
      no: 1,
      groupNo: 1,
    },
    {
      no: 2,
      groupNo: 2,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
    (commitTransaction as jest.Mock).mockResolvedValue(undefined);
    (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);
    (logAction as jest.Mock).mockResolvedValue(undefined);
    (makeLogParams as jest.Mock).mockReturnValue({});
  });

  describe('getManagerGroupsS', () => {
    it('관리자 그룹 목록을 성공적으로 조회해야 함', async () => {
      const managerNo = 1;
      const filters = { groupNo: 1 };
      const mockResult = {
        managerGroups: mockManagerGroups,
        total: 2,
      };

      (findManagerGroups as jest.Mock).mockResolvedValue(mockResult);

      const result = await getManagerGroupsS(managerNo, pagination, meta, filters);

      expect(result.managerGroups).toEqual(mockManagerGroups);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.totalPages).toBe(1);

      expect(findManagerGroups).toHaveBeenCalledWith({ managerNo, filters }, pagination);

      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'S',
        targetTable: 'managerGroup',
        targetId: 'groupNo=1',
        oldValues: '',
        newValues: JSON.stringify(mockResult),
        reason: '관리자 그룹 조회: groupNo 1',
      });
      expect(logAction).toHaveBeenCalledWith({}, mockConn);
      expect(commitTransaction).toHaveBeenCalled();
    });

    it('필터 없이 전체 관리자 그룹 목록을 조회해야 함', async () => {
      const managerNo = 1;
      const mockResult = {
        managerGroups: mockManagerGroups,
        total: 2,
      };

      (findManagerGroups as jest.Mock).mockResolvedValue(mockResult);

      const result = await getManagerGroupsS(managerNo, pagination, meta);

      expect(result.managerGroups).toEqual(mockManagerGroups);
      expect(findManagerGroups).toHaveBeenCalledWith({ managerNo, filters: undefined }, pagination);

      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'S',
        targetTable: 'managerGroup',
        targetId: 'all',
        oldValues: '',
        newValues: JSON.stringify(mockResult),
        reason: '관리자 그룹 조회: 전체',
      });
    });

    it('데이터가 없을 때 404 에러를 발생시켜야 함', async () => {
      const managerNo = 1;
      const filters = { groupNo: 1 };
      const mockResult = {
        managerGroups: [],
        total: 0,
      };

      (findManagerGroups as jest.Mock).mockResolvedValue(mockResult);

      await expect(getManagerGroupsS(managerNo, pagination, meta, filters)).rejects.toThrow(
        new AppError('해당하는 학교에 관리자 그룹 목록이 존재하지 않습니다.', 404),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('DB 조회 중 오류 발생 시 500 에러를 발생시켜야 함', async () => {
      const managerNo = 1;
      const filters = { groupNo: 1 };

      (findManagerGroups as jest.Mock).mockRejectedValue(new Error('DB 오류'));

      await expect(getManagerGroupsS(managerNo, pagination, meta, filters)).rejects.toThrow(
        new AppError('관리자 그룹 목록 조회 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('meta가 없어도 조회가 가능해야 함', async () => {
      const managerNo = 1;
      const filters = { groupNo: 1 };
      const mockResult = {
        managerGroups: mockManagerGroups,
        total: 2,
      };

      (findManagerGroups as jest.Mock).mockResolvedValue(mockResult);

      const result = await getManagerGroupsS(managerNo, pagination, meta, filters);

      expect(result.managerGroups).toEqual(mockManagerGroups);
      expect(logAction).toHaveBeenCalled();
    });

    it('페이지네이션이 올바르게 계산되어야 함', async () => {
      const managerNo = 1;
      const mockResult = {
        managerGroups: Array.from({ length: 25 }, (_, i) => ({
          no: i + 1,
          groupNo: i + 1,
        })),
        total: 25,
      };

      (findManagerGroups as jest.Mock).mockResolvedValue(mockResult);

      const customPagination = { page: 2, pageSize: 10, total: 0, totalPages: 0 };
      const result = await getManagerGroupsS(managerNo, customPagination, meta);

      expect(result.pagination.total).toBe(25);
      expect(result.pagination.totalPages).toBe(3);
    });
  });

  describe('createManagerGroupS', () => {
    it('관리자 그룹을 성공적으로 생성해야 함', async () => {
      (findManagerGroup as jest.Mock).mockResolvedValue(null);
      (insertManagerGroup as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await createManagerGroupS(mockManagerGroup, meta);

      expect(result).toEqual({
        groupNo: mockManagerGroup.groupNo,
        no: mockManagerGroup.no,
      });

      expect(findManagerGroup).toHaveBeenCalledWith(mockManagerGroup.no, mockManagerGroup.groupNo);
      expect(insertManagerGroup).toHaveBeenCalledWith(mockManagerGroup, mockConn);

      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'I',
        targetTable: 'managerGroup',
        targetId: `${mockManagerGroup.no}_${mockManagerGroup.groupNo}`,
        oldValues: JSON.stringify({}),
        newValues: JSON.stringify(mockManagerGroup),
        reason: `관리자 그룹 생성: managerNo ${mockManagerGroup.no}, groupNo ${mockManagerGroup.groupNo}`,
      });
      expect(logAction).toHaveBeenCalledWith({}, mockConn);
      expect(commitTransaction).toHaveBeenCalled();
    });

    it('중복된 관리자 그룹 생성 시 400 에러를 발생시켜야 함', async () => {
      (findManagerGroup as jest.Mock).mockResolvedValue({
        no: 1,
        groupNo: 1,
      });

      await expect(createManagerGroupS(mockManagerGroup, meta)).rejects.toThrow(
        new AppError('이미 존재하는 관리자 그룹입니다.', 400),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('관리자 그룹 생성 중 오류 발생 시 롤백되어야 함', async () => {
      (findManagerGroup as jest.Mock).mockResolvedValue(null);
      (insertManagerGroup as jest.Mock).mockRejectedValue(new Error('Insert error'));

      await expect(createManagerGroupS(mockManagerGroup, meta)).rejects.toThrow(
        new AppError('관리자 그룹 생성 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('AppError는 그대로 전파되어야 함', async () => {
      const customError = new AppError('커스텀 에러', 400);
      (findManagerGroup as jest.Mock).mockResolvedValue(null);
      (insertManagerGroup as jest.Mock).mockRejectedValue(customError);

      await expect(createManagerGroupS(mockManagerGroup, meta)).rejects.toThrow(customError);
    });
  });

  describe('updateManagerGroupS', () => {
    it('관리자 그룹을 성공적으로 수정해야 함', async () => {
      const originalNo = 1;
      const originalGroupNo = 1;
      const updatedManagerGroup = {
        no: 2,
        groupNo: 2,
      };

      const existingGroup = {
        no: originalNo,
        groupNo: originalGroupNo,
      };

      (findManagerGroup as jest.Mock)
        .mockResolvedValueOnce(existingGroup) // 기존 그룹 조회
        .mockResolvedValueOnce(null); // 중복 체크 (없음)
      (updateManagerGroup as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await updateManagerGroupS(updatedManagerGroup, originalNo, originalGroupNo, meta);

      expect(result).toEqual({
        groupNo: updatedManagerGroup.groupNo,
        no: updatedManagerGroup.no,
      });

      expect(findManagerGroup).toHaveBeenCalledWith(originalNo, originalGroupNo);
      expect(findManagerGroup).toHaveBeenCalledWith(updatedManagerGroup.no, updatedManagerGroup.groupNo);
      expect(updateManagerGroup).toHaveBeenCalledWith(
        {
          ...updatedManagerGroup,
          originalNo,
          originalGroupNo,
        },
        mockConn,
      );

      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'U',
        targetTable: 'managerGroup',
        targetId: `${updatedManagerGroup.no}_${updatedManagerGroup.groupNo}`,
        oldValues: JSON.stringify({ no: originalNo, groupNo: originalGroupNo }),
        newValues: JSON.stringify(updatedManagerGroup),
        reason: `관리자 그룹 수정: managerNo ${originalNo}->${updatedManagerGroup.no}, groupNo ${originalGroupNo}->${updatedManagerGroup.groupNo}`,
      });
      expect(logAction).toHaveBeenCalledWith({}, mockConn);
      expect(commitTransaction).toHaveBeenCalled();
    });

    it('존재하지 않는 관리자 그룹 수정 시 404 에러를 발생시켜야 함', async () => {
      const originalNo = 1;
      const originalGroupNo = 1;

      (findManagerGroup as jest.Mock).mockResolvedValue(null);

      await expect(updateManagerGroupS(mockManagerGroup, originalNo, originalGroupNo, meta)).rejects.toThrow(
        new AppError('존재하지 않는 관리자 그룹입니다.', 404),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('새로운 관리자 그룹이 이미 존재할 때 400 에러를 발생시켜야 함', async () => {
      const originalNo = 1;
      const originalGroupNo = 1;
      const updatedManagerGroup = {
        no: 2,
        groupNo: 2,
      };

      const existingGroup = {
        no: originalNo,
        groupNo: originalGroupNo,
      };

      (findManagerGroup as jest.Mock)
        .mockResolvedValueOnce(existingGroup) // 기존 그룹 조회
        .mockResolvedValueOnce({ no: 2, groupNo: 2 }); // 중복 체크 (존재함)

      await expect(updateManagerGroupS(updatedManagerGroup, originalNo, originalGroupNo, meta)).rejects.toThrow(
        new AppError('이미 존재하는 관리자 그룹입니다.', 400),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('그룹 번호가 변경되지 않으면 중복 체크를 하지 않아야 함', async () => {
      const originalNo = 1;
      const originalGroupNo = 1;
      const updatedManagerGroup = {
        no: 1, // 원본과 동일
        groupNo: 1, // 원본과 동일
      };

      const existingGroup = {
        no: originalNo,
        groupNo: originalGroupNo,
      };

      (findManagerGroup as jest.Mock).mockResolvedValueOnce(existingGroup); // 기존 그룹만 조회
      (updateManagerGroup as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await updateManagerGroupS(updatedManagerGroup, originalNo, originalGroupNo, meta);

      expect(result).toEqual({
        groupNo: updatedManagerGroup.groupNo,
        no: updatedManagerGroup.no,
      });

      // 중복 체크는 한 번만 호출됨 (기존 그룹 조회만)
      expect(findManagerGroup).toHaveBeenCalledTimes(1);
    });

    it('관리자 그룹 수정 중 오류 발생 시 롤백되어야 함', async () => {
      const originalNo = 1;
      const originalGroupNo = 1;
      const updatedManagerGroup = {
        no: 2,
        groupNo: 2,
      };

      const existingGroup = {
        no: originalNo,
        groupNo: originalGroupNo,
      };

      (findManagerGroup as jest.Mock)
        .mockResolvedValueOnce(existingGroup) // 기존 그룹 조회
        .mockResolvedValueOnce(null); // 중복 체크 (없음)
      (updateManagerGroup as jest.Mock).mockRejectedValue(new Error('Update error'));

      await expect(updateManagerGroupS(updatedManagerGroup, originalNo, originalGroupNo, meta)).rejects.toThrow(
        new AppError('관리자 그룹 수정 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('AppError는 그대로 전파되어야 함', async () => {
      const customError = new AppError('커스텀 에러', 400);
      const originalNo = 1;
      const originalGroupNo = 1;

      (findManagerGroup as jest.Mock).mockResolvedValue({
        no: originalNo,
        groupNo: originalGroupNo,
      });
      (updateManagerGroup as jest.Mock).mockRejectedValue(customError);

      await expect(updateManagerGroupS(mockManagerGroup, originalNo, originalGroupNo, meta)).rejects.toThrow(
        customError,
      );
    });
  });

  describe('deleteManagerGroupS', () => {
    it('관리자 그룹을 성공적으로 삭제해야 함', async () => {
      const no = 1;
      const groupNo = 1;
      const existingGroup = {
        no,
        groupNo,
      };
      const deleteResult = { affectedRows: 1 };

      (findManagerGroup as jest.Mock).mockResolvedValue(existingGroup);
      (deleteManagerGroup as jest.Mock).mockResolvedValue(deleteResult);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await deleteManagerGroupS(no, groupNo, meta);

      expect(result).toEqual(deleteResult);

      expect(findManagerGroup).toHaveBeenCalledWith(no, groupNo);
      expect(deleteManagerGroup).toHaveBeenCalledWith({ no, groupNo }, mockConn);

      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'D',
        targetTable: 'managerGroup',
        targetId: `${no}_${groupNo}`,
        oldValues: JSON.stringify({ no, groupNo }),
        newValues: JSON.stringify({}),
        reason: `관리자 그룹 삭제: managerNo ${no}, groupNo ${groupNo}`,
      });
      expect(logAction).toHaveBeenCalledWith({}, mockConn);
      expect(commitTransaction).toHaveBeenCalled();
    });

    it('존재하지 않는 관리자 그룹 삭제 시 404 에러를 발생시켜야 함', async () => {
      const no = 999;
      const groupNo = 999;

      (findManagerGroup as jest.Mock).mockResolvedValue(null);

      await expect(deleteManagerGroupS(no, groupNo, meta)).rejects.toThrow(
        new AppError('존재하지 않는 관리자 그룹입니다.', 404),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('관리자 그룹 삭제 중 오류 발생 시 롤백되어야 함', async () => {
      const no = 1;
      const groupNo = 1;
      const existingGroup = {
        no,
        groupNo,
      };

      (findManagerGroup as jest.Mock).mockResolvedValue(existingGroup);
      (deleteManagerGroup as jest.Mock).mockRejectedValue(new Error('Delete error'));

      await expect(deleteManagerGroupS(no, groupNo, meta)).rejects.toThrow(
        new AppError('관리자 그룹 삭제 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('AppError는 그대로 전파되어야 함', async () => {
      const customError = new AppError('커스텀 에러', 400);
      const no = 1;
      const groupNo = 1;

      (findManagerGroup as jest.Mock).mockResolvedValue({
        no,
        groupNo,
      });
      (deleteManagerGroup as jest.Mock).mockRejectedValue(customError);

      await expect(deleteManagerGroupS(no, groupNo, meta)).rejects.toThrow(customError);
    });
  });

  describe('트랜잭션 처리', () => {
    it('성공 시 트랜잭션이 커밋되어야 함', async () => {
      const managerNo = 1;
      const mockResult = {
        managerGroups: mockManagerGroups,
        total: 2,
      };

      (findManagerGroups as jest.Mock).mockResolvedValue(mockResult);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      await getManagerGroupsS(managerNo, pagination, meta);

      expect(beginTransaction).toHaveBeenCalled();
      expect(commitTransaction).toHaveBeenCalled();
      expect(rollbackTransaction).not.toHaveBeenCalled();
    });

    it('오류 발생 시 트랜잭션이 롤백되어야 함', async () => {
      const managerNo = 1;

      (findManagerGroups as jest.Mock).mockRejectedValue(new Error('DB 오류'));

      await expect(getManagerGroupsS(managerNo, pagination, meta)).rejects.toThrow();

      expect(beginTransaction).toHaveBeenCalled();
      expect(rollbackTransaction).toHaveBeenCalled();
      expect(commitTransaction).not.toHaveBeenCalled();
    });
  });

  describe('에러 처리', () => {
    it('AppError가 아닌 다른 에러가 발생했을 때 500 에러로 변환되어야 함', async () => {
      const managerNo = 1;

      (findManagerGroups as jest.Mock).mockRejectedValue(new Error('Custom error'));

      await expect(getManagerGroupsS(managerNo, pagination, meta)).rejects.toThrow(
        new AppError('관리자 그룹 목록 조회 중 오류가 발생했습니다.', 500),
      );
    });
  });

  describe('로그 기록 테스트', () => {
    it('관리자 그룹 생성 시 로그가 올바르게 기록되어야 함', async () => {
      (findManagerGroup as jest.Mock).mockResolvedValue(null);
      (insertManagerGroup as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      await createManagerGroupS(mockManagerGroup, meta);

      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'I',
        targetTable: 'managerGroup',
        targetId: `${mockManagerGroup.no}_${mockManagerGroup.groupNo}`,
        oldValues: JSON.stringify({}),
        newValues: JSON.stringify(mockManagerGroup),
        reason: `관리자 그룹 생성: managerNo ${mockManagerGroup.no}, groupNo ${mockManagerGroup.groupNo}`,
      });
      expect(logAction).toHaveBeenCalledWith({}, mockConn);
    });

    it('관리자 그룹 수정 시 로그가 올바르게 기록되어야 함', async () => {
      const originalNo = 1;
      const originalGroupNo = 1;
      const updatedManagerGroup = {
        no: 2,
        groupNo: 2,
      };

      const existingGroup = {
        no: originalNo,
        groupNo: originalGroupNo,
      };

      (findManagerGroup as jest.Mock).mockResolvedValueOnce(existingGroup).mockResolvedValueOnce(null);
      (updateManagerGroup as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      await updateManagerGroupS(updatedManagerGroup, originalNo, originalGroupNo, meta);

      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'U',
        targetTable: 'managerGroup',
        targetId: `${updatedManagerGroup.no}_${updatedManagerGroup.groupNo}`,
        oldValues: JSON.stringify({ no: originalNo, groupNo: originalGroupNo }),
        newValues: JSON.stringify(updatedManagerGroup),
        reason: `관리자 그룹 수정: managerNo ${originalNo}->${updatedManagerGroup.no}, groupNo ${originalGroupNo}->${updatedManagerGroup.groupNo}`,
      });
      expect(logAction).toHaveBeenCalledWith({}, mockConn);
    });

    it('관리자 그룹 삭제 시 로그가 올바르게 기록되어야 함', async () => {
      const no = 1;
      const groupNo = 1;
      const existingGroup = {
        no,
        groupNo,
      };

      (findManagerGroup as jest.Mock).mockResolvedValue(existingGroup);
      (deleteManagerGroup as jest.Mock).mockResolvedValue({ affectedRows: 1 });
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      await deleteManagerGroupS(no, groupNo, meta);

      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'D',
        targetTable: 'managerGroup',
        targetId: `${no}_${groupNo}`,
        oldValues: JSON.stringify({ no, groupNo }),
        newValues: JSON.stringify({}),
        reason: `관리자 그룹 삭제: managerNo ${no}, groupNo ${groupNo}`,
      });
      expect(logAction).toHaveBeenCalledWith({}, mockConn);
    });
  });
});

import { getGroupsS, createGroupS, updateGroupS, deleteGroupS } from '@/services/permission-admin/group.service';
import {
  findGroups,
  insertGroup,
  updateGroup,
  deleteGroup,
  checkGroupExists,
  checkGroupDuplicate,
  findGroup,
} from '@/models/group/group-model';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { AppError } from '@/utils/error.utils';
import type { Group, CreateGroup } from '@/types/permission/group';
import type { LogMeta } from '@/types/history';
import type { Pagination } from '@/types/common';

// Next.js 모듈 모킹
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

jest.mock('@/models/group/group-model');
jest.mock('@/lib/mariadb/query');
jest.mock('@/services/log-action/log-action.service', () => ({
  logAction: jest.fn(),
  makeLogParams: jest.fn(),
}));

describe('Group Service', () => {
  const mockConn = {
    release: jest.fn(),
  };

  const mockGroup: Group = {
    groupNo: 1,
    name: '테스트 그룹',
    schoolNo: 1,
    parentGroupNo: null,
    schoolName: null,
    parentGroupName: null,
    created: '2024-01-01T00:00:00.000Z',
  };

  const mockCreateGroup: CreateGroup = {
    name: '새 그룹',
    schoolNo: 1,
    parentGroupNo: null,
  };

  const meta: LogMeta = {
    managerNo: 1,
    schoolNo: 1,
    ip: '127.0.0.1',
    userAgent: 'test-agent',
  };

  const pagination: Pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
    (commitTransaction as jest.Mock).mockResolvedValue(undefined);
    (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);
    (logAction as jest.Mock).mockResolvedValue(undefined);
    (makeLogParams as jest.Mock).mockReturnValue({});
  });

  describe('getGroupsS', () => {
    it('그룹 목록을 성공적으로 조회해야 함', async () => {
      const mockGroups = [mockGroup];
      const mockResult = {
        groups: mockGroups,
        total: 1,
      };

      (findGroups as jest.Mock).mockResolvedValue(mockResult);

      const result = await getGroupsS(pagination, meta);

      expect(result).toEqual({
        groups: mockGroups,
        pagination: {
          ...pagination,
          total: 1,
          totalPages: 1,
        },
      });

      expect(findGroups).toHaveBeenCalledWith({
        pagination,
        filters: undefined,
      });

      // logAction 호출 검증
      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'S',
        targetTable: 'group',
        targetId: '',
        oldValues: '',
        newValues: JSON.stringify(mockResult),
        reason: '그룹 목록 조회',
      });
      expect(logAction).toHaveBeenCalledWith({});
    });

    it('필터가 적용된 그룹 목록을 조회해야 함', async () => {
      const filters = {
        name: '테스트',
        schoolNo: 1,
      };

      const mockGroups = [mockGroup];
      const mockResult = {
        groups: mockGroups,
        total: 1,
      };

      (findGroups as jest.Mock).mockResolvedValue(mockResult);

      const result = await getGroupsS(pagination, meta, filters);

      expect(result).toEqual({
        groups: mockGroups,
        pagination: {
          ...pagination,
          total: 1,
          totalPages: 1,
        },
      });

      expect(findGroups).toHaveBeenCalledWith({
        pagination,
        filters,
      });
    });

    it('DB 조회 중 오류 발생 시 500 에러를 발생시켜야 함', async () => {
      (findGroups as jest.Mock).mockRejectedValue(new Error('DB 오류'));

      await expect(getGroupsS(pagination, meta)).rejects.toThrow(
        new AppError('그룹 목록 조회 중 오류가 발생했습니다.', 500),
      );
    });
  });

  describe('createGroupS', () => {
    it('그룹을 성공적으로 생성해야 함', async () => {
      const insertResult = { insertId: 1 };

      (checkGroupDuplicate as jest.Mock).mockResolvedValue({ count: 0 });
      (insertGroup as jest.Mock).mockResolvedValue(insertResult);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await createGroupS(mockCreateGroup, meta);

      expect(result).toEqual({ groupNo: 1 });

      expect(checkGroupDuplicate).toHaveBeenCalledWith({
        name: mockCreateGroup.name,
        schoolNo: mockCreateGroup.schoolNo,
      });

      expect(insertGroup).toHaveBeenCalledWith(
        {
          name: mockCreateGroup.name,
          schoolNo: mockCreateGroup.schoolNo,
          parentGroupNo: mockCreateGroup.parentGroupNo,
        },
        mockConn,
      );

      expect(commitTransaction).toHaveBeenCalled();

      // logAction 호출 검증
      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'I',
        targetTable: 'group',
        targetId: '1',
        oldValues: JSON.stringify({}),
        newValues: JSON.stringify(mockCreateGroup),
        reason: `그룹 생성: ${mockCreateGroup.name}`,
      });
      expect(logAction).toHaveBeenCalledWith({}, mockConn);
    });

    it('중복된 그룹 생성 시 400 에러를 발생시켜야 함', async () => {
      (checkGroupDuplicate as jest.Mock).mockResolvedValue({ count: 1 });

      await expect(createGroupS(mockCreateGroup, meta)).rejects.toThrow(new AppError('이미 존재하는 그룹입니다.', 400));

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('그룹 생성 중 오류 발생 시 롤백되어야 함', async () => {
      (checkGroupDuplicate as jest.Mock).mockResolvedValue({ count: 0 });
      (insertGroup as jest.Mock).mockRejectedValue(new Error('Insert error'));

      await expect(createGroupS(mockCreateGroup, meta)).rejects.toThrow('Insert error');

      expect(rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('updateGroupS', () => {
    const updateGroupData: Group = {
      groupNo: 1,
      name: '수정된 그룹',
      schoolNo: 2,
      parentGroupNo: null,
      schoolName: null,
      parentGroupName: null,
      created: '2024-01-01T00:00:00.000Z',
    };

    it('그룹을 성공적으로 수정해야 함', async () => {
      const existingGroup = { ...mockGroup };
      const updateResult = { ...existingGroup, ...updateGroupData };

      (checkGroupExists as jest.Mock).mockResolvedValue(true);
      (findGroup as jest.Mock).mockResolvedValue(existingGroup);
      (checkGroupDuplicate as jest.Mock).mockResolvedValue({ count: 0 });
      (updateGroup as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await updateGroupS(updateGroupData, meta);

      expect(result).toEqual({ groupNo: 1 });

      expect(checkGroupExists).toHaveBeenCalledWith({ groupNo: 1 });
      expect(findGroup).toHaveBeenCalledWith({ groupNo: 1 });
      expect(checkGroupDuplicate).toHaveBeenCalledWith({
        name: updateGroupData.name,
        schoolNo: updateGroupData.schoolNo,
        groupNo: 1,
      });
      expect(updateGroup).toHaveBeenCalledWith(updateResult, mockConn);
      expect(commitTransaction).toHaveBeenCalled();

      // logAction 호출 검증
      expect(makeLogParams).toHaveBeenCalledWith({
        ...meta,
        actionType: 'U',
        targetTable: 'group',
        targetId: '1',
        oldValues: JSON.stringify(existingGroup),
        newValues: JSON.stringify(updateResult),
        reason: `그룹 수정: ${updateGroupData.name}`,
      });
      expect(logAction).toHaveBeenCalledWith({}, mockConn);
    });

    it('존재하지 않는 그룹 수정 시 404 에러를 발생시켜야 함', async () => {
      (checkGroupExists as jest.Mock).mockResolvedValue(false);

      await expect(updateGroupS(updateGroupData, meta)).rejects.toThrow(new AppError('존재하지 않는 그룹입니다.', 404));

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('findGroup에서 그룹을 찾을 수 없을 때 404 에러를 발생시켜야 함', async () => {
      (checkGroupExists as jest.Mock).mockResolvedValue(true);
      (findGroup as jest.Mock).mockResolvedValue(null);

      await expect(updateGroupS(updateGroupData, meta)).rejects.toThrow(new AppError('존재하지 않는 그룹입니다.', 404));

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('중복된 그룹명으로 수정 시 400 에러를 발생시켜야 함', async () => {
      const existingGroup = { ...mockGroup };

      (checkGroupExists as jest.Mock).mockResolvedValue(true);
      (findGroup as jest.Mock).mockResolvedValue(existingGroup);
      (checkGroupDuplicate as jest.Mock).mockResolvedValue({ count: 1 });

      await expect(updateGroupS(updateGroupData, meta)).rejects.toThrow(new AppError('이미 존재하는 그룹입니다.', 400));

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('그룹 수정 중 오류 발생 시 롤백되어야 함', async () => {
      const existingGroup = { ...mockGroup };

      (checkGroupExists as jest.Mock).mockResolvedValue(true);
      (findGroup as jest.Mock).mockResolvedValue(existingGroup);
      (checkGroupDuplicate as jest.Mock).mockResolvedValue({ count: 0 });
      (updateGroup as jest.Mock).mockRejectedValue(new Error('Update error'));

      await expect(updateGroupS(updateGroupData, meta)).rejects.toThrow('Update error');

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('이름이 변경되지 않았을 때 중복 체크를 하지 않아야 함', async () => {
      const existingGroup = { ...mockGroup };
      const updateData = { ...updateGroupData, name: existingGroup.name, schoolNo: existingGroup.schoolNo };

      (checkGroupExists as jest.Mock).mockResolvedValue(true);
      (findGroup as jest.Mock).mockResolvedValue(existingGroup);
      (updateGroup as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      await updateGroupS(updateData, meta);

      expect(checkGroupDuplicate).not.toHaveBeenCalled();
    });

    it('updateGroupS에서 beginTransaction 실패 시 conn이 undefined인 경우 처리', async () => {
      // beginTransaction이 실패하여 conn이 undefined인 경우
      (beginTransaction as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      await expect(
        updateGroupS(
          {
            groupNo: 1,
            name: 'Updated Group',
            schoolNo: 1,
            parentGroupNo: null,
            schoolName: 'Test School',
            parentGroupName: null,
          },
          { managerNo: 1, ip: '127.0.0.1', userAgent: 'test', schoolNo: 1 },
        ),
      ).rejects.toThrow('Connection failed');

      // conn이 undefined이므로 rollbackTransaction과 release가 호출되지 않아야 함
      expect(rollbackTransaction).not.toHaveBeenCalled();
    });
  });

  describe('deleteGroupS', () => {
    it('그룹을 성공적으로 삭제해야 함', async () => {
      const groupNo = 1;

      (checkGroupExists as jest.Mock).mockResolvedValue(true);
      (deleteGroup as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      await deleteGroupS(groupNo, meta);

      expect(checkGroupExists).toHaveBeenCalledWith({ groupNo });
      expect(deleteGroup).toHaveBeenCalledWith({ groupNo }, mockConn);
      expect(commitTransaction).toHaveBeenCalled();

      // logAction 호출 검증
      expect(makeLogParams).toHaveBeenCalledWith({
        ...meta,
        actionType: 'D',
        targetTable: 'group',
        targetId: '1',
        oldValues: JSON.stringify({}),
        newValues: '',
        reason: `그룹 삭제: ${groupNo}`,
      });
      expect(logAction).toHaveBeenCalledWith({}, mockConn);
    });

    it('존재하지 않는 그룹 삭제 시 404 에러를 발생시켜야 함', async () => {
      const groupNo = 999;

      (checkGroupExists as jest.Mock).mockResolvedValue(false);

      await expect(deleteGroupS(groupNo, meta)).rejects.toThrow(new AppError('존재하지 않는 그룹입니다.', 404));

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('그룹 삭제 중 오류 발생 시 롤백되어야 함', async () => {
      const groupNo = 1;

      (checkGroupExists as jest.Mock).mockResolvedValue(true);
      (deleteGroup as jest.Mock).mockRejectedValue(new Error('Delete error'));

      await expect(deleteGroupS(groupNo, meta)).rejects.toThrow('Delete error');

      expect(rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('트랜잭션 처리', () => {
    it('성공 시 트랜잭션이 커밋되어야 함', async () => {
      const insertResult = { insertId: 1 };

      (checkGroupDuplicate as jest.Mock).mockResolvedValue({ count: 0 });
      (insertGroup as jest.Mock).mockResolvedValue(insertResult);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      await createGroupS(mockCreateGroup, meta);

      expect(beginTransaction).toHaveBeenCalled();
      expect(commitTransaction).toHaveBeenCalled();
      expect(rollbackTransaction).not.toHaveBeenCalled();
    });

    it('오류 발생 시 트랜잭션이 롤백되어야 함', async () => {
      (checkGroupDuplicate as jest.Mock).mockResolvedValue({ count: 1 });

      await expect(createGroupS(mockCreateGroup, meta)).rejects.toThrow();

      expect(beginTransaction).toHaveBeenCalled();
      expect(rollbackTransaction).toHaveBeenCalled();
      expect(commitTransaction).not.toHaveBeenCalled();
    });

    it('beginTransaction 실패 시에도 처리되어야 함', async () => {
      (beginTransaction as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      await expect(createGroupS(mockCreateGroup, meta)).rejects.toThrow('Connection failed');

      expect(beginTransaction).toHaveBeenCalled();
      expect(mockConn.release).not.toHaveBeenCalled();
    });
  });

  describe('에러 처리', () => {
    it('AppError가 아닌 다른 에러가 발생했을 때 원본 에러가 그대로 전파되어야 함', async () => {
      const customError = new Error('Custom error');

      (findGroups as jest.Mock).mockRejectedValue(customError);

      await expect(getGroupsS(pagination, meta)).rejects.toThrow(
        new AppError('그룹 목록 조회 중 오류가 발생했습니다.', 500),
      );
    });
  });

  describe('에러 케이스 테스트', () => {
    it('getGroupsS에서 예외 발생 시 에러 처리', async () => {
      // findGroups가 예외를 던지도록 모킹
      (findGroups as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(
        getGroupsS(
          { page: 1, pageSize: 10, total: 0, totalPages: 0 },
          { managerNo: 1, ip: '127.0.0.1', userAgent: 'test', schoolNo: 1 },
        ),
      ).rejects.toThrow('그룹 목록 조회 중 오류가 발생했습니다.');
    });

    it('deleteGroupS에서 트랜잭션 롤백 테스트', async () => {
      // rollbackTransaction을 정상적으로 모킹
      (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);
      // deleteGroup이 예외를 던지도록 모킹
      (deleteGroup as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      await expect(deleteGroupS(1, { managerNo: 1, ip: '127.0.0.1', userAgent: 'test', schoolNo: 1 })).rejects.toThrow(
        'Delete failed',
      );

      expect(rollbackTransaction).toHaveBeenCalled();
    });
  });
});

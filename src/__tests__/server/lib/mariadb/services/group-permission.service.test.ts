import {
  getGroupPermissionsS,
  createGroupPermissionS,
  updateGroupPermissionS,
  deleteGroupPermissionS,
} from '@/services/permission-admin/group-permission.service';
import {
  insertGroupPermission,
  updateGroupPermission,
  deleteGroupPermission,
  selectGroupPermission,
  findGroupPermission,
} from '@/models/group-permission/group-permission.model';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { AppError } from '@/utils/error.utils';

// Mock 모듈들
jest.mock('@/models/group-permission/group-permission.model');
jest.mock('@/services/log-action/log-action.service');
jest.mock('@/lib/mariadb/query');

describe('Group Permission Service', () => {
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

  const mockCreateGroupPermission = {
    groupNo: 1,
    permissionNo: 1,
    isAllowed: 'Y' as const,
    override: 'N' as const,
    extraCondition: 'condition',
    extraLimit: '100',
  };

  const mockUpdateGroupPermission = {
    originalGroupNo: 1,
    originalPermissionNo: 1,
    groupNo: 2,
    permissionNo: 2,
    isAllowed: 'Y' as const,
    override: 'Y' as const,
    extraCondition: 'updated_condition',
    extraLimit: '200',
  };

  const mockGroupPermissions = [
    {
      groupNo: 1,
      permissionNo: 1,
      isAllowed: 'Y' as const,
      override: 'N' as const,
      extraCondition: 'condition',
      extraLimit: '100',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
    // commitTransaction과 rollbackTransaction은 실제 함수를 사용하도록 mock 제거
    (logAction as jest.Mock).mockResolvedValue(undefined);
    (makeLogParams as jest.Mock).mockReturnValue({});
  });

  describe('getGroupPermissionsS', () => {
    it('그룹 권한 목록을 성공적으로 조회해야 함', async () => {
      const filters = { groupNo: 1 };
      const mockResult = {
        groupPermissions: mockGroupPermissions,
        total: 1,
      };

      (selectGroupPermission as jest.Mock).mockResolvedValue(mockResult);

      const result = await getGroupPermissionsS(pagination, filters, meta);

      expect(result).toEqual(mockResult);
      expect(selectGroupPermission).toHaveBeenCalledWith(pagination, filters);

      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'S',
        targetTable: 'groupPermission',
        targetId: 'groupNo=1',
        oldValues: '',
        newValues: JSON.stringify(mockResult),
        reason: '그룹 권한 조회: groupNo 1',
      });
      expect(logAction).toHaveBeenCalledWith({}, mockConn);
      expect(commitTransaction).toHaveBeenCalled();
    });

    it('필터 없이 전체 그룹 권한 목록을 조회해야 함', async () => {
      const mockResult = {
        groupPermissions: mockGroupPermissions,
        total: 1,
      };

      (selectGroupPermission as jest.Mock).mockResolvedValue(mockResult);

      const result = await getGroupPermissionsS(pagination, undefined, meta);

      expect(result).toEqual(mockResult);
      expect(selectGroupPermission).toHaveBeenCalledWith(pagination, undefined);

      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'S',
        targetTable: 'groupPermission',
        targetId: 'all',
        oldValues: '',
        newValues: JSON.stringify(mockResult),
        reason: '그룹 권한 조회: 전체',
      });
    });

    it('데이터가 없을 때 404 에러를 발생시켜야 함', async () => {
      const filters = { groupNo: 1 };
      const mockResult = {
        groupPermissions: [],
        total: 0,
      };

      (selectGroupPermission as jest.Mock).mockResolvedValue(mockResult);

      await expect(getGroupPermissionsS(pagination, filters, meta)).rejects.toThrow(
        new AppError('해당하는 학교에 그룹 권한 목록이 존재하지 않습니다.', 404),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('DB 조회 중 오류 발생 시 500 에러를 발생시켜야 함', async () => {
      const filters = { groupNo: 1 };

      (selectGroupPermission as jest.Mock).mockRejectedValue(new Error('DB 오류'));

      await expect(getGroupPermissionsS(pagination, filters, meta)).rejects.toThrow(
        new AppError('그룹 권한 목록 조회 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('DB 조회 중 AppError 발생 시 원본 에러를 그대로 전파해야 함', async () => {
      const filters = { groupNo: 1 };
      const customAppError = new AppError('커스텀 에러', 400);

      (selectGroupPermission as jest.Mock).mockRejectedValue(customAppError);

      await expect(getGroupPermissionsS(pagination, filters, meta)).rejects.toThrow(customAppError);

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('meta가 없어도 조회가 가능해야 함', async () => {
      const filters = { groupNo: 1 };
      const mockResult = {
        groupPermissions: mockGroupPermissions,
        total: 1,
      };

      (selectGroupPermission as jest.Mock).mockResolvedValue(mockResult);

      const result = await getGroupPermissionsS(pagination, filters);

      expect(result).toEqual(mockResult);
      expect(logAction).not.toHaveBeenCalled();
    });
  });

  describe('createGroupPermissionS', () => {
    it('그룹 권한을 성공적으로 생성해야 함', async () => {
      (findGroupPermission as jest.Mock).mockResolvedValue(null);
      (insertGroupPermission as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await createGroupPermissionS(mockCreateGroupPermission, meta);

      expect(result).toEqual({
        groupNo: mockCreateGroupPermission.groupNo,
        permissionNo: mockCreateGroupPermission.permissionNo,
      });

      expect(findGroupPermission).toHaveBeenCalledWith({
        groupNo: mockCreateGroupPermission.groupNo,
        permissionNo: mockCreateGroupPermission.permissionNo,
      });
      expect(insertGroupPermission).toHaveBeenCalledWith(mockCreateGroupPermission, mockConn);

      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'I',
        targetTable: 'groupPermission',
        targetId: `${mockCreateGroupPermission.groupNo}|${mockCreateGroupPermission.permissionNo}`,
        oldValues: '',
        newValues: JSON.stringify(mockCreateGroupPermission),
        reason: `그룹 권한 생성: groupNo ${mockCreateGroupPermission.groupNo}, permissionNo ${mockCreateGroupPermission.permissionNo}`,
      });
      expect(logAction).toHaveBeenCalledWith({}, mockConn);
      expect(commitTransaction).toHaveBeenCalled();
    });

    it('중복된 그룹 권한 생성 시 400 에러를 발생시켜야 함', async () => {
      (findGroupPermission as jest.Mock).mockResolvedValue({
        groupNo: 1,
        permissionNo: 1,
      });

      await expect(createGroupPermissionS(mockCreateGroupPermission, meta)).rejects.toThrow(
        new AppError('이미 존재하는 그룹 권한입니다.', 400),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('그룹 권한 생성 중 오류 발생 시 롤백되어야 함', async () => {
      (findGroupPermission as jest.Mock).mockResolvedValue(null);
      (insertGroupPermission as jest.Mock).mockRejectedValue(new Error('Insert error'));

      await expect(createGroupPermissionS(mockCreateGroupPermission, meta)).rejects.toThrow(
        new AppError('그룹 권한 생성 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('그룹 권한 생성 중 AppError 발생 시 원본 에러를 그대로 전파해야 함', async () => {
      (findGroupPermission as jest.Mock).mockResolvedValue(null);
      const customAppError = new AppError('커스텀 생성 에러', 400);
      (insertGroupPermission as jest.Mock).mockRejectedValue(customAppError);

      await expect(createGroupPermissionS(mockCreateGroupPermission, meta)).rejects.toThrow(customAppError);

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('null 값이 포함된 그룹 권한을 생성해야 함', async () => {
      const permissionWithNulls = {
        groupNo: 1,
        permissionNo: 1,
        isAllowed: null,
        override: null,
        extraCondition: null,
        extraLimit: null,
      };

      (findGroupPermission as jest.Mock).mockResolvedValue(null);
      (insertGroupPermission as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await createGroupPermissionS(permissionWithNulls, meta);

      expect(result).toEqual({
        groupNo: permissionWithNulls.groupNo,
        permissionNo: permissionWithNulls.permissionNo,
      });
      expect(insertGroupPermission).toHaveBeenCalledWith(permissionWithNulls, mockConn);
    });
  });

  describe('updateGroupPermissionS', () => {
    it('그룹 권한을 성공적으로 수정해야 함', async () => {
      const originalPermission = {
        groupNo: 1,
        permissionNo: 1,
        isAllowed: 'N' as const,
        override: 'N' as const,
        extraCondition: 'old_condition',
        extraLimit: '50',
      };

      (findGroupPermission as jest.Mock)
        .mockResolvedValueOnce(originalPermission) // 원본 권한 조회
        .mockResolvedValueOnce(null); // 새로운 권한 중복 체크 (없음)
      (updateGroupPermission as jest.Mock).mockResolvedValue({ affectedRows: 1 });
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await updateGroupPermissionS(mockUpdateGroupPermission, meta);

      expect(result).toEqual({
        groupNo: mockUpdateGroupPermission.groupNo,
        permissionNo: mockUpdateGroupPermission.permissionNo,
      });

      expect(findGroupPermission).toHaveBeenCalledWith({
        groupNo: mockUpdateGroupPermission.originalGroupNo,
        permissionNo: mockUpdateGroupPermission.originalPermissionNo,
      });
      expect(updateGroupPermission).toHaveBeenCalledWith(mockUpdateGroupPermission, mockConn);

      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'U',
        targetTable: 'groupPermission',
        targetId: `${mockUpdateGroupPermission.originalGroupNo}|${mockUpdateGroupPermission.originalPermissionNo}`,
        oldValues: JSON.stringify(originalPermission),
        newValues: JSON.stringify(mockUpdateGroupPermission),
        reason: `그룹 권한 수정: groupNo ${mockUpdateGroupPermission.groupNo}, permissionNo ${mockUpdateGroupPermission.permissionNo}`,
      });
      expect(logAction).toHaveBeenCalledWith({}, mockConn);
      expect(commitTransaction).toHaveBeenCalled();
    });

    it('존재하지 않는 그룹 권한 수정 시 404 에러를 발생시켜야 함', async () => {
      (findGroupPermission as jest.Mock).mockResolvedValue(null);

      await expect(updateGroupPermissionS(mockUpdateGroupPermission, meta)).rejects.toThrow(
        new AppError('수정할 그룹 권한이 존재하지 않습니다.', 404),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('새로운 그룹 권한이 이미 존재할 때 400 에러를 발생시켜야 함', async () => {
      const originalPermission = {
        groupNo: 1,
        permissionNo: 1,
        isAllowed: 'N' as const,
        override: 'N' as const,
        extraCondition: 'old_condition',
        extraLimit: '50',
      };

      (findGroupPermission as jest.Mock)
        .mockResolvedValueOnce(originalPermission) // 원본 권한 조회
        .mockResolvedValueOnce({ groupNo: 2, permissionNo: 2 }); // 새로운 권한 중복 체크 (존재함)

      await expect(updateGroupPermissionS(mockUpdateGroupPermission, meta)).rejects.toThrow(
        new AppError('이미 존재하는 그룹 권한입니다.', 400),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('그룹/권한 번호가 변경되지 않으면 중복 체크를 하지 않아야 함', async () => {
      const updateWithoutChange = {
        ...mockUpdateGroupPermission,
        groupNo: 1, // 원본과 동일
        permissionNo: 1, // 원본과 동일
      };

      const originalPermission = {
        groupNo: 1,
        permissionNo: 1,
        isAllowed: 'N' as const,
        override: 'N' as const,
        extraCondition: 'old_condition',
        extraLimit: '50',
      };

      (findGroupPermission as jest.Mock).mockResolvedValueOnce(originalPermission); // 원본 권한만 조회
      (updateGroupPermission as jest.Mock).mockResolvedValue({ affectedRows: 1 });
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await updateGroupPermissionS(updateWithoutChange, meta);

      expect(result).toEqual({
        groupNo: updateWithoutChange.groupNo,
        permissionNo: updateWithoutChange.permissionNo,
      });

      // 중복 체크는 한 번만 호출됨 (원본 권한 조회만)
      expect(findGroupPermission).toHaveBeenCalledTimes(1);
    });

    it('수정 실패 시 400 에러를 발생시켜야 함', async () => {
      const originalPermission = {
        groupNo: 1,
        permissionNo: 1,
        isAllowed: 'N' as const,
        override: 'N' as const,
        extraCondition: 'old_condition',
        extraLimit: '50',
      };

      (findGroupPermission as jest.Mock)
        .mockResolvedValueOnce(originalPermission) // 원본 권한 조회
        .mockResolvedValueOnce(null); // 새로운 권한 중복 체크 (없음)
      (updateGroupPermission as jest.Mock).mockResolvedValue({ affectedRows: 0 });

      await expect(updateGroupPermissionS(mockUpdateGroupPermission, meta)).rejects.toThrow(
        new AppError('그룹 권한 수정에 실패했습니다.', 400, 'UPDATE_FAILED'),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('그룹 권한 수정 중 오류 발생 시 롤백되어야 함', async () => {
      const originalPermission = {
        groupNo: 1,
        permissionNo: 1,
        isAllowed: 'N' as const,
        override: 'N' as const,
        extraCondition: 'old_condition',
        extraLimit: '50',
      };

      (findGroupPermission as jest.Mock)
        .mockResolvedValueOnce(originalPermission) // 원본 권한 조회
        .mockResolvedValueOnce(null); // 새로운 권한 중복 체크 (없음)
      (updateGroupPermission as jest.Mock).mockRejectedValue(new Error('Update error'));

      await expect(updateGroupPermissionS(mockUpdateGroupPermission, meta)).rejects.toThrow(
        new AppError('그룹 권한 수정 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('그룹 권한 수정 중 AppError 발생 시 원본 에러를 그대로 전파해야 함', async () => {
      const originalPermission = {
        groupNo: 1,
        permissionNo: 1,
        isAllowed: 'N' as const,
        override: 'N' as const,
        extraCondition: 'old_condition',
        extraLimit: '50',
      };

      (findGroupPermission as jest.Mock)
        .mockResolvedValueOnce(originalPermission) // 원본 권한 조회
        .mockResolvedValueOnce(null); // 새로운 권한 중복 체크 (없음)
      const customAppError = new AppError('커스텀 수정 에러', 400);
      (updateGroupPermission as jest.Mock).mockRejectedValue(customAppError);

      await expect(updateGroupPermissionS(mockUpdateGroupPermission, meta)).rejects.toThrow(customAppError);

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('null 값으로 그룹 권한을 수정해야 함', async () => {
      const updateWithNulls = {
        originalGroupNo: 1,
        originalPermissionNo: 1,
        groupNo: 2,
        permissionNo: 2,
        isAllowed: null,
        override: null,
        extraCondition: null,
        extraLimit: null,
      };

      const originalPermission = {
        groupNo: 1,
        permissionNo: 1,
        isAllowed: 'Y' as const,
        override: 'N' as const,
        extraCondition: 'old_condition',
        extraLimit: '100',
      };

      (findGroupPermission as jest.Mock)
        .mockResolvedValueOnce(originalPermission) // 원본 권한 조회
        .mockResolvedValueOnce(null); // 새로운 권한 중복 체크 (없음)
      (updateGroupPermission as jest.Mock).mockResolvedValue({ affectedRows: 1 });
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await updateGroupPermissionS(updateWithNulls, meta);

      expect(result).toEqual({
        groupNo: updateWithNulls.groupNo,
        permissionNo: updateWithNulls.permissionNo,
      });
      expect(updateGroupPermission).toHaveBeenCalledWith(updateWithNulls, mockConn);
    });
  });

  describe('deleteGroupPermissionS', () => {
    it('그룹 권한을 성공적으로 삭제해야 함', async () => {
      const existingPermission = {
        groupNo: 1,
        permissionNo: 1,
        isAllowed: 'Y' as const,
        override: 'N' as const,
        extraCondition: 'condition',
        extraLimit: '100',
      };

      (findGroupPermission as jest.Mock).mockResolvedValue(existingPermission);
      (deleteGroupPermission as jest.Mock).mockResolvedValue({ affectedRows: 1 });
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      await deleteGroupPermissionS(1, 1, meta);

      expect(findGroupPermission).toHaveBeenCalledWith({
        groupNo: 1,
        permissionNo: 1,
      });
      expect(deleteGroupPermission).toHaveBeenCalledWith({ groupNo: 1, permissionNo: 1 }, mockConn);

      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'D',
        targetTable: 'groupPermission',
        targetId: '1|1',
        oldValues: JSON.stringify(existingPermission),
        newValues: null,
        reason: '그룹 권한 삭제: groupNo 1, permissionNo 1',
      });
      expect(logAction).toHaveBeenCalledWith({}, mockConn);
      expect(commitTransaction).toHaveBeenCalled();
    });

    it('존재하지 않는 그룹 권한 삭제 시 404 에러를 발생시켜야 함', async () => {
      (findGroupPermission as jest.Mock).mockResolvedValue(null);

      await expect(deleteGroupPermissionS(999, 999, meta)).rejects.toThrow(
        new AppError('삭제할 그룹 권한이 존재하지 않습니다.', 404),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('삭제 실패 시 400 에러를 발생시켜야 함', async () => {
      const existingPermission = {
        groupNo: 1,
        permissionNo: 1,
        isAllowed: 'Y' as const,
        override: 'N' as const,
        extraCondition: 'condition',
        extraLimit: '100',
      };

      (findGroupPermission as jest.Mock).mockResolvedValue(existingPermission);
      (deleteGroupPermission as jest.Mock).mockResolvedValue({ affectedRows: 0 });

      await expect(deleteGroupPermissionS(1, 1, meta)).rejects.toThrow(
        new AppError('그룹 권한 삭제에 실패했습니다.', 400, 'DELETE_FAILED'),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('그룹 권한 삭제 중 오류 발생 시 롤백되어야 함', async () => {
      const existingPermission = {
        groupNo: 1,
        permissionNo: 1,
        isAllowed: 'Y' as const,
        override: 'N' as const,
        extraCondition: 'condition',
        extraLimit: '100',
      };

      (findGroupPermission as jest.Mock).mockResolvedValue(existingPermission);
      (deleteGroupPermission as jest.Mock).mockRejectedValue(new Error('Delete error'));

      await expect(deleteGroupPermissionS(1, 1, meta)).rejects.toThrow(
        new AppError('그룹 권한 삭제 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('트랜잭션 처리', () => {
    it('성공 시 트랜잭션이 커밋되어야 함', async () => {
      const mockResult = {
        groupPermissions: mockGroupPermissions,
        total: 1,
      };

      (selectGroupPermission as jest.Mock).mockResolvedValue(mockResult);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      await getGroupPermissionsS(pagination, { groupNo: 1 }, meta);

      expect(beginTransaction).toHaveBeenCalled();
      expect(commitTransaction).toHaveBeenCalled();
      expect(rollbackTransaction).not.toHaveBeenCalled();
    });

    it('오류 발생 시 트랜잭션이 롤백되어야 함', async () => {
      (selectGroupPermission as jest.Mock).mockRejectedValue(new Error('DB 오류'));

      await expect(getGroupPermissionsS(pagination, { groupNo: 1 }, meta)).rejects.toThrow();

      expect(beginTransaction).toHaveBeenCalled();
      expect(rollbackTransaction).toHaveBeenCalled();
      expect(commitTransaction).not.toHaveBeenCalled();
    });
  });

  describe('에러 처리', () => {
    it('AppError가 아닌 다른 에러가 발생했을 때 500 에러로 변환되어야 함', async () => {
      (selectGroupPermission as jest.Mock).mockRejectedValue(new Error('Custom error'));

      await expect(getGroupPermissionsS(pagination, { groupNo: 1 }, meta)).rejects.toThrow(
        new AppError('그룹 권한 목록 조회 중 오류가 발생했습니다.', 500),
      );
    });

    it('AppError는 그대로 전파되어야 함', async () => {
      const customError = new AppError('커스텀 에러', 400);
      (findGroupPermission as jest.Mock).mockResolvedValue(null);
      (insertGroupPermission as jest.Mock).mockRejectedValue(customError);

      await expect(createGroupPermissionS(mockCreateGroupPermission, meta)).rejects.toThrow(customError);
    });
  });
});

import {
  getPermissionsS,
  createPermissionS,
  updatePermissionS,
  deletePermissionS,
  getPermissionS,
} from '@/services/permission-admin/permission.service';
import {
  insertPermission,
  updatePermission,
  deletePermission,
  findPermissions,
  findPermission,
  findPermissionByName,
} from '@/models/permission/permission.model';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { AppError } from '@/utils/error.utils';

// Mock 모듈들
jest.mock('@/models/permission/permission.model');
jest.mock('@/services/log-action/log-action.service');
jest.mock('@/lib/mariadb/query');

describe('Permission Service', () => {
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

  const mockCreatePermission = {
    name: 'test_permission',
    description: '테스트 권한',
    defaultExtraCondition: 'condition',
    defaultExtraLimit: '100',
  };

  const mockUpdatePermission = {
    permissionNo: 1,
    name: 'updated_permission',
    description: '수정된 권한',
    defaultExtraCondition: 'updated_condition',
    defaultExtraLimit: '200',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
    (commitTransaction as jest.Mock).mockImplementation(async () => {
      await mockConn.release();
    });
    (rollbackTransaction as jest.Mock).mockImplementation(async () => {
      await mockConn.release();
    });
    (logAction as jest.Mock).mockResolvedValue(undefined);
    (makeLogParams as jest.Mock).mockReturnValue({});
  });

  describe('getPermissionsS', () => {
    it('권한 목록을 성공적으로 조회해야 함', async () => {
      const mockPermissions = [
        {
          permissionNo: 1,
          name: 'test_permission',
          description: '테스트 권한',
          defaultExtraCondition: 'condition',
          defaultExtraLimit: '100',
        },
      ];

      (findPermissions as jest.Mock).mockResolvedValue({
        permissions: mockPermissions,
        total: 1,
      });

      const result = await getPermissionsS(pagination, meta);

      expect(result.permissions).toEqual(mockPermissions);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.totalPages).toBe(1);

      expect(findPermissions).toHaveBeenCalledWith({
        pagination,
        filters: undefined,
      });

      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        schoolNo: meta.schoolNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'S',
        targetTable: 'permission',
        targetId: '',
        oldValues: null,
        newValues: JSON.stringify({
          permissions: mockPermissions,
          total: 1,
        }),
        reason: '권한 목록 조회',
      });
      expect(logAction).toHaveBeenCalledWith({});
    });

    it('필터가 적용된 권한 목록을 조회해야 함', async () => {
      const filters = { name: 'test', schoolNo: 1 };
      const mockPermissions = [
        {
          permissionNo: 1,
          name: 'test_permission',
          description: '테스트 권한',
          defaultExtraCondition: 'condition',
          defaultExtraLimit: '100',
        },
      ];

      (findPermissions as jest.Mock).mockResolvedValue({
        permissions: mockPermissions,
        total: 1,
      });

      const result = await getPermissionsS(pagination, meta, filters);

      expect(result.permissions).toEqual(mockPermissions);
      expect(findPermissions).toHaveBeenCalledWith({
        pagination,
        filters,
      });
    });

    it('DB 조회 중 오류 발생 시 500 에러를 발생시켜야 함', async () => {
      (findPermissions as jest.Mock).mockRejectedValue(new Error('DB 오류'));

      await expect(getPermissionsS(pagination, meta)).rejects.toThrow(
        new AppError('권한 목록 조회 중 오류가 발생했습니다.', 500),
      );
    });

    it('빈 권한 목록을 조회해야 함', async () => {
      (findPermissions as jest.Mock).mockResolvedValue({
        permissions: [],
        total: 0,
      });

      const result = await getPermissionsS(pagination, meta);

      expect(result.permissions).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it('페이지네이션이 올바르게 계산되어야 함', async () => {
      const mockPermissions = Array.from({ length: 25 }, (_, i) => ({
        permissionNo: i + 1,
        name: `permission_${i + 1}`,
        description: `권한 ${i + 1}`,
        defaultExtraCondition: null,
        defaultExtraLimit: null,
      }));

      (findPermissions as jest.Mock).mockResolvedValue({
        permissions: mockPermissions,
        total: 25,
      });

      const customPagination = { page: 2, pageSize: 10, total: 0, totalPages: 0 };
      const result = await getPermissionsS(customPagination, meta);

      expect(result.pagination.total).toBe(25);
      expect(result.pagination.totalPages).toBe(3);
    });
  });

  describe('createPermissionS', () => {
    it('권한을 성공적으로 생성해야 함', async () => {
      const insertResult = { insertId: 1 };

      (findPermissionByName as jest.Mock).mockResolvedValue(null);
      (insertPermission as jest.Mock).mockResolvedValue(insertResult);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await createPermissionS(mockCreatePermission, meta);

      expect(result.permissionNo).toBe(1);

      expect(findPermissionByName).toHaveBeenCalledWith(mockCreatePermission.name);
      expect(insertPermission).toHaveBeenCalledWith(mockCreatePermission, mockConn);

      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'I',
        targetTable: 'permission',
        targetId: '1',
        oldValues: JSON.stringify({}),
        newValues: JSON.stringify(mockCreatePermission),
        reason: `권한 생성: ${mockCreatePermission.name}`,
      });
      expect(logAction).toHaveBeenCalledWith({}, mockConn);

      expect(commitTransaction).toHaveBeenCalled();
    });

    it('중복된 권한 이름 생성 시 400 에러를 발생시켜야 함', async () => {
      (findPermissionByName as jest.Mock).mockResolvedValue({
        permissionNo: 1,
        name: 'test_permission',
      });

      await expect(createPermissionS(mockCreatePermission, meta)).rejects.toThrow(
        new AppError('이미 존재하는 권한 이름입니다.', 400, 'DUPLICATE_PERMISSION_NAME'),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('권한 생성 중 오류 발생 시 롤백되어야 함', async () => {
      (findPermissionByName as jest.Mock).mockResolvedValue(null);
      (insertPermission as jest.Mock).mockRejectedValue(new Error('Insert error'));

      await expect(createPermissionS(mockCreatePermission, meta)).rejects.toThrow(
        new AppError('권한 생성 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('Connection release 에러가 발생해도 처리되어야 함', async () => {
      const insertResult = { insertId: 1 };

      (findPermissionByName as jest.Mock).mockResolvedValue(null);
      (insertPermission as jest.Mock).mockResolvedValue(insertResult);
      (commitTransaction as jest.Mock).mockImplementation(async () => {
        await mockConn.release();
      });
      (mockConn.release as jest.Mock).mockRejectedValue(new Error('Release error'));

      await expect(createPermissionS(mockCreatePermission, meta)).rejects.toThrow('권한 생성 중 오류가 발생했습니다.');

      expect(mockConn.release).toHaveBeenCalled();
    });

    it('null 값이 포함된 권한을 생성해야 함', async () => {
      const insertResult = { insertId: 1 };
      const permissionWithNulls = {
        name: 'test_permission',
        description: null,
        defaultExtraCondition: null,
        defaultExtraLimit: null,
      };

      (findPermissionByName as jest.Mock).mockResolvedValue(null);
      (insertPermission as jest.Mock).mockResolvedValue(insertResult);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await createPermissionS(permissionWithNulls, meta);

      expect(result.permissionNo).toBe(1);
      expect(insertPermission).toHaveBeenCalledWith(permissionWithNulls, mockConn);
    });

    it('createPermissionS에서 insertPermission 실패 후 rollbackTransaction 실패 시 처리', async () => {
      (findPermissionByName as jest.Mock).mockResolvedValue(null);
      (insertPermission as jest.Mock).mockRejectedValue(new Error('Insert failed'));
      (rollbackTransaction as jest.Mock).mockRejectedValue(new Error('Rollback failed'));

      await expect(
        createPermissionS(
          { name: 'Test Permission', description: 'Test', defaultExtraCondition: '', defaultExtraLimit: '0' },
          { managerNo: 1, ip: '127.0.0.1', userAgent: 'test', schoolNo: 1 },
        ),
      ).rejects.toThrow('권한 생성 중 오류가 발생했습니다.');

      expect(rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('updatePermissionS', () => {
    it('권한을 성공적으로 수정해야 함', async () => {
      const existingPermission = {
        permissionNo: 1,
        name: 'old_permission',
        description: '기존 권한',
        defaultExtraCondition: 'old_condition',
        defaultExtraLimit: '50',
      };

      (findPermission as jest.Mock).mockResolvedValue(existingPermission);
      (updatePermission as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await updatePermissionS(mockUpdatePermission, meta);

      expect(result.permissionNo).toBe(1);

      expect(findPermission).toHaveBeenCalledWith({ permissionNo: 1 });
      expect(updatePermission).toHaveBeenCalledWith(mockUpdatePermission, mockConn);

      expect(makeLogParams).toHaveBeenCalledWith({
        ...meta,
        actionType: 'U',
        targetTable: 'permission',
        targetId: '1',
        oldValues: JSON.stringify(existingPermission),
        newValues: JSON.stringify(mockUpdatePermission),
        reason: `권한 수정: ${mockUpdatePermission.name}`,
      });
      expect(logAction).toHaveBeenCalledWith({}, mockConn);

      expect(commitTransaction).toHaveBeenCalled();
    });

    it('존재하지 않는 권한 수정 시 404 에러를 발생시켜야 함', async () => {
      (findPermission as jest.Mock).mockResolvedValue(null);

      await expect(updatePermissionS(mockUpdatePermission, meta)).rejects.toThrow(
        new AppError('존재하지 않는 권한입니다.', 404),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('권한 수정 중 오류 발생 시 롤백되어야 함', async () => {
      const existingPermission = {
        permissionNo: 1,
        name: 'old_permission',
        description: '기존 권한',
        defaultExtraCondition: 'old_condition',
        defaultExtraLimit: '50',
      };

      (findPermission as jest.Mock).mockResolvedValue(existingPermission);
      (updatePermission as jest.Mock).mockRejectedValue(new Error('Update error'));

      await expect(updatePermissionS(mockUpdatePermission, meta)).rejects.toThrow(
        new AppError('권한 수정 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('null 값으로 권한을 수정해야 함', async () => {
      const existingPermission = {
        permissionNo: 1,
        name: 'old_permission',
        description: '기존 권한',
        defaultExtraCondition: 'old_condition',
        defaultExtraLimit: '50',
      };

      const updateWithNulls = {
        permissionNo: 1,
        name: 'updated_permission',
        description: null,
        defaultExtraCondition: null,
        defaultExtraLimit: null,
      };

      (findPermission as jest.Mock).mockResolvedValue(existingPermission);
      (updatePermission as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await updatePermissionS(updateWithNulls, meta);

      expect(result.permissionNo).toBe(1);
      expect(updatePermission).toHaveBeenCalledWith(updateWithNulls, mockConn);
    });

    it('updatePermissionS에서 updatePermission 실패 후 rollbackTransaction 실패 시 처리', async () => {
      (findPermission as jest.Mock).mockResolvedValue({
        permissionNo: 1,
        name: 'old_permission',
        description: '기존 권한',
        defaultExtraCondition: 'old_condition',
        defaultExtraLimit: '50',
      });
      (updatePermission as jest.Mock).mockRejectedValue(new Error('Update failed'));
      (rollbackTransaction as jest.Mock).mockRejectedValue(new Error('Rollback failed'));

      await expect(
        updatePermissionS(
          {
            permissionNo: 1,
            name: 'Updated Permission',
            description: 'Updated',
            defaultExtraCondition: '',
            defaultExtraLimit: '0',
          },
          { managerNo: 1, ip: '127.0.0.1', userAgent: 'test', schoolNo: 1 },
        ),
      ).rejects.toThrow('권한 수정 중 오류가 발생했습니다.');

      expect(rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('deletePermissionS', () => {
    it('권한을 성공적으로 삭제해야 함', async () => {
      const existingPermission = {
        permissionNo: 1,
        name: 'test_permission',
        description: '테스트 권한',
        defaultExtraCondition: 'condition',
        defaultExtraLimit: '100',
      };

      (findPermission as jest.Mock).mockResolvedValue(existingPermission);
      (deletePermission as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      await deletePermissionS(1, meta);

      expect(findPermission).toHaveBeenCalledWith({ permissionNo: 1 });
      expect(deletePermission).toHaveBeenCalledWith(1, mockConn);

      expect(makeLogParams).toHaveBeenCalledWith({
        ...meta,
        actionType: 'D',
        targetTable: 'permission',
        targetId: '1',
        oldValues: JSON.stringify(existingPermission),
        newValues: null,
        reason: `권한 삭제: ${existingPermission.name}`,
      });
      expect(logAction).toHaveBeenCalledWith({}, mockConn);

      expect(commitTransaction).toHaveBeenCalled();
    });

    it('존재하지 않는 권한 삭제 시 404 에러를 발생시켜야 함', async () => {
      (findPermission as jest.Mock).mockResolvedValue(null);

      await expect(deletePermissionS(999, meta)).rejects.toThrow(new AppError('존재하지 않는 권한입니다.', 404));

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('권한 삭제 중 오류 발생 시 롤백되어야 함', async () => {
      const existingPermission = {
        permissionNo: 1,
        name: 'test_permission',
        description: '테스트 권한',
        defaultExtraCondition: 'condition',
        defaultExtraLimit: '100',
      };

      (findPermission as jest.Mock).mockResolvedValue(existingPermission);
      (deletePermission as jest.Mock).mockRejectedValue(new Error('Delete error'));

      await expect(deletePermissionS(1, meta)).rejects.toThrow(new AppError('권한 삭제 중 오류가 발생했습니다.', 500));

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('deletePermissionS에서 deletePermission 실패 후 rollbackTransaction 실패 시 처리', async () => {
      (findPermission as jest.Mock).mockResolvedValue({
        permissionNo: 1,
        name: 'test_permission',
        description: '테스트 권한',
        defaultExtraCondition: 'condition',
        defaultExtraLimit: '100',
      });
      (deletePermission as jest.Mock).mockRejectedValue(new Error('Delete failed'));
      (rollbackTransaction as jest.Mock).mockRejectedValue(new Error('Rollback failed'));

      await expect(
        deletePermissionS(1, { managerNo: 1, ip: '127.0.0.1', userAgent: 'test', schoolNo: 1 }),
      ).rejects.toThrow('권한 삭제 중 오류가 발생했습니다.');

      expect(rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('getPermissionS', () => {
    it('권한을 성공적으로 조회해야 함', async () => {
      const permission = {
        permissionNo: 1,
        name: 'test_permission',
        description: '테스트 권한',
        defaultExtraCondition: 'condition',
        defaultExtraLimit: '100',
      };

      (findPermission as jest.Mock).mockResolvedValue(permission);

      const result = await getPermissionS(1, meta);

      expect(result.permissionNo).toBe(1);

      expect(findPermission).toHaveBeenCalledWith({ permissionNo: 1 });

      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'S',
        targetTable: 'permission',
        targetId: '1',
        oldValues: null,
        newValues: JSON.stringify(permission),
        reason: `권한 조회: ${permission.name}`,
      });
      expect(logAction).toHaveBeenCalledWith({});
    });

    it('존재하지 않는 권한 조회 시 404 에러를 발생시켜야 함', async () => {
      (findPermission as jest.Mock).mockResolvedValue(null);

      await expect(getPermissionS(999, meta)).rejects.toThrow(new AppError('존재하지 않는 권한입니다.', 404));
    });

    it('권한 조회 중 오류 발생 시 500 에러를 발생시켜야 함', async () => {
      (findPermission as jest.Mock).mockRejectedValue(new Error('DB 오류'));

      await expect(getPermissionS(1, meta)).rejects.toThrow(new AppError('권한 조회 중 오류가 발생했습니다.', 500));
    });

    it('null 값이 포함된 권한을 조회해야 함', async () => {
      const permissionWithNulls = {
        permissionNo: 1,
        name: 'test_permission',
        description: null,
        defaultExtraCondition: null,
        defaultExtraLimit: null,
      };

      (findPermission as jest.Mock).mockResolvedValue(permissionWithNulls);

      const result = await getPermissionS(1, meta);

      expect(result.permissionNo).toBe(1);
      expect(findPermission).toHaveBeenCalledWith({ permissionNo: 1 });
    });
  });

  describe('트랜잭션 처리', () => {
    it('성공 시 트랜잭션이 커밋되어야 함', async () => {
      const insertResult = { insertId: 1 };

      (findPermissionByName as jest.Mock).mockResolvedValue(null);
      (insertPermission as jest.Mock).mockResolvedValue(insertResult);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      await createPermissionS(mockCreatePermission, meta);

      expect(beginTransaction).toHaveBeenCalled();
      expect(commitTransaction).toHaveBeenCalled();
      expect(rollbackTransaction).not.toHaveBeenCalled();
    });

    it('오류 발생 시 트랜잭션이 롤백되어야 함', async () => {
      (findPermissionByName as jest.Mock).mockResolvedValue({
        permissionNo: 1,
        name: 'test_permission',
      });

      await expect(createPermissionS(mockCreatePermission, meta)).rejects.toThrow();

      expect(beginTransaction).toHaveBeenCalled();
      expect(rollbackTransaction).toHaveBeenCalled();
      expect(commitTransaction).not.toHaveBeenCalled();
    });

    it('beginTransaction 실패 시에도 처리되어야 함', async () => {
      (beginTransaction as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      await expect(createPermissionS(mockCreatePermission, meta)).rejects.toThrow(
        new AppError('권한 생성 중 오류가 발생했습니다.', 500),
      );

      expect(beginTransaction).toHaveBeenCalled();
      expect(mockConn.release).not.toHaveBeenCalled();
    });
  });

  describe('에러 처리', () => {
    it('AppError가 아닌 다른 에러가 발생했을 때 500 에러로 변환되어야 함', async () => {
      (findPermissions as jest.Mock).mockRejectedValue(new Error('Custom error'));

      await expect(getPermissionsS(pagination, meta)).rejects.toThrow(
        new AppError('권한 목록 조회 중 오류가 발생했습니다.', 500),
      );
    });

    it('createPermissionS에서 AppError가 아닌 다른 에러가 발생했을 때 500 에러로 변환되어야 함', async () => {
      (findPermissionByName as jest.Mock).mockResolvedValue(null);
      (insertPermission as jest.Mock).mockRejectedValue(new Error('Custom insert error'));

      await expect(createPermissionS(mockCreatePermission, meta)).rejects.toThrow(
        new AppError('권한 생성 중 오류가 발생했습니다.', 500),
      );
    });
  });

  describe('에러 케이스 테스트', () => {
    it('getPermissionsS에서 예외 발생 시 에러 처리', async () => {
      (findPermissions as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(
        getPermissionsS(
          { page: 1, pageSize: 10, total: 0, totalPages: 0 },
          { managerNo: 1, ip: '127.0.0.1', userAgent: 'test', schoolNo: 1 },
        ),
      ).rejects.toThrow('권한 목록 조회 중 오류가 발생했습니다.');
    });

    it('createPermissionS에서 트랜잭션 롤백 테스트', async () => {
      (insertPermission as jest.Mock).mockRejectedValue(new Error('Insert failed'));

      await expect(
        createPermissionS(
          { name: 'Test Permission', description: 'Test', defaultExtraCondition: '', defaultExtraLimit: '0' },
          { managerNo: 1, ip: '127.0.0.1', userAgent: 'test', schoolNo: 1 },
        ),
      ).rejects.toThrow('권한 생성 중 오류가 발생했습니다.');

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('updatePermissionS에서 트랜잭션 롤백 테스트', async () => {
      (findPermission as jest.Mock).mockResolvedValue({
        permissionNo: 1,
        name: 'old_permission',
        description: '기존 권한',
        defaultExtraCondition: 'old_condition',
        defaultExtraLimit: '50',
      });
      (updatePermission as jest.Mock).mockRejectedValue(new Error('Update failed'));

      await expect(
        updatePermissionS(
          {
            permissionNo: 1,
            name: 'Updated Permission',
            description: 'Updated',
            defaultExtraCondition: '',
            defaultExtraLimit: '0',
          },
          { managerNo: 1, ip: '127.0.0.1', userAgent: 'test', schoolNo: 1 },
        ),
      ).rejects.toThrow('권한 수정 중 오류가 발생했습니다.');

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('deletePermissionS에서 트랜잭션 롤백 테스트', async () => {
      (findPermission as jest.Mock).mockResolvedValue({
        permissionNo: 1,
        name: 'test_permission',
        description: '테스트 권한',
        defaultExtraCondition: 'condition',
        defaultExtraLimit: '100',
      });
      (deletePermission as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      await expect(
        deletePermissionS(1, { managerNo: 1, ip: '127.0.0.1', userAgent: 'test', schoolNo: 1 }),
      ).rejects.toThrow('권한 삭제 중 오류가 발생했습니다.');

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('conn.release() 실패 시 에러 처리 테스트', async () => {
      const mockConnWithReleaseError = {
        release: jest.fn().mockRejectedValue(new Error('Release failed')),
      };
      (beginTransaction as jest.Mock).mockResolvedValue(mockConnWithReleaseError);
      (insertPermission as jest.Mock).mockRejectedValue(new Error('Insert failed'));
      (rollbackTransaction as jest.Mock).mockImplementation(async () => {
        await mockConnWithReleaseError.release();
      });

      await expect(
        createPermissionS(
          { name: 'Test Permission', description: 'Test', defaultExtraCondition: '', defaultExtraLimit: '0' },
          { managerNo: 1, ip: '127.0.0.1', userAgent: 'test', schoolNo: 1 },
        ),
      ).rejects.toThrow('권한 생성 중 오류가 발생했습니다.');

      expect(mockConnWithReleaseError.release).toHaveBeenCalled();
    });

    it('createPermissionS에서 beginTransaction 실패 시 conn이 undefined인 경우 처리', async () => {
      (beginTransaction as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      await expect(
        createPermissionS(
          { name: 'Test Permission', description: 'Test', defaultExtraCondition: '', defaultExtraLimit: '0' },
          { managerNo: 1, ip: '127.0.0.1', userAgent: 'test', schoolNo: 1 },
        ),
      ).rejects.toThrow('권한 생성 중 오류가 발생했습니다.');

      expect(rollbackTransaction).not.toHaveBeenCalled();
    });

    it('updatePermissionS에서 beginTransaction 실패 시 conn이 undefined인 경우 처리', async () => {
      (beginTransaction as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      await expect(
        updatePermissionS(
          {
            permissionNo: 1,
            name: 'Updated Permission',
            description: 'Updated',
            defaultExtraCondition: '',
            defaultExtraLimit: '0',
          },
          { managerNo: 1, ip: '127.0.0.1', userAgent: 'test', schoolNo: 1 },
        ),
      ).rejects.toThrow('권한 수정 중 오류가 발생했습니다.');

      expect(rollbackTransaction).not.toHaveBeenCalled();
    });

    it('deletePermissionS에서 beginTransaction 실패 시 conn이 undefined인 경우 처리', async () => {
      (beginTransaction as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      await expect(
        deletePermissionS(1, { managerNo: 1, ip: '127.0.0.1', userAgent: 'test', schoolNo: 1 }),
      ).rejects.toThrow('권한 삭제 중 오류가 발생했습니다.');

      expect(rollbackTransaction).not.toHaveBeenCalled();
    });

    it('createPermissionS에서 insertPermission 실패 후 rollbackTransaction 실패 시 처리', async () => {
      (findPermissionByName as jest.Mock).mockResolvedValue(null);
      (insertPermission as jest.Mock).mockRejectedValue(new Error('Insert failed'));
      (rollbackTransaction as jest.Mock).mockRejectedValue(new Error('Rollback failed'));

      await expect(
        createPermissionS(
          { name: 'Test Permission', description: 'Test', defaultExtraCondition: '', defaultExtraLimit: '0' },
          { managerNo: 1, ip: '127.0.0.1', userAgent: 'test', schoolNo: 1 },
        ),
      ).rejects.toThrow('권한 생성 중 오류가 발생했습니다.');

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('updatePermissionS에서 updatePermission 실패 후 rollbackTransaction 실패 시 처리', async () => {
      (findPermission as jest.Mock).mockResolvedValue({
        permissionNo: 1,
        name: 'old_permission',
        description: '기존 권한',
        defaultExtraCondition: 'old_condition',
        defaultExtraLimit: '50',
      });
      (updatePermission as jest.Mock).mockRejectedValue(new Error('Update failed'));
      (rollbackTransaction as jest.Mock).mockRejectedValue(new Error('Rollback failed'));

      await expect(
        updatePermissionS(
          {
            permissionNo: 1,
            name: 'Updated Permission',
            description: 'Updated',
            defaultExtraCondition: '',
            defaultExtraLimit: '0',
          },
          { managerNo: 1, ip: '127.0.0.1', userAgent: 'test', schoolNo: 1 },
        ),
      ).rejects.toThrow('권한 수정 중 오류가 발생했습니다.');

      expect(rollbackTransaction).toHaveBeenCalled();
    });

    it('deletePermissionS에서 deletePermission 실패 후 rollbackTransaction 실패 시 처리', async () => {
      (findPermission as jest.Mock).mockResolvedValue({
        permissionNo: 1,
        name: 'test_permission',
        description: '테스트 권한',
        defaultExtraCondition: 'condition',
        defaultExtraLimit: '100',
      });
      (deletePermission as jest.Mock).mockRejectedValue(new Error('Delete failed'));
      (rollbackTransaction as jest.Mock).mockRejectedValue(new Error('Rollback failed'));

      await expect(
        deletePermissionS(1, { managerNo: 1, ip: '127.0.0.1', userAgent: 'test', schoolNo: 1 }),
      ).rejects.toThrow('권한 삭제 중 오류가 발생했습니다.');

      expect(rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('로그 기록 테스트', () => {
    it('권한 생성 시 로그가 올바르게 기록되어야 함', async () => {
      const insertResult = { insertId: 1 };

      (findPermissionByName as jest.Mock).mockResolvedValue(null);
      (insertPermission as jest.Mock).mockResolvedValue(insertResult);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      await createPermissionS(mockCreatePermission, meta);

      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'I',
        targetTable: 'permission',
        targetId: '1',
        oldValues: JSON.stringify({}),
        newValues: JSON.stringify(mockCreatePermission),
        reason: `권한 생성: ${mockCreatePermission.name}`,
      });
      expect(logAction).toHaveBeenCalledWith({}, mockConn);
    });

    it('권한 수정 시 로그가 올바르게 기록되어야 함', async () => {
      const existingPermission = {
        permissionNo: 1,
        name: 'old_permission',
        description: '기존 권한',
        defaultExtraCondition: 'old_condition',
        defaultExtraLimit: '50',
      };

      (findPermission as jest.Mock).mockResolvedValue(existingPermission);
      (updatePermission as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      await updatePermissionS(mockUpdatePermission, meta);

      expect(makeLogParams).toHaveBeenCalledWith({
        ...meta,
        actionType: 'U',
        targetTable: 'permission',
        targetId: '1',
        oldValues: JSON.stringify(existingPermission),
        newValues: JSON.stringify(mockUpdatePermission),
        reason: `권한 수정: ${mockUpdatePermission.name}`,
      });
      expect(logAction).toHaveBeenCalledWith({}, mockConn);
    });

    it('권한 삭제 시 로그가 올바르게 기록되어야 함', async () => {
      const existingPermission = {
        permissionNo: 1,
        name: 'test_permission',
        description: '테스트 권한',
        defaultExtraCondition: 'condition',
        defaultExtraLimit: '100',
      };

      (findPermission as jest.Mock).mockResolvedValue(existingPermission);
      (deletePermission as jest.Mock).mockResolvedValue(undefined);
      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      await deletePermissionS(1, meta);

      expect(makeLogParams).toHaveBeenCalledWith({
        ...meta,
        actionType: 'D',
        targetTable: 'permission',
        targetId: '1',
        oldValues: JSON.stringify(existingPermission),
        newValues: null,
        reason: `권한 삭제: ${existingPermission.name}`,
      });
      expect(logAction).toHaveBeenCalledWith({}, mockConn);
    });
  });
});

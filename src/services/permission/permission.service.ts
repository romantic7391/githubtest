import { Permission, Group, ManagerGroup, GroupPermission } from '@/types/permission';
import {
  findPermissionByName,
  findPermissionByNo,
  findGroupByGroupNo,
  findGroupsBySchoolNo,
  findManagerGroups,
  findGroupPermissions,
  findGroupPermission,
  insertPermission,
  insertGroupPermission,
  deleteGroupPermission,
  insertManagerGroup,
  deleteManagerGroup,
} from '@/models/permission/permission.model';

/**
 * 사용자의 권한 체크
 */
export async function checkPermission(managerNo: number, permissionName: string, schoolNo?: number): Promise<boolean> {
  try {
    // 1. 권한 정보 조회
    const permission = await findPermissionByName(permissionName);
    if (!permission) return false;

    // 2. 사용자의 그룹 정보 조회
    const managerGroups = await findManagerGroups(managerNo);

    // 3. 각 그룹의 권한 정보 확인
    for (const managerGroup of managerGroups) {
      const groupPermission = await findGroupPermission(managerGroup.group_no, permission.permission_no);
      if (!groupPermission) continue;
      // 권한이 허용된 경우
      if (groupPermission.is_allowed === 'Y') {
        // 학교 번호가 지정된 경우 추가 조건 확인
        if (schoolNo) {
          const group = await findGroupByGroupNo(managerGroup.group_no);
          if (!group) continue;
          // 같은 학교의 그룹인 경우에만 권한 허용
          if (group.school_no === schoolNo) {
            return true;
          }
        } else {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('[checkPermission] 권한 체크 중 오류 발생:', error);
    return false;
  }
}

/**
 * 사용자의 모든 권한 조회
 */
export async function getManagerPermissions(managerNo: number, schoolNo?: number): Promise<Permission[]> {
  try {
    const permissions: Permission[] = [];
    const managerGroups = await findManagerGroups(managerNo);

    for (const managerGroup of managerGroups) {
      const groupPermissions = await findGroupPermissions(managerGroup.group_no);
      for (const groupPermission of groupPermissions) {
        if (groupPermission.is_allowed === 'Y') {
          const permission = await findPermissionByNo(groupPermission.permission_no);
          if (!permission) continue;
          // 학교 번호가 지정된 경우 추가 조건 확인
          if (schoolNo) {
            const group = await findGroupByGroupNo(managerGroup.group_no);
            if (!group) continue;
            if (group.school_no === schoolNo) {
              permissions.push(permission);
            }
          } else {
            permissions.push(permission);
          }
        }
      }
    }

    return permissions;
  } catch (error) {
    console.error('[getManagerPermissions] 권한 조회 중 오류 발생:', error);
    return [];
  }
}

/**
 * 권한 이름으로 권한 정보 조회
 */
export async function getPermissionByName(name: string): Promise<Permission> {
  const permission = await findPermissionByName(name);
  if (!permission) {
    throw new Error('권한을 찾을 수 없습니다.');
  }
  return permission;
}

/**
 * 권한 번호로 권한 정보 조회
 */
export async function getPermissionByNo(permissionNo: number): Promise<Permission> {
  const permission = await findPermissionByNo(permissionNo);
  if (!permission) {
    throw new Error('권한을 찾을 수 없습니다.');
  }
  return permission;
}

/**
 * 그룹 번호로 그룹 정보 조회
 */
export async function getGroupByGroupNo(groupNo: number): Promise<Group> {
  const group = await findGroupByGroupNo(groupNo);
  if (!group) {
    throw new Error('그룹을 찾을 수 없습니다.');
  }
  return group;
}

/**
 * 학교 번호로 그룹 목록 조회
 */
export async function getGroupsBySchoolNo(schoolNo: number): Promise<Group[]> {
  return findGroupsBySchoolNo(schoolNo);
}

/**
 * 사용자의 그룹 목록 조회
 */
export async function getManagerGroups(managerNo: number): Promise<ManagerGroup[]> {
  return findManagerGroups(managerNo);
}

/**
 * 그룹의 권한 목록 조회
 */
export async function getGroupPermissions(groupNo: number): Promise<GroupPermission[]> {
  return findGroupPermissions(groupNo);
}

/**
 * 그룹의 특정 권한 정보 조회
 */
export async function getGroupPermission(groupNo: number, permissionNo: number): Promise<GroupPermission> {
  const permission = await findGroupPermission(groupNo, permissionNo);
  if (!permission) {
    throw new Error('그룹 권한을 찾을 수 없습니다.');
  }
  return permission;
}

/**
 * 새로운 권한 생성
 */
export async function createPermission(
  name: string,
  description: string,
  defaultExtraCondition: string | null,
  defaultExtraLimit: string | null,
): Promise<number> {
  return insertPermission(name, description, defaultExtraCondition, defaultExtraLimit);
}

/**
 * 그룹에 권한 부여
 */
export async function grantPermissionToGroup(
  groupNo: number,
  permissionNo: number,
  isAllowed: 'Y' | 'N',
  extraCondition: string | null,
  extraLimit: string | null,
): Promise<void> {
  await insertGroupPermission(groupNo, permissionNo, isAllowed, extraCondition, extraLimit);
}

/**
 * 그룹에서 권한 제거
 */
export async function revokePermissionFromGroup(groupNo: number, permissionNo: number): Promise<void> {
  await deleteGroupPermission(groupNo, permissionNo);
}

/**
 * 사용자를 그룹에 추가
 */
export async function addManagerToGroup(groupNo: number, managerNo: number): Promise<void> {
  await insertManagerGroup(groupNo, managerNo);
}

/**
 * 사용자를 그룹에서 제거
 */
export async function removeManagerFromGroup(groupNo: number, managerNo: number): Promise<void> {
  await deleteManagerGroup(groupNo, managerNo);
}

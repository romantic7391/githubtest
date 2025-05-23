import { exec, getRow, getAll } from '@/lib/mariadb/query';
import { Permission, Group, ManagerGroup, GroupPermission } from '@/types/permission';

/**
 * 권한 정보 조회
 */
export async function findPermissionByName(name: string): Promise<Permission | null> {
  const query = `
    SELECT 
      permission_no,
      name,
      description,
      default_extra_condition,
      default_extra_limit
    FROM permission
    WHERE name = ? AND deleted IS NULL
  `;
  return getRow<Permission>(query, [name]);
}

/**
 * 권한 번호로 권한 정보 조회
 */
export async function findPermissionByNo(permissionNo: number): Promise<Permission | null> {
  const query = `
    SELECT 
      permission_no,
      name,
      description,
      default_extra_condition,
      default_extra_limit
    FROM permission
    WHERE permission_no = ? AND deleted IS NULL
  `;
  return getRow<Permission>(query, [permissionNo]);
}

/**
 * 그룹 정보 조회
 */
export async function findGroupByGroupNo(groupNo: number): Promise<Group | null> {
  const query = `
    SELECT 
      group_no,
      school_no,
      name,
      parent_group_no
    FROM \`group\`
    WHERE group_no = ? AND deleted IS NULL
  `;
  return getRow<Group>(query, [groupNo]);
}

/**
 * 학교별 그룹 목록 조회
 */
export async function findGroupsBySchoolNo(schoolNo: number): Promise<Group[]> {
  const query = `
    SELECT 
      group_no,
      school_no,
      name,
      parent_group_no
    FROM \`group\`
    WHERE school_no = ? AND deleted IS NULL
  `;
  return getAll<Group>(query, [schoolNo]);
}

/**
 * 사용자의 그룹 정보 조회
 */
export async function findManagerGroups(managerNo: number): Promise<ManagerGroup[]> {
  const query = `
    SELECT 
      group_no,
      no
    FROM managerGroup
    WHERE no = ? AND deleted IS NULL
  `;
  return getAll<ManagerGroup>(query, [managerNo]);
}

/**
 * 그룹의 권한 정보 조회
 */
export async function findGroupPermissions(groupNo: number): Promise<GroupPermission[]> {
  const query = `
    SELECT 
      group_no,
      permission_no,
      is_allowed,
      extra_condition,
      extra_limit
    FROM groupPermission
    WHERE group_no = ? AND deleted IS NULL
  `;
  return getAll<GroupPermission>(query, [groupNo]);
}

/**
 * 그룹의 특정 권한 정보 조회
 */
export async function findGroupPermission(groupNo: number, permissionNo: number): Promise<GroupPermission | null> {
  const query = `
    SELECT 
      group_no,
      permission_no,
      is_allowed,
      extra_condition,
      extra_limit
    FROM groupPermission
    WHERE group_no = ? AND permission_no = ? AND deleted IS NULL
  `;
  return getRow<GroupPermission>(query, [groupNo, permissionNo]);
}
/**
 * 학교소속한 계층별 특정 권한 정보 조회
 */
export async function findGroupPermissionBySchoolNo(schoolNo: number): Promise<GroupPermission[]> {
  const query = `
    SELECT 
      g.group_no,
      g.name,
      g.parent_group_no,
      mg.no,
      gp.permission_no,
      gp.is_allowed,  
      gp.extra_condition,
      gp.extra_limit
    FROM \`group\` AS g 
    JOIN managerGroup AS mg ON g.group_no = mg.group_no
    JOIN groupPermission AS gp ON g.group_no = gp.group_no
    WHERE g.school_no = ?
  `;
  return getAll<GroupPermission>(query, [schoolNo]);
}

/**
 * 권한 생성
 */
export async function insertPermission(
  name: string,
  description: string,
  defaultExtraCondition: string | null,
  defaultExtraLimit: string | null,
): Promise<number> {
  const query = `
    INSERT INTO permission (
      name,
      description,
      default_extra_condition,
      default_extra_limit
    ) VALUES (?, ?, ?, ?)
  `;
  const result = await exec(query, [name, description, defaultExtraCondition, defaultExtraLimit]);
  return result.insertId;
}

/**
 * 그룹에 권한 부여
 */
export async function insertGroupPermission(
  groupNo: number,
  permissionNo: number,
  isAllowed: 'Y' | 'N',
  extraCondition: string | null,
  extraLimit: string | null,
): Promise<void> {
  const query = `
    INSERT INTO groupPermission (
      group_no,
      permission_no,
      is_allowed,
      extra_condition,
      extra_limit
    ) VALUES (?, ?, ?, ?, ?)
  `;
  await exec(query, [groupNo, permissionNo, isAllowed, extraCondition, extraLimit]);
}

/**
 * 그룹에서 권한 제거
 */
export async function deleteGroupPermission(groupNo: number, permissionNo: number): Promise<void> {
  const query = `
    UPDATE groupPermission
    SET deleted = CURRENT_TIMESTAMP
    WHERE group_no = ? AND permission_no = ?
  `;
  await exec(query, [groupNo, permissionNo]);
}

/**
 * 사용자를 그룹에 추가
 */
export async function insertManagerGroup(groupNo: number, managerNo: number): Promise<void> {
  const query = `
    INSERT INTO managerGroup (
      group_no,
      no
    ) VALUES (?, ?)
  `;
  await exec(query, [groupNo, managerNo]);
}

/**
 * 사용자를 그룹에서 제거
 */
export async function deleteManagerGroup(groupNo: number, managerNo: number): Promise<void> {
  const query = `
    UPDATE managerGroup
    SET deleted = CURRENT_TIMESTAMP
    WHERE group_no = ? AND no = ?
  `;
  await exec(query, [groupNo, managerNo]);
}

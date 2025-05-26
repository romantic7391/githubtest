import {
  findPermissionByName,
  findGroupByGroupNo,
  findManagerGroups,
  findGroupPermission,
  getPermissionStatusReport,
} from '@/models/permission/permission.model';

/**
 * [실시간 권한 체크] 계층 구조를 따라 Deny 우선, 조건 누적 권한 체크
 * @param managerNo 사용자 번호
 * @param schoolNo 학교 번호 (0: 모든 학교)
 * @param permissionName 권한 이름
 * @returns { allowed: boolean; extraCondition: string | null }
 */
export async function checkPermission(
  managerNo: number,
  schoolNo: number,
  permissionName: string,
): Promise<{ allowed: boolean; extraCondition: string | null }> {
  console.log('권한 체크 시작:', { managerNo, schoolNo, permissionName });

  // 1. 권한 번호 조회
  const permission = await findPermissionByName(permissionName);
  console.log('권한 정보:', permission);
  if (!permission) return { allowed: false, extraCondition: null };
  const permissionNo = permission.permission_no;

  // 2. 사용자가 속한 모든 그룹 조회
  const userGroups = await findManagerGroups(managerNo, schoolNo);
  console.log('사용자 그룹:', userGroups);

  // 3. 각 그룹별로 계층적으로 parent_group_no를 따라 올라가며 권한 체크
  for (const managerGroup of userGroups) {
    let currentGroupNo = managerGroup.group_no;
    let denyFound = false;
    let allowFound = false;
    const extraConditions: string[] = [];

    // 계층적으로 parent_group_no를 따라 올라감
    while (currentGroupNo) {
      const group = await findGroupByGroupNo(currentGroupNo);
      console.log('현재 그룹:', group);
      if (!group) break;

      // schoolNo가 0이 아닐 때만 학교 체크
      if (schoolNo !== 0 && group.school_no !== 0 && group.school_no !== schoolNo) {
        console.log('학교 번호 불일치:', { groupSchoolNo: group.school_no, requestSchoolNo: schoolNo });
        currentGroupNo = group.parent_group_no;
        continue;
      }

      const groupPermission = await findGroupPermission(currentGroupNo, permissionNo);
      console.log('그룹 권한:', groupPermission);
      if (groupPermission) {
        if (groupPermission.is_allowed === 'N') {
          denyFound = true;
          break; // Deny가 있으면 즉시 금지
        }
        if (groupPermission.is_allowed === 'Y') {
          allowFound = true;
          if (groupPermission.extra_condition) extraConditions.push(groupPermission.extra_condition);
        }
      }
      currentGroupNo = group.parent_group_no;
      if (!currentGroupNo || currentGroupNo === 0) break;
    }

    if (denyFound) return { allowed: false, extraCondition: null };
    if (allowFound) return { allowed: true, extraCondition: extraConditions.reverse().join(' AND ') };
  }

  console.log('권한 체크 실패: 모든 그룹에서 허용이 없음');
  return { allowed: false, extraCondition: null };
}

/**
 * [현황/리포트/관리용] 특정 권한 이름에 대해 전체 그룹/유저/학교의 권한 현황을 조회
 * (실시간 권한 체크와 분리된 용도)
 */
export { getPermissionStatusReport };

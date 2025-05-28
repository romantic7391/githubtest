import {
  findPermissionByName,
  findGroupByGroupNo,
  findManagerGroups,
  findGroupPermission,
  getPermissionStatusReport,
} from '@/models/permission/permission.model';
import { GroupPermissionSchema, PermissionSchema, GroupSchema, ManagerGroupSchema } from '@/types/permission';

/**
 * [실시간 권한 체크] 계층 구조를 따라 Deny 우선, 조건 누적 권한 체크
 * @param managerNo 사용자 번호
 * @param schoolNo 학교 번호 (0: 모든 학교)
 * @param permissionName 권한 이름
 * @returns { allowed: 'Y' | 'N'; override: 'Y' | 'N' | null; extraCondition: string | null }
 */
export async function checkPermission(
  managerNo: number,
  schoolNo: number,
  permissionName: string,
): Promise<{ allowed: 'Y' | 'N'; override: 'Y' | 'N' | null; extraCondition: string | null }> {
  console.log('권한 체크 시작:', { managerNo, schoolNo, permissionName });

  // 1. 권한 번호 조회
  const permission = await findPermissionByName(permissionName);
  console.log('권한 정보:', permission);
  if (!permission) return { allowed: 'N', override: null, extraCondition: null };

  // Zod로 권한 데이터 검증
  const validatedPermission = PermissionSchema.parse(permission);
  const permissionNo = validatedPermission.permission_no;

  // 2. 사용자가 속한 모든 그룹 조회
  const userGroups = await findManagerGroups(managerNo, schoolNo);
  console.log('사용자 그룹:', userGroups);

  // Zod로 그룹 데이터 검증
  const validatedGroups = userGroups.map((group) => ManagerGroupSchema.parse(group));

  // 3. 각 그룹별로 계층적으로 parent_group_no를 따라 올라가며 권한 체크
  let finalAllowed: 'Y' | 'N' = 'N';
  let finalOverride: 'Y' | 'N' | null = null;
  let finalExtraCondition: string | null = null;

  for (const managerGroup of validatedGroups) {
    let currentGroupNo = managerGroup.group_no;
    let denyFound = false;
    let allowFound = false;
    let overrideFound = false;
    const extraConditions: string[] = [];

    // 계층적으로 parent_group_no를 따라 올라감
    while (currentGroupNo) {
      const group = await findGroupByGroupNo(currentGroupNo);
      console.log('현재 그룹:', group);
      if (!group) break;

      // Zod로 그룹 데이터 검증
      const validatedGroup = GroupSchema.parse(group);

      // schoolNo가 0이 아닐 때만 학교 체크
      if (
        schoolNo !== 0 &&
        validatedGroup.school_no !== null &&
        validatedGroup.school_no !== 0 &&
        validatedGroup.school_no !== schoolNo
      ) {
        console.log('학교 번호 불일치:', { groupSchoolNo: validatedGroup.school_no, requestSchoolNo: schoolNo });
        currentGroupNo = validatedGroup.parent_group_no ?? 0;
        continue;
      }

      const groupPermission = await findGroupPermission(currentGroupNo, permissionNo);
      console.log('그룹 권한:', groupPermission);
      if (groupPermission) {
        // Zod로 그룹 권한 데이터 검증
        const validatedGroupPermission = GroupPermissionSchema.parse(groupPermission);

        if (validatedGroupPermission.is_allowed === 'N' && !overrideFound) {
          denyFound = true;
          break; // Deny가 있으면 즉시 금지 (override가 없을 경우)
        }
        if (validatedGroupPermission.is_allowed === 'Y') {
          allowFound = true;
          if (validatedGroupPermission.override === 'Y') {
            overrideFound = true;
          }
          if (validatedGroupPermission.extra_condition) {
            extraConditions.push(validatedGroupPermission.extra_condition);
          }
        }
      }
      currentGroupNo = validatedGroup.parent_group_no ?? 0;
      if (!currentGroupNo || currentGroupNo === 0) break;
    }

    if (denyFound && !overrideFound) {
      return { allowed: 'N', override: null, extraCondition: null };
    }

    if (allowFound) {
      finalAllowed = 'Y';
      if (overrideFound) {
        finalOverride = 'Y';
      }
      if (extraConditions.length > 0) {
        finalExtraCondition = extraConditions.reverse().join(' AND ');
      }
    }
  }

  console.log('권한 체크 결과:', { finalAllowed, finalOverride, finalExtraCondition });
  return { allowed: finalAllowed, override: finalOverride, extraCondition: finalExtraCondition };
}

/**
 * [현황/리포트/관리용] 특정 권한 이름에 대해 전체 그룹/유저/학교의 권한 현황을 조회
 * (실시간 권한 체크와 분리된 용도)
 */
export { getPermissionStatusReport };

/**
 * 여러 권한을 체크하는 함수
 */
export async function checkPermissions(
  managerNo: number,
  schoolNo: number,
  permissionNames: string[],
): Promise<{ allowed: 'Y' | 'N'; override: 'Y' | 'N' | null; extraCondition: string | null }> {
  // 권한이 하나만 있는 경우 바로 checkPermission 호출
  if (permissionNames.length === 1) {
    return checkPermission(managerNo, schoolNo, permissionNames[0]);
  }

  // 여러 권한이 있는 경우에만 반복문으로 체크
  let finalAllowed: 'Y' | 'N' = 'Y';
  let finalOverride: 'Y' | 'N' | null = null;
  let finalExtraCondition: string | null = null;

  for (const permissionName of permissionNames) {
    const result = await checkPermission(managerNo, schoolNo, permissionName);

    if (result.allowed === 'N') {
      finalAllowed = 'N';
      finalOverride = result.override;
      finalExtraCondition = result.extraCondition;
      break; // 하나라도 권한이 없으면 중단
    }
  }

  return { allowed: finalAllowed, override: finalOverride, extraCondition: finalExtraCondition };
}

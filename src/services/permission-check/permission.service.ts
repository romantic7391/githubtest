import {
  findPermissionByName,
  findGroupByGroupNo,
  findManagerGroups,
  findGroupPermission,
  getPermissionStatusReport,
} from '@/models/permission/permission.model';
import { groupPermissionSchema, groupSchema, managerGroupSchema } from '@/types/permission';
import { getSchoolBySchoolNo } from '@/services/areas/[area]/schools/[schoolNo]/[schoolNo].service';

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

  // 1. 사용자의 학교 정보 조회 (한 번만 조회)
  const userSchool = await getSchoolBySchoolNo(schoolNo, {
    manager_no: managerNo,
    ip: '',
    user_agent: '',
  });

  if (!userSchool || !userSchool.area) {
    console.log('사용자의 학교 정보를 찾을 수 없거나 지역 정보가 없음');
    return { allowed: 'N', override: null, extraCondition: null };
  }

  // 2. 권한 번호 조회
  const permission = await findPermissionByName(permissionName);
  if (!permission) {
    console.log('권한 정보를 찾을 수 없음:', permissionName);
    return { allowed: 'N', override: null, extraCondition: null };
  }

  // 3. school_no가 0인 경우 URL 체크는 무시
  const isAdminSchool = userSchool.schoolNo === 0;
  if (isAdminSchool) {
    console.log('전체 접근 가능 학교(school_no: 0) - URL 체크 무시');
  }

  // 4. 사용자가 속한 그룹 조회 (현재 학교만)
  const userGroups = await findManagerGroups(managerNo, schoolNo);
  console.log('현재 학교 그룹:', userGroups);

  // 5. 상위 기관이 있는 경우에만 상위 기관 그룹 조회
  if (userSchool.parentNo) {
    const upperGroups = await findManagerGroups(managerNo, userSchool.parentNo);
    userGroups.push(...upperGroups);
    console.log('상위 기관 그룹:', upperGroups);

    // 상위상위 기관이 있는 경우에만 조회
    const upperSchool = await getSchoolBySchoolNo(userSchool.parentNo, {
      manager_no: managerNo,
      ip: '',
      user_agent: '',
    });
    if (upperSchool?.parentNo) {
      const upperUpperGroups = await findManagerGroups(managerNo, upperSchool.parentNo);
      userGroups.push(...upperUpperGroups);
      console.log('상위상위 기관 그룹:', upperUpperGroups);
    }
  }

  // 6. 각 그룹별로 권한 체크
  const validatedGroups = userGroups.map((group) => managerGroupSchema.parse(group));
  console.log('검증된 그룹 목록:', validatedGroups);

  for (const managerGroup of validatedGroups) {
    let currentGroupNo = managerGroup.group_no;
    let allowFound = false;
    let overrideFound = false;
    const extraConditions: string[] = [];

    console.log('그룹 체크 시작:', { currentGroupNo });

    while (currentGroupNo) {
      const group = await findGroupByGroupNo(currentGroupNo);
      if (!group) break;

      const validatedGroup = groupSchema.parse(group);
      console.log('현재 체크 중인 그룹:', {
        groupNo: currentGroupNo,
        name: validatedGroup.name,
        parentGroupNo: validatedGroup.parent_group_no,
      });

      const groupPermission = await findGroupPermission(currentGroupNo, permission.permission_no);
      if (groupPermission) {
        const validatedGroupPermission = groupPermissionSchema.parse(groupPermission);
        console.log('그룹 권한 정보:', {
          groupNo: currentGroupNo,
          permissionNo: permission.permission_no,
          isAllowed: validatedGroupPermission.is_allowed,
          override: validatedGroupPermission.override,
        });

        // Deny 우선 원칙: N을 만나면 즉시 권한 거부
        if (validatedGroupPermission.is_allowed === 'N') {
          console.log('권한 거부 발견:', { groupNo: currentGroupNo });
          return { allowed: 'N', override: null, extraCondition: null };
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

    if (allowFound) {
      return {
        allowed: 'Y',
        override: overrideFound ? 'Y' : null,
        extraCondition: extraConditions.length > 0 ? extraConditions.reverse().join(' AND ') : null,
      };
    }
  }

  console.log('권한 없음');
  return { allowed: 'N', override: null, extraCondition: null };
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

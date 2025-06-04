import {
  findPermissionByName,
  findGroupByGroupNo,
  findManagerGroups,
  findGroupPermission,
  getPermissionStatusReport,
} from '@/models/permission/permission.model';
import { GroupPermissionSchema, PermissionSchema, GroupSchema, ManagerGroupSchema } from '@/types/permission';
import { getSchoolsByArea, getSchoolHierarchy } from '@/services/permission/school-permission.service';
import { School } from '@/types/school';

/**
 * 학교 번호로 학교 정보 조회
 */
async function findSchoolBySchoolNo(schoolNo: number): Promise<School | null> {
  const schools = await getSchoolsByArea('all'); // 모든 지역의 학교 조회
  return schools.find((s) => s.schoolNo === schoolNo) || null;
}

/**
 * 학교 계층 구조에 따른 권한 체크
 */
async function checkPermissionByHierarchy(
  managerNo: number,
  schoolHierarchy: {
    current: School;
    upper?: School;
    upperUpper?: School;
    lower?: School[];
  },
  permissionName: string,
): Promise<{ allowed: 'Y' | 'N'; override: 'Y' | 'N' | null; extraCondition: string | null }> {
  // 1. 권한 번호 조회
  const permission = await findPermissionByName(permissionName);
  if (!permission) return { allowed: 'N', override: null, extraCondition: null };

  // Zod로 권한 데이터 검증
  const validatedPermission = PermissionSchema.parse(permission);
  const permissionNo = validatedPermission.permissionNo;

  // 2. 사용자가 속한 모든 그룹 조회 (현재 학교와 상위 기관 모두 포함)
  const userGroups = await findManagerGroups(managerNo, schoolHierarchy.current.schoolNo);
  if (schoolHierarchy.upper) {
    const upperGroups = await findManagerGroups(managerNo, schoolHierarchy.upper.schoolNo);
    userGroups.push(...upperGroups);
  }
  if (schoolHierarchy.upperUpper) {
    const upperUpperGroups = await findManagerGroups(managerNo, schoolHierarchy.upperUpper.schoolNo);
    userGroups.push(...upperUpperGroups);
  }

  // Zod로 그룹 데이터 검증
  const validatedGroups = userGroups.map((group) => ManagerGroupSchema.parse(group));

  // 3. 각 그룹별로 계층적으로 parentGroupNo를 따라 올라가며 권한 체크
  let finalAllowed: 'Y' | 'N' = 'N';
  let finalOverride: 'Y' | 'N' | null = null;
  let finalExtraCondition: string | null = null;

  for (const managerGroup of validatedGroups) {
    let currentGroupNo = managerGroup.groupNo;
    let allowFound = false;
    let overrideFound = false;
    const extraConditions: string[] = [];

    // 계층적으로 parentGroupNo를 따라 올라감
    while (currentGroupNo) {
      const group = await findGroupByGroupNo(currentGroupNo);
      if (!group) break;

      // Zod로 그룹 데이터 검증
      const validatedGroup = GroupSchema.parse(group);

      const groupPermission = await findGroupPermission(currentGroupNo, permissionNo);
      if (groupPermission) {
        // Zod로 그룹 권한 데이터 검증
        const validatedGroupPermission = GroupPermissionSchema.parse(groupPermission);

        // Deny 우선 원칙: N을 만나면 즉시 권한 거부
        if (validatedGroupPermission.isAllowed === 'N') {
          return { allowed: 'N', override: null, extraCondition: null };
        }
        if (validatedGroupPermission.isAllowed === 'Y') {
          allowFound = true;
          if (validatedGroupPermission.override === 'Y') {
            overrideFound = true;
          }
          if (validatedGroupPermission.extraCondition) {
            extraConditions.push(validatedGroupPermission.extraCondition);
          }
        }
      }
      currentGroupNo = validatedGroup.parentGroupNo ?? 0;
      if (!currentGroupNo || currentGroupNo === 0) break;
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

  return { allowed: finalAllowed, override: finalOverride, extraCondition: finalExtraCondition };
}

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

  // 1. 학교 정보 조회
  const school = await findSchoolBySchoolNo(schoolNo);
  if (!school || !school.area) return { allowed: 'N', override: null, extraCondition: null };

  // 2. 학교 계층 구조 조회
  const schoolHierarchy = await getSchoolHierarchy(school.area, schoolNo);
  if (!schoolHierarchy) return { allowed: 'N', override: null, extraCondition: null };

  // 3. 계층 구조에 따른 권한 체크
  return checkPermissionByHierarchy(managerNo, schoolHierarchy, permissionName);
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

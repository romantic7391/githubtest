import {
  findPermissionByName,
  findGroupByGroupNo,
  findManagerGroups,
  findGroupPermission,
  getPermissionStatusReport,
} from '@/models/permission/permission.model';
import { GroupPermissionSchema, PermissionSchema, GroupSchema, ManagerGroupSchema } from '@/types/permission';
import { getSchoolHierarchy } from '@/services/permission/school-permission.service';
import { School } from '@/types/school';

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
  console.log('권한 체크 계층 구조:', {
    current: schoolHierarchy.current.schoolNo,
    upper: schoolHierarchy.upper?.schoolNo,
    upperUpper: schoolHierarchy.upperUpper?.schoolNo,
  });

  // 1. 권한 번호 조회
  const permission = await findPermissionByName(permissionName);
  if (!permission) return { allowed: 'N', override: null, extraCondition: null };

  // Zod로 권한 데이터 검증
  const validatedPermission = PermissionSchema.parse(permission);
  const permissionNo = validatedPermission.permission_no;
  console.log('권한 정보:', { permissionName, permissionNo });

  // 2. 사용자가 속한 모든 그룹 조회 (현재 학교와 상위 기관 모두 포함)
  const userGroups = await findManagerGroups(managerNo, schoolHierarchy.current.schoolNo);
  console.log('현재 학교 그룹:', userGroups);

  if (schoolHierarchy.upper) {
    const upperGroups = await findManagerGroups(managerNo, schoolHierarchy.upper.schoolNo);
    userGroups.push(...upperGroups);
    console.log('상위 기관 그룹:', upperGroups);
  }
  if (schoolHierarchy.upperUpper) {
    const upperUpperGroups = await findManagerGroups(managerNo, schoolHierarchy.upperUpper.schoolNo);
    userGroups.push(...upperUpperGroups);
    console.log('상위상위 기관 그룹:', upperUpperGroups);
  }

  // Zod로 그룹 데이터 검증
  const validatedGroups = userGroups.map((group) => ManagerGroupSchema.parse(group));
  console.log('검증된 그룹 목록:', validatedGroups);

  // 3. 각 그룹별로 계층적으로 parentGroupNo를 따라 올라가며 권한 체크
  let finalAllowed: 'Y' | 'N' = 'N';
  let finalOverride: 'Y' | 'N' | null = null;
  let finalExtraCondition: string | null = null;

  for (const managerGroup of validatedGroups) {
    let currentGroupNo = managerGroup.group_no;
    let allowFound = false;
    let overrideFound = false;
    const extraConditions: string[] = [];

    console.log('그룹 체크 시작:', { currentGroupNo });

    // 계층적으로 parentGroupNo를 따라 올라감
    while (currentGroupNo) {
      const group = await findGroupByGroupNo(currentGroupNo);
      if (!group) break;

      // Zod로 그룹 데이터 검증
      const validatedGroup = GroupSchema.parse(group);
      console.log('현재 체크 중인 그룹:', {
        groupNo: currentGroupNo,
        name: validatedGroup.name,
        parentGroupNo: validatedGroup.parent_group_no,
      });

      const groupPermission = await findGroupPermission(currentGroupNo, permissionNo);
      if (groupPermission) {
        // Zod로 그룹 권한 데이터 검증
        const validatedGroupPermission = GroupPermissionSchema.parse(groupPermission);
        console.log('그룹 권한 정보:', {
          groupNo: currentGroupNo,
          permissionNo,
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
      finalAllowed = 'Y';
      if (overrideFound) {
        finalOverride = 'Y';
      }
      if (extraConditions.length > 0) {
        finalExtraCondition = extraConditions.reverse().join(' AND ');
      }
    }
  }

  console.log('최종 권한 체크 결과:', { finalAllowed, finalOverride, finalExtraCondition });
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

  // 1. 학교 계층 구조 조회 (한 번에 모든 정보를 가져옴)
  const schoolHierarchy = await getSchoolHierarchy('all', schoolNo);
  console.log('학교 계층 구조 조회 결과:', schoolHierarchy);
  if (!schoolHierarchy) {
    console.log('학교 계층 구조 없음');
    return { allowed: 'N', override: null, extraCondition: null };
  }

  // 2. 계층 구조에 따른 권한 체크
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

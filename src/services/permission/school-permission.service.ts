import { checkPermission } from './permission.service';

/**
 * 학교 관련 권한 체크
 * @param managerNo 사용자 번호
 * @param schoolNo 학교 번호
 * @param permissionName 권한 이름
 * @returns { allowed: boolean; override: boolean }
 */
export async function checkSchoolPermission(
  managerNo: number,
  schoolNo: number,
  permissionName: string,
): Promise<{ allowed: boolean; override: boolean }> {
  const { allowed, override } = await checkPermission(managerNo, schoolNo, permissionName);
  return { allowed, override };
}

/**
 * 학교 관련 권한 상태 조회
 * @param managerNo 사용자 번호
 * @param schoolNo 학교 번호
 * @param permissionName 권한 이름
 * @returns 권한 상태 정보
 */
export async function getSchoolPermissionStatus(managerNo: number, schoolNo: number, permissionName: string) {
  const { allowed, override, extraCondition } = await checkPermission(managerNo, schoolNo, permissionName);
  return {
    allowed,
    override,
    extraCondition,
  };
}

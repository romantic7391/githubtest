import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/middleware/permission.middleware';

/**
 * 학교 관련 권한 체크
 */
export async function checkSchoolPermission(
  req: NextRequest,
  schoolNo: number,
  action: '조회' | '수정' | '삭제',
): Promise<NextResponse | null> {
  const permissionName = `학교_${action}`;
  return withPermission(req, permissionName, schoolNo);
}

/**
 * 센서 관련 권한 체크
 */
export async function checkSensorPermission(
  req: NextRequest,
  schoolNo: number,
  action: '조회' | '수정' | '삭제',
): Promise<NextResponse | null> {
  const permissionName = `센서_${action}`;
  return withPermission(req, permissionName, schoolNo);
}

/**
 * 사용자 관련 권한 체크
 */
export async function checkUserPermission(
  req: NextRequest,
  schoolNo: number,
  action: '조회' | '수정' | '삭제',
): Promise<NextResponse | null> {
  const permissionName = `사용자_${action}`;
  return withPermission(req, permissionName, schoolNo);
}

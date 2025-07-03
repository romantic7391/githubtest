import { exec, getRow, getAll } from '@/lib/mariadb/query';
import {
  School,
  SchoolCreate,
  existsRnSchoolByScodeDto,
  existsRnSchoolByAdministrationCodeDto,
  getRnSchoolByScodeDto,
  findRnSchoolsByAreasDto,
  findSchoolBySchoolNoDto,
  updateRnSchoolDto,
  deleteRnSchoolDto,
} from '@/types/school';
import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import type { PoolConnection } from 'mariadb';
import { AppError } from '@/utils/error.utils';

// 학교 존재 여부 확인(존재하면 true, 없으면 false)
export async function existsRnSchoolByScode(dto: existsRnSchoolByScodeDto): Promise<boolean> {
  try {
    const query = `
      SELECT 1 
      FROM rnSchool
      WHERE scode = ?
      LIMIT 1
    `;
    const row = await getRow(query, [dto.scode]);
    return !!row;
  } catch (error) {
    console.error('학교 코드 존재 여부 확인 중 오류 발생:', error);
    throw new AppError('학교 코드 존재 여부 확인 중 오류가 발생했습니다.', 500);
  }
}

// DB의 administrationcode로 학교 존재 여부 확인(존재하면 true, 없으면 false)
export async function existsRnSchoolByAdministrationCode(dto: existsRnSchoolByAdministrationCodeDto): Promise<boolean> {
  try {
    const query = `
      SELECT 1 
      FROM rnSchool
      WHERE administrationcode = ?
      LIMIT 1
    `;
    const row = await getRow(query, [dto.administrationCode]);
    return !!row;
  } catch (error) {
    console.error('행정코드 존재 여부 확인 중 오류 발생:', error);
    throw new AppError('행정코드 존재 여부 확인 중 오류가 발생했습니다.', 500);
  }
}

// 학교 정보 읽기(조회)
export async function getRnSchoolByScode(dto: getRnSchoolByScodeDto): Promise<Record<string, unknown> | null> {
  try {
    const query = `
      SELECT * 
      FROM rnSchool
      WHERE scode = ?
    `;
    return getRow(query, [dto.scode]);
  } catch (error) {
    console.error('학교 정보 조회 중 오류 발생:', error);
    throw new AppError('학교 정보 조회 중 오류가 발생했습니다.', 500);
  }
}

// 지역의 학교 목록
export async function findRnSchoolsByArea(
  area: string,
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
  filters?: {
    sname?: string;
    scode?: string;
    useOrderSheet?: 'Y' | 'N';
    active?: 'Y' | 'N';
    administrationCode?: string;
  },
): Promise<{ schools: School[]; total: number }> {
  try {
    const offset = (page - 1) * pageSize;

    // WHERE 절 조건 생성
    const conditions = ['1=1']; // 기본 조건
    const params: (string | number)[] = [];

    if (area !== 'all') {
      conditions.push('rs.area = ?');
      params.push(area);
    }

    if (filters?.sname) {
      conditions.push('rs.sname LIKE ?');
      params.push(`%${filters.sname}%`);
    }

    if (filters?.scode) {
      conditions.push('rs.scode LIKE ?');
      params.push(`%${filters.scode}%`);
    }

    if (filters?.useOrderSheet) {
      conditions.push('rs.use_os = ?');
      params.push(filters.useOrderSheet);
    }

    if (filters?.active) {
      conditions.push('rs.active = ?');
      params.push(filters.active);
    }

    if (filters?.administrationCode) {
      conditions.push('rs.administrationcode = ?');
      params.push(filters.administrationCode);
    }

    // 전체 개수 조회
    const countQuery = `
      SELECT COUNT(*) as total
      FROM rnSchool as rs
      WHERE ${conditions.join(' AND ')}
    `;
    const totalResult = await getRow<{ total: number }>(countQuery, params);
    const total = totalResult?.total || 0;

    // 학교 목록 조회
    const query = `
      SELECT 
        rs.school_no AS schoolNo,
        rs.sname,
        rs.scode,
        rs.area,
        rs.modbus,
        rs.modbus_host AS modbusHost,
        rs.modbus_port AS modbusPort,
        rs.use_os AS useOrderSheet,
        rs.active,
        rs.administrationcode AS administrationCode,
        rs.created
      FROM rnSchool as rs
      WHERE ${conditions.join(' AND ')}
      ORDER BY rs.school_no ASC
      LIMIT ? OFFSET ?
    `;

    const schools = await getAll<School>(query, [...params, pageSize, offset]);

    return { schools, total };
  } catch (error) {
    console.error('학교 목록 조회 중 오류 발생:', error);
    throw new AppError('학교 목록 조회 중 오류가 발생했습니다.', 500);
  }
}

// 지역별 학교 조회
export async function findRnSchoolsByAreas(dto: findRnSchoolsByAreasDto): Promise<School[]> {
  try {
    const query = `
      SELECT 
        rs.school_no AS schoolNo,
        rs.sname,
        rs.scode,
        rs.area,
        rs.modbus,
        rs.modbus_host AS modbusHost,
        rs.modbus_port AS modbusPort,
        rs.use_os AS useOrderSheet,
        rs.active,
        rs.administrationcode AS administrationCode,
        rs.created,
        rs.parent_no AS parentNo
      FROM rnSchool AS rs
      WHERE rs.area = ?
    `;
    const params = [dto.area];
    console.log('실행할 쿼리:', query);
    console.log('파라미터:', params);
    const result = await getAll<School>(query, params);
    console.log('쿼리 결과:', result);
    return result;
  } catch (error) {
    console.error('지역별 학교 조회 중 오류 발생:', error);
    throw new AppError('지역별 학교 조회 중 오류가 발생했습니다.', 500);
  }
}

// 학교별 내용 조회
export async function findSchoolBySchoolNo(dto: findSchoolBySchoolNoDto): Promise<School | null> {
  try {
    const query = `
      SELECT 
        rs.school_no AS schoolNo,
        rs.sname,
        rs.scode,
        rs.area,
        rs.modbus,
        rs.modbus_host AS modbusHost,
        rs.modbus_port AS modbusPort,
        rs.use_os AS useOrderSheet,
        rs.active,
        rs.administrationcode AS administrationCode,
        rs.created,
        rs.parent_no AS parentNo
      FROM rnSchool AS rs
      WHERE rs.school_no = ?
      LIMIT 1;
    `;
    console.log('실행할 쿼리:', query);
    console.log('파라미터:', dto.schoolNo);
    const result = await getRow<School>(query, [dto.schoolNo]);
    console.log('쿼리 결과:', result);
    return result;
  } catch (error) {
    console.error('학교 정보 조회 중 오류 발생:', error);
    throw new AppError('학교 정보 조회 중 오류가 발생했습니다.', 500);
  }
}

// 2. 등록 (Create)
export async function insertRnSchool(dto: SchoolCreate) {
  try {
    const query = `
      INSERT INTO rnSchool
      (sname, scode, area, modbus, modbus_host, modbus_port, use_os, parent_no, administrationcode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      dto.sname,
      dto.scode,
      dto.area,
      dto.modbus,
      dto.modbusHost,
      dto.modbusPort,
      dto.useOrderSheet,
      dto.parentNo,
      dto.administrationCode,
    ];
    const result = await exec(query, params);
    return result.insertId;
  } catch (error) {
    console.error('학교 등록 중 오류 발생:', error);
    throw new AppError('학교 등록 중 오류가 발생했습니다.', 500);
  }
}

// 3. 수정 (Update)
export async function updateRnSchool(dto: updateRnSchoolDto, conn?: PoolConnection) {
  try {
    const query = `
      UPDATE rnSchool
      SET scode = ?, sname = ?, area = ?, administrationCode = ?
      WHERE school_no = ?
    `;
    const params = [dto.scode, dto.sname, dto.area, dto.administrationCode, dto.schoolNo];
    return exec(query, params, conn);
  } catch (error) {
    console.error('학교 정보 수정 중 오류 발생:', error);
    throw new AppError('학교 정보 수정 중 오류가 발생했습니다.', 500);
  }
}

// 4. 삭제 (Delete)
export async function deleteRnSchool(dto: deleteRnSchoolDto, conn?: PoolConnection) {
  try {
    const query = `DELETE FROM rnSchool WHERE school_no = ?`;
    return exec(query, [dto.schoolNo], conn);
  } catch (error) {
    console.error('학교 삭제 중 오류 발생:', error);
    throw new AppError('학교 삭제 중 오류가 발생했습니다.', 500);
  }
}

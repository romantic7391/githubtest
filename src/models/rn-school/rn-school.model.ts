import { exec, getRow, getAll } from '@/lib/mariadb/query';
import { School, SchoolCreate } from '@/types/school';
import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';

// 학교 존재 여부 확인(존재하면 true, 없으면 false)
export async function existsRnSchoolByScode(scode: string): Promise<boolean> {
  const query = `
    SELECT 1 
    FROM rnschool
    WHERE scode = ?
    LIMIT 1
  `;
  const row = await getRow(query, [scode]);
  return !!row;
}

// DB의 administrationcode로 학교 존재 여부 확인(존재하면 true, 없으면 false)
export async function existsRnSchoolByAdministrationCode(administrationcode: string): Promise<boolean> {
  const query = `
    SELECT 1 
    FROM rnschool
    WHERE administrationcode = ?
    LIMIT 1
  `;
  const row = await getRow(query, [administrationcode]);
  return !!row;
}

// 학교 정보 읽기(조회)
export async function getRnSchoolByScode(scode: string): Promise<Record<string, unknown> | null> {
  const query = `
    SELECT * 
    FROM rnschool
    WHERE scode = ?
  `;
  return getRow(query, [scode]);
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
    FROM rnschool as rs
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
    FROM rnschool as rs
    WHERE ${conditions.join(' AND ')}
    ORDER BY rs.school_no ASC
    LIMIT ? OFFSET ?
  `;

  const schools = await getAll<School>(query, [...params, pageSize, offset]);

  return { schools, total };
}

// 학교별 내용 조회
export async function findSchoolBySchoolNo(school_no: number): Promise<School> {
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
      FROM rnschool AS rs
      WHERE rs.school_no = ?
      LIMIT 1;
  `;
  const result = await getRow<School>(query, [school_no]);
  if (!result) {
    throw new Error(`학교 번호 ${school_no}에 해당하는 학교를 찾을 수 없습니다.`);
  }
  return result;
}

// 2. 등록 (Create)
export async function insertRnSchool(dto: SchoolCreate) {
  const query = `
    INSERT INTO rnschool
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
    dto.administrationCode,
  ];
  const result = await exec(query, params);
  return result.insertId;
}

// 3. 수정 (Update)
export async function updateRnSchool(dto: School) {
  const query = `
    UPDATE rnschool
    SET sname = ?, 
        scode = ?, 
        area = ?, 
        modbus = ?, 
        modbus_host = ?, 
        modbus_port = ?, 
        use_os = ?, 
        active = ?, 
        administrationcode = ?
    WHERE school_no = ?
  `;
  const params = [
    dto.sname,
    dto.scode,
    dto.area,
    dto.modbus,
    dto.modbusHost,
    dto.modbusPort,
    dto.useOrderSheet,
    dto.active,
    dto.administrationCode,
    dto.schoolNo,
  ];
  return exec(query, params);
}

// 4. 삭제 (Delete)
export async function deleteRnSchool(school_no: number) {
  const query = `
    DELETE FROM rnschool
    WHERE school_no = ?
  `;
  const params = [school_no];
  return exec(query, params);
}

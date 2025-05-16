import { exec, getRow } from '@/lib/mariadb/query';

import { insertRnSchoolDto, updateRnSchoolDto, deleteRnSchoolDto } from '@/interfaces/rn-school/rn-school.d';

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

// 1. 등록 (Create)
export async function insertRnSchool(dto: insertRnSchoolDto) {
  const query = `
    INSERT INTO rnschool
    (sname, scode, area, modbus, modbus_host, modbus_port, use_os , parent_id, administrationcode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    dto.sname,
    dto.scode,
    dto.area,
    dto.modbus,
    dto.modbus_host ?? null,
    dto.modbus_port ?? null,
    dto.use_os ?? null,
    dto.parent_id ?? null,
    dto.administrationcode ?? null,
  ];
  const result = await exec(query, params);
  return result.insertId;
}

// 2. 수정 (Update)
export async function updateRnSchool(dto: updateRnSchoolDto) {
  const query = `
    UPDATE rnschool
    SET sname = ?, scode = ?, area = ?, modbus = ?, modbus_host = ?, modbus_port = ?, use_os = ?, active = ?, parent_id = ?, administrationcode = ?
    WHERE school_no = ?
  `;
  const params = [
    dto.sname,
    dto.scode,
    dto.area,
    dto.modbus,
    dto.modbus_host ?? null,
    dto.modbus_port,
    dto.use_os ?? null,
    dto.active,
    dto.parent_id ?? null,
    dto.administrationcode ?? null,
    dto.school_no,
  ];
  return exec(query, params);
}

// 3. 삭제 (Delete)
export async function deleteRnSchool(dto: deleteRnSchoolDto) {
  const query = `
    DELETE FROM rnschool
    WHERE school_no = ?
  `;
  const params = [dto.school_no];
  return exec(query, params);
}

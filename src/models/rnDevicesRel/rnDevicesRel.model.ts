import { exec, getAll, getRow } from '@/lib/mariadb/query';
import type { PoolConnection } from 'mariadb';
import { updateDeviceMac } from '@/models/rnDevices/rnDevices.model';
import {
  findBySchoolNoVO,
  findRnDevicesRelBySchoolNoVO,
  insertRnDevicesRelDto,
  updateRnDevicesRelDto,
  softDeleteRnDevicesRelDto,
  UpdateMacDto,
} from '@/interfaces/rnDevicesRel/rnDevicesRel.d';

// 학교별 내용 조회
export async function findBySchoolNo(school_no: number): Promise<findBySchoolNoVO[]> {
  const query = `
      SELECT 
      rs.sname,
      rs.scode,
      rs.administrationcode,
      rs.area,
      rs.modbus,
      rs.modbus_host,
      rs.modbus_port,
      rs.use_os,
      rs.active,
      rs.parent_id
      FROM rnschool AS rs
      WHERE rs.school_no = ?;
  `;
  return await getAll<findBySchoolNoVO>(query, [school_no]);
}

// 학교별 센서 조회
export async function findRnDevicesRelBySchoolNo(params: {
  school_no: number;
  limit?: number;
  offset?: number;
}): Promise<findRnDevicesRelBySchoolNoVO[]> {
  const { school_no, limit = 10, offset = 0 } = params;
  const query = `
    SELECT 
      rdr.mac,
      rdr.name, 
      rdr.summary,
      rdr.kind,
      rdr.extra, 
      rdr.sdate, 
      rdr.edate,
      rdr.created AS rel_created,   
      rdr.updated AS rel_updated,  
      rd.model,
      rd.ip,
      rd.rip,
      rd.splrate,
      rd.interval,
      rd.ver,
      rd.tags,
      rd.checkin,
      rd.created AS device_created,   
      rd.updated AS device_updated  
    FROM rnDevicesRel AS rdr
    JOIN rnDevices AS rd ON rdr.mac = rd.mac
    WHERE rdr.school_no = ? 
    ORDER BY rdr.mac
    LIMIT ? OFFSET ?
  `;
  return await getAll<findRnDevicesRelBySchoolNoVO>(query, [school_no, limit, offset]);
}

//학교별 Rel센서 등록
export async function insertRnDevicesRel(
  dtos: insertRnDevicesRelDto[],
  conn?: PoolConnection,
): Promise<{ affectedRows: number; insertId?: number }> {
  const query = `
      INSERT INTO rnDevicesRel (school_no, mac, name, summary, kind, extra, sdate, edate)
    VALUES ${dtos.map(() => '(?, ?, ?, ?, ?, ?, ?,?)').join(', ')}
  `;
  const params = dtos.flatMap((dto) => [
    dto.school_no,
    dto.mac,
    dto.name,
    dto.summary,
    dto.kind,
    dto.extra,
    dto.sdate,
    dto.edate,
  ]);
  return await exec(query, params, conn);
}
// 학교별 Rel센서 mac 주소 검증증
export async function findRelByMac(mac: string, conn?: PoolConnection) {
  const query = 'SELECT 1 FROM rnDevicesRel WHERE mac = ?';
  return await getRow(query, [mac], undefined, conn);
}

// 학교별 센서 수정
export async function updateRnDevicesRel(dtos: updateRnDevicesRelDto[], conn?: PoolConnection): Promise<void> {
  for (const dto of dtos) {
    const query = `
      UPDATE rnDevicesRel SET
        name = ?,
        summary = ?,
        kind = ?,
        extra = ?,
        sdate = ?,
        edate = ?
      WHERE mac = ?
    `;
    const params = [dto.name, dto.summary, dto.kind, dto.extra, dto.sdate, dto.edate, dto.mac];
    await exec(query, params, conn);
  }
}

// rnDevices 소프트 삭제
export async function softDeleteRnDevicesRel(dtos: softDeleteRnDevicesRelDto[], conn?: PoolConnection) {
  const query = `
    DELETE FROM rnDevicesRel
    WHERE (mac, school_no) IN (${dtos.map(() => '(?, ?)').join(', ')})
  `;
  const params = dtos.flatMap((dto) => [dto.mac, dto.school_no]);
  console.log('[softDeleteRnDevicesRel] 쿼리:', query);
  console.log('[softDeleteRnDevicesRel] 파라미터:', params);
  await exec(query, params, conn);
}

export async function updateMac(dtos: UpdateMacDto[], conn?: PoolConnection) {
  for (const dto of dtos) {
    // 1. newMac 중복 체크
    console.log('[updateMac] 중복 체크 쿼리 실행: school_no=', dto.school_no, ', newMac=', dto.newMac);
    const exists = await getRow(
      'SELECT 1 FROM rnDevicesRel WHERE school_no = ? AND mac = ? ',
      [dto.school_no, dto.newMac],
      undefined,
      conn,
    );
    console.log('[updateMac] 중복 체크 결과:', exists);
    if (exists) {
      console.error(`[updateMac] 이미 존재하는 mac입니다: school_no=${dto.school_no}, newMac=${dto.newMac}`);
      throw new Error(`[updateMac] 이미 존재하는 mac입니다: school_no=${dto.school_no}, newMac=${dto.newMac}`);
    }

    // 2. UPDATE 실행 (deleted IS NULL 추가)
    const query = `
      UPDATE rnDevicesRel
      SET mac = ?
      WHERE school_no = ? AND mac = ? 
    `;
    const params = [dto.newMac, dto.school_no, dto.oldMac];
    console.log('[updateMac] UPDATE 쿼리 실행: ', query);
    console.log('[updateMac] 파라미터:', params);
    const result = await exec(query, params, conn);
    console.log('[updateMac] UPDATE 결과 affectedRows:', result.affectedRows);
    if (result.affectedRows === 0) {
      console.error(
        `[updateMac] mac 변경 실패: school_no=${dto.school_no}, oldMac=${dto.oldMac}, newMac=${dto.newMac}`,
      );
      throw new Error(
        `[updateMac] mac 변경 실패: school_no=${dto.school_no}, oldMac=${dto.oldMac}, newMac=${dto.newMac}`,
      );
    }
    // rnDevices 테이블도 같이 mac 변경
    const deviceResult = await updateDeviceMac(dto.oldMac, dto.newMac, conn);
    console.log('[updateMac] rnDevices mac 변경 결과:', deviceResult.affectedRows);
    console.log(`[updateMac] mac 변경 성공: school_no=${dto.school_no}, oldMac=${dto.oldMac}, newMac=${dto.newMac}`);
  }
}

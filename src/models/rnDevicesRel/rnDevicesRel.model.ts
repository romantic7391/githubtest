import { exec, getAll, getRow } from '@/lib/mariadb/query';
import type { PoolConnection } from 'mariadb';
import { Device, DeviceCreate, DeviceBasic, DeviceDb, DeviceListParams, deviceDbSchema } from '@/types/device';

// 학교별 내용 조회
// export async function findBySchoolNo(school_no: number): Promise<findBySchoolNoVO[]> {
//   const query = `
//       SELECT
//       rs.sname,
//       rs.scode,
//       rs.administrationcode,
//       rs.area,
//       rs.modbus,
//       rs.modbus_host,
//       rs.modbus_port,
//       rs.use_os,
//       rs.active,
//       rs.parent_id
//       FROM rnschool AS rs
//       WHERE rs.school_no = ?;
//   `;
//   return await getAll<findBySchoolNoVO>(query, [school_no]);
// }

// 학교의 센서 목록 조회
export async function findRnDevicesRelBySchoolNo(params: DeviceListParams): Promise<{
  devices: Device[];
  total: number;
}> {
  const { school_no, page = 1, pageSize = 10, filters } = params;
  const offset = (page - 1) * pageSize;

  // WHERE 절 조건 생성
  const conditions = ['rdr.school_no = ?']; // 기본 조건
  const queryParams: (string | number)[] = [school_no];

  if (filters?.model) {
    conditions.push('rd.model LIKE ?');
    queryParams.push(`%${filters.model}%`);
  }

  if (filters?.ip) {
    conditions.push('rd.ip LIKE ?');
    queryParams.push(`%${filters.ip}%`);
  }

  if (filters?.rip) {
    conditions.push('rd.rip LIKE ?');
    queryParams.push(`%${filters.rip}%`);
  }

  if (filters?.interval !== undefined && filters?.interval !== null) {
    conditions.push('rd.interval = ?');
    queryParams.push(filters.interval);
  }

  if (filters?.ver) {
    conditions.push('rd.ver LIKE ?');
    queryParams.push(`%${filters.ver}%`);
  }

  if (filters?.tags) {
    conditions.push('rd.tags LIKE ?');
    queryParams.push(`%${filters.tags}%`);
  }

  // 전체 개수 조회
  const countQuery = `
    SELECT COUNT(*) as total
    FROM rnDevicesRel AS rdr
    LEFT JOIN rnDevices AS rd ON rdr.mac = rd.mac
    WHERE ${conditions.join(' AND ')}
  `;
  const countResult = await getRow<{ total: number }>(countQuery, queryParams);
  const total = countResult?.total ?? 0;

  // 데이터 조회
  const query = `
    SELECT 
      rdr.mac,
      rdr.name, 
      rdr.summary,
      rdr.kind,
      rdr.extra, 
      rdr.sdate, 
      rdr.edate,
      rdr.created,   
      rd.model,
      rd.ip,
      rd.rip,
      rd.splrate,
      rd.interval,
      rd.ver,
      rd.tags,
      rd.checkin,
      rd.created as device_created
    FROM rnDevicesRel AS rdr
    LEFT JOIN rnDevices AS rd ON rdr.mac = rd.mac
    WHERE ${conditions.join(' AND ')}
    ORDER BY rdr.mac
    LIMIT ? OFFSET ?
  `;

  const devices = (await getAll<DeviceDb>(query, [...queryParams, pageSize, offset])).map((device) =>
    deviceDbSchema.parse(device),
  );

  return {
    devices,
    total,
  };
}

// 학교의 센서 정보 조회
export async function findRnDeviceRelBySchoolNoAndMac(params: DeviceBasic): Promise<Device | null> {
  const { mac, school_no } = params;

  const query = `
    SELECT 
      rdr.mac,
      rdr.name, 
      rdr.summary,
      rdr.kind,
      rdr.extra, 
      rdr.sdate, 
      rdr.edate,
      rdr.created,   
      rd.model,
      rd.ip,
      rd.rip,
      rd.splrate,
      rd.interval,
      rd.ver,
      rd.tags,
      rd.checkin,
      rd.created as device_created
    FROM rnDevicesRel AS rdr
    LEFT JOIN rnDevices AS rd ON rdr.mac = rd.mac
    WHERE rdr.school_no = ? AND rdr.mac = ?
  `;

  const device = await getRow<DeviceDb>(query, [school_no, mac]);
  if (!device) return null;

  return deviceDbSchema.parse(device);
}

//학교별 Rel센서 등록
export async function insertRnDevicesRel(
  dto: DeviceCreate[],
  conn?: PoolConnection,
): Promise<{ affectedRows: number; insertId?: number }> {
  const query = `
      INSERT INTO rnDevicesRel (school_no, mac, name, summary, kind, extra, sdate, edate)
    VALUES ${dto.map(() => '(?, ?, ?, ?, ?, ?, ?,?)').join(', ')}
  `;
  const params = dto.flatMap((dto) => [
    dto.schoolNo,
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
export async function updateRnDevicesRel(
  dtos: (DeviceBasic & Omit<Device, 'mac'>)[],
  conn?: PoolConnection,
): Promise<void> {
  for (const dto of dtos) {
    console.log('[updateRnDevicesRel] 업데이트 데이터:', dto);

    // MAC 주소가 변경된 경우 (oldMac이 존재하고 mac과 다른 경우)
    if (dto.oldMac && dto.mac !== dto.oldMac) {
      const query = `
        UPDATE rnDevicesRel SET
          mac = ?,
          name = ?,
          summary = ?,
          kind = ?,
          extra = ?,
          sdate = ?,
          edate = ?
        WHERE mac = ? and school_no = ?
      `;
      const params = [
        dto.mac,
        dto.name,
        dto.summary,
        dto.kind,
        dto.extra,
        dto.sdate,
        dto.edate,
        dto.oldMac,
        dto.school_no,
      ];
      console.log('[updateRnDevicesRel] MAC 변경 쿼리:', query);
      console.log('[updateRnDevicesRel] MAC 변경 파라미터:', params);
      const result = await exec(query, params, conn);
      console.log('[updateRnDevicesRel] MAC 변경 결과:', result);
    } else {
      // MAC 주소가 변경되지 않은 경우
      const query = `
        UPDATE rnDevicesRel SET
          name = ?,
          summary = ?,
          kind = ?,
          extra = ?,
          sdate = ?,
          edate = ?
        WHERE mac = ? and school_no = ?
      `;
      const params = [dto.name, dto.summary, dto.kind, dto.extra, dto.sdate, dto.edate, dto.mac, dto.school_no];
      console.log('[updateRnDevicesRel] 일반 업데이트 쿼리:', query);
      console.log('[updateRnDevicesRel] 일반 업데이트 파라미터:', params);
      const result = await exec(query, params, conn);
      console.log('[updateRnDevicesRel] 일반 업데이트 결과:', result);
    }
  }
}

// rnDevices 소프트 삭제
export async function softDeleteRnDevicesRel(dtos: DeviceBasic[], conn?: PoolConnection) {
  const query = `
    DELETE FROM rnDevicesRel
    WHERE (mac, school_no) IN (${dtos.map(() => '(?, ?)').join(', ')})
  `;
  const params = dtos.flatMap((dto) => [dto.mac, dto.school_no]);
  console.log('[softDeleteRnDevicesRel] 쿼리:', query);
  console.log('[softDeleteRnDevicesRel] 파라미터:', params);
  await exec(query, params, conn);
}

// MAC 주소 중복 체크 (순수 데이터 액세스)
export async function checkMacExists(school_no: number, mac: string, conn?: PoolConnection) {
  const query = 'SELECT 1 FROM rnDevicesRel WHERE school_no = ? AND mac = ?';
  return await getRow(query, [school_no, mac], undefined, conn);
}

// MAC 주소 업데이트 (순수 데이터 액세스)
export async function updateMacAddress(school_no: number, oldMac: string, newMac: string, conn?: PoolConnection) {
  const query = `
    UPDATE rnDevicesRel
    SET mac = ?
    WHERE school_no = ? AND mac = ?
  `;
  const params = [newMac, school_no, oldMac];
  return await exec(query, params, conn);
}

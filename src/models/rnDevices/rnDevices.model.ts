import { exec, getAll, getRow } from '@/lib/mariadb/query';
import type { PoolConnection } from 'mariadb';

import { insertRnDevicesDto, updateRnDevicesDto, softDeleteRnDevicesDto } from '@/interfaces/rnDevices/rnDevices.d';

//학교별 Rel센서 등록
export async function insertRnDevices(
  dtos: insertRnDevicesDto[],
  conn?: PoolConnection,
): Promise<{ affectedRows: number; insertId?: number }> {
  const query = `
  INSERT INTO rnDevices (mac, model, ip, rip, splrate, \`interval\`, ver, tags, checkin)
  VALUES ${dtos.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ')}
  `;

  const params = dtos.flatMap((dto) => [
    dto.mac,
    dto.model,
    dto.ip,
    dto.rip,
    dto.splrate,
    dto.interval,
    dto.ver,
    dto.tags,
    dto.checkin,
  ]);

  return await exec(query, params, conn);
}

export async function findDeviceByMac(mac: string, conn?: PoolConnection) {
  const query = 'SELECT mac FROM rnDevices WHERE mac = ?';
  return await getRow<{ mac: string }>(query, [mac], undefined, conn);
}

// rnDevices mac 주소 검증
export async function findDevicesByMacs(macList: string[], conn?: PoolConnection) {
  if (macList.length === 0) return [];
  const placeholders = macList.map(() => '?').join(', ');
  const query = `SELECT mac FROM rnDevices WHERE mac IN (${placeholders})`;
  return await getAll<{ mac: string }>(query, macList, undefined, conn);
}

// rnDevices 수정
export async function updateDevice(dtos: updateRnDevicesDto[], conn?: PoolConnection): Promise<void> {
  for (const dto of dtos) {
    const query = `
      UPDATE rnDevices SET
        model = ?,
        ip = ?,
        rip = ?,
        splrate = ?,
        interval = ?,
        ver = ?,
        tags = ?,
        checkin = ?
      WHERE mac = ?
    `;
    const params = [dto.model, dto.ip, dto.rip, dto.splrate, dto.interval, dto.ver, dto.tags, dto.checkin, dto.mac];
    await exec(query, params, conn);
  }
}

// rnDevices 소프트 삭제
export async function softDeleteRnDevice(dtos: softDeleteRnDevicesDto[], conn?: PoolConnection) {
  const query = `
    DELETE FROM rnDevices
    WHERE  mac IN (${dtos.map(() => '?').join(', ')})
  `;
  const params = dtos.flatMap((dto) => [dto.mac]);
  console.log('[softDeleteRnDevice] 쿼리:', query);
  console.log('[softDeleteRnDevice] 파라미터:', params);
  return await exec(query, params, conn);
}

// rnDevices mac 변경
export async function updateDeviceMac(oldMac: string, newMac: string, conn?: PoolConnection) {
  const query = `
    UPDATE rnDevices
    SET mac = ?
    WHERE mac = ?
  `;
  const params = [newMac, oldMac];
  return await exec(query, params, conn);
}

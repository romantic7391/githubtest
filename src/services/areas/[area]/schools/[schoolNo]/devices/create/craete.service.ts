import { PoolConnection } from 'mariadb';
import { findRelByMac, insertRnDevicesRel } from '@/models/rnDevicesRel/rnDevicesRel.model';
import { findDevicesByMacs, insertRnDevices } from '@/models/rnDevices/rnDevices.model';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { DeviceCreate } from '@/types/device';
import { LogMeta } from '@/types/history';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { DEFAULT_ERROR_MESSAGE_500 } from '@/lib/default.constant';

/**
 * 지역 학교 센서 장치 추가
 */
export async function createRnDevicesRel(dtos: DeviceCreate[], meta: LogMeta) {
  console.log('[createRnDevicesRel] 호출, dtos:', JSON.stringify(dtos));
  let conn;
  try {
    conn = await beginTransaction();
    await createDevicesAndRelationsFn(dtos, conn, meta);
    await commitTransaction(conn);
    return { success: true };
  } catch (error) {
    if (conn) await rollbackTransaction(conn);
    console.error('[createRnDevicesRel] 에러:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error(DEFAULT_ERROR_MESSAGE_500);
  } finally {
    if (conn) {
      try {
        await conn.release();
      } catch (err) {
        console.error('Connection release error:', err);
      }
    }
  }
}

// 내부 private 센서등록 함수
async function createDevicesAndRelationsFn(dtos: DeviceCreate[], conn: PoolConnection, meta: LogMeta) {
  console.log('[createDevicesAndRelationsFn] dtos:', JSON.stringify(dtos));

  // 1. MAC 주소 중복 체크를 병렬로 처리
  const macChecks = await Promise.all(dtos.map((dto) => findRelByMac(dto.mac, conn)));

  if (macChecks.some((exists) => exists)) {
    throw new Error('이미 등록된 mac 주소 입니다. (학교마다 mac주소는 유일해야 합니다)');
  }

  // 2. rnDevicesRel 테이블에 등록
  await insertRnDevicesRel(dtos, conn);

  // 3. 로그 기록 (rnDevicesRel) - 병렬 처리
  await Promise.all(
    dtos.map((dto) => {
      const { manager_no, ...restMeta } = meta;
      const logParams = {
        ...restMeta,
        manager_no: manager_no || undefined,
        school_no: dto.schoolNo,
        action_type: 'I' as const,
        target_table: 'rnDevicesRel',
        target_id: dto.mac,
        old_values: null,
        new_values: JSON.stringify(dto),
        reason: '센서 등록',
      };
      return logAction(makeLogParams(logParams), conn);
    }),
  );

  // 4. rnDevices 테이블에 등록 (새로운 디바이스만)
  const macList = dtos.map((dto) => dto.mac);
  const existingRows = await findDevicesByMacs(macList, conn);
  const existingMacs = new Set(existingRows.map((row) => row.mac));
  const newDeviceDtos = dtos.filter((dto) => !existingMacs.has(dto.mac));

  if (newDeviceDtos.length > 0) {
    await insertRnDevices(newDeviceDtos, conn);

    // 5. 로그 기록 (rnDevices) - 병렬 처리
    await Promise.all(
      newDeviceDtos.map((dto) => {
        const { manager_no, ...restMeta } = meta;
        const logParams = {
          ...restMeta,
          manager_no: manager_no || undefined,
          school_no: dto.schoolNo,
          action_type: 'I' as const,
          target_table: 'rnDevices',
          target_id: dto.mac,
          old_values: null,
          new_values: JSON.stringify(dto),
          reason: '센서 등록',
        };
        return logAction(makeLogParams(logParams), conn);
      }),
    );
  }
}

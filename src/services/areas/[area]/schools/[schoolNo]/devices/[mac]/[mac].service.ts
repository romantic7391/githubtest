import type { Device, DeviceBasic } from '@/types/device';
import {
  findRnDeviceRelBySchoolNoAndMac,
  updateRnDevicesRel,
  softDeleteRnDevicesRel,
} from '@/models/rnDevicesRel/rnDevicesRel.model';
import { findDeviceByMac, softDeleteRnDevice } from '@/models/rnDevices/rnDevices.model';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';

/**
 * 지역 학교 센서 장치 정보 조회
 */
export async function getDevice(
  params: DeviceBasic,
  meta: { manager_no: number; ip: string | null; user_agent: string | null },
) {
  let conn;
  try {
    conn = await beginTransaction();
    const device = await findRnDeviceRelBySchoolNoAndMac(params);
    if (!device) return null;

    // 데이터 구조 변환
    const transformedDevice: Device = {
      mac: device.mac,
      name: device.name,
      summary: device.summary,
      kind: device.kind,
      extra: device.extra,
      sdate: device.sdate,
      edate: device.edate,
      created: device.created,
      device: {
        model: device.model,
        ip: device.ip,
        rip: device.rip,
        splrate: device.splrate,
        interval: device.interval,
        ver: device.ver,
        tags: device.tags,
        checkin: device.checkin,
        created: device.device_created,
      },
    };

    // 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        school_no: params.school_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'S',
        target_table: 'rndevicesrel',
        target_id: params.mac,
        old_values: null,
        new_values: JSON.stringify(transformedDevice),
        reason: '센서 정보 조회',
      }),
      conn,
    );

    await commitTransaction(conn);
    return transformedDevice;
  } catch (error) {
    if (conn) {
      try {
        await rollbackTransaction(conn);
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }
    console.error('[getDeviceService] DB 조회 에러:', error);
    throw new Error('센서 조회 중 오류가 발생했습니다.');
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

/**
 * 지역 학교 센서 수정
 */
export async function updateDevice(
  dto: DeviceBasic & Omit<Device, 'mac'>,
  meta: { manager_no: number; ip: string | null; user_agent: string | null },
): Promise<{ mac: string }> {
  let conn;
  try {
    conn = await beginTransaction();
    // 센서 존재 여부 확인
    const oldDevice = await findDeviceByMac(dto.mac);

    // rnDevicesRel 테이블 업데이트
    await updateRnDevicesRel([dto], conn);

    // rnDevices 테이블 업데이트
    // const deviceData: Device = {
    //   mac: dto.mac,
    //   name: dto.name,
    //   summary: dto.summary,
    //   kind: dto.kind,
    //   extra: dto.extra,
    //   sdate: dto.sdate,
    //   edate: dto.edate,
    //   created: dto.created,
    //   device: {
    //     model: dto.device.model,
    //     ip: dto.device.ip,
    //     rip: dto.device.rip,
    //     splrate: dto.device.splrate,
    //     interval: dto.device.interval,
    //     ver: dto.device.ver,
    //     tags: dto.device.tags,
    //     checkin: dto.device.checkin,
    //     created: dto.device.created,
    //   },
    // };
    // await updateDeviceFn([deviceData], conn);

    // 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        school_no: dto.school_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'U',
        target_table: 'rndevicesrel',
        target_id: dto.mac,
        old_values: JSON.stringify(oldDevice),
        new_values: JSON.stringify(dto),
        reason: '센서 정보 수정',
      }),
      conn,
    );

    await commitTransaction(conn);
    return { mac: dto.mac };
  } catch (error) {
    if (conn) {
      try {
        await rollbackTransaction(conn);
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }
    console.error('[updateDeviceService] 센서 수정 중 오류 발생:', error);
    throw new Error('센서 수정 중 오류가 발생했습니다.');
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

/**
 * 지역 학교 센서 장치 삭제
 */
export async function deleteDevice(
  params: { mac: string; school_no: number },
  meta: { manager_no: number; ip: string | null; user_agent: string | null },
) {
  let conn;
  try {
    conn = await beginTransaction();
    // 센서 존재 여부 확인
    const oldDevice = await findDeviceByMac(params.mac);

    // rnDevicesRel 테이블에서 삭제
    await softDeleteRnDevicesRel([{ mac: params.mac, school_no: params.school_no }], conn);

    // rnDevices 테이블에서 삭제
    await softDeleteRnDevice([{ mac: params.mac }], conn);

    // 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        school_no: params.school_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'D',
        target_table: 'rndevicesrel',
        target_id: params.mac,
        old_values: JSON.stringify(oldDevice),
        new_values: null,
        reason: '센서 삭제',
      }),
      conn,
    );

    await commitTransaction(conn);
  } catch (error) {
    if (conn) {
      try {
        await rollbackTransaction(conn);
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }
    console.error('[deleteDeviceService] 센서 삭제 중 오류 발생:', error);
    throw new Error('센서 삭제 중 오류가 발생했습니다.');
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

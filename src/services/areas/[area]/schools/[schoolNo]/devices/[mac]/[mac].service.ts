import type { Device, DeviceBasic } from '@/types/device';
import type { PoolConnection } from 'mariadb';
import {
  findRnDeviceRelBySchoolNoAndMac,
  updateRnDevicesRel,
  softDeleteRnDevicesRel,
  checkMacExists,
  updateMacAddress,
} from '@/models/rnDevicesRel/rnDevicesRel.model';
import { softDeleteRnDevice, updateDeviceMac } from '@/models/rnDevices/rnDevices.model';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { UpdateMacDto } from '@/interfaces/rnDevicesRel/rnDevicesRel.d';

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
    if (!device) {
      await commitTransaction(conn);
      return null;
    }

    // 로그 기록
    try {
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
          new_values: JSON.stringify(device),
          reason: '센서 정보 조회',
        }),
        conn,
      );
    } catch (logError) {
      console.error('Log action error:', logError);
      // 로그 액션 실패는 치명적이지 않음
    }

    await commitTransaction(conn);
    return device;
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
  }
}

/**
 * 지역 학교 센서 수정
 */
export async function updateDevice(
  dto: DeviceBasic & Device,
  meta: { manager_no: number; ip: string | null; user_agent: string | null },
): Promise<{ mac: string }> {
  // 필수 파라미터 검증
  if (!dto.oldMac) {
    throw new Error('기존 MAC 주소가 필요합니다.');
  }

  let conn;
  try {
    conn = await beginTransaction();

    // 센서 존재 여부 확인
    const oldDevice = await findRnDeviceRelBySchoolNoAndMac({ school_no: dto.school_no, mac: dto.oldMac });
    if (!oldDevice) {
      throw new Error('기존 MAC 주소로 등록된 센서를 찾을 수 없습니다.');
    }

    // MAC 주소가 변경된 경우
    if (dto.mac !== dto.oldMac) {
      await updateMac(
        [
          {
            school_no: dto.school_no,
            oldMac: dto.oldMac,
            newMac: dto.mac,
          },
        ],
        meta,
        conn,
      );
    }

    // rnDevicesRel 테이블 업데이트
    const updateData = {
      ...dto,
      oldMac: dto.oldMac,
    };
    await updateRnDevicesRel([updateData], conn);

    // 로그 기록
    try {
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
    } catch (logError) {
      console.error('Log action error:', logError);
      // 로그 액션 실패는 치명적이지 않음
    }

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
    const oldDevice = await findRnDeviceRelBySchoolNoAndMac({ school_no: params.school_no, mac: params.mac });

    if (!oldDevice) {
      await commitTransaction(conn);
      return; // 디바이스가 없는 경우 조용히 종료
    }

    // rnDevicesRel 테이블에서 삭제
    await softDeleteRnDevicesRel([{ mac: params.mac, school_no: params.school_no }], conn);

    // rnDevices 테이블에서 삭제
    await softDeleteRnDevice([{ mac: params.mac }], conn);

    // 로그 기록
    try {
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
    } catch (logError) {
      console.error('Log action error:', logError);
      // 로그 액션 실패는 치명적이지 않음
    }

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
  }
}

/**
 * MAC 주소 업데이트 (비즈니스 로직)
 */
export async function updateMac(
  dtos: UpdateMacDto[],
  meta: { manager_no: number; ip: string | null; user_agent: string | null },
  conn?: PoolConnection,
) {
  for (const dto of dtos) {
    // 1. newMac 중복 체크
    console.log('[updateMac] 중복 체크 쿼리 실행: school_no=', dto.school_no, ', newMac=', dto.newMac);
    const exists = await checkMacExists(dto.school_no, dto.newMac, conn);
    console.log('[updateMac] 중복 체크 결과:', exists);
    if (exists) {
      console.error(`[updateMac] 이미 존재하는 mac입니다: school_no=${dto.school_no}, newMac=${dto.newMac}`);
      throw new Error('MAC 주소가 이미 존재합니다.');
    }

    // 2. UPDATE 실행
    const result = await updateMacAddress(dto.school_no, dto.oldMac, dto.newMac, conn);
    console.log('[updateMac] UPDATE 결과 affectedRows:', result.affectedRows);
    if (result.affectedRows === 0) {
      console.error(
        `[updateMac] mac 변경 실패: school_no=${dto.school_no}, oldMac=${dto.oldMac}, newMac=${dto.newMac}`,
      );
      throw new Error('MAC 주소 변경에 실패했습니다.');
    }

    // 3. rnDevices 테이블도 같이 mac 변경
    const deviceResult = await updateDeviceMac(dto.oldMac, dto.newMac, conn);
    console.log('[updateMac] rnDevices mac 변경 결과:', deviceResult.affectedRows);
    console.log(`[updateMac] mac 변경 성공: school_no=${dto.school_no}, oldMac=${dto.oldMac}, newMac=${dto.newMac}`);

    // 4. 로그 기록
    try {
      await logAction(
        makeLogParams({
          manager_no: meta.manager_no,
          school_no: dto.school_no,
          ip: meta.ip,
          user_agent: meta.user_agent,
          action_type: 'U',
          target_table: 'rndevicesrel',
          target_id: dto.newMac,
          old_values: JSON.stringify({ mac: dto.oldMac }),
          new_values: JSON.stringify({ mac: dto.newMac }),
          reason: 'MAC 주소 변경',
        }),
        conn,
      );
    } catch (logError) {
      console.error('Log action error:', logError);
      // 로그 액션 실패는 치명적이지 않음
    }
  }
}

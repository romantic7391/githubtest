import type { Device, DeviceBasic } from '@/types/device';
import type { PoolConnection } from 'mariadb';
import {
  findRnDeviceRelBySchoolNoAndMac,
  updateRnDevicesRel,
  softDeleteRnDevicesRel,
  updateMacAddress,
} from '@/models/rnDevicesRel/rnDevicesRel.model';
import { softDeleteRnDevice, updateDeviceMac } from '@/models/rnDevices/rnDevices.model';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { UpdateMacDto } from '@/interfaces/rnDevicesRel/rnDevicesRel.d';
import { AppError } from '@/utils/error.utils';

/**
 * 지역 학교 센서 장치 정보 조회
 */
export async function getDevice(
  params: DeviceBasic,
  meta: { managerNo: number; ip: string | null; userAgent: string | null },
) {
  let conn;
  try {
    conn = await beginTransaction();
    const device = await findRnDeviceRelBySchoolNoAndMac(params);
    if (!device) {
      await commitTransaction(conn);
      throw new AppError('센서를 찾을 수 없습니다.', 404);
    }

    // 로그 기록
    try {
      await logAction(
        makeLogParams({
          managerNo: meta.managerNo,
          schoolNo: params.schoolNo,
          ip: meta.ip,
          userAgent: meta.userAgent,
          actionType: 'S',
          targetTable: 'rndevicesrel',
          targetId: params.mac,
          oldValues: JSON.stringify(device),
          newValues: null,
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
    throw new AppError('센서 조회 중 오류가 발생했습니다.', 500);
  } finally {
    if (conn) {
      try {
        await conn.release();
      } catch (releaseError) {
        console.error('Connection release error:', releaseError);
      }
    }
  }
}

/**
 * 지역 학교 센서 수정
 */
export async function updateDevice(
  dto: DeviceBasic & Device,
  meta: { managerNo: number; ip: string | null; userAgent: string | null },
): Promise<{ mac: string }> {
  // 필수 파라미터 검증
  if (!dto.oldMac) {
    throw new AppError('기존 MAC 주소가 필요합니다.', 400);
  }

  let conn;
  try {
    conn = await beginTransaction();

    // 센서 존재 여부 확인
    const oldDevice = await findRnDeviceRelBySchoolNoAndMac({ schoolNo: dto.schoolNo, mac: dto.oldMac });
    if (!oldDevice) {
      throw new AppError('기존 MAC 주소로 등록된 센서를 찾을 수 없습니다.', 404);
    }

    // MAC 주소가 변경된 경우
    if (dto.mac !== dto.oldMac) {
      await updateMac(
        [
          {
            schoolNo: dto.schoolNo,
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
          managerNo: meta.managerNo,
          schoolNo: dto.schoolNo,
          ip: meta.ip,
          userAgent: meta.userAgent,
          actionType: 'U',
          targetTable: 'rndevicesrel',
          targetId: dto.mac,
          oldValues: JSON.stringify(oldDevice),
          newValues: JSON.stringify(dto),
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
  } catch (error: unknown) {
    if (conn) {
      try {
        await rollbackTransaction(conn);
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }
    console.error('[updateDeviceService] 센서 수정 중 오류 발생:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('센서 수정 중 오류가 발생했습니다.', 500);
  } finally {
    if (conn) {
      try {
        await conn.release();
      } catch (releaseError) {
        console.error('Connection release error:', releaseError);
      }
    }
  }
}

/**
 * 지역 학교 센서 장치 삭제
 */
export async function deleteDevice(
  params: { mac: string; schoolNo: number },
  meta: { managerNo: number; ip: string | null; userAgent: string | null },
) {
  let conn;
  try {
    conn = await beginTransaction();

    // 센서 존재 여부 확인
    const oldDevice = await findRnDeviceRelBySchoolNoAndMac({ schoolNo: params.schoolNo, mac: params.mac });

    if (!oldDevice) {
      await commitTransaction(conn);
      throw new AppError('센서를 찾을 수 없습니다.', 404);
    }

    // rnDevicesRel 테이블에서 삭제
    await softDeleteRnDevicesRel([{ mac: params.mac, schoolNo: params.schoolNo }], conn);

    // rnDevices 테이블에서 삭제
    await softDeleteRnDevice([{ mac: params.mac }], conn);

    // 로그 기록
    try {
      await logAction(
        makeLogParams({
          managerNo: meta.managerNo,
          schoolNo: params.schoolNo,
          ip: meta.ip,
          userAgent: meta.userAgent,
          actionType: 'D',
          targetTable: 'rndevicesrel',
          targetId: params.mac,
          oldValues: JSON.stringify(oldDevice),
          newValues: null,
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

    // AppError는 그대로 전달
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('센서 삭제 중 오류가 발생했습니다.', 500);
  } finally {
    if (conn) {
      try {
        await conn.release();
      } catch (releaseError) {
        console.error('Connection release error:', releaseError);
      }
    }
  }
}

/**
 * MAC 주소 업데이트 (비즈니스 로직)
 */
export async function updateMac(
  dtos: UpdateMacDto[],
  meta: { managerNo: number; ip: string | null; userAgent: string | null },
  conn?: PoolConnection,
) {
  for (const dto of dtos) {
    // 1. UPDATE 실행
    const result = await updateMacAddress(dto.schoolNo, dto.oldMac, dto.newMac, conn);
    if (result.affectedRows === 0) {
      throw new AppError('MAC 주소 변경에 실패했습니다.', 500);
    }

    // 3. rnDevices 테이블도 같이 mac 변경 (존재하는 경우에만)
    await updateDeviceMac(dto.oldMac, dto.newMac, conn);
    // rnDevices 테이블에 해당 MAC 주소가 없으면 무시 (affectedRows === 0이어도 에러 아님)
    // if (deviceResult.affectedRows === 0) {
    //   throw new Error('MAC 주소 변경에 실패했습니다.');
    // }

    // 4. 로그 기록
    try {
      await logAction(
        makeLogParams({
          managerNo: meta.managerNo,
          schoolNo: dto.schoolNo,
          ip: meta.ip,
          userAgent: meta.userAgent,
          actionType: 'U',
          targetTable: 'rndevicesrel',
          targetId: dto.newMac,
          oldValues: JSON.stringify({ mac: dto.oldMac }),
          newValues: JSON.stringify({ mac: dto.newMac }),
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

import type { Device } from '@/types/device';
import {
  findRnDeviceRelBySchoolNoAndMac,
  updateRnDevicesRel,
  softDeleteRnDevicesRel,
} from '@/models/rnDevicesRel/rnDevicesRel.model';
import { findDeviceByMac, updateDeviceFn, softDeleteRnDevice } from '@/models/rnDevices/rnDevices.model';

/**
 * 지역 학교 센서 장치 정보 조회
 */
export async function getDevice(mac: string) {
  try {
    return await findRnDeviceRelBySchoolNoAndMac({ school_no: 0, mac });
  } catch (error) {
    console.error('[getDeviceService] DB 조회 에러:', error);
    throw new Error('센서 조회 중 오류가 발생했습니다.');
  }
}

/**
 * 지역 학교 센서 수정
 */
export async function updateDevice(dto: Device): Promise<void> {
  try {
    // 센서 존재 여부 확인
    await findDeviceByMac(dto.mac);

    // rnDevicesRel 테이블 업데이트
    await updateRnDevicesRel([
      {
        mac: dto.mac,
        name: dto.name,
        summary: dto.summary,
        kind: dto.kind,
        extra: dto.extra,
        sdate: dto.sdate,
        edate: dto.edate,
      },
    ]);

    // rnDevices 테이블 업데이트
    const deviceData: Device = {
      mac: dto.mac,
      name: dto.name,
      summary: dto.summary,
      kind: dto.kind,
      extra: dto.extra,
      sdate: dto.sdate,
      edate: dto.edate,
      created: dto.created,
      device: {
        model: dto.device.model,
        ip: dto.device.ip,
        rip: dto.device.rip,
        splrate: dto.device.splrate,
        interval: dto.device.interval,
        ver: dto.device.ver,
        tags: dto.device.tags,
        checkin: dto.device.checkin,
        created: dto.device.created,
      },
    };
    await updateDeviceFn([deviceData]);
  } catch (error) {
    console.error('[updateDeviceService] 센서 수정 중 오류 발생:', error);
    throw new Error('센서 수정 중 오류가 발생했습니다.');
  }
}

/**
 * 지역 학교 센서 장치 삭제
 */
export async function deleteDevice(dto: { mac: string }) {
  try {
    // 센서 존재 여부 확인
    await findDeviceByMac(dto.mac);

    // rnDevicesRel 테이블에서 삭제
    await softDeleteRnDevicesRel([{ mac: dto.mac, school_no: 0 }]);

    // rnDevices 테이블에서 삭제
    await softDeleteRnDevice([{ mac: dto.mac }]);
  } catch (error) {
    console.error('[deleteDeviceService] 센서 삭제 중 오류 발생:', error);
    throw new Error('센서 삭제 중 오류가 발생했습니다.');
  }
}

import type { Device, DeviceBasic } from '@/types/device';
import {
  findRnDeviceRelBySchoolNoAndMac,
  updateRnDevicesRel,
  softDeleteRnDevicesRel,
} from '@/models/rnDevicesRel/rnDevicesRel.model';
import { findDeviceByMac, updateDeviceFn, softDeleteRnDevice } from '@/models/rnDevices/rnDevices.model';

/**
 * 지역 학교 센서 장치 정보 조회
 */
export async function getDevice(params: DeviceBasic) {
  try {
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

    return transformedDevice;
  } catch (error) {
    console.error('[getDeviceService] DB 조회 에러:', error);
    throw new Error('센서 조회 중 오류가 발생했습니다.');
  }
}

/**
 * 지역 학교 센서 수정
 */
export async function updateDevice(dto: DeviceBasic & Omit<Device, 'mac'>): Promise<{ mac: string }> {
  try {
    // 센서 존재 여부 확인
    await findDeviceByMac(dto.mac);

    // rnDevicesRel 테이블 업데이트
    await updateRnDevicesRel([dto]);

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

    return { mac: dto.mac };
  } catch (error) {
    console.error('[updateDeviceService] 센서 수정 중 오류 발생:', error);
    throw new Error('센서 수정 중 오류가 발생했습니다.');
  }
}

/**
 * 지역 학교 센서 장치 삭제
 */
export async function deleteDevice(params: { mac: string; school_no: number }) {
  try {
    // 센서 존재 여부 확인
    await findDeviceByMac(params.mac);

    // rnDevicesRel 테이블에서 삭제
    await softDeleteRnDevicesRel([{ mac: params.mac, school_no: params.school_no }]);

    // rnDevices 테이블에서 삭제
    await softDeleteRnDevice([{ mac: params.mac }]);
  } catch (error) {
    console.error('[deleteDeviceService] 센서 삭제 중 오류 발생:', error);
    throw new Error('센서 삭제 중 오류가 발생했습니다.');
  }
}

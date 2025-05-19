import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import type { PoolConnection } from 'mariadb';
import { findRnDevicesRelBySchoolNoDto } from '@/interfaces/rnDevicesRel/rnDevicesRel.d';
import { updateRnDevicesRelServiceDto, createRnDevicesRelServiceDto } from '@/services/rnDevices/rnDevices.service.d';
import {
  insertRnDevicesRel,
  findBySchoolNo,
  findRnDevicesRelBySchoolNo,
  findRelByMac,
  updateRnDevicesRel,
  softDeleteRnDevicesRel,
  updateMac,
} from '@/models/rnDevicesRel/rnDevicesRel.model';
import {
  insertRnDevices,
  findDevicesByMacs,
  updateDevice,
  softDeleteRnDevice,
} from '@/models/rnDevices/rnDevices.model';
import {
  logAction,
  makeInsertLogParams,
  makeUpdateLogParams,
  makeDeleteLogParams,
  makeSelectLogParams,
} from '@/services/log-action/log-action.service';
import { RequestMeta } from '@/interfaces/log-action/log-action.d';

// 학교별 센서 조회
export async function getRnDevicesRelBySchoolNo(dto: findRnDevicesRelBySchoolNoDto, meta: RequestMeta) {
  if (!dto.school_no) {
    // 서버 로그에는 상세하게 남김
    console.error('[getRnDevicesRelBySchoolNo] school_no 누락:', dto);
    // 사용자에게는 일반적인 메시지만 반환
    throw new Error('필수 입력값이 누락되었습니다.');
  }
  const limit = dto.limit ?? 10;
  const offset = dto.offset ?? 0;
  try {
    // const schoolInfo = await findBySchoolNo(dto.school_no);
    const result = await findRnDevicesRelBySchoolNo({ ...dto, limit, offset });
    // 조회 로그 남기기
    try {
      await logAction(
        makeSelectLogParams({
          manager_no: meta.manager_no,
          school_no: meta.school_no ?? dto.school_no,
          ip: getHeader(meta.req, 'x-forwarded-for'),
          user_agent: getHeader(meta.req, 'user-agent'),
          action_type: 'S',
          target_table: 'rnDevicesRel',
          target_id: null,
          old_values: dto,
          reason: '센서 조회',
        }),
      );
    } catch (logError) {
      console.error('[getRnDevicesRelBySchoolNo] 조회 로그 기록 실패:', logError);
    }
    return result;
  } catch (error) {
    // 서버 로그에는 상세하게 남김
    console.error('[getRnDevicesRelBySchoolNo] DB 조회 에러:', error);
    // 사용자에게는 일반적인 메시지만 반환
    throw new Error('조회 중 오류가 발생했습니다.');
  }
}

// 학교별 센서 등록
export async function createRnDevicesRel(dtos: createRnDevicesRelServiceDto[], meta: RequestMeta) {
  console.log('[createRnDevicesRel] 호출, dtos:', JSON.stringify(dtos, null, 2));
  const conn = await beginTransaction();
  try {
    await createDevicesAndRelationsFn(dtos, conn, meta);
    await commitTransaction(conn);
    return { success: true };
  } catch (error) {
    await rollbackTransaction(conn);
    console.error('[createRnDevicesRel] 에러:', error);
    throw error;
  }
}

// 학교별 센서 동기화
export async function syncRnDevicesRel(
  school_no: number,
  incoming: updateRnDevicesRelServiceDto[],
  meta: RequestMeta,
  topLevelSchoolNo?: number,
) {
  console.log('[syncRnDevicesRel] 호출, school_no:', school_no, 'incoming:', JSON.stringify(incoming, null, 2));
  const conn = await beginTransaction();
  try {
    // 1. DB에서 현재 상태 조회
    let dbRows = await findRnDevicesRelBySchoolNo({ school_no, limit: 1000000, offset: 0 });
    console.log('[syncRnDevicesRel] DB rows:', JSON.stringify(dbRows, null, 2));

    // toChangeMac 추출 전 incoming 전체 로그
    console.log('[syncRnDevicesRel] incoming:', JSON.stringify(incoming, null, 2));
    incoming.forEach((d, i) => {
      console.log(`[syncRnDevicesRel] incoming[${i}]: mac=${d.mac}, oldMac=${d.oldMac}, newMac=${d.newMac}`);
    });

    // 2. mac 기준으로 Set 생성 (소문자 변환)
    const incomingMacs = new Set(incoming.map((d) => d.mac.toLowerCase()));

    // 1) mac 변경 대상: oldMac이 DB에 있고 newMac이 DB에 없는 경우만 (소문자 변환)
    const toChangeMac = incoming.filter((d) => {
      const oldMac = d.oldMac;
      const newMac = d.newMac;
      return (
        typeof oldMac === 'string' &&
        typeof newMac === 'string' &&
        oldMac !== newMac &&
        dbRows.some((row) => row.mac.toLowerCase() === oldMac.toLowerCase()) &&
        !dbRows.some((row) => row.mac.toLowerCase() === newMac.toLowerCase())
      );
    });
    console.log('[syncRnDevicesRel] toChangeMac:', JSON.stringify(toChangeMac, null, 2));
    toChangeMac.forEach((d, i) => {
      console.log(`[syncRnDevicesRel] toChangeMac[${i}]: oldMac=${d.oldMac}, newMac=${d.newMac}, mac=${d.mac}`);
    });

    // 2) 신규 등록 대상: oldMac/newMac이 없는 경우 + mac이 DB에 없는 경우만 (소문자 변환)
    const toInsert = incoming.filter(
      (d) => !d.oldMac && !d.newMac && !dbRows.some((row) => row.mac.toLowerCase() === d.mac.toLowerCase()),
    );
    // toChangeMac의 newMac(=d.mac)과 겹치는 것은 제외 (소문자 변환)
    const toChangeMacNewMacs = new Set(
      toChangeMac.map((d) => (typeof d.newMac === 'string' ? d.newMac.toLowerCase() : undefined)),
    );
    const finalToInsert = toInsert.filter((d) => !toChangeMacNewMacs.has(d.mac.toLowerCase()));
    console.log('[syncRnDevicesRel] toInsert:', JSON.stringify(finalToInsert, null, 2));
    finalToInsert.forEach((d, i) => {
      console.log(`[syncRnDevicesRel] toInsert[${i}]: mac=${d.mac}, oldMac=${d.oldMac}, newMac=${d.newMac}`);
    });

    // 2) 일반 업데이트 대상: oldMac/newMac이 없는 경우만 (소문자 변환)
    const toUpdate = incoming.filter((d) => {
      if (d.oldMac || d.newMac) return false;
      const dbRow = dbRows.find((row) => row.mac.toLowerCase() === d.mac.toLowerCase());
      return (
        dbRow &&
        (dbRow.name !== d.name ||
          dbRow.summary !== d.summary ||
          dbRow.kind !== d.kind ||
          dbRow.extra !== d.extra ||
          dbRow.sdate !== d.sdate ||
          dbRow.edate !== d.edate ||
          dbRow.model !== d.model ||
          dbRow.ip !== d.ip ||
          dbRow.rip !== d.rip ||
          dbRow.splrate !== d.splrate ||
          dbRow.interval !== d.interval ||
          dbRow.ver !== d.ver ||
          dbRow.tags !== d.tags ||
          dbRow.checkin !== d.checkin)
      );
    });
    console.log('[syncRnDevicesRel] toUpdate:', JSON.stringify(toUpdate, null, 2));
    toUpdate.forEach((d, i) => {
      console.log(`[syncRnDevicesRel] toUpdate[${i}]: mac=${d.mac}, oldMac=${d.oldMac}, newMac=${d.newMac}`);
    });

    // 등록 처리
    if (finalToInsert.length) {
      await createDevicesAndRelationsFn(
        finalToInsert.map((d) => ({
          school_no,
          mac: d.mac,
          name: d.name,
          summary: d.summary,
          kind: d.kind,
          extra: d.extra ?? null,
          sdate: d.sdate ?? null,
          edate: d.edate ?? null,
          model: d.model ?? null,
          ip: d.ip ?? null,
          rip: d.rip ?? null,
          splrate: d.splrate ?? null,
          interval: d.interval ?? null,
          ver: d.ver ?? null,
          tags: d.tags ?? null,
          checkin: d.checkin ?? null,
        })),
        conn,
        meta,
      );
    }

    // mac 변경 처리
    if (toChangeMac.length) {
      await updateDevicesAndRelationsFn(
        toChangeMac.map((d) => ({
          school_no,
          mac: d.mac,
          name: d.name,
          summary: d.summary,
          kind: d.kind,
          extra: d.extra,
          sdate: d.sdate,
          edate: d.edate,
          model: d.model,
          ip: d.ip,
          rip: d.rip,
          splrate: d.splrate,
          interval: d.interval,
          ver: d.ver,
          tags: d.tags,
          checkin: d.checkin,
          oldMac: d.oldMac,
          newMac: d.newMac,
        })),
        conn,
        meta,
        topLevelSchoolNo ?? school_no,
      );
    }

    // 일반 업데이트 처리
    if (toUpdate.length) {
      await updateDevicesAndRelationsFn(
        toUpdate.map((d) => ({
          school_no,
          mac: d.mac,
          name: d.name,
          summary: d.summary,
          kind: d.kind,
          extra: d.extra,
          sdate: d.sdate,
          edate: d.edate,
          model: d.model,
          ip: d.ip,
          rip: d.rip,
          splrate: d.splrate,
          interval: d.interval,
          ver: d.ver,
          tags: d.tags,
          checkin: d.checkin,
        })),
        conn,
        meta,
        topLevelSchoolNo ?? school_no,
      );
    }

    // mac 변경 후 DB에서 다시 조회
    dbRows = await findRnDevicesRelBySchoolNo({ school_no, limit: 1000000, offset: 0 });

    // 삭제 대상 재계산 (mac 변경 요청(oldMac)도 삭제 대상에서 제외)
    const changeMacOldMacs = new Set(
      incoming
        .filter((d) => typeof d.oldMac === 'string' && typeof d.newMac === 'string')
        .map((d) => (typeof d.oldMac === 'string' ? d.oldMac.toLowerCase() : '')),
    );
    const toDelete = dbRows.filter(
      (d) => !incomingMacs.has(d.mac.toLowerCase()) && !changeMacOldMacs.has(d.mac.toLowerCase()),
    );

    // 삭제 처리
    if (toDelete.length) {
      await softDeleteRnDevicesRel(
        toDelete.map((d) => ({ mac: d.mac, school_no })),
        conn,
      );
      await softDeleteRnDevice(
        toDelete.map((d) => ({ mac: d.mac })),
        conn,
      );
      for (const d of toDelete) {
        const logParams = makeDeleteLogParams({
          manager_no: meta.manager_no,
          school_no: topLevelSchoolNo ?? school_no,
          ip: getHeader(meta.req, 'x-forwarded-for'),
          user_agent: getHeader(meta.req, 'user-agent'),
          action_type: 'D',
          target_table: 'rnDevicesRel',
          target_id: d.mac,
          old_values: d,
          reason: '센서 삭제',
        });
        await logAction(logParams);
      }
    }

    await commitTransaction(conn);
    return { success: true };
  } catch (error) {
    await rollbackTransaction(conn);
    console.error('[syncRnDevicesRel] 에러:', error);
    throw error;
  }
}

// 내부 private 센서등록  함수
async function createDevicesAndRelationsFn(
  dtos: createRnDevicesRelServiceDto[],
  conn: PoolConnection,
  meta: RequestMeta,
) {
  console.log('[createDevicesAndRelationsFn] dtos:', JSON.stringify(dtos, null, 2));
  for (const dto of dtos) {
    const exists = await findRelByMac(dto.mac, conn);
    if (exists) {
      throw new Error('이미 등록된 mac 주소 입니다. (학교마다 mac주소는 유일해야 합니다)');
    }
  }
  await insertRnDevicesRel(
    dtos.map((dto) => ({
      school_no: dto.school_no,
      mac: dto.mac,
      name: dto.name,
      summary: dto.summary,
      kind: dto.kind,
      extra: dto.extra ?? null,
      sdate: dto.sdate ?? null,
      edate: dto.edate ?? null,
    })),
    conn,
  );
  for (const dto of dtos) {
    const logParams = makeInsertLogParams({
      manager_no: meta.manager_no,
      school_no: meta.school_no,
      ip: getHeader(meta.req, 'x-forwarded-for'),
      user_agent: getHeader(meta.req, 'user-agent'),
      action_type: 'I',
      target_table: 'rnDevicesRel',
      target_id: dto.mac,
      new_values: dto,
      reason: '센서 등록',
    });
    await logAction(logParams);
  }
  const macList = dtos.map((dto) => dto.mac);
  const existingRows = await findDevicesByMacs(macList, conn);
  const existingMacs = new Set(existingRows.map((row) => row.mac));
  const newDeviceDtos = dtos.filter((dto) => !existingMacs.has(dto.mac));
  if (newDeviceDtos.length > 0) {
    await insertRnDevices(
      newDeviceDtos.map((dto) => ({
        mac: dto.mac,
        model: dto.model,
        ip: dto.ip ?? null,
        rip: dto.rip ?? null,
        splrate: dto.splrate ?? null,
        interval: dto.interval ?? null,
        ver: dto.ver ?? null,
        tags: dto.tags ?? null,
        checkin: dto.checkin ?? null,
      })),
      conn,
    );
    for (const dto of newDeviceDtos) {
      const logParams = makeInsertLogParams({
        manager_no: meta.manager_no,
        school_no: meta.school_no,
        ip: getHeader(meta.req, 'x-forwarded-for'),
        user_agent: getHeader(meta.req, 'user-agent'),
        action_type: 'I',
        target_table: 'rnDevices',
        target_id: dto.mac,
        new_values: dto,
        reason: '센서 등록',
      });
      await logAction(logParams);
    }
  }
}

// 내부 private 센서수정  함수
async function updateDevicesAndRelationsFn(
  dtos: updateRnDevicesRelServiceDto[],
  conn: PoolConnection,
  meta: RequestMeta,
  school_no: number,
) {
  console.log('[updateDevicesAndRelationsFn] dtos:', JSON.stringify(dtos, null, 2));
  const macChangeDtos = dtos.filter(
    (dto): dto is updateRnDevicesRelServiceDto & { oldMac: string; newMac: string } =>
      typeof dto.oldMac === 'string' && typeof dto.newMac === 'string',
  );
  console.log('[updateDevicesAndRelationsFn] macChangeDtos:', JSON.stringify(macChangeDtos, null, 2));
  if (macChangeDtos.length > 0) {
    for (const dto of macChangeDtos) {
      try {
        console.log(
          `[updateDevicesAndRelationsFn] updateMac 호출 전: school_no=${dto.school_no}, oldMac=${dto.oldMac}, newMac=${dto.newMac}`,
        );
        await updateMac(
          [
            {
              school_no: dto.school_no,
              oldMac: dto.oldMac,
              newMac: dto.newMac,
            },
          ],
          conn,
        );
        console.log(
          `[updateDevicesAndRelationsFn] mac 변경 성공: school_no=${dto.school_no}, oldMac=${dto.oldMac}, newMac=${dto.newMac}`,
        );
      } catch (error) {
        console.error(
          `[updateDevicesAndRelationsFn] mac 변경 실패: school_no=${dto.school_no}, oldMac=${dto.oldMac}, newMac=${dto.newMac}, 에러:`,
          error,
        );
        throw error;
      }
    }
  }
  const normalUpdateDtos = dtos.filter((dto) => !(dto.oldMac && dto.newMac));
  console.log('[updateDevicesAndRelationsFn] normalUpdateDtos:', JSON.stringify(normalUpdateDtos, null, 2));
  for (const dto of normalUpdateDtos) {
    console.log(`[updateDevicesAndRelationsFn] updateRnDevicesRel 호출: mac=${dto.mac}`);
    await updateRnDevicesRel(
      [
        {
          mac: dto.mac,
          name: dto.name,
          summary: dto.summary,
          kind: dto.kind,
          extra: dto.extra ?? null,
          sdate: dto.sdate ?? null,
          edate: dto.edate ?? null,
        },
      ],
      conn,
    );
    console.log(`[updateDevicesAndRelationsFn] updateRnDevicesRel 완료: mac=${dto.mac}`);
  }
  for (const dto of dtos) {
    const logParams = makeUpdateLogParams({
      manager_no: meta.manager_no,
      school_no,
      ip: getHeader(meta.req, 'x-forwarded-for'),
      user_agent: getHeader(meta.req, 'user-agent'),
      action_type: 'U',
      target_table: 'rnDevicesRel',
      target_id: dto.mac,
      new_values: dto,
      reason: '센서 수정',
    });
    await logAction(logParams);
  }
  const macList = normalUpdateDtos.map((dto) => dto.mac);
  console.log('[updateDevicesAndRelationsFn] macList for updateDevice:', JSON.stringify(macList, null, 2));
  const existingRows = await findDevicesByMacs(macList, conn);
  console.log(
    '[updateDevicesAndRelationsFn] existingRows from findDevicesByMacs:',
    JSON.stringify(existingRows, null, 2),
  );
  const existingMacs = new Set(existingRows.map((row) => row.mac));
  const newDeviceDtos = normalUpdateDtos.filter((dto) => !existingMacs.has(dto.mac));
  console.log('[updateDevicesAndRelationsFn] newDeviceDtos for updateDevice:', JSON.stringify(newDeviceDtos, null, 2));
  for (const dto of newDeviceDtos) {
    console.log(`[updateDevicesAndRelationsFn] updateDevice 호출: mac=${dto.mac}`);
    await updateDevice(
      [
        {
          mac: dto.mac,
          model: dto.model ?? '',
          ip: dto.ip ?? null,
          rip: dto.rip ?? null,
          splrate: dto.splrate ?? null,
          interval: dto.interval ?? null,
          ver: dto.ver ?? null,
          tags: dto.tags ?? null,
          checkin: dto.checkin ?? null,
        },
      ],
      conn,
    );
    console.log(`[updateDevicesAndRelationsFn] updateDevice 완료: mac=${dto.mac}`);
  }
}

function getHeader(req: unknown, key: string): string | null {
  if (
    req &&
    typeof req === 'object' &&
    'headers' in req &&
    req.headers &&
    typeof req.headers === 'object' &&
    typeof (req.headers as { get?: unknown }).get === 'function'
  ) {
    return (req.headers as { get: (key: string) => string | null }).get(key) ?? null;
  }
  return null;
}

export { findBySchoolNo };

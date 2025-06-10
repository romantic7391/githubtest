import { insertGroup, findGroups } from '@/models/group/group-model';
import { Group } from '@/types/permission';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';

import { LogMeta } from '@/types/history';
import { Pagination } from '@/types/common';
import { exec, getRow } from '@/lib/mariadb/query';

interface UpdateGroupDto {
  name?: string;
  schoolNo?: number | null;
  parentGroupNo?: number | null;
}

async function getGroupById(groupNo: number) {
  const query = 'SELECT * FROM `group` WHERE group_no = ?';
  return getRow(query, [groupNo]);
}

async function updateGroupById(groupNo: number, data: UpdateGroupDto) {
  const query = `
    UPDATE \`group\`
    SET name = COALESCE(?, name),
        school_no = COALESCE(?, school_no),
        parent_group_no = COALESCE(?, parent_group_no)
    WHERE group_no = ?
  `;
  const params = [data.name ?? null, data.schoolNo ?? null, data.parentGroupNo ?? null, groupNo];
  return exec(query, params);
}

// 그룹 목록 조회
export async function getGroupsS(pagination: Pagination, filters?: { name?: string; schoolNo?: number }) {
  try {
    return await findGroups(pagination, filters);
  } catch (error) {
    throw error;
  }
}

// 그룹 생성
export async function createGroupS(dto: Group, meta: LogMeta) {
  let conn;
  try {
    console.log('Creating group with data:', dto);
    console.log('Meta data:', meta);

    // 1. 그룹 생성
    conn = await beginTransaction();
    console.log('Transaction started');

    const result = await insertGroup(dto, conn);
    console.log('Group inserted:', result);

    // 2. 로그 기록
    const logParams = makeLogParams({
      manager_no: meta.manager_no,
      ip: meta.ip,
      user_agent: meta.user_agent,
      action_type: 'I',
      target_table: 'group',
      target_id: result.insertId.toString(),
      new_values: JSON.stringify(dto),
      reason: `그룹 생성: ${dto.name}`,
    });
    console.log('Log params:', logParams);

    await logAction(logParams, conn);
    console.log('Action logged');

    await commitTransaction(conn);
    console.log('Transaction committed');

    return result;
  } catch (error) {
    console.error('Error in createGroupS:', error);
    if (conn) {
      await rollbackTransaction(conn);
      console.log('Transaction rolled back');
    }
    throw error;
  }
}

// 그룹 수정
export async function updateGroupS(groupNo: number, data: UpdateGroupDto, meta: LogMeta) {
  let conn;
  try {
    // 1. 기존 데이터 조회
    const oldData = await getGroupById(groupNo);
    if (!oldData) {
      throw new Error('그룹을 찾을 수 없습니다.');
    }

    // 2. 그룹 업데이트
    conn = await beginTransaction();
    const result = await updateGroupById(groupNo, data);

    // 3. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'U',
        target_table: 'group',
        target_id: groupNo.toString(),
        old_values: JSON.stringify(oldData),
        new_values: JSON.stringify({ ...oldData, ...data, updated_at: new Date().toISOString() }),
        reason: `그룹 수정: group_no ${groupNo}`,
      }),
      conn,
    );

    await commitTransaction(conn);
    return result;
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    throw error;
  }
}

// 그룹 삭제
export async function deleteGroupS(groupNo: number, meta: LogMeta) {
  let conn;
  try {
    // 1. 그룹 삭제
    conn = await beginTransaction();
    const result = await exec('DELETE FROM `group` WHERE group_no = ?', [groupNo]);

    // 2. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'D',
        target_table: 'group',
        target_id: groupNo.toString(),
        new_values: JSON.stringify({ group_no: groupNo, deleted: new Date().toISOString() }),
        old_values: '',
        reason: `그룹 삭제: group_no ${groupNo}`,
      }),
      conn,
    );

    await commitTransaction(conn);
    return result;
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    throw error;
  }
}

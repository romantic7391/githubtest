import { exec, getAll, getRow } from '@/lib/mariadb/query';
import { FindManagersDto, InsertManagerDto, Manager, UpdateManagerDto, UpdatePasswordDto } from '@/types/manager';
import type { User, UserWithPassword } from '@/types/next-auth';
import type { PoolConnection } from 'mariadb';

export async function findManagerBySignInId(signInId: string, conn?: PoolConnection) {
  try {
    const query = `
      SELECT
        no as managerNo
        , school_no as schoolNo
        , login_id as signInId
        , name
      FROM manager
      WHERE login_id = ?
    `;
    const params = [signInId];

    const result = await getRow(query, params, undefined, conn);

    return result as User | null;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function findManagerWithPasswordBySignInId(signInId: string, conn?: PoolConnection) {
  try {
    const query = `
      SELECT
        no as managerNo
        , school_no as schoolNo
        , login_id as signInId
        , name
        , passwd as hashedPassword
        , login_attempt_count as signInAttemptCount
        , approved_status as approvedStatus
        , locked
      FROM manager
      WHERE login_id = ?
    `;
    const params = [signInId];

    const result = await getRow(query, params, undefined, conn);

    return result as UserWithPassword | null;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function findManagers(dto: FindManagersDto, conn?: PoolConnection) {
  const offset = (dto.pagination.page - 1) * dto.pagination.pageSize;
  const conditions = ['1 = 1'];
  const params: Array<string | number | null> = [];

  if (dto.filters.name) {
    conditions.push('m.name LIKE ?');
    params.push(`%${dto.filters.name}%`);
  }

  if (dto.filters.signInId) {
    conditions.push('m.login_id LIKE ?');
    params.push(`%${dto.filters.signInId}%`);
  }

  if (dto.filters.area) {
    conditions.push('s.area = ?');
    params.push(dto.filters.area);
  }

  if (dto.filters.scode) {
    conditions.push('s.scode = ?');
    params.push(dto.filters.scode);
  }

  if (dto.filters.schoolNo !== undefined) {
    conditions.push('m.school_no = ?');
    params.push(dto.filters.schoolNo);
  }

  const countQuery = `
    SELECT COUNT(m.\`no\`) as total
    FROM manager AS m
    LEFT JOIN rnSchool AS s ON m.school_no = s.school_no
    WHERE ${conditions.join(' AND ')}
  `;

  const totalResult = await getRow<{ total: number }>(countQuery, params);
  const total = totalResult?.total || 0;

  const query = `
    SELECT
      m.no as managerNo
      , m.school_no AS schoolNo
      , m.login_id AS signInId
      , m.name
      , m.last_passwd_changed AS lastPasswordChanged
      , m.login_attempt_count AS signInAttpemptCount
      , m.approved_status AS approvedStatus
      , m.locked
      , m.created
      , m.updated
    FROM manager AS m
    LEFT JOIN rnSchool AS s ON m.school_no = s.school_no
    WHERE ${conditions.join(' AND ')}
    ORDER BY s.school_no, m.no
    LIMIT ? OFFSET ?
  `;

  const managers = await getAll<Manager>(query, [...params, dto.pagination.pageSize, offset], undefined, conn);
  return { managers, total };
}

export async function findManagerByNo(managerNo: number, conn?: PoolConnection) {
  try {
    const query = `
      SELECT
        m.no as managerNo
        , m.school_no AS schoolNo
        , m.login_id AS signInId
        , m.name
        , m.last_passwd_changed AS lastPasswordChanged
        , m.login_attempt_count AS signInAttpemptCount
        , m.approved_status AS approvedStatus
        , m.locked
        , m.created
        , m.updated
      FROM manager AS m
      WHERE m.no = ?
    `;
    const params = [managerNo];

    const result = await getRow<Manager>(query, params, undefined, conn);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function findPasswordByNo(managerNo: number, conn?: PoolConnection) {
  try {
    const query = `
      SELECT passwd, salt FROM manager WHERE no = ?
    `;
    const params = [managerNo];

    const result = await getRow<{ password: string; salt: string }>(
      query,
      params,
      { password: 'passwd', salt: 'salt' },
      conn,
    );
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function insertManager(dto: InsertManagerDto, conn?: PoolConnection) {
  try {
    const query = `
      INSERT INTO manager
      (
        school_no
        , login_id
        , name
        , passwd
        , salt
      )
      VALUES (
        ?
        , ?
        , ?
        , ?
        , ?
      )
    `;

    const params = [dto.schoolNo, dto.signInId, dto.name, dto.hashedPassword, dto.salt];

    const result = await exec(query, params, conn);
    return { insertId: result.insertId };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function addSignInAttemptCount(managerNo: number, conn?: PoolConnection) {
  try {
    const query = `
      UPDATE manager
      SET
        login_attempt_count = login_attempt_count + 1
        , updated = NOW()
      WHERE no = ?
    `;
    const params = [managerNo];
    return await exec(query, params, conn);
  } catch (error) {
    throw error;
  }
}

export async function lockAccount(dto: { managerNo: number; signInAttemptCount: number }, conn?: PoolConnection) {
  try {
    const query = `
      UPDATE manager
      SET
        locked = 'Y'
        , login_attempt_count = ?
        , updated = NOW()
      WHERE no = ?  
    `;
    const params = [dto.signInAttemptCount, dto.managerNo];
    return await exec(query, params, conn);
  } catch (error) {
    throw error;
  }
}

export async function resetSignInAttemptCount(managerNo: number, conn?: PoolConnection) {
  try {
    const query = `
      UPDATE manager
      SET
        login_attempt_count = 0
        , updated = NOW()
      WHERE no = ?
    `;
    const params = [managerNo];
    return await exec(query, params, conn);
  } catch (error) {
    throw error;
  }
}

export async function updateManager(dto: UpdateManagerDto, conn?: PoolConnection) {
  try {
    const query = `
      UPDATE manager
      SET
        name = ?
        , approved_status = ?
        , locked = ?
        , updated = NOW()
      WHERE no = ?
    `;

    const params: Array<string | number | null> = [dto.name, dto.approvedStatus, dto.locked, dto.managerNo];

    const result = await exec(query, params, conn);
    return { affectedRows: result.affectedRows };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function updatePassword(dto: UpdatePasswordDto, conn?: PoolConnection) {
  try {
    const query = `
      UPDATE manager
      SET
        passwd = ?
        , salt = ?
        , last_passwd_changed = NOW()
        , updated = NOW()
      WHERE no = ?
    `;

    const params: Array<string | number | null> = [dto.password, dto.salt, dto.managerNo];

    const result = await exec(query, params, conn);
    return { affectedRows: result.affectedRows };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteManager(managerNo: number, conn?: PoolConnection) {
  try {
    const query = `
      DELETE FROM manager WHERE no = ?
    `;
    const params = [managerNo];

    const result = await exec(query, params, conn);
    return { affectedRows: result.affectedRows };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

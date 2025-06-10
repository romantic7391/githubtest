import { getRow } from '@/lib/mariadb/query';
import type { User, UserWithPassword } from '@/types/next-auth';
import type { PoolConnection } from 'mariadb';

export async function findManagerBySignInId(signInId: string, conn?: PoolConnection) {
  try {
    const query = `
      SELECT
        no
        , school_no
        , login_id
        , name
      FROM manager
      WHERE login_id = ?
    `;
    const params = [signInId];

    const result = await getRow(
      query,
      params,
      {
        managerNo: 'no',
        schoolNo: 'school_no',
        signInId: 'login_id',
        name: 'name',
      },
      conn,
    );

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
        no
        , school_no
        , login_id
        , name
        , passwd
      FROM manager
      WHERE login_id = ?
    `;
    const params = [signInId];

    const result = await getRow(
      query,
      params,
      {
        managerNo: 'no',
        schoolNo: 'school_no',
        signInId: 'login_id',
        name: 'name',
        hashedPassword: 'passwd',
      },
      conn,
    );

    return result as UserWithPassword | null;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

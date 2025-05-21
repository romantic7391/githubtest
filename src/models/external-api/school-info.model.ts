import { getRow } from '@/lib/mariadb/query';

export async function existsRnSchoolByAdministrationCode(administrationcode: string): Promise<boolean> {
  const query = `SELECT 1 FROM rnschool WHERE administrationcode = ? LIMIT 1`;
  const row = await getRow(query, [administrationcode]);
  return !!row;
}

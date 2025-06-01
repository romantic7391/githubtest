import { getOne } from '@/lib/mariadb/query';

export async function findLastScholNo() {
  try {
    const query = `
      SELECT MAX(school_no) as lastSchoolNo
      FROM rnSchool
    `;

    const result = await getOne(query);

    return result?.lastSchoolNo ?? 0;
  } catch (error) {
    console.error('Error in findLastScholNo:', error);
    throw error;
  }
}

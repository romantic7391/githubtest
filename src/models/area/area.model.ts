import { getAll, exec } from '@/lib/mariadb/query';
import type { Area, AreaCreate } from '@/types/area';
import type { PoolConnection } from 'mariadb';

// 지역들 조회
export async function findAreas(
  page: number = 1,
  limit: number = 10,
  areas: string[] = [],
): Promise<{ areas: Area[]; total: number }> {
  const offset = (page - 1) * limit;

  const placeholders = areas && areas.length > 0 ? `(${areas.map(() => '?').join(',')})` : '';

  const countQuery = `
    SELECT COUNT(*) as total
    FROM AreaData as ad
    ${areas && areas.length > 0 ? `WHERE ad.area IN ${placeholders}` : ''};
  `;

  const dataQuery = `
    SELECT 
      ad.area_no AS areaNo, 
      ad.area,
      ad.X,
      ad.Y,
      ad.areacode AS areaCode
    FROM AreaData as ad
    ${areas && areas.length > 0 ? `WHERE ad.area IN ${placeholders}` : ''}
    ORDER BY ad.area_no
    LIMIT ? OFFSET ?;
  `;

  const params = areas && areas.length > 0 ? [...areas, limit, offset] : [limit, offset];

  const [totalResult] = await getAll<{ total: number }>(countQuery, areas && areas.length > 0 ? areas : []);
  const areasData = await getAll<Area>(dataQuery, params);

  return {
    areas: areasData,
    total: totalResult.total,
  };
}

// 지역 조회
export async function findAreaByArea(area: string): Promise<Area[]> {
  const query = `
    SELECT 
      ad.area_no AS areaNo, 
      ad.area,
      ad.X,
      ad.Y,
      ad.areacode AS areaCode
    FROM AreaData as ad
    WHERE ad.area = ?;
  `;
  return await getAll<Area>(query, [area]);
}

// 지역 생성
export async function insertArea(dto: AreaCreate, conn?: PoolConnection): Promise<void> {
  const query = `
    INSERT INTO AreaData (area, X, Y, areacode)
    VALUES (?, ?, ?, ?);
  `;
  const params = [dto.area, dto.x, dto.y, dto.areaCode];

  await exec(query, params, conn);
}

// 지역 수정
export async function updateAreaInfo(dto: Area, conn?: PoolConnection): Promise<void> {
  const sql = `
    UPDATE AreaData
    SET area = ?,
        x = ?,
        y = ?,
        areaCode = ?
    WHERE area = ?
  `;

  await exec(sql, [dto.area, dto.x, dto.y, dto.areaCode, dto.area], conn);
}

// 지역 삭제
export async function deleteAreaFromDB(area: string, conn?: PoolConnection): Promise<void> {
  const sql = `
    DELETE FROM AreaData
    WHERE area = ?
  `;
  await exec(sql, [area], conn);
}

// 지역 중복 검증
export async function checkAreaExists(area: string): Promise<boolean> {
  const sql = `
    SELECT COUNT(*) as count
    FROM AreaData
    WHERE area = ?
  `;
  const result = await getAll<{ count: number }>(sql, [area]);
  return result[0].count > 0;
}

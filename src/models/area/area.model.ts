import { getAll, exec } from '@/lib/mariadb/query';
import type { Area, AreaCreate } from '@/types/area';

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
    ad.X ,
    ad.Y ,
    ad.areacode AS areaCode
  FROM AreaData as ad
  where ad.area = ?;   
`;

  const params = [area];
  return await getAll<Area>(query, params);
}

// 지역 생성
export async function insertArea(dto: AreaCreate): Promise<void> {
  const query = `
    INSERT INTO AreaData (area, X, Y, areacode)
    VALUES (?, ?, ?, ?);
  `;
  const params = [dto.area, dto.x, dto.y, dto.areaCode];

  await exec(query, params);
}

// 지역 수정
export async function updateAreaInfo(dto: Area): Promise<void> {
  // 1. 먼저 area로 areaNo를 찾습니다
  const findQuery = `
    SELECT area_no
    FROM AreaData
    WHERE area = ?;
  `;
  const [areaData] = await getAll<{ area_no: number }>(findQuery, [dto.area]);

  if (!areaData) {
    throw new Error('수정할 지역을 찾을 수 없습니다.');
  }

  // 2. 찾은 areaNo로 업데이트
  const updateQuery = `
    UPDATE AreaData 
    SET area = ?, X = ?, Y = ?, areacode = ? 
    WHERE area_no = ?;
  `;

  const params = [dto.area, dto.x, dto.y, dto.areaCode, areaData.area_no];
  await exec(updateQuery, params);
}

// 지역 삭제
export async function deleteAreaFromDB(area: string): Promise<void> {
  const query = `
    DELETE FROM AreaData WHERE area = ?;
  `;

  await exec(query, [area]);
}

// 지역 중복 검증
export async function checkAreaExists(area: string, excludeAreaNo?: number): Promise<boolean> {
  const query = `
  SELECT 
    ad.area_no,
    ad.area
  FROM AreaData as ad
  WHERE ad.area = ?
  ${excludeAreaNo ? 'AND ad.area_no != ?' : ''}
  LIMIT 1;   
`;

  const params = excludeAreaNo ? [area, excludeAreaNo] : [area];
  const result = await getAll<Area>(query, params);
  return result.length > 0;
}

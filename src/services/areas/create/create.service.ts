import { insertArea, checkAreaExists } from '@/models/area/area.model';

import type { AreaCreate } from '@/types/area';

/**
 * 지역 학교 추가
 */
// 지역 중복 검증
export async function existsAreaByAreaName(area: string): Promise<boolean> {
  return await checkAreaExists(area);
}

// 지역 생성
export async function createArea(dto: AreaCreate): Promise<void> {
  try {
    // 중복 검증
    const exists = await checkAreaExists(dto.area);
    if (exists) {
      throw new Error('이미 존재하는 지역명입니다.');
    }

    await insertArea(dto);
  } catch (error) {
    console.error('[createAreaService] 지역 생성 중 오류:', error);
    throw error instanceof Error ? error : new Error('지역 생성 중 오류가 발생했습니다.');
  }
}

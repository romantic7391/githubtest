import { findAreas } from '@/models/area/area.model';

// 지역 조회
export async function getAreas(page: number = 1, limit: number = 10, areas: string[] = []) {
  try {
    return await findAreas(page, limit, areas);
  } catch (error) {
    // 내부 에러 정보는 콘솔에만 남김
    console.error('[getAreasService] DB 조회 에러:', error);
    throw new Error('학교 목록 조회 중 오류가 발생했습니다.');
  }
}

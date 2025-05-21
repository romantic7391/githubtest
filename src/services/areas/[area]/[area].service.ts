import { findAreaByArea, updateAreaInfo, deleteAreaFromDB, checkAreaExists } from '@/models/area/area.model';

import type { Area } from '@/types/area';

// 지역 조회
export async function getAreaByArea(area: string) {
  try {
    return await findAreaByArea(area);
  } catch (error) {
    // 내부 에러 정보는 콘솔에만 남김
    console.error('[getAreaByAreaService] DB 조회 에러:', error);
    throw new Error('지역 목록 조회 중 오류가 발생했습니다.');
  }
}

// 지역 수정
export async function updateArea(dto: Area): Promise<void> {
  try {
    if (!dto.area) {
      throw new Error('지역명이 필요합니다.');
    }

    // 중복 검증 (자기 자신 제외)
    const exists = await checkAreaExists(dto.area);
    if (exists) {
      throw new Error('이미 존재하는 지역명입니다.');
    }

    await updateAreaInfo(dto);
  } catch (error) {
    console.error('[updateAreaService] 지역 수정 중 오류:', error);
    throw error instanceof Error ? error : new Error('지역 수정 중 오류가 발생했습니다.');
  }
}

// 지역 삭제
export async function deleteArea(area: string): Promise<void> {
  try {
    await deleteAreaFromDB(area);
  } catch (error) {
    console.error('[deleteAreaService] 학교 삭제 중 오류:', error);
    throw new Error('학교 삭제 중 오류가 발생했습니다.');
  }
}

import type { AreasApiResponse } from '@/types/area';
import { areaSchema } from '@/types/area';
import { NextRequest, NextResponse } from 'next/server';
import { getAreas } from '@/services/areas/areas.service';
import { handleError, handleZodError } from '@/utils/error.utils';
import { getCommonContext } from '@/utils/context.utils';

/**
 * 지역 목록 조회
 *
 * @todo 필터링 추가: `areaCode`를 여러 개 받아서 여러 지역 조회.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ area: string }> }) {
  try {
    await params; // area는 사용하지 않으므로 구조 분해 할당 제거
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const areas = searchParams.getAll('area');

    // 지역명 검증
    if (areas.length > 0) {
      for (const area of areas) {
        areaSchema.shape.area.parse(area);
      }
    }

    const commonContext = await getCommonContext(request);

    const { areas: areasData, total } = await getAreas(page, limit, areas.length > 0 ? areas : undefined, {
      managerNo: commonContext.managerNo,
      ip: commonContext.ip,
      userAgent: commonContext.userAgent,
      schoolNo: 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: '지역 목록 조회 성공',
        data: { areas: areasData, pagination: { page, pageSize: limit, total, totalPages: Math.ceil(total / limit) } },
      } satisfies AreasApiResponse,
      { status: 200 },
    );
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '지역 목록 조회');
  }
}

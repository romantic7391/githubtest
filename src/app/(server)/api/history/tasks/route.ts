import { getHistoriesS } from '@/services/history/history.service';
import { CommonContext } from '@/types/api-wrapper';
import { HistoriesApiResponse, selectHistoriesRequestDto } from '@/types/history';
import { withPermissionCheck } from '@/utils/api-wrapper.utils';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withPermissionCheck(async (request: NextRequest, commonContext: CommonContext) => {
  const searchParams = request.nextUrl.searchParams;

  const pagination = selectHistoriesRequestDto.shape.pagination.parse({
    page: searchParams.get('page'),
    pageSize: searchParams.get('pageSize'),
  });
  const filters = selectHistoriesRequestDto.shape.filters.parse({
    order: searchParams.get('order'),
  });

  const result = await getHistoriesS({ pagination, filters }, commonContext);

  return NextResponse.json({
    success: true,
    message: '',
    data: result,
  } satisfies HistoriesApiResponse);
});

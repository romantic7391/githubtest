import { getSignInHistoriesS } from '@/services/manager-signin-history/manager-signin-history.service';
import { CommonContext } from '@/types/api-wrapper';
import { selectSignInHistoriesRequestDto, SelectSignInHistoriesResponseDto } from '@/types/manager-signin-history';
import { withPermissionCheck } from '@/utils/api-wrapper.utils';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withPermissionCheck(async (request: NextRequest, commonContext: CommonContext) => {
  const searchParams = request.nextUrl.searchParams;

  const pagination = selectSignInHistoriesRequestDto.shape.pagination.parse({
    page: searchParams.get('page'),
    pageSize: searchParams.get('pageSize'),
  });
  const filters = selectSignInHistoriesRequestDto.shape.filters.parse(Object.fromEntries(searchParams.entries()));

  const result = await getSignInHistoriesS({ pagination, filters }, commonContext);

  return NextResponse.json({
    success: true,
    message: '',
    data: result,
  } as SelectSignInHistoriesResponseDto);
});

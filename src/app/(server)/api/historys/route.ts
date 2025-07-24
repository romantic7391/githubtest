import { getHistorysS } from '@/services/history/history.service';
import { CommonContext } from '@/types/api-wrapper';
import { selectHistoryDtoSchema } from '@/types/history';
import { withPermissionCheck } from '@/utils/api-wrapper.utils';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withPermissionCheck(async (request: NextRequest, commonContext: CommonContext) => {
  const searchParams = request.nextUrl.searchParams;

  const pagination = selectHistoryDtoSchema.shape.pagination.parse({
    page: searchParams.get('page'),
    pageSize: searchParams.get('pageSize'),
  });
  const filters = selectHistoryDtoSchema.shape.filters.parse({
    area: searchParams.get('area'),
    schoolNo: searchParams.get('schoolNo'),
    groupNo: searchParams.get('groupNo'),
    managerNo: searchParams.get('managerNo'),
    ip: searchParams.get('ip'),
    userAgent: searchParams.get('userAgent'),
    actionType: searchParams.get('actionType'),
    reason: searchParams.get('reason'),
    startDate: searchParams.get('startDate'),
    endDate: searchParams.get('endDate'),
    order: searchParams.get('order'),
  });

  const result = await getHistorysS({ pagination, filters }, commonContext);

  return NextResponse.json({
    success: true,
    message: '',
    data: result,
  });
});

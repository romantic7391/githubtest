import { getHistoryS } from '@/services/history/history.service';
import { CommonContext, PermissionParams } from '@/types/api-wrapper';
import { historyNoSchema, SelectHistoryResponseDto } from '@/types/history';
import { withPermissionCheck } from '@/utils/api-wrapper.utils';
import { NextRequest, NextResponse } from 'next/server';

interface GetHistoryParams extends PermissionParams {
  schoolNo: undefined;
  managerNo: undefined;
  managerSignInId: undefined;
  historyNo: string;
}

export const GET = withPermissionCheck<GetHistoryParams>(
  async (_: NextRequest, { params }, commonContext: CommonContext) => {
    const { historyNo } = historyNoSchema.parse(await params);

    const result = await getHistoryS(historyNo, commonContext);

    return NextResponse.json({
      success: true,
      message: '',
      data: result,
    } satisfies SelectHistoryResponseDto);
  },
);

import { getHistoryS } from '@/services/history/history.service';
import { CommonContext } from '@/types/api-wrapper';
import { HistoryNo, historyNoSchema } from '@/types/history';
import { withPermissionCheck } from '@/utils/api-wrapper.utils';
import { NextRequest, NextResponse } from 'next/server';

interface Params extends HistoryNo {
  schoolNo: undefined;
}

export const GET = withPermissionCheck<Params>(
  async (_: NextRequest, { params }: { params: Promise<Params> }, commonContext: CommonContext) => {
    const historyNo = historyNoSchema.parse(await params).historyNo;

    const result = await getHistoryS(historyNo, commonContext);

    return NextResponse.json({
      success: true,
      message: '',
      data: result,
    });
  },
);

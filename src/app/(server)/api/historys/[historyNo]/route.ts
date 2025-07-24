import { getHistoryS } from '@/services/history/history.service';
import { CommonContext, PermissionParams } from '@/types/api-wrapper';
import { historyNoSchema } from '@/types/history';
import { withPermissionCheck } from '@/utils/api-wrapper.utils';
import { NextRequest, NextResponse } from 'next/server';

interface HistoryNoParams extends PermissionParams {
  historyNo: string;
}

export const GET = withPermissionCheck<HistoryNoParams>(
  async (_: NextRequest, { params }, commonContext: CommonContext) => {
    const { historyNo: no } = await params;
    const historyNo = historyNoSchema.shape.historyNo.parse(no);
    const result = await getHistoryS(historyNo, commonContext);

    return NextResponse.json({
      success: true,
      message: '',
      data: result,
    });
  },
);

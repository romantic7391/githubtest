import { getSignInHistoryS } from '@/services/manager-signin-history/manager-signin-history.service';
import { CommonContext, PermissionParams } from '@/types/api-wrapper';
import { managerSignInHistorySchema, SelectSignInHistoryResponseDto } from '@/types/manager-signin-history';
import { withPermissionCheck } from '@/utils/api-wrapper.utils';
import { NextRequest, NextResponse } from 'next/server';

interface GetHistoryParams extends PermissionParams {
  schoolNo: undefined;
  managerNo: undefined;
  managerSignInId: undefined;
  historyNo: string;
}

export const GET = withPermissionCheck<GetHistoryParams>(
  async (request: NextRequest, { params }, commonContext: CommonContext) => {
    const { historyNo } = managerSignInHistorySchema.pick({ historyNo: true }).parse(await params);

    if (!historyNo) {
      throw new Error('이력 번호가 필요합니다.');
    }

    const result = await getSignInHistoryS(historyNo, commonContext);

    return NextResponse.json({
      success: true,
      message: '',
      data: result,
    } as SelectSignInHistoryResponseDto);
  },
);

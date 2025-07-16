import { NextRequest, NextResponse } from 'next/server';
import { handleError } from '@/utils/error.utils';
import { withPermissionCheck } from '@/utils/api-wrapper.utils';
import { CommonContext } from '@/types/api-wrapper';

interface UserParams {
  area: string;
  schoolNo: string;
}

/**
 * 지역 학교 사용자 목록 조회
 */
export const GET = withPermissionCheck<UserParams>(
  async (request: NextRequest, { params }: { params: Promise<UserParams> }, commonContext: CommonContext) => {
    try {
      const { area, schoolNo } = await params;

      // TODO: 사용자 목록 조회 로직 구현
      // const users = await getUsers({ area, schoolNo: Number(schoolNo) }, commonContext);
      console.log('사용자 목록 조회 요청:', { area, schoolNo, managerNo: commonContext.managerNo });

      return NextResponse.json(
        {
          success: true,
          message: '사용자 목록이 성공적으로 조회되었습니다.',
          data: [], // TODO: 실제 사용자 데이터로 교체
        },
        { status: 200 },
      );
    } catch (error) {
      return handleError(error, '사용자 목록 조회');
    }
  },
);

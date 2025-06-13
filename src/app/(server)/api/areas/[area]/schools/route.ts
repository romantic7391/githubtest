import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
// import { DEFAULT_ERROR_MESSAGE_500 } from '@/types/common';
// import type { BaseApiResponse } from '@/types/common';
import type { SchoolsApiResponse } from '@/types/school';
import { schoolListFilterSchema } from '@/types/school';
import { NextRequest, NextResponse } from 'next/server';
import { getRnSchoolsByArea } from '@/services/areas/[area]/schools/schools.service';
import { getClientInfo } from '@/services/log-action/log-action.service';
import { AppError } from '@/utils/error.utils';
import { handleError, handleZodError } from '@/utils/error.utils';
import { auth } from '@/auth';
import { Session } from 'next-auth';
import { paginationSchema } from '@/types/common';

/**
 * 공통 컨텍스트 정보 가져오기
 */
async function getCommonContext(request: NextRequest) {
  let session = await auth();
  if (process.env.WORKING_ON_BACKEND_DEVELOPMENT === '1') {
    session = {
      ...session,
      user: {
        ...session?.user,
        managerNo: 1,
      },
    } as Session;
  }
  if (!session?.user.managerNo) {
    throw new AppError('로그인이 필요합니다.', 401);
  }
  const { userAgent, ip } = getClientInfo(request);

  return {
    manager_no: session.user.managerNo,
    ip: ip || '',
    user_agent: userAgent || '',
  };
}

/**
 * 지역 학교 목록 조회
 *
 * @todo area가 `all`일 경우 모든 지역의 학교 목록 조회.
 * @todo 필터링 추가: `sname`을 받아서 학교 이름으로 학교 목록 조회.
 * @todo 필터링 추가: `scode`를 받아서 학교 코드로 학교 목록 조회.
 * @todo (옵션) 필터링 추가: `useordersheet`를 받아서 작업지시서 사용 여부에 따른 학교 목록 조회.
 * @todo (옵션) 필터링 추가: `active`를 받아서 활성화 여부에 따른 학교 목록 조회.
 * @todo (옵션) 필터링 추가: `administrationcode`를 받아서 관리 코드로 학교 목록 조회.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ area: string }> }) {
  try {
    const { area } = await params;
    const searchParams = request.nextUrl.searchParams;

    // 파라미터 파싱 및 검증
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE;

    // 페이지네이션 파라미터 검증
    const validatedPagination = paginationSchema.parse({ page, pageSize });

    // 필터링 파라미터
    const filters = {
      sname: searchParams.get('sname') || undefined,
      scode: searchParams.get('scode') || undefined,
      useOrderSheet: (searchParams.get('useordersheet') as 'Y' | 'N') || undefined,
      active: (searchParams.get('active') as 'Y' | 'N') || undefined,
      administrationCode: searchParams.get('administrationcode') || undefined,
    };

    // 필터 파라미터 검증
    const validatedFilters = schoolListFilterSchema.parse(filters);

    const context = await getCommonContext(request);
    const { schools, pagination } = await getRnSchoolsByArea(
      area,
      validatedPagination.page,
      validatedPagination.pageSize,
      validatedFilters,
      context,
    );

    return NextResponse.json(
      {
        success: true,
        message: '학교 목록을 성공적으로 조회했습니다.',
        data: {
          schools,
          pagination,
        },
      } satisfies SchoolsApiResponse,
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.statusCode },
      );
    }
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, 'GET');
  }
}

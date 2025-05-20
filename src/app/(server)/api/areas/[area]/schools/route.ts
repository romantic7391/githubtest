import { DEFAULT_ERROR_MESSAGE_500, DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import type { BaseApiResponse, Pagination } from '@/types/common';
import type { SchoolsApiResponse } from '@/types/school';
import { NextRequest, NextResponse } from 'next/server';
import { getRnSchoolsByArea } from '@/services/areas/[area]/schools/schools.service';
import { z } from 'zod';

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
    const paginationSchema = z.object({
      page: z.number().positive().default(1),
      pageSize: z.number().positive().default(DEFAULT_PAGE_SIZE),
    });

    try {
      paginationSchema.parse({ page, pageSize });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            message: '잘못된 페이지네이션 파라미터입니다.',
            errors: error.errors,
          } satisfies BaseApiResponse,
          { status: 400 },
        );
      }
      throw error;
    }

    // 필터링 파라미터
    const filters = {
      sname: searchParams.get('sname') || undefined,
      scode: searchParams.get('scode') || undefined,
      useOrderSheet: (searchParams.get('useordersheet') as 'Y' | 'N') || undefined,
      active: (searchParams.get('active') as 'Y' | 'N') || undefined,
      administrationCode: searchParams.get('administrationcode') || undefined,
    };

    const { schools, total } = await getRnSchoolsByArea(area, page, pageSize, filters);

    const pagination: Pagination = {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };

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
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: '잘못된 요청 파라미터입니다.',
          errors: error.errors,
        } satisfies BaseApiResponse,
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: DEFAULT_ERROR_MESSAGE_500,
      } satisfies BaseApiResponse,
      { status: 500 },
    );
  }
}

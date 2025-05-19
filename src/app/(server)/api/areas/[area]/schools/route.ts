import { DEFAULT_ERROR_MESSAGE_500, DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import type { BaseApiResponse } from '@/types/common';
import type { SchoolsApiResponse } from '@/types/school';
import { NextRequest, NextResponse } from 'next/server';

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
    console.log(
      'GET /api/areas/[area]/schools',
      await params,
      request.nextUrl.searchParams.get('sname'),
      request.nextUrl.searchParams.get('scode'),
      request.nextUrl.searchParams.get('useordersheet'),
      request.nextUrl.searchParams.get('active'),
      request.nextUrl.searchParams.get('administrationcode'),
    );

    const { area } = await params;

    if (area === 'all') {
      // 모든 지역의 학교 목록
    } else {
      // 특정 지역의 학교 목록
    }

    return NextResponse.json({
      success: true,
      message: '',
      data: {
        schools: [
          {
            schoolNo: 1,
            sname: '대전중학교',
            scode: 'K100001234',
            area: 'daejeon',
            modbus: 0,
            modbusHost: null,
            modbusPort: 502,
            useOrderSheet: 'Y',
            active: 'Y',
            administrationCode: '1111111',
            created: '1970-01-01 00:00:00',
          },
          {
            schoolNo: 2,
            sname: '대전초등학교',
            scode: 'K100001235',
            area: 'daejeon',
            modbus: 0,
            modbusHost: null,
            modbusPort: 502,
            useOrderSheet: 'Y',
            active: 'Y',
            administrationCode: '1111111',
            created: '1970-01-01 00:00:00',
          },
          {
            schoolNo: 3,
            sname: '대전고등학교',
            scode: 'K100001236',
            area: 'daejeon',
            modbus: 0,
            modbusHost: null,
            modbusPort: 502,
            useOrderSheet: 'Y',
            active: 'Y',
            administrationCode: '1111111',
            created: '1970-01-01 00:00:00',
          },
        ],
        pagination: {
          page: 1,
          pageSize: DEFAULT_PAGE_SIZE,
          total: 3,
          totalPages: 0,
        },
      },
    } satisfies SchoolsApiResponse);
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: DEFAULT_ERROR_MESSAGE_500,
    } satisfies BaseApiResponse);
  }
}

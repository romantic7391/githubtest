import { DEFAULT_ERROR_MESSAGE_500 } from '@/lib/default.constant';
import type { BaseApiResponse } from '@/types/common';
import type { SchoolApiResponse, SchoolCreateOrUpdateApiResponse } from '@/types/school';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 지역 학교 정보
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ area: string; schoolNo: string }> }) {
  try {
    console.log('GET /api/areas/[area]/schools/[schoolNo]', await params);

    return NextResponse.json({
      success: true,
      message: '',
      data: {
        schoolNo: 1,
        sname: '대전중학교',
        scode: 'K100001234',
        area: 'daejeon',
        modbus: 0,
        modbusHost: null,
        modbusPort: 502,
        useOrderSheet: 'Y',
        active: 'Y',
        administrationCode: '1234567890',
        created: '1970-01-01 00:00:00',
      },
    } satisfies SchoolApiResponse);
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: DEFAULT_ERROR_MESSAGE_500,
    } satisfies BaseApiResponse);
  }
}

/**
 * 지역 학교 수정
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ area: string; schoolNo: string }> }) {
  try {
    console.log('PUT /api/areas/[area]/schools/[schoolNo]', await params, await request.json());

    return NextResponse.json({
      success: true,
      message: '',
      data: {
        schoolNo: 1,
      },
    } satisfies SchoolCreateOrUpdateApiResponse);
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: DEFAULT_ERROR_MESSAGE_500,
    } satisfies BaseApiResponse);
  }
}

/**
 * 지역 학교 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ area: string; schoolNo: string }> },
) {
  try {
    console.log('DELETE /api/areas/[area]/schools/[schoolNo]', await params);

    return NextResponse.json({
      success: true,
      message: '',
    } satisfies BaseApiResponse);
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: DEFAULT_ERROR_MESSAGE_500,
    } satisfies BaseApiResponse);
  }
}

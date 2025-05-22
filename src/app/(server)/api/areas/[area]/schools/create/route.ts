import { DEFAULT_ERROR_MESSAGE_500 } from '@/lib/default.constant';
import { BaseApiResponse } from '@/types/common';
import { SchoolCreateOrUpdateApiResponse } from '@/types/school';
import { NextRequest, NextResponse } from 'next/server';
import { createRnSchool } from '@/services/areas/[area]/schools/create/create.service';
import { getClientInfo } from '@/services/log-action/log-action.service';

/**
 * 지역 학교 추가
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ area: string }> }) {
  try {
    const { area } = await params;
    const body = await request.json();
    console.log('Request body:', body); // 디버깅용 로그

    const { administrationCode, manager_no, school_no, ...userInput } = body;

    // 필수 입력값 검증
    if (!administrationCode) {
      return NextResponse.json(
        {
          success: false,
          message: '행정표준코드는 필수입니다.',
        } satisfies BaseApiResponse,
        { status: 400 },
      );
    }

    // 클라이언트 정보 가져오기
    const { userAgent, ip } = getClientInfo(request);

    // 학교 생성
    const result = await createRnSchool(
      administrationCode,
      { ...userInput, area },
      {
        manager_no: manager_no || 1,
        school_no: school_no || 0,
        ip,
        user_agent: userAgent,
      },
    );

    return NextResponse.json({
      success: true,
      message: '저장이 완료되었습니다.',
      data: {
        schoolNo: result.school.school_no,
      },
    } satisfies SchoolCreateOrUpdateApiResponse);
  } catch (error) {
    console.error('Error in POST /api/areas/[area]/schools/create:', error); // 디버깅용 로그
    return NextResponse.json(
      {
        success: false,
        message: DEFAULT_ERROR_MESSAGE_500,
      } satisfies BaseApiResponse,
      { status: 400 },
    );
  }
}

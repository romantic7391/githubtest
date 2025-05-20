import { DEFAULT_ERROR_MESSAGE_500 } from '@/lib/default.constant';
import type { BaseApiResponse } from '@/types/common';
import type { SchoolApiResponse, SchoolCreateOrUpdateApiResponse, School } from '@/types/school';
import { NextRequest, NextResponse } from 'next/server';
import {
  getSchoolBySchoolNo,
  updateRnSchool,
  deleteRnSchool,
} from '@/services/areas/[area]/schools/[schoolNo]/[schoolNo].service';

/**
 * 지역 학교 정보
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ area: string; schoolNo: string }> }) {
  try {
    const { schoolNo } = await params;
    const school = await getSchoolBySchoolNo(Number(schoolNo));

    if (!school) {
      return NextResponse.json({
        success: false,
        message: '학교를 찾을 수 없습니다.',
      } satisfies BaseApiResponse);
    }

    return NextResponse.json(
      {
        success: true,
        message: '학교 정보를 성공적으로 조회했습니다.',
        data: school,
      } satisfies SchoolApiResponse,
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: DEFAULT_ERROR_MESSAGE_500,
      } satisfies BaseApiResponse,
      { status: 500 },
    );
  }
}

/**
 * 지역 학교 수정
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ area: string; schoolNo: string }> }) {
  try {
    const { schoolNo } = await params;
    const body = await request.json();

    // schoolNo를 URL 파라미터에서 가져온 값으로 설정
    const schoolData: School = {
      ...body,
      schoolNo: Number(schoolNo),
    };

    await updateRnSchool(schoolData);

    return NextResponse.json(
      {
        success: true,
        message: '학교 정보가 성공적으로 수정되었습니다.',
        data: {
          schoolNo: Number(schoolNo),
        },
      } satisfies SchoolCreateOrUpdateApiResponse,
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: DEFAULT_ERROR_MESSAGE_500,
      } satisfies BaseApiResponse,
      { status: 500 },
    );
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
    const { schoolNo } = await params;
    const school = await getSchoolBySchoolNo(Number(schoolNo));

    if (!school) {
      return NextResponse.json(
        {
          success: false,
          message: '학교를 찾을 수 없습니다.',
        } satisfies BaseApiResponse,
        { status: 404 },
      );
    }

    await deleteRnSchool(school);

    return NextResponse.json(
      {
        success: true,
        message: '학교가 성공적으로 삭제되었습니다.',
      } satisfies BaseApiResponse,
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: DEFAULT_ERROR_MESSAGE_500,
      } satisfies BaseApiResponse,
      { status: 500 },
    );
  }
}

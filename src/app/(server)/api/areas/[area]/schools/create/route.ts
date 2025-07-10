import { SchoolCreateOrUpdateApiResponse, schoolCreateSchema } from '@/types/school';
import { NextRequest, NextResponse } from 'next/server';
import { createRnSchool } from '@/services/areas/[area]/schools/create/create.service';
import { getClientInfo } from '@/services/log-action/log-action.service';
import { handleError, handleZodError } from '@/utils/error.utils';
import { AppError } from '@/utils/error.utils';
import { auth } from '@/auth';
import { Session } from 'next-auth';

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
    managerNo: session.user.managerNo,
    schoolNo: 0,
    ip: ip,
    userAgent: userAgent,
  };
}

/**
 * 지역 학교 추가
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ area: string }> }) {
  try {
    const { area } = await params;
    const body = await request.json();

    // 요청 데이터 검증
    const validatedData = schoolCreateSchema.parse(body);

    const context = await getCommonContext(request);
    const result = await createRnSchool(validatedData.administrationCode || '', { ...validatedData, area }, context);

    return NextResponse.json(
      {
        success: true,
        message: '학교가 성공적으로 등록되었습니다.',
        data: {
          schoolNo: result.school.schoolNo,
        },
      } satisfies SchoolCreateOrUpdateApiResponse,
      { status: 201 },
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
    return handleError(error, 'POST');
  }
}

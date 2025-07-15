import { SchoolCreateOrUpdateApiResponse, schoolCreateSchema } from '@/types/school';
import { NextRequest, NextResponse } from 'next/server';
import { createRnSchool } from '@/services/areas/[area]/schools/create/create.service';
import { handleError, handleZodError } from '@/utils/error.utils';
import { AppError } from '@/utils/error.utils';
import { getCommonContext } from '@/utils/context.utils';

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

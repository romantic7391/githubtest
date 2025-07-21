import { SchoolCreateOrUpdateApiResponse, schoolCreateSchema } from '@/types/school';
import { NextRequest, NextResponse } from 'next/server';
import { createRnSchool } from '@/services/areas/[area]/schools/create/create.service';
import { withPermissionCheck } from '@/utils/api-wrapper.utils';
import { CommonContext, PermissionParams } from '@/types/api-wrapper';

/**
 * 지역 학교 추가
 */
export const POST = withPermissionCheck<PermissionParams>(
  async (request: NextRequest, { params }: { params: Promise<PermissionParams> }, commonContext: CommonContext) => {
    const resolvedParams = await params;
    const { area } = resolvedParams;

    if (!area) {
      return NextResponse.json({ success: false, message: '지역 정보가 필요합니다.' }, { status: 400 });
    }

    const body = await request.json();

    // 요청 데이터 검증
    const validatedData = schoolCreateSchema.parse(body);

    const result = await createRnSchool(
      validatedData.administrationCode || '',
      { ...validatedData, area },
      commonContext,
    );

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
  },
);

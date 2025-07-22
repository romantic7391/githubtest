import { getManagersS } from '@/services/areas/[area]/schools/[schoolNo]/managers/managers.service';
import { paginationSchema } from '@/types/common';
import { findManagersDtoSchema, ManagerListRouteParams, managerListRouteParamsSchema } from '@/types/manager';
import { getCommonContext } from '@/utils/context.utils';
import { AppError, handleError, handleZodError } from '@/utils/error.utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, context: ManagerListRouteParams) {
  try {
    const commonContext = await getCommonContext(request);
    const { area, schoolNo } = await managerListRouteParamsSchema.shape.params.parseAsync(context.params);

    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const name = searchParams.get('name') || undefined;
    const signInId = searchParams.get('signInId') || undefined;
    const scode = searchParams.get('scode') || undefined;

    const pagination = paginationSchema.parse({ page, pageSize });

    const filters = findManagersDtoSchema.shape.filters.parse({
      name,
      signInId,
      scode,
      schoolNo: schoolNo === 'all' ? undefined : schoolNo,
      area: area === 'all' ? undefined : area,
    });

    const result = await getManagersS(pagination, commonContext, filters);

    return NextResponse.json({
      success: true,
      message: '',
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          code: error.code,
        },
        { status: error.statusCode },
      );
    }
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '관리자 목록 조회');
  }
}

import {
  deleteManagerS,
  getManagerS,
  updateManagerS,
} from '@/services/areas/[area]/schools/[schoolNo]/managers/managers.service';
import { ManagerRouteParams, managerRouteParamsSchema, updateManagerDtoSchema } from '@/types/manager';
import { getCommonContext } from '@/utils/context.utils';
import { AppError, handleError, handleZodError } from '@/utils/error.utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, context: ManagerRouteParams) {
  try {
    const commonContext = await getCommonContext(request);
    const { managerNo } = await managerRouteParamsSchema.shape.params.parseAsync(context.params);

    const manager = await getManagerS(managerNo, commonContext);

    return NextResponse.json({
      success: true,
      message: '',
      data: manager,
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
    return handleError(error, '관리자 조회');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const commonContext = await getCommonContext(request);
    const body = await request.json();
    const dto = await updateManagerDtoSchema.parseAsync({
      ...body,
      password: body.password === '' ? undefined : body.password,
    });

    const result = await updateManagerS(dto, commonContext);

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
    return handleError(error, '관리자 수정');
  }
}

export async function DELETE(request: NextRequest, context: ManagerRouteParams) {
  try {
    const commonContext = await getCommonContext(request);
    const { managerNo } = await managerRouteParamsSchema.shape.params.parseAsync(context.params);

    await deleteManagerS(managerNo, commonContext);

    return NextResponse.json({
      success: true,
      message: '',
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
    return handleError(error, '관리자 삭제');
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { checkPermission } from '@/utils/permission-check.utils';
import { CommonContext, PermissionParams } from '@/types/api-wrapper';

// API 핸들러 타입 정의
export type ApiHandler<TParams extends PermissionParams = PermissionParams> = (
  request: NextRequest,
  context: { params: Promise<TParams> },
) => Promise<NextResponse>;

export type ApiHandlerWithPermission<TParams extends PermissionParams = PermissionParams> = (
  request: NextRequest,
  context: { params: Promise<TParams> },
  commonContext: CommonContext,
) => Promise<NextResponse>;

// HOF 옵션 타입
export interface ApiWrapperOptions {
  customErrorHandler?: (error: unknown, context: string) => NextResponse;
  skipDefaultErrorHandling?: boolean;
}

/**
 * 권한 체크를 포함한 API 핸들러 래퍼 (타입 안전 + 런타임 검증)
 */
export function withPermissionCheck<TParams extends PermissionParams = PermissionParams>(
  handler: ApiHandlerWithPermission<TParams>,
  options: ApiWrapperOptions = {},
): ApiHandler<TParams> {
  return async (request: NextRequest, context: { params: Promise<TParams> }) => {
    try {
      // 권한 체크
      const permissionError = await checkPermission(request, context);
      if (permissionError) return permissionError;

      // 공통 컨텍스트 가져오기 (이미 검증됨)
      const { getCommonContext } = await import('@/utils/context.utils');
      const commonContext = await getCommonContext(request);

      // 실제 핸들러 실행
      return await handler(request, context, commonContext);
    } catch (error) {
      // 커스텀 에러 핸들러가 있으면 사용
      if (options.customErrorHandler) {
        return options.customErrorHandler(error, 'API 요청 처리');
      }

      // 기본 에러 처리 스킵 옵션
      if (options.skipDefaultErrorHandling) {
        throw error;
      }

      // 기본 에러 처리
      const { handleError, handleZodError } = await import('@/utils/error.utils');
      const zodError = handleZodError(error);
      if (zodError) return zodError;
      return handleError(error, 'API 요청 처리');
    }
  };
}

/**
 * 권한 체크 없이 실행하는 API 핸들러 래퍼 (관리자 전용 등)
 */
export function withoutPermissionCheck<TParams extends PermissionParams = PermissionParams>(
  handler: ApiHandlerWithPermission<TParams>,
  options: ApiWrapperOptions = {},
): ApiHandler<TParams> {
  return async (request: NextRequest, context: { params: Promise<TParams> }) => {
    try {
      // 공통 컨텍스트 가져오기 (이미 검증됨)
      const { getCommonContext } = await import('@/utils/context.utils');
      const commonContext = await getCommonContext(request);

      // 실제 핸들러 실행
      return await handler(request, context, commonContext);
    } catch (error) {
      // 커스텀 에러 핸들러가 있으면 사용
      if (options.customErrorHandler) {
        return options.customErrorHandler(error, 'API 요청 처리');
      }

      // 기본 에러 처리 스킵 옵션
      if (options.skipDefaultErrorHandling) {
        throw error;
      }

      // 기본 에러 처리
      const { handleError, handleZodError } = await import('@/utils/error.utils');
      const zodError = handleZodError(error);
      if (zodError) return zodError;
      return handleError(error, 'API 요청 처리');
    }
  };
}

import { NextRequest, NextResponse } from 'next/server';
import { checkPermission } from '@/utils/permission-check.utils';
import { CommonContext, PermissionParams } from '@/types/api-wrapper';

// API 핸들러 타입 정의
export type ApiHandler<TParams extends PermissionParams> = (
  request: NextRequest,
  context: { params: Promise<TParams> },
) => Promise<NextResponse>;

// 동적 세그먼트가 있는 경우 (실제 파라미터 사용)
export type ApiHandlerWithParams<TParams extends PermissionParams> = (
  request: NextRequest,
  context: { params: Promise<TParams> },
  commonContext: CommonContext,
) => Promise<NextResponse>;

// 동적 세그먼트가 없는 경우 (파라미터 사용 안함)
export type ApiHandlerWithoutParams = (request: NextRequest, commonContext: CommonContext) => Promise<NextResponse>;

// HOF 옵션 타입
export interface ApiWrapperOptions {
  customErrorHandler?: (error: unknown, context: string) => NextResponse;
  skipDefaultErrorHandling?: boolean;
}

/**
 * 권한 체크를 포함한 API 핸들러 래퍼 - 함수 오버로딩
 */

// 오버로딩 1: 동적 세그먼트가 있는 경우
export function withPermissionCheck<TParams extends PermissionParams>(
  handler: ApiHandlerWithParams<TParams>,
  options?: ApiWrapperOptions,
): ApiHandler<TParams>;

// 오버로딩 2: 동적 세그먼트가 없는 경우
export function withPermissionCheck(
  handler: ApiHandlerWithoutParams,
  options?: ApiWrapperOptions,
): ApiHandler<Record<string, never>>;

// 실제 구현
export function withPermissionCheck<TParams extends PermissionParams>(
  handler: ApiHandlerWithParams<TParams> | ApiHandlerWithoutParams,
  options: ApiWrapperOptions = {},
): ApiHandler<TParams> | ApiHandler<Record<string, never>> {
  return async (request: NextRequest, context: { params: Promise<TParams> }) => {
    try {
      // 권한 체크
      const permissionError = await checkPermission(request, context);
      if (permissionError) return permissionError;

      // 공통 컨텍스트 가져오기 (이미 검증됨)
      const { getCommonContext } = await import('@/utils/context.utils');
      const commonContext = await getCommonContext(request);

      // 핸들러 타입에 따라 다르게 호출
      if (handler.length === 3) {
        // 동적 세그먼트가 있는 경우 (3개 파라미터)
        return await (handler as ApiHandlerWithParams<TParams>)(request, context, commonContext);
      } else {
        // 동적 세그먼트가 없는 경우 (2개 파라미터)
        return await (handler as ApiHandlerWithoutParams)(request, commonContext);
      }
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
 * 권한 체크 없이 실행하는 API 핸들러 래퍼 - 함수 오버로딩
 */

// 오버로딩 1: 동적 세그먼트가 있는 경우
export function withoutPermissionCheck<TParams extends PermissionParams>(
  handler: ApiHandlerWithParams<TParams>,
  options?: ApiWrapperOptions,
): ApiHandler<TParams>;

// 오버로딩 2: 동적 세그먼트가 없는 경우
export function withoutPermissionCheck(
  handler: ApiHandlerWithoutParams,
  options?: ApiWrapperOptions,
): ApiHandler<Record<string, never>>;

// 실제 구현
export function withoutPermissionCheck<TParams extends PermissionParams>(
  handler: ApiHandlerWithParams<TParams> | ApiHandlerWithoutParams,
  options: ApiWrapperOptions = {},
): ApiHandler<TParams> | ApiHandler<Record<string, never>> {
  return async (request: NextRequest, context: { params: Promise<TParams> }) => {
    try {
      // 공통 컨텍스트 가져오기 (이미 검증됨)
      const { getCommonContext } = await import('@/utils/context.utils');
      const commonContext = await getCommonContext(request);

      // 핸들러 타입에 따라 다르게 호출
      if (handler.length === 3) {
        // 동적 세그먼트가 있는 경우 (3개 파라미터)
        return await (handler as ApiHandlerWithParams<TParams>)(request, context, commonContext);
      } else {
        // 동적 세그먼트가 없는 경우 (2개 파라미터)
        return await (handler as ApiHandlerWithoutParams)(request, commonContext);
      }
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

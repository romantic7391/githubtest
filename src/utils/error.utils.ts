import { NextResponse } from 'next/server';
import { z } from 'zod';
import { DEFAULT_ERROR_MESSAGE_500 } from '@/lib/default.constant';
import type { BaseApiResponse } from '@/types/common';

/**
 * 커스텀 에러 클래스
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Zod 에러 처리
 */
export function handleZodError(error: unknown): NextResponse | null {
  if (error instanceof z.ZodError) {
    // Zod 검증 오류의 경우에도 일반적인 메시지만 전달
    return NextResponse.json(
      {
        success: false,
        message: '입력값이 올바르지 않습니다.',
      },
      { status: 400 },
    );
  }
  return null;
}

/**
 * 공통 에러 처리
 */
export function handleError(error: unknown, action: string): NextResponse {
  // 내부 로그에는 상세 정보 기록 (개발/디버깅용)
  console.error(`[${action}] Error:`, error);
  console.error(`[${action}] Error type:`, typeof error);
  console.error(`[${action}] Error constructor:`, error?.constructor?.name);
  console.error(`[${action}] Is AppError:`, error instanceof AppError);

  // AppError인 경우 해당 메시지와 상태 코드 사용
  if (error instanceof AppError) {
    console.error(`[${action}] AppError detected - statusCode:`, error.statusCode);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: error.statusCode },
    );
  }

  // 그 외의 경우 일반적인 오류 메시지 전달
  return NextResponse.json(
    {
      success: false,
      message: DEFAULT_ERROR_MESSAGE_500,
    },
    { status: 500 },
  );
}

/**
 * 데이터베이스 에러 처리
 */
export function handleDatabaseError(error: unknown, action: string): NextResponse {
  // 1. 내부 로깅 (개발자용)
  console.error(`[${action}] 데이터베이스 오류 발생:`, error);

  // 2. 클라이언트 응답 (최소한의 정보만 전달)
  return NextResponse.json(
    {
      success: false,
      message: DEFAULT_ERROR_MESSAGE_500,
    } satisfies BaseApiResponse,
    { status: 500 },
  );
}

/**
 * 인증 에러 처리
 */
export function handleAuthError(error: unknown): NextResponse {
  // 1. 내부 로깅 (개발자용)
  console.error('인증 오류 발생:', error);

  // 2. 클라이언트 응답 (최소한의 정보만 전달)
  return NextResponse.json(
    {
      success: false,
      message: '인증되지 않은 요청입니다.',
    } satisfies BaseApiResponse,
    { status: 401 },
  );
}

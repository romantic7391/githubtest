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
export function handleZodError(error: unknown): NextResponse {
  if (error instanceof z.ZodError) {
    // 내부 로깅 (개발자용)
    console.error('입력값 검증 오류:', error.errors);

    // 클라이언트 응답 (최소한의 정보만 전달)
    return NextResponse.json(
      {
        success: false,
        message: '요청 데이터가 올바르지 않습니다.',
      } satisfies BaseApiResponse,
      { status: 400 },
    );
  }
  return NextResponse.json(
    {
      success: false,
      message: DEFAULT_ERROR_MESSAGE_500,
    } satisfies BaseApiResponse,
    { status: 500 },
  );
}

/**
 * 공통 에러 처리
 */
export function handleError(error: unknown, action: string): NextResponse {
  // 1. 내부 로깅 (개발자용)
  console.error(`[${action}] 오류 발생:`, error);

  // 2. 에러 타입별 클라이언트 응답
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      } satisfies BaseApiResponse,
      { status: error.statusCode },
    );
  }

  if (error instanceof z.ZodError) {
    return handleZodError(error);
  }

  // 3. 알 수 없는 에러는 일반적인 메시지 반환
  return NextResponse.json(
    {
      success: false,
      message: DEFAULT_ERROR_MESSAGE_500,
    } satisfies BaseApiResponse,
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
      message: '데이터 처리 중 오류가 발생했습니다.',
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

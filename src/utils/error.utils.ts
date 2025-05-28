import { NextResponse } from 'next/server';
import { z } from 'zod';
import { DEFAULT_ERROR_MESSAGE_500 } from '@/lib/default.constant';
import type { BaseApiResponse } from '@/types/common';

/**
 * Zod 에러 처리
 */
export function handleZodError(error: unknown): NextResponse | null {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: '요청 데이터가 올바르지 않습니다.',
      } satisfies BaseApiResponse,
      { status: 400 },
    );
  }
  return null;
}

/**
 * 공통 에러 처리
 */
export function handleError(error: unknown, action: string): NextResponse {
  console.error(`[${action}] 오류 발생:`, error);
  return NextResponse.json(
    {
      success: false,
      message: DEFAULT_ERROR_MESSAGE_500,
    } satisfies BaseApiResponse,
    { status: 500 },
  );
}

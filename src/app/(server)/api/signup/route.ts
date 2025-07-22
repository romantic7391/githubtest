import { signUp } from '@/services/auth/signup.service';
import { managerSignUpSchema } from '@/types/manager';
import { handleError, handleZodError } from '@/utils/error.utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { signInId, password, name, schoolNo, parentGroupNo } = managerSignUpSchema.parse(body);

    const result = await signUp({ signInId, password, name, schoolNo, parentGroupNo });

    return NextResponse.json({
      success: true,
      message: '',
      data: result,
    });
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) {
      return zodError;
    } else {
      return handleError(error, '회원가입');
    }
  }
}

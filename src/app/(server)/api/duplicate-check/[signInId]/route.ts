import { checkDuplicate } from '@/services/auth/signup.service';
import { managerSignUpSchema } from '@/types/manager';
import { handleError, handleZodError } from '@/utils/error.utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_: NextRequest, { params }: { params: Promise<{ signInId: string }> }) {
  try {
    const { signInId } = await params;
    const parsedSignInId = managerSignUpSchema.shape.signInId.parse(signInId);
    const isDuplicated = await checkDuplicate(parsedSignInId);

    return NextResponse.json({
      success: true,
      message: '',
      data: {
        checkedId: parsedSignInId,
        isDuplicated,
      },
    });
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) {
      return zodError;
    } else {
      return handleError(error, '아이디 중복 검사');
    }
  }
}

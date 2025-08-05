import { InvalidCredentialsError, UserNotFoundError } from '@/lib/credential.error';
import { DEFAULT_ERROR_MESSAGE_500 } from '@/lib/default.constant';
import { authenticateUser } from '@/services/auth/signin.service';
import { BaseApiResponse } from '@/types/common';
import { signInUserSchema } from '@/types/next-auth';
import { CredentialsSignin } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { success, data: parsed } = signInUserSchema.safeParse(await request.json());
    if (!success) {
      throw new InvalidCredentialsError();
    }

    const user = await authenticateUser(parsed.signInId, parsed.password);

    if (!user) {
      throw new UserNotFoundError();
    }

    return NextResponse.json({
      success: true,
      message: '',
      data: user,
    });
  } catch (error) {
    console.error('[api][signin][POST] error: ', error);
    if (error instanceof CredentialsSignin) {
      return NextResponse.json(
        {
          success: false,
          message: error.code,
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
}

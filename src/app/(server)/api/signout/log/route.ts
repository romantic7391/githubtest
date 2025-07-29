import { signOutLogAction } from '@/services/log-action/log-action.service';
import { User } from '@/types/next-auth';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  await signOutLogAction(body as User);

  return NextResponse.json({
    success: true,
    message: '',
  });
};

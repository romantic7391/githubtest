import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function GET(request: NextRequest) {
  const password = request.nextUrl.searchParams.get('password') ?? '';

  const hashedPassword = await bcrypt.hash(password, 10);
  return NextResponse.json({
    success: true,
    message: '',
    data: {
      password,
      hashedPassword,
    },
  });
}

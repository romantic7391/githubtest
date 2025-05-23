import { NextResponse } from 'next/server';
import { createSchool } from './csd.service';

export async function GET() {
  const schools = createSchool(100);

  return NextResponse.json({
    success: true,
    data: {
      schools,
    },
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { AreaCreateOrUpdateApiResponse } from '@/types/area';

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: '',
    data: {
      area: 'daejeon',
    },
  } satisfies AreaCreateOrUpdateApiResponse);
}

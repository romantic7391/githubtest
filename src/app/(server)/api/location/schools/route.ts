import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
  
    return NextResponse.json({
      success: true,
      data: {
        schools: [],
        pagination: {
          total: 0,
          page: 1,
          pageSize: 10,
        },
      },
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        message: '서버 오류',
      }, { status: 500 });
    }
  }
}

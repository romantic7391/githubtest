import { DEFAULT_ERROR_MESSAGE_500 } from '@/lib/default.constant';
import { searchSchools } from '@/services/school-finder/school.service';
import { schoolSearchSchema } from '@/types/school-finder/school';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const {
      success,
      error,
      data: searchParams,
    } = schoolSearchSchema.safeParse({
      areas: request.nextUrl.searchParams.getAll('area'),
      areaKos: request.nextUrl.searchParams.getAll('areako'),
      stypes: request.nextUrl.searchParams.getAll('stype'),
      snames: request.nextUrl.searchParams.get('sname'),
      page: request.nextUrl.searchParams.get('page') ?? undefined,
      pageSize: request.nextUrl.searchParams.get('pagesize') ?? undefined,
    });

    if (!success) {
      throw error;
    }

    const data = await searchSchools(searchParams);

    return NextResponse.json(
      {
        success: true,
        message: '',
        data,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: error.issues[0].message,
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: DEFAULT_ERROR_MESSAGE_500,
      },
      {
        status: 500,
      },
    );
  }
}

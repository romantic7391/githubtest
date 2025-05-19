import { NextRequest, NextResponse } from 'next/server';
import { fakerKO as faker } from '@faker-js/faker';
import { School, schoolSearchFilterSchema } from '@/types/school';
import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { success, data } = schoolSearchFilterSchema.safeParse({
      page: searchParams.get('page') ?? 1,
      pageSize: searchParams.get('pagesize') ?? DEFAULT_PAGE_SIZE,
      snames: searchParams.getAll('snames'),
      scodes: searchParams.getAll('scodes'),
      stypes: searchParams.getAll('stypes'),
    });

    if (!success) {
      return NextResponse.json({ success: false, message: '입력값 검증 실패' }, { status: 400 });
    }

    const total = 100;
    const pageSize = data.pageSize;
    const schools: School[] = faker.helpers.multiple(
      () => {
        return {
          no: faker.number.int(),
          scode:
            faker.string.alpha({ length: 1, casing: 'upper' }) +
            faker.string.numeric(1) +
            faker.string.numeric(4).padStart(8, '0'),
          sname:
            faker.word
              .noun({ length: { min: 2, max: 5 }, strategy: 'shortest' })
              .replaceAll(/[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ]/g, '') +
            faker.helpers.arrayElement(['유치원', '초등학교', '중학교', '고등학교', '학교']),
          area: faker.location.city(),
          active: faker.number.int() % 2 === 0,
          useOrderSheet: faker.number.int() % 2 === 0,
          modbus: 0,
          modbusHost: undefined,
          modbusPort: 502,
          administrationCode: undefined,
        };
      },
      {
        count: pageSize,
      },
    );

    return NextResponse.json({
      success: true,
      data: {
        schools,
        pagination: {
          total,
          page: 1,
          pageSize,
        },
      },
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message: '서버 오류',
        },
        { status: 500 },
      );
    }
  }
}

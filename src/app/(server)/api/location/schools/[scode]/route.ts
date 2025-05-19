import dayjs from '@/lib/dayjs';
import { SchoolDevice } from '@/types/device';
import { SchoolWithDevicesApiResponse } from '@/types/school';
import { fakerKO as faker } from '@faker-js/faker';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function GET(request: NextRequest, { params }: { params: Promise<{ scode: string }> }) {
  const scodeSchema = z.string().min(1);
  const { success, data: scode, error } = scodeSchema.safeParse((await params).scode);
  if (!success) {
    return NextResponse.json(
      {
        success: false,
        message: error.issues[0].message,
      },
      { status: 400 },
    );
  }

  const model = [
    {
      name: 'HCL',
      kind: 1,
      extra: 'HCL|TEMP',
    },
    {
      name: 'CO',
      kind: 2,
      extra: 'CO|TEMP',
    },
    {
      name: 'DP',
      kind: 3,
      extra: 'DP|NULL',
    },
    {
      name: 'CL2',
      kind: 4,
      extra: 'CL2|TEMP',
    },
    {
      name: 'CH2O',
      kind: 5,
      extra: 'CO|CH2O|C6H6',
    },
  ];

  const modelFaker = faker.helpers.arrayElement(model);

  const schoolNo = faker.number.int({ min: 1 });
  const schoolDevices: SchoolDevice[] = faker.helpers.multiple(
    () => {
      return {
        schoolNo,
        mac: faker.string.alphanumeric({ length: 16 }),
        name: modelFaker.name,
        summary: faker.helpers.arrayElement(['조리실', '세척실', '전처리실']),
        kind: modelFaker.kind,
        extra: modelFaker.extra,
        sdate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        edate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };
    },
    { count: 10 },
  );

  const school: SchoolWithDevicesApiResponse = {
    no: schoolNo,
    scode,
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
    created: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    devices: {
      devices: schoolDevices,
      pagination: {
        page: 1,
        pageSize: 10,
        total: schoolDevices.length,
      },
    },
  };

  return NextResponse.json({
    success: true,
    data: {
      ...school,
    },
  });
}

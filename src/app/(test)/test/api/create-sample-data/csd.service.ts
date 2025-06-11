import { Area } from '@/types/area';
import { School } from '@/types/school';
import { faker, fakerKO } from '@faker-js/faker';
import dayjs from '@/lib/dayjs';
import { DeviceCreate } from '@/types/device';

export function createAreaData(count: number) {
  const areas: Area[] = faker.helpers.multiple(
    (_, i) => {
      return {
        areaNo: i + 1,
        area: faker.location.city().split(' ')[0].toLowerCase().slice(0, 16),
        x: faker.number.int({ min: 1, max: 999 }),
        y: faker.number.int({ min: 1, max: 999 }),
        areaCode: faker.string.alpha({ length: 1, casing: 'upper' }) + '10',
      };
    },
    { count },
  );

  return areas;
}

export function createDatetime() {
  const fakerDate = faker.date.recent({});
  return dayjs(fakerDate).format('YYYY-MM-DD HH:mm:ss');
}

export function createSchool(count: number, schoolNo: { from: number } = { from: 1 }) {
  const areas = createAreaData(count);

  const schools: School[] = faker.helpers.multiple(
    (_, i) => {
      const area = faker.helpers.arrayElement(areas);

      return {
        schoolNo: i + schoolNo.from,
        sname:
          fakerKO.lorem.word({ length: { min: 2, max: 4 } }).replaceAll(/[\.\,]/g, '') +
          faker.helpers.arrayElement(['초등학교', '중학교', '고등학교', '특수학교']),
        scode: area.areaCode + faker.string.numeric({ length: { min: 1, max: 4 } }).padStart(7, '0'),
        area: area.area,
        modbus: 0,
        modbusHost: null,
        modbusPort: 502,
        useOrderSheet: faker.helpers.arrayElement(['Y', 'N']),
        active: faker.helpers.arrayElement(['Y', 'N']),
        created: createDatetime(),
        administrationCode: faker.number.int({ min: 1100000, max: 9999999 }).toString(),
        parentNo: null,
        schoolType: 'st_001', // faker.helpers.arrayElement(['st_001', 'st_002', 'st_003']),
      };
    },
    { count },
  );

  return schools;
}

export function createDevice(count: number, schoolNo: { from: number; to: number } = { from: 1, to: 1 }) {
  const rate = faker.helpers.arrayElement([60, 300]);

  const summaryTypes = ['세척실', '조리실', '전처리실'];

  const deviceKinds = [
    {
      name: 'AIR',
      kind: 0,
      extra: null,
    },
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

  const devices: DeviceCreate[] = faker.helpers.multiple(
    () => {
      const deviceKind = deviceKinds[faker.number.int({ min: 0, max: deviceKinds.length - 1 })];

      return {
        schoolNo: faker.number.int({ min: schoolNo.from, max: schoolNo.to }),
        mac: faker.string.hexadecimal({ length: 16, prefix: '', casing: 'upper' }),
        summary: faker.helpers.arrayElement(summaryTypes),
        ...deviceKind,
        sdate: null,
        edate: null,
        created: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        device: {
          model: 'RN172WC',
          ip: faker.internet.ipv4({ cidrBlock: '192.168.50.0/24' }),
          rip: faker.internet.ipv4({ network: 'test-net-1' }),
          splrate: rate,
          interval: rate,
          ver: dayjs(faker.date.between({ from: '2022-01-01', to: Date.now() }))
            .locale('en')
            .format('MMM DD YYYY'),
          tags: deviceKind.extra + '|',
          checkin: null,
          created: null,
        },
      };
    },
    { count },
  );

  return devices;
}

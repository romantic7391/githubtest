import { Area } from '@/types/area';
import { School } from '@/types/school';
import { faker, fakerKO } from '@faker-js/faker';
import dayjs from '@/lib/dayjs';

export function createAreaData(count: number) {
  const areas: Area[] = faker.helpers.multiple(
    (_, i) => {
      return {
        areaNo: i + 1,
        area: faker.location.city().split(' ')[0].toLowerCase(),
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

export function createSchool(count: number) {
  const areas = createAreaData(count);

  const schools: School[] = faker.helpers.multiple(
    (_, i) => {
      const area = faker.helpers.arrayElement(areas);

      return {
        schoolNo: i + 1,
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
      };
    },
    { count },
  );

  return schools;
}

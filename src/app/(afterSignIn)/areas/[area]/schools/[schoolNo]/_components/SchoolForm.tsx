'use client';

import { Code, Group, NumberInput, Radio, Stack, TextInput } from '@mantine/core';
import useSchool from '../_hooks/useSchool';
import { useParams } from 'next/navigation';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';

export default function SchoolForm({ schoolNo }: { schoolNo: number }) {
  const { area } = useParams();
  const { data, isLoading } = useSchool({ area: area as string, schoolNo });

  const form = useForm({
    initialValues: {
      ...data,
      modbus: data.modbus.toString(),
      area: data.area ?? '',
      scode: data.scode ?? '',
      administrationCode: data.administrationCode ?? 0,
      useOrderSheet: data.useOrderSheet ?? 'N',
    },
  });

  useEffect(() => {
    if (!data) return;

    form.setValues({
      ...data,
      modbus: data.modbus.toString(),
      area: data.area ?? '',
      scode: data.scode ?? '',
      administrationCode: data.administrationCode ?? 0,
      useOrderSheet: data.useOrderSheet ?? 'N',
    });
  }, [data]);

  if (isLoading) {
    return '로딩 중';
  }

  return (
    <>
      <Code block>{JSON.stringify(data, null, 2)}</Code>
      <form>
        <Stack>
          <TextInput withAsterisk name="sname" label="학교 이름" {...form.getInputProps('sname')} />
          <TextInput withAsterisk name="area" label="지역 영문 이름" {...form.getInputProps('area')} />
          <TextInput withAsterisk name="scode" label="학교 코드" {...form.getInputProps('scode')} />
          <NumberInput
            withAsterisk
            name="administrationCode"
            label="행정표준코드(기관)"
            placeholder="ex) 서울과학고등학교: 7010084"
            styles={{
              wrapper: { flex: 1 },
            }}
            rightSection={<></>}
            allowNegative={false}
            allowLeadingZeros={false}
            {...form.getInputProps('administrationCode')}
          />
          <Radio.Group
            label="작업지시서 사용 여부"
            name="useOrderSheet"
            defaultValue="Y"
            {...form.getInputProps('useOrderSheet')}>
            <Group>
              <Radio value="Y" label="사용" />
              <Radio value="N" label="사용 안함" />
            </Group>
          </Radio.Group>

          {/* Modbus */}
          <Radio.Group label="Modbus 사용 여부" name="modbus" defaultValue="0" {...form.getInputProps('modbus')}>
            <Group>
              <Radio value="1" label="사용" />
              <Radio value="0" label="사용 안함" />
            </Group>
          </Radio.Group>

          <TextInput
            label="Modbus Host"
            name="modbusHost"
            disabled={form.values.modbus === '0'}
            {...form.getInputProps('modbusHost')}
          />

          <NumberInput
            label="Modbus Port"
            name="modbusPort"
            defaultValue={502}
            disabled={form.values.modbus === '0'}
            {...form.getInputProps('modbusPort')}
          />
          {/* End of Modbus */}
        </Stack>
      </form>
    </>
  );
}

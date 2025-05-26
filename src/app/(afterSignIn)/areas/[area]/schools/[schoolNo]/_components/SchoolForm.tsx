'use client';

import { Code, Group, Radio } from '@mantine/core';
import useSchool from '../_hooks/useSchool';
import { useParams } from 'next/navigation';
import { useForm } from '@mantine/form';

export default function SchoolForm({ schoolNo }: { schoolNo: number }) {
  const { area } = useParams();
  const { data, isLoading } = useSchool({ area: area as string, schoolNo });

  const form = useForm({
    initialValues: data,
  });

  if (isLoading) {
    return '로딩 중';
  }

  return (
    <>
      <Code block>{JSON.stringify(data, null, 2)}</Code>
      <form>
        <Radio.Group label="Modbus 사용 여부" name="modbus" defaultValue="0" {...form.getInputProps('modbus')}>
          <Group>
            <Radio value="1" label="사용" />
            <Radio value="0" label="사용 안함" />
          </Group>
        </Radio.Group>
      </form>
    </>
  );
}

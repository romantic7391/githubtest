'use client';

import { Button, Group, NumberInput, Radio, Stack, TextInput } from '@mantine/core';
import useSchool from '../_hooks/useSchool';
import { useParams } from 'next/navigation';
import { useForm } from '@mantine/form';
import { Fragment, useEffect } from 'react';
import { schoolSchema } from '@/types/school';
import { ZodError } from 'zod';

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
      modbusHost: data.modbusHost ?? '',
    },
    validate: {
      sname: (value) => {
        const { error } = schoolSchema.shape.sname.safeParse(value);
        if (error) return showError(error);
      },
      scode: (value) => {
        const { error } = schoolSchema.shape.scode.safeParse(value);
        if (error) return showError(error);
      },
      area: (value) => {
        const { error } = schoolSchema.shape.area.safeParse(value);
        if (error) return showError(error);
      },
      administrationCode: (value) => {
        const { error } = schoolSchema.shape.administrationCode.safeParse(value);
        if (error) return showError(error);
      },
      // parentNo: (value) => {
      //   const { error } = schoolSchema.shape.parentNo.safeParse(value === '' ? null : value);
      //   if (error) return showError(error);
      // },
      modbusHost: (value) => {
        const { error } = schoolSchema.shape.modbusHost.safeParse(value === '' ? null : value);
        if (error) return showError(error);
      },
      modbusPort: (value) => {
        const { error } = schoolSchema.shape.modbusPort.safeParse(value);
        if (error) return showError(error);
      },
    },
  });

  function showError(error: ZodError) {
    return error.issues.map((issue, index, array) => {
      return (
        <Fragment key={issue.code}>
          {issue.message}
          {index < array.length - 1 ? <br /> : ''}
        </Fragment>
      );
    });
  }

  useEffect(() => {
    if (!data) return;

    form.setValues({
      ...data,
      modbus: data.modbus.toString(),
      area: data.area ?? '',
      scode: data.scode ?? '',
      administrationCode: data.administrationCode ?? 0,
      useOrderSheet: data.useOrderSheet ?? 'N',
      modbusHost: data.modbusHost ?? '',
    });
  }, [form, data]);

  if (isLoading) {
    return '로딩 중';
  }

  function handleSubmit(values: typeof form.values) {
    console.log(values);
  }

  return (
    <>
      <form onSubmit={form.onSubmit(handleSubmit)}>
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
            rightSection={<></>}
            min={0}
            max={65535}
            allowNegative={false}
            allowLeadingZeros={false}
            disabled={form.values.modbus === '0'}
            {...form.getInputProps('modbusPort')}
          />
          {/* End of Modbus */}

          <NumberInput
            label="상위 기관 번호"
            description="상위 기관이 없다면 비워두십시오."
            rightSection={<></>}
            allowNegative={false}
            allowLeadingZeros={false}
            min={1}
            {...form.getInputProps('parentNo')}
          />

          <Radio.Group label="활성화" name="active" defaultValue="Y" {...form.getInputProps('active')}>
            <Group>
              <Radio value="Y" label="활성화" />
              <Radio value="N" label="비활성화" />
            </Group>
          </Radio.Group>

          <Group justify="flex-start">
            <Button type="reset" variant="transparent" color="grey" onClick={form.reset}>
              초기화
            </Button>
            <Button type="button" variant="filled" color="red">
              삭제
            </Button>
            <Button type="submit">수정</Button>
          </Group>
        </Stack>
      </form>
    </>
  );
}

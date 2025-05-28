'use client';

import { Button, Grid, Group, NumberInput, Radio, Stack, TextInput } from '@mantine/core';
import useSchool from '../_hooks/useSchool';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from '@mantine/form';
import { Fragment, useEffect } from 'react';
import { schoolFormSchema, schoolSchema } from '@/types/school';
import { ZodError } from 'zod';
import useDeleteSchool from '../_hooks/useDeleteSchool';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
// import useUpdateSchool from '../_hooks/useUpdateSchool';

// TODO: 없는 학교로 URL 조회 시 에러 발생
export default function SchoolForm({ schoolNo }: { schoolNo: number }) {
  const { area } = useParams();
  const { data } = useSchool({ area: area as string, schoolNo });
  const { mutate: deleteSchool, isPending: isDeleting, isSuccess: isDeleted } = useDeleteSchool();
  // const { mutate: updateSchool, isPending: isUpdating, isSuccess: isUpdated } = useUpdateSchool();
  const router = useRouter();

  const form = useForm({
    initialValues: {
      sname: data?.sname ?? '',
      scode: data?.scode ?? '',
      area: data?.area ?? '',
      useOrderSheet: data?.useOrderSheet ?? 'Y',
      active: data?.active ?? 'Y',
      administrationCode: data?.administrationCode ?? '',
      parentNo: data?.parentNo ?? '',
      modbus: data?.modbus.toString() ?? '0',
      modbusHost: data?.modbusHost ?? '',
      modbusPort: data?.modbusPort ?? 502,
    },
    validate: {
      sname: (value) => {
        const { error } = schoolFormSchema.shape.sname.safeParse(value);
        if (error) return showError(error);
      },
      scode: (value) => {
        const { error } = schoolFormSchema.shape.scode.safeParse(value);
        if (error) return showError(error);
      },
      area: (value) => {
        const { error } = schoolFormSchema.shape.area.safeParse(value);
        if (error) return showError(error);
      },
      administrationCode: (value) => {
        console.log('administrationCode', typeof value, value);
        const { error } = schoolFormSchema.shape.administrationCode.safeParse(value);
        if (error) return showError(error);
      },
      parentNo: (value) => {
        console.log('parentNo', typeof value, value);
        const { error } = schoolFormSchema.shape.parentNo.safeParse(value);
        if (error) return showError(error);
      },
      modbusHost: (value) => {
        console.log('modbusHost', typeof value, value);
        const { error } = schoolFormSchema.shape.modbusHost.safeParse(value);
        if (error) return showError(error);
      },
      modbusPort: (value) => {
        const { error } = schoolFormSchema.shape.modbusPort.safeParse(value);
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
      sname: data.sname,
      scode: data.scode,
      area: data.area ?? '',
      useOrderSheet: data.useOrderSheet,
      active: data.active,
      administrationCode: data.administrationCode ?? '',
      parentNo: data.parentNo ?? '',
      modbus: data.modbus.toString() ?? '0',
      modbusHost: data.modbusHost ?? '',
      modbusPort: data.modbusPort ?? 502,
    });
    form.setInitialValues(form.values);
  }, [data]);

  function handleSubmit(values: typeof form.values) {
    console.log(values);

    const { success, error, data } = schoolFormSchema.safeParse(values);
    console.log('schoolFormSchema', success, error, data);

    if (success) {
      console.log('created', data.created);
      const {
        success: success2,
        error: error2,
        data: data2,
      } = schoolSchema.safeParse({
        ...data,
        created: data.created,
      });
      console.log('schoolSchema', success2, error2, data2);
    }
  }

  function handleDelete() {
    deleteSchool({
      area: area as string,
      schoolNo,
    });
  }

  useEffect(() => {
    if (!isDeleted) return;

    notifications.show({
      title: '학교가 성공적으로 삭제되었습니다.',
      message: '학교 목록으로 이동합니다.',
      icon: <IconCheck size={18} />,
      autoClose: true,
      withCloseButton: true,
      position: 'top-center',
      color: 'green',
    });

    router.push(`/areas/all/schools`);
  }, [isDeleted]);

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
            min={0}
            max={99_999_999}
            clampBehavior="strict"
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

          {isDeleting ? (
            <></>
          ) : (
            <Grid justify="flex-start">
              <Grid.Col span={{ base: 12, md: 'content' }}>
                <Button type="submit" fullWidth>
                  수정
                </Button>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 'content' }}>
                <Button type="reset" variant="transparent" color="grey" fullWidth onClick={form.reset}>
                  초기화
                </Button>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 'content' }}>
                <Button type="button" variant="filled" color="red" fullWidth onClick={handleDelete}>
                  삭제
                </Button>
              </Grid.Col>
            </Grid>
          )}
        </Stack>
      </form>
    </>
  );
}

'use client';

import { schoolCreateSchema } from '@/types/school';
import { useForm } from '@mantine/form';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState, Fragment, useEffect } from 'react';
import { ZodError } from 'zod';
import useCreateSchool from '../_hooks/useCreateSchool';
import { Anchor, Button, Group, NumberInput, Radio, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircleFilled, IconCheck } from '@tabler/icons-react';
import { DEFAULT_NOTIFICATION_AUTOCLOSE_MS } from '@/lib/default.constant';

export default function SchoolCreateForm() {
  const { area } = useParams();
  const router = useRouter();
  const { mutate: createSchool, isPending, isSuccess, data, isError, error } = useCreateSchool();
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const schoolLink = useMemo(() => {
    if (!data?.schoolNo) return '';
    return `/areas/${area}/schools/${data.schoolNo}`;
  }, [data?.schoolNo, area]);

  const form = useForm({
    initialValues: {
      sname: '',
      scode: '',
      area: '',
      useOrderSheet: 'Y',
      active: 'Y',
      administrationCode: null,
      parentNo: null,
      modbus: '0',
      modbusHost: '',
      modbusPort: 502,
    },
    validate: {
      sname: (value) => {
        const { error } = schoolCreateSchema.shape.sname.safeParse(value);
        if (error) return showError(error);
      },
      scode: (value) => {
        const { error } = schoolCreateSchema.shape.scode.safeParse(value);
        if (error) return showError(error);
      },
      area: (value) => {
        const { error } = schoolCreateSchema.shape.area.safeParse(value);
        if (error) return showError(error);
      },
      administrationCode: (value) => {
        const { error } = schoolCreateSchema.shape.administrationCode.safeParse(value === '' ? null : value);
        if (error) return showError(error);
      },
      modbusHost: (value) => {
        const { error } = schoolCreateSchema.shape.modbusHost.safeParse(value === '' ? null : value);
        if (error) return showError(error);
      },
      modbusPort: (value) => {
        const { error } = schoolCreateSchema.shape.modbusPort.safeParse(value);
        if (error) return showError(error);
      },
      parentNo: (value) => {
        const { error } = schoolCreateSchema.shape.parentNo.safeParse(value === '' ? null : value);
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

  function handleSubmit(values: typeof form.values) {
    const submitValue = {
      ...values,
      modbus: Number(values.modbus),
      modbusHost: values.modbusHost || null,
      useOrderSheet: values.useOrderSheet as 'Y' | 'N',
      active: values.active as 'Y' | 'N',
    };
    createSchool(submitValue);

    // 학교 추가 알림
    const notificationId = notifications.show({
      loading: true,
      title: '학교를 추가하고 있습니다. 잠시만 기다려주십시오.',
      message: '',
      autoClose: false,
      withCloseButton: false,
      position: 'top-center',
    });
    setNotificationId(notificationId);
  }

  useEffect(() => {
    if (!isError || !notificationId) return;

    let errorMessage = <>{error.message}</>;
    if (error instanceof ZodError) {
      errorMessage = <>{showError(error)}</>;
    }

    notifications.update({
      id: notificationId,
      loading: false,
      title: '학교를 추가하는 중 오류가 발생했습니다.',
      message: errorMessage,
      icon: <IconAlertCircleFilled size={18} />,
      autoClose: false,
      withCloseButton: true,
      position: 'top-center',
      color: 'red',
    });
  }, [notificationId, isError, error]);

  useEffect(() => {
    if (!notificationId || !isSuccess) return;

    notifications.update({
      id: notificationId,
      loading: false,
      title: '학교를 성공적으로 추가했습니다.',
      message: (
        <Group gap="xs">
          <Text>잠시 후 학교 페이지로 이동합니다.</Text>
          <Anchor href={schoolLink}>바로 가기</Anchor>
        </Group>
      ),
      icon: <IconCheck size={18} />,
      autoClose: DEFAULT_NOTIFICATION_AUTOCLOSE_MS,
      position: 'top-center',
      color: 'green',
    });

    setTimeout(() => {
      router.push(schoolLink);
    }, DEFAULT_NOTIFICATION_AUTOCLOSE_MS);
  }, [notificationId, isSuccess, data, router, schoolLink]);

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          withAsterisk
          name="sname"
          label="학교 이름"
          placeholder="ex) 사랑중학교"
          styles={{
            wrapper: {
              flex: 1,
            },
          }}
          inputContainer={(children) => (
            <Group align="flex-start">
              {children}
              <Button>학교 검색</Button>
            </Group>
          )}
          {...form.getInputProps('sname')}
        />

        <TextInput
          withAsterisk
          name="area"
          label="지역 영문 이름"
          placeholder="학교 검색 시 자동으로 입력됩니다."
          {...form.getInputProps('area')}
        />

        <TextInput
          withAsterisk
          name="scode"
          label="학교 코드"
          placeholder="학교 검색 시 자동으로 입력됩니다."
          {...form.getInputProps('scode')}
        />

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
          <Button type="submit" loading={isPending}>
            추가
          </Button>
          <Button type="reset" variant="transparent" color="gray">
            취소
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

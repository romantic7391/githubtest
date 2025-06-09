'use client';

import { type Device, deviceRelFormSchema, deviceRelSchema } from '@/types/device';
import { Autocomplete, Badge, Card, Grid, Group, LoadingOverlay, Select, TextInput, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { DEVICE_KINDS } from '@/lib/device.constant';
import { useClickOutside, useDebouncedCallback } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import ZodErrorDisplay from '@/app/(afterSignIn)/_components/ZodErrorDisplay';
import useUpdateDevice from '../_hooks/useUpdateDevice';
import { useParams } from 'next/navigation';
import useCreateDevice from '../_hooks/useCreateDevice';
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { IconAlertCircleFilled } from '@tabler/icons-react';

// TODO: 신규 센서 장치 추가
// TODO: 1. 신규 센서 장치 카드에 정보 입력
// TODO: 2. 입력할 때마다 입력값 검증 및 저장 시도
// TODO: 3. 저장 성공 시 refetch로 센서 장치 목록 갱신 및 입력값 비우기

// TODO: 기존 센서 장치 수정
// TODO: 1. 기존 센서 장치 카드에 정보 입력
// TODO: 2. 입력할 때마다 입력값 검증 및 저장 시도
// TODO: 3. 저장 성공

export default function DeviceCard({
  device,
  refetch,
}: {
  device?: Device;
  refetch: (options?: RefetchOptions) => Promise<QueryObserverResult>;
}) {
  const isCreateMode = device === undefined;
  const { area, schoolNo } = useParams();
  const [kindEditMode, setKindEditMode] = useState<boolean>(false);
  const ref = useClickOutside(() => {
    setTimeout(() => {
      setKindEditMode(false);
    }, 100);
  });
  const form = useForm({
    initialValues: {
      mac: '',
      summary: '',
      name: '',
      kind: '',
      extra: '',
      sdate: '',
      edate: '',
      created: '',
      device: undefined,
    },

    validate: {
      mac: (value) => {
        if (isCreateMode && value === '') return null;
        const { error } = deviceRelFormSchema.shape.mac.safeParse(value);
        if (error) return <ZodErrorDisplay error={error} />;
      },
      summary: (value) => {
        if (isCreateMode && value === '') return null;
        const { error } = deviceRelFormSchema.shape.summary.safeParse(value);
        if (error) return <ZodErrorDisplay error={error} />;
      },
      name: (value) => {
        if (isCreateMode) return null;
        const { error } = deviceRelFormSchema.shape.name.safeParse(value);
        if (error) return <ZodErrorDisplay error={error} />;
      },
      kind: (value) => {
        if (isCreateMode) return null;
        const { error } = deviceRelFormSchema.shape.kind.safeParse(Number(value));
        if (error) return <ZodErrorDisplay error={error} />;
      },
      device: (value) => {
        if (isCreateMode) return undefined;
        const { error } = deviceRelFormSchema.shape.device.safeParse(value);
        if (error) return <ZodErrorDisplay error={error} />;
      },
    },

    validateInputOnChange: true,
    onValuesChange: (values) => {
      onValuesChange(values);
    },
  });
  const { mutate: updateDevice, isPending: isUpdating } = useUpdateDevice({
    area: area?.toString() ?? 'all',
    schoolNo: Number(schoolNo),
  });
  const {
    mutate: createDevice,
    isPending: isCreating,
    isSuccess: isCreated,
    isError: isCreateError,
    error: createError,
  } = useCreateDevice({ area: area?.toString() ?? 'all', schoolNo: Number(schoolNo) });

  // 입력 후 입력값 검증 및 저장 시도. 약간 딜레이 줌.
  const onValuesChange = useDebouncedCallback((values) => {
    if (form.values.name === '' || form.values.mac === '' || form.values.summary === '') return;
    const { success, error, data } = deviceRelSchema.safeParse({
      ...values,
      summary: values.summary === '' ? null : values.summary,
      kind: Number(values.kind),
      extra: values.extra === '' ? null : values.extra,
      created: values.created === '' ? null : values.created,
      sdate: values.sdate === '' ? null : values.sdate,
      edate: values.edate === '' ? null : values.edate,
      device: values.device === null ? undefined : values.device,
    });
    if (!success) {
      console.error(error.issues.map((issue) => issue.message));
      return;
    }

    if (isCreateMode) {
      createDevice({ device: data });
    } else {
      updateDevice({ device: data });
    }
  }, 300);

  useEffect(() => {
    if (!isCreated) return;
    refetch();
  }, [isCreated]);

  useEffect(() => {
    if (!isCreateError) return;
    notifications.show({
      title: '센서 장치를 추가하는데 실패했습니다.',
      message: createError?.message,
      icon: <IconAlertCircleFilled size={18} />,
      autoClose: true,
      withCloseButton: true,
      position: 'top-center',
      color: 'red',
    });
  }, [isCreateError]);

  const handleChangeName = (value: string | null) => {
    if (!value) return;
    const selected = DEVICE_KINDS.find((item) => item.name === value);
    if (!selected) return;

    form.setFieldValue('name', value);
    form.setFieldValue('kind', selected.kind.toString());
    form.setFieldValue('extra', selected.extra ?? '');

    setKindEditMode(false);
  };

  return (
    <Card withBorder>
      <LoadingOverlay visible={isCreateMode && isCreating} />
      <LoadingOverlay visible={!isCreateMode && isUpdating} />
      <Card.Section p="sm" mb="sm" bg="gray.1">
        <Group>
          {isCreateMode && (
            <Badge color="red" size="lg">
              추가
            </Badge>
          )}
          {kindEditMode ? (
            <Select
              ref={ref}
              size="sm"
              w="85px"
              comboboxProps={{ width: '100px' }}
              defaultValue={form.getValues().name}
              data={DEVICE_KINDS.map((item) => item.name)}
              value={form.values.name}
              defaultDropdownOpened
              allowDeselect={false}
              onChange={handleChangeName}
            />
          ) : (
            <Title order={5} onClick={() => setKindEditMode(!kindEditMode)}>
              {form.values.name === '' ? '선택' : form.values.name}
            </Title>
          )}
        </Group>
      </Card.Section>
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput label="MAC" maxLength={16} {...form.getInputProps('mac')} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Autocomplete label="장소" data={['조리실', '전처리실', '세척실']} {...form.getInputProps('summary')} />
        </Grid.Col>
      </Grid>
    </Card>
  );
}

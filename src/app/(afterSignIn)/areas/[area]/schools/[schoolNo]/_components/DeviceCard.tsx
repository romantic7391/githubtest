'use client';

import { type Device, deviceRelFormSchema, deviceRelSchema } from '@/types/device';
import {
  Autocomplete,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  LoadingOverlay,
  Menu,
  Select,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useEffect, useState } from 'react';
import { DEVICE_KINDS } from '@/lib/device.constant';
import { useClickOutside, useDebouncedCallback } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import ZodErrorDisplay from '@/app/(afterSignIn)/_components/ZodErrorDisplay';
import useUpdateDevice from '../_hooks/device/useUpdateDevice';
import { useParams } from 'next/navigation';
import useCreateDevice from '../_hooks/device/useCreateDevice';
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { IconAlertCircleFilled, IconCheck, IconDots, IconTrash } from '@tabler/icons-react';
import useDeleteDevice from '../_hooks/device/useDeleteDevice';
import useDeviceLatestSensorData from '../_hooks/device/useDeviceLatestSensorData';

export default function DeviceCard({
  device,
  refetch,
}: {
  device?: Device;
  refetch: (options?: RefetchOptions) => Promise<QueryObserverResult>;
}) {
  /**
   * 추가 모드 여부. `true`면 추가 모드, `false`면 수정 모드입니다.
   */
  const isCreateMode = device === undefined;
  const { area, schoolNo } = useParams();
  const [kindEditMode, setKindEditMode] = useState<boolean>(false); // 센서 종류 수정 모드 여부
  const [expanded, setExpanded] = useState<boolean>(false); // 더 보기 메뉴 확장 여부
  /**
   * 카드 바깥을 클릭하면 100ms 뒤에 센서 종류 수정 모드를 종료합니다.
   * 딜레이가 없으면 선택한 값으로 수정이 안 됩니다.
   */
  const ref = useClickOutside(() => {
    setTimeout(() => {
      setKindEditMode(false);
    }, 100);
  });
  const form = useForm({
    initialValues: {
      mac: device?.mac ?? '',
      summary: device?.summary ?? '',
      name: device?.name ?? '',
      kind: device?.kind.toString() ?? '',
      extra: device?.extra ?? '',
      sdate: device?.sdate ?? null,
      edate: device?.edate ?? null,
      created: device?.created ?? '',
      device: undefined,
    },

    validate: {
      mac: (value) => {
        if (isCreateMode && value === '') return null;
        if (value !== value.toLocaleUpperCase()) {
          form.setFieldValue('mac', value.toLocaleUpperCase());
        }
        const { error } = deviceRelFormSchema.shape.mac.safeParse(value.toLocaleUpperCase());
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
    mac: device?.mac ?? '',
  });
  const {
    mutate: createDevice,
    isPending: isCreating,
    isSuccess: isCreated,
    isError: isCreateError,
    error: createError,
  } = useCreateDevice({ area: area?.toString() ?? 'all', schoolNo: Number(schoolNo) });
  const {
    mutate: deleteDevice,
    isPending: isDeleting,
    isSuccess: isDeleted,
    isError: isDeleteError,
    error: deleteError,
  } = useDeleteDevice({ area: area?.toString() ?? 'all', schoolNo: Number(schoolNo), mac: device?.mac ?? '' });
  const { data: latestSensorData } = useDeviceLatestSensorData({ mac: device?.mac ?? '' });
  // 입력 후 입력값 검증 및 저장 시도. 약간 딜레이 줌.
  const onValuesChange = useDebouncedCallback((values) => {
    if (form.values.name === '' || form.values.mac === '' || form.values.summary === '') return;
    if (form.values.mac !== form.values.mac.toLocaleUpperCase()) {
      form.setFieldValue('mac', form.values.mac.toLocaleUpperCase());
    }

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
    form.reset();
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
  }, [isCreateError, createError]);

  const handleChangeName = (value: string | null) => {
    if (!value) return;
    const selected = DEVICE_KINDS.find((item) => item.name === value);
    if (!selected) return;

    form.setFieldValue('name', value);
    form.setFieldValue('kind', selected.kind.toString());
    form.setFieldValue('extra', selected.extra ?? '');

    setKindEditMode(false);
  };

  useEffect(() => {
    if (!device || !isDeleted) return;
    refetch();
    notifications.show({
      title: `센서 장치 ${device.name}(${device.mac})을 삭제했습니다.`,
      message: '',
      icon: <IconCheck size={18} />,
      autoClose: true,
      withCloseButton: true,
      position: 'top-center',
      color: 'green',
    });
  }, [device, isDeleted]);

  useEffect(() => {
    if (!isDeleteError) return;
    notifications.show({
      title: '센서 장치를 삭제하는데 실패했습니다.',
      message: deleteError?.message,
      icon: <IconAlertCircleFilled size={18} />,
      autoClose: true,
      withCloseButton: true,
      position: 'top-center',
      color: 'red',
    });
  }, [isDeleteError, deleteError]);

  useEffect(() => {
    if (!latestSensorData) return;
    console.log(latestSensorData);
  }, [latestSensorData]);

  return (
    <Card withBorder>
      <LoadingOverlay visible={isCreateMode && isCreating} />
      <LoadingOverlay visible={!isCreateMode && isUpdating} />
      <LoadingOverlay visible={isDeleting} />
      <Card.Section p="sm" mb="sm" bg="gray.1">
        <Group justify="space-between">
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
              <Title
                order={5}
                onClick={() => setKindEditMode(!kindEditMode)}
                style={{ cursor: form.values.name === '' ? 'pointer' : 'default' }}>
                {form.values.name === '' ? '클릭하여 센서 선택' : form.values.name}
              </Title>
            )}
          </Group>
          <Menu position="bottom-end">
            <Menu.Target>
              <Button size="compact-sm">메뉴</Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item leftSection={<IconDots size={16} />} onClick={() => setExpanded(!expanded)}>
                {expanded ? '간단히' : '자세히'}
              </Menu.Item>
              {!isCreateMode && (
                <>
                  <Menu.Divider />
                  <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={() => deleteDevice()}>
                    삭제
                  </Menu.Item>
                </>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Card.Section>
      <Grid mb="md">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput label="MAC" maxLength={16} {...form.getInputProps('mac')} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Autocomplete label="장소" data={['조리실', '전처리실', '세척실']} {...form.getInputProps('summary')} />
        </Grid.Col>
        {expanded && (
          <>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <DateTimePicker
                valueFormat="YYYY-MM-DD HH:mm:ss"
                label="사용 시작 시각"
                clearable
                withSeconds
                timePickerProps={{
                  withDropdown: true,
                  popoverProps: { withinPortal: false },
                  format: '24h',
                }}
                {...form.getInputProps('sdate')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <DateTimePicker
                valueFormat="YYYY-MM-DD HH:mm:ss"
                label="사용 종료 시각"
                clearable
                {...form.getInputProps('edate')}
              />
            </Grid.Col>
          </>
        )}
      </Grid>
      <Card.Section p="sm" bg="gray.1">
        <Group>
          <Text>{latestSensorData?.detected}</Text>
          {latestSensorData && latestSensorData.values.map((value, index) => <Text key={index}>{value}</Text>)}
        </Group>
      </Card.Section>
    </Card>
  );
}

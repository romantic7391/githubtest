'use client';

import {
  Button,
  Grid,
  Group,
  Loader,
  LoadingOverlay,
  NumberInput,
  PasswordInput,
  Radio,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import useManager from '../_hooks/useManager';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import { DateTimePicker } from '@mantine/dates';
import useUpdateManager from '../_hooks/useUpdateManager';
import { updateManagerDtoSchema } from '@/types/manager';
import { showError } from '@/utils/common.util';
import { notifications } from '@mantine/notifications';
import { IconAlertCircleFilled, IconCheck } from '@tabler/icons-react';
import { notFound, usePathname, useRouter } from 'next/navigation';
import useDeleteManager from '../_hooks/useDeleteManager';

export default function ManagerForm({ managerNo }: { managerNo: number }) {
  const { data, isError: isManagerError } = useManager({ managerNo });
  const {
    mutate: updateManager,
    isSuccess: isUpdated,
    isPending: isUpdating,
    isError: isUpdateError,
    error: updateError,
  } = useUpdateManager({
    area: 'all',
    schoolNo: 'all',
    managerNo,
  });
  const {
    mutate: deleteManager,
    isPending: isDeleting,
    isSuccess: isDeleted,
    isError: isDeleteError,
    error: deleteError,
  } = useDeleteManager();
  const form = useForm({
    initialValues: {
      name: data?.name ?? '',
      password: '',
      approvedStatus: data?.approvedStatus ?? 'PENDING',
      locked: data?.locked ?? 'N',
    },
    validate: {
      name: (value) => {
        const { error } = updateManagerDtoSchema.shape.name.safeParse(value);
        if (error) return showError(error);
      },
      password: (value) => {
        if (value === '') return;
        const { error } = updateManagerDtoSchema.shape.password.safeParse(value);
        if (error) return showError(error);
      },
      approvedStatus: (value) => {
        const { error } = updateManagerDtoSchema.shape.approvedStatus.safeParse(value);
        if (error) return showError(error);
      },
      locked: (value) => {
        const { error } = updateManagerDtoSchema.shape.locked.safeParse(value);
        if (error) return showError(error);
      },
    },
    validateInputOnChange: true,
  });
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isLoading = isUpdating || isDeleting;

  useEffect(() => {
    if (isManagerError) {
      notFound();
    }
  }, [isManagerError]);

  useEffect(() => {
    if (!data) return;
    const { name, approvedStatus, locked } = data;

    form.setValues({
      name,
      password: '',
      approvedStatus,
      locked,
    });
    form.setInitialValues({
      name,
      password: '',
      approvedStatus,
      locked,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  function handleSubmit(values: typeof form.values) {
    if (!data) return;
    form.validate();

    notifications.clean();
    const notificationId = notifications.show({
      loading: true,
      title: '관리자를 수정하고 있습니다. 잠시만 기다려주십시오.',
      message: '',
      autoClose: false,
      withCloseButton: false,
      position: 'top-center',
    });
    setNotificationId(notificationId);

    console.log('data: managerNo: ', data.managerNo);
    updateManager({
      managerNo: data.managerNo,
      name: values.name,
      password: values.password,
      approvedStatus: values.approvedStatus,
      locked: values.locked,
    });
  }

  useEffect(() => {
    if (!isUpdateError || !notificationId) return;

    notifications.update({
      id: notificationId,
      loading: false,
      title: '관리자 수정 중 오류가 발생했습니다.',
      message: updateError?.message ?? '',
      icon: <IconAlertCircleFilled size={18} />,
      autoClose: false,
      withCloseButton: true,
      position: 'top-center',
      color: 'red',
    });
  }, [isUpdateError, updateError, notificationId]);

  useEffect(() => {
    if (!isUpdated || !notificationId) return;

    notifications.update({
      id: notificationId,
      loading: false,
      title: '관리자를 수정했습니다.',
      message: '',
      icon: <IconCheck size={18} />,
      autoClose: true,
      withCloseButton: true,
      position: 'top-center',
      color: 'green',
    });
  }, [isUpdated, notificationId]);

  function handleDelete() {
    if (!data) return;

    notifications.clean();
    const notificationId = notifications.show({
      loading: true,
      title: '관리자를 삭제하고 있습니다. 잠시만 기다려주십시오.',
      message: '',
      autoClose: false,
      withCloseButton: false,
      position: 'top-center',
    });
    setNotificationId(notificationId);

    deleteManager(data.managerNo);
  }

  useEffect(() => {
    if (!isDeleteError || !notificationId) return;

    notifications.update({
      id: notificationId,
      loading: false,
      title: '관리자 삭제 중 오류가 발생했습니다.',
      message: deleteError?.message ?? '',
      icon: <IconAlertCircleFilled size={18} />,
      autoClose: true,
      withCloseButton: true,
      position: 'top-center',
      color: 'red',
    });
  }, [isDeleteError, deleteError, notificationId]);

  useEffect(() => {
    if (!isDeleted || !notificationId) return;

    notifications.update({
      id: notificationId,
      loading: false,
      title: '관리자를 삭제했습니다.',
      message: '',
      icon: <IconCheck size={18} />,
      autoClose: true,
      withCloseButton: true,
      position: 'top-center',
      color: 'green',
    });

    const newPathname = pathname.slice(0, pathname.lastIndexOf('/'));
    router.push(newPathname);
  }, [isDeleted, notificationId]);

  if (!data) {
    return <Text>데이터를 불러오는 중입니다...</Text>;
  }

  return (
    <>
      <form onSubmit={form.onSubmit(handleSubmit)} style={{ position: 'relative' }}>
        <LoadingOverlay
          visible={isLoading}
          zIndex={1000}
          overlayProps={{
            blur: 2,
            radius: 'sm',
          }}
          loaderProps={{
            children: (
              <Stack align="center">
                <Loader />
              </Stack>
            ),
          }}
        />

        <Stack>
          <NumberInput readOnly label="사용자 번호" defaultValue={data?.managerNo} />
          <TextInput readOnly label="아이디" defaultValue={data?.signInId} />
          <PasswordInput label="비밀번호" name="password" {...form.getInputProps('password')} />
          <TextInput label="이름" {...form.getInputProps('name')} />
          <Select
            label="승인 여부"
            name="approvedStatus"
            data={[
              { value: 'PENDING', label: '대기' },
              { value: 'APPROVED', label: '승인' },
              { value: 'REJECTED', label: '거절' },
            ]}
            {...form.getInputProps('approvedStatus')}
          />
          <Radio.Group label="계정 잠금 여부" name="locked" {...form.getInputProps('locked')}>
            <Group>
              <Radio value="Y" label="잠금" />
              <Radio value="N" label="잠금해제" />
            </Group>
          </Radio.Group>
          <DateTimePicker
            readOnly
            label="마지막 비밀번호 변경 일시"
            name="lastPasswordChanged"
            value={data?.lastPasswordChanged}
            valueFormat="YYYY-MM-DD HH:mm:ss"
          />
          <DateTimePicker
            readOnly
            label="수정 일시"
            name="updated"
            value={data?.updated}
            valueFormat="YYYY-MM-DD HH:mm:ss"
          />
          <DateTimePicker
            readOnly
            label="생성 일시"
            name="created"
            value={data?.created}
            valueFormat="YYYY-MM-DD HH:mm:ss"
          />

          <Grid justify="flex-start" mb="md">
            <Grid.Col span={{ base: 12, md: 'content' }}>
              <Button type="submit" fullWidth loading={isLoading}>
                수정
              </Button>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 'content' }}>
              <Button
                type="reset"
                variant="transparent"
                color="grey"
                fullWidth
                loading={isLoading}
                onClick={form.reset}>
                초기화
              </Button>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 'content' }}>
              <Button type="button" variant="filled" color="red" fullWidth loading={isLoading} onClick={handleDelete}>
                삭제
              </Button>
            </Grid.Col>
          </Grid>
        </Stack>
      </form>
    </>
  );
}

'use client';

import { Button, Grid, Stack, TextInput, Textarea } from '@mantine/core';
import usePermission from '../_hooks/usePermission';
import { useRouter } from 'next/navigation';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import { createPermissionDtoSchema, permissionSchema } from '@/types/permission/permission';
import useDeletePermission from '../_hooks/useDeletePermission';
import { notifications } from '@mantine/notifications';
import { IconAlertCircleFilled, IconCheck } from '@tabler/icons-react';
import useUpdatePermission from '../_hooks/useUpdatePermission';
import { showError } from '@/utils/common.util';

export default function PermissionForm({ permissionNo }: { permissionNo: number }) {
  const { data, fetchStatus } = usePermission({ permissionNo });
  const { mutate: deletePermission, isPending: isDeleting, isSuccess: isDeleted } = useDeletePermission();
  const {
    mutate: updatePermission,
    isPending: isUpdating,
    isSuccess: isUpdated,
    isError: isUpdateError,
    error: updateError,
  } = useUpdatePermission();
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const router = useRouter();

  const isButtonLoading = isDeleting || isUpdating;

  const form = useForm({
    initialValues: {
      name: data?.name ?? '',
      description: data?.description ?? '',
      defaultExtraCondition: data?.defaultExtraCondition ?? '',
      defaultExtraLimit: data?.defaultExtraLimit ?? '',
    },
    validate: {
      name: (value) => {
        const { error } = createPermissionDtoSchema.shape.name.safeParse(value);
        if (error) return showError(error);
      },
      description: (value) => {
        if (value === '') return null;
        const { error } = createPermissionDtoSchema.shape.description.safeParse(value);
        if (error) return showError(error);
      },
      defaultExtraCondition: (value) => {
        if (value === '') return null;
        const { error } = createPermissionDtoSchema.shape.defaultExtraCondition.safeParse(value);
        if (error) return showError(error);
      },
      defaultExtraLimit: (value) => {
        if (value === '') return null;
        const { error } = createPermissionDtoSchema.shape.defaultExtraLimit.safeParse(value);
        if (error) return showError(error);
      },
    },
  });

  useEffect(() => {
    if (!data) return;
    form.setValues({
      name: data.name,
      description: data.description ?? '',
      defaultExtraCondition: data.defaultExtraCondition ?? '',
      defaultExtraLimit: data.defaultExtraLimit ?? '',
    });
    form.setInitialValues(form.values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]); // form을 dependency에 추가하면 무한 렌더링 발생

  function handleSubmit(values: typeof form.values) {
    form.validate();

    if (!data) return;

    const notificationId = notifications.show({
      loading: true,
      title: '권한을 수정하고 있습니다. 잠시만 기다려주십시오.',
      message: '',
      autoClose: false,
      withCloseButton: false,
      position: 'top-center',
    });
    setNotificationId(notificationId);

    const submitValue = {
      ...values,
      description: values.description || null,
      defaultExtraCondition: values.defaultExtraCondition || null,
      defaultExtraLimit: values.defaultExtraLimit || null,
    };

    const parsedFormData = createPermissionDtoSchema.safeParse(submitValue);

    const parsedPermissionData = permissionSchema.safeParse({
      ...data,
      ...parsedFormData.data,
    });

    if (parsedPermissionData.success) {
      updatePermission({
        params: {
          permissionNo,
        },
        permission: parsedPermissionData.data,
      });
    } else {
      notifications.update({
        id: notificationId,
        loading: false,
        title: '입력 값이 올바르지 않습니다.',
        message: showError(parsedPermissionData.error),
        icon: <IconAlertCircleFilled size={18} />,
        autoClose: false,
        withCloseButton: true,
        position: 'top-center',
        color: 'red',
      });
    }
  }

  useEffect(() => {
    if (!isUpdateError || !notificationId) return;

    notifications.update({
      id: notificationId,
      loading: false,
      title: '권한 수정 중 오류가 발생했습니다.',
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
      title: '권한을 수정했습니다.',
      message: '',
      icon: <IconCheck size={18} />,
      autoClose: true,
      withCloseButton: true,
      position: 'top-center',
      color: 'green',
    });
    form.setInitialValues(form.values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdated, notificationId]);

  function handleDelete() {
    deletePermission({
      permissionNo,
    });
  }

  useEffect(() => {
    if (!isDeleted) return;

    notifications.show({
      title: '권한이 성공적으로 삭제되었습니다.',
      message: '권한 목록으로 이동합니다.',
      icon: <IconCheck size={18} />,
      autoClose: true,
      withCloseButton: true,
      position: 'top-center',
      color: 'green',
    });

    router.push(`/permissions`);
  }, [isDeleted, router]);

  if (fetchStatus === 'fetching') {
    return <>데이터를 불러오고 있습니다.</>;
  }

  return (
    <>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            withAsterisk
            name="name"
            label="권한 이름"
            placeholder="ex) 학생 관리"
            maxLength={createPermissionDtoSchema.shape.name.maxLength ?? undefined}
            {...form.getInputProps('name')}
          />

          <Textarea
            name="description"
            label="권한 설명"
            placeholder="ex) 학생 관리 권한은 학생 정보를 관리할 수 있는 권한입니다."
            autosize
            minRows={3}
            maxRows={5}
            {...form.getInputProps('description')}
          />

          <TextInput
            name="defaultExtraCondition"
            label="기본 추가 조건"
            placeholder=""
            {...form.getInputProps('defaultExtraCondition')}
          />

          <TextInput
            name="defaultExtraLimit"
            label="기본 추가 제한"
            placeholder=""
            {...form.getInputProps('defaultExtraLimit')}
          />

          <Grid justify="flex-start" mb="md">
            <Grid.Col span={{ base: 12, md: 'content' }}>
              <Button type="submit" fullWidth loading={isButtonLoading}>
                수정
              </Button>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 'content' }}>
              <Button
                type="reset"
                variant="transparent"
                color="grey"
                fullWidth
                loading={isButtonLoading}
                onClick={form.reset}>
                초기화
              </Button>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 'content' }}>
              <Button
                type="button"
                variant="filled"
                color="red"
                fullWidth
                loading={isButtonLoading}
                onClick={handleDelete}>
                삭제
              </Button>
            </Grid.Col>
          </Grid>
        </Stack>
      </form>
    </>
  );
}

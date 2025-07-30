'use client';

import { Anchor, Button, Group, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showLoadingNotification, updateToError, updateToSuccess } from '@/utils/notification.utils';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import useCreatePermission from '../_hooks/useCreatePermission';
import { ZodError } from 'zod';
import { showError } from '@/utils/common.util';
import { DEFAULT_NOTIFICATION_AUTOCLOSE_MS } from '@/lib/default.constant';
import { createPermissionDtoSchema } from '@/types/permission/permission';

export default function PermissionCreateForm() {
  const router = useRouter();
  const { mutate: createPermission, isSuccess, data, isError, error } = useCreatePermission();
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const permissionLink = useMemo(() => {
    if (!data?.permissionNo) return '';
    return `/permissions/${data.permissionNo}`;
  }, [data?.permissionNo]);

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      defaultExtraCondition: '',
      defaultExtraLimit: '',
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
    validateInputOnChange: true,
  });

  function handleSubmit(values: typeof form.values) {
    const submitValue = {
      ...values,
      description: values.description || null,
      defaultExtraCondition: values.defaultExtraCondition || null,
      defaultExtraLimit: values.defaultExtraLimit || null,
    };
    createPermission(submitValue);

    const notificationId = showLoadingNotification('권한을 추가하고 있습니다. 잠시만 기다려주십시오.');
    setNotificationId(notificationId);
  }

  useEffect(() => {
    if (!isError || !notificationId) return;

    let errorMessage = <>{error.message}</>;
    if (error instanceof ZodError) {
      errorMessage = <>{showError(error)}</>;
    }

    updateToError(notificationId, '권한을 추가하는 중 오류가 발생했습니다.', errorMessage);
  }, [notificationId, isError, error]);

  useEffect(() => {
    if (!notificationId || !isSuccess) return;

    updateToSuccess(
      notificationId,
      '권한을 성공적으로 추가했습니다.',
      <Group gap="xs">
        <Text>잠시 후 권한 페이지로 이동합니다.</Text>
        <Anchor href={permissionLink}>바로 가기</Anchor>
      </Group>,
    );

    setTimeout(() => {
      router.push(permissionLink);
    }, DEFAULT_NOTIFICATION_AUTOCLOSE_MS);
  }, [notificationId, isSuccess, data, router, permissionLink]);

  return (
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

        <Group justify="flex-start" mb="md">
          <Button type="submit">추가</Button>
          <Button type="reset" variant="transparent" color="gray">
            취소
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

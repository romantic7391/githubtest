'use client';

import { Alert, Anchor, Button, Divider, Group, PasswordInput, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import useSignin from '../_hooks/useSignIn';
import { useEffect } from 'react';
import { IconAlertCircleFilled } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLoadingOverlay from '../../_components/AuthLoadingOverlay';
import TitleWithLogo from '../../_components/TitleWithLogo';

export default function SignInForm() {
  const {
    mutate: signIn,
    data: callbackUrl,
    isPending: isSignInLoading,
    isSuccess: isSignInSuccess,
    isError: isSignInError,
    error: signInError,
  } = useSignin();
  const router = useRouter();

  const form = useForm({
    initialValues: {
      signInId: '',
      password: '',
    },

    validate: {
      signInId: (value) => {
        if (!value) {
          return '아이디를 입력해주세요.';
        }
        return null;
      },
      password: (value) => {
        if (!value) {
          return '비밀번호를 입력해주세요.';
        }
        return null;
      },
    },
  });

  function handleSubmit(values: typeof form.values) {
    signIn({
      signInId: values.signInId,
      password: values.password,
    });
  }

  useEffect(() => {
    if (!isSignInSuccess) return;

    router.push(callbackUrl ?? '/');
  }, [isSignInSuccess, callbackUrl, router]);

  return (
    <>
      <TitleWithLogo title="공기질 관리자 로그인" />
      <form onSubmit={form.onSubmit(handleSubmit)} style={{ position: 'relative' }}>
        <AuthLoadingOverlay isLoading={isSignInLoading} message="로그인 중입니다." />

        {isSignInError && (
          <Alert color="red" withCloseButton title="로그인 실패" icon={<IconAlertCircleFilled size={18} />}>
            {signInError.message}
          </Alert>
        )}
        <TextInput
          size="md"
          mt="md"
          label="아이디"
          placeholder="아이디를 입력해주세요."
          disabled={isSignInLoading}
          {...form.getInputProps('signInId')}
        />
        <PasswordInput
          size="md"
          mt="md"
          label="비밀번호"
          placeholder="비밀번호를 입력해주세요."
          disabled={isSignInLoading}
          {...form.getInputProps('password')}
        />
        <Stack>
          <Button size="md" mt="xl" type="submit" fullWidth disabled={isSignInLoading}>
            로그인
          </Button>
          <Group>
            <Anchor component={Link} href="/auth/signup">
              회원가입
            </Anchor>
            <Divider orientation="vertical" />
            <Anchor>비밀번호 찾기</Anchor>
          </Group>
        </Stack>
      </form>
    </>
  );
}

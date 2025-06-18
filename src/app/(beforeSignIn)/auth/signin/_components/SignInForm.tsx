'use client';

import {
  Alert,
  Anchor,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Image,
  Loader,
  LoadingOverlay,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Carousel } from '@mantine/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useForm } from '@mantine/form';
import useSignin from '../_hooks/useSignIn';
import { useEffect } from 'react';
import { IconAlertCircleFilled } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignInForm() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
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
  }, [isSignInSuccess, callbackUrl]);

  return (
    <Paper shadow="md" h="100%">
      <Flex h="100%">
        <Flex h="100%" flex={1} justify="center">
          <Stack w="100%" h="100%" px="xl" pb={80} maw={450} justify="center">
            <Group justify="center">
              <Image src="/logo.svg" alt="logo" h={32} w="auto" />
              <Title order={2}>공기질 관리자 로그인</Title>
            </Group>
            <form onSubmit={form.onSubmit(handleSubmit)} style={{ position: 'relative' }}>
              <LoadingOverlay
                visible={isSignInLoading}
                zIndex={1000}
                overlayProps={{
                  blur: 2,
                  radius: 'sm',
                }}
                loaderProps={{
                  children: (
                    <>
                      <Loader />
                      <Text>로그인 중...</Text>
                    </>
                  ),
                }}
              />

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
              <Button size="md" mt="xl" type="submit" fullWidth disabled={isSignInLoading}>
                로그인
              </Button>
            </form>
            <Group>
              <Anchor component={Link} href="/auth/signup">
                회원가입
              </Anchor>
              <Divider orientation="vertical" />
              <Anchor>비밀번호 찾기</Anchor>
            </Group>
          </Stack>
        </Flex>

        {!isMobile && (
          <Box bg="blue.6" flex={2}>
            <Carousel
              h="100%"
              withControls={false}
              emblaOptions={{
                loop: true,
              }}
              plugins={[Autoplay({ delay: 5000 })]}></Carousel>
          </Box>
        )}
      </Flex>
    </Paper>
  );
}

'use client';

import { Box, Button, Flex, Paper, PasswordInput, Stack, TextInput, Title, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

export default function SignInForm() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  return (
    <Paper withBorder shadow="md" h="100%">
      <Flex h="100%">
        <Flex h="100%" flex={1} justify="center">
          <Stack w="100%" h="100%" px="lg" pb={100} maw={450} justify="center">
            <Title order={2}>공기질 관리자 페이지</Title>
            <TextInput size="md" mt="md" label="아이디" placeholder="아이디를 입력해주세요." />
            <PasswordInput size="md" mt="md" label="비밀번호" placeholder="비밀번호를 입력해주세요." />
            <Button size="md" mt="md">
              로그인
            </Button>
          </Stack>
        </Flex>

        {!isMobile && <Box bg="blue.6" flex={2}></Box>}
      </Flex>
    </Paper>
  );
}

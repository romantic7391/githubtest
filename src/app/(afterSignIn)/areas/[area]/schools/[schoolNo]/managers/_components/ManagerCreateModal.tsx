'use client';

import useIsMobile from '@/app/_hooks/useIsMobile';
import { Button, Modal, Stack, Text, TextInput } from '@mantine/core';

export default function UserCreateModal({
  opened,
  handlers,
}: {
  opened: boolean;
  schoolNo: number;
  handlers: {
    open: () => void;
    close: () => void;
  };
  onSuccess: () => void;
}) {
  const isMobile = useIsMobile();

  return (
    <Modal
      opened={opened}
      onClose={handlers.close}
      fullScreen={isMobile}
      title={
        <Text fw="bold" fz="h3">
          사용자 추가
        </Text>
      }
      styles={{
        header: {
          borderStartStartRadius: isMobile ? 0 : undefined,
          borderStartEndRadius: isMobile ? 0 : undefined,
        },
        title: {
          flex: 1,
          textAlign: 'center',
        },
      }}>
      <Modal.Body>
        <Stack>
          <TextInput label="아이디" placeholder="아이디" />
          <TextInput label="이름" placeholder="이름" />
          <TextInput label="비밀번호" placeholder="비밀번호" />
          <TextInput label="비밀번호 확인" placeholder="비밀번호 확인" />
          <Button>추가</Button>
        </Stack>
      </Modal.Body>
    </Modal>
  );
}

import useIsMobile from '@/app/_hooks/useIsMobile';
import { Button, Modal, Stack, Text, TextInput } from '@mantine/core';
import styles from './_styles/GroupCreateModal.module.css';

export default function GroupCreateModal({
  opened,
  handlers,
}: {
  opened: boolean;
  handlers: {
    open: () => void;
    close: () => void;
  };
}) {
  const isMobile = useIsMobile();

  return (
    <Modal
      opened={opened}
      onClose={handlers.close}
      fullScreen={isMobile}
      title={
        <Text fw="bold" fz="h3">
          그룹 추가
        </Text>
      }
      classNames={{
        root: styles.modal,
        header: styles['modal-header'],
        title: styles['modal-title'],
      }}
      styles={{
        header: {
          borderStartStartRadius: isMobile ? 0 : undefined,
          borderStartEndRadius: isMobile ? 0 : undefined,
        },
      }}>
      <Modal.Body>
        <Stack>
          <TextInput label="그룹 이름" />
          <Button>추가</Button>
        </Stack>
      </Modal.Body>
    </Modal>
  );
}

import useIsMobile from '@/app/_hooks/useIsMobile';
import { Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import styles from './_styles/GroupCreateModal.module.css';
import useCreateGroup from '../_hooks/useCreateGroup';
import { useEffect, useState } from 'react';

export default function GroupCreateModal({
  opened,
  schoolNo,
  handlers,
  onSuccess,
}: {
  opened: boolean;
  schoolNo: number;
  handlers: {
    open: () => void;
    close: () => void;
  };
  onSuccess: (group: { groupNo: number; name: string }) => void;
}) {
  const isMobile = useIsMobile();
  const {
    data,
    mutate: createGroup,
    isPending: isCreatingGroup,
    isSuccess: isCreatedGroup,
  } = useCreateGroup({ schoolNo });
  const [groupName, setGroupName] = useState<string>('');

  useEffect(() => {
    if (!opened) return;
    setGroupName('');
  }, [opened]);

  async function handleCreateGroup() {
    createGroup({ group: { name: groupName, parentGroupNo: null, schoolNo } });
  }

  useEffect(() => {
    if (!data || !isCreatedGroup) return;
    onSuccess({ groupNo: data.groupNo, name: groupName });
    handlers.close();
  }, [data, isCreatedGroup]);

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
          <TextInput label="그룹 이름" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
          <Group>
            <Button flex={3} loading={isCreatingGroup} onClick={handleCreateGroup}>
              추가
            </Button>
            <Button flex={1} disabled={isCreatingGroup} bg="red" onClick={handlers.close}>
              취소
            </Button>
          </Group>
        </Stack>
      </Modal.Body>
    </Modal>
  );
}

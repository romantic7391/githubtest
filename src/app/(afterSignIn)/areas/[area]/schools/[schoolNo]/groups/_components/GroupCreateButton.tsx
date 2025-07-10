import { useDisclosure } from '@mantine/hooks';
import CreateButton from '@/app/(afterSignIn)/_components/CreateButton';
import GroupCreateModal from './GroupCreateModal';
import { useEffect } from 'react';

export default function GroupAddButton() {
  const [opened, handlers] = useDisclosure(false);

  useEffect(() => {
    console.log(opened);
  }, [opened]);

  return (
    <>
      <CreateButton name="그룹" onClick={handlers.open} />

      <GroupCreateModal opened={opened} handlers={handlers} />
    </>
  );
}

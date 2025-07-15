import { useDisclosure } from '@mantine/hooks';
import CreateButton from '@/app/(afterSignIn)/_components/CreateButton';
import GroupCreateModal from './GroupCreateModal';

export default function GroupCreateButton({
  schoolNo,
  onSuccess,
}: {
  schoolNo: number;
  onSuccess: (group: { groupNo: number; name: string }) => void;
}) {
  const [opened, handlers] = useDisclosure(false);

  return (
    <>
      <CreateButton name="새 그룹" onClick={handlers.open} />

      <GroupCreateModal opened={opened} schoolNo={schoolNo} handlers={handlers} onSuccess={onSuccess} />
    </>
  );
}

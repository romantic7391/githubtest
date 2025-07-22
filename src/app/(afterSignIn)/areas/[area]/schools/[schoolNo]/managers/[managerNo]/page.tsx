import { Stack, Title } from '@mantine/core';
import ManagerForm from './_components/ManagerForm';

export default async function Page({
  params,
}: {
  params: Promise<{
    managerNo: string;
  }>;
}) {
  const { managerNo } = await params;

  return (
    <Stack>
      <Title order={4}>사용자 정보</Title>
      <ManagerForm managerNo={Number(managerNo)} />
    </Stack>
  );
}

import { Stack, Title } from '@mantine/core';
import ManagerCreateForm from './_components/ManagerCreateForm';

export default async function Page({
  params,
}: {
  params: Promise<{
    area: string;
    schoolNo: string;
  }>;
}) {
  const { area, schoolNo } = await params;

  return (
    <Stack>
      <Title order={4}>사용자 추가</Title>
      <ManagerCreateForm area={area} schoolNo={Number(schoolNo)} />
    </Stack>
  );
}

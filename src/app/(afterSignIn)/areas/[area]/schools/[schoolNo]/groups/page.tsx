import { Title } from '@mantine/core';
import GroupList from './_components/GroupList';

export default async function Page({
  params,
}: {
  params: Promise<{
    schoolNo: string;
  }>;
}) {
  const { schoolNo } = await params;

  return (
    <>
      <Title order={3}>그룹</Title>
      <GroupList schoolNo={Number(schoolNo)} />
    </>
  );
}

import { Group, Stack, Title } from '@mantine/core';
import ManagerCreateButton from './_components/ManagerCreateButton';
import ManagerSearch from './_components/ManagerSearch';
import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import ManagerList from './_components/ManagerList';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{
    area: string;
    schoolNo: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { area, schoolNo } = await params;
  const sp = await searchParams;
  const name = sp.name as string | null;
  const signInId = sp.signInId as string | null;
  const page = Number(sp.page) || 1;
  const pageSize = Number(sp.pageSize) || DEFAULT_PAGE_SIZE;

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={4}>사용자 목록</Title>
        <ManagerCreateButton area={area} schoolNo={Number(schoolNo)} />
      </Group>
      <ManagerSearch />
      <ManagerList
        area={area}
        schoolNo={Number(schoolNo)}
        name={name ?? undefined}
        signInId={signInId ?? undefined}
        page={page}
        pageSize={pageSize}
      />
    </Stack>
  );
}

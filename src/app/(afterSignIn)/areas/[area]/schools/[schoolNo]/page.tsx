import { Anchor, Breadcrumbs, Stack, Title } from '@mantine/core';
import { Metadata } from 'next';
import SchoolForm from './_components/SchoolForm';

export const metadata: Metadata = {
  title: '학교 정보',
};

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
      <Stack>
        <Breadcrumbs>
          <Anchor size="sm" href={`/areas/${area}/schools`}>
            학교 목록
          </Anchor>
          <Anchor size="sm" href={`/areas/${area}/schools/${schoolNo}`}>
            학교 정보
          </Anchor>
        </Breadcrumbs>
        <Title order={3}>학교 정보</Title>
      </Stack>
      <SchoolForm schoolNo={Number(schoolNo)} />
    </Stack>
  );
}

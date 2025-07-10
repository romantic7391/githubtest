import { Anchor, Breadcrumbs, Stack, Title } from '@mantine/core';
import SchoolTab from './_components/SchoolTab';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
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
        <SchoolTab area={area} schoolNo={schoolNo} />
      </Stack>
      {children}
    </Stack>
  );
}

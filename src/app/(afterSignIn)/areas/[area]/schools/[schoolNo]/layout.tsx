import { Stack } from '@mantine/core';
import SchoolTab from './_components/SchoolTab';
import { Metadata } from 'next';
import BreadcrumbNavigation from '../../../../_components/BreadcrumbNavigation';

export const metadata: Metadata = {
  title: '학교 정보',
};

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
        <BreadcrumbNavigation title="학교 정보" backHref={`/areas/${area}/schools`} />
        <SchoolTab area={area} schoolNo={schoolNo} />
      </Stack>
      {children}
    </Stack>
  );
}

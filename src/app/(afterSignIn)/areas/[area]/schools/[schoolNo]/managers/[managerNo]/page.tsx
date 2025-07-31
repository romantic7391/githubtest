import { Stack } from '@mantine/core';
import ManagerForm from './_components/ManagerForm';
import BreadcrumbNavigation from '@/app/(afterSignIn)/_components/BreadcrumbNavigation';

export default async function Page({
  params,
}: {
  params: Promise<{
    area: string;
    schoolNo: string;
    managerNo: string;
  }>;
}) {
  const { area, schoolNo, managerNo } = await params;

  return (
    <Stack>
      <BreadcrumbNavigation title="사용자 정보" backHref={`/areas/${area}/schools/${schoolNo}/managers`} />
      <ManagerForm managerNo={Number(managerNo)} />
    </Stack>
  );
}

import { Stack } from '@mantine/core';
import ManagerCreateForm from './_components/ManagerCreateForm';
import BreadcrumbNavigation from '@/app/(afterSignIn)/_components/BreadcrumbNavigation';

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
      <BreadcrumbNavigation title="사용자 추가" backHref={`/areas/${area}/schools/${schoolNo}/managers`} />
      <ManagerCreateForm area={area} schoolNo={Number(schoolNo)} />
    </Stack>
  );
}

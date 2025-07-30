import GroupList from './_components/GroupList';
import BreadcrumbNavigation from '@/app/(afterSignIn)/_components/BreadcrumbNavigation';

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
      <BreadcrumbNavigation title="그룹" showBackButton={false} />
      <GroupList schoolNo={Number(schoolNo)} />
    </>
  );
}

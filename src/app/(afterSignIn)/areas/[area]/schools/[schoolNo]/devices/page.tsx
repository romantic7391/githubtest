import DeviceList from './_components/DeviceList';
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
    <>
      <BreadcrumbNavigation title="센서 장치" showBackButton={false} />
      <DeviceList area={area} schoolNo={Number(schoolNo)} />
    </>
  );
}

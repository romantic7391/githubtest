import DeviceList from './_components/DeviceList';

export default async function Page({
  params,
}: {
  params: Promise<{
    area: string;
    schoolNo: string;
  }>;
}) {
  const { area, schoolNo } = await params;
  return <DeviceList area={area} schoolNo={Number(schoolNo)} />;
}

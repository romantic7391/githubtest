import { Metadata } from 'next';
import DeviceList from './_components/DeviceList';

export const metadata: Metadata = {
  title: '센서 장치',
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
  return <DeviceList area={area} schoolNo={Number(schoolNo)} />;
}

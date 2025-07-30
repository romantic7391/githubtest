import { Title } from '@mantine/core';
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

  return (
    <>
      <Title order={3}>센서 장치 목록</Title>
      <DeviceList area={area} schoolNo={Number(schoolNo)} />
    </>
  );
}

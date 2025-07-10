import GroupList from './_components/GroupList';

export default async function Page({
  params,
}: {
  params: Promise<{
    area: string;
    schoolNo: string;
  }>;
}) {
  const { area, schoolNo } = await params;
  return <GroupList area={area} schoolNo={Number(schoolNo)} />;
}

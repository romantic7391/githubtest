import GroupList from './_components/GroupList';

export default async function Page({
  params,
}: {
  params: Promise<{
    area: string;
    schoolNo: string;
  }>;
}) {
  const { schoolNo } = await params;
  return <GroupList schoolNo={Number(schoolNo)} />;
}

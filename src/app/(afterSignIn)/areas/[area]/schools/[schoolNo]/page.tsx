import DefaultInfoForm from './_components/DefaultInfoForm';

export default async function Page({
  params,
}: {
  params: Promise<{
    area: string;
    schoolNo: string;
  }>;
}) {
  const { schoolNo } = await params;

  return <DefaultInfoForm schoolNo={Number(schoolNo)} />;
}

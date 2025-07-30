import { Stack } from '@mantine/core';
import SchoolSearch from './_components/SchoolSearch';
import SchoolList from './_components/SchoolList';
import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import SchoolAddButton from './_components/SchoolAddButton';
import { Metadata } from 'next';
import BreadcrumbNavigation from '../../../_components/BreadcrumbNavigation';

export const metadata: Metadata = {
  title: '학교 목록',
};

/**
 * 지역 학교 목록 페이지
 *
 * - page: number 페이지 번호
 * - pageSize: number 페이지 당 아이템 수
 * - sname: string 학교 이름
 * - scode: string 학교 코드
 */
export default async function Page(params: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await params.searchParams;
  const sname = searchParams.sname as string | null;
  const scode = searchParams.scode as string | null;
  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || DEFAULT_PAGE_SIZE;

  return (
    <>
      <Stack>
        <BreadcrumbNavigation title="학교 목록" showBackButton={false} actions={<SchoolAddButton />} />
        <SchoolSearch />
        <SchoolList sname={sname} scode={scode} page={page} pageSize={pageSize} />
      </Stack>
    </>
  );
}

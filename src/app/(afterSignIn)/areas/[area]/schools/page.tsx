import { Group, Stack, Title } from '@mantine/core';
import Search from './_components/Search';
import SchoolList from './_components/SchoolList';
import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import SchoolAddButton from './_components/SchoolAddButton';

/**
 * 지역 학교 목록 페이지
 *
 * @todo 학교 목록 조회
 * @todo 학교 목록 필터링
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
      <title>학교 목록 :: 공기질 관리자 페이지</title>
      <Stack>
        <Group justify="space-between">
          <Title order={3}>학교 목록</Title>
          <SchoolAddButton />
        </Group>
        <Search />
        <SchoolList sname={sname} scode={scode} page={page} pageSize={pageSize} />
      </Stack>
    </>
  );
}

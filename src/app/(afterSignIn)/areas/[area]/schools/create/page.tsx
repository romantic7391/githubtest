import { Stack } from '@mantine/core';
import React from 'react';
import SchoolCreateForm from './_components/SchoolCreateForm';
import { Metadata } from 'next';
import SchoolSearchModal from './_components/SchoolSearchModal';
import BreadcrumbNavigation from '../../../../_components/BreadcrumbNavigation';

export const metadata: Metadata = {
  title: '학교 추가',
};

/**
 * 학교 추가 페이지
 *
 * @todo 나이스 API 학교 검색
 * @todo 학교 정보
 * - sname: 학교 이름 (나이스 검색)
 * - scode: 학교 코드 (나이스 검색 조합)
 * - area: 지역 (나이스 검색과 영문명 매핑)
 * - useOrderSheet: 작업지시서 사용 여부 (Y, N)
 * - administrationCode: 나이스 API
 */
export default async function Page({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params;

  return (
    <Stack>
      <Stack>
        <BreadcrumbNavigation title="학교 추가" backHref={`/areas/${area}/schools`} />
      </Stack>
      <SchoolCreateForm />
      <SchoolSearchModal />
    </Stack>
  );
}

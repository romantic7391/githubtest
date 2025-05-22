'use client';

import { useParams } from 'next/navigation';

export default function Page() {
  const { schoolNo } = useParams<{ schoolNo: string }>();

  return (
    <>
      <title>{`${schoolNo} :: 공기질 관리자 페이지`}</title>
    </>
  );
}

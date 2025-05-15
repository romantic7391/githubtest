'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function Page({}: {}) {
  const pathname = usePathname();
  const schoolNo = pathname.split('/').pop();

  return <>선택된 학교</>;
}

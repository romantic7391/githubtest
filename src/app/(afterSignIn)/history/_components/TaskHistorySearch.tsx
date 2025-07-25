'use client';

import { Code } from '@mantine/core';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function TaskHistorySearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  return <Code block>{JSON.stringify({ searchParams, pathname, router }, null, 2)}</Code>;
}

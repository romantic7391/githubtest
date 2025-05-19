'use client';

import { NavLink } from '@mantine/core';
import { IconHome, IconLocation, IconBox, IconLogs } from '@tabler/icons-react';
import { usePathname } from 'next/navigation';

export default function LeftNavigation() {
  const pathname = usePathname();

  return (
    <>
      <NavLink href="/" label="메인" leftSection={<IconHome />} defaultOpened />
      <NavLink href="/" label="지역" leftSection={<IconLocation />} defaultOpened={pathname.startsWith('/location')}>
        <NavLink href="/location/schools" label="학교" />
        <NavLink href="/location/dooes" label="교육지원청" />
        <NavLink href="/location/ooes" label="교육청" />
      </NavLink>
      <NavLink href="/devices" label="센서" leftSection={<IconBox />} />
      <NavLink href="/history" label="이력" leftSection={<IconLogs />} defaultOpened={pathname.startsWith('/history')}>
        <NavLink href="/history/task" label="작업 이력" />
        <NavLink href="/history/signin" label="로그인 이력" />
      </NavLink>
    </>
  );
}

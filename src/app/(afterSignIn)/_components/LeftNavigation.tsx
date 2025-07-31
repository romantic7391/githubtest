'use client';

import { NavLink } from '@mantine/core';
import { IconHome, IconLicense, IconLocation, IconLogs } from '@tabler/icons-react';
import { usePathname } from 'next/navigation';

export default function LeftNavigation() {
  const pathname = usePathname();

  return (
    <>
      <NavLink href="/" label="메인" leftSection={<IconHome />} defaultOpened />
      <NavLink href="/" label="지역" leftSection={<IconLocation />} defaultOpened={pathname.startsWith('/areas')}>
        <NavLink href="/areas/all/schools" label="학교" />
      </NavLink>
      <NavLink
        href="/permissions"
        label="권한"
        leftSection={<IconLicense />}
        defaultOpened={pathname.startsWith('/permissions')}></NavLink>
      <NavLink href="/history" label="이력" leftSection={<IconLogs />} defaultOpened={pathname.startsWith('/history')}>
        <NavLink href="/history/tasks" label="작업 이력" />
        <NavLink href="/history/signins" label="로그인 이력" />
      </NavLink>
    </>
  );
}

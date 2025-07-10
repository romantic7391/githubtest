'use client';

import useIsMobile from '@/app/_hooks/useIsMobile';
import { SegmentedControl, Tabs } from '@mantine/core';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SchoolTab({ area, schoolNo }: { area: string; schoolNo: string }) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const pathname = usePathname();

  // URL 경로에서 현재 탭 상태를 파악하는 함수
  const getTabFromPath = (path: string): string => {
    const segments = path.split('/');
    const lastSegment = segments[segments.length - 1];

    if (lastSegment === 'groups') return 'groups';
    if (lastSegment === 'devices') return 'devices';
    return 'info'; // 기본값 또는 schoolNo인 경우
  };

  const [selectedTab, setSelectedTab] = useState<string>(() => getTabFromPath(pathname));

  useEffect(() => {
    // URL이 변경되었을 때 selectedTab 업데이트
    const currentTab = getTabFromPath(pathname);
    setSelectedTab(currentTab);
  }, [pathname]);

  useEffect(() => {
    // selectedTab이 변경되었을 때만 라우터 업데이트
    const currentTab = getTabFromPath(pathname);
    if (selectedTab !== currentTab) {
      const tab = selectedTab === 'info' ? '' : selectedTab;
      const path = `/areas/${area}/schools/${schoolNo}/${tab}`;
      router.push(path);
    }
  }, [selectedTab, area, schoolNo, router, pathname]);

  if (isMobile) {
    const data = [
      { label: '기본 정보', value: 'info' },
      { label: '그룹', value: 'groups' },
      { label: '센서 장치', value: 'devices' },
    ];

    return <SegmentedControl value={selectedTab} onChange={(value) => setSelectedTab(value)} data={data} />;
  }

  return (
    <Tabs variant="pills" value={selectedTab} onChange={(value) => setSelectedTab(value ?? 'info')}>
      <Tabs.List>
        <Tabs.Tab value="info">기본 정보</Tabs.Tab>
        <Tabs.Tab value="groups">그룹</Tabs.Tab>
        <Tabs.Tab value="devices">센서 장치</Tabs.Tab>
      </Tabs.List>
    </Tabs>
  );
}

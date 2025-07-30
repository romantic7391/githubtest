'use client';

import useIsMobile from '@/app/_hooks/useIsMobile';
import { SegmentedControl, Tabs } from '@mantine/core';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SchoolTab({ area, schoolNo }: { area: string; schoolNo: string }) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const pathname = usePathname();

  const TAB_LIST = [
    { label: '기본 정보', value: 'info' },
    { label: '그룹', value: 'groups' },
    { label: '사용자', value: 'managers' },
    { label: '센서 장치', value: 'devices' },
  ];

  // URL 경로에서 현재 탭 상태를 파악하는 함수
  const getTabFromPath = (path: string): string => {
    const segments = path.split('/').filter((_, index) => index > 4);
    const lastSegment = segments[0];

    if (TAB_LIST.find((tab) => tab.value === lastSegment)) return lastSegment;

    return 'info';
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
    return <SegmentedControl value={selectedTab} onChange={(value) => setSelectedTab(value)} data={TAB_LIST} />;
  }

  return (
    <Tabs
      variant="pills"
      value={selectedTab}
      onChange={(value) => setSelectedTab(value ?? 'info')}
      aria-label="학교 정보 탭">
      <Tabs.List>
        {TAB_LIST.map((tab) => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
            onClick={() => router.push(`/areas/${area}/schools/${schoolNo}/${tab.value}`)}
            aria-label={`${tab.label} 탭`}>
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs>
  );
}

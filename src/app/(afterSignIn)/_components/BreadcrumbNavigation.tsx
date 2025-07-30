'use client';

import { Anchor, Breadcrumbs, Group, Stack, Title, Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import { findBreadcrumbConfig, replaceDynamicParams } from '@/config/breadcrumb.config';
import { useMemo } from 'react';
import styles from './_styles/BreadcrumbNavigation.module.css';

interface BreadcrumbNavigationProps {
  /**
   * 페이지 제목
   */
  title?: string;
  /**
   * 뒤로가기 버튼을 표시할지 여부
   */
  showBackButton?: boolean;
  /**
   * 뒤로가기 버튼 클릭 시 이동할 경로 (기본값: 상위 경로)
   */
  backHref?: string;
  /**
   * 추가 액션 버튼들
   */
  actions?: React.ReactNode;
}

/**
 * 브레드크럼 네비게이션 컴포넌트
 *
 * 현재 경로에 따라 자동으로 브레드크럼을 생성하고,
 * 뒤로가기 버튼과 페이지 제목을 표시합니다.
 */
export default function BreadcrumbNavigation({
  title,
  showBackButton = true,
  backHref,
  actions,
}: BreadcrumbNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  // 현재 경로에 맞는 브레드크럼 설정 찾기
  const breadcrumbConfig = useMemo(() => {
    return findBreadcrumbConfig(pathname);
  }, [pathname]);

  // 동적 파라미터 추출
  const dynamicParams = useMemo(() => {
    if (!breadcrumbConfig) return {};

    const params: Record<string, string> = {};

    // 정규식을 사용하여 더 정확한 매칭
    const pattern = breadcrumbConfig.path
      .replace(/\[([^\]]+)\]/g, '([^/]+)') // [param] -> ([^/]+)
      .replace(/\//g, '\\/'); // / -> \/

    const regex = new RegExp(`^${pattern}$`);
    const match = pathname.match(regex);

    if (match) {
      // 정규식 그룹에서 파라미터 추출
      const paramNames = (breadcrumbConfig.path.match(/\[([^\]]+)\]/g) || []).map((name) => name.slice(1, -1));

      paramNames.forEach((paramName, index) => {
        if (match[index + 1]) {
          params[paramName] = match[index + 1];
        }
      });
    }

    return params;
  }, [pathname, breadcrumbConfig]);

  // 브레드크럼 세그먼트 생성
  const breadcrumbSegments = useMemo(() => {
    if (!breadcrumbConfig) return [];

    return breadcrumbConfig.segments.map((segment) => ({
      ...segment,
      href: replaceDynamicParams(segment.href, dynamicParams),
    }));
  }, [breadcrumbConfig, dynamicParams]);

  // 뒤로가기 버튼 클릭 핸들러
  const handleBackClick = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      // 상위 경로로 이동
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        segments.pop(); // 마지막 세그먼트 제거
        const parentPath = segments.length > 0 ? `/${segments.join('/')}` : '/';
        router.push(parentPath);
      } else {
        router.push('/');
      }
    }
  };

  // 브레드크럼이 없는 경우 빈 컴포넌트 반환
  if (!breadcrumbConfig) {
    return null;
  }

  return (
    <Stack gap="xs" className={styles.breadcrumbContainer}>
      {/* 브레드크럼과 뒤로가기 버튼 */}
      <Group justify="space-between" align="center">
        <Group gap="md">
          {/* 뒤로가기 버튼 */}
          {showBackButton && (
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={16} />}
              onClick={handleBackClick}
              size="sm"
              className={styles.backButton}>
              뒤로가기
            </Button>
          )}

          {/* 브레드크럼 */}
          <Breadcrumbs separator="/">
            {breadcrumbSegments.map((segment, index) => {
              const isLast = index === breadcrumbSegments.length - 1;

              return (
                <Anchor
                  key={segment.href}
                  size="sm"
                  href={isLast ? undefined : segment.href}
                  c={isLast ? 'dimmed' : 'blue'}
                  className={isLast ? styles.breadcrumbItemActive : styles.breadcrumbItem}
                  onClick={isLast ? (e) => e.preventDefault() : undefined}>
                  {segment.label}
                </Anchor>
              );
            })}
          </Breadcrumbs>
        </Group>
      </Group>

      {/* 페이지 제목 */}
      {title && (
        <Group align="center" mt="xs">
          <Title order={3}>{title}</Title>
          {/* 추가 액션 버튼들 */}
          {actions && <Group gap="xs">{actions}</Group>}
        </Group>
      )}
    </Stack>
  );
}

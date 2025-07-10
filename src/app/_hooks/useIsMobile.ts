import { theme } from '@/lib/mantine/theme';
import { useMediaQuery } from '@mantine/hooks';

/**
 * 모바일 환경인지 확인합니다.
 * @returns {boolean} 모바일 환경인지 여부
 */
export default function useIsMobile() {
  return useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
}

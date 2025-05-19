import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useDebouncedCallback } from '@mantine/hooks';

interface OnSearchParams {
  /**
   * 현재 검색 키
   */
  key: string;
  /**
   * 현재 검색 값
   */
  value: string;
  /**
   * 전체 검색 파라미터
   */
  searchParams: URLSearchParams;
}

interface UseSearchProps {
  /**
   * 검색 딜레이
   */
  delay?: number;
  /**
   * 검색 콜백
   */
  onSearch?: (params: OnSearchParams) => void;
}

interface SearchOption {
  /**
   * - `true`: 동일 키를 하나씩 전달하는 경우
   * - `false`: 동일 키를 여러개 전달하는 경우
   */
  single?: boolean;
  /**
   * - `true`: 여러 종류의 키를 전달하는 경우
   * - `false`: 한 종류의 키만 전달하는 경우
   */
  combine?: boolean;
}

/**
 * 검색 파라미터 관리 훅
 *
 * @param {UseSearchProps} props
 * @returns
 */
export default function useSearch({ delay = 300, onSearch }: UseSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // TODO: 쿼리 스트링 검색 시 키를 하나만 전달하는 하는 경우 (foo=001) single true, combine false
  // TODO: 쿼리 스트링 검색 시 키 하나를 여러개 전달하는 하는 경우 (foo=001&foo=002) single false, combine false
  // TODO: 쿼리 스트링 검색 시 여러 키를 하나씩만 전달하는 경우 (foo=001&bar=002) single true, combine true
  // TODO: 쿼리 스트링 검색 시 여러 키를 여러개 전달하는 경우 (foo=001&bar=002&bar=0021&baz=003&baz=0031) single false, combine true
  const search = useDebouncedCallback(
    (key: string, value: string, option: SearchOption = { single: false, combine: true }) => {
      const params = new URLSearchParams(searchParams);

      if (!option.combine) {
        params.keys().forEach((k) => {
          params.delete(k);
        });
      }

      if (option.single && value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
      onSearch?.({ key, value, searchParams: params });
    },
    delay,
  );

  // 현재 URL의 모든 검색값을 객체로 반환
  const searchValues = Object.fromEntries(searchParams.entries());

  return {
    searchValues,

    /**
     * GET 방식 검색
     *
     * @param {string} key 검색 키
     * @param {string} value 검색 값
     */
    search,
  };
}

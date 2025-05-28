import { useSearchParams } from 'next/navigation';
import type { SchoolListParams } from '@/types/school';
import { schoolListParamsSchema } from '@/types/school';
import { useMemo } from 'react';

/**
 * 쿼리스트링에서 학교 검색 필터를 가져옵니다.
 *
 * @param {ReadonlyURLSearchParams} searchParams 쿼리스트링
 * @returns {SchoolListParams} 검색 필터
 */
export default function useSchoolSearchFilter(): SchoolListParams {
  const searchParams = useSearchParams();

  const parsedFilters = useMemo(() => {
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pagesize')) || 10;
    const snames = searchParams.getAll('snames');
    const scodes = searchParams.getAll('scodes');
    const stypes = searchParams.getAll('stypes');

    const { success, data } = schoolListParamsSchema.safeParse({
      page,
      pageSize,
      filters: {
        sname: snames[0],
        scode: scodes[0],
        useOrderSheet: stypes[0] as 'Y' | 'N' | undefined,
      },
    });

    if (success) {
      return data;
    }

    console.log('[useSchoolSearchFilter] ', searchParams.get('snames'));
    // 빈 객체를 파싱하여 기본값 얻기
    return schoolListParamsSchema.parse({});
  }, [searchParams]);

  return parsedFilters;
}

import { useSearchParams } from 'next/navigation';
import type { SchoolSearchFilter } from '@/types/school';
import { schoolSearchFilterSchema } from '@/types/school';
import { useMemo } from 'react';

/**
 * 쿼리스트링에서 학교 검색 필터를 가져옵니다.
 *
 * @param {ReadonlyURLSearchParams} searchParams 쿼리스트링
 * @returns {SchoolSearchFilter} 검색 필터
 */
export default function useSchoolSearchFilter(): SchoolSearchFilter {
  const searchParams = useSearchParams();

  const parsedFilters = useMemo(() => {
    const page = searchParams.get('page') ?? 1;
    const pageSize = searchParams.get('pagesize') ?? 10;
    const snames = searchParams.getAll('snames');
    const scodes = searchParams.getAll('scodes');
    const stypes = searchParams.getAll('stypes');

    const { success, data } = schoolSearchFilterSchema.safeParse({
      page,
      pageSize,
      snames,
      scodes,
      stypes,
    });

    if (success) {
      return data;
    }

    console.log('[useSchoolSearchFilter] ', searchParams.get('snames'));
    // 빈 객체를 파싱하여 기본값 얻기
    return schoolSearchFilterSchema.parse({});
  }, [searchParams]);

  return parsedFilters;
}

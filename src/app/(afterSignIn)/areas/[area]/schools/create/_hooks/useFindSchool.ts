// import { SCHOOL_TYPE_NAME_TO_CODE_MAP } from "@/lib/school-info.constant"; // 임시주석
import { isJsonResponse } from '@/lib/util/common.util';
import { BaseResult, SchoolSearch } from '@/types/school-finder/school';
import { useQuery } from '@tanstack/react-query';

export default function useFindSchool({ areas, areaKos, stypes, snames, page, pageSize }: SchoolSearch) {
  async function fetchData(): Promise<BaseResult> {
    const requestUrl = new URL('/api/school-finder/schools/search', window.location.origin);
    for (const area of areas ?? []) {
      requestUrl.searchParams.append('area', area);
    }
    for (const areaKo of areaKos ?? []) {
      requestUrl.searchParams.append('areaKo', areaKo);
    }
    for (const stype of stypes) {
      requestUrl.searchParams.append('stype', stype);
    }
    for (const sname of snames ?? []) {
      requestUrl.searchParams.append('sname', sname);
    }
    requestUrl.searchParams.set('page', page.toString());
    requestUrl.searchParams.set('pagesize', pageSize.toString());

    const response = await fetch(requestUrl, { method: 'GET' });

    if (!isJsonResponse(response)) {
      throw new Error('서버가 JSON 응답을 반환하지 않았습니다.');
    }

    const { success, message, data } = await response.json();
    if (!success && response.status !== 404) {
      throw new Error(message);
    }

    return data;
  }

  return useQuery({
    queryKey: ['find-school', areas, areaKos, stypes, snames, page, pageSize],
    queryFn: fetchData,
    throwOnError: (error, query) => {
      console.error(error, query);
      return true;
    },
  });
}

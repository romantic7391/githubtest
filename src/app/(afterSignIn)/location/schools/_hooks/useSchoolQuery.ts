/* eslint-disable */

import { useQuery } from '@tanstack/react-query';

export default function useSchoolQuery({
  sname = '',
  scode = '',
  page = 1,
  pageSize = 1,
}: {
  sname?: string;
  scode?: string;
  page?: number;
  pageSize?: number;
  // sensorTypes: ['온도', '습도', '미세먼지', '벤젠', '포름알데히드'],
}) {
  function getInitialData() {
    return {
      schools: [],
      pagination: {
        total: 0,
        page: 1,
        pageSize: 10,
      },
    };
  }

  async function fetchData() {
    const requestURL = new URL('/api/location/schools', window.location.origin);
    const response = await fetch(requestURL, { method: 'GET' });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('서버가 JSON 응답을 반환하지 않았습니다.');
    }

    const { success, message, data } = await response.json();
    if (!success && response.status !== 404) {
      throw new Error(message);
    }

    console.log('data', data);
    if (!data) {
      return getInitialData();
    }

    return data;
  }

  return useQuery({
    queryKey: ['schools'],
    retry: false,
    queryFn: fetchData,
    throwOnError: (error, query) => {
      console.error(error);
      throw error;
    },
  });
}

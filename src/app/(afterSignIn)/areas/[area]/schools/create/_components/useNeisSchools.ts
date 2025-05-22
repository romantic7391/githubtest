import { useQuery } from '@tanstack/react-query';

interface UseNeisSchoolsProps {
  sname: string;
}

export default function useNeisSchools({ sname }: UseNeisSchoolsProps) {
  async function fetchData() {
    const requestUrl = new URL('/api/', window.location.origin);
    requestUrl.searchParams.set('sname', sname);

    const response = await fetch(requestUrl);

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();

    return data;
  }

  return useQuery({
    queryKey: ['neis-schools', sname],
    enabled: !!sname,
    queryFn: fetchData,
  });
}

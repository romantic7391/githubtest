import { isJsonResponse } from '@/lib/util/common.util';
import { SchoolCreate, SchoolCreateOrUpdateApiResponse, schoolCreateSchema } from '@/types/school';
import { useMutation } from '@tanstack/react-query';

export default function useCreateSchool() {
  async function createData(school: SchoolCreate): Promise<SchoolCreateOrUpdateApiResponse['data']> {
    const requestUrl = new URL(`/api/areas/${school.area}/schools/create`, window.location.origin);
    const parsed = schoolCreateSchema.safeParse(school);
    if (!parsed.success) {
      throw parsed.error;
    }

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsed.data),
    });

    if (!isJsonResponse(response)) {
      throw new Error('서버가 JSON 응답을 반환하지 않았습니다.');
    }

    const { success, message, data } = await response.json();
    if (!success) {
      throw new Error(message);
    }

    return data satisfies SchoolCreateOrUpdateApiResponse['data'];
  }

  return useMutation({
    mutationFn: createData,
  });
}

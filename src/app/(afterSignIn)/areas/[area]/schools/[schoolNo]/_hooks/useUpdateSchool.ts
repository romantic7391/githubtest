import { isJsonResponse } from '@/lib/util/common.util';
import { School, SchoolCreateOrUpdateApiResponse } from '@/types/school';
import { useMutation } from '@tanstack/react-query';

export default function useUpdateSchool() {
  async function updateData(school: School): Promise<SchoolCreateOrUpdateApiResponse['data']> {
    const requestUrl = new URL(`/api/areas/${school.area}/schools/${school.schoolNo}`, window.location.origin);
    const body = JSON.stringify(school);

    const response = await fetch(requestUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
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
    mutationFn: updateData,
    onSuccess: (data) => {
      console.log('onSuccess', data);
    },
    onError: (error) => {
      console.error('onError', error);
    },
    onMutate: (variables) => {
      console.log('onMutate', variables);
    },
  });
}

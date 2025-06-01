import { HTTPStatusError } from '@/lib/common.error';
import { isJsonResponse } from '@/lib/util/common.util';
import { School, SchoolCreateOrUpdateApiResponse } from '@/types/school';
import { useMutation } from '@tanstack/react-query';

interface UpdateSchoolParams {
  params: {
    area: string;
    schoolNo: number;
  };
  school: School;
}

export default function useUpdateSchool() {
  async function updateData({ params, school }: UpdateSchoolParams): Promise<SchoolCreateOrUpdateApiResponse['data']> {
    const { area, schoolNo } = params;
    const requestUrl = new URL(`/api/areas/${area}/schools/${schoolNo}`, window.location.origin);
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
      throw new HTTPStatusError(message, response.status);
    }

    return data satisfies SchoolCreateOrUpdateApiResponse['data'];
  }

  return useMutation({
    mutationFn: updateData,
    throwOnError: () => {
      return false;
    },
  });
}

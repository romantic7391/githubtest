import { isJsonResponse } from '@/lib/util/common.util';
import type { BaseApiResponse } from '@/types/common';
import { useMutation } from '@tanstack/react-query';

export default function useDeleteSchool() {
  async function deleteData({
    area,
    schoolNo,
  }: {
    area: string;
    schoolNo: number;
  }): Promise<BaseApiResponse['success']> {
    const responseUrl = new URL(`/api/areas/${area}/schools/${schoolNo}`, window.location.origin);
    const response = await fetch(responseUrl, {
      method: 'DELETE',
    });

    if (!isJsonResponse(response)) {
      throw new Error('서버가 JSON 응답을 반환하지 않았습니다.');
    }

    const { success, message } = await response.json();
    if (!success) {
      throw new Error(message);
    }

    return success;
  }

  return useMutation({
    mutationFn: deleteData,
  });
}

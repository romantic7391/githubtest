import { isJsonResponse } from '@/lib/util/common.util';
import { ManagerSignUp } from '@/types/manager';
import { useMutation } from '@tanstack/react-query';

export default function useSignUp() {
  async function mutationFn({ signInId, password, name, schoolNo, parentGroupNo }: ManagerSignUp) {
    const requestUrl = new URL('/api/signup', window.location.origin);
    const response = await fetch(requestUrl, {
      method: 'POST',
      body: JSON.stringify({ signInId, password, name, schoolNo, parentGroupNo }),
    });
    if (!isJsonResponse(response)) {
      throw new Error('서버가 JSON 응답을 반환하지 않았습니다.');
    }
    const { success, message, data } = await response.json();

    if (!success) {
      throw new Error(message);
    }

    return data;
  }

  return useMutation({
    mutationFn: mutationFn,
    throwOnError: false,
  });
}

import { isJsonResponse } from '@/lib/util/common.util';
import { useMutation } from '@tanstack/react-query';

/**
 * 아이디 중복 확인
 */
export default function useCheckSignIdDuplicate() {
  async function mutationFn(signInId: string) {
    const requestUrl = new URL(`/api/duplicate-check/${signInId}`, window.location.origin);
    const response = await fetch(requestUrl, {
      method: 'GET',
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
    mutationFn,
  });
}

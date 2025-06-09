import { HTTPStatusError } from '@/lib/common.error';
import { isJsonResponse } from '@/lib/util/common.util';
import { Device } from '@/types/device';
import { useMutation } from '@tanstack/react-query';

interface UseCreateDeviceProps {
  area: string;
  schoolNo: number;
}

interface CreateDeviceParams {
  device: Device;
}

export default function useCreateDevice({ area, schoolNo }: UseCreateDeviceProps) {
  async function createData({ device }: CreateDeviceParams) {
    console.log('createData: ', device);
    const requestUrl = new URL(`/api/areas/${area}/schools/${schoolNo}/devices/create`, window.location.origin);
    const body = JSON.stringify(device);
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!isJsonResponse(response)) {
      throw new HTTPStatusError('서버가 JSON 응답을 반환하지 않았습니다.', response.status);
    }

    const { success, message } = await response.json();

    if (!success) {
      throw new HTTPStatusError(message, response.status);
    }

    return success;
  }

  return useMutation({
    mutationFn: createData,
  });
}

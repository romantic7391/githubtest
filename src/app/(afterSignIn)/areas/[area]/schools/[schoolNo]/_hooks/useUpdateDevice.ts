import { HTTPStatusError } from '@/lib/common.error';
import { isJsonResponse } from '@/lib/util/common.util';
import { Device } from '@/types/device';
import { useMutation } from '@tanstack/react-query';

interface UseUpdateDeviceParams {
  area: string;
  schoolNo: number;
}

interface UpdateDeviceParams {
  device: Device;
}

export default function useUpdateDevice({ area, schoolNo }: UseUpdateDeviceParams) {
  async function updateData({ device }: UpdateDeviceParams) {
    console.log('updateData: ', area, schoolNo, device);
    const requestUrl = new URL(`/api/areas/${area}/schools/${schoolNo}/devices/${device.mac}`, window.location.origin);
    const body = JSON.stringify(device);
    const response = await fetch(requestUrl, {
      method: 'PUT',
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
    mutationFn: updateData,
    throwOnError: () => {
      return false;
    },
  });
}

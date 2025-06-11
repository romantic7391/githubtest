import dayjs from '@/lib/dayjs';
import { DEFAULT_DATETIME_FORMAT } from '@/lib/default.constant';
import { useQuery } from '@tanstack/react-query';

interface UseDeviceLatestSensorDataParams {
  mac: string;
  /**
   * 센서 데이터를 가져오는 간격입니다. (단위: ms)
   */
  interval?: number;
}

/**
 * 마지막 센서 데이터를 `interval` 마다 가져옵니다.
 */
export default function useDeviceLatestSensorData({ mac, interval = 0 }: UseDeviceLatestSensorDataParams) {
  async function fetchData() {
    console.log(`${mac}의 센서 데이터를 가져옵니다. ( v, t )`);

    return {
      values: [Math.ceil(Math.random() * 100), Math.ceil(Math.random() * 100), Math.ceil(Math.random() * 100)],
      detected: dayjs().format(DEFAULT_DATETIME_FORMAT),
    };
  }

  return useQuery({
    queryKey: ['device-sensor-data', mac],
    enabled: !!mac,
    staleTime: 1000,
    gcTime: 1000,
    refetchInterval: Math.max(1000, interval),
    queryFn: fetchData,
    throwOnError: () => {
      return false;
    },
  });
}

import KPICard from './KPICard';
import { IconDeviceMobile } from '@tabler/icons-react';

export default function DeviceKPICard() {
  return (
    <KPICard
      title="센서 장치"
      value={342}
      badge={{ text: '98% 온라인', color: 'orange' }}
      icon={IconDeviceMobile}
      iconColor="var(--mantine-color-orange-6)"
    />
  );
}

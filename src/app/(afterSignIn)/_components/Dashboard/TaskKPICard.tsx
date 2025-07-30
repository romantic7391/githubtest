import { IconActivity } from '@tabler/icons-react';
import KPICard from './KPICard';

export default function TaskKPICard() {
  return (
    <KPICard
      title="오늘 작업"
      value={12}
      badge={{ text: '+3 이번 주', color: 'green' }}
      icon={IconActivity}
      iconColor="var(--mantine-color-green-6)"
    />
  );
}

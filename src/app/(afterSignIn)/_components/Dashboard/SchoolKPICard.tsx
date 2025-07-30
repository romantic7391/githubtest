import KPICard from './KPICard';
import { IconBuilding } from '@tabler/icons-react';

export default function SchoolKPICard() {
  return (
    <KPICard
      title="전체 학교"
      value={24}
      badge={{ text: '+2 이번 달', color: 'blue' }}
      icon={IconBuilding}
      iconColor="var(--mantine-color-blue-6)"
    />
  );
}

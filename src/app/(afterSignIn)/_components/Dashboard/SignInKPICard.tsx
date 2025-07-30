import KPICard from './KPICard';
import { IconLogin } from '@tabler/icons-react';

export default function SignInKPICard() {
  return (
    <KPICard
      title="오늘 로그인"
      value={89}
      badge={{ text: '+15% 어제 대비', color: 'purple' }}
      icon={IconLogin}
      iconColor="var(--mantine-color-purple-6)"
    />
  );
}

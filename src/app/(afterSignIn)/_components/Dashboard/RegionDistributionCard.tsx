import { Card, Title, Stack } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import RegionItem from './RegionItem';

interface RegionData {
  region: string;
  count: number;
  percentage: number;
  color: string;
}

interface RegionDistributionCardProps {
  title?: string;
  regions: RegionData[];
}

export default function RegionDistributionCard({ title = '지역별 학교 분포', regions }: RegionDistributionCardProps) {
  return (
    <Card withBorder padding="md" radius="md">
      <Title order={3} mb="md">
        {title}
      </Title>
      <Stack gap="sm">
        {regions.map((region, index) => (
          <RegionItem
            key={index}
            region={region.region}
            count={region.count}
            percentage={region.percentage}
            icon={IconMapPin}
            iconColor={region.color}
          />
        ))}
      </Stack>
    </Card>
  );
}

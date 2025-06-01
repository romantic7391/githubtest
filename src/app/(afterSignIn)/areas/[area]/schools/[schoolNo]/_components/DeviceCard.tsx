'use client';

import { DeviceRelForm } from '@/types/device';
import { Autocomplete, Card, Grid, Group, Select, TextInput, Title } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useState } from 'react';

export default function DeviceCard({
  index,
  device,
  form,
}: {
  index: number;
  device: DeviceRelForm;
  form: UseFormReturnType<{ devices: DeviceRelForm[] }>;
}) {
  const [kindEditMode, setKindEditMode] = useState<boolean>(false);

  // 에러 방지
  if (form.values.devices.length === 0) {
    return <></>;
  }

  return (
    <Card withBorder>
      <Card.Section p="sm" mb="sm" bg="gray.1">
        <Group>
          {kindEditMode ? (
            <Select
              size="sm"
              data={['AIR', 'HCL', 'CO', 'DP', 'CL2', 'CH2O']}
              value={device.name}
              key={form.key(`devices.${index}.name`)}
              {...form.getInputProps(`devices.${index}.name`)}
            />
          ) : (
            <Title order={5} onClick={() => setKindEditMode(!kindEditMode)} onChange={() => setKindEditMode(false)}>
              {device.name}
            </Title>
          )}
        </Group>
      </Card.Section>
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label="MAC"
            key={form.key(`devices.${index}.mac`)}
            {...form.getInputProps(`devices.${index}.mac`)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Autocomplete
            label="장소"
            data={['조리실', '전처리실', '세척실']}
            key={form.key(`devices.${index}.summary`)}
            {...form.getInputProps(`devices.${index}.summary`)}
          />
        </Grid.Col>
      </Grid>
    </Card>
  );
}

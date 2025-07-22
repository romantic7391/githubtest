import { Group, Image, Title } from '@mantine/core';

export default function TitleWithLogo({ title }: { title: string }) {
  return (
    <Group justify="center">
      <Image src="/logo.svg" alt="logo" h={32} w="auto" />
      <Title order={2}>{title}</Title>
    </Group>
  );
}

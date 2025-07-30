import { Button, Anchor } from '@mantine/core';
import { IconProps } from '@tabler/icons-react';

interface QuickActionButtonProps {
  text: string;
  href: string;
  icon: React.ComponentType<IconProps>;
}

export default function QuickActionButton({ text, href, icon: Icon }: QuickActionButtonProps) {
  return (
    <Anchor href={href} underline="never">
      <Button variant="light" fullWidth leftSection={<Icon size={16} />}>
        {text}
      </Button>
    </Anchor>
  );
}

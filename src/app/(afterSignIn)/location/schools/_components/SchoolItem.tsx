import { Anchor, Badge, Card, Group, Text } from '@mantine/core';
import styles from '../_styles/schools.module.css';

export function SchoolItem({ no = -1, name = '', code = '' }: { no: number; name: string; code: string }) {
  function getSchoolTypeBadge(sname: string) {
    const badgeProps = {
      size: 'lg',
      w: 50,
      fw: 'normal',
    };

    if (sname.includes('유치원')) {
      return (
        <Badge {...badgeProps} bg="red">
          유
        </Badge>
      );
    }
    if (sname.includes('초등학교')) {
      return (
        <Badge {...badgeProps} bg="pink">
          초
        </Badge>
      );
    }
    if (sname.includes('중학교')) {
      return (
        <Badge {...badgeProps} bg="blue">
          중
        </Badge>
      );
    }
    if (sname.includes('고등학교')) {
      return (
        <Badge {...badgeProps} bg="violet">
          고
        </Badge>
      );
    }
    if (sname.includes('특수학교')) {
      return (
        <Badge {...badgeProps} bg="green">
          특수
        </Badge>
      );
    }
    return (
      <Badge {...badgeProps} bg="gray">
        학교
      </Badge>
    );
  }

  return (
    <Anchor key={no} href={`/location/schools/${no}`} underline="never">
      <Card className={styles.card} key={no} withBorder>
        <Group>
          {getSchoolTypeBadge(name)}
          <Group gap={0}>
            <Text fz={'h5'}>{name}</Text>
            <Text fz={'h6'} c="gray">
              &#35;{code}
            </Text>
          </Group>
        </Group>
      </Card>
    </Anchor>
  );
}

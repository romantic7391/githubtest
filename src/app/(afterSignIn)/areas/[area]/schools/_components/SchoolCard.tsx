import type { School } from '@/types/school';
import { Anchor, Card, Group, Text } from '@mantine/core';
import styles from './_styles/SchoolCard.module.css';

type SchoolCardProps = Pick<School, 'schoolNo' | 'sname' | 'scode' | 'area'>;

export default function SchoolCard({ schoolNo, sname, scode, area }: SchoolCardProps) {
  return (
    <Anchor className={styles.anchor} key={schoolNo} href={`/areas/${area}/schools/${schoolNo}`} underline="never">
      <Card className={styles.card} withBorder>
        <Group gap={0}>
          <Text>{sname}</Text>
          <Text size="sm" c="gray">
            &#35;{scode}
          </Text>
        </Group>
      </Card>
    </Anchor>
  );
}

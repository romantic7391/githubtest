import { School } from '@/types/school';
import { Anchor, Card, Grid, Group, Text } from '@mantine/core';
import styles from '../_styles/schools.module.css';
import SchoolTypeBadge from './SchoolTypeBadge';
interface SchoolCardProps {
  school: School;
}

export default function SchoolCard({ school }: SchoolCardProps) {
  return (
    <Anchor href={`/location/schools/${school.no}`} underline="never">
      <Card withBorder className={styles.card}>
        <Grid>
          <Grid.Col span={{ base: 12, md: 'content' }}>
            <Group>
              <SchoolTypeBadge sname={school.sname} />
              <Group gap={5}>
                <Text>{school.sname}</Text>
                <Text c="gray">{school.scode}</Text>
              </Group>
            </Group>
          </Grid.Col>
        </Grid>
      </Card>
    </Anchor>
  );
}

import { School } from '@/types/school';
import { Anchor, Card, Group } from '@mantine/core';
import styles from '../_styles/schools.module.css';

interface SchoolCardProps {
  school: School;
}

export default function SchoolCard({ school }: SchoolCardProps) {
  return (
    <Anchor href={`/location/schools/${school.no}`} underline="never">
      <Card className={styles.card}>
        <Group>{school.sname}</Group>
      </Card>
    </Anchor>
  );
}

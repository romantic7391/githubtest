import { Badge } from '@mantine/core';

export default function SchoolTypeBadge({ sname }: { sname: string }) {
  function getSchoolType(sname: string) {
    if (sname.endsWith('유치원')) {
      return '유치원';
    }

    if (sname.endsWith('초등학교')) {
      return '초등';
    }

    if (sname.endsWith('중학교')) {
      return '중등';
    }

    if (sname.endsWith('고등학교')) {
      return '고등';
    }

    return '기타';
  }

  function getBadgeColor(schoolType: string) {
    if (schoolType === '유치원') {
      return 'orange';
    }

    if (schoolType === '초등') {
      return 'pink';
    }

    if (schoolType === '중등') {
      return 'blue';
    }

    if (schoolType === '고등') {
      return 'violet';
    }

    if (schoolType === '기타') {
      return 'green';
    }
  }

  return (
    <Badge color={getBadgeColor(getSchoolType(sname))} size="lg" radius="sm" w={55} px={0}>
      {getSchoolType(sname)}
    </Badge>
  );
}

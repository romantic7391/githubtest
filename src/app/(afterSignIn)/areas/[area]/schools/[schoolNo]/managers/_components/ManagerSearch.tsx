import Search from '@/app/(afterSignIn)/_components/Search';
import { ComboboxItem } from '@mantine/core';

export default function UserSearch() {
  const searchKeys: ComboboxItem[] = [
    {
      label: '이름',
      value: 'name',
    },
    {
      label: '로그인 ID',
      value: 'signInId',
    },
  ];

  return <Search searchKeys={searchKeys} />;
}

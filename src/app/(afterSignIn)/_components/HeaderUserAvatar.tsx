'use client';

import { Avatar, Image, Menu } from '@mantine/core';
import { IconLogout, IconSettings } from '@tabler/icons-react';
import { signOut, useSession } from 'next-auth/react';
import styles from './_styles/HeaderUserAvatar.module.css';
import { redirect } from 'next/navigation';

export default function HeaderUserAvatar() {
  const session = useSession();

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Avatar className={styles.avatar}>
          <Image src="/logo.svg" alt="(주)사랑넷 로고" w={35} />
        </Avatar>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>사용자</Menu.Label>
        <Menu.Item leftSection={<IconSettings size={14} />}>설정</Menu.Item>
        <Menu.Item
          leftSection={<IconLogout size={14} />}
          onClick={async () => {
            const user = { ...session.data?.user };
            await signOut({
              redirect: false,
            });
            await fetch('/api/signout/log', {
              method: 'POST',
              body: JSON.stringify(user),
            });
            redirect('/');
          }}>
          로그아웃
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

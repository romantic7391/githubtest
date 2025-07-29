import { Metadata } from 'next';
import { auth, signOut } from '@/auth';
import { Button, Code } from '@mantine/core';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: '메인',
};

export default async function Home() {
  const session = await auth();

  return (
    <>
      <Code block>{JSON.stringify(session, null, 2)}</Code>
      <Button
        onClick={async () => {
          'use server';
          const user = { ...session?.user };
          await signOut({
            redirect: false,
          });
          await fetch(new URL('/api/signout/log', process.env.NEXT_PUBLIC_URL), {
            method: 'POST',
            body: JSON.stringify(user),
          });
          redirect('/');
        }}>
        로그아웃
      </Button>
    </>
  );
}

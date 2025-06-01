import { Metadata } from 'next';
import { auth, signOut } from '@/auth';
import { Button, Code } from '@mantine/core';

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
          await signOut();
        }}>
        로그아웃
      </Button>
    </>
  );
}

import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: '메인',
};

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return `${session.user.name} 님 환영합니다.`;
}

import { auth } from '@/auth';
import AfterLoginLayout from './(afterSignIn)/layout';
import { notFound } from 'next/navigation';

export default async function NotFound() {
  const session = await auth();

  if (session?.user) {
    return <AfterLoginLayout>존재하지 않는 페이지입니다.</AfterLoginLayout>;
  }

  notFound();
}

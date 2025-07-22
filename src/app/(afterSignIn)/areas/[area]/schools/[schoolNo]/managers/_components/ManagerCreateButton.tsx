'use client';

import CreateButton from '@/app/(afterSignIn)/_components/CreateButton';
import { useRouter } from 'next/navigation';

export default function UserCreateButton({ area, schoolNo }: { area: string; schoolNo: number }) {
  const router = useRouter();

  return (
    <CreateButton
      name="사용자"
      onClick={() => {
        router.push(`/areas/${area}/schools/${schoolNo}/managers/create`);
      }}
    />
  );
}

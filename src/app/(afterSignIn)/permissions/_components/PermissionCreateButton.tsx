'use client';

import { useRouter } from 'next/navigation';
import CreateButton from '../../_components/CreateButton';

export default function PermissionCreateButton() {
  const router = useRouter();

  return <CreateButton name="권한" onClick={() => router.push('/permissions/create')} />;
}

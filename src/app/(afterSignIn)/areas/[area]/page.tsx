'use client';

import { useParams } from 'next/navigation';

export default function Page() {
  const { area } = useParams();

  return <>지역: {area}</>;
}

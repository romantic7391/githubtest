import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import { Select } from '@mantine/core';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function PageSizeSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageSize = Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE;
  const PAGE_SUFFIX = ' 개';
  const PAGE_SIZE_OPTIONS = ['8', '10', '20', '50', '100'];

  function handleChangePageSize(value: string | null) {
    if (!value) return;
    const pageValue = value.replace(PAGE_SUFFIX, '');

    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    params.set('pageSize', pageValue);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select
      w={90}
      data={PAGE_SIZE_OPTIONS.map((v) => `${v}${PAGE_SUFFIX}`)}
      value={`${pageSize}${PAGE_SUFFIX}`}
      onChange={handleChangePageSize}
      styles={{
        input: {
          textAlign: 'right',
        },
      }}
    />
  );
}

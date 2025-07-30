'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Card, Stack, Group, Button, TextInput, Select, Divider, Badge, ActionIcon, Tooltip } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMemo, useState } from 'react';
import { IconSearch, IconFilter, IconFilterOff } from '@tabler/icons-react';

type SearchMode = 'simple' | 'detail';

interface SimpleSearchForm {
  searchKey: string;
  searchValue: string;
}

interface DetailSearchForm {
  name: string;
}

export default function PermissionSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [searchMode, setSearchMode] = useState<SearchMode>('simple');

  const searchKeyOptions = useMemo(() => [{ value: 'name', label: '권한명' }], []);

  const selectWidth = useMemo(() => {
    return searchKeyOptions.reduce((acc, curr) => {
      const result = Math.max(acc, Buffer.byteLength(curr.label, 'utf-8') * 8);
      return result;
    }, 110);
  }, [searchKeyOptions]);

  // 단순 검색 폼
  const simpleForm = useForm<SimpleSearchForm>({
    initialValues: {
      searchKey: searchParams.get('searchKey') || 'name',
      searchValue: searchParams.get('searchValue') || '',
    },
    validate: {
      searchKey: (value) => {
        if (!searchKeyOptions.find((option) => option.value === value)) {
          return '검색 키를 선택하세요';
        }
        return null;
      },
      searchValue: (value) => {
        if (!value.trim()) {
          return '검색어를 입력하세요';
        }
        return null;
      },
    },
  });

  // 상세 검색 폼
  const detailForm = useForm<DetailSearchForm>({
    initialValues: {
      name: searchParams.get('name') || '',
    },
  });

  function deleteSearchParams(params: URLSearchParams) {
    params.delete('searchKey');
    params.delete('searchValue');
    params.delete('name');
  }

  function handleSimpleSearch(values: SimpleSearchForm) {
    const params = new URLSearchParams(searchParams);
    deleteSearchParams(params);

    if (values.searchValue.trim()) {
      params.set(values.searchKey, values.searchValue.trim());
    }

    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleDetailSearch(values: DetailSearchForm) {
    const params = new URLSearchParams(searchParams);
    deleteSearchParams(params);

    if (values.name.trim()) {
      params.set('name', values.name.trim());
    }

    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleClearSearch() {
    const params = new URLSearchParams(searchParams);
    deleteSearchParams(params);

    // 폼 초기화
    simpleForm.initialize({
      searchKey: 'name',
      searchValue: '',
    });
    detailForm.initialize({
      name: '',
    });

    router.push(pathname);
  }

  function hasActiveFilters(): boolean {
    return !!searchParams.get('name');
  }

  return (
    <Card withBorder>
      <Stack>
        {/* 검색 모드 선택 */}
        <Group justify="space-between">
          <Group>
            <Button
              variant={searchMode === 'simple' ? 'filled' : 'light'}
              size="sm"
              onClick={() => setSearchMode('simple')}>
              단순 검색
            </Button>
            <Button
              variant={searchMode === 'detail' ? 'filled' : 'light'}
              size="sm"
              onClick={() => setSearchMode('detail')}>
              상세 검색
            </Button>
          </Group>

          {hasActiveFilters() && (
            <Group>
              <Badge color="blue" variant="light">
                필터 적용됨
              </Badge>
              <Tooltip label="검색 조건 초기화">
                <ActionIcon variant="light" color="gray" onClick={handleClearSearch} aria-label="검색 조건 초기화">
                  <IconFilterOff size="1rem" />
                </ActionIcon>
              </Tooltip>
            </Group>
          )}
        </Group>

        <Divider />

        {/* 단순 검색 모드 */}
        {searchMode === 'simple' && (
          <form onSubmit={simpleForm.onSubmit(handleSimpleSearch)}>
            <Group w="100%">
              <Select
                label="검색 키"
                placeholder="검색할 항목을 선택하세요"
                data={searchKeyOptions}
                style={{ width: selectWidth + 10 }}
                {...simpleForm.getInputProps('searchKey')}
              />
              <TextInput
                label="검색어"
                placeholder="검색어를 입력하세요"
                flex={1}
                styles={{
                  wrapper: {
                    flex: 1,
                  },
                }}
                inputContainer={(children) => (
                  <Group align="flex-end">
                    {children}
                    <Button type="submit" leftSection={<IconSearch size="1rem" />}>
                      검색
                    </Button>
                  </Group>
                )}
                {...simpleForm.getInputProps('searchValue')}
              />
            </Group>
          </form>
        )}

        {/* 상세 검색 모드 */}
        {searchMode === 'detail' && (
          <form onSubmit={detailForm.onSubmit(handleDetailSearch)}>
            <Stack>
              <Group>
                <TextInput
                  label="권한명"
                  placeholder="권한명을 입력하세요"
                  style={{ flex: 1 }}
                  {...detailForm.getInputProps('name')}
                />
              </Group>

              <Group justify="flex-end">
                <Button type="submit" leftSection={<IconFilter size="1rem" />}>
                  검색
                </Button>
              </Group>
            </Stack>
          </form>
        )}
      </Stack>
    </Card>
  );
}

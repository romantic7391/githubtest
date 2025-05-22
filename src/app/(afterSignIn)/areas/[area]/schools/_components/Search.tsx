'use client';

import { Button, Card, ComboboxItem, Flex, Grid, Group, Select, Text, TextInput } from '@mantine/core';
import { useState } from 'react';
import { IconSearch } from '@tabler/icons-react';
import { useDebouncedCallback } from '@mantine/hooks';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * 검색한 내용을 쿼리 스트링으로 전달
 */
export default function Search() {
  const searchKeys: ComboboxItem[] = [
    {
      label: '학교 이름',
      value: 'sname',
    },
    {
      label: '학교 코드',
      value: 'scode',
    },
  ];

  const [searchKey, setSearchKey] = useState<ComboboxItem>(searchKeys[0]);
  const [searchValue, setSearchValue] = useState<string>('');

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const handleSearch = useDebouncedCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams);

    params.keys().forEach((k) => {
      params.delete(k);
    });

    if (value) {
      params.set(key, value);
    }

    params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  function handleReset() {
    setSearchValue('');
    router.replace(pathname);
  }

  return (
    <Card withBorder>
      <Grid>
        <Grid.Col span="content">
          <Flex h="100%" align="center">
            <Text component="label" htmlFor="sname" fw="bold">
              검색
            </Text>
          </Flex>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 'content' }}>
          <Group w="100%">
            <Select
              id="search-key"
              w={110}
              allowDeselect={false}
              data={searchKeys}
              defaultValue={searchKeys[0].value}
              onChange={(value) => {
                if (!value) return;
                setSearchKey(searchKeys.find((item) => item.value === value) || searchKeys[0]);
              }}
              tabIndex={1}
            />
            <TextInput
              id="sname"
              flex={1}
              placeholder={`${searchKey.label}을 입력해주세요.`}
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.target.value);
              }}
              onKeyDown={(event) => {
                // 엔터 키를 누르면 검색합니다.
                if (event.key === 'Enter') {
                  handleSearch(searchKey.value, searchValue);
                }
              }}
              tabIndex={2}
            />
          </Group>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 'content' }}>
          <Group>
            <Button px={10} onClick={() => handleSearch(searchKey.value, searchValue)}>
              <Group gap={5}>
                <IconSearch size={16} stroke={3} />
                검색
              </Group>
            </Button>
            <Button px={10} onClick={() => handleReset()} color="red">
              초기화
            </Button>
          </Group>
        </Grid.Col>
      </Grid>
    </Card>
  );
}

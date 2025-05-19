import type { ComboboxItem } from '@mantine/core';
import { Button, Card, Collapse, Flex, Grid, Group, Select, Text, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import useSearch from '../_hooks/useSearch';
import { IconSearch } from '@tabler/icons-react';

export default function Search() {
  const searchKeys: ComboboxItem[] = [
    {
      label: '학교명',
      value: 'snames',
    },
    {
      label: '학교코드',
      value: 'scodes',
    },
    {
      label: '학교구분',
      value: 'stypes',
    },
  ];

  const [searchKey, setSearchKey] = useState<string>(searchKeys[0].value);
  const [searchValue, setSearchValue] = useState<string>('');
  const [opened, handlers] = useDisclosure(false);
  const { search } = useSearch({});

  function handleChangeValue(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchValue(event.target.value);
  }

  return (
    <Card withBorder>
      <Grid>
        <Grid.Col span="content">
          <Flex h="100%" align="center">
            <Text component="label" htmlFor="search-type" fw="bold">
              검색어
            </Text>
          </Flex>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 'content' }}>
          <Group w="100%">
            <Select
              id="search-type"
              w={110}
              allowDeselect={false}
              data={searchKeys}
              defaultValue={searchKeys[0].value}
              onChange={(value) => {
                if (!value) return;
                setSearchKey(value);
              }}
            />
            <TextInput flex={1} id="search" placeholder="검색어를 입력해주세요." onChange={handleChangeValue} />
            <Button px={10} onClick={() => search(searchKey, searchValue)}>
              <Group gap={5}>
                <IconSearch size={16} stroke={3} />
                검색
              </Group>
            </Button>
          </Group>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 'content' }}>
          <Button onClick={() => handlers.toggle()}>상세 검색</Button>
        </Grid.Col>
      </Grid>
      <Collapse in={opened} pt={8}>
        TODO: 자세한 필터링
      </Collapse>
    </Card>
  );
}

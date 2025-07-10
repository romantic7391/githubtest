import { Button, Card, Flex, Grid, Group, Select, Text, TextInput } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

export default function DeviceSearchCard({
  searchType,
  setSearchType,
  setSearchValue,
}: {
  searchType: string;
  setSearchType: Dispatch<SetStateAction<string>>;
  setSearchValue: Dispatch<SetStateAction<string>>;
}) {
  // 내부에선 value, setValue를 사용하여 입력 값을 빠르게 확인하고
  // 실제 검색에는 handleSearch로 딜레이를 주며 검색합니다.
  const [value, setValue] = useState<string>('');
  const handleSearch = useDebouncedCallback((value: string) => {
    setSearchValue(value);
  }, 300);

  useEffect(() => {
    handleSearch(value);
  }, [value, handleSearch]);

  return (
    <Card withBorder>
      <Grid>
        <Grid.Col span={{ base: 'content', md: 'content' }}>
          <Flex h="100%" align="center">
            <Text component="label" htmlFor="device-search-type" fw="bold">
              검색
            </Text>
          </Flex>
        </Grid.Col>
        <Grid.Col span={{ base: 3, xs: 2, lg: 1 }}>
          <Select
            id="device-search-type"
            allowDeselect={false}
            data={[
              { value: 'name', label: '이름' },
              { value: 'mac', label: 'MAC' },
            ]}
            value={searchType}
            onChange={(value) => setSearchType(value ?? '')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 'auto' }}>
          <TextInput
            id="device-search"
            placeholder="검색어를 입력해주세요."
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 'content' }}>
          <Group>
            <Button px={10} onClick={() => {}}>
              <Group gap={5}>
                <IconSearch size={16} stroke={3} />
                검색
              </Group>
            </Button>
            <Button px={10} onClick={() => {}} color="red">
              초기화
            </Button>
            <Button px={10} onClick={() => {}}>
              <Group gap={5}>
                <IconPlus size={16} stroke={3} />
                장치 추가
              </Group>
            </Button>
          </Group>
        </Grid.Col>
      </Grid>
    </Card>
  );
}

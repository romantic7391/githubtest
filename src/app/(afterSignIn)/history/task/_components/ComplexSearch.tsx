'use client';

import {
  Accordion,
  Autocomplete,
  Button,
  Flex,
  Grid,
  Group,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import styles from './_styles/ComplexSearch.module.css';

export default function ComplexSearch() {
  const searchKeys = [
    { label: '전체', value: 'all' },
    { label: '지역', value: 'area' },
    { label: '학교 이름', value: 'sname' },
    { label: '그룹 이름', value: 'gname' },
    { label: '사용자 이름', value: 'mname' },
    { label: '사용자 아이디', value: 'mid' },
    { label: '이력 날짜', value: 'date' },
    { label: 'IP 주소', value: 'ip' },
    { label: 'User Agent', value: 'userAgent' },
    { label: '이력 번호', value: 'historyNo' },
  ];

  const [detailSearch, setDetailSearch] = useState<boolean>(false);

  return (
    <Accordion
      value={detailSearch ? 'detail' : 'simple'}
      variant="contained"
      defaultValue={'simple'}
      chevron={<></>}
      classNames={{
        control: styles.control,
      }}>
      <Accordion.Item value="detail">
        <Accordion.Control>
          <Grid>
            <Grid.Col span="content">
              <Flex h="100%" align="center">
                <Text component="label" htmlFor="search-key" fw="bold">
                  검색
                </Text>
              </Flex>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 'content' }}>
              <Group w="100%">
                <Select
                  id="search-key"
                  w={130}
                  comboboxProps={{
                    width: 150,
                    position: 'bottom-start',
                  }}
                  allowDeselect={false}
                  data={searchKeys}
                  defaultValue={searchKeys[0].value}
                  readOnly={searchKeys.length === 1}
                />
                <TextInput
                  flex={1}
                  onKeyDown={(event) => {
                    // 엔터 키를 누르면 검색합니다.
                    if (event.key === 'Enter') {
                    }
                  }}
                />
              </Group>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 'content' }}>
              <Group>
                <Switch
                  component="span"
                  size="xl"
                  checked={detailSearch}
                  onChange={() => setDetailSearch(!detailSearch)}
                  offLabel="간단"
                  onLabel="상세"
                />
                <Button component="span" px={10}>
                  <Group gap={5}>
                    <IconSearch size={16} stroke={3} />
                    검색
                  </Group>
                </Button>
                <Button component="span" px={10} color="red">
                  초기화
                </Button>
              </Group>
            </Grid.Col>
          </Grid>
        </Accordion.Control>
        <Accordion.Panel>
          <Stack>
            <Group>
              <Autocomplete label="지역" />
              <Autocomplete label="학교" />
              <Autocomplete label="그룹" />
              <Autocomplete label="사용자 이름" />
            </Group>
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

'use client';

import { Button, Group, Modal, Pagination, Radio, Stack, Text, TextInput } from '@mantine/core';
import styles from './_styles/SchoolSearchModal.module.css';
import { useEffect, useMemo, useState } from 'react';
import { useSchoolSearchModalStore } from '@/stores/modal/school-search-modal.store';
import { IconSearch } from '@tabler/icons-react';
import useFindSchool from '../_hooks/useFindSchool';
import { BaseResultItem } from '@/types/school-finder/school';
import useIsMobile from '@/app/_hooks/useIsMobile';

/**
 * 학교 검색 모달. 학교알리미와 유치원알리미를 통해 추가할 학교를 검색할 수 있습니다.
 * @returns 학교 검색 모달
 */
export default function SchoolSearchModal() {
  const isMobile = useIsMobile();
  const opened = useSchoolSearchModalStore((state) => state.opened);
  const close = useSchoolSearchModalStore((state) => state.close);
  const searchFilter = useSchoolSearchModalStore((state) => state.searchFilter);
  const setSearchFilter = useSchoolSearchModalStore((state) => state.setSearchFilter);
  const setSelectedSchool = useSchoolSearchModalStore((state) => state.setSelectedSchool);

  const [page, setPage] = useState(searchFilter.page);
  const [sname, setSName] = useState(searchFilter.snames?.[0] ?? '');

  const { data, isLoading } = useFindSchool({
    ...searchFilter,
    page,
  });
  const schools = useMemo(() => {
    if (!data) return [];
    return data.items;
  }, [data]);
  const pagination = useMemo(() => {
    if (!data)
      return {
        page: 1,
        pageSize: 0,
        total: 0,
        totalPage: 1,
      };
    return data.pagination;
  }, [data]);

  useEffect(() => {
    setSName(searchFilter.snames?.[0] ?? '');
  }, [searchFilter]);

  function handleSearch() {
    setSearchFilter({
      ...searchFilter,
      snames: [sname],
      page,
    });
  }

  function handleSelectSchool(school: BaseResultItem) {
    setSelectedSchool({
      sname: school.sname,
      scode: school.scode,
      area: null, // 추후 API에서 추가
      administrationCode: null,
    });
    close();
  }

  return (
    <Modal
      opened={opened}
      onClose={close}
      fullScreen={isMobile}
      title={
        <Text fw="bold" fz="h3">
          학교 검색
        </Text>
      }
      classNames={{
        root: styles.modal,
        header: styles['modal-header'],
        title: styles['modal-title'],
      }}
      styles={{
        header: {
          borderStartStartRadius: isMobile ? 0 : undefined,
          borderStartEndRadius: isMobile ? 0 : undefined,
        },
      }}>
      <Group mb="md">
        <TextInput
          flex={1}
          onChange={(event) => setSName(event.target.value)}
          value={sname}
          disabled={isLoading}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <Button px={10} onClick={handleSearch} loading={isLoading}>
          <Group gap={5}>
            <IconSearch size={16} stroke={3} />
            검색
          </Group>
        </Button>
      </Group>
      {schools && schools.length > 0 && (
        <Radio.Group
          onChange={(value) => {
            const [index, scode] = value.split('_');
            const school = schools[Number(index)];
            if (school.scode === scode) {
              handleSelectSchool(school);
            }
          }}>
          <Stack mb="md">
            {schools.map((school, index) => (
              <Radio.Card
                key={`${index}_${school.scode}`}
                withBorder
                p="md"
                value={`${index}_${school.scode}`}
                style={{
                  cursor: 'pointer',
                }}>
                <Stack>
                  <Group gap={0}>
                    <Text>{school.sname}</Text>
                    <Text size="sm" c="gray">
                      &#35;{school.scode}
                    </Text>
                  </Group>
                  <Text size="sm">주소: {school.address}</Text>
                </Stack>
              </Radio.Card>
            ))}
          </Stack>
        </Radio.Group>
      )}
      <Pagination total={pagination.totalPage} value={pagination.page} onChange={setPage} />
    </Modal>
  );
}

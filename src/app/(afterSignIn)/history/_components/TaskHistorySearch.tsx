'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  Stack,
  Group,
  Button,
  TextInput,
  Select,
  MultiSelect,
  Divider,
  Badge,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useMemo, useState } from 'react';
import { IconSearch, IconFilter, IconFilterOff } from '@tabler/icons-react';
import dayjs from '@/lib/dayjs';
import { ACTION_TYPE, historyFilterSchema } from '@/types/history';
import { showError } from '@/utils/common.util';

type SearchMode = 'simple' | 'detail';

interface SimpleSearchForm {
  searchKey: string;
  searchValue: string;
}

interface DetailSearchForm {
  startDate: Date | null;
  endDate: Date | null;
  actionTypes: string[];
  targetTables: string[];
  ip: string;
  userAgent: string;
  schoolName: string;
  managerName: string;
  reason: string;
  targetId: string;
}

export default function TaskHistorySearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [searchMode, setSearchMode] = useState<SearchMode>('simple');

  const searchKeyOptions = useMemo(() => {
    const options = Object.keys(historyFilterSchema.shape).map((key) => {
      const shape = historyFilterSchema.shape[key as keyof typeof historyFilterSchema.shape];
      const label = shape.description ?? key;
      return {
        value: key,
        label,
      };
    });
    return options;
  }, []);

  // 단순 검색 폼
  const simpleForm = useForm<SimpleSearchForm>({
    initialValues: {
      searchKey: searchParams.get('searchKey') || 'historyNo',
      searchValue: searchParams.get('searchValue') || '',
    },
    validate: {
      searchKey: (value) => {
        if (!Object.keys(historyFilterSchema.shape).find((key) => key === value)) {
          return '검색 키를 선택하세요';
        }
        return null;
      },
      searchValue: (value, formValues) => {
        const searchKey = formValues.searchKey;
        if (!value) {
          return '검색어를 입력하세요';
        }

        if (!Object.keys(historyFilterSchema.shape).find((key) => key === searchKey)) {
          return null;
        }

        const { error } =
          historyFilterSchema.shape[searchKey as keyof typeof historyFilterSchema.shape].safeParse(value);
        if (error) {
          return showError(error);
        }
      },
    },
  });

  const selectWidth = useMemo(() => {
    return searchKeyOptions.reduce((acc, curr) => {
      const result = Math.max(acc, Buffer.byteLength(curr.label, 'utf-8') * 8);
      return result;
    }, 110);
  }, [searchKeyOptions]);

  // 상세 검색 폼
  const detailForm = useForm<DetailSearchForm>({
    initialValues: {
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : null,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : null,
      actionTypes: searchParams.get('actionTypes')?.split(',') || [],
      targetTables: searchParams.get('targetTables')?.split(',') || [],
      ip: searchParams.get('ip') || '',
      userAgent: searchParams.get('userAgent') || '',
      schoolName: searchParams.get('schoolName') || '',
      managerName: searchParams.get('managerName') || '',
      reason: searchParams.get('reason') || '',
      targetId: searchParams.get('targetId') || '',
    },
  });

  const actionTypeOptions = [
    { value: ACTION_TYPE.SELECT, label: '조회' },
    { value: ACTION_TYPE.INSERT, label: '추가' },
    { value: ACTION_TYPE.UPDATE, label: '수정' },
    { value: ACTION_TYPE.DELETE, label: '삭제' },
  ];

  const targetTableOptions = [
    { value: 'history', label: '이력' },
    { value: 'manager', label: '사용자' },
    { value: 'school', label: '학교' },
    { value: 'group', label: '그룹' },
    { value: 'permission', label: '권한' },
    { value: 'device', label: '장치' },
  ];

  function deleteSearchParams(params: URLSearchParams) {
    const keys = params.keys();
    for (const key of keys) {
      params.delete(key);
    }
  }

  function handleSimpleSearch(values: SimpleSearchForm) {
    const params = new URLSearchParams(searchParams);

    deleteSearchParams(params);

    // 단순 검색 파라미터 설정
    if (values.searchValue.trim()) {
      params.set(values.searchKey, values.searchValue.trim());
    }

    // 페이지 초기화
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleDetailSearch(values: DetailSearchForm) {
    console.log('[handleDetailSearch] values: ', values);
    const params = new URLSearchParams(searchParams);

    deleteSearchParams(params);

    detailForm.validate();

    // 상세 검색 파라미터 설정
    if (values.startDate) {
      params.set('startDate', dayjs(values.startDate).format('YYYY-MM-DD'));
    }
    if (values.endDate) {
      params.set('endDate', dayjs(values.endDate).format('YYYY-MM-DD'));
    }
    if (values.actionTypes.length > 0) {
      params.set('actionTypes', values.actionTypes.join(','));
    }
    if (values.targetTables.length > 0) {
      params.set('targetTables', values.targetTables.join(','));
    }
    if (values.ip.trim()) {
      params.set('ip', values.ip.trim());
    }
    if (values.userAgent.trim()) {
      params.set('userAgent', values.userAgent.trim());
    }
    if (values.schoolName.trim()) {
      params.set('schoolName', values.schoolName.trim());
    }
    if (values.managerName.trim()) {
      params.set('managerName', values.managerName.trim());
    }
    if (values.reason.trim()) {
      params.set('reason', values.reason.trim());
    }
    if (values.targetId.trim()) {
      params.set('targetId', values.targetId.trim());
    }

    // 페이지 초기화
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleClearSearch() {
    const params = new URLSearchParams(searchParams);

    deleteSearchParams(params);
    params.set('page', '1');

    router.push(`${pathname}?${params.toString()}`);

    // 폼 초기화
    simpleForm.reset();
    detailForm.reset();
  }

  function hasActiveFilters(): boolean {
    for (const key of Object.keys(historyFilterSchema.shape)) {
      const value = searchParams.get(key);
      if (value) {
        return true;
      }
    }
    return false;
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
              {/* 기본 필터 */}
              <Group align="flex-end">
                <DatePickerInput
                  label="시작일"
                  placeholder="시작일을 선택하세요"
                  valueFormat="YYYY-MM-DD"
                  clearable
                  style={{ flex: 1 }}
                  {...detailForm.getInputProps('startDate')}
                />
                <DatePickerInput
                  label="종료일"
                  placeholder="종료일을 선택하세요"
                  valueFormat="YYYY-MM-DD"
                  clearable
                  style={{ flex: 1 }}
                  {...detailForm.getInputProps('endDate')}
                />
                <MultiSelect
                  label="액션 타입"
                  placeholder="액션 타입을 선택하세요"
                  data={actionTypeOptions}
                  clearable
                  style={{ flex: 1 }}
                  {...detailForm.getInputProps('actionTypes')}
                />
                <MultiSelect
                  label="대상 테이블"
                  placeholder="대상 테이블을 선택하세요"
                  data={targetTableOptions}
                  clearable
                  style={{ flex: 1 }}
                  {...detailForm.getInputProps('targetTables')}
                />
              </Group>

              <Stack>
                <Group>
                  <TextInput
                    label="IP 주소"
                    placeholder="IP 주소를 입력하세요"
                    style={{ flex: 1 }}
                    {...detailForm.getInputProps('ip')}
                  />
                  <TextInput
                    label="User-Agent"
                    placeholder="User-Agent를 입력하세요"
                    style={{ flex: 1 }}
                    {...detailForm.getInputProps('userAgent')}
                  />
                  <TextInput
                    label="소속명"
                    placeholder="소속명을 입력하세요"
                    style={{ flex: 1 }}
                    {...detailForm.getInputProps('schoolName')}
                  />
                </Group>
                <Group>
                  <TextInput
                    label="사용자명"
                    placeholder="사용자명을 입력하세요"
                    style={{ flex: 1 }}
                    {...detailForm.getInputProps('managerName')}
                  />
                  <TextInput
                    label="설명"
                    placeholder="설명을 입력하세요"
                    style={{ flex: 1 }}
                    {...detailForm.getInputProps('reason')}
                  />
                  <TextInput
                    label="대상 ID"
                    placeholder="대상 ID를 입력하세요"
                    style={{ flex: 1 }}
                    {...detailForm.getInputProps('targetId')}
                  />
                </Group>
              </Stack>

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

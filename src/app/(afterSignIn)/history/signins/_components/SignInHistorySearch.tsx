'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Card, Stack, Group, Button, TextInput, Select, Divider, Badge, ActionIcon, Tooltip } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useMemo, useState } from 'react';
import { IconSearch, IconFilter, IconFilterOff } from '@tabler/icons-react';
import dayjs from '@/lib/dayjs';
import { signInHistoryFilterSchema } from '@/types/manager-signin-history';

type SearchMode = 'simple' | 'detail';

interface SimpleSearchForm {
  searchKey: string;
  searchValue: string;
}

interface DetailSearchForm {
  startDate: Date | null;
  endDate: Date | null;
  success: string;
  signInId: string;
  managerName: string;
  schoolName: string;
  schoolCode: string;
  ip: string;
}

export default function SignInHistorySearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [searchMode, setSearchMode] = useState<SearchMode>('simple');

  const searchKeyOptions = useMemo(() => {
    const options = Object.keys(signInHistoryFilterSchema.shape).map((key) => {
      const shape = signInHistoryFilterSchema.shape[key as keyof typeof signInHistoryFilterSchema.shape];
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
      searchKey: searchParams.get('searchKey') || 'signInId',
      searchValue: searchParams.get('searchValue') || '',
    },
    validate: {
      searchKey: (value) => {
        if (!Object.keys(signInHistoryFilterSchema.shape).find((key) => key === value)) {
          return '검색 키를 선택하세요';
        }
        return null;
      },
      searchValue: (value, formValues) => {
        const searchKey = formValues.searchKey;
        if (!value) {
          return '검색어를 입력하세요';
        }

        if (!Object.keys(signInHistoryFilterSchema.shape).find((key) => key === searchKey)) {
          return null;
        }

        const { error } =
          signInHistoryFilterSchema.shape[searchKey as keyof typeof signInHistoryFilterSchema.shape].safeParse(value);
        if (error) {
          return error.errors[0]?.message || '유효하지 않은 값입니다.';
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
      success: searchParams.get('success') || '',
      signInId: searchParams.get('signInId') || '',
      managerName: searchParams.get('managerName') || '',
      schoolName: searchParams.get('schoolName') || '',
      schoolCode: searchParams.get('schoolCode') || '',
      ip: searchParams.get('ip') || '',
    },
  });

  const successOptions = [
    { value: 'Y', label: '성공' },
    { value: 'N', label: '실패' },
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
    const params = new URLSearchParams(searchParams);

    deleteSearchParams(params);

    detailForm.validate();

    // 상세 검색 파라미터 설정
    if (values.startDate) {
      params.set('startDate', dayjs(values.startDate).startOf('day').format('YYYY-MM-DD HH:mm:ss'));
    }
    if (values.endDate) {
      params.set('endDate', dayjs(values.endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss'));
    }
    if (values.success) {
      params.set('success', values.success);
    }
    if (values.signInId.trim()) {
      params.set('signInId', values.signInId.trim());
    }
    if (values.managerName.trim()) {
      params.set('managerName', values.managerName.trim());
    }
    if (values.schoolName.trim()) {
      params.set('schoolName', values.schoolName.trim());
    }
    if (values.schoolCode.trim()) {
      params.set('schoolCode', values.schoolCode.trim());
    }
    if (values.ip.trim()) {
      params.set('ip', values.ip.trim());
    }

    // 페이지 초기화
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleClearSearch() {
    const params = new URLSearchParams(searchParams);
    deleteSearchParams(params);

    // 폼 초기화
    simpleForm.initialize({
      searchKey: 'signInId',
      searchValue: '',
    });
    detailForm.initialize({
      startDate: null,
      endDate: null,
      success: '',
      signInId: '',
      managerName: '',
      schoolName: '',
      schoolCode: '',
      ip: '',
    });

    router.push(pathname);
  }

  function hasActiveFilters(): boolean {
    for (const key of Object.keys(signInHistoryFilterSchema.shape)) {
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
              onClick={() => setSearchMode('simple')}
              aria-label="단순 검색 모드로 변경">
              단순 검색
            </Button>
            <Button
              variant={searchMode === 'detail' ? 'filled' : 'light'}
              size="sm"
              onClick={() => setSearchMode('detail')}
              aria-label="상세 검색 모드로 변경">
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
                  firstDayOfWeek={0}
                  style={{ flex: 1 }}
                  {...detailForm.getInputProps('startDate')}
                />
                <DatePickerInput
                  label="종료일"
                  placeholder="종료일을 선택하세요"
                  valueFormat="YYYY-MM-DD"
                  clearable
                  firstDayOfWeek={0}
                  style={{ flex: 1 }}
                  {...detailForm.getInputProps('endDate')}
                />
                <Select
                  label="성공 여부"
                  placeholder="성공 여부를 선택하세요"
                  data={successOptions}
                  clearable
                  style={{ flex: 1 }}
                  {...detailForm.getInputProps('success')}
                />
                <TextInput
                  label="로그인 ID"
                  placeholder="로그인 ID를 입력하세요"
                  style={{ flex: 1 }}
                  {...detailForm.getInputProps('signInId')}
                />
              </Group>

              <Stack>
                <Group>
                  <TextInput
                    label="사용자명"
                    placeholder="사용자명을 입력하세요"
                    style={{ flex: 1 }}
                    {...detailForm.getInputProps('managerName')}
                  />
                  <TextInput
                    label="학교명"
                    placeholder="학교명을 입력하세요"
                    style={{ flex: 1 }}
                    {...detailForm.getInputProps('schoolName')}
                  />
                  <TextInput
                    label="학교 코드"
                    placeholder="학교 코드를 입력하세요"
                    style={{ flex: 1 }}
                    {...detailForm.getInputProps('schoolCode')}
                  />
                </Group>
                <Group>
                  <TextInput
                    label="IP 주소"
                    placeholder="IP 주소를 입력하세요"
                    style={{ flex: 1 }}
                    {...detailForm.getInputProps('ip')}
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

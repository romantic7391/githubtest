'use client';

import { useGroupStore } from '@/stores/group.store';
import { Button, Group, Select, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';

export default function GroupForm() {
  const selectedGroup = useGroupStore((state) => state.selectedGroup);
  const form = useForm({
    initialValues: {
      groupNo: selectedGroup?.groupNo ?? '',
      name: selectedGroup?.name ?? '',
      parentGroupNo: selectedGroup?.parentGroupNo ?? '',
      parentGroupName: selectedGroup?.parentGroupName ?? '',
      created: selectedGroup?.created ?? '',
      updated: selectedGroup?.updated ?? '',
    },
    validate: {},
  });

  useEffect(() => {
    if (!selectedGroup) return;
    form.setValues({
      groupNo: selectedGroup.groupNo,
      name: selectedGroup.name,
      parentGroupNo: selectedGroup.parentGroupNo ?? 'none',
      parentGroupName: selectedGroup.parentGroupName ?? '',
      created: selectedGroup.created ?? '',
      updated: selectedGroup.updated ?? '',
    });
    form.setInitialValues(form.values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup]);

  if (!selectedGroup) {
    return <Text>그룹 목록에서 그룹을 선택해주세요.</Text>;
  }

  return (
    <form>
      <Stack>
        <TextInput
          withAsterisk
          label="그룹 이름"
          placeholder="그룹 이름을 입력해주십시오."
          styles={{
            wrapper: {
              flex: 1,
            },
          }}
          inputContainer={(children) => (
            <Group>
              {children}
              <Button>수정</Button>
            </Group>
          )}
          {...form.getInputProps('name')}
        />

        <Select
          label="상위 그룹 선택"
          placeholder="상위 그룹을 선택해주십시오."
          data={[{ value: 'none', label: '없음' }]}
          {...form.getInputProps('parentGroupNo')}
        />
      </Stack>
    </form>
  );
}

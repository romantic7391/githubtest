import { Group, groupSchema } from '@/types/permission/group';
import { findChildren, findNode, showError, TreeNode } from '@/utils/common.util';
import { Stack, TextInput, Group as MantineGroup, Select, Grid, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';
import useUpdateGroup from '../_hooks/useUpdateGroup';
import { showSuccessNotification } from '@/utils/notification.utils';

export default function GroupDefaultForm({
  schoolNo,
  selectedGroup,
  groupTree,
  data,
}: {
  schoolNo: number;
  selectedGroup: Group | null;
  groupTree: TreeNode<Group>[];
  data: { groups: Group[] };
}) {
  const form = useForm({
    initialValues: {
      name: '',
      parentGroupNo: '',
    },
    validate: {
      name: (value) => {
        const { error } = groupSchema.shape.name.safeParse(value);
        if (error) return showError(error);
      },
    },
    validateInputOnChange: true,
  });
  const { mutate: updateGroup, isSuccess: isUpdatedGroup } = useUpdateGroup({ schoolNo });

  useEffect(() => {
    if (!selectedGroup) return;
    form.setInitialValues({
      name: selectedGroup.name,
      parentGroupNo: (selectedGroup.parentGroupNo ?? '').toString(),
    });
    form.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup]);

  function handleSubmit(values: typeof form.values) {
    if (!selectedGroup) return;

    updateGroup({
      group: {
        groupNo: selectedGroup.groupNo,
        schoolNo,
        name: values.name,
        parentGroupNo: Number(values.parentGroupNo),
      },
    });
  }

  useEffect(() => {
    if (!isUpdatedGroup) return;
    showSuccessNotification('그룹이 수정되었습니다.');
  }, [isUpdatedGroup]);

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} onReset={form.reset}>
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
          inputContainer={(children) => <MantineGroup>{children}</MantineGroup>}
          {...form.getInputProps('name')}
        />
        <Select
          label="상위 그룹 선택"
          placeholder="상위 그룹을 선택해주십시오."
          data={[
            { value: '', label: '없음' },
            ...(data?.groups ?? [])
              .map((group) => ({
                value: group.groupNo.toString(),
                label: group.name,
              }))
              .filter((group) => group.value !== selectedGroup?.groupNo.toString())
              .filter((group) => {
                // 선택된 그룹의 자식 노드들을 찾습니다
                const selectedNode = findNode<Group>(groupTree, selectedGroup?.groupNo.toString() ?? '');
                if (!selectedNode) return true;

                // 자식 노드의 ID 목록을 가져옵니다
                const childrenIds = findChildren<Group>(selectedNode.children);

                // 자식 노드가 아닌 경우만 필터링합니다
                return !childrenIds.includes(group.value);
              }),
          ]}
          {...form.getInputProps('parentGroupNo')}
        />

        <Grid>
          <Grid.Col span={{ base: 12, md: 'content' }}>
            <Button type="submit" fullWidth>
              수정
            </Button>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 'content' }}>
            <Button type="reset" variant="transparent" color="grey" fullWidth>
              초기화
            </Button>
          </Grid.Col>
        </Grid>
      </Stack>
    </form>
  );
}

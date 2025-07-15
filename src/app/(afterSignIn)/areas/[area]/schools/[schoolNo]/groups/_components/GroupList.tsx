'use client';

import { Button, Grid, Group as MantineGroup, Select, Stack, Text, TextInput, Title, Tree } from '@mantine/core';
import useFilteredGroups from '../_hooks/useFilteredGroups';
import GroupCreateButton from './GroupCreateButton';
import { buildTree, findChildren, findNode, showError, TreeNode } from '@/utils/common.util';
import { IconChevronDown } from '@tabler/icons-react';
import { Group, groupSchema } from '@/types/permission/group';
import { useEffect, useState } from 'react';
import treeStyles from './_styles/GroupTree.module.css';
import { useForm } from '@mantine/form';
import useDeleteGroup from '../_hooks/useDeleteGroup';
import useUpdateGroup from '../_hooks/useUpdateGroup';
import { notifications } from '@mantine/notifications';

export default function GroupList({ schoolNo }: { schoolNo: number }) {
  const { data, refetch } = useFilteredGroups({ schoolNo });
  const [groupTree, setGroupTree] = useState<TreeNode<Group>[]>(
    buildTree(data?.groups ?? [], 'groupNo', 'parentGroupNo', 'name'),
  );
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
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
  });
  const { mutate: deleteGroup, isSuccess: isDeletedGroup } = useDeleteGroup({ schoolNo });
  const { mutate: updateGroup, isSuccess: isUpdatedGroup } = useUpdateGroup({ schoolNo });

  useEffect(() => {
    setGroupTree(buildTree(data?.groups ?? [], 'groupNo', 'parentGroupNo', 'name'));
  }, [data]);

  useEffect(() => {
    if (!selectedGroup) return;
    form.setInitialValues({
      name: selectedGroup.name,
      parentGroupNo: (selectedGroup.parentGroupNo ?? '').toString(),
    });
    form.reset();
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
    notifications.show({
      title: '그룹이 수정되었습니다.',
      message: '',
      autoClose: true,
      withCloseButton: true,
      position: 'top-center',
      color: 'green',
    });
    refetch();
  }, [isUpdatedGroup]);

  useEffect(() => {
    if (!isDeletedGroup) return;
    notifications.show({
      title: '그룹이 삭제되었습니다.',
      message: '',
      autoClose: true,
      withCloseButton: true,
      position: 'top-center',
      color: 'green',
    });
    refetch();
    setSelectedGroup(null);
  }, [isDeletedGroup]);

  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 2 }}>
        <Stack>
          <Title order={4}>그룹 목록</Title>
          <Tree
            data={groupTree}
            expandOnClick={false}
            renderNode={({ node, expanded, hasChildren, elementProps, level, tree }) => {
              const isSelected = selectedGroup?.groupNo === (node as TreeNode<Group>).info.groupNo;

              return (
                <MantineGroup
                  p="xs"
                  {...elementProps}
                  className={`${treeStyles['tree-node']} ${isSelected ? treeStyles['selected'] : ''}`}
                  justify="space-between">
                  <MantineGroup
                    flex={1}
                    ps={`${level - 1}rem`}
                    onClick={() => setSelectedGroup(isSelected ? null : (node as TreeNode<Group>).info)}>
                    <Text>{node.label}</Text>
                  </MantineGroup>
                  {hasChildren && (
                    <IconChevronDown
                      size={18}
                      style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(270deg)' }}
                      onClick={() => tree.toggleExpanded(node.value)}
                    />
                  )}
                </MantineGroup>
              );
            }}
          />
          <GroupCreateButton
            schoolNo={schoolNo}
            onSuccess={(group) => {
              refetch().then(() => {
                setSelectedGroup({
                  ...group,
                  schoolNo,
                  parentGroupNo: null,
                  schoolName: null,
                  parentGroupName: null,
                });
              });
            }}
          />
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 9 }}>
        <Stack>
          <Title order={4}>그룹 정보</Title>
          {selectedGroup ? (
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
                  inputContainer={(children) => (
                    <MantineGroup>
                      {children}
                      {/* <Button>수정</Button> */}
                    </MantineGroup>
                  )}
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
                  <Grid.Col span={{ base: 12, md: 'content' }}>
                    <Button
                      type="button"
                      variant="filled"
                      color="red"
                      fullWidth
                      onClick={() => {
                        deleteGroup({ groupNo: selectedGroup.groupNo });
                      }}>
                      삭제
                    </Button>
                  </Grid.Col>
                </Grid>
              </Stack>
            </form>
          ) : (
            <Text>그룹 목록에서 그룹을 선택해주세요.</Text>
          )}
        </Stack>
      </Grid.Col>
    </Grid>
  );
}

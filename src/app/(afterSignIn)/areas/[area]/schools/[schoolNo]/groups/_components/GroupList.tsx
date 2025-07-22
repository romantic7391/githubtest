'use client';

import { Grid, Group as MantineGroup, Stack, Text, Title, Tree } from '@mantine/core';
import useFilteredGroups from '../_hooks/useFilteredGroups';
import GroupCreateButton from './GroupCreateButton';
import { buildTree, TreeNode } from '@/utils/common.util';
import { IconChevronDown } from '@tabler/icons-react';
import type { Group } from '@/types/permission/group';
import { useEffect, useState } from 'react';
import treeStyles from './_styles/GroupTree.module.css';
import GroupForm from './GroupForm';

export default function GroupList({ schoolNo }: { schoolNo: number }) {
  const { data, refetch } = useFilteredGroups({ schoolNo });
  const [groupTree, setGroupTree] = useState<TreeNode<Group>[]>(
    buildTree(data?.groups ?? [], 'groupNo', 'parentGroupNo', 'name'),
  );
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  useEffect(() => {
    setGroupTree(buildTree(data?.groups ?? [], 'groupNo', 'parentGroupNo', 'name'));
  }, [data]);

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
          <GroupForm
            schoolNo={schoolNo}
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
            groupTree={groupTree}
            data={data}
          />
        </Stack>
      </Grid.Col>
    </Grid>
  );
}

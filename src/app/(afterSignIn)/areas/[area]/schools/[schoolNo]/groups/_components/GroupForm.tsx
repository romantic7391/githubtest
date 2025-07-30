'use client';

import { Group } from '@/types/permission/group';
import { TreeNode } from '@/utils/common.util';
import useDeleteGroup from '../_hooks/useDeleteGroup';
import { useEffect } from 'react';
import { showSuccessNotification } from '@/utils/notification.utils';
import { Text, Button, Tabs, Stack } from '@mantine/core';
import GroupDefaultForm from './GroupDefaultForm';
import GroupPermissionForm from './GroupPermissionForm';

export default function GroupForm({
  schoolNo,
  selectedGroup,
  setSelectedGroup,
  groupTree,
  data,
}: {
  schoolNo: number;
  selectedGroup: Group | null;
  setSelectedGroup: (group: Group | null) => void;
  groupTree: TreeNode<Group>[];
  data: { groups: Group[] };
}) {
  const { mutate: deleteGroup, isSuccess: isDeletedGroup } = useDeleteGroup({ schoolNo });

  useEffect(() => {
    if (!isDeletedGroup) return;
    showSuccessNotification('그룹이 삭제되었습니다.');
    setSelectedGroup(null);
  }, [isDeletedGroup, setSelectedGroup]);

  if (!selectedGroup) {
    return <Text>그룹 목록에서 그룹을 선택해주세요.</Text>;
  }

  return (
    <Stack>
      <Tabs defaultValue="basic">
        <Tabs.List>
          <Tabs.Tab value="basic">기본 정보</Tabs.Tab>
          <Tabs.Tab value="permissions">권한 관리</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="basic" pt="md">
          <Stack>
            <GroupDefaultForm schoolNo={schoolNo} selectedGroup={selectedGroup} groupTree={groupTree} data={data} />
            <Button
              type="button"
              variant="filled"
              color="red"
              fullWidth
              onClick={() => {
                deleteGroup({ groupNo: selectedGroup.groupNo });
              }}>
              그룹 삭제
            </Button>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="permissions" pt="md">
          <GroupPermissionForm schoolNo={schoolNo} selectedGroup={selectedGroup} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

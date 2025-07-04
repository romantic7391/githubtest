import { Code, Group, Stack, Text, Tree } from '@mantine/core';
import useFilteredGroups from '../_hooks/group/useFilteredGroups';

export default function GroupList({ area, schoolNo }: { area: string; schoolNo: number }) {
  const { data, isError } = useFilteredGroups({ area, schoolNo });

  const groups = data?.groups || [];

  if (isError) {
    return <Text>그룹 목록을 불러오는 중 오류가 발생했습니다.</Text>;
  }

  return (
    <Stack>
      <Tree
        data={[
          {
            value: '1',
            label: '그룹 01',
            children: [
              {
                value: '1-1',
                label: '그룹 01의 하위 그룹 01',
                children: [
                  {
                    value: '1-1-1',
                    label: '그룹 01의 하위 그룹 01의 하위 그룹 01',
                    children: [],
                  },
                ],
              },
              {
                value: '1-2',
                label: '그룹 01의 하위 그룹 02',
                children: [],
              },
            ],
          },
        ]}
        levelOffset={23}
        renderNode={({ node, expanded, hasChildren, elementProps }) => {
          return (
            <Group gap={5} {...elementProps}>
              {hasChildren && <Text>{expanded ? '▼' : '▶'}</Text>}
              <Text>{node.label}</Text>
            </Group>
          );
        }}
      />
      <Code block>{JSON.stringify(groups, null, 2)}</Code>
    </Stack>
  );
}

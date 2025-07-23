import { Group } from '@/types/permission/group';
import {
  Stack,
  Checkbox,
  Grid,
  Button,
  Text,
  LoadingOverlay,
  Alert,
  TextInput,
  Group as MantineGroup,
} from '@mantine/core';
import { useEffect, useState, useMemo } from 'react';
import { notifications } from '@mantine/notifications';
import { IconSearch } from '@tabler/icons-react';
import usePermissions from '../_hooks/usePermissions';
import useGroupPermissions from '../_hooks/useGroupPermissions';
import useUpdateGroupPermissions from '../_hooks/useUpdateGroupPermissions';

export default function GroupPermissionForm({
  schoolNo,
  selectedGroup,
}: {
  schoolNo: number;
  selectedGroup: Group | null;
}) {
  const [selectedPermissionNos, setSelectedPermissionNos] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 권한 목록 조회
  const {
    data: permissionsData,
    isLoading: isLoadingPermissions,
    error: permissionsError,
  } = usePermissions({ schoolNo });

  // 그룹 권한 목록 조회
  const {
    data: groupPermissionsData,
    isLoading: isLoadingGroupPermissions,
    error: groupPermissionsError,
  } = useGroupPermissions({
    schoolNo,
    groupNo: selectedGroup?.groupNo ?? 0,
  });

  // 그룹 권한 업데이트
  const {
    mutate: updateGroupPermissions,
    isSuccess: isUpdatedGroupPermissions,
    isPending: isUpdatingPermissions,
  } = useUpdateGroupPermissions({
    schoolNo,
    groupNo: selectedGroup?.groupNo ?? 0,
  });

  // 선택된 그룹이 변경될 때마다 해당 그룹의 권한으로 초기화
  useEffect(() => {
    if (groupPermissionsData?.groupPermissions) {
      const currentPermissionNos = groupPermissionsData.groupPermissions
        .filter((gp) => gp.isAllowed === 'Y')
        .map((gp) => gp.permissionNo);
      setSelectedPermissionNos(currentPermissionNos);
    } else {
      setSelectedPermissionNos([]);
    }
  }, [groupPermissionsData, selectedGroup]);

  // 권한 선택/해제 핸들러
  function handlePermissionChange(permissionNo: number, checked: boolean) {
    if (checked) {
      setSelectedPermissionNos((prev) => [...prev, permissionNo]);
    } else {
      setSelectedPermissionNos((prev) => prev.filter((no) => no !== permissionNo));
    }
  }

  // 검색된 권한들
  const filteredPermissions = useMemo(() => {
    if (!permissionsData?.permissions) return [];

    return permissionsData.permissions.filter(
      (permission) =>
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (permission.description && permission.description.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }, [permissionsData?.permissions, searchTerm]);

  // 전체 선택/해제 핸들러 (검색된 권한들에 대해서만)
  function handleSelectAll(checked: boolean) {
    if (filteredPermissions.length > 0) {
      if (checked) {
        const filteredPermissionNos = filteredPermissions.map((p) => p.permissionNo);
        setSelectedPermissionNos((prev) => {
          const newSelection = [...prev];
          filteredPermissionNos.forEach((no) => {
            if (!newSelection.includes(no)) {
              newSelection.push(no);
            }
          });
          return newSelection;
        });
      } else {
        const filteredPermissionNos = filteredPermissions.map((p) => p.permissionNo);
        setSelectedPermissionNos((prev) => prev.filter((no) => !filteredPermissionNos.includes(no)));
      }
    }
  }

  // 폼 제출 핸들러
  function handleSubmit() {
    if (!selectedGroup || !permissionsData?.permissions) return;

    // 현재 그룹이 가진 권한들 (isAllowed가 'Y'인 것들만)
    const currentGroupPermissions =
      groupPermissionsData?.groupPermissions
        .filter((gp) => gp.isAllowed === 'Y')
        .map((gp) => ({
          permissionNo: gp.permissionNo,
          name: gp.permissionName,
          description: gp.permissionDescription,
          defaultExtraCondition: null,
          defaultExtraLimit: null,
        })) ?? [];

    updateGroupPermissions({
      permissions: currentGroupPermissions,
      selectedPermissionNos,
    });
  }

  // 업데이트 성공 알림
  useEffect(() => {
    if (!isUpdatedGroupPermissions) return;
    notifications.show({
      title: '그룹 권한이 수정되었습니다.',
      message: '',
      autoClose: true,
      withCloseButton: true,
      position: 'top-center',
      color: 'green',
    });
  }, [isUpdatedGroupPermissions]);

  // 로딩 상태
  const isLoading = isLoadingPermissions || isLoadingGroupPermissions || isUpdatingPermissions;

  // 에러 상태
  const hasError = permissionsError || groupPermissionsError;

  if (hasError) {
    return (
      <Alert color="red" title="오류">
        권한 정보를 불러오는데 실패했습니다. 페이지를 새로고침해주세요.
      </Alert>
    );
  }

  if (!selectedGroup) {
    return (
      <Alert color="blue" title="안내">
        권한을 관리할 그룹을 선택해주세요.
      </Alert>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <LoadingOverlay visible={isLoading} />

      <Stack>
        <MantineGroup justify="space-between" align="center">
          <Text size="lg" fw={500}>
            {selectedGroup.name} 그룹 권한 관리
          </Text>
          <Text size="sm" c="dimmed">
            선택된 권한: {selectedPermissionNos.length}개
          </Text>
        </MantineGroup>

        {permissionsData?.permissions && (
          <>
            {/* 검색 입력 */}
            <TextInput
              placeholder="권한 이름 또는 설명으로 검색..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
            />

            {/* 전체 선택/해제 */}
            <Checkbox
              label={`검색된 권한 전체 선택/해제 (${filteredPermissions.length}개)`}
              checked={
                filteredPermissions.length > 0 &&
                filteredPermissions.every((p) => selectedPermissionNos.includes(p.permissionNo))
              }
              indeterminate={
                filteredPermissions.length > 0 &&
                filteredPermissions.some((p) => selectedPermissionNos.includes(p.permissionNo)) &&
                !filteredPermissions.every((p) => selectedPermissionNos.includes(p.permissionNo))
              }
              onChange={(event) => handleSelectAll(event.currentTarget.checked)}
            />

            {/* 권한 목록 */}
            <Stack gap="xs">
              {filteredPermissions.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center" py="md">
                  {searchTerm ? '검색 결과가 없습니다.' : '권한이 없습니다.'}
                </Text>
              ) : (
                filteredPermissions.map((permission) => (
                  <Checkbox
                    key={permission.permissionNo}
                    label={
                      <div>
                        <Text size="sm" fw={500}>
                          {permission.name}
                        </Text>
                        {permission.description && (
                          <Text size="xs" c="dimmed">
                            {permission.description}
                          </Text>
                        )}
                      </div>
                    }
                    checked={selectedPermissionNos.includes(permission.permissionNo)}
                    onChange={(event) => handlePermissionChange(permission.permissionNo, event.currentTarget.checked)}
                  />
                ))
              )}
            </Stack>

            {/* 버튼 */}
            <Grid>
              <Grid.Col span={{ base: 12, md: 'content' }}>
                <Button
                  type="button"
                  fullWidth
                  onClick={handleSubmit}
                  disabled={isLoading}
                  loading={isUpdatingPermissions}>
                  {isUpdatingPermissions ? '수정 중...' : '수정'}
                </Button>
              </Grid.Col>
            </Grid>
          </>
        )}
      </Stack>
    </div>
  );
}

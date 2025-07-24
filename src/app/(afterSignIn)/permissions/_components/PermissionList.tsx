'use client';

import { Permission } from '@/types/permission/permission';
import GenericList from '../../_components/GenericList';
import useFilteredPermissions from '../_hooks/useFilteredPermissions';
import PermissionCard from './PermissionCard';

interface PermissionListProps {
  name: string | null;
  page: number;
  pageSize: number;
}

export default function PermissionList({ name, page, pageSize }: PermissionListProps) {
  return (
    <GenericList<Permission, 'permissions', PermissionListProps>
      useQueryFn={useFilteredPermissions}
      hookParams={{ name, page, pageSize }}
      page={page}
      pageSize={pageSize}
      ItemCard={PermissionCard}
    />
  );
}

'use client';

import useFilteredManagers from '../_hooks/useFilteredManagers';
import GenericList from '@/app/(afterSignIn)/_components/GenericList';
import { Manager } from '@/types/manager';
import ManagerCard from './ManagerCard';

interface ManagerListProps {
  area: string;
  schoolNo: number;
  scode?: string;
  name?: string;
  signInId?: string;
  page: number;
  pageSize: number;
}

export default function ManagerList({
  area,
  schoolNo,
  scode = undefined,
  name,
  signInId,
  page,
  pageSize,
}: ManagerListProps) {
  return (
    <GenericList<Manager, 'managers', ManagerListProps>
      useQueryFn={useFilteredManagers}
      hookParams={{ area, schoolNo, scode, name, signInId, page, pageSize }}
      page={page}
      pageSize={pageSize}
      ItemCard={ManagerCard}
    />
  );
}

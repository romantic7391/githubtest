'use client';

import useFilteredSchools from '../_hooks/useFilteredSchools';
import SchoolCard from './SchoolCard';
import GenericList from '@/app/(afterSignIn)/_components/GenericList';
import { School } from '@/types/school';

interface SchoolListProps {
  sname: string | null;
  scode: string | null;
  page: number;
  pageSize: number;
}

export default function SchoolList({ sname, scode, page, pageSize }: SchoolListProps) {
  return (
    <GenericList<School, 'schools', SchoolListProps>
      useQueryFn={useFilteredSchools}
      hookParams={{ sname, scode, page, pageSize }}
      page={page}
      pageSize={pageSize}
      ItemCard={SchoolCard}
    />
  );
}

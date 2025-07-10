import { ChildSchoolInfo } from '@/types/school-finder/childschoolinfo';
import { Pagination } from '@/types/school-finder/common';
import { BaseResult, BaseResultItem, SchoolSearch } from '@/types/school-finder/school';
import { SchoolInfo } from '@/types/school-finder/schoolinfo';
import { getSchoolInfos } from './schoolinfo.service';
import { getPagination } from '@/lib/util/common.util';
import { getKindergartens } from './childschoolinfo.service';

export async function searchSchools({
  // areas = [],
  areaKos = [],
  stypes = [],
  snames = [],
  page = 1,
  pageSize = 10,
}: SchoolSearch) {
  try {
    const schoolInfos = (await getSchoolInfos({
      areaKos,
      stypes,
      snames,
      page: 1,
      pageSize: Number.MAX_SAFE_INTEGER,
    })) as { items: SchoolInfo[]; pagination: Pagination };

    const kindergartens = (await getKindergartens({
      areaKos,
      stypes,
      snames,
      page: 1,
      pageSize: Number.MAX_SAFE_INTEGER,
    })) as { items: ChildSchoolInfo[]; pagination: Pagination };

    const items = [...schoolInfos.items, ...kindergartens.items] satisfies BaseResultItem[];
    const { total, totalPage, startIndex, endIndex } = getPagination(items.length, page, pageSize);
    const pagedItems = items.slice(startIndex, endIndex);

    const result = {
      items: pagedItems,
      pagination: {
        total,
        totalPage: Math.max(totalPage, 1),
        page,
        pageSize,
      } satisfies Pagination,
    } satisfies BaseResult;

    return result;
  } catch (error) {
    throw error;
  }
}

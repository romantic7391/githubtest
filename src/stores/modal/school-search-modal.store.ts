import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import { SelectedSchool } from '@/types/school';
import { SchoolSearch } from '@/types/school-finder/school';
import { create } from 'zustand';

interface SchoolSearchModalState {
  /**
   * 모달 창 열기 여부
   */
  opened: boolean;
  /**
   * 학교 검색 쿼리. 학교 이름.
   */
  searchFilter: SchoolSearch;
  /**
   * 선택된 학교
   */
  selectedSchool: SelectedSchool;
}

interface SchoolSearchModalActions {
  open: () => void;
  close: () => void;
  setSearchFilter: (query: SchoolSearch) => void;
  setSelectedSchool: (school: SelectedSchool) => void;
}

const initialState: SchoolSearchModalState = {
  opened: false,
  searchFilter: {
    snames: [],
    stypes: [],
    areas: [],
    areaKos: [],
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  },
  selectedSchool: null,
};

export const useSchoolSearchModalStore = create<SchoolSearchModalState & SchoolSearchModalActions>()((set) => ({
  ...initialState,

  open: () =>
    set((state) => {
      return {
        ...state,
        opened: true,
      };
    }),

  close: () =>
    set((state) => {
      return {
        ...state,
        opened: false,
      };
    }),

  setSearchFilter: (query: SchoolSearch) =>
    set((state) => {
      return {
        ...state,
        searchFilter: query,
      };
    }),

  setSelectedSchool: (school: SelectedSchool) =>
    set((state) => {
      return {
        ...state,
        selectedSchool: school,
      };
    }),
}));

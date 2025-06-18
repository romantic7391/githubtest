import { SelectedSchool } from '@/types/school';
import { create } from 'zustand';

interface SchoolSearchModalState {
  opened: boolean;
  selectedSchool: SelectedSchool;
}

interface SchoolSearchModalActions {
  open: () => void;
  close: () => void;
  setSelectedSchool: (school: SelectedSchool) => void;
}

const initialState: SchoolSearchModalState = {
  opened: false,
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

  setSelectedSchool: (school: SelectedSchool) =>
    set((state) => {
      return {
        ...state,
        selectedSchool: school,
      };
    }),
}));

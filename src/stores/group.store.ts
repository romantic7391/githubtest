import type { Group } from '@/types/permission/group';
import { create } from 'zustand';

interface GroupState {
  selectedGroup: Group | null;
}

interface GroupAction {
  setSelectedGroup: (group: Group | null) => void;
}

const initialState: GroupState = {
  selectedGroup: null,
};

export const useGroupStore = create<GroupState & GroupAction>((set) => ({
  ...initialState,

  setSelectedGroup: (group) =>
    set((state) => {
      return {
        ...state,
        selectedGroup: group,
      };
    }),
}));

import { create } from 'zustand';

// Global state container for sharing data between tabs.
export const useAppState = create((set) => ({
  selectedReaction: null,
  setSelectedReaction: (reaction) => set({ selectedReaction: reaction }),
  
  activeRunId: null,
  setActiveRunId: (id) => set({ activeRunId: id }),
}));

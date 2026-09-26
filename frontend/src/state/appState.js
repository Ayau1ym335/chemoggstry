import { create } from 'zustand';

// Global state container for sharing data between tabs.
// This will be expanded in future tasks (e.g., TASK 22) to hold shared selected reactions.
export const useAppState = create((set) => ({
  selectedReaction: null,
  setSelectedReaction: (reaction) => set({ selectedReaction: reaction }),
}));

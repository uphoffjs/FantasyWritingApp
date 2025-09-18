import { StateCreator } from 'zustand';

export interface UISlice {
  // State
  searchHistory: string[];
  uiLoading: boolean;
  uiError: string | null;
  
  // * Search history actions
  addSearchQuery: (query: string) => void;
  clearSearchHistory: () => void;
  
  // UI state actions
  setUILoading: (loading: boolean) => void;
  setUIError: (error: string | null) => void;
  clearUIError: () => void;
}

export const createUISlice: StateCreator<
  UISlice,
  [],
  [],
  UISlice
> = (set) => ({
  // State
  searchHistory: [],
  uiLoading: false,
  uiError: null,

  // * Search history actions
  addSearchQuery: (query) => {
    if (!query.trim()) return;
    
    set((state) => {
      const history = [...state.searchHistory];
      
      // * Remove the query if it already exists
      const existingIndex = history.indexOf(query);
      if (existingIndex > -1) {
        history.splice(existingIndex, 1);
      }
      
      // * Add to the beginning
      history.unshift(query);
      
      // * Keep only the last 10 searches
      if (history.length > 10) {
        history.pop();
      }
      
      return { searchHistory: history };
    });
  },

  clearSearchHistory: () => {
    set({ searchHistory: [] });
  },

  // UI state actions
  setUILoading: (loading) => {
    set({ uiLoading: loading });
  },

  setUIError: (error) => {
    set({ uiError: error });
  },

  clearUIError: () => {
    set({ uiError: null });
  }
});
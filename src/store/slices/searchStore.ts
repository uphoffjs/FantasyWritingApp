import { StateCreator } from 'zustand';
import { WorldElement, ElementCategory } from '../../types/worldbuilding';
import { searchCache } from '../../utils/cache';
import { searchService } from '../../services/searchService';
import { ProjectSlice } from './projectStore';
import { UISlice } from './uiStore';

export interface SearchSlice {
  // * Search actions
  searchElements: (query: string) => WorldElement[];
  searchElementsInProject: (projectId: string, query: string) => WorldElement[];
  searchElementsByCategory: (category: ElementCategory, query: string) => WorldElement[];
  getSearchSuggestions: (query: string) => string[];
  clearSearchCache: () => void;
}

// * Create a combined interface for slices that depend on each other
interface SearchStoreWithDeps extends SearchSlice, ProjectSlice, UISlice {}

export const createSearchSlice: StateCreator<
  SearchStoreWithDeps,
  [],
  [],
  SearchSlice
> = (_set, get) => ({
  // * Search actions
  searchElements: (query) => {
    // ! PERFORMANCE: * Check cache first
    const cached = searchCache.get(query);
    if (cached) {
      return cached as WorldElement[];
    }

    // ! PERFORMANCE: Use Fuse.js search service for better performance and fuzzy matching
    const results = searchService.search(query, {
      limit: 100,
      threshold: 0.4
    }) as WorldElement[];

    // ! PERFORMANCE: * Cache the results
    searchCache.set(query, results);
    
    // * Add to search history if results found
    if (results.length > 0 && query.trim()) {
      get().addSearchQuery(query.trim());
    }
    
    return results;
  },

  searchElementsInProject: (projectId, query) => {
    // ! PERFORMANCE: * Cache key includes projectId for project-specific caching
    const cacheKey = `${projectId}:${query}`;
    const cached = searchCache.get(cacheKey);
    if (cached) {
      return cached as WorldElement[];
    }

    const results = searchService.searchInProject(projectId, query, {
      limit: 50,
      threshold: 0.4
    }) as WorldElement[];

    searchCache.set(cacheKey, results);
    return results;
  },

  searchElementsByCategory: (category, query) => {
    // ! PERFORMANCE: * Cache key includes category for category-specific caching
    const cacheKey = `cat:${category}:${query}`;
    const cached = searchCache.get(cacheKey);
    if (cached) {
      return cached as WorldElement[];
    }

    const results = searchService.searchByCategory(category, query, {
      limit: 50,
      threshold: 0.4
    }) as WorldElement[];

    searchCache.set(cacheKey, results);
    return results;
  },

  getSearchSuggestions: (query) => {
    if (query.length < 2) return [];
    
    return searchService.getSuggestions(query, 10);
  },

  clearSearchCache: () => {
    searchCache.clear();
  }
});
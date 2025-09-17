import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import { WorldElement, Project } from '../types/models';
import { useWorldbuildingStore } from '../store/worldbuildingStore';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchElements: (elements: WorldElement[], query?: string) => WorldElement[];
  searchProjects: (projects: Project[], query?: string) => Project[];
  searchAll: () => {
    elements: WorldElement[];
    projects: Project[];
  };
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}

interface SearchProviderProps {
  children: React.ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { projects } = useWorldbuildingStore();

  // Configure Fuse.js for elements
  const elementFuseOptions: Fuse.IFuseOptions<WorldElement> = {
    keys: [
      { name: 'name', weight: 0.4 },
      { name: 'description', weight: 0.3 },
      { name: 'tags', weight: 0.2 },
      { name: 'category', weight: 0.1 },
    ],
    threshold: 0.3,
    includeScore: true,
    shouldSort: true,
    minMatchCharLength: 2,
    findAllMatches: true,
    ignoreLocation: true,
  };

  // Configure Fuse.js for projects
  const projectFuseOptions: Fuse.IFuseOptions<Project> = {
    keys: [
      { name: 'name', weight: 0.4 },
      { name: 'description', weight: 0.3 },
      { name: 'tags', weight: 0.2 },
      { name: 'status', weight: 0.1 },
    ],
    threshold: 0.3,
    includeScore: true,
    shouldSort: true,
    minMatchCharLength: 2,
    findAllMatches: true,
    ignoreLocation: true,
  };

  // Search elements
  const searchElements = useCallback(
    (elements: WorldElement[], query?: string) => {
      const searchTerm = query || searchQuery;
      
      if (!searchTerm || searchTerm.trim() === '') {
        return elements;
      }

      const fuse = new Fuse(elements, elementFuseOptions);
      const results = fuse.search(searchTerm);
      return results.map(result => result.item);
    },
    [searchQuery, elementFuseOptions]
  );

  // Search projects
  const searchProjects = useCallback(
    (projects: Project[], query?: string) => {
      const searchTerm = query || searchQuery;
      
      if (!searchTerm || searchTerm.trim() === '') {
        return projects;
      }

      const fuse = new Fuse(projects, projectFuseOptions);
      const results = fuse.search(searchTerm);
      return results.map(result => result.item);
    },
    [searchQuery, projectFuseOptions]
  );

  // Search all (elements and projects)
  const searchAll = useCallback(() => {
    const allElements: WorldElement[] = [];
    const allProjects: Project[] = [];

    projects.forEach(project => {
      allProjects.push(project);
      if (project.elements) {
        allElements.push(...project.elements);
      }
    });

    return {
      elements: searchElements(allElements),
      projects: searchProjects(allProjects),
    };
  }, [projects, searchElements, searchProjects]);

  const value = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      searchElements,
      searchProjects,
      searchAll,
    }),
    [searchQuery, searchElements, searchProjects, searchAll]
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}
import React, { ReactNode, createContext, useContext, useState, useCallback, useEffect } from 'react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { mockProject, mockElements } from './test-data';
import type { Project, WorldElement } from '../../../src/types/worldbuilding';

// Mock the useWorldbuildingStore directly
const mockStoreData: any = {};

// Mock store context
const MockStoreContext = createContext<any>(null);

// Mock Zustand store for testing
interface MockStoreProviderProps {
  children: ReactNode;
  initialState?: any;
}

// Mock store provider that actually provides store functionality
export const MockStoreProvider: React.FC<MockStoreProviderProps> = ({ 
  children, 
  initialState = {} 
}) => {
  // Set up default state
  const defaultState = {
    projects: [mockProject],
    currentProjectId: mockProject.id,
    elements: mockElements,
    ...initialState
  };

  const [projects] = useState<Project[]>(defaultState.projects);
  const [currentProjectId] = useState<string | null>(defaultState.currentProjectId || defaultState.currentProject);
  const [elements] = useState<WorldElement[]>(defaultState.elements);

  const getCurrentProject = useCallback(() => {
    return projects.find(p => p.id === currentProjectId);
  }, [projects, currentProjectId]);

  // Create mock store value
  const storeValue = {
    projects,
    currentProjectId,
    elements,
    getCurrentProject,
    // Add other methods as needed
    setCurrentProject: (id: string) => {},
    addElement: (element: WorldElement) => {},
    updateElement: (id: string, updates: Partial<WorldElement>) => {},
    deleteElement: (id: string) => {}
  };

  return (
    <MockStoreContext.Provider value={storeValue}>
      {children}
    </MockStoreContext.Provider>
  );
};

// Export hook for components to use
export const useMockStore = () => {
  const context = useContext(MockStoreContext);
  if (!context) {
    // Return a default value if not in provider
    return {
      projects: [],
      currentProjectId: null,
      elements: [],
      getCurrentProject: () => undefined
    };
  }
  return context;
};

// Mount helper with all necessary providers
export const mountWithProviders = (
  component: ReactNode, 
  options?: { 
    initialState?: any;
    routerProps?: any;
  }
) => {
  const { initialState = {}, routerProps = {} } = options || {};
  
  // Use MemoryRouter for tests as it supports initialEntries
  // Default to root path if no initialEntries provided
  const routerConfig = {
    initialEntries: ['/'],
    ...routerProps
  };

  return cy.mount(
    <MemoryRouter {...routerConfig}>
      <MockStoreProvider initialState={initialState}>
        {component}
      </MockStoreProvider>
    </MemoryRouter>
  );
};

// Mount helper for components that don't need routing
export const mountWithStore = (
  component: ReactNode,
  initialState?: any
) => {
  return cy.mount(
    <MockStoreProvider initialState={initialState}>
      {component}
    </MockStoreProvider>
  );
};

// Simple mount without any providers
export const mountSimple = (component: ReactNode) => {
  return cy.mount(component);
};
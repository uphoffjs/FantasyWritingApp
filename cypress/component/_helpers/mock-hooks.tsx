import React, { ReactNode } from 'react';
import * as useAsyncStoreModule from '../../../src/hooks/useAsyncStore';

// * Create a context for mocking hooks
export interface MockHooksConfig {
  useProjectOperations?: Partial<ReturnType<typeof useAsyncStoreModule.useProjectOperations>>;
  useElementOperations?: Partial<ReturnType<typeof useAsyncStoreModule.useElementOperations>>;
}

// * Default mock values
const defaultProjectOperations: ReturnType<typeof useAsyncStoreModule.useProjectOperations> = {
  isCreatingProject: false,
  isUpdatingProject: false,
  isDeletingProject: false,
  isDuplicatingProject: false,
  isExportingProject: false,
  isImportingProject: false,
  isAnyProjectOperationLoading: false,
  createProjectError: null,
  updateProjectError: null,
  deleteProjectError: null,
  duplicateProjectError: null,
  exportProjectError: null,
  importProjectError: null,
  createProject: cy.stub().resolves({ id: 'mock-id', name: 'Mock Project' }),
  updateProject: cy.stub().resolves(),
  deleteProject: cy.stub().resolves(),
  duplicateProject: cy.stub().resolves({ id: 'duplicate-id', name: 'Duplicate Project' }),
  exportProject: cy.stub().resolves('export-data'),
  importProject: cy.stub().resolves({ id: 'imported-id', name: 'Imported Project' }),
  clearProjectErrors: cy.stub(),
};

const defaultElementOperations: ReturnType<typeof useAsyncStoreModule.useElementOperations> = {
  isCreatingElement: false,
  isUpdatingElement: false,
  isDeletingElement: false,
  isAnyElementOperationLoading: false,
  createElementError: null,
  updateElementError: null,
  deleteElementError: null,
  createElement: cy.stub().resolves({ id: 'mock-element-id', name: 'Mock Element' }),
  updateElement: cy.stub().resolves(),
  deleteElement: cy.stub().resolves(),
  quickCreateElement: cy.stub().resolves({ id: 'quick-element-id', name: 'Quick Element' }),
  addQuestion: cy.stub().resolves(),
  updateAnswer: cy.stub().resolves(),
  clearElementErrors: cy.stub(),
};

// * Mock provider component
export interface MockHooksProviderProps {
  children: ReactNode;
  mocks?: MockHooksConfig;
}

export const MockHooksProvider: React.FC<MockHooksProviderProps> = ({ children, mocks = {} }) => {
  // * Apply mocks
  if (mocks.useProjectOperations) {
    cy.stub(useAsyncStoreModule, 'useProjectOperations').returns({
      ...defaultProjectOperations,
      ...mocks.useProjectOperations,
    });
  }

  if (mocks.useElementOperations) {
    cy.stub(useAsyncStoreModule, 'useElementOperations').returns({
      ...defaultElementOperations,
      ...mocks.useElementOperations,
    });
  }

  return <>{children}</>;
};

// * Helper function to mount with mocked hooks
export const mountWithMockedHooks = (
  component: ReactNode,
  mocks?: MockHooksConfig
) => {
  // * Import the module fresh for each test
  return cy.window().then((win) => {
    // * Store original functions
    const originalUseProjectOperations = useAsyncStoreModule.useProjectOperations;
    const originalUseElementOperations = useAsyncStoreModule.useElementOperations;

    // * Apply mocks
    if (mocks?.useProjectOperations) {
      (useAsyncStoreModule as any).useProjectOperations = () => ({
        ...defaultProjectOperations,
        ...mocks.useProjectOperations,
      });
    }

    if (mocks?.useElementOperations) {
      (useAsyncStoreModule as any).useElementOperations = () => ({
        ...defaultElementOperations,
        ...mocks.useElementOperations,
      });
    }

    // * Mount component
    cy.mount(component);

    // * Cleanup after test
    after(() => {
      (useAsyncStoreModule as any).useProjectOperations = originalUseProjectOperations;
      (useAsyncStoreModule as any).useElementOperations = originalUseElementOperations;
    });
  });
};

// * Utility to create custom project operations mock
export const createProjectOperationsMock = (overrides: Partial<ReturnType<typeof useAsyncStoreModule.useProjectOperations>>) => {
  return {
    ...defaultProjectOperations,
    ...overrides,
  };
};

// * Utility to create custom element operations mock
export const createElementOperationsMock = (overrides: Partial<ReturnType<typeof useAsyncStoreModule.useElementOperations>>) => {
  return {
    ...defaultElementOperations,
    ...overrides,
  };
};
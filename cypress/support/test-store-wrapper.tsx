/**
 * Test wrapper for components that use Zustand stores
 * Provides a way to inject mock store values during testing
 */

import React, { ReactNode } from 'react';

// * Mock store context for testing
interface MockStoreProviderProps {
  children: ReactNode;
  mockStores?: {
    worldbuilding?: any;
    auth?: any;
  };
}

// * Store references that can be overridden in tests
export const mockStores = {
  worldbuilding: null as any,
  auth: null as any,
};

export const MockStoreProvider: React.FC<MockStoreProviderProps> = ({
  children,
  mockStores: providedMocks
}) => {
  // * Apply provided mocks to global mockStores object
  if (providedMocks) {
    Object.assign(mockStores, providedMocks);
  }

  return <>{children}</>;
};

// * Helper function to create a mock Zustand store
export function createMockStore(initialState: any) {
  const state = { ...initialState };
  const listeners = new Set<Function>();

  const setState = (partial: any) => {
    Object.assign(state, typeof partial === 'function' ? partial(state) : partial);
    listeners.forEach(listener => listener(state));
  };

  const getState = () => state;

  const subscribe = (listener: Function) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const store = () => state;
  store.getState = getState;
  store.setState = setState;
  store.subscribe = subscribe;

  return store;
}
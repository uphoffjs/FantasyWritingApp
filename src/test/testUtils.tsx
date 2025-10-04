// * Test utilities for React Native Testing Library
// * Provides helpers for rendering components with context providers

import React, { ReactElement, ReactNode } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// * Custom render function with all providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: any;
  navigationState?: any;
}

/**
 * * Renders a component with all necessary providers
 * @param component Component to render
 * @param options Render options including initial state
 */
export function renderWithProviders(
  component: ReactElement,
  options?: CustomRenderOptions
) {
  const { initialState, navigationState, ...renderOptions } = options || {};

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 375, height: 812 },
          insets: { top: 44, left: 0, right: 0, bottom: 34 },
        }}
      >
        <NavigationContainer initialState={navigationState}>
          {children}
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }

  return rtlRender(component, { wrapper: Wrapper, ...renderOptions });
}

/**
 * * Renders a component with navigation context only
 * @param component Component to render
 * @param navigationState Initial navigation state
 */
export function renderWithNavigation(
  component: ReactElement,
  navigationState?: any
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NavigationContainer initialState={navigationState}>
        {children}
      </NavigationContainer>
    );
  }

  return rtlRender(component, { wrapper: Wrapper });
}

/**
 * * Creates a mock navigation prop for testing screens
 */
export const createMockNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
  replace: jest.fn(),
  reset: jest.fn(),
  setOptions: jest.fn(),
  setParams: jest.fn(),
  addListener: jest.fn(() => ({ remove: jest.fn() })),
  removeListener: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => false),
  getParent: jest.fn(),
  getState: jest.fn(),
  dispatch: jest.fn(),
});

/**
 * * Creates a mock route prop for testing screens
 */
export const createMockRoute = (name: string, params: any = {}) => ({
  key: `${name}-key`,
  name,
  params,
  path: undefined,
});

// * Mock data factories
export const mockCharacter = {
  id: '1',
  name: 'Test Character',
  description: 'A test character for unit tests',
  traits: ['brave', 'intelligent'],
  backstory: 'Test backstory',
  goals: ['Test goal'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockStory = {
  id: '1',
  title: 'Test Story',
  description: 'A test story for unit tests',
  genre: 'Fantasy',
  status: 'draft' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockScene = {
  id: '1',
  storyId: '1',
  title: 'Test Scene',
  content: 'Test scene content',
  order: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockProject = {
  id: '1',
  name: 'Test Project',
  description: 'A test project for unit tests',
  type: 'novel' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// * Async utilities
export const waitForAsync = (ms: number = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// * Platform utilities for testing
export const setPlatform = (os: 'ios' | 'android' | 'web') => {
  const Platform = require('react-native').Platform;
  Platform.OS = os;
  Platform.select = jest.fn((obj) => obj[os] || obj.default);
};

export const setDimensions = (width: number, height: number) => {
  const Dimensions = require('react-native').Dimensions;
  Dimensions.get = jest.fn((dimension) => {
    if (dimension === 'window' || dimension === 'screen') {
      return { width, height, scale: 2, fontScale: 1 };
    }
    return { width: 0, height: 0, scale: 0, fontScale: 0 };
  });
};

// * Re-export all from @testing-library/react-native for convenience
export * from '@testing-library/react-native';
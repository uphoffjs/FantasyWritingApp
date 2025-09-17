// Test providers for wrapping components during testing

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as StoreProvider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Import your app's reducers/store configuration
// Note: You'll need to update these imports based on your actual store setup
// import rootReducer from '../../src/store/rootReducer';

// Create a mock store for testing
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      // Add your reducers here
      // Example:
      // auth: authReducer,
      // stories: storiesReducer,
      // characters: charactersReducer,
    },
    preloadedState: initialState,
  });
};

// Error boundary for catching and reporting errors in tests
class TestErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Test Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div data-cy="error-boundary-message">
          <h2>Something went wrong in the test.</h2>
          <p>Check the console for error details.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Test providers wrapper component
interface TestProvidersProps {
  children: React.ReactNode;
  initialState?: any;
  navigationOptions?: any;
}

export const TestProviders: React.FC<TestProvidersProps> = ({
  children,
  initialState = {},
  navigationOptions = {},
}) => {
  const store = createMockStore(initialState);

  return (
    <TestErrorBoundary>
      <StoreProvider store={store}>
        <NavigationContainer {...navigationOptions}>
          {children}
        </NavigationContainer>
      </StoreProvider>
    </TestErrorBoundary>
  );
};

// Mock navigation for isolated component testing
export const MockNavigation = {
  navigate: cy.stub().as('navigate'),
  goBack: cy.stub().as('goBack'),
  push: cy.stub().as('push'),
  pop: cy.stub().as('pop'),
  reset: cy.stub().as('reset'),
  setOptions: cy.stub().as('setOptions'),
  addListener: cy.stub().returns(() => {}),
  removeListener: cy.stub(),
  isFocused: cy.stub().returns(true),
};

// Mock route for isolated component testing
export const MockRoute = {
  key: 'test-route',
  name: 'TestScreen',
  params: {},
};

// Utility to wrap a component with minimal providers
export const wrapWithProviders = (
  Component: React.ComponentType<any>,
  props = {},
  options = {}
) => {
  return (
    <TestProviders {...options}>
      <Component {...props} />
    </TestProviders>
  );
};
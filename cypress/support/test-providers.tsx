// * Test providers for wrapping components during testing

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

// * Since this app uses Zustand instead of Redux, we don't need Redux providers
// * Zustand stores work independently without a provider wrapper

// * Error boundary for catching and reporting errors in tests
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

// * Test providers wrapper component
interface TestProvidersProps {
  children: React.ReactNode;
  navigationOptions?: any;
}

export const TestProviders: React.FC<TestProvidersProps> = ({
  children,
  navigationOptions = {},
}) => {
  return (
    <TestErrorBoundary>
      <NavigationContainer {...navigationOptions}>
        {children}
      </NavigationContainer>
    </TestErrorBoundary>
  );
};

// * Mock navigation factory for isolated component testing
// * Call this function inside tests to create mocked navigation
export const createMockNavigation = () => ({
  navigate: cy.stub().as('navigate'),
  goBack: cy.stub().as('goBack'),
  push: cy.stub().as('push'),
  pop: cy.stub().as('pop'),
  reset: cy.stub().as('reset'),
  setOptions: cy.stub().as('setOptions'),
  addListener: cy.stub().returns(() => {}),
  removeListener: cy.stub(),
  isFocused: cy.stub().returns(true),
});

// * Mock route for isolated component testing
export const MockRoute = {
  key: 'test-route',
  name: 'TestScreen',
  params: {},
};

// * Utility to wrap a component with minimal providers
export const wrapWithProviders = (
  Component: React.ComponentType<any>,
  props = {},
  navigationOptions = {}
) => {
  return (
    <TestProviders navigationOptions={navigationOptions}>
      <Component {...props} />
    </TestProviders>
  );
};
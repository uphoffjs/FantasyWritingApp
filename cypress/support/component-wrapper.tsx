/**
 * @fileoverview Component Test Wrapper for Cypress Component Tests
 * Provides consistent test setup with state management, navigation, and error boundaries
 *
 * Purpose:
 * - Wraps components with necessary providers for testing
 * - Allows Zustand store initialization with test data
 * - Provides navigation context for React Navigation
 * - Includes error boundary for test debugging
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useWorldbuildingStore } from '../../src/store/rootStore';
import { useAuthStore } from '../../src/store/authStore';
import { useToastStore } from '../../src/store/toastStore';
import { useNotificationStore } from '../../src/store/notificationStore';

// * Error boundary for catching and reporting errors in tests
class TestErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ Test Error Boundary caught:', error, errorInfo);
    // * Log to Cypress console for debugging
    if (window.Cypress) {
      window.Cypress.log({
        name: 'Test Error',
        message: error.message,
        consoleProps: () => ({
          error,
          errorInfo,
        }),
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer} testID="error-boundary-message">
          <View style={styles.errorContent}>
            {/* Using View/Text components for React Native compatibility */}
            <View testID="error-title">Test Error Occurred</View>
            <View testID="error-message">{this.state.error?.message}</View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

// * Initialize store with test data
export const initializeStoresForTest = (initialState?: {
  worldbuilding?: Partial<any>;
  auth?: Partial<any>;
  toast?: Partial<any>;
  notification?: Partial<any>;
}) => {
  // * Reset all stores to initial state
  if (initialState?.worldbuilding) {
    const store = useWorldbuildingStore.getState();
    // * Clear existing data
    if (store.clearAllProjects) store.clearAllProjects();

    // * Set test data
    const { projects, elements, relationships, activeProjectId } = initialState.worldbuilding;

    if (projects) {
      projects.forEach((project: any) => {
        store.createProject(project.name);
      });
    }

    if (activeProjectId) {
      store.setActiveProject(activeProjectId);
    }

    if (elements && activeProjectId) {
      elements.forEach((element: any) => {
        store.createElement(activeProjectId, element.name, element.category, element.templateId);
      });
    }

    if (relationships && activeProjectId) {
      relationships.forEach((rel: any) => {
        store.createRelationship(
          activeProjectId,
          rel.sourceId,
          rel.targetId,
          rel.type,
          rel.description
        );
      });
    }
  }

  // * Initialize auth store if needed
  if (initialState?.auth) {
    const authStore = useAuthStore.getState();
    Object.assign(authStore, initialState.auth);
  }

  // * Initialize toast store if needed
  if (initialState?.toast) {
    const toastStore = useToastStore.getState();
    Object.assign(toastStore, initialState.toast);
  }

  // * Initialize notification store if needed
  if (initialState?.notification) {
    const notificationStore = useNotificationStore.getState();
    Object.assign(notificationStore, initialState.notification);
  }
};

// * Main test wrapper component
interface TestWrapperProps {
  children: React.ReactNode;
  initialState?: {
    worldbuilding?: Partial<any>;
    auth?: Partial<any>;
    toast?: Partial<any>;
    notification?: Partial<any>;
  };
  navigationOptions?: any;
}

export const TestWrapper: React.FC<TestWrapperProps> = ({
  children,
  initialState = {},
  navigationOptions = {},
}) => {
  // * Initialize stores on mount
  React.useEffect(() => {
    initializeStoresForTest(initialState);
  }, []);

  return (
    <TestErrorBoundary>
      <NavigationContainer {...navigationOptions}>
        <View style={styles.container} testID="test-wrapper">
          {children}
        </View>
      </NavigationContainer>
    </TestErrorBoundary>
  );
};

// * Utility function to wrap components for testing
export const wrapWithTestWrapper = (
  Component: React.ComponentType<any>,
  props = {},
  initialState = {},
  navigationOptions = {}
) => {
  return (
    <TestWrapper
      initialState={initialState}
      navigationOptions={navigationOptions}
    >
      <Component {...props} />
    </TestWrapper>
  );
};

// * Mock navigation factory for isolated component testing
export const createMockNavigation = () => ({
  navigate: cy.stub().as('navigate'),
  goBack: cy.stub().as('goBack'),
  push: cy.stub().as('push'),
  pop: cy.stub().as('pop'),
  reset: cy.stub().as('reset'),
  setOptions: cy.stub().as('setOptions'),
  setParams: cy.stub().as('setParams'),
  dispatch: cy.stub().as('dispatch'),
  addListener: cy.stub().returns(() => {}),
  removeListener: cy.stub(),
  isFocused: cy.stub().returns(true),
  canGoBack: cy.stub().returns(true),
  getParent: cy.stub().returns(null),
  getState: cy.stub().returns({
    routes: [],
    index: 0,
  }),
});

// * Mock route for isolated component testing
export const createMockRoute = (name: string = 'TestScreen', params: any = {}) => ({
  key: `${name}-${Date.now()}`,
  name,
  params,
});

// * Styles for the wrapper components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e', // * Dark theme background
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 20,
  },
  errorContent: {
    backgroundColor: '#ff4444',
    padding: 20,
    borderRadius: 8,
    maxWidth: 400,
  },
});

// * Export default for easy imports
export default TestWrapper;
/**
 * Navigation Integration Tests
 * Tests for navigation with store state, deep linking, and navigation guards
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, TouchableOpacity } from 'react-native';
import { useWorldbuildingStore } from '../../src/store/worldbuildingStore';
import { useAuthStore } from '../../src/store/authStore';
import { renderWithNavigation, mockNavigation } from '../../src/test/testUtils';

// * Mock screens for testing
const HomeScreen = ({ navigation }: any) => (
  <View testID="home-screen">
    <Text>Home Screen</Text>
    <TouchableOpacity
      testID="go-to-project"
      onPress={() => navigation.navigate('Project', { projectId: 'test-project' })}
    >
      <Text>Go to Project</Text>
    </TouchableOpacity>
  </View>
);

const ProjectScreen = ({ route, navigation }: any) => (
  <View testID="project-screen">
    <Text>Project: {route.params?.projectId}</Text>
    <TouchableOpacity
      testID="go-to-element"
      onPress={() => navigation.navigate('Element', {
        projectId: route.params?.projectId,
        elementId: 'test-element'
      })}
    >
      <Text>Go to Element</Text>
    </TouchableOpacity>
  </View>
);

const ElementScreen = ({ route }: any) => (
  <View testID="element-screen">
    <Text>Element: {route.params?.elementId}</Text>
  </View>
);

const LoginScreen = ({ navigation }: any) => {
  const signIn = useAuthStore(state => state.signIn);

  const handleLogin = async () => {
    await signIn('test@example.com', 'password');
    navigation.navigate('Home');
  };

  return (
    <View testID="login-screen">
      <Text>Login Screen</Text>
      <TouchableOpacity testID="login-button" onPress={handleLogin}>
        <Text>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

// * Navigation guard component
const AuthGuard = ({ children, navigation }: any) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
    }
  }, [isAuthenticated, navigation]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

// * Create test navigation stack
const Stack = createNativeStackNavigator();

const TestNavigator = () => (
  <Stack.Navigator initialRouteName="Home">
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Project" component={ProjectScreen} />
    <Stack.Screen name="Element" component={ElementScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

describe('Navigation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // * Reset stores
    useWorldbuildingStore.setState({
      projects: [],
      currentProjectId: null,
      currentElementId: null,
      searchHistory: []
    });
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  });

  describe('Basic Navigation', () => {
    it('navigates between screens', async () => {
      const { getByTestId } = render(
        <NavigationContainer>
          <TestNavigator />
        </NavigationContainer>
      );

      // * Start at home
      expect(getByTestId('home-screen')).toBeTruthy();

      // * Navigate to project
      fireEvent.press(getByTestId('go-to-project'));

      await waitFor(() => {
        expect(getByTestId('project-screen')).toBeTruthy();
      });
    });

    it('passes parameters between screens', async () => {
      const { getByTestId, getByText } = render(
        <NavigationContainer>
          <TestNavigator />
        </NavigationContainer>
      );

      // * Navigate to project with params
      fireEvent.press(getByTestId('go-to-project'));

      await waitFor(() => {
        expect(getByText('Project: test-project')).toBeTruthy();
      });

      // * Navigate to element with nested params
      fireEvent.press(getByTestId('go-to-element'));

      await waitFor(() => {
        expect(getByText('Element: test-element')).toBeTruthy();
      });
    });
  });

  describe('Navigation with Store State', () => {
    it('navigates to current project from store', async () => {
      // * Set up store with a project
      const store = useWorldbuildingStore.getState();
      act(() => {
        const project = store.createProject('Test Project', 'Description');
        store.setCurrentProject(project.id);
      });

      const NavigationWithStore = () => {
        const currentProjectId = useWorldbuildingStore(state => state.currentProjectId);
        const navigation = mockNavigation;

        React.useEffect(() => {
          if (currentProjectId) {
            navigation.navigate('Project', { projectId: currentProjectId });
          }
        }, [currentProjectId, navigation]);

        return (
          <View testID="navigation-test">
            <Text>Project ID: {currentProjectId}</Text>
          </View>
        );
      };

      const { getByText } = render(<NavigationWithStore />);

      await waitFor(() => {
        expect(getByText(/Project ID:/)).toBeTruthy();
      });
    });

    it('updates store when navigating', async () => {
      const NavigationUpdater = ({ navigation }: any) => {
        const setCurrentProject = useWorldbuildingStore(state => state.setCurrentProject);

        const navigateToProject = (projectId: string) => {
          setCurrentProject(projectId);
          navigation.navigate('Project', { projectId });
        };

        return (
          <View>
            <TouchableOpacity
              testID="navigate-button"
              onPress={() => navigateToProject('project-123')}
            >
              <Text>Navigate</Text>
            </TouchableOpacity>
          </View>
        );
      };

      const { getByTestId } = renderWithNavigation(
        <NavigationUpdater navigation={mockNavigation} />
      );

      fireEvent.press(getByTestId('navigate-button'));

      await waitFor(() => {
        const state = useWorldbuildingStore.getState();
        expect(state.currentProjectId).toBe('project-123');
      });
    });
  });

  describe('Deep Linking', () => {
    it('handles deep link to project', async () => {
      const deepLinkUrl = 'myapp://project/project-123';

      // * Simulate deep link handling
      const DeepLinkHandler = ({ url }: { url: string }) => {
        const navigation = mockNavigation;

        React.useEffect(() => {
          if (url.includes('project/')) {
            const projectId = url.split('project/')[1];
            navigation.navigate('Project', { projectId });
          }
        }, [url, navigation]);

        return <View testID="deep-link-handler" />;
      };

      const { getByTestId } = renderWithNavigation(
        <DeepLinkHandler url={deepLinkUrl} />
      );

      expect(getByTestId('deep-link-handler')).toBeTruthy();
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Project', {
        projectId: 'project-123'
      });
    });

    it('handles deep link to element with parameters', async () => {
      const deepLinkUrl = 'myapp://element/project-123/element-456';

      const DeepLinkHandler = ({ url }: { url: string }) => {
        const navigation = mockNavigation;

        React.useEffect(() => {
          if (url.includes('element/')) {
            const parts = url.split('/');
            const projectId = parts[parts.length - 2];
            const elementId = parts[parts.length - 1];
            navigation.navigate('Element', { projectId, elementId });
          }
        }, [url, navigation]);

        return <View testID="deep-link-handler" />;
      };

      renderWithNavigation(<DeepLinkHandler url={deepLinkUrl} />);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Element', {
        projectId: 'project-123',
        elementId: 'element-456'
      });
    });

    it('validates deep link parameters', async () => {
      const invalidUrl = 'myapp://invalid/path';

      const DeepLinkHandler = ({ url }: { url: string }) => {
        const navigation = mockNavigation;
        const [error, setError] = React.useState<string | null>(null);

        React.useEffect(() => {
          try {
            if (!url.includes('project/') && !url.includes('element/')) {
              setError('Invalid deep link');
            }
          } catch (e) {
            setError('Deep link error');
          }
        }, [url]);

        return (
          <View testID="deep-link-handler">
            {error && <Text testID="error-text">{error}</Text>}
          </View>
        );
      };

      const { getByTestId } = renderWithNavigation(
        <DeepLinkHandler url={invalidUrl} />
      );

      await waitFor(() => {
        expect(getByTestId('error-text')).toBeTruthy();
      });
    });
  });

  describe('Navigation Guards', () => {
    it('redirects to login when not authenticated', async () => {
      const GuardedScreen = ({ navigation }: any) => (
        <AuthGuard navigation={navigation}>
          <View testID="guarded-content">
            <Text>Protected Content</Text>
          </View>
        </AuthGuard>
      );

      const GuardedNavigator = () => (
        <Stack.Navigator>
          <Stack.Screen name="Guarded" component={GuardedScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      );

      const { getByTestId } = render(
        <NavigationContainer>
          <GuardedNavigator />
        </NavigationContainer>
      );

      // * Should redirect to login
      await waitFor(() => {
        expect(getByTestId('login-screen')).toBeTruthy();
      });
    });

    it('allows access when authenticated', async () => {
      // * Set authenticated state
      act(() => {
        useAuthStore.setState({
          user: { id: '1', email: 'test@example.com' },
          isAuthenticated: true
        });
      });

      const GuardedScreen = ({ navigation }: any) => (
        <AuthGuard navigation={navigation}>
          <View testID="guarded-content">
            <Text>Protected Content</Text>
          </View>
        </AuthGuard>
      );

      const { getByTestId } = renderWithNavigation(
        <GuardedScreen navigation={mockNavigation} />
      );

      expect(getByTestId('guarded-content')).toBeTruthy();
    });

    it('guards specific routes based on permissions', async () => {
      const PermissionGuard = ({ children, permission, navigation }: any) => {
        const user = useAuthStore(state => state.user);
        const hasPermission = user?.permissions?.includes(permission);

        React.useEffect(() => {
          if (!hasPermission) {
            navigation.navigate('Unauthorized');
          }
        }, [hasPermission, navigation]);

        if (!hasPermission) {
          return (
            <View testID="no-permission">
              <Text>No Permission</Text>
            </View>
          );
        }

        return <>{children}</>;
      };

      const AdminScreen = ({ navigation }: any) => (
        <PermissionGuard permission="admin" navigation={navigation}>
          <View testID="admin-content">
            <Text>Admin Content</Text>
          </View>
        </PermissionGuard>
      );

      // * User without admin permission
      act(() => {
        useAuthStore.setState({
          user: { id: '1', email: 'test@example.com', permissions: ['user'] },
          isAuthenticated: true
        });
      });

      const { getByTestId } = renderWithNavigation(
        <AdminScreen navigation={mockNavigation} />
      );

      expect(getByTestId('no-permission')).toBeTruthy();
    });
  });

  describe('Navigation State Persistence', () => {
    it('saves navigation state', async () => {
      const navigationState = {
        index: 1,
        routes: [
          { name: 'Home', key: 'home-1' },
          { name: 'Project', key: 'project-1', params: { projectId: 'test' } }
        ]
      };

      const NavigationPersistence = () => {
        const [state, setState] = React.useState(navigationState);

        const saveNavigationState = async () => {
          // * In real app, would save to AsyncStorage
          const serialized = JSON.stringify(state);
          expect(serialized).toBeDefined();
        };

        React.useEffect(() => {
          saveNavigationState();
        }, [state, saveNavigationState]);

        return (
          <View testID="navigation-persistence">
            <Text>Current Route: {state.routes[state.index].name}</Text>
          </View>
        );
      };

      const { getByText } = render(<NavigationPersistence />);

      expect(getByText('Current Route: Project')).toBeTruthy();
    });

    it('restores navigation state', async () => {
      const savedState = {
        index: 1,
        routes: [
          { name: 'Home', key: 'home-1' },
          { name: 'Project', key: 'project-1', params: { projectId: 'restored' } }
        ]
      };

      const NavigationRestore = () => {
        const [state, setState] = React.useState<any>(null);

        React.useEffect(() => {
          // * Simulate restoring from AsyncStorage
          setTimeout(() => {
            setState(savedState);
          }, 100);
        }, []);

        if (!state) {
          return <Text>Loading...</Text>;
        }

        return (
          <View testID="restored-navigation">
            <Text>Route: {state.routes[state.index].name}</Text>
            <Text>Param: {state.routes[state.index].params?.projectId}</Text>
          </View>
        );
      };

      const { getByText } = render(<NavigationRestore />);

      await waitFor(() => {
        expect(getByText('Route: Project')).toBeTruthy();
        expect(getByText('Param: restored')).toBeTruthy();
      });
    });
  });

  describe('Back Navigation', () => {
    it('handles back navigation correctly', async () => {
      const BackNavigationTest = () => {
        const [currentScreen, setCurrentScreen] = React.useState('Home');

        return (
          <View>
            <Text testID="current-screen">{currentScreen}</Text>
            <TouchableOpacity
              testID="navigate-forward"
              onPress={() => setCurrentScreen('Project')}
            >
              <Text>Go Forward</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="navigate-back"
              onPress={() => setCurrentScreen('Home')}
            >
              <Text>Go Back</Text>
            </TouchableOpacity>
          </View>
        );
      };

      const { getByTestId, getByText } = render(<BackNavigationTest />);

      // * Navigate forward
      fireEvent.press(getByTestId('navigate-forward'));
      expect(getByText('Project')).toBeTruthy();

      // * Navigate back
      fireEvent.press(getByTestId('navigate-back'));
      expect(getByText('Home')).toBeTruthy();
    });

    it('prevents back navigation when form has unsaved changes', async () => {
      const FormWithGuard = () => {
        const [hasChanges, setHasChanges] = React.useState(false);
        const [showWarning, setShowWarning] = React.useState(false);

        const handleBack = () => {
          if (hasChanges) {
            setShowWarning(true);
          } else {
            // * Navigate back
          }
        };

        return (
          <View>
            <TouchableOpacity
              testID="make-changes"
              onPress={() => setHasChanges(true)}
            >
              <Text>Make Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity testID="back-button" onPress={handleBack}>
              <Text>Back</Text>
            </TouchableOpacity>
            {showWarning && (
              <Text testID="warning-message">
                You have unsaved changes!
              </Text>
            )}
          </View>
        );
      };

      const { getByTestId } = render(<FormWithGuard />);

      // * Make changes
      fireEvent.press(getByTestId('make-changes'));

      // * Try to go back
      fireEvent.press(getByTestId('back-button'));

      // * Should show warning
      await waitFor(() => {
        expect(getByTestId('warning-message')).toBeTruthy();
      });
    });
  });

  describe('Tab Navigation Integration', () => {
    it('syncs tab selection with store state', async () => {
      const TabNavigationTest = () => {
        const [activeTab, setActiveTab] = React.useState('projects');
        const setCurrentProject = useWorldbuildingStore(state => state.setCurrentProject);

        const handleTabChange = (tab: string) => {
          setActiveTab(tab);
          if (tab === 'projects') {
            setCurrentProject(null);
          }
        };

        return (
          <View>
            <View testID="tab-bar">
              <TouchableOpacity
                testID="projects-tab"
                onPress={() => handleTabChange('projects')}
              >
                <Text>Projects</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="settings-tab"
                onPress={() => handleTabChange('settings')}
              >
                <Text>Settings</Text>
              </TouchableOpacity>
            </View>
            <Text testID="active-tab">Active: {activeTab}</Text>
          </View>
        );
      };

      const { getByTestId, getByText } = render(<TabNavigationTest />);

      // * Switch to settings tab
      fireEvent.press(getByTestId('settings-tab'));
      expect(getByText('Active: settings')).toBeTruthy();

      // * Switch back to projects
      fireEvent.press(getByTestId('projects-tab'));
      expect(getByText('Active: projects')).toBeTruthy();

      // * Verify store was updated
      const state = useWorldbuildingStore.getState();
      expect(state.currentProjectId).toBeNull();
    });
  });
});
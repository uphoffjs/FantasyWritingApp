/**
 * * Navigation Component Tests (Jest + React Native Testing Library)
 * * Tests navigation between screens, deep linking, params, back behavior
 * ! Critical: Tests navigation flow, state management, and user journey
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, TouchableOpacity, Button } from 'react-native';
import { renderWithNavigation, createMockNavigation, createMockRoute } from '../../src/test/testUtils';

// * Test Screens
const HomeScreen = ({ navigation }: any) => (
  <View testID="home-screen">
    <Text testID="home-title">Home Screen</Text>
    <TouchableOpacity
      testID="go-to-details"
      onPress={() => navigation.navigate('Details', { id: '123', name: 'Test Item' })}
    >
      <Text>Go to Details</Text>
    </TouchableOpacity>
    <TouchableOpacity
      testID="go-to-profile"
      onPress={() => navigation.navigate('Profile')}
    >
      <Text>Go to Profile</Text>
    </TouchableOpacity>
  </View>
);

const DetailsScreen = ({ route, navigation }: any) => (
  <View testID="details-screen">
    <Text testID="details-title">Details Screen</Text>
    <Text testID="details-id">ID: {route.params?.id}</Text>
    <Text testID="details-name">Name: {route.params?.name}</Text>
    <TouchableOpacity
      testID="go-back"
      onPress={() => navigation.goBack()}
    >
      <Text>Go Back</Text>
    </TouchableOpacity>
    <TouchableOpacity
      testID="update-params"
      onPress={() => navigation.setParams({ name: 'Updated Name' })}
    >
      <Text>Update Name</Text>
    </TouchableOpacity>
  </View>
);

const ProfileScreen = ({ navigation }: any) => (
  <View testID="profile-screen">
    <Text testID="profile-title">Profile Screen</Text>
    <TouchableOpacity
      testID="replace-with-settings"
      onPress={() => navigation.replace('Settings')}
    >
      <Text>Replace with Settings</Text>
    </TouchableOpacity>
  </View>
);

const SettingsScreen = ({ navigation }: any) => (
  <View testID="settings-screen">
    <Text testID="settings-title">Settings Screen</Text>
    <TouchableOpacity
      testID="reset-to-home"
      onPress={() => navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      })}
    >
      <Text>Reset to Home</Text>
    </TouchableOpacity>
  </View>
);

// * Tab screens for tab navigation tests
const TabHomeScreen = () => (
  <View testID="tab-home-screen">
    <Text>Tab Home</Text>
  </View>
);

const TabSearchScreen = () => (
  <View testID="tab-search-screen">
    <Text>Tab Search</Text>
  </View>
);

const TabProfileScreen = () => (
  <View testID="tab-profile-screen">
    <Text>Tab Profile</Text>
  </View>
);

describe('Navigation', () => {
  const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();

  // * Stack Navigation Tests
  describe('Stack Navigation', () => {
    const TestNavigator = () => (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Details" component={DetailsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );

    it('should render initial screen', () => {
      const { getByTestId, getByText } = render(<TestNavigator />);

      expect(getByTestId('home-screen')).toBeTruthy();
      expect(getByText('Home Screen')).toBeTruthy();
    });

    it('should navigate to another screen', async () => {
      const { getByTestId, queryByTestId } = render(<TestNavigator />);

      // * Initially on Home
      expect(getByTestId('home-screen')).toBeTruthy();
      expect(queryByTestId('details-screen')).toBeNull();

      // * Navigate to Details
      fireEvent.press(getByTestId('go-to-details'));

      await waitFor(() => {
        expect(getByTestId('details-screen')).toBeTruthy();
        expect(queryByTestId('home-screen')).toBeNull();
      });
    });

    it('should pass params to screen', async () => {
      const { getByTestId } = render(<TestNavigator />);

      // * Navigate to Details with params
      fireEvent.press(getByTestId('go-to-details'));

      await waitFor(() => {
        expect(getByTestId('details-id')).toHaveTextContent('ID: 123');
        expect(getByTestId('details-name')).toHaveTextContent('Name: Test Item');
      });
    });

    it('should update params', async () => {
      const { getByTestId } = render(<TestNavigator />);

      // * Navigate to Details
      fireEvent.press(getByTestId('go-to-details'));

      await waitFor(() => {
        expect(getByTestId('details-name')).toHaveTextContent('Name: Test Item');
      });

      // * Update params
      fireEvent.press(getByTestId('update-params'));

      await waitFor(() => {
        expect(getByTestId('details-name')).toHaveTextContent('Name: Updated Name');
      });
    });

    it('should go back to previous screen', async () => {
      const { getByTestId, queryByTestId } = render(<TestNavigator />);

      // * Navigate to Details
      fireEvent.press(getByTestId('go-to-details'));

      await waitFor(() => {
        expect(getByTestId('details-screen')).toBeTruthy();
      });

      // * Go back
      fireEvent.press(getByTestId('go-back'));

      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
        expect(queryByTestId('details-screen')).toBeNull();
      });
    });

    it('should replace current screen', async () => {
      const { getByTestId, queryByTestId } = render(<TestNavigator />);

      // * Navigate to Profile
      fireEvent.press(getByTestId('go-to-profile'));

      await waitFor(() => {
        expect(getByTestId('profile-screen')).toBeTruthy();
      });

      // * Replace with Settings
      fireEvent.press(getByTestId('replace-with-settings'));

      await waitFor(() => {
        expect(getByTestId('settings-screen')).toBeTruthy();
        expect(queryByTestId('profile-screen')).toBeNull();
      });

      // * Note: After replace, going back should go to Home, not Profile
      // * This would require testing with navigation.goBack() or hardware back button
    });

    it('should reset navigation state', async () => {
      const { getByTestId, queryByTestId } = render(<TestNavigator />);

      // * Navigate through multiple screens
      fireEvent.press(getByTestId('go-to-profile'));

      await waitFor(() => {
        expect(getByTestId('profile-screen')).toBeTruthy();
      });

      fireEvent.press(getByTestId('replace-with-settings'));

      await waitFor(() => {
        expect(getByTestId('settings-screen')).toBeTruthy();
      });

      // * Reset to Home
      fireEvent.press(getByTestId('reset-to-home'));

      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
        expect(queryByTestId('settings-screen')).toBeNull();
      });
    });
  });

  // * Tab Navigation Tests
  describe('Tab Navigation', () => {
    const TestTabNavigator = () => (
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen
            name="TabHome"
            component={TabHomeScreen}
            options={{
              tabBarTestID: 'tab-home-button',
            }}
          />
          <Tab.Screen
            name="TabSearch"
            component={TabSearchScreen}
            options={{
              tabBarTestID: 'tab-search-button',
            }}
          />
          <Tab.Screen
            name="TabProfile"
            component={TabProfileScreen}
            options={{
              tabBarTestID: 'tab-profile-button',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    );

    it('should render initial tab', () => {
      const { getByTestId } = render(<TestTabNavigator />);

      expect(getByTestId('tab-home-screen')).toBeTruthy();
    });

    it('should switch between tabs', async () => {
      const { getByTestId, getByText, queryByTestId } = render(<TestTabNavigator />);

      // * Initially on Home tab
      expect(getByTestId('tab-home-screen')).toBeTruthy();

      // * Switch to Search tab
      const searchTab = getByText('TabSearch');
      fireEvent.press(searchTab);

      await waitFor(() => {
        expect(getByTestId('tab-search-screen')).toBeTruthy();
        expect(queryByTestId('tab-home-screen')).toBeNull();
      });

      // * Switch to Profile tab
      const profileTab = getByText('TabProfile');
      fireEvent.press(profileTab);

      await waitFor(() => {
        expect(getByTestId('tab-profile-screen')).toBeTruthy();
        expect(queryByTestId('tab-search-screen')).toBeNull();
      });

      // * Switch back to Home tab
      const homeTab = getByText('TabHome');
      fireEvent.press(homeTab);

      await waitFor(() => {
        expect(getByTestId('tab-home-screen')).toBeTruthy();
        expect(queryByTestId('tab-profile-screen')).toBeNull();
      });
    });
  });

  // * Deep Linking Tests
  describe('Deep Linking', () => {
    const linking = {
      prefixes: ['myapp://'],
      config: {
        screens: {
          Home: 'home',
          Details: 'details/:id',
          Profile: 'profile',
          Settings: 'settings',
        },
      },
    };

    const DeepLinkNavigator = () => (
      <NavigationContainer linking={linking}>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Details" component={DetailsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );

    it('should handle deep link navigation', () => {
      // * Note: Deep linking testing requires more complex setup
      // * with mocking Linking API and navigation state
      const { getByTestId } = render(<DeepLinkNavigator />);
      expect(getByTestId('home-screen')).toBeTruthy();
    });
  });

  // * Navigation Prop Tests
  describe('Navigation Prop Methods', () => {
    it('should test navigation prop methods', () => {
      const navigation = createMockNavigation();
      const route = createMockRoute('TestScreen', { testParam: 'value' });

      const TestScreen = ({ navigation: nav, route: testRoute }: any) => (
        <View testID="test-screen">
          <Button testID="button-navigate" title="Navigate" onPress={() => nav.navigate('Other')} />
          <Button testID="button-go-back" title="Go Back" onPress={() => nav.goBack()} />
          <Button testID="button-push" title="Push" onPress={() => nav.push('Other')} />
          <Button testID="button-pop" title="Pop" onPress={() => nav.pop()} />
          <Button testID="button-pop-to-top" title="Pop To Top" onPress={() => nav.popToTop()} />
          <Button testID="button-replace" title="Replace" onPress={() => nav.replace('Other')} />
          <Button testID="button-reset" title="Reset" onPress={() => nav.reset({ index: 0, routes: [] })} />
          <Button testID="button-set-options" title="Set Options" onPress={() => nav.setOptions({ title: 'New' })} />
          <Button testID="button-set-params" title="Set Params" onPress={() => nav.setParams({ new: 'param' })} />
          <Text testID="route-name">{testRoute.name}</Text>
          <Text testID="route-param">{testRoute.params?.testParam}</Text>
        </View>
      );

      const { getByTestId, getByText } = render(
        <TestScreen navigation={navigation} route={route} />
      );

      // * Test navigation methods
      fireEvent.press(getByText('Navigate'));
      expect(navigation.navigate).toHaveBeenCalledWith('Other');

      fireEvent.press(getByText('Go Back'));
      expect(navigation.goBack).toHaveBeenCalled();

      fireEvent.press(getByText('Push'));
      expect(navigation.push).toHaveBeenCalledWith('Other');

      fireEvent.press(getByText('Pop'));
      expect(navigation.pop).toHaveBeenCalled();

      fireEvent.press(getByText('Pop To Top'));
      expect(navigation.popToTop).toHaveBeenCalled();

      fireEvent.press(getByText('Replace'));
      expect(navigation.replace).toHaveBeenCalledWith('Other');

      fireEvent.press(getByText('Reset'));
      expect(navigation.reset).toHaveBeenCalledWith({ index: 0, routes: [] });

      fireEvent.press(getByText('Set Options'));
      expect(navigation.setOptions).toHaveBeenCalledWith({ title: 'New' });

      fireEvent.press(getByText('Set Params'));
      expect(navigation.setParams).toHaveBeenCalledWith({ new: 'param' });

      // * Test route
      expect(getByTestId('route-name')).toHaveTextContent('TestScreen');
      expect(getByTestId('route-param')).toHaveTextContent('value');
    });

    it('should test navigation state methods', () => {
      const navigation = createMockNavigation();

      // * Test isFocused
      expect(navigation.isFocused()).toBe(true);

      // * Test canGoBack
      expect(navigation.canGoBack()).toBe(false);

      // * Test addListener
      const listener = jest.fn();
      const unsubscribe = navigation.addListener('focus', listener);
      expect(navigation.addListener).toHaveBeenCalledWith('focus', listener);
      expect(unsubscribe.remove).toBeDefined();
    });
  });

  // * Nested Navigation Tests
  describe('Nested Navigation', () => {
    const NestedNavigator = () => {
      const NestedStack = createNativeStackNavigator();

      const TabWithStack = () => (
        <NestedStack.Navigator>
          <NestedStack.Screen name="TabStackHome" component={TabHomeScreen} />
          <NestedStack.Screen name="TabStackDetails" component={DetailsScreen} />
        </NestedStack.Navigator>
      );

      return (
        <NavigationContainer>
          <Tab.Navigator>
            <Tab.Screen name="Home" component={TabWithStack} />
            <Tab.Screen name="Search" component={TabSearchScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      );
    };

    it('should handle nested navigation', async () => {
      const { getByTestId, getByText } = render(<NestedNavigator />);

      // * Should show nested stack home within tab
      expect(getByTestId('tab-home-screen')).toBeTruthy();

      // * Can switch to other tab
      fireEvent.press(getByText('Search'));

      await waitFor(() => {
        expect(getByTestId('tab-search-screen')).toBeTruthy();
      });
    });
  });

  // * Navigation Guards Tests
  describe('Navigation Guards', () => {
    const GuardedNavigator = ({ isAuthenticated }: { isAuthenticated: boolean }) => (
      <NavigationContainer>
        <Stack.Navigator>
          {isAuthenticated ? (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={() => (
                <View testID="login-screen">
                  <Text>Login Screen</Text>
                </View>
              )} />
              <Stack.Screen name="Register" component={() => (
                <View testID="register-screen">
                  <Text>Register Screen</Text>
                </View>
              )} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    );

    it('should show auth screens when not authenticated', () => {
      const { getByTestId } = render(<GuardedNavigator isAuthenticated={false} />);

      expect(getByTestId('login-screen')).toBeTruthy();
    });

    it('should show app screens when authenticated', () => {
      const { getByTestId } = render(<GuardedNavigator isAuthenticated={true} />);

      expect(getByTestId('home-screen')).toBeTruthy();
    });
  });
});
/**
 * * Main App component for Fantasy Writing App
 * * Configures React Navigation for both web and mobile platforms
 * ! IMPORTANT: Entry point for the entire application
 */

import React, { useEffect, useState } from 'react';
import { Platform, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// * Navigation configuration
import linking from './src/navigation/linking';
import type { RootStackParamList } from './src/navigation/types';

// * Screen components
import { LoadingScreen } from './src/screens/LoadingScreen';
import LoginScreen from './src/screens/LoginScreen';
import { ProjectListScreen } from './src/screens/ProjectListScreen';
import { ProjectScreen } from './src/screens/ProjectScreen';
import { ElementScreen } from './src/screens/ElementScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { NotFoundScreen } from './src/screens/NotFoundScreen';

// * Global state and context providers
import { useAuthStore } from './src/store/authStore';
import { SearchProvider } from './src/components/SearchProvider';
import { ThemeProvider } from './src/providers/ThemeProvider';

// * Additional UI components
import AuthGuard from './src/components/AuthGuard';
import { InstallPrompt } from './src/components/InstallPrompt';

// * Database synchronization hook
import { useSupabaseSync } from './src/hooks/useSupabaseSync';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [_isInitialized, setIsInitialized] = useState(false);
  const { isAuthenticated, initialize: initAuth } = useAuthStore();
  
  // * Initialize Supabase sync when authenticated
  useSupabaseSync();

  // * Initialize the app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // * Initialize authentication first
        await initAuth();
        
        // * Check if there's existing data to migrate
        if (Platform.OS === 'web') {
          // ! SECURITY: Checking localStorage for existing data
          const existingData = localStorage.getItem('worldbuilding-storage');
          if (existingData) {
            console.log('Found existing worldbuilding data, preserving...');
          }
        }

        // * Initialize store (Zustand will handle persistence)
        // * The store automatically loads persisted data via the persist middleware
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [initAuth]);

  if (isLoading) {
    return (
      <ThemeProvider>
        <LoadingScreen message="Initializing Fantasy Writing App..." />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={appStyles.rootView}>
        <SafeAreaProvider>
          <SearchProvider>
          {Platform.OS !== 'web' && (
            <StatusBar 
              barStyle="light-content" 
              backgroundColor="#1A1815" 
            />
          )}
          <NavigationContainer 
            linking={linking}
            fallback={<LoadingScreen message="Loading..." />}
          >
            <Stack.Navigator
              initialRouteName={isAuthenticated ? "Projects" : "Login"}
              screenOptions={{
                headerStyle: {
                  // ! HARDCODED: Should use design tokens
                  backgroundColor: '#1A1815', // obsidian background
                },
                // ! HARDCODED: Should use design tokens
                headerTintColor: '#C9A94F', // gold accent
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
                // * Disable header for web (we'll use custom header)
                headerShown: Platform.OS !== 'web',
                animation: Platform.OS === 'web' ? 'none' : 'default',
              }}
            >
              {/* * Login Screen */}
              <Stack.Screen 
                name="Login" 
                options={{ 
                  headerShown: false,
                }}
              >
                {(props) => (
                  <AuthGuard requireAuth={false}>
                    <LoginScreen {...props} />
                  </AuthGuard>
                )}
              </Stack.Screen>
              
              {/* * Main App Flow */}
              <Stack.Screen 
                name="Projects" 
                options={{ 
                  title: 'My Projects',
                  headerShown: Platform.OS !== 'web',
                }}
              >
                {(props) => (
                  <AuthGuard requireAuth={true}>
                    <ProjectListScreen {...props} />
                  </AuthGuard>
                )}
              </Stack.Screen>
              
              <Stack.Screen 
                name="Project" 
                options={{ 
                  title: 'Project Details',
                  headerShown: Platform.OS !== 'web',
                }}
              >
                {(props) => (
                  <AuthGuard requireAuth={true}>
                    <ProjectScreen {...props} />
                  </AuthGuard>
                )}
              </Stack.Screen>
              
              <Stack.Screen 
                name="Element" 
                options={{ 
                  title: 'Element Details',
                  headerShown: Platform.OS !== 'web',
                }}
              >
                {(props) => (
                  <AuthGuard requireAuth={true}>
                    <ElementScreen {...props} />
                  </AuthGuard>
                )}
              </Stack.Screen>
              
              {/* * Settings */}
              <Stack.Screen 
                name="Settings" 
                options={{ 
                  title: 'Settings',
                  headerShown: Platform.OS !== 'web',
                }}
              >
                {(props) => (
                  <AuthGuard requireAuth={true}>
                    <SettingsScreen {...props} />
                  </AuthGuard>
                )}
              </Stack.Screen>
              
              {/* * Error/Not Found */}
              <Stack.Screen 
                name="NotFound" 
                component={NotFoundScreen}
                options={{ 
                  title: '404 - Not Found',
                  headerShown: Platform.OS !== 'web',
                }} 
              />
            </Stack.Navigator>
          </NavigationContainer>

          {/* * PWA Install Prompt (web only) */}
          {Platform.OS === 'web' && <InstallPrompt />}
        </SearchProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  </ThemeProvider>
  );
}

const appStyles = {
  rootView: {
    flex: 1,
  },
};

export default App;

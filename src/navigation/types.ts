/**
 * Navigation types for React Navigation
 * Defines the navigation structure and parameters
 */

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// * Define the parameter list for each screen
export type RootStackParamList = {
  // ! SECURITY: * Auth
  Login: undefined;
  
  // Main App Flow
  Projects: undefined;
  Project: { projectId: string };
  Element: { projectId: string; elementId: string };
  
  // Settings
  Settings: undefined;
  
  // * Error screens
  NotFound: undefined;
};

// * Define screen prop types for easy use in components
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

// * Helper type for navigation prop
export type NavigationProp = RootStackScreenProps<keyof RootStackParamList>['navigation'];

// * Helper type for route prop
export type RouteProp<T extends keyof RootStackParamList> = 
  RootStackScreenProps<T>['route'];
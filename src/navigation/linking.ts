/**
 * Web linking configuration for React Navigation
 * Maps URLs to navigation screens for web support
 */

import { LinkingOptions } from '@react-navigation/native';
import { Platform } from 'react-native';
import type { RootStackParamList } from './types';

// Generate prefixes for common development ports
const generatePrefixes = () => {
  const ports = [3000, 3001, 5000, 5173, 8000, 8080, 8081, 9000];
  const prefixes = ['fantasywritingapp://'];
  
  // Add localhost prefixes for all common ports
  ports.forEach(port => {
    prefixes.push(`http://localhost:${port}`);
    prefixes.push(`https://localhost:${port}`);
  });
  
  // Also add the current location if running in browser
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const currentOrigin = window.location.origin;
    if (!prefixes.includes(currentOrigin)) {
      prefixes.push(currentOrigin);
    }
  }
  
  return prefixes;
};

const linking: LinkingOptions<RootStackParamList> = {
  // Only enable linking on web
  enabled: Platform.OS === 'web',
  
  prefixes: generatePrefixes(),
  
  config: {
    screens: {
      // Auth routes
      Login: 'login',
      
      // Main app routes
      Projects: 'projects',
      Project: 'project/:projectId',
      Element: 'project/:projectId/element/:elementId',
      
      // Settings routes
      Settings: 'settings',
      
      // Error routes
      NotFound: '*',
    },
  },
};

export default linking;
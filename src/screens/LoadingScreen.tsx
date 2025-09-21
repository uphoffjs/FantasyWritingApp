/**
 * LoadingScreen.tsx
 * * Full screen loading component using the enhanced LoadingIndicator
 * * Theme-aware with fantasy styling
 * ! IMPORTANT: Uses LoadingIndicator for consistent loading patterns
 */

import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { LoadingIndicator } from '../components/loading/LoadingIndicator';
import { useTheme } from '../providers/ThemeProvider';

// * Helper to safely use theme context
// * Returns null if not within a ThemeProvider
const useOptionalTheme = () => {
  try {
    return useTheme();
  } catch {
    // ! ThemeProvider not available during initial app loading
    return null;
  }
};

interface LoadingScreenProps {
  message?: string;
  // * Loading variant to use
  variant?: 'spinner' | 'dots' | 'bar' | 'ring';
  // * Optional progress for bar variant
  progress?: number;
}

export function LoadingScreen({
  message = 'Loading...',
  variant = 'ring',
  progress
}: LoadingScreenProps) {
  // * Use theme if available, otherwise use fallback color
  const themeContext = useOptionalTheme();
  // ! Fixed: Changed from theme.ui.background.primary to theme.surface.background
  const backgroundColor = themeContext?.theme?.surface?.background ?? '#F3E9D2';
  
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <LoadingIndicator
        variant={variant}
        size="large"
        message={message}
        progress={progress}
        fullscreen={false}
        testID="loading-screen"
        accessibilityLabel="Loading application"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
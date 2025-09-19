/**
 * LoadingScreen.tsx
 * * Full screen loading component using the enhanced LoadingIndicator
 * * Theme-aware with fantasy styling
 * ! IMPORTANT: Uses LoadingIndicator for consistent loading patterns
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LoadingIndicator } from '../components/loading/LoadingIndicator';
import { useTheme } from '../providers/ThemeProvider';

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
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.ui.background.primary }]}>
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
/**
 * Loading screen component with React Native
 * Shows a loading spinner and optional message
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator 
        size="large" 
        color="#6366F1"
        style={styles.spinner}
      />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#F9FAFB',
    textAlign: 'center',
    paddingHorizontal: 20,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }),
  },
});
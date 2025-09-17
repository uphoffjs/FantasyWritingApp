/**
 * Not Found Screen
 * 404 error page
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';

export function NotFoundScreen() {
  const navigation = useNavigation();
  
  return (
    <View style={styles.container}>
      <Text style={styles.errorCode}>404</Text>
      <Text style={styles.title}>Page Not Found</Text>
      <Text style={styles.message}>
        The page you're looking for doesn't exist or has been moved.
      </Text>
      <Button 
        title="Go to Projects" 
        variant="primary"
        onPress={() => navigation.navigate('Projects' as any)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 24 : 16,
  },
  errorCode: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 400,
    lineHeight: 24,
  },
});
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const navigation = useNavigation();
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // ! SECURITY: * Redirect to login if authentication is required but user is not authenticated
        navigation.navigate('Login' as never);
      } else if (!requireAuth && isAuthenticated) {
        // ! SECURITY: * Redirect to projects if user is authenticated but on a non-auth page (like login)
        navigation.navigate('Projects' as never);
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, navigation]);
  
  // ? ! SECURITY: * Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C9A94F" />
      </View>
    );
  }
  
  // ! SECURITY: * If authentication requirements are met, render children
  if (requireAuth) {
    if (isAuthenticated) {
      return <>{children}</>;
    }
    // * Will redirect in useEffect, return null for now
    return null;
  } else {
    if (!isAuthenticated) {
      return <>{children}</>;
    }
    // * Will redirect in useEffect, return null for now
    return null;
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF7F2', // parchment-100
  },
});
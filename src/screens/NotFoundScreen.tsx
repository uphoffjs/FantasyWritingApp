/**
 * Not Found Screen
 * 404 error page
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { fantasyTomeColors } from '../constants/fantasyTomeColors';

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
    backgroundColor: fantasyTomeColors.ink.scribe,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 24 : 16,
  },
  errorCode: {
    fontSize: 72,
    fontWeight: 'bold',
    color: fantasyTomeColors.elements.magic.primary,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: fantasyTomeColors.ink.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: fantasyTomeColors.ink.light,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 400,
    lineHeight: 24,
  },
});

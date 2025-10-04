import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { fantasyTomeColors } from './constants/fantasyTomeColors';

export const ViteTest: React.FC = () => {
  const [count, setCount] = React.useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vite + React Native Web Test</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setCount(c => c + 1)}
        data-cy="vite-test-button"
        testID="vite-test-button"
      >
        <Text style={styles.buttonText}>Count: {count}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: fantasyTomeColors.elements.culture.primary,
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: fantasyTomeColors.parchment.vellum,
    fontSize: 16,
  },
});
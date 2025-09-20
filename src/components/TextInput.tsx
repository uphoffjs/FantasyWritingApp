/**
 * Cross-platform TextInput component
 * Provides consistent styling across web and mobile
 */

import React, { forwardRef } from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  Text,
  StyleSheet,
  Platform,
  ViewStyle,
} from 'react-native';

interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  multiline?: boolean;
  numberOfLines?: number;
}

export const TextInput = forwardRef<RNTextInput, TextInputProps>(
  (
    {
      label,
      error,
      containerStyle,
      inputStyle,
      multiline = false,
      numberOfLines = 1,
      ...props
    },
    ref
  ) => {
    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}
        <RNTextInput
          ref={ref}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            error && styles.errorInput,
            Platform.OS === 'web' && styles.webInput,
            inputStyle,
          ]} placeholderTextColor="#6B7280"
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ?  'top'  : 'center'}
          {...props}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }
);

TextInput.displayName = 'TextInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500', color: '#F9FAFB', // ! HARDCODED: Should use design tokens
    marginBottom: 6,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }),
  },
  input: { backgroundColor: '#1F2937', // ! HARDCODED: Should use design tokens
    borderWidth: 1, borderColor: '#374151', // ! HARDCODED: Should use design tokens
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16, color: '#F9FAFB', // ! HARDCODED: Should use design tokens
    minHeight: 44,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }),
  },
  multilineInput: {
    minHeight: 100,
    paddingTop: 10,
  },
  webInput: {
    ...Platform.select({
      web: {
        outlineWidth: 0,
        boxSizing: 'border-box',
      },
      default: {},
    }),
  },
  errorInput: { borderColor: '#DC2626', // ! HARDCODED: Should use design tokens
  },
  errorText: {
    fontSize: 12, color: '#DC2626', // ! HARDCODED: Should use design tokens
    marginTop: 4,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }),
  },
});
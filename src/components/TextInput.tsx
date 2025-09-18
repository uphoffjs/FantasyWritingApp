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
          ]}
          // ! HARDCODED: Should use design tokens
          placeholderTextColor="#6B7280"
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
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
    fontWeight: '500',
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
    marginBottom: 6,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }),
  },
  input: {
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#1F2937',
    borderWidth: 1,
    // ! HARDCODED: Should use design tokens
    borderColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
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
  errorInput: {
    // ! HARDCODED: Should use design tokens
    borderColor: '#DC2626',
  },
  errorText: {
    fontSize: 12,
    // ! HARDCODED: Should use design tokens
    color: '#DC2626',
    marginTop: 4,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }),
  },
});
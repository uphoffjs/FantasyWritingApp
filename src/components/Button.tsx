/**
 * Cross-platform Button component
 * Provides consistent styling and behavior across web and mobile
 */

import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    isDisabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
    isDisabled && styles.disabledText,
    textStyle,
  ];

  return (
    <Pressable
      style={({ pressed }) => [
        ...buttonStyles,
        pressed && !isDisabled && styles.pressed,
        Platform.OS === 'web' && styles.webButton,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : '#6366F1'}
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'all 0.2s ease',
      },
      default: {},
    }),
  },
  webButton: {
    ...Platform.select({
      web: {
        outlineWidth: 0,
      },
      default: {},
    }),
  },
  // Variants
  primary: {
    backgroundColor: '#6366F1',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  danger: {
    backgroundColor: '#DC2626',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  // Sizes
  small: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  medium: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  large: {
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  // States
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
    ...Platform.select({
      web: {
        cursor: 'not-allowed',
      },
      default: {},
    }),
  },
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }),
  },
  text_primary: {
    color: '#FFFFFF',
  },
  text_secondary: {
    color: '#6366F1',
  },
  text_danger: {
    color: '#FFFFFF',
  },
  textSize_small: {
    fontSize: 12,
  },
  textSize_medium: {
    fontSize: 14,
  },
  textSize_large: {
    fontSize: 16,
  },
  disabledText: {
    opacity: 0.7,
  },
});
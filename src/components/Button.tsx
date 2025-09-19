/**
 * * Cross-platform Button component
 * * Provides consistent styling and behavior across web and mobile
 * * Now integrated with fantasy theme system for dynamic theming
 * ! IMPORTANT: testID is required for all interactive components for Cypress testing
 */

import React, { useMemo } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../providers/ThemeProvider';

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
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  // * Create dynamic styles based on theme
  const themedStyles = useMemo(() => {
    return createStyles(theme);
  }, [theme]);

  const buttonStyles = [
    themedStyles.base,
    themedStyles[variant],
    themedStyles[size],
    isDisabled && themedStyles.disabled,
    style,
  ];

  const textStyles = [
    themedStyles.text,
    themedStyles[`text_${variant}`],
    themedStyles[`textSize_${size}`],
    isDisabled && themedStyles.disabledText,
    textStyle,
  ];

  // * Get appropriate loading indicator color based on variant and theme
  const loadingColor = useMemo(() => {
    if (variant === 'primary') {
      return theme.colors.button.primaryText;
    } else if (variant === 'danger') {
      return theme.colors.button.dangerText;
    }
    return theme.colors.button.primary;
  }, [variant, theme]);

  return (
    <Pressable
      style={({ pressed }) => [
        ...buttonStyles,
        pressed && !isDisabled && themedStyles.pressed,
        // * Web-specific styles for better UX
        Platform.OS === 'web' && themedStyles.webButton,
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
          color={loadingColor}
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </Pressable>
  );
}

// * Dynamic style creation based on theme
const createStyles = (theme: any) => StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.md,
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
  // * Button variant styles using theme colors
  primary: {
    backgroundColor: theme.colors.button.primary,
    borderWidth: 1,
    borderColor: theme.colors.button.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.button.secondary,
  },
  danger: {
    backgroundColor: theme.colors.button.danger,
    borderWidth: 1,
    borderColor: theme.colors.button.danger,
  },
  // * Button size variations using theme spacing
  small: {
    paddingVertical: theme.spacing.xs + 2,
    paddingHorizontal: theme.spacing.sm + 4,
  },
  medium: {
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.md + 4,
  },
  large: {
    paddingVertical: theme.spacing.sm + 6,
    paddingHorizontal: theme.spacing.lg + 4,
  },
  // * Interactive state styles
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.button.disabled,
    borderColor: theme.colors.button.disabled,
    ...Platform.select({
      web: {
        cursor: 'not-allowed',
      },
      default: {},
    }),
  },
  // * Text styling based on variants and theme typography
  text: {
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.medium,
  },
  text_primary: {
    color: theme.colors.button.primaryText,
  },
  text_secondary: {
    color: theme.colors.button.secondaryText,
  },
  text_danger: {
    color: theme.colors.button.dangerText,
  },
  textSize_small: {
    fontSize: theme.typography.fontSize.sm,
  },
  textSize_medium: {
    fontSize: theme.typography.fontSize.md,
  },
  textSize_large: {
    fontSize: theme.typography.fontSize.lg,
  },
  disabledText: {
    color: theme.colors.button.disabledText,
    opacity: 0.7,
  },
});
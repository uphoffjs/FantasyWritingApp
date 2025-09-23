/**
 * * Cross-platform Button component
 * * Provides consistent styling and behavior across web and mobile
 * * Now integrated with fantasy theme system for dynamic theming
 * * Enhanced with smooth press animations and effects
 * ! IMPORTANT: testID is required for all interactive components for Cypress testing
 */

import React, { useMemo, useRef, useCallback, useEffect } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { LoadingIndicator } from './loading/LoadingIndicator';
import { getTestProps } from '../utils/react-native-web-polyfills';

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

  // * Animated values for smooth press effects
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const elevationAnim = useRef(new Animated.Value(0)).current;

  // * Create dynamic styles based on theme
  const themedStyles = useMemo(() => {
    return createStyles(theme);
  }, [theme]);

  // * Handle press in animation - spring effect for more natural feel
  const handlePressIn = useCallback(() => {
    if (isDisabled) return;
    
    // * Parallel animations for smooth effect
    Animated.parallel([
      // * Spring animation for scale - bouncy press effect
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
      // * Timing animation for opacity - fade effect
      Animated.timing(opacityAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      // * Elevation animation for depth effect (mobile only)
      Platform.OS !== 'web' && Animated.timing(elevationAnim, {
        toValue: 2,
        duration: 100,
        useNativeDriver: false, // * Elevation can't use native driver
      }),
    ].filter(Boolean)).start();
  }, [isDisabled, scaleAnim, opacityAnim, elevationAnim]);

  // * Handle press out animation - spring back to original state
  const handlePressOut = useCallback(() => {
    if (isDisabled) return;
    
    // * Parallel animations for smooth release
    Animated.parallel([
      // * Spring animation for scale - bounce back effect
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
      // * Timing animation for opacity - fade back
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      // * Elevation animation reset (mobile only)
      Platform.OS !== 'web' && Animated.timing(elevationAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ].filter(Boolean)).start();
  }, [isDisabled, scaleAnim, opacityAnim, elevationAnim]);

  // * Reset animations when disabled state changes
  useEffect(() => {
    if (isDisabled) {
      scaleAnim.setValue(1);
      opacityAnim.setValue(1);
      elevationAnim.setValue(0);
    }
  }, [isDisabled, scaleAnim, opacityAnim, elevationAnim]);

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

  // * Animated styles for smooth transitions
  const animatedButtonStyle = {
    transform: [{ scale: scaleAnim }],
    opacity: opacityAnim,
    // * Add elevation for depth effect on mobile
    ...(Platform.OS !== 'web' && {
      elevation: elevationAnim,
      shadowOpacity: 0.3,
      shadowRadius: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
    }),
  };

  return (
    <Animated.View style={animatedButtonStyle}>
      <Pressable
        style={[
          ...buttonStyles,
          // * Web-specific styles for better UX
          Platform.OS === 'web' && themedStyles.webButton,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={isDisabled}
        {...(testID ? getTestProps(testID) : {})}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
      >
        {loading ? (
          <LoadingIndicator
            variant="spinner"
            size="small"
            color={loadingColor}
            inline={true}
            testID={`${testID}-loading`}
          />
        ) : (
          <Text style={textStyles}>{title}</Text>
        )}
      </Pressable>
    </Animated.View>
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
  // * Interactive state styles handled by animations now
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
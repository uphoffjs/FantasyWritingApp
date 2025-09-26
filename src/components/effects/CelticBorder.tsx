/**
 * * Celtic knot border component for special cards
 * * Provides decorative fantasy-themed borders with cross-platform support
 * ! Works with SVG on web and styled Views on mobile
 */

import React, { memo } from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';

interface CelticBorderProps {
  style?: ViewStyle;
  variant?: 'simple' | 'ornate' | 'corner' | 'full';
  color?: string;
  opacity?: number;
  thickness?: number;
  testID?: string;
  children?: React.ReactNode;
}

export const CelticBorder = memo(function CelticBorder({
  style,
  variant = 'simple',
  color,
  opacity = 0.3,
  thickness = 2,
  testID = 'celtic-border',
  children,
}: CelticBorderProps) {
  const { theme } = useTheme();
  const borderColor = color || theme.colors.metal.gold;

  // * Web implementation using styled Views (no HTML elements)
  // * For full SVG support, consider using react-native-svg library
  if (Platform.OS === 'web') {
    // * Use enhanced View-based styling for web
    const getWebBorderStyle = (): ViewStyle => {
      const baseStyle: ViewStyle = {
        borderColor: borderColor,
        borderWidth: thickness,
        opacity: opacity,
      };

      switch (variant) {
        case 'ornate':
          // * Double border effect with shadow
          return {
            ...baseStyle,
            borderStyle: 'solid',
            borderRadius: theme.borderRadius.lg,
            shadowColor: borderColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: opacity * 0.5,
            shadowRadius: 6,
            elevation: 3,
          };

        case 'corner':
          // * Emphasized corners
          return {
            ...baseStyle,
            borderTopWidth: thickness * 2.5,
            borderBottomWidth: thickness * 2.5,
            borderLeftWidth: thickness,
            borderRightWidth: thickness,
            borderRadius: theme.borderRadius.xl,
          };

        case 'full':
          // * Full decorative border with double lines effect
          return {
            ...baseStyle,
            borderWidth: thickness * 2,
            borderRadius: theme.borderRadius.lg,
            borderStyle: 'solid',
            shadowColor: borderColor,
            shadowOffset: { width: 2, height: 2 },
            shadowOpacity: opacity * 0.3,
            shadowRadius: 4,
          };

        default:
          // * Simple dashed border
          return {
            ...baseStyle,
            borderStyle: 'dashed',
            borderRadius: theme.borderRadius.md,
          };
      }
    };

    return (
      <View
        style={[
          styles.container,
          getWebBorderStyle(),
          style
        ]}
        testID={testID}
      >
        {children}
        {variant === 'ornate' && (
          <>
            {/* * Enhanced corner decorations for web */}
            <View style={[styles.cornerDecoration, styles.topLeft, { backgroundColor: borderColor, opacity: opacity * 0.7 }]} />
            <View style={[styles.cornerDecoration, styles.topRight, { backgroundColor: borderColor, opacity: opacity * 0.7 }]} />
            <View style={[styles.cornerDecoration, styles.bottomLeft, { backgroundColor: borderColor, opacity: opacity * 0.7 }]} />
            <View style={[styles.cornerDecoration, styles.bottomRight, { backgroundColor: borderColor, opacity: opacity * 0.7 }]} />
          </>
        )}
      </View>
    );
  }

  // * Mobile fallback using styled Views
  const getMobileBorderStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderColor: borderColor,
      borderWidth: thickness,
      opacity: opacity,
    };

    switch (variant) {
      case 'ornate':
        // * Double border effect for mobile
        return {
          ...baseStyle,
          borderStyle: 'solid',
          borderRadius: theme.borderRadius.lg,
          shadowColor: borderColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: opacity * 0.3,
          shadowRadius: 4,
          elevation: 2,
        };
      
      case 'corner':
        // * Corner accent style
        return {
          ...baseStyle,
          borderTopWidth: thickness * 2,
          borderBottomWidth: thickness * 2,
          borderLeftWidth: thickness,
          borderRightWidth: thickness,
          borderRadius: theme.borderRadius.lg,
        };

      case 'full':
        // * Full decorative border
        return {
          ...baseStyle,
          borderWidth: thickness * 1.5,
          borderRadius: theme.borderRadius.lg,
          borderStyle: Platform.OS === 'ios' ? 'solid' : 'solid',
        };
      
      default:
        // * Simple dashed border
        return {
          ...baseStyle,
          borderStyle: Platform.OS === 'ios' ? 'solid' : 'dashed',
          borderRadius: theme.borderRadius.md,
        };
    }
  };

  // * Mobile implementation using Views
  return (
    <View 
      style={[
        styles.container,
        getMobileBorderStyle(),
        style
      ]} 
      testID={testID}
    >
      {children}
      {variant === 'ornate' && (
        <>
          {/* * Corner decorations for mobile */}
          <View style={[styles.cornerDecoration, styles.topLeft, { backgroundColor: borderColor, opacity: opacity * 0.5 }]} />
          <View style={[styles.cornerDecoration, styles.topRight, { backgroundColor: borderColor, opacity: opacity * 0.5 }]} />
          <View style={[styles.cornerDecoration, styles.bottomLeft, { backgroundColor: borderColor, opacity: opacity * 0.5 }]} />
          <View style={[styles.cornerDecoration, styles.bottomRight, { backgroundColor: borderColor, opacity: opacity * 0.5 }]} />
        </>
      )}
    </View>
  );
});

// * Dynamic styles based on theme
const createStyles = (theme: any) => StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  cornerDecoration: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  topLeft: {
    top: -1,
    left: -1,
  },
  topRight: {
    top: -1,
    right: -1,
  },
  bottomLeft: {
    bottom: -1,
    left: -1,
  },
  bottomRight: {
    bottom: -1,
    right: -1,
  },
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  cornerDecoration: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  topLeft: {
    top: -1,
    left: -1,
  },
  topRight: {
    top: -1,
    right: -1,
  },
  bottomLeft: {
    bottom: -1,
    left: -1,
  },
  bottomRight: {
    bottom: -1,
    right: -1,
  },
});
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

  // * Web implementation using inline SVG
  if (Platform.OS === 'web') {
    const getSVGPattern = () => {
      switch (variant) {
        case 'ornate':
          // * Ornate Celtic knot pattern with interwoven design
          return `
            <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0; pointer-events: none;">
              <defs>
                <pattern id="celtic-ornate" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M30 5 Q35 10 30 15 T30 25 Q25 30 30 35 T30 45 Q35 50 30 55" 
                        stroke="${borderColor}" 
                        stroke-width="${thickness}" 
                        fill="none" 
                        opacity="${opacity}"/>
                  <path d="M5 30 Q10 25 15 30 T25 30 Q30 35 35 30 T45 30 Q50 25 55 30" 
                        stroke="${borderColor}" 
                        stroke-width="${thickness}" 
                        fill="none" 
                        opacity="${opacity}"/>
                  <circle cx="30" cy="30" r="8" 
                          stroke="${borderColor}" 
                          stroke-width="${thickness}" 
                          fill="none" 
                          opacity="${opacity * 0.7}"/>
                </pattern>
              </defs>
              <rect x="${thickness}" y="${thickness}" 
                    width="calc(100% - ${thickness * 2}px)" 
                    height="calc(100% - ${thickness * 2}px)" 
                    fill="none" 
                    stroke="url(#celtic-ornate)"/>
            </svg>
          `;
        
        case 'corner':
          // * Corner-only Celtic decoration
          return `
            <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0; pointer-events: none;">
              <defs>
                <g id="corner-knot">
                  <path d="M5 20 Q5 5 20 5 Q15 10 10 5 Q5 10 10 15 Q15 20 20 15 Q15 20 20 20" 
                        stroke="${borderColor}" 
                        stroke-width="${thickness}" 
                        fill="none" 
                        opacity="${opacity}"/>
                </g>
              </defs>
              <!-- Top left corner -->
              <use href="#corner-knot" x="0" y="0"/>
              <!-- Top right corner -->
              <use href="#corner-knot" x="0" y="0" transform="rotate(90 100% 0)" style="transform-origin: 100% 0;"/>
              <!-- Bottom right corner -->
              <use href="#corner-knot" x="0" y="0" transform="rotate(180 100% 100%)" style="transform-origin: 100% 100%;"/>
              <!-- Bottom left corner -->
              <use href="#corner-knot" x="0" y="0" transform="rotate(270 0 100%)" style="transform-origin: 0 100%;"/>
            </svg>
          `;

        case 'full':
          // * Full border with repeating Celtic pattern
          return `
            <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0; pointer-events: none;">
              <defs>
                <pattern id="celtic-full" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M10 0 L10 10 Q10 20 20 20 Q30 20 30 10 L30 0 
                           M0 10 L10 10 M30 10 L40 10
                           M10 40 L10 30 Q10 20 20 20 Q30 20 30 30 L30 40
                           M0 30 L10 30 M30 30 L40 30" 
                        stroke="${borderColor}" 
                        stroke-width="${thickness}" 
                        fill="none" 
                        opacity="${opacity}"/>
                </pattern>
              </defs>
              <rect x="${thickness}" y="${thickness}" 
                    width="calc(100% - ${thickness * 2}px)" 
                    height="calc(100% - ${thickness * 2}px)" 
                    fill="none" 
                    stroke="${borderColor}"
                    stroke-width="${thickness}"
                    opacity="${opacity}"/>
              <rect x="0" y="0" 
                    width="100%" 
                    height="${thickness * 8}" 
                    fill="url(#celtic-full)"/>
              <rect x="0" y="calc(100% - ${thickness * 8}px)" 
                    width="100%" 
                    height="${thickness * 8}" 
                    fill="url(#celtic-full)"/>
              <rect x="0" y="0" 
                    width="${thickness * 8}" 
                    height="100%" 
                    fill="url(#celtic-full)"/>
              <rect x="calc(100% - ${thickness * 8}px)" y="0" 
                    width="${thickness * 8}" 
                    height="100%" 
                    fill="url(#celtic-full)"/>
            </svg>
          `;
        
        default:
          // * Simple Celtic-inspired border
          return `
            <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0; pointer-events: none;">
              <defs>
                <pattern id="celtic-simple" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="3" 
                          stroke="${borderColor}" 
                          stroke-width="${thickness * 0.5}" 
                          fill="none" 
                          opacity="${opacity * 0.5}"/>
                </pattern>
              </defs>
              <rect x="${thickness}" y="${thickness}" 
                    width="calc(100% - ${thickness * 2}px)" 
                    height="calc(100% - ${thickness * 2}px)" 
                    fill="none" 
                    stroke="${borderColor}"
                    stroke-width="${thickness}"
                    stroke-dasharray="10 5"
                    opacity="${opacity}"/>
              <rect x="${thickness * 2}" y="${thickness * 2}" 
                    width="calc(100% - ${thickness * 4}px)" 
                    height="calc(100% - ${thickness * 4}px)" 
                    fill="url(#celtic-simple)"/>
            </svg>
          `;
      }
    };

    return (
      <View style={[styles.container, style]} testID={testID}>
        {children}
        <div
          dangerouslySetInnerHTML={{ __html: getSVGPattern() }}
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            pointerEvents: 'none',
            borderRadius: 'inherit',
          }}
        />
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
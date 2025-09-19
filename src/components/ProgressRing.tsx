/**
 * ProgressRing.tsx
 * * Circular progress indicator with fantasy-themed colors
 * * Uses SVG for smooth animations and cross-platform support
 * ! IMPORTANT: Requires react-native-svg for mobile platforms
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '../providers/ThemeProvider';

interface ProgressRingProps {
  // * Progress value between 0 and 100
  progress: number;
  // * Size variant for different use cases
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  // * Custom diameter in pixels (overrides size)
  diameter?: number;
  // * Stroke width in pixels
  strokeWidth?: number;
  // * Show percentage text in center
  showPercentage?: boolean;
  // * Custom label below percentage
  label?: string;
  // * Color preset based on element type or attribute
  colorPreset?: 'default' | 'character' | 'location' | 'magic' | 'item' | 'might' | 'swiftness' | 'vitality' | 'finesse';
  // * Custom colors (overrides preset)
  progressColor?: string;
  backgroundColor?: string;
  // * Enable animation
  animated?: boolean;
  // * Animation duration in milliseconds
  animationDuration?: number;
  // * Test ID for testing
  testID?: string;
}

// * Animated circle component for smooth transitions
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress = 0,
  size = 'medium',
  diameter,
  strokeWidth,
  showPercentage = true,
  label,
  colorPreset = 'default',
  progressColor,
  backgroundColor,
  animated = true,
  animationDuration = 500,
  testID = 'progress-ring',
}) => {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  // * Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  // * Size presets
  const sizeMap = {
    small: 48,
    medium: 80,
    large: 120,
    xlarge: 160,
  };
  
  // * Calculate dimensions
  const ringDiameter = diameter || sizeMap[size];
  const ringStrokeWidth = strokeWidth || (ringDiameter / 10);
  const radius = (ringDiameter - ringStrokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // * Get colors based on preset or custom
  const getColors = () => {
    if (progressColor && backgroundColor) {
      return { progress: progressColor, background: backgroundColor };
    }
    
    // * Use theme colors based on preset
    switch (colorPreset) {
      case 'character':
        return {
          progress: theme.colors.elements.character,
          background: theme.colors.surface.backgroundElevated,
        };
      case 'location':
        return {
          progress: theme.colors.elements.location,
          background: theme.colors.surface.backgroundElevated,
        };
      case 'magic':
        return {
          progress: theme.colors.elements.magic,
          background: theme.colors.surface.backgroundElevated,
        };
      case 'item':
        return {
          progress: theme.colors.elements.item,
          background: theme.colors.surface.backgroundElevated,
        };
      case 'might':
        return {
          progress: theme.colors.accent.might,
          background: theme.colors.surface.backgroundElevated,
        };
      case 'swiftness':
        return {
          progress: theme.colors.accent.swiftness,
          background: theme.colors.surface.backgroundElevated,
        };
      case 'vitality':
        return {
          progress: theme.colors.accent.vitality,
          background: theme.colors.surface.backgroundElevated,
        };
      case 'finesse':
        return {
          progress: theme.colors.accent.finesse,
          background: theme.colors.surface.backgroundElevated,
        };
      default:
        return {
          progress: theme.colors.primary.DEFAULT,
          background: theme.colors.surface.backgroundElevated,
        };
    }
  };
  
  const colors = getColors();
  
  // * Animate progress changes
  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: clampedProgress,
        duration: animationDuration,
        useNativeDriver: false, // SVG properties can't use native driver
      }).start();
    } else {
      animatedValue.setValue(clampedProgress);
    }
  }, [clampedProgress, animated, animationDuration, animatedValue]);
  
  // * Calculate stroke dash offset for progress
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });
  
  // * Create dynamic styles
  const styles = createStyles(theme, ringDiameter, size);
  
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.ringContainer}>
        <Svg
          width={ringDiameter}
          height={ringDiameter}
          viewBox={`0 0 ${ringDiameter} ${ringDiameter}`}
          style={styles.svg}
        >
          <G rotation="-90" origin={`${ringDiameter / 2}, ${ringDiameter / 2}`}>
            {/* Background circle */}
            <Circle
              cx={ringDiameter / 2}
              cy={ringDiameter / 2}
              r={radius}
              stroke={colors.background}
              strokeWidth={ringStrokeWidth}
              fill="none"
              opacity={0.3}
            />
            {/* Progress circle */}
            <AnimatedCircle
              cx={ringDiameter / 2}
              cy={ringDiameter / 2}
              r={radius}
              stroke={colors.progress}
              strokeWidth={ringStrokeWidth}
              fill="none"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              testID={`${testID}-progress-circle`}
            />
          </G>
        </Svg>
        
        {/* Percentage text in center */}
        {showPercentage && (
          <View style={styles.textContainer}>
            <Text style={styles.percentageText} testID={`${testID}-percentage`}>
              {Math.round(clampedProgress)}%
            </Text>
            {label && (
              <Text style={styles.labelText} testID={`${testID}-label`}>
                {label}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

// * Style creation function
const createStyles = (theme: any, diameter: number, size: string) => {
  // * Font sizes based on ring size
  const fontSizeMap = {
    small: 12,
    medium: 16,
    large: 24,
    xlarge: 32,
  };
  
  const labelFontSizeMap = {
    small: 10,
    medium: 12,
    large: 14,
    xlarge: 16,
  };
  
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    ringContainer: {
      width: diameter,
      height: diameter,
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    svg: {
      position: 'absolute',
      transform: Platform.OS === 'web' ? [] : [{ rotateZ: '0deg' }],
    },
    textContainer: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    percentageText: {
      fontSize: fontSizeMap[size as keyof typeof fontSizeMap] || 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.heading,
    },
    labelText: {
      fontSize: labelFontSizeMap[size as keyof typeof labelFontSizeMap] || 12,
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.ui,
      marginTop: 2,
    },
  });
};

export default ProgressRing;
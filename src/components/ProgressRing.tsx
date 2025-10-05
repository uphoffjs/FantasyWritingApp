/**
 * ProgressRing.tsx
 * * Circular progress indicator with fantasy-themed colors
 * * Uses SVG for smooth animations and cross-platform support
 * * Enhanced with spring animations, pulse effects, and completion animations
 * ! IMPORTANT: Requires react-native-svg for mobile platforms
 */

import React, { useEffect, useRef, useState } from 'react';
import { Text, StyleSheet, Animated, Platform, Easing } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { getTestProps } from '../utils/react-native-web-polyfills';

// * Helper to safely use theme context
// * Returns null if not within a ThemeProvider
const useOptionalTheme = () => {
  try {

    const { useTheme } = require('../providers/ThemeProvider');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useTheme();
  } catch {
    // ! ThemeProvider not available
    return null;
  }
};

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
  // * Animation type: 'timing' | 'spring' | 'elastic'
  animationType?: 'timing' | 'spring' | 'elastic';
  // * Animation duration in milliseconds
  animationDuration?: number;
  // * Enable pulse animation for loading states
  pulseAnimation?: boolean;
  // * Enable completion animation when reaching 100%
  completionAnimation?: boolean;
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
  animationType = 'timing',
  animationDuration = 500,
  pulseAnimation = false,
  completionAnimation = false,
  testID = 'progress-ring',
}) => {
  const themeContext = useOptionalTheme();
  const theme = themeContext?.theme || {
    // * Fallback theme values when ThemeProvider is not available
    colors: {
      primary: { DEFAULT: '#1C4FA3' },
      surface: { backgroundElevated: '#F5F2E8' },
      text: { primary: '#1A1613', secondary: '#6B5E52' },
      elements: {
        character: '#A31C1C',
        location: '#2E7D4F',
        magic: '#5C2E91',
        item: '#C9A94F',
      }
    }
  };
  const animatedValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const completionScale = useRef(new Animated.Value(1)).current;
  const completionOpacity = useRef(new Animated.Value(1)).current;
  const textScale = useRef(new Animated.Value(1)).current;
  const [hasCompleted, setHasCompleted] = useState(false);
  
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
  
  // * Animate progress changes with different animation types
  useEffect(() => {
    if (animated) {
      let animation;
      
      // * Choose animation type based on prop
      switch (animationType) {
        case 'spring':
          animation = Animated.spring(animatedValue, {
            toValue: clampedProgress,
            friction: 6,
            tension: 40,
            useNativeDriver: false, // SVG properties can't use native driver
          });
          break;
          
        case 'elastic':
          animation = Animated.timing(animatedValue, {
            toValue: clampedProgress,
            duration: animationDuration,
            easing: Easing.elastic(1.2),
            useNativeDriver: false,
          });
          break;
          
        default: // 'timing'
          animation = Animated.timing(animatedValue, {
            toValue: clampedProgress,
            duration: animationDuration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          });
      }
      
      animation.start(() => {
        // * Check for completion and trigger completion animation
        if (clampedProgress === 100 && !hasCompleted && completionAnimation) {
          setHasCompleted(true);
          
          // * Completion celebration animation
          Animated.sequence([
            Animated.parallel([
              // * Scale up and fade out ring
              Animated.timing(completionScale, {
                toValue: 1.1,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(completionOpacity, {
                toValue: 0.8,
                duration: 300,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              // * Scale back to normal
              Animated.spring(completionScale, {
                toValue: 1,
                friction: 3,
                tension: 100,
                useNativeDriver: true,
              }),
              Animated.timing(completionOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
            ]),
            // * Bounce the text
            Animated.sequence([
              Animated.spring(textScale, {
                toValue: 1.2,
                friction: 3,
                tension: 200,
                useNativeDriver: true,
              }),
              Animated.spring(textScale, {
                toValue: 1,
                friction: 3,
                tension: 100,
                useNativeDriver: true,
              }),
            ]),
          ]).start();
        } else if (clampedProgress < 100) {
          // * Reset completion state if progress goes back down
          setHasCompleted(false);
        }
      });
    } else {
      animatedValue.setValue(clampedProgress);
    }
  }, [clampedProgress, animated, animationType, animationDuration, animatedValue, hasCompleted, completionAnimation, completionScale, completionOpacity, textScale]);
  
  // * Pulse animation for loading states
  useEffect(() => {
    if (pulseAnimation && animated) {
      // * Create continuous pulse effect
      const pulseSequence = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      
      pulseSequence.start();
      
      // * Cleanup function to stop animation when component unmounts
      return () => {
        pulseSequence.stop();
        pulseAnim.setValue(1);
      };
    } else {
      // * Reset pulse animation if disabled
      pulseAnim.setValue(1);
    }
  }, [pulseAnimation, animated, pulseAnim]);
  
  // * Calculate stroke dash offset for progress
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });
  
  // * Create dynamic styles
  const styles = createStyles(theme, ringDiameter, size);
  
  return (
    <Animated.View 
      style={[
        styles.container,
        {
          // * Apply completion animation scale and opacity
          transform: [{ scale: completionScale }],
          opacity: completionOpacity,
        }
      ]} 
      {...getTestProps(testID)}
    >
      <Animated.View 
        style={[
          styles.ringContainer,
          {
            // * Apply pulse animation if enabled
            transform: [{ scale: pulseAnim }],
          }
        ]}
      >
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
              {...getTestProps(`${testID}-progress-circle`)}
            />
          </G>
        </Svg>
        
        {/* Percentage text in center */}
        {showPercentage && (
          <Animated.View 
            style={[
              styles.textContainer,
              {
                // * Apply text scale animation for completion
                transform: [{ scale: textScale }],
              }
            ]}
          >
            <Text style={styles.percentageText} {...getTestProps('completion-text')}>
              {Math.round(clampedProgress)}%
            </Text>
            {label && (
              <Text style={styles.labelText} {...getTestProps(`${testID}-label`)}>
                {label}
              </Text>
            )}
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
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
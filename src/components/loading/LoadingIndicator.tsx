/**
 * LoadingIndicator.tsx
 * * Comprehensive loading indicator component with React Native ActivityIndicator
 * * Multiple variants for different loading scenarios
 * * Theme-aware with fantasy-inspired styling
 * ! IMPORTANT: All interactive components must have testID for testing
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';

// * Helper to safely use theme context
// * Returns null if not within a ThemeProvider
const useOptionalTheme = () => {
  try {
    return useTheme();
  } catch {
    // ! ThemeProvider not available during initial app loading
    return null;
  }
};

// * Fallback theme values for when ThemeProvider is not available
const getFallbackTheme = () => ({
  colors: {
    accent: {
      swiftness: '#C9A94F', // gold accent color
    },
    surface: {
      background: '#F3E9D2',
      backgroundElevated: '#E8D9BE',
    },
    text: {
      primary: '#2C2416',
      secondary: '#5A4D3B',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
  },
  borderRadius: {
    lg: 12,
  },
  typography: {
    body: {
      fontFamily: 'System',
    },
    caption: {
      fontFamily: 'System',
    },
  },
});

interface LoadingIndicatorProps {
  // * Loading variant for different contexts
  variant?: 'spinner' | 'dots' | 'bar' | 'ring' | 'overlay';
  // * Size of the indicator
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  // * Optional loading message
  message?: string;
  // * Optional progress value (0-1) for bar/ring variants
  progress?: number;
  // * Color override (uses theme by default)
  color?: string;
  // * Show as fullscreen overlay
  fullscreen?: boolean;
  // * Inline loading (doesn't take full space)
  inline?: boolean;
  // * Custom style overrides
  style?: ViewStyle;
  // * Text style overrides
  textStyle?: TextStyle;
  // * Test ID for testing
  testID?: string;
  // * Accessibility label
  accessibilityLabel?: string;
  // * Animation duration in ms
  animationDuration?: number;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  variant = 'spinner',
  size = 'medium',
  message,
  progress,
  color,
  fullscreen = false,
  inline = false,
  style,
  textStyle,
  testID = 'loading-indicator',
  accessibilityLabel = 'Loading content',
  animationDuration = 1000,
}) => {
  // * Use theme if available, otherwise use fallback values
  const themeContext = useOptionalTheme();
  const theme = themeContext?.theme || getFallbackTheme();
  
  // * Animation values for different effects
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const dotsAnim = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  
  // * Get size dimensions
  const getSizeValue = () => {
    switch (size) {
      case 'small':
        return { indicator: 20, container: 40, fontSize: 12 };
      case 'large':
        return { indicator: 48, container: 96, fontSize: 18 };
      case 'xlarge':
        return { indicator: 64, container: 128, fontSize: 20 };
      case 'medium':
      default:
        return { indicator: 32, container: 64, fontSize: 14 };
    }
  };
  
  const dimensions = getSizeValue();
  const indicatorColor = color || theme.colors.accent.swiftness;
  
  // * Start animations based on variant
  useEffect(() => {
    // * Fade in animation for smooth appearance
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // * Scale animation for entrance
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
    
    // * Continuous rotation for ring variant
    if (variant === 'ring') {
      const rotationAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: animationDuration * 2,
          useNativeDriver: true,
        })
      );
      rotationAnimation.start();
      
      return () => {
        rotationAnimation.stop();
      };
    }
    
    // * Dots animation for dots variant
    if (variant === 'dots') {
      const dotAnimations = dotsAnim.map((anim, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * 200),
            Animated.timing(anim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        )
      );
      
      dotAnimations.forEach(anim => anim.start());
      
      return () => {
        dotAnimations.forEach(anim => anim.stop());
      };
    }
  }, [variant, fadeAnim, scaleAnim, rotateAnim, dotsAnim, animationDuration]);
  
  // * Create dynamic styles
  const styles = createStyles(theme, dimensions, indicatorColor, inline, fullscreen);
  
  // * Render spinner variant (default ActivityIndicator)
  const renderSpinner = () => (
    <ActivityIndicator
      size={size === 'xlarge' ? 'large' : size}
      color={indicatorColor}
      testID={`${testID}-spinner`}
      accessibilityLabel={accessibilityLabel}
    />
  );
  
  // * Render animated dots variant
  const renderDots = () => (
    <View style={styles.dotsContainer} testID={`${testID}-dots`}>
      {dotsAnim.map((anim, index) => (
        <Animated.View
          key={`dot-${index}`}
          style={[
            styles.dot,
            {
              opacity: anim,
              transform: [
                {
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10],
                  }),
                },
              ],
            },
          ]}
          testID={`${testID}-dot-${index}`}
        />
      ))}
    </View>
  );
  
  // * Render progress bar variant
  const renderBar = () => {
    const progressValue = progress || 0;
    return (
      <View style={styles.barContainer} testID={`${testID}-bar`}>
        <View style={styles.barBackground}>
          <Animated.View
            style={[
              styles.barFill,
              {
                width: `${Math.min(100, progressValue * 100)}%`,
              },
            ]}
            testID={`${testID}-bar-fill`}
          />
        </View>
        {progress !== undefined && (
          <Text style={styles.progressText} testID={`${testID}-progress-text`}>
            {Math.round(progressValue * 100)}%
          </Text>
        )}
      </View>
    );
  };
  
  // * Render ring variant (custom circular progress)
  const renderRing = () => {
    const rotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
    
    return (
      <Animated.View
        style={[
          styles.ringContainer,
          {
            transform: [{ rotate: rotation }],
          },
        ]}
        testID={`${testID}-ring`}
      >
        <View style={styles.ring}>
          <View style={styles.ringInner} />
        </View>
      </Animated.View>
    );
  };
  
  // * Get the appropriate loading content based on variant
  const getLoadingContent = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'bar':
        return renderBar();
      case 'ring':
        return renderRing();
      case 'spinner':
      default:
        return renderSpinner();
    }
  };
  
  // * Main content with animations
  const content = (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
      testID={testID}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.indicatorWrapper}>
        {getLoadingContent()}
      </View>
      {message && (
        <Animated.Text
          style={[
            styles.message,
            textStyle,
            {
              opacity: fadeAnim,
            },
          ]}
          testID={`${testID}-message`}
        >
          {message}
        </Animated.Text>
      )}
    </Animated.View>
  );
  
  // * Render with overlay if fullscreen
  if (fullscreen || variant === 'overlay') {
    return (
      <View style={styles.overlay} testID={`${testID}-overlay`}>
        {content}
      </View>
    );
  }
  
  return content;
};

// * Style creation function
const createStyles = (
  theme: any,
  dimensions: { indicator: number; container: number; fontSize: number },
  color: string,
  inline: boolean,
  fullscreen: boolean
) => StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme?.spacing?.md || 16,
    ...(inline ? {} : {
      minHeight: dimensions.container,
      minWidth: dimensions.container,
    }),
    ...(fullscreen ? {} : {
      backgroundColor: theme?.colors?.surface?.background || '#F3E9D2',
      borderRadius: theme?.borderRadius?.lg || 12,
    }),
  },
  indicatorWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    height: dimensions.indicator,
    width: dimensions.indicator,
  },
  message: {
    marginTop: theme?.spacing?.sm || 8,
    fontSize: dimensions.fontSize,
    color: theme?.colors?.text?.primary || '#2C2416',
    textAlign: 'center',
    fontFamily: theme?.typography?.body?.fontFamily || 'System',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: dimensions.indicator / 3,
    height: dimensions.indicator / 3,
    borderRadius: dimensions.indicator / 6,
    backgroundColor: color,
    marginHorizontal: (theme?.spacing?.xs || 4) / 2,
  },
  barContainer: {
    width: dimensions.container * 2,
    alignItems: 'center',
  },
  barBackground: {
    width: '100%',
    height: 8,
    backgroundColor: theme?.colors?.surface?.backgroundElevated || '#E8D9BE',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: color,
    borderRadius: 4,
  },
  progressText: {
    marginTop: theme?.spacing?.xs || 4,
    fontSize: dimensions.fontSize - 2,
    color: theme?.colors?.text?.secondary || '#5A4D3B',
    fontFamily: theme?.typography?.caption?.fontFamily || 'System',
  },
  ringContainer: {
    width: dimensions.indicator,
    height: dimensions.indicator,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    width: dimensions.indicator,
    height: dimensions.indicator,
    borderRadius: dimensions.indicator / 2,
    borderWidth: 3,
    borderColor: color,
    borderStyle: Platform.OS === 'ios' ? 'solid' : 'solid',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  ringInner: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 6,
    height: 6,
    marginTop: -3,
    marginLeft: -3,
    backgroundColor: color,
    borderRadius: 3,
  },
});

export default LoadingIndicator;
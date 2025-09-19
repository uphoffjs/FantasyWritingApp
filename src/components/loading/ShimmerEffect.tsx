/**
 * ShimmerEffect.tsx
 * * Reusable shimmer loading effect component
 * * Creates smooth gradient animation for loading states
 * * Cross-platform support with fallback for native
 * ! IMPORTANT: Uses gradient animation on web, opacity fallback on native
 */

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Animated, 
  StyleSheet,
  Platform,
  ViewStyle,
  Dimensions
} from 'react-native';
// * LinearGradient would be imported here if available
// import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../providers/ThemeProvider';

interface ShimmerEffectProps {
  // * Width of the shimmer area
  width?: number | string;
  // * Height of the shimmer area
  height?: number | string;
  // * Duration of one shimmer cycle in ms
  duration?: number;
  // * Direction of shimmer animation
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  // * Custom base color
  baseColor?: string;
  // * Custom highlight color
  highlightColor?: string;
  // * Enable/disable animation
  animated?: boolean;
  // * Border radius for rounded corners
  borderRadius?: number;
  // * Custom style overrides
  style?: ViewStyle;
  // * Test ID for testing
  testID?: string;
}

export const ShimmerEffect: React.FC<ShimmerEffectProps> = ({
  width = '100%',
  height = 20,
  duration = 1500,
  direction = 'horizontal',
  baseColor,
  highlightColor,
  animated = true,
  borderRadius,
  style,
  testID = 'shimmer-effect',
}) => {
  const { theme } = useTheme();
  const shimmerTranslate = useRef(new Animated.Value(0)).current;
  const shimmerOpacity = useRef(new Animated.Value(0.5)).current;
  
  // * Get screen dimensions for animation bounds
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  // * Define colors based on theme
  const colors = {
    base: baseColor || theme.colors.surface.backgroundElevated,
    highlight: highlightColor || (
      theme.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(255, 255, 255, 0.4)'
    ),
  };
  
  // * Calculate animation end value based on direction
  const getAnimationEndValue = () => {
    switch (direction) {
      case 'vertical':
        return screenHeight;
      case 'diagonal':
        return Math.sqrt(screenWidth * screenWidth + screenHeight * screenHeight);
      case 'horizontal':
      default:
        return screenWidth;
    }
  };
  
  // * Start shimmer animation
  useEffect(() => {
    if (animated) {
      // * Create infinite shimmer animation
      const shimmerAnimation = Animated.loop(
        Animated.parallel([
          // * Translate animation for gradient movement
          Animated.timing(shimmerTranslate, {
            toValue: getAnimationEndValue(),
            duration: duration,
            useNativeDriver: true,
          }),
          // * Opacity animation for pulse effect
          Animated.sequence([
            Animated.timing(shimmerOpacity, {
              toValue: 0.8,
              duration: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(shimmerOpacity, {
              toValue: 0.5,
              duration: duration / 2,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      
      shimmerAnimation.start();
      
      // * Cleanup on unmount
      return () => {
        shimmerAnimation.stop();
        shimmerTranslate.setValue(0);
        shimmerOpacity.setValue(0.5);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated, duration, shimmerTranslate, shimmerOpacity]);
  
  // * Get transform based on direction
  const getTransform = () => {
    switch (direction) {
      case 'vertical':
        return [{ translateY: shimmerTranslate }];
      case 'diagonal':
        return [
          { translateX: shimmerTranslate },
          { translateY: shimmerTranslate },
        ];
      case 'horizontal':
      default:
        return [{ translateX: shimmerTranslate }];
    }
  };
  
  // * Create dynamic styles
  const styles = createStyles(theme, borderRadius);
  
  // * Web implementation with CSS gradient
  if (Platform.OS === 'web') {
    const webGradientStyle: any = {
      backgroundImage: `linear-gradient(
        ${direction === 'vertical' ? '180deg' : direction === 'diagonal' ? '135deg' : '90deg'},
        ${colors.base} 0%,
        ${colors.highlight} 50%,
        ${colors.base} 100%
      )`,
      backgroundSize: direction === 'vertical' ? '100% 200%' : '200% 100%',
      animation: animated ? `shimmer ${duration}ms ease-in-out infinite` : 'none',
    };
    
    return (
      <View 
        style={[
          styles.container,
          { width, height },
          webGradientStyle,
          style,
        ]}
        testID={testID}
      />
    );
  }
  
  // * Native implementation with animated views
  return (
    <View 
      style={[
        styles.container,
        { width, height },
        style,
      ]}
      testID={testID}
    >
      <View style={styles.shimmerBase}>
        <Animated.View
          style={[
            styles.shimmerHighlight,
            {
              opacity: shimmerOpacity,
              transform: getTransform(),
            },
          ]}
        >
          {/* * Fallback to solid color shimmer since LinearGradient is not available */}
          <View 
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: colors.highlight }
            ]}
          />
        </Animated.View>
      </View>
    </View>
  );
};

// * Style creation function
const createStyles = (theme: any, borderRadius?: number) => {
  // * Add web animation keyframes
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.innerHTML = `
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `;
    if (!document.head.querySelector('#shimmer-animation')) {
      styleSheet.id = 'shimmer-animation';
      document.head.appendChild(styleSheet);
    }
  }
  
  return StyleSheet.create({
    container: {
      overflow: 'hidden',
      backgroundColor: theme.colors.surface.backgroundElevated,
      borderRadius: borderRadius || theme.borderRadius.sm,
    },
    shimmerBase: {
      flex: 1,
      overflow: 'hidden',
    },
    shimmerHighlight: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
  });
};

export default ShimmerEffect;
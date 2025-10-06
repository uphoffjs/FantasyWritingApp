/**
 * SkeletonCard.tsx
 * * Skeleton loading component for cards
 * * Uses shimmer animation for better loading UX
 * * Cross-platform support with React Native
 * ! IMPORTANT: All interactive components must have testID for testing
 */

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  
  ViewStyle
} from 'react-native';
import { useTheme, Theme } from '../../providers/ThemeProvider';

import { getTestProps } from '../utils/react-native-web-polyfills';
interface SkeletonCardProps {
  // * Card variant for different sizes
  variant?: 'project' | 'element' | 'compact';
  // * Enable shimmer animation
  animated?: boolean;
  // * Custom width (overrides variant)
  width?: number | string;
  // * Custom height (overrides variant)
  height?: number | string;
  // * Number of skeleton lines to show
  lines?: number;
  // * Show thumbnail/avatar skeleton
  showThumbnail?: boolean;
  // * Custom style overrides
  style?: ViewStyle;
  // * Test ID for testing
  testID?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  variant = 'project',
  animated = true,
  width,
  height,
  lines = 3,
  showThumbnail = true,
  style,
  testID = 'skeleton-card',
}) => {
  const { theme } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  
  // * Start shimmer animation
  useEffect(() => {
    if (animated) {
      // * Create infinite loop animation for shimmer effect
      const shimmerAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      
      shimmerAnimation.start();
      
      // * Cleanup animation on unmount
      return () => {
        shimmerAnimation.stop();
      };
    }
  }, [animated, shimmerAnim]);
  
  // * Get dimensions based on variant
  const getDimensions = () => {
    switch (variant) {
      case 'element':
        return { width: '100%', height: 140 };
      case 'compact':
        return { width: '100%', height: 80 };
      case 'project':
      default:
        return { width: '100%', height: 200 };
    }
  };
  
  const dimensions = getDimensions();
  const finalWidth = width || dimensions.width;
  const finalHeight = height || dimensions.height;
  
  // * Create interpolated opacity for shimmer effect
  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });
  
  // * Create dynamic styles
  const styles = createStyles(theme);
  
  // * Render skeleton lines
  const renderSkeletonLines = () => {
    const skeletonLines = [];
    for (let i = 0; i < lines; i++) {
      const isLastLine = i === lines - 1;
      skeletonLines.push(
        <Animated.View
          key={`skeleton-line-${i}`}
          style={[
            styles.skeletonLine,
            isLastLine && styles.skeletonLineShort,
            animated && { opacity: shimmerOpacity },
          ]}
          {...getTestProps(`${testID}-line-${i}`)}
        />
      );
    }
    return skeletonLines;
  };
  
  return (
    <View 
      style={[
        styles.container,
        { width: finalWidth, height: finalHeight },
        style,
      ]}
      {...getTestProps(testID)}
    >
      {/* * Card header with thumbnail */}
      {showThumbnail && (
        <View style={styles.header}>
          <Animated.View
            style={[
              styles.thumbnail,
              animated && { opacity: shimmerOpacity },
            ]}
            {...getTestProps(`${testID}-thumbnail`)}
          />
          <View style={styles.headerContent}>
            <Animated.View
              style={[
                styles.title,
                animated && { opacity: shimmerOpacity },
              ]}
              {...getTestProps(`${testID}-title`)}
            />
            <Animated.View
              style={[
                styles.subtitle,
                animated && { opacity: shimmerOpacity },
              ]}
              {...getTestProps(`${testID}-subtitle`)}
            />
          </View>
        </View>
      )}
      
      {/* * Card body with skeleton lines */}
      <View style={styles.body}>
        {renderSkeletonLines()}
      </View>
      
      {/* * Card footer */}
      {variant === 'project' && (
        <View style={styles.footer}>
          <Animated.View
            style={[
              styles.footerItem,
              animated && { opacity: shimmerOpacity },
            ]}
            {...getTestProps(`${testID}-footer-left`)}
          />
          <Animated.View
            style={[
              styles.footerItem,
              animated && { opacity: shimmerOpacity },
            ]}
            {...getTestProps(`${testID}-footer-right`)}
          />
        </View>
      )}
    </View>
  );
};

// * Style creation function
const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    // * Use React Native shadow properties for all platforms
    shadowColor: theme.colors.shadow.DEFAULT || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface.backgroundElevated,
    marginRight: theme.spacing.sm,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    height: 20,
    width: '70%',
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface.backgroundElevated,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    height: 16,
    width: '40%',
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface.backgroundElevated,
  },
  body: {
    marginVertical: theme.spacing.sm,
  },
  skeletonLine: {
    height: 14,
    width: '100%',
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface.backgroundElevated,
    marginVertical: theme.spacing.xs,
  },
  skeletonLineShort: {
    width: '60%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface.border,
  },
  footerItem: {
    height: 16,
    width: 80,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface.backgroundElevated,
  },
});

export default SkeletonCard;
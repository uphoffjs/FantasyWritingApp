/**
 * SkeletonList.tsx
 * * Skeleton loading component for lists of cards
 * * Renders multiple skeleton cards with staggered animations
 * * Mobile-first responsive design with cross-platform support
 * ! IMPORTANT: Uses SkeletonCard component for individual items
 */

import React from 'react';
import { 
  View, 
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  ViewStyle
} from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { SkeletonCard } from './SkeletonCard';

import { getTestProps } from '../utils/react-native-web-polyfills';
interface SkeletonListProps {
  // * Number of skeleton items to render
  count?: number;
  // * Card variant to use
  variant?: 'project' | 'element' | 'compact';
  // * Layout direction
  direction?: 'vertical' | 'horizontal' | 'grid';
  // * Number of columns for grid layout
  columns?: number;
  // * Enable staggered animation
  staggered?: boolean;
  // * Delay between staggered animations (ms)
  staggerDelay?: number;
  // * Custom container style
  style?: ViewStyle;
  // * Test ID for testing
  testID?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 3,
  variant = 'project',
  direction = 'vertical',
  columns = 2,
  staggered = true,
  staggerDelay = 100,
  style,
  testID = 'skeleton-list',
}) => {
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  
  // * Determine if we should use grid layout based on screen size
  const isTablet = screenWidth >= 768;
  const isDesktop = screenWidth >= 1024;
  
  // * Calculate responsive columns for grid
  const getResponsiveColumns = () => {
    if (direction !== 'grid') return 1;
    
    if (isDesktop) return columns + 1;
    if (isTablet) return columns;
    return 1; // Mobile always single column
  };
  
  const responsiveColumns = getResponsiveColumns();
  
  // * Create dynamic styles
  const styles = createStyles(theme, direction, responsiveColumns);
  
  // * Render skeleton items
  const renderSkeletonItems = () => {
    const items = [];
    
    for (let i = 0; i < count; i++) {
      // * Calculate animation delay for staggered effect
      const animationDelay = staggered ? i * staggerDelay : 0;
      
      items.push(
        <View 
          key={`skeleton-item-${i}`}
          style={[
            styles.itemContainer,
            direction === 'grid' && styles.gridItem,
          ]}
        >
          <SkeletonCard
            variant={variant}
            animated={true}
            {...getTestProps(`${testID}-item-${i}`)}
            style={{
              // * Add animation delay for staggered effect
              animationDelay: `${animationDelay}ms`,
            }}
          />
        </View>
      );
    }
    
    return items;
  };
  
  // * Horizontal scroll view for horizontal layout
  if (direction === 'horizontal') {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.horizontalContainer, style]}
        {...getTestProps(testID)}
      >
        {renderSkeletonItems()}
      </ScrollView>
    );
  }
  
  // * Grid or vertical layout
  return (
    <View 
      style={[
        styles.container,
        direction === 'grid' && styles.gridContainer,
        style,
      ]}
      {...getTestProps(testID)}
    >
      {renderSkeletonItems()}
    </View>
  );
};

// * Style creation function
const createStyles = (theme: any, direction: string, columns: number) => {
  const itemWidth = direction === 'grid' 
    ? `${Math.floor(100 / columns) - 2}%` 
    : '100%';
  
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.md,
    },
    horizontalContainer: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    itemContainer: {
      marginBottom: theme.spacing.md,
    },
    gridItem: {
      width: itemWidth,
      minWidth: 280, // * Minimum width for readability
      paddingHorizontal: theme.spacing.xs,
    },
  });
};

/**
 * ContentLoader - Wrapper component that shows skeleton or content
 * * Convenience component for loading states
 */
interface ContentLoaderProps {
  // * Loading state
  loading: boolean;
  // * Content to show when not loading
  children: React.ReactNode;
  // * Skeleton configuration
  skeleton?: {
    count?: number;
    variant?: 'project' | 'element' | 'compact';
    direction?: 'vertical' | 'horizontal' | 'grid';
  };
  // * Test ID for testing
  testID?: string;
}

export const ContentLoader: React.FC<ContentLoaderProps> = ({
  loading,
  children,
  skeleton = {},
  testID = 'content-loader',
}) => {
  if (loading) {
    return (
      <SkeletonList 
        {...skeleton}
        {...getTestProps(`${testID}-skeleton`)}
      />
    );
  }
  
  return (
    <View {...getTestProps(`${testID}-content`)}>
      {children}
    </View>
  );
};

export default SkeletonList;
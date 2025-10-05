/**
 * StatsCard.tsx
 * * Card component for displaying metrics with icons and trend indicators
 * * Supports various metric types with animated number transitions
 * ! IMPORTANT: Uses fantasy theme colors for categories
 */

import React, { useEffect, useRef, memo } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';

import { getTestProps } from '../utils/react-native-web-polyfills';
interface StatsCardProps {
  // * Main metric value
  value: number | string;
  // * Previous value for trend calculation
  previousValue?: number;
  // * Label for the metric
  label: string;
  // * Icon to display (emoji or symbol)
  icon?: string;
  // * Category for color theming
  category?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'character' | 'location' | 'magic' | 'item';
  // * Trend indicator
  trend?: 'up' | 'down' | 'stable' | 'none';
  // * Show trend percentage
  showTrendPercentage?: boolean;
  // * Unit suffix (e.g., 'words', 'chapters')
  unit?: string;
  // * Card size variant
  size?: 'small' | 'medium' | 'large';
  // * Enable number animation
  animated?: boolean;
  // * Make card pressable
  onPress?: () => void;
  // * Custom background color
  backgroundColor?: string;
  // * Show border
  showBorder?: boolean;
  // * Test ID
  testID?: string;
}

export const StatsCard: React.FC<StatsCardProps> = memo(({
  value,
  previousValue,
  label,
  icon,
  category = 'default',
  trend = 'none',
  showTrendPercentage = true,
  unit,
  size = 'medium',
  animated = true,
  onPress,
  backgroundColor,
  showBorder = true,
  testID = 'stats-card',
}) => {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  
  // * Calculate trend if previous value is provided
  const calculateTrend = () => {
    if (previousValue !== undefined && typeof value === 'number') {
      const difference = value - previousValue;
      const percentage = previousValue !== 0 ? (difference / previousValue) * 100 : 0;
      
      if (difference > 0) return { direction: 'up' as const, percentage };
      if (difference < 0) return { direction: 'down' as const, percentage: Math.abs(percentage) };
      return { direction: 'stable' as const, percentage: 0 };
    }
    return null;
  };
  
  const trendData = trend === 'none' ? null : calculateTrend();
  const actualTrend = trendData ? trendData.direction : trend;
  
  // * Get category color
  const getCategoryColor = () => {
    switch (category) {
      case 'success':
        return theme.colors.accent.vitality;
      case 'warning':
        return theme.colors.semantic.dragonfire;
      case 'danger':
        return theme.colors.semantic.danger;
      case 'info':
        return theme.colors.accent.swiftness;
      case 'character':
        return theme.colors.elements.character;
      case 'location':
        return theme.colors.elements.location;
      case 'magic':
        return theme.colors.elements.magic;
      case 'item':
        return theme.colors.elements.item;
      default:
        return theme.colors.primary.DEFAULT;
    }
  };
  
  // * Get trend icon and color
  const getTrendInfo = () => {
    switch (actualTrend) {
      case 'up':
        return { icon: '↑', color: theme.colors.accent.vitality };
      case 'down':
        return { icon: '↓', color: theme.colors.semantic.danger };
      case 'stable':
        return { icon: '→', color: theme.colors.text.secondary };
      default:
        return null;
    }
  };
  
  const categoryColor = getCategoryColor();
  const trendInfo = getTrendInfo();
  
  // * Animate value changes
  useEffect(() => {
    if (animated && typeof value === 'number') {
      Animated.timing(animatedValue, {
        toValue: value,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [value, animated, animatedValue]);
  
  // * Handle press animation
  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };
  
  // * Format number with commas
  const formatNumber = (num: number | string) => {
    if (typeof num === 'number') {
      return num.toLocaleString();
    }
    return num;
  };
  
  // * Create dynamic styles
  const styles = createStyles(theme, size, categoryColor, backgroundColor, showBorder);
  
  const CardContent = () => (
    <>
      {/* Icon and Label Row */}
      <View style={styles.headerRow}>
        {icon && (
          <Text style={styles.icon} {...getTestProps(`${testID}-icon`)}>
            {icon}
          </Text>
        )}
        <Text style={styles.label} {...getTestProps(`${testID}-label`)}>
          {label}
        </Text>
      </View>
      
      {/* Value Row */}
      <View style={styles.valueRow}>
        <Text style={styles.value} {...getTestProps(`${testID}-value`)}>
          {animated && typeof value === 'number' ? (
            <AnimatedNumber value={animatedValue} />
          ) : (
            formatNumber(value)
          )}
          {unit && <Text style={styles.unit}> {unit}</Text>}
        </Text>
      </View>
      
      {/* Trend Row */}
      {trendInfo && (
        <View style={styles.trendRow}>
          <Text style={[styles.trendIcon, { color: trendInfo.color }]} {...getTestProps(`${testID}-trend-icon`)}>
            {trendInfo.icon}
          </Text>
          {showTrendPercentage && trendData && trendData.percentage !== 0 && (
            <Text style={[styles.trendPercentage, { color: trendInfo.color }]} {...getTestProps(`${testID}-trend-percentage`)}>
              {trendData.percentage.toFixed(1)}%
            </Text>
          )}
        </View>
      )}
    </>
  );
  
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        {...getTestProps(testID)}
      >
        <Animated.View style={[styles.container, { transform: [{ scale: scaleValue }] }]}>
          <CardContent />
        </Animated.View>
      </TouchableOpacity>
    );
  }
  
  return (
    <View style={styles.container} {...getTestProps(testID)}>
      <CardContent />
    </View>
  );
});

// * Animated number component for smooth transitions
const AnimatedNumber: React.FC<{ value: Animated.Value }> = ({ value }) => {
  const [displayValue, setDisplayValue] = React.useState('0');
  
  useEffect(() => {
    const listener = value.addListener(({ value: v }) => {
      setDisplayValue(Math.round(v).toLocaleString());
    });
    
    return () => {
      value.removeListener(listener);
    };
  }, [value]);
  
  return <>{displayValue}</>;
};

// * Style creation function
const createStyles = (
  theme: any,
  size: string,
  categoryColor: string,
  backgroundColor?: string,
  showBorder?: boolean
) => {
  // * Size configurations
  const sizeConfig = {
    small: {
      padding: 12,
      iconSize: 16,
      labelSize: 12,
      valueSize: 20,
      unitSize: 14,
      trendSize: 12,
      minWidth: 120,
    },
    medium: {
      padding: 16,
      iconSize: 20,
      labelSize: 14,
      valueSize: 28,
      unitSize: 16,
      trendSize: 14,
      minWidth: 160,
    },
    large: {
      padding: 20,
      iconSize: 24,
      labelSize: 16,
      valueSize: 36,
      unitSize: 20,
      trendSize: 16,
      minWidth: 200,
    },
  };
  
  const config = sizeConfig[size as keyof typeof sizeConfig];
  
  return StyleSheet.create({
    container: {
      backgroundColor: backgroundColor || theme.colors.surface.card,
      borderRadius: theme.borderRadius.lg,
      padding: config.padding,
      minWidth: config.minWidth,
      borderWidth: showBorder ? 1 : 0,
      borderColor: theme.colors.primary.borderLight,
      // * Shadow for elevation
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.effects.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
        web: {
          // * Web-specific shadow styling
          shadowColor: theme.colors.effects.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          // @ts-expect-error - boxShadow is web-specific
          boxShadow: `0 2px 4px ${theme.colors.effects.shadow}20`,
        },
        default: {},
      }),
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    icon: {
      fontSize: config.iconSize,
      marginRight: 8,
    },
    label: {
      fontSize: config.labelSize,
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.ui,
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: 4,
    },
    value: {
      fontSize: config.valueSize,
      color: categoryColor,
      fontFamily: theme.typography.fontFamily.heading,
      fontWeight: '700',
    },
    unit: {
      fontSize: config.unitSize,
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.ui,
      marginLeft: 4,
    },
    trendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    trendIcon: {
      fontSize: config.trendSize,
      fontWeight: 'bold',
      marginRight: 4,
    },
    trendPercentage: {
      fontSize: config.trendSize - 2,
      fontFamily: theme.typography.fontFamily.ui,
      fontWeight: '600',
    },
  });
};

export default memo(StatsCard);
import React, { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useTheme } from '../providers/ThemeProvider';

type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  showLabels?: boolean;
  size?: 'small' | 'medium' | 'large';
  testID?: string;
}

export const ViewToggle = React.memo(function ViewToggle({
  currentView,
  onViewChange,
  showLabels = false,
  size = 'medium',
  testID = 'view-toggle',
}: ViewToggleProps) {
  const { theme } = useTheme();
  
  // * Animation value for smooth transitions
  const slideAnim = React.useRef(new Animated.Value(currentView === 'grid' ? 0 : 1)).current;
  
  // * Create dynamic styles based on theme
  const styles = useMemo(() => createStyles(theme, size), [theme, size]);
  
  // * Handle view change with animation
  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: currentView === 'grid' ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [currentView, slideAnim]);
  
  // * Calculate indicator position based on animation
  const indicatorTranslateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, styles.button.width],
  });
  
  // * Icon sizes based on toggle size
  const iconSize = {
    small: 16,
    medium: 20,
    large: 24,
  }[size];
  
  return (
    <View style={styles.container} testID={testID}>
      {/* * Sliding indicator for active state */}
      <Animated.View 
        style={[
          styles.indicator,
          {
            transform: [{ translateX: indicatorTranslateX }],
          },
        ]}
        testID={`${testID}-indicator`}
      />
      
      {/* * Grid view button */}
      <Pressable
        onPress={() => onViewChange('grid')}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        testID={`${testID}-grid`}
        accessibilityRole="button"
        accessibilityLabel="Grid view"
        accessibilityState={{ selected: currentView === 'grid' }}
      >
        {/* * Grid icon using text symbols */}
        <Text 
          style={[
            styles.icon,
            { fontSize: iconSize },
            currentView === 'grid' && styles.iconActive,
          ]}
          testID={`${testID}-grid-icon`}
        >
          ⊞
        </Text>
        {showLabels && (
          <Text 
            style={[
              styles.label,
              currentView === 'grid' && styles.labelActive,
            ]}
            testID={`${testID}-grid-label`}
          >
            Grid
          </Text>
        )}
      </Pressable>
      
      {/* * List view button */}
      <Pressable
        onPress={() => onViewChange('list')}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        testID={`${testID}-list`}
        accessibilityRole="button"
        accessibilityLabel="List view"
        accessibilityState={{ selected: currentView === 'list' }}
      >
        {/* * List icon using text symbols */}
        <Text 
          style={[
            styles.icon,
            { fontSize: iconSize },
            currentView === 'list' && styles.iconActive,
          ]}
          testID={`${testID}-list-icon`}
        >
          ☰
        </Text>
        {showLabels && (
          <Text 
            style={[
              styles.label,
              currentView === 'list' && styles.labelActive,
            ]}
            testID={`${testID}-list-label`}
          >
            List
          </Text>
        )}
      </Pressable>
    </View>
  );
});

// * Size configurations for different contexts
const getSizeConfig = (size: 'small' | 'medium' | 'large') => {
  const configs = {
    small: {
      buttonWidth: 36,
      buttonHeight: 28,
      containerPadding: 2,
      borderRadius: 14,
    },
    medium: {
      buttonWidth: 44,
      buttonHeight: 36,
      containerPadding: 3,
      borderRadius: 18,
    },
    large: {
      buttonWidth: 52,
      buttonHeight: 44,
      containerPadding: 4,
      borderRadius: 22,
    },
  };
  return configs[size];
};

// * Dynamic style creation based on theme and size
const createStyles = (theme: any, size: 'small' | 'medium' | 'large') => {
  const sizeConfig = getSizeConfig(size);
  
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface.backgroundElevated,
      borderRadius: sizeConfig.borderRadius,
      padding: sizeConfig.containerPadding,
      borderWidth: 1,
      borderColor: theme.colors.primary.borderLight,
      position: 'relative',
      // * Fantasy theme shadow
      shadowColor: theme.colors.effects.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    button: {
      width: sizeConfig.buttonWidth,
      height: sizeConfig.buttonHeight,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
      flexDirection: 'row',
      gap: theme.spacing.xs / 2,
    },
    buttonPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.95 }],
    },
    indicator: {
      position: 'absolute',
      top: sizeConfig.containerPadding,
      left: sizeConfig.containerPadding,
      width: sizeConfig.buttonWidth,
      height: sizeConfig.buttonHeight,
      backgroundColor: theme.colors.primary.background,
      borderRadius: sizeConfig.borderRadius - 2,
      zIndex: 1,
      // * Metallic sheen for fantasy theme
      borderWidth: 1,
      borderColor: theme.colors.metal.gold + '30',
      // * Platform-specific glow effect
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.attributes.swiftness,
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.2,
          shadowRadius: 2,
        },
        android: {
          elevation: 3,
        },
        web: {
          boxShadow: `0 1px 3px ${theme.colors.attributes.swiftness}33`,
        },
      }),
    },
    icon: {
      color: theme.colors.text.secondary,
      fontWeight: '600',
    },
    iconActive: {
      color: theme.colors.attributes.swiftness,
      fontWeight: '700',
    },
    label: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.regular,
    },
    labelActive: {
      color: theme.colors.attributes.swiftness,
      fontFamily: theme.typography.fontFamily.bold,
      fontWeight: '600',
    },
  });
};

export default ViewToggle;
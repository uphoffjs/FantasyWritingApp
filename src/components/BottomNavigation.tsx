import React, { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets, EdgeInsets } from 'react-native-safe-area-context';
import { useTheme, Theme } from '../providers/ThemeProvider';

import { getTestProps } from '../utils/react-native-web-polyfills';
interface TabItem {
  id: string;
  label: string;
  icon: string;
  testId: string;
}

interface BottomNavigationProps {
  activeTab: string;
  onTabPress: (tabId: string) => void;
  tabs?: TabItem[];
}

// * Default tab configuration with fantasy-themed icons
const defaultTabs: TabItem[] = [
  { id: 'projects', label: 'Projects', icon: '📚', testId: 'tab-projects' },
  { id: 'elements', label: 'Elements', icon: '🗂️', testId: 'tab-elements' },
  { id: 'tools', label: 'Tools', icon: '🛠️', testId: 'tab-tools' },
  { id: 'settings', label: 'Settings', icon: '⚙️', testId: 'tab-settings' },
];

export const BottomNavigation = React.memo(function BottomNavigation({
  activeTab,
  onTabPress,
  tabs = defaultTabs,
}: BottomNavigationProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  // * Create dynamic styles based on theme
  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);
  
  // * Only show on mobile platforms
  if (Platform.OS === 'web') {
    // ! On web, navigation is handled by sidebar/header
    return null;
  }
  
  return (
    <View style={styles.container} {...getTestProps('bottom-navigation')}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <Pressable
            key={tab.id}
            onPress={() => onTabPress(tab.id)}
            style={({ pressed }) => [
              styles.tab,
              isActive && styles.tabActive,
              pressed && styles.tabPressed,
            ]}
            {...getTestProps(tab.testId)}
            accessibilityRole="button"
            accessibilityLabel={`Navigate to ${tab.label}`}
            accessibilityState={{ selected: isActive }}
          >
            {/* * Tab icon with active state color */}
            <Text 
              style={[
                styles.tabIcon,
                isActive && styles.tabIconActive,
              ]}
              {...getTestProps(`${tab.testId}-icon`)}
            >
              {tab.icon}
            </Text>
            
            {/* * Tab label with active state styling */}
            <Text
              style={[
                styles.tabLabel,
                isActive && styles.tabLabelActive,
              ]}
              numberOfLines={1}
              {...getTestProps(`${tab.testId}-label`)}
            >
              {tab.label}
            </Text>
            
            {/* * Active indicator using theme attribute colors */}
            {isActive && (
              <View 
                style={styles.activeIndicator}
                {...getTestProps(`${tab.testId}-active-indicator`)}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
});

// * Dynamic style creation with theme and safe area support
const createStyles = (theme: Theme, insets: EdgeInsets) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.primary.borderLight,
    paddingBottom: insets.bottom || theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    // * Fantasy theme shadow effect
    shadowColor: theme.colors.effects.shadow,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    position: 'relative',
  },
  tabActive: {
    // * No background change, handled by active indicator
  },
  tabPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs / 2,
    color: theme.colors.text.secondary,
  },
  tabIconActive: {
    // * Use attribute color for active state
    color: theme.colors.attributes.swiftness,
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.regular,
  },
  tabLabelActive: {
    color: theme.colors.attributes.swiftness,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    backgroundColor: theme.colors.attributes.swiftness,
    borderTopLeftRadius: theme.borderRadius.sm,
    borderTopRightRadius: theme.borderRadius.sm,
    // * Subtle golden glow for fantasy theme
    shadowColor: theme.colors.metal.gold,
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
});

export default BottomNavigation;
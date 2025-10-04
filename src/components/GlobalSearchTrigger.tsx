/**
 * GlobalSearchTrigger.tsx
 * Component that handles global keyboard shortcut (Cmd+K or Ctrl+K) to open search
 * Also provides a search button for mobile/touch interfaces
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { GlobalSearch } from './GlobalSearch';
import { useTheme } from '../providers/ThemeProvider';
import { getTestProps } from '../utils/react-native-web-polyfills';

interface GlobalSearchTriggerProps {
  // * Optional custom trigger button (if not provided, uses default)
  customTrigger?: React.ReactNode;
  // * Whether to show the floating search button
  showFloatingButton?: boolean;
  // * Position of floating button
  floatingButtonPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function GlobalSearchTrigger({
  customTrigger,
  showFloatingButton = false,
  floatingButtonPosition = 'bottom-right',
}: GlobalSearchTriggerProps) {
  const { theme } = useTheme();
  const [searchVisible, setSearchVisible] = useState(false);

  // * Add global keyboard shortcut listener
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyDown = (event: KeyboardEvent) => {
        // * Check for Command+K (Mac) or Ctrl+K (Windows/Linux)
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
          event.preventDefault();
          setSearchVisible(true);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  const openSearch = () => {
    setSearchVisible(true);
  };

  const closeSearch = () => {
    setSearchVisible(false);
  };

  const styles = getStyles(theme, floatingButtonPosition);

  // * If custom trigger provided, use it
  if (customTrigger) {
    return (
      <>
        <Pressable onPress={openSearch} {...getTestProps('global-search-trigger-custom')}>
          {customTrigger}
        </Pressable>
        <GlobalSearch visible={searchVisible} onClose={closeSearch} />
      </>
    );
  }

  // * If floating button requested, show it
  if (showFloatingButton) {
    return (
      <>
        <Pressable
          style={({ pressed }) => [
            styles.floatingButton,
            pressed && styles.floatingButtonPressed,
          ]}
          onPress={openSearch}
          {...getTestProps('global-search-trigger-floating')}
        >
          <Text style={styles.floatingButtonIcon}>🔍</Text>
        </Pressable>
        <GlobalSearch visible={searchVisible} onClose={closeSearch} />
      </>
    );
  }

  // * Otherwise just render the GlobalSearch modal (keyboard shortcut only)
  return <GlobalSearch visible={searchVisible} onClose={closeSearch} />;
}

// * Header search button component for easy integration
export function HeaderSearchButton() {
  const { theme } = useTheme();
  const [searchVisible, setSearchVisible] = useState(false);
  const styles = getStyles(theme, 'bottom-right');

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.headerButton,
          pressed && styles.headerButtonPressed,
        ]}
        onPress={() => setSearchVisible(true)}
        {...getTestProps('header-search-button')}
      >
        <Text style={styles.headerButtonIcon}>🔍</Text>
        {Platform.OS === 'web' && (
          <View style={styles.shortcutBadge}>
            <Text style={styles.shortcutText}>⌘K</Text>
          </View>
        )}
      </Pressable>
      <GlobalSearch visible={searchVisible} onClose={() => setSearchVisible(false)} />
    </>
  );
}

// * Create theme-aware styles
const getStyles = (theme: any, position: string) => {
  const floatingPositions: any = {
    'bottom-right': { bottom: 24, right: 24 },
    'bottom-left': { bottom: 24, left: 24 },
    'top-right': { top: 24, right: 24 },
    'top-left': { top: 24, left: 24 },
  };

  return StyleSheet.create({
    floatingButton: {
      position: 'absolute',
      ...floatingPositions[position],
      width: 56,
      height: 56,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.button.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.colors.effects.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      zIndex: 1000,
    },
    floatingButtonPressed: {
      backgroundColor: theme.colors.button.primaryPressed,
      transform: [{ scale: 0.95 }],
    },
    floatingButtonIcon: {
      fontSize: 24,
    },
    headerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.surface.backgroundAlt,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.primary.borderLight,
    },
    headerButtonPressed: {
      backgroundColor: theme.colors.surface.cardHover,
      borderColor: theme.colors.metal.gold,
    },
    headerButtonIcon: {
      fontSize: 18,
      marginRight: Platform.OS === 'web' ? theme.spacing.xs : 0,
    },
    shortcutBadge: {
      backgroundColor: theme.colors.surface.backgroundElevated,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.primary.borderLight,
    },
    shortcutText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.ui,
      fontWeight: theme.typography.fontWeight.medium as any,
    },
  });
};
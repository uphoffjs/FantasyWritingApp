/**
 * AppShell.tsx
 * Responsive layout component providing adaptive layouts for desktop, tablet, and mobile
 * - Desktop: 3-column layout (sidebar | content | inspector)
 * - Tablet: 2-column layout (collapsible sidebar | content)
 * - Mobile: Single column with bottom navigation
 */

import React, { useState, useMemo, ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
  ScrollView,
  Animated,
} from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';

import { getTestProps } from '../utils/react-native-web-polyfills';
// * Breakpoint constants for responsive layout
const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
};

interface AppShellProps {
  // * Main content area
  children: ReactNode;
  // * Sidebar content (navigation, file explorer, etc.)
  sidebar?: ReactNode;
  // * Inspector panel content (properties, details, etc.)
  inspector?: ReactNode;
  // * Bottom navigation for mobile
  bottomNav?: ReactNode;
  // * Header content
  header?: ReactNode;
  // * Control sidebar visibility
  sidebarVisible?: boolean;
  onSidebarToggle?: () => void;
  // * Control inspector visibility
  inspectorVisible?: boolean;
  onInspectorToggle?: () => void;
  // * Current page title
  title?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  sidebar,
  inspector,
  bottomNav,
  header,
  sidebarVisible = true,
  onSidebarToggle,
  inspectorVisible = true,
  onInspectorToggle,
  title = 'Fantasy Writing App',
}) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  
  // * Determine device type based on screen width
  const deviceType = useMemo(() => {
    if (width < BREAKPOINTS.mobile) return 'mobile';
    if (width < BREAKPOINTS.tablet) return 'tablet';
    return 'desktop';
  }, [width]);

  // * Animation values for sidebar slide
  const [sidebarAnimation] = useState(new Animated.Value(sidebarVisible ? 0 : -300));
  const [inspectorAnimation] = useState(new Animated.Value(inspectorVisible ? 0 : 300));

  // * Toggle sidebar with animation
  React.useEffect(() => {
    Animated.timing(sidebarAnimation, {
      toValue: sidebarVisible ? 0 : -300,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [sidebarVisible, sidebarAnimation]);

  // * Toggle inspector with animation
  React.useEffect(() => {
    Animated.timing(inspectorAnimation, {
      toValue: inspectorVisible ? 0 : 300,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [inspectorVisible, inspectorAnimation]);

  // * Create dynamic styles based on theme
  const styles = useMemo(() => createStyles(theme, deviceType), [theme, deviceType]);

  // * Mobile Layout - Single column with bottom navigation
  if (deviceType === 'mobile') {
    return (
      <View style={styles.container} {...getTestProps('app-shell-mobile')}>
        {/* Mobile Header */}
        <View style={styles.mobileHeader} {...getTestProps('mobile-header')}>
          <TouchableOpacity
            onPress={onSidebarToggle}
            style={styles.menuButton}
            {...getTestProps('mobile-menu-button')}
            accessibilityLabel="Toggle menu"
            accessibilityRole="button"
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          {inspector && (
            <TouchableOpacity
              onPress={onInspectorToggle}
              style={styles.menuButton}
              {...getTestProps('mobile-inspector-button')}
              accessibilityLabel="Toggle inspector"
              accessibilityRole="button"
            >
              <Text style={styles.menuIcon}>ℹ</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Mobile Sidebar Overlay */}
        {sidebarVisible && (
          <View style={styles.mobileOverlay} {...getTestProps('mobile-sidebar-overlay')}>
            <TouchableOpacity
              style={styles.overlayBackground}
              onPress={onSidebarToggle}
              activeOpacity={1}
            />
            <View style={styles.mobileSidebar} {...getTestProps('mobile-sidebar')}>
              <ScrollView>{sidebar}</ScrollView>
            </View>
          </View>
        )}

        {/* Mobile Inspector Overlay */}
        {inspectorVisible && inspector && (
          <View style={styles.mobileOverlay} {...getTestProps('mobile-inspector-overlay')}>
            <TouchableOpacity
              style={styles.overlayBackground}
              onPress={onInspectorToggle}
              activeOpacity={1}
            />
            <View style={styles.mobileInspector} {...getTestProps('mobile-inspector')}>
              <ScrollView>{inspector}</ScrollView>
            </View>
          </View>
        )}

        {/* Main Content */}
        <View style={styles.mobileContent} {...getTestProps('mobile-content')}>
          {children}
        </View>

        {/* Bottom Navigation */}
        {bottomNav && (
          <View style={styles.bottomNav} {...getTestProps('mobile-bottom-nav')}>
            {bottomNav}
          </View>
        )}
      </View>
    );
  }

  // * Tablet Layout - 2-column with collapsible sidebar
  if (deviceType === 'tablet') {
    return (
      <View style={styles.container} {...getTestProps('app-shell-tablet')}>
        {/* Tablet Header */}
        {header && (
          <View style={styles.header} {...getTestProps('tablet-header')}>
            {header}
          </View>
        )}
        
        <View style={styles.tabletLayout}>
          {/* Collapsible Sidebar */}
          {sidebar && (
            <Animated.View
              style={[
                styles.tabletSidebar,
                { transform: [{ translateX: sidebarAnimation }] },
              ]}
              {...getTestProps('tablet-sidebar')}
            >
              <ScrollView>{sidebar}</ScrollView>
            </Animated.View>
          )}

          {/* Main Content Area */}
          <View
            style={[
              styles.tabletContent,
              !sidebarVisible && styles.tabletContentExpanded,
            ]}
            {...getTestProps('tablet-content')}
          >
            {/* Sidebar Toggle Button */}
            {!sidebarVisible && (
              <TouchableOpacity
                onPress={onSidebarToggle}
                style={styles.sidebarToggle}
                {...getTestProps('tablet-sidebar-toggle')}
                accessibilityLabel="Show sidebar"
                accessibilityRole="button"
              >
                <Text style={styles.toggleIcon}>›</Text>
              </TouchableOpacity>
            )}
            
            {children}
          </View>
        </View>
      </View>
    );
  }

  // * Desktop Layout - 3-column layout
  return (
    <View style={styles.container} {...getTestProps('app-shell-desktop')}>
      {/* Desktop Header */}
      {header && (
        <View style={styles.header} {...getTestProps('desktop-header')}>
          {header}
        </View>
      )}
      
      <View style={styles.desktopLayout}>
        {/* Sidebar */}
        {sidebar && (
          <View style={styles.desktopSidebar} {...getTestProps('desktop-sidebar')}>
            <ScrollView>{sidebar}</ScrollView>
          </View>
        )}

        {/* Main Content Area */}
        <View style={styles.desktopContent} {...getTestProps('desktop-content')}>
          {children}
        </View>

        {/* Inspector Panel */}
        {inspector && (
          <View style={styles.desktopInspector} {...getTestProps('desktop-inspector')}>
            <ScrollView>{inspector}</ScrollView>
          </View>
        )}
      </View>
    </View>
  );
};

// * Dynamic style creation based on theme and device type
const createStyles = (theme: any, deviceType: string) => {
  const baseStyles = {
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface.background,
    },
    header: {
      height: 60,
      backgroundColor: theme.colors.surface.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.primary.borderLight,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
      ...Platform.select({
        web: {
          position: 'sticky' as any,
          top: 0,
          zIndex: 100,
        },
      }),
    },
    headerTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: '600',
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.bold,
    },
    menuButton: {
      padding: theme.spacing.sm,
    },
    menuIcon: {
      fontSize: 24,
      color: theme.colors.text.primary,
    },
    toggleIcon: {
      fontSize: 20,
      color: theme.colors.text.secondary,
    },
  };

  // * Mobile specific styles
  const mobileStyles = {
    mobileHeader: {
      height: 56,
      backgroundColor: theme.colors.surface.card,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.primary.borderLight,
    },
    mobileContent: {
      flex: 1,
      backgroundColor: theme.colors.surface.background,
    },
    mobileOverlay: {
      position: 'absolute',
      top: 56,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
    },
    overlayBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.surface.overlay,
    },
    mobileSidebar: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: 280,
      backgroundColor: theme.colors.surface.card,
      borderRightWidth: 1,
      borderRightColor: theme.colors.primary.border,
      shadowColor: theme.colors.effects.shadow,
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,
    },
    mobileInspector: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: 280,
      backgroundColor: theme.colors.surface.card,
      borderLeftWidth: 1,
      borderLeftColor: theme.colors.primary.border,
      shadowColor: theme.colors.effects.shadow,
      shadowOffset: { width: -2, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,
    },
    bottomNav: {
      height: 60,
      backgroundColor: theme.colors.surface.card,
      borderTopWidth: 1,
      borderTopColor: theme.colors.primary.borderLight,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
    },
  };

  // * Tablet specific styles
  const tabletStyles = {
    tabletLayout: {
      flex: 1,
      flexDirection: 'row',
    },
    tabletSidebar: {
      width: 260,
      backgroundColor: theme.colors.surface.card,
      borderRightWidth: 1,
      borderRightColor: theme.colors.primary.borderLight,
    },
    tabletContent: {
      flex: 1,
      backgroundColor: theme.colors.surface.background,
    },
    tabletContentExpanded: {
      marginLeft: 0,
    },
    sidebarToggle: {
      position: 'absolute',
      left: theme.spacing.sm,
      top: theme.spacing.sm,
      width: 32,
      height: 32,
      backgroundColor: theme.colors.surface.card,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
      borderColor: theme.colors.primary.borderLight,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
      shadowColor: theme.colors.effects.shadow,
      shadowOffset: { width: 1, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
  };

  // * Desktop specific styles
  const desktopStyles = {
    desktopLayout: {
      flex: 1,
      flexDirection: 'row',
    },
    desktopSidebar: {
      width: 280,
      backgroundColor: theme.colors.surface.card,
      borderRightWidth: 1,
      borderRightColor: theme.colors.primary.borderLight,
    },
    desktopContent: {
      flex: 1,
      backgroundColor: theme.colors.surface.background,
      minWidth: 400,
    },
    desktopInspector: {
      width: 320,
      backgroundColor: theme.colors.surface.card,
      borderLeftWidth: 1,
      borderLeftColor: theme.colors.primary.borderLight,
    },
  };

  // * Combine styles based on device type
  if (deviceType === 'mobile') {
    return StyleSheet.create({ ...baseStyles, ...mobileStyles });
  }
  if (deviceType === 'tablet') {
    return StyleSheet.create({ ...baseStyles, ...tabletStyles });
  }
  return StyleSheet.create({ ...baseStyles, ...desktopStyles });
};
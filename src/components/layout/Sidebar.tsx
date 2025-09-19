/**
 * Sidebar.tsx
 * * Responsive sidebar component for navigation and app features
 * * Adapts to desktop (fixed), tablet (collapsible), and mobile (drawer) modes
 * ! IMPORTANT: Integrates with AppShell for responsive behavior
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Animated,
  Pressable,
  LayoutAnimation,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../navigation/types';
import { useTheme } from '../../providers/ThemeProvider';
import { useWorldbuildingStore } from '../../store/worldbuildingStore';

interface SidebarProps {
  // * Control visibility for mobile/tablet
  isVisible?: boolean;
  onClose?: () => void;
  // * Device type from AppShell
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  // * Current route for active state
  currentRoute?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  action?: () => void;
  divider?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isVisible = true,
  onClose,
  deviceType = 'desktop',
  currentRoute,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { projects, currentProject } = useWorldbuildingStore();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['projects']));

  // * Animation for slide-in effect on mobile
  const [slideAnimation] = useState(new Animated.Value(isVisible ? 0 : -300));

  // * Create animated values for accordion sections
  const sectionAnimations = useRef<{ [key: string]: Animated.Value }>({});
  const rotationAnimations = useRef<{ [key: string]: Animated.Value }>({});
  
  // * Initialize animation values for each section
  const getSectionAnimation = (sectionId: string) => {
    if (!sectionAnimations.current[sectionId]) {
      sectionAnimations.current[sectionId] = new Animated.Value(
        expandedSections.has(sectionId) ? 1 : 0
      );
    }
    return sectionAnimations.current[sectionId];
  };

  const getRotationAnimation = (sectionId: string) => {
    if (!rotationAnimations.current[sectionId]) {
      rotationAnimations.current[sectionId] = new Animated.Value(
        expandedSections.has(sectionId) ? 1 : 0
      );
    }
    return rotationAnimations.current[sectionId];
  };

  React.useEffect(() => {
    Animated.timing(slideAnimation, {
      toValue: isVisible ? 0 : -300,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isVisible, slideAnimation]);

  // * Toggle section expansion with smooth animation
  const toggleSection = useCallback((sectionId: string) => {
    // * Configure LayoutAnimation for smooth height transitions (mobile fallback)
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(
        LayoutAnimation.create(
          300,
          LayoutAnimation.Types.easeInEaseOut,
          LayoutAnimation.Properties.opacity
        )
      );
    }

    setExpandedSections(prev => {
      const newSet = new Set(prev);
      const isExpanding = !newSet.has(sectionId);
      
      if (isExpanding) {
        newSet.add(sectionId);
      } else {
        newSet.delete(sectionId);
      }

      // * Animate the section height and rotation
      const sectionAnim = getSectionAnimation(sectionId);
      const rotationAnim = getRotationAnimation(sectionId);
      
      Animated.parallel([
        Animated.timing(sectionAnim, {
          toValue: isExpanding ? 1 : 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(rotationAnim, {
          toValue: isExpanding ? 1 : 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      return newSet;
    });
  }, []);

  // * Navigation handler
  const handleNavigation = useCallback((route?: string, action?: () => void) => {
    if (route) {
      navigation.navigate(route as any);
    }
    if (action) {
      action();
    }
    // * Close sidebar on mobile after navigation
    if (deviceType === 'mobile' && onClose) {
      onClose();
    }
  }, [navigation, deviceType, onClose]);

  // * Menu items configuration
  const mainMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: 'Projects' },
    { id: 'divider1', label: '', icon: '', divider: true },
  ];

  const projectMenuItems: MenuItem[] = projects.slice(0, 5).map(project => ({
    id: `project-${project.id}`,
    label: project.name,
    icon: '📚',
    action: () => navigation.navigate('Project', { projectId: project.id }),
  }));

  if (projects.length > 5) {
    projectMenuItems.push({
      id: 'view-all-projects',
      label: 'View All Projects...',
      icon: '➕',
      route: 'Projects',
    });
  }

  const toolsMenuItems: MenuItem[] = [
    { id: 'search', label: 'Global Search', icon: '🔍', action: () => console.log('Open search') },
    { id: 'templates', label: 'Templates', icon: '📝', action: () => console.log('Open templates') },
    { id: 'export', label: 'Import/Export', icon: '📦', action: () => console.log('Open import/export') },
  ];

  const settingsMenuItems: MenuItem[] = [
    { id: 'settings', label: 'Settings', icon: '⚙️', route: 'Settings' },
    { id: 'help', label: 'Help & Support', icon: '❓', action: () => console.log('Open help') },
  ];

  // * Render menu item
  const renderMenuItem = (item: MenuItem) => {
    if (item.divider) {
      return <View key={item.id} style={styles.divider} />;
    }

    const isActive = currentRoute === item.route || 
                    (item.id.startsWith('project-') && currentRoute === 'Project' && 
                     currentProject?.id === item.id.replace('project-', ''));

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.menuItem, isActive && styles.menuItemActive]}
        onPress={() => handleNavigation(item.route, item.action)}
        testID={`sidebar-menu-item-${item.id}`}
      >
        <Text style={[styles.menuIcon, isActive && styles.menuIconActive]}>{item.icon}</Text>
        <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>{item.label}</Text>
      </TouchableOpacity>
    );
  };

  // * Render collapsible section with smooth animations
  const renderSection = (sectionId: string, title: string, items: MenuItem[]) => {
    const isExpanded = expandedSections.has(sectionId);
    const sectionAnim = getSectionAnimation(sectionId);
    const rotationAnim = getRotationAnimation(sectionId);
    
    // * Calculate animated styles for smooth transitions
    const animatedHeight = sectionAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, items.length * 50 + 16], // Approximate height based on items
    });
    
    const animatedOpacity = sectionAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.5, 1],
    });
    
    const animatedRotation = rotationAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '90deg'],
    });
    
    return (
      <View key={sectionId} style={styles.section}>
        <Pressable
          style={styles.sectionHeader}
          onPress={() => toggleSection(sectionId)}
          testID={`sidebar-section-${sectionId}`}
        >
          <Text style={styles.sectionTitle}>{title}</Text>
          <Animated.Text 
            style={[
              styles.sectionToggle,
              { transform: [{ rotate: animatedRotation }] }
            ]}
          >
            ▶
          </Animated.Text>
        </Pressable>
        <Animated.View 
          style={[
            styles.sectionContent,
            {
              height: animatedHeight,
              opacity: animatedOpacity,
              overflow: 'hidden',
            }
          ]}
        >
          {/* * Always render content but control visibility with animation */}
          <View style={{ paddingVertical: 8 }}>
            {items.map(renderMenuItem)}
          </View>
        </Animated.View>
      </View>
    );
  };

  // * Create dynamic styles based on theme
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  // * Render sidebar content
  const sidebarContent = (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>✨ Fantasy Writer</Text>
        {deviceType !== 'desktop' && (
          <TouchableOpacity onPress={onClose} testID="sidebar-close-button">
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Menu Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Main Menu */}
        <View style={styles.menuSection}>
          {mainMenuItems.map(renderMenuItem)}
        </View>

        {/* Projects Section */}
        {renderSection('projects', 'Recent Projects', projectMenuItems)}

        {/* Tools Section */}
        {renderSection('tools', 'Tools', toolsMenuItems)}

        {/* Settings Section */}
        <View style={styles.menuSection}>
          {settingsMenuItems.map(renderMenuItem)}
        </View>
      </ScrollView>

      {/* User Info Footer */}
      <View style={styles.footer}>
        <View style={styles.userInfo}>
          <Text style={styles.userAvatar}>👤</Text>
          <View>
            <Text style={styles.userName}>Guest User</Text>
            <Text style={styles.userStatus}>Free Plan</Text>
          </View>
        </View>
      </View>
    </>
  );

  // * Mobile: Render as overlay drawer
  if (deviceType === 'mobile') {
    if (!isVisible) return null;
    
    return (
      <>
        <Pressable 
          style={styles.overlay} 
          onPress={onClose}
          testID="sidebar-overlay"
        />
        <Animated.View 
          style={[styles.mobileDrawer, { transform: [{ translateX: slideAnimation }] }]}
          testID="sidebar-mobile-drawer"
        >
          {sidebarContent}
        </Animated.View>
      </>
    );
  }

  // * Tablet: Render as collapsible sidebar
  if (deviceType === 'tablet') {
    return (
      <Animated.View 
        style={[
          styles.tabletSidebar,
          { width: isVisible ? 280 : 60, opacity: isVisible ? 1 : 0.9 }
        ]}
        testID="sidebar-tablet"
      >
        {isVisible ? sidebarContent : (
          <TouchableOpacity 
            style={styles.collapsedToggle}
            onPress={() => onClose && onClose()}
            testID="sidebar-expand-button"
          >
            <Text style={styles.hamburgerIcon}>☰</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  }

  // * Desktop: Render as fixed sidebar
  return (
    <View style={styles.desktopSidebar} testID="sidebar-desktop">
      {sidebarContent}
    </View>
  );
};

// * Style creation function
const createStyles = (theme: any) => StyleSheet.create({
  // * Container styles
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  mobileDrawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: theme.ui.background.secondary,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  tabletSidebar: {
    backgroundColor: theme.ui.background.secondary,
    borderRightWidth: 1,
    borderRightColor: theme.ui.border.light,
    overflow: 'hidden',
  },
  desktopSidebar: {
    width: 280,
    backgroundColor: theme.ui.background.secondary,
    borderRightWidth: 1,
    borderRightColor: theme.ui.border.light,
  },
  
  // * Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.ui.border.light,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.ui.text.primary,
  },
  closeIcon: {
    fontSize: 20,
    color: theme.ui.text.secondary,
    padding: 4,
  },
  
  // * ScrollView
  scrollView: {
    flex: 1,
  },
  
  // * Menu sections
  menuSection: {
    paddingVertical: 8,
  },
  section: {
    marginVertical: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.ui.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionToggle: {
    fontSize: 10,
    color: theme.ui.text.secondary,
  },
  sectionContent: {
    // * Padding handled inside animated view for smooth transitions
  },
  
  // * Menu items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: theme.ui.background.tertiary,
  },
  menuIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  menuIconActive: {
    // Icon doesn't change color
  },
  menuLabel: {
    fontSize: 14,
    color: theme.ui.text.secondary,
    flex: 1,
  },
  menuLabelActive: {
    color: theme.ui.text.primary,
    fontWeight: '600',
  },
  
  // * Divider
  divider: {
    height: 1,
    backgroundColor: theme.ui.border.light,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  
  // * Footer
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.ui.border.light,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.ui.text.primary,
  },
  userStatus: {
    fontSize: 12,
    color: theme.ui.text.secondary,
  },
  
  // * Collapsed state (tablet)
  collapsedToggle: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamburgerIcon: {
    fontSize: 20,
    color: theme.ui.text.primary,
  },
});

export default Sidebar;
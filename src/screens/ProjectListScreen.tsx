/**
 * Project List Screen - Enhanced Dashboard
 * Main landing page with responsive layouts, stats, and fantasy theming
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NavigationProp } from '../navigation/types';
import { useWorldbuildingStore } from '../store/worldbuildingStore';
import { VirtualizedProjectList } from '../components/VirtualizedProjectList';
import { ProjectCard } from '../components/ProjectCard';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { GlobalSearch } from '../components/GlobalSearch';
import { StatsCard } from '../components/StatsCard';
import { ViewToggle } from '../components/ViewToggle';
import { BottomNavigation } from '../components/BottomNavigation';
import { useTheme } from '../providers/ThemeProvider';

type ViewMode = 'grid' | 'list';

export function ProjectListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { projects, deleteProject } = useWorldbuildingStore();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState('projects');
  
  // * Responsive breakpoints
  const isPhone = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  
  // * Calculate grid columns based on screen size
  const getGridColumns = useCallback(() => {
    if (isPhone) return 1;
    if (isTablet) return 2;
    if (isDesktop && width >= 1440) return 4;
    return 3;
  }, [isPhone, isTablet, isDesktop, width]);
  
  // * Calculate statistics from projects
  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const totalElements = projects.reduce((sum, p) => sum + (p.elements?.length || 0), 0);
    const totalWords = projects.reduce((sum, p) => {
      // TODO: Implement real word count from chapters/content
      return sum + (p.elements?.length || 0) * 500; // Mock: 500 words per element
    }, 0);
    
    // * Calculate activity streak (mock data for now)
    const today = new Date();
    const lastActivity = projects.reduce((latest, p) => {
      const projectDate = new Date(p.updatedAt);
      return projectDate > latest ? projectDate : latest;
    }, new Date(0));
    
    const daysSinceActivity = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    const currentStreak = daysSinceActivity === 0 ? 7 : daysSinceActivity === 1 ? 1 : 0; // Mock streak
    
    return {
      totalProjects,
      totalElements,
      totalWords,
      currentStreak,
    };
  }, [projects]);
  
  const handleProjectSelect = useCallback((project: any) => {
    navigation.navigate('Project', { projectId: project.id });
  }, [navigation]);
  
  const handleProjectDelete = useCallback((projectId: string) => {
    deleteProject(projectId);
  }, [deleteProject]);
  
  const handleCreateProject = useCallback(() => {
    setShowCreateModal(true);
  }, []);
  
  const handleProjectCreated = useCallback((projectId: string) => {
    setShowCreateModal(false);
    navigation.navigate('Project', { projectId });
  }, [navigation]);
  
  const handleTabPress = useCallback((tabId: string) => {
    setActiveTab(tabId);
    // * Navigate to different screens based on tab
    if (tabId === 'elements') {
      // TODO: Navigate to elements screen
    } else if (tabId === 'settings') {
      navigation.navigate('Settings' as any);
    }
  }, [navigation]);
  
  // * Create dynamic styles based on theme
  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);
  
  // * Render individual project card for grid/list views
  const renderProjectCard = useCallback(({ item }: { item: any }) => {
    if (viewMode === 'list') {
      // * List view - full width cards with inline stats
      return (
        <View style={styles.listCard} testID={`project-list-item-${item.id}`}>
          <ProjectCard 
            project={item}
            onPress={() => handleProjectSelect(item)}
            onEdit={() => {/* TODO: Edit project */}}
            onDelete={() => handleProjectDelete(item.id)}
            style="list"
          />
        </View>
      );
    }
    
    // * Grid view - responsive columns
    return (
      <View style={[styles.gridCard, { width: `${100 / getGridColumns()}%` }]} testID={`project-grid-item-${item.id}`}>
        <ProjectCard 
          project={item}
          onPress={() => handleProjectSelect(item)}
          onEdit={() => {/* TODO: Edit project */}}
          onDelete={() => handleProjectDelete(item.id)}
          style="grid"
        />
      </View>
    );
  }, [viewMode, handleProjectSelect, handleProjectDelete, styles, getGridColumns]);
  
  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          testID="project-list-scroll"
        >
          {/* * Header with title and actions */}
          <View style={styles.header} testID="dashboard-header">
            <View style={styles.headerTop}>
              <Text style={styles.title} testID="dashboard-title">
                My Fantasy Worlds
              </Text>
              <View style={styles.headerActions}>
                {/* * View Toggle for grid/list */}
                {!isPhone && (
                  <ViewToggle
                    currentView={viewMode}
                    onViewChange={setViewMode}
                    size="medium"
                    testID="view-mode-toggle"
                  />
                )}
                
                {/* * Search button */}
                <TouchableOpacity
                  onPress={() => setShowGlobalSearch(true)}
                  style={styles.searchButton}
                  testID="search-button"
                  accessibilityLabel="Search projects and elements"
                >
                  <Text style={styles.searchIcon}>🔍</Text>
                </TouchableOpacity>
                
                {/* * Create button (desktop/tablet only) */}
                {!isPhone && (
                  <TouchableOpacity
                    onPress={handleCreateProject}
                    style={styles.createButton}
                    testID="create-project-button"
                    accessibilityLabel="Create new project"
                  >
                    <Text style={styles.createIcon}>✨</Text>
                    <Text style={styles.createText}>New Project</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
          
          {/* * Hero Stats Section */}
          <View style={styles.statsSection} testID="dashboard-stats">
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statsScroll}
            >
              <StatsCard
                title="Projects"
                value={stats.totalProjects}
                icon="📚"
                trend={stats.totalProjects > 0 ? 'up' : 'stable'}
                change={stats.totalProjects > 0 ? '+1' : ''}
                color={theme.colors.attributes.power}
                size="large"
                testID="stats-projects"
              />
              <StatsCard
                title="Elements"
                value={stats.totalElements}
                icon="🗂️"
                trend="up"
                change="+12%"
                color={theme.colors.attributes.vitality}
                size="large"
                testID="stats-elements"
              />
              <StatsCard
                title="Words Written"
                value={stats.totalWords}
                icon="✍️"
                trend="up"
                change="+2.5k"
                color={theme.colors.attributes.swiftness}
                size="large"
                testID="stats-words"
              />
              <StatsCard
                title="Day Streak"
                value={stats.currentStreak}
                icon="🔥"
                trend={stats.currentStreak > 0 ? 'up' : 'down'}
                change={stats.currentStreak > 0 ? `${stats.currentStreak} days` : 'Start today!'}
                color={theme.colors.attributes.wisdom}
                size="large"
                testID="stats-streak"
              />
            </ScrollView>
          </View>
          
          {/* * Projects Section */}
          <View style={styles.projectsSection}>
            {/* * Section header with view toggle for mobile */}
            {isPhone && (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Projects</Text>
                <ViewToggle
                  currentView={viewMode}
                  onViewChange={setViewMode}
                  size="small"
                  testID="view-mode-toggle-mobile"
                />
              </View>
            )}
            
            {/* * Project List/Grid */}
            {projects.length === 0 ? (
              <View style={styles.emptyState} testID="empty-state">
                <Text style={styles.emptyIcon}>🏰</Text>
                <Text style={styles.emptyTitle}>No projects yet</Text>
                <Text style={styles.emptyText}>
                  Create your first fantasy world to begin your journey
                </Text>
                <TouchableOpacity
                  onPress={handleCreateProject}
                  style={styles.emptyButton}
                  testID="empty-create-button"
                >
                  <Text style={styles.emptyButtonText}>Create First Project</Text>
                </TouchableOpacity>
              </View>
            ) : viewMode === 'grid' ? (
              <FlatList
                data={projects}
                renderItem={renderProjectCard}
                keyExtractor={(item) => item.id}
                numColumns={getGridColumns()}
                key={`grid-${getGridColumns()}`} // Force re-render on column change
                scrollEnabled={false}
                contentContainerStyle={styles.gridContainer}
                testID="project-grid"
              />
            ) : (
              <VirtualizedProjectList
                projects={projects}
                onProjectSelect={handleProjectSelect}
                onProjectDelete={handleProjectDelete}
                renderItem={renderProjectCard}
                testID="project-list"
              />
            )}
          </View>
        </ScrollView>
        
        {/* * Floating Action Button (Mobile only) */}
        {isPhone && (
          <TouchableOpacity
            onPress={handleCreateProject}
            style={styles.fab}
            testID="fab-create"
            accessibilityLabel="Create new project"
          >
            <Text style={styles.fabIcon}>✨</Text>
          </TouchableOpacity>
        )}
        
        {/* * Bottom Navigation (Mobile only) */}
        <BottomNavigation
          activeTab={activeTab}
          onTabPress={handleTabPress}
        />
        
        {/* * Modals */}
        <CreateProjectModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={handleProjectCreated}
        />
        
        <GlobalSearch
          visible={showGlobalSearch}
          onClose={() => setShowGlobalSearch(false)}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

// * Dynamic style creation based on theme
const createStyles = (theme: any, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: insets.top + theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary.borderLight,
    backgroundColor: theme.colors.surface.backgroundElevated,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.metal.gold,
    fontFamily: theme.typography.fontFamily.display,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary.borderLight,
  },
  searchIcon: {
    fontSize: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.attributes.power,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  createIcon: {
    fontSize: 18,
  },
  createText: {
    color: theme.colors.text.inverse,
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.bold,
  },
  statsSection: {
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.surface.backgroundElevated + '50',
  },
  statsScroll: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  projectsSection: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl + 80, // Account for bottom navigation
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.bold,
  },
  gridContainer: {
    gap: theme.spacing.md,
  },
  gridCard: {
    padding: theme.spacing.xs,
  },
  listCard: {
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily.display,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    maxWidth: 300,
  },
  emptyButton: {
    backgroundColor: theme.colors.attributes.power,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  emptyButtonText: {
    color: theme.colors.text.inverse,
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.bold,
  },
  fab: {
    position: 'absolute',
    bottom: 80, // Above bottom navigation
    right: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.attributes.power,
    justifyContent: 'center',
    alignItems: 'center',
    // * Fantasy shadow
    shadowColor: theme.colors.metal.gold,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 24,
    color: theme.colors.text.inverse,
  },
});
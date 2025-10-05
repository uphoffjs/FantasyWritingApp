import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  RefreshControl,
  Platform,
} from 'react-native';
import { Project } from '../types/models';
import { ProjectCard } from './ProjectCard';
import { SwipeableRow } from './gestures/SwipeableRow';

import { getTestProps } from '../utils/react-native-web-polyfills';
interface ProjectListProps {
  projects: Project[];
  onProjectSelect?: (project: Project) => void;
  onProjectDelete?: (projectId: string) => void;
  onProjectArchive?: (projectId: string) => void;
  onCreateProject?: () => void;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

// ? * Sort configuration - defines how projects can be sorted
const SORT_OPTIONS = [
  { value: 'updated', label: 'Recently Updated' },
  { value: 'created', label: 'Recently Created' },
  { value: 'name', label: 'Name' },
  { value: 'elements', label: 'Element Count' },
] as const;

type SortOption = typeof SORT_OPTIONS[number]['value'];

export function ProjectList({
  projects,
  onProjectSelect: _onProjectSelect,
  onProjectDelete,
  onProjectArchive,
  onCreateProject,
  loading = false,
  refreshing = false,
  onRefresh,
}: ProjectListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [showSortOptions, setShowSortOptions] = useState(false);

  // * Filter and sort projects based on search query and sort selection
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // * Apply search filter - searches name, description, and tags
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // * Apply sorting based on selected sort option
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'elements':
          return (b.elements?.length || 0) - (a.elements?.length || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, searchQuery, sortBy]);

  // * Render individual project card with press and delete handlers
  const renderProject = useCallback(
    ({ item, index }: { item: Project; index: number }) => {
      // * Wrap with SwipeableRow only on mobile platforms
      const card = (
        <ProjectCard
          project={item}
          onDelete={onProjectDelete ? () => onProjectDelete(item.id) : undefined}
          index={index} // * Pass index for staggered animations
        />
      );

      // * Enable swipe gestures on mobile platforms only
      if (Platform.OS !== 'web' && (onProjectDelete || onProjectArchive)) {
        return (
          <SwipeableRow
            onDelete={onProjectDelete ? () => onProjectDelete(item.id) : undefined}
            onArchive={onProjectArchive ? () => onProjectArchive(item.id) : undefined}
            {...getTestProps(`swipeable-project-${item.id}`)}
          >
            {card}
          </SwipeableRow>
        );
      }

      return card;
    },
    [onProjectDelete, onProjectArchive]
  );

  // ?  * Render empty state - shows loading or empty message
  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading projects...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📚</Text>
        <Text style={styles.emptyTitle}>
          {searchQuery ? 'No projects found'  : 'No projects yet'}
        </Text>
        <Text style={styles.emptyText}>
          {searchQuery
            ? 'Try adjusting your search'
            : 'Create your first worldbuilding project'}
        </Text>
        {onCreateProject && !searchQuery && (
          <Pressable style={styles.createButton} onPress={onCreateProject}>
            <Text style={styles.createButtonText}>Create Project</Text>
          </Pressable>
        )}
      </View>
    );
  };

  // * Render header with search bar and sort controls
  const renderHeader = () => (
    <View style={styles.header}>
      {/* * Search Bar - allows filtering projects by name/description/tags */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search projects..." placeholderTextColor="#6B7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Text style={styles.clearIcon}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* * Sort dropdown and project count display */}
      <View style={styles.controlsContainer}>
        <Pressable
          style={styles.sortButton}
          onPress={() => setShowSortOptions(!showSortOptions)}
        >
          <Text style={styles.sortIcon}>↕️</Text>
          <Text style={styles.sortText}>
            {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
          </Text>
        </Pressable>

        <Text style={styles.projectCount}>
          {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
        </Text>
      </View>

      {/* * Sort Dropdown - appears when sort button is pressed */}
      {showSortOptions && (
        <View style={styles.sortDropdown}>
          {SORT_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.sortOption,
                sortBy === option.value && styles.sortOptionSelected,
              ]}
              onPress={() => {
                setSortBy(option.value);
                setShowSortOptions(false);
              }}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  sortBy === option.value && styles.sortOptionTextSelected,
                ]}
              >
                {option.label}
              </Text>
              {sortBy === option.value && <Text style={styles.checkIcon}>✓</Text>}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );

  // ! PERFORMANCE: * Key extractor for FlatList optimization
  const keyExtractor = useCallback((item: Project) => item.id, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProjects}
        renderItem={renderProject}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          filteredProjects.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
            />
          ) : undefined
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS === 'android'}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* * Floating Action Button - creates new project */}
      {onCreateProject && filteredProjects.length > 0 && (
        <Pressable style={styles.fab} onPress={onCreateProject}>
          <Text style={styles.fabIcon}>+</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  sortIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  sortText: {
  },
  projectCount: {
  },
  sortDropdown: {
    position: 'absolute',
    top: 100,
    borderRadius: 8,
    paddingVertical: 4,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sortOptionText: {
    fontWeight: '600',
  },
  checkIcon: {
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  listContentEmpty: {
    flex: 1,
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  fabIcon: {
    fontWeight: '300',
  },
});

/**
 * ProjectFilter.tsx
 * Component that provides filter controls for projects
 * Filters by genre, status, last modified, and more
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { Project } from '../types/models';
import { useFilterDebounce } from '../hooks/useDebounce';

import { getTestProps } from '../utils/react-native-web-polyfills';
// * Filter options
export interface ProjectFilterOptions {
  genres: string[];
  status: ('active' | 'completed' | 'on-hold' | 'archived')[];
  lastModified: 'today' | 'week' | 'month' | 'all';
  sortBy: 'name' | 'modified' | 'created' | 'elements';
  sortOrder: 'asc' | 'desc';
}

interface ProjectFilterProps {
  projects: Project[];
  onFilterChange: (filteredProjects: Project[]) => void;
  // * Initial filter state
  initialFilters?: Partial<ProjectFilterOptions>;
}

// * Available genres based on the project types
const GENRES = [
  'Fantasy',
  'Sci-Fi',
  'Mystery',
  'Romance',
  'Thriller',
  'Horror',
  'Historical',
  'Contemporary',
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', icon: '🔥' },
  { value: 'completed', label: 'Completed', icon: '✅' },
  { value: 'on-hold', label: 'On Hold', icon: '⏸️' },
  { value: 'archived', label: 'Archived', icon: '📦' },
];

const TIME_FILTERS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'modified', label: 'Last Modified' },
  { value: 'created', label: 'Date Created' },
  { value: 'elements', label: 'Element Count' },
];

export function ProjectFilter({
  projects,
  onFilterChange,
  initialFilters = {},
}: ProjectFilterProps) {
  const { theme } = useTheme();

  // * Use debounced filters for better performance
  const {
    filters,
    debouncedFilters,
    setFilters,
    updateFilter: _updateFilter,
    resetFilters: _resetFilters,
    isPending: _isPending
  } = useFilterDebounce<ProjectFilterOptions>({
    genres: initialFilters.genres || [],
    status: initialFilters.status || [],
    lastModified: initialFilters.lastModified || 'all',
    sortBy: initialFilters.sortBy || 'modified',
    sortOrder: initialFilters.sortOrder || 'desc',
  }, 300);
  const [isExpanded, setIsExpanded] = useState(false);

  // * Apply filters to projects
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // * Filter by genre
    if (debouncedFilters.genres.length > 0) {
      filtered = filtered.filter(project =>
        debouncedFilters.genres.includes(project.genre || 'Fantasy')
      );
    }

    // * Filter by status
    if (debouncedFilters.status.length > 0) {
      filtered = filtered.filter(project =>
        debouncedFilters.status.includes(project.status || 'active')
      );
    }

    // * Filter by last modified
    if (debouncedFilters.lastModified !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (debouncedFilters.lastModified) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(project => {
        const modifiedDate = new Date(project.updatedAt || project.createdAt);
        return modifiedDate >= cutoffDate;
      });
    }

    // * Sort projects
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (debouncedFilters.sortBy) {
        case 'name':
          compareValue = (a.name || '').localeCompare(b.name || '');
          break;
        case 'modified':
          compareValue = new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
          break;
        case 'created':
          compareValue = new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          break;
        case 'elements':
          compareValue = (b.elements?.length || 0) - (a.elements?.length || 0);
          break;
      }

      return debouncedFilters.sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [projects, debouncedFilters]);

  // * Notify parent of filter changes
  useEffect(() => {
    onFilterChange(filteredProjects);
  }, [filteredProjects, onFilterChange]);

  // * Toggle genre selection
  const toggleGenre = useCallback((genre: string) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre],
    }));
  }, [setFilters]);

  // * Toggle status selection
  const toggleStatus = useCallback((status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status as any)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status as any],
    }));
  }, [setFilters]);

  // * Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      genres: [],
      status: [],
      lastModified: 'all',
      sortBy: 'modified',
      sortOrder: 'desc',
    });
  }, [setFilters]);

  // * Check if any filters are active
  const hasActiveFilters = filters.genres.length > 0 || 
    filters.status.length > 0 || 
    filters.lastModified !== 'all';

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      {/* Filter Header */}
      <Pressable
        style={({ pressed }) => [
          styles.header,
          pressed && styles.headerPressed,
        ]}
        onPress={() => setIsExpanded(!isExpanded)}
        {...getTestProps('project-filter-toggle')}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>🎯</Text>
          <Text style={styles.headerTitle}>Filters</Text>
          {hasActiveFilters && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>
                {filters.genres.length + filters.status.length}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.resultCount}>
            {filteredProjects.length} of {projects.length}
          </Text>
          <Text style={styles.expandIcon}>
            {isExpanded ? '▼' : '▶'}
          </Text>
        </View>
      </Pressable>

      {/* Filter Controls */}
      {isExpanded && (
        <View style={styles.filterContent}>
          {/* Genre Filters */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Genre</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipScroll}
            >
              {GENRES.map(genre => (
                <Pressable
                  key={genre}
                  style={({ pressed }) => [
                    styles.chip,
                    filters.genres.includes(genre) && styles.chipActive,
                    pressed && styles.chipPressed,
                  ]}
                  onPress={() => toggleGenre(genre)}
                  {...getTestProps(`filter-genre-${genre}`)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      filters.genres.includes(genre) && styles.chipTextActive,
                    ]}
                  >
                    {genre}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Status Filters */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.statusGrid}>
              {STATUS_OPTIONS.map(option => (
                <Pressable
                  key={option.value}
                  style={({ pressed }) => [
                    styles.statusChip,
                    filters.status.includes(option.value as any) && styles.statusChipActive,
                    pressed && styles.statusChipPressed,
                  ]}
                  onPress={() => toggleStatus(option.value)}
                  {...getTestProps(`filter-status-${option.value}`)}
                >
                  <Text style={styles.statusIcon}>{option.icon}</Text>
                  <Text
                    style={[
                      styles.statusText,
                      filters.status.includes(option.value as any) && styles.statusTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Time & Sort */}
          <View style={styles.filterRow}>
            {/* Last Modified */}
            <View style={styles.filterColumn}>
              <Text style={styles.sectionTitle}>Last Modified</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.timeScroll}
              >
                {TIME_FILTERS.map(time => (
                  <Pressable
                    key={time.value}
                    style={({ pressed }) => [
                      styles.timeChip,
                      filters.lastModified === time.value && styles.timeChipActive,
                      pressed && styles.timeChipPressed,
                    ]}
                    onPress={() => setFilters(prev => ({ ...prev, lastModified: time.value as any }))}
                    {...getTestProps(`filter-time-${time.value}`)}
                  >
                    <Text
                      style={[
                        styles.timeText,
                        filters.lastModified === time.value && styles.timeTextActive,
                      ]}
                    >
                      {time.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Sort By */}
            <View style={styles.filterColumn}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <View style={styles.sortContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.sortScroll}
                >
                  {SORT_OPTIONS.map(sort => (
                    <Pressable
                      key={sort.value}
                      style={({ pressed }) => [
                        styles.sortChip,
                        filters.sortBy === sort.value && styles.sortChipActive,
                        pressed && styles.sortChipPressed,
                      ]}
                      onPress={() => setFilters(prev => ({ ...prev, sortBy: sort.value as any }))}
                      {...getTestProps(`filter-sort-${sort.value}`)}
                    >
                      <Text
                        style={[
                          styles.sortText,
                          filters.sortBy === sort.value && styles.sortTextActive,
                        ]}
                      >
                        {sort.label}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <Pressable
                  style={styles.sortOrderButton}
                  onPress={() => setFilters(prev => ({ 
                    ...prev, 
                    sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                  }))}
                  {...getTestProps('filter-sort-order')}
                >
                  <Text style={styles.sortOrderIcon}>
                    {filters.sortOrder === 'asc' ? '↑' : '↓'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Pressable
              style={({ pressed }) => [
                styles.clearButton,
                pressed && styles.clearButtonPressed,
              ]}
              onPress={clearFilters}
              {...getTestProps('filter-clear-all')}
            >
              <Text style={styles.clearButtonText}>Clear All Filters</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

// * Create theme-aware styles
const getStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary.borderLight,
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  headerPressed: {
    backgroundColor: theme.colors.surface.cardHover,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    fontSize: 18,
    marginRight: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.heading,
  },
  activeBadge: {
    backgroundColor: theme.colors.accent.swiftness,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    marginLeft: theme.spacing.xs,
  },
  activeBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.bold as any,
    fontFamily: theme.typography.fontFamily.ui,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.ui,
  },
  expandIcon: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
  filterContent: {
    padding: theme.spacing.md,
    paddingTop: 0,
  },
  filterSection: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.ui,
  },
  chipScroll: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surface.backgroundAlt,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary.borderLight,
    marginRight: theme.spacing.xs,
  },
  chipActive: {
    backgroundColor: theme.colors.accent.swiftness,
    borderColor: theme.colors.accent.swiftness,
  },
  chipPressed: {
    transform: [{ scale: 0.95 }],
  },
  chipText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.body,
  },
  chipTextActive: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semibold as any,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs / 2,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surface.backgroundAlt,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary.borderLight,
    marginHorizontal: theme.spacing.xs / 2,
    marginBottom: theme.spacing.xs,
  },
  statusChipActive: {
    backgroundColor: theme.colors.accent.vitality,
    borderColor: theme.colors.accent.vitality,
  },
  statusChipPressed: {
    transform: [{ scale: 0.95 }],
  },
  statusIcon: {
    fontSize: 16,
    marginRight: theme.spacing.xs / 2,
  },
  statusText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.body,
  },
  statusTextActive: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semibold as any,
  },
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: -theme.spacing.xs,
  },
  filterColumn: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  timeScroll: {
    flexDirection: 'row',
  },
  timeChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surface.backgroundAlt,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary.borderLight,
    marginRight: theme.spacing.xs,
  },
  timeChipActive: {
    backgroundColor: theme.colors.accent.finesse,
    borderColor: theme.colors.accent.finesse,
  },
  timeChipPressed: {
    transform: [{ scale: 0.95 }],
  },
  timeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.body,
  },
  timeTextActive: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semibold as any,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortScroll: {
    flex: 1,
    flexDirection: 'row',
  },
  sortChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surface.backgroundAlt,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary.borderLight,
    marginRight: theme.spacing.xs,
  },
  sortChipActive: {
    backgroundColor: theme.colors.accent.might,
    borderColor: theme.colors.accent.might,
  },
  sortChipPressed: {
    transform: [{ scale: 0.95 }],
  },
  sortText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.body,
  },
  sortTextActive: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semibold as any,
  },
  sortOrderButton: {
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.surface.backgroundAlt,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary.borderLight,
  },
  sortOrderIcon: {
    fontSize: 16,
    color: theme.colors.accent.might,
  },
  clearButton: {
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.button.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.metal.silverDark,
    marginTop: theme.spacing.sm,
  },
  clearButtonPressed: {
    backgroundColor: theme.colors.button.secondaryPressed,
  },
  clearButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.button.secondaryText,
    fontWeight: theme.typography.fontWeight.semibold as any,
    fontFamily: theme.typography.fontFamily.ui,
  },
});
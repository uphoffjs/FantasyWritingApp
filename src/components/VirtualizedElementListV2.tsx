/**
 * VirtualizedElementList - High-performance element list with filtering
 * * Uses FlatList for virtualization on mobile, optimized for web
 * * Includes filtering by type and tags
 * * Mobile-first responsive design
 */

import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { WorldElement } from '../types/models';
import { ElementCard } from './ElementCard';
import { useTheme } from '../providers/ThemeProvider';
import { fantasyMasterColors } from '../constants/fantasyMasterColors';

import { getTestProps } from '../utils/react-native-web-polyfills';
interface VirtualizedElementListProps {
  elements: WorldElement[];
  onElementPress?: (element: WorldElement) => void;
  onCreateElement?: () => void;
  onRefresh?: () => Promise<void>;
  loading?: boolean;
  testID?: string;
}

// * Category filter options with fantasy colors
const CATEGORY_FILTERS = [
  { id: 'all', label: 'All', icon: '📚', color: null },
  { id: 'character', label: 'Characters', icon: '👤', color: fantasyMasterColors.elements.character },
  { id: 'location', label: 'Locations', icon: '📍', color: fantasyMasterColors.elements.location },
  { id: 'item', label: 'Items', icon: '🗝️', color: fantasyMasterColors.elements.item },
  { id: 'magic', label: 'Magic', icon: '✨', color: fantasyMasterColors.elements.magic },
  { id: 'creature', label: 'Creatures', icon: '🐉', color: fantasyMasterColors.elements.creature },
  { id: 'culture', label: 'Cultures', icon: '🌍', color: fantasyMasterColors.elements.culture },
  { id: 'organization', label: 'Organizations', icon: '🏛️', color: fantasyMasterColors.elements.organization },
];

// * Sort options
const SORT_OPTIONS = [
  { id: 'updated', label: 'Recently Updated' },
  { id: 'name', label: 'Name (A-Z)' },
  { id: 'completion', label: 'Completion %' },
  { id: 'created', label: 'Recently Created' },
];

export const VirtualizedElementList = memo(function VirtualizedElementList({
  elements = [],
  onElementPress,
  onCreateElement,
  onRefresh,
  loading = false,
  testID = 'virtualized-element-list',
}: VirtualizedElementListProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('updated');
  const [refreshing, setRefreshing] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // * Extract all unique tags from elements
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    elements.forEach(element => {
      element.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [elements]);

  // * Filter and sort elements
  const filteredElements = useMemo(() => {
    let filtered = [...elements];

    // * Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(element => 
        element.category === selectedCategory
      );
    }

    // * Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(element =>
        element.name.toLowerCase().includes(query) ||
        element.description?.toLowerCase().includes(query) ||
        element.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // * Apply tag filters
    if (selectedTags.length > 0) {
      filtered = filtered.filter(element =>
        selectedTags.every(tag => element.tags?.includes(tag))
      );
    }

    // * Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'completion':
          return (b.completionPercentage || 0) - (a.completionPercentage || 0);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return filtered;
  }, [elements, selectedCategory, searchQuery, selectedTags, sortBy]);

  // * Handle refresh
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
  }, [onRefresh]);

  // * Toggle tag selection
  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  // * Create dynamic styles based on theme
  const styles = useMemo(() => createStyles(theme), [theme]);

  // * Render individual element card
  const renderItem = useCallback(({ item }: { item: WorldElement }) => (
    <ElementCard
      element={item}
      onPress={() => onElementPress?.(item)}
    />
  ), [onElementPress]);

  // * Render empty state
  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.emptyStateText}>Loading elements...</Text>
        </View>
      );
    }

    const hasFilters = searchQuery || selectedCategory !== 'all' || selectedTags.length > 0;

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateIcon}>
          {hasFilters ? '🔍' : '📝'}
        </Text>
        <Text style={styles.emptyStateTitle}>
          {hasFilters ? 'No elements found' : 'No elements yet'}
        </Text>
        <Text style={styles.emptyStateText}>
          {hasFilters 
            ? 'Try adjusting your filters'
            : 'Create your first element to get started'
          }
        </Text>
        {!hasFilters && onCreateElement && (
          <Pressable 
            style={styles.createButton}
            onPress={onCreateElement}
            {...getTestProps('create-element-button')}
          >
            <Text style={styles.createButtonText}>Create Element</Text>
          </Pressable>
        )}
      </View>
    );
  };

  // * List header component with filters
  const ListHeaderComponent = useCallback(() => (
    <View style={styles.header}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search elements..."
          placeholderTextColor={theme.colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          {...getTestProps('element-search-input')}
        />
        {searchQuery.length > 0 && (
          <Pressable 
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
            {...getTestProps('clear-search-button')}
          >
            <Text style={styles.clearIcon}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Category Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
      >
        <View style={styles.categoryFilters}>
          {CATEGORY_FILTERS.map(category => (
            <Pressable
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
                selectedCategory === category.id && category.color && {
                  backgroundColor: category.color + '20',
                  borderColor: category.color,
                }
              ]}
              onPress={() => setSelectedCategory(category.id)}
              {...getTestProps(`category-filter-${category.id}`)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text 
                style={[
                  styles.categoryLabel,
                  selectedCategory === category.id && styles.categoryLabelActive,
                  selectedCategory === category.id && category.color && {
                    color: category.color,
                  }
                ]}
              >
                {category.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Tags Filter (if tags exist) */}
      {allTags.length > 0 && (
        <View style={styles.tagsSection}>
          <Text style={styles.sectionTitle}>Filter by Tags:</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tagsScrollView}
          >
            <View style={styles.tagsContainer}>
              {allTags.map(tag => (
                <Pressable
                  key={tag}
                  style={[
                    styles.tagChip,
                    selectedTags.includes(tag) && styles.tagChipActive
                  ]}
                  onPress={() => toggleTag(tag)}
                  {...getTestProps(`tag-filter-${tag}`)}
                >
                  <Text 
                    style={[
                      styles.tagText,
                      selectedTags.includes(tag) && styles.tagTextActive
                    ]}
                  >
                    #{tag}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Sort and Results Count */}
      <View style={styles.sortContainer}>
        <Text style={styles.resultsCount}>
          {filteredElements.length} {filteredElements.length === 1 ? 'element' : 'elements'}
        </Text>
        
        <View style={styles.sortButtonContainer}>
          <Pressable 
            style={styles.sortButton}
            onPress={() => setShowSortDropdown(!showSortDropdown)}
            {...getTestProps('sort-button')}
          >
            <Text style={styles.sortButtonText}>
              {SORT_OPTIONS.find(opt => opt.id === sortBy)?.label}
            </Text>
            <Text style={styles.sortIcon}>▼</Text>
          </Pressable>
          
          {showSortDropdown && (
            <View style={styles.sortDropdown}>
              {SORT_OPTIONS.map(option => (
                <Pressable
                  key={option.id}
                  style={[
                    styles.sortOption,
                    sortBy === option.id && styles.sortOptionActive
                  ]}
                  onPress={() => {
                    setSortBy(option.id);
                    setShowSortDropdown(false);
                  }}
                  {...getTestProps(`sort-option-${option.id}`)}
                >
                  <Text 
                    style={[
                      styles.sortOptionText,
                      sortBy === option.id && styles.sortOptionTextActive
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  ), [
    searchQuery,
    selectedCategory,
    selectedTags,
    sortBy,
    showSortDropdown,
    allTags,
    filteredElements.length,
    styles,
    theme,
    toggleTag,
  ]);

  return (
    <View style={styles.container} {...getTestProps(testID)}>
      <FlatList
        data={filteredElements}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          ) : undefined
        }
        contentContainerStyle={styles.listContentContainer}
        // * Performance optimizations
        removeClippedSubviews={Platform.OS === 'android'}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
      />

      {/* Floating Action Button */}
      {onCreateElement && filteredElements.length > 0 && (
        <Pressable
          style={styles.fab}
          onPress={onCreateElement}
          {...getTestProps('fab-create-element')}
        >
          <Text style={styles.fabIcon}>➕</Text>
        </Pressable>
      )}
    </View>
  );
});

// * Dynamic style creation based on theme
const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContentContainer: {
    paddingBottom: theme.spacing.xl * 2,
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface.backgroundElevated,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary.borderLight,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary.borderLight,
    paddingHorizontal: theme.spacing.sm,
    height: 44,
    marginBottom: theme.spacing.md,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: theme.spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    height: '100%',
    paddingVertical: 0,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  clearIcon: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  filterScrollView: {
    marginBottom: theme.spacing.sm,
  },
  categoryFilters: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary.borderLight,
    backgroundColor: theme.colors.background,
    gap: 4,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary.light + '20',
    borderColor: theme.colors.primary,
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  categoryLabelActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  tagsSection: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
  },
  tagsScrollView: {
    marginTop: theme.spacing.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  tagChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary.borderLight,
    backgroundColor: theme.colors.background,
  },
  tagChipActive: {
    backgroundColor: theme.colors.accent.secondary + '20',
    borderColor: theme.colors.accent.secondary,
  },
  tagText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  tagTextActive: {
    color: theme.colors.accent.secondary,
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  sortButtonContainer: {
    position: 'relative',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary.borderLight,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.xs,
  },
  sortButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
  },
  sortIcon: {
    fontSize: 10,
    color: theme.colors.text.secondary,
  },
  sortDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 4,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary.borderLight,
    ...Platform.select({
      web: {
        zIndex: 1000,
      },
      default: {
        elevation: 10,
      },
    }),
    minWidth: 160,
    shadowColor: theme.colors.effects.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sortOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary.borderLight,
  },
  sortOptionActive: {
    backgroundColor: theme.colors.primary.light + '10',
  },
  sortOptionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
  },
  sortOptionTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 3,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyStateTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  createButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  createButtonText: {
    color: '#fff',
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
      default: {
        elevation: 8,
      },
    }),
    shadowColor: theme.colors.effects.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: {
    fontSize: 24,
    color: '#fff',
  },
});
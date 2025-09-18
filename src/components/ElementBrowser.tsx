import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { WorldElement, ElementCategory } from '../types/models';
import { ElementCard } from './ElementCard';
import { getCategoryIcon } from '../utils/categoryMapping';

interface ElementBrowserProps {
  elements: WorldElement[];
  onElementPress?: (element: WorldElement) => void;
  onCreateElement?: () => void;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

// * Category filter options
const CATEGORY_FILTERS: Array<{ value: ElementCategory | 'all'; label: string; icon: string }> = [
  { value: 'all', label: 'All', icon: '📚' },
  { value: 'character', label: 'Characters', icon: '👤' },
  { value: 'location', label: 'Locations', icon: '📍' },
  { value: 'item-object', label: 'Items', icon: '🗝️' },
  { value: 'magic-power', label: 'Magic', icon: '✨' },
  { value: 'event', label: 'Events', icon: '📅' },
  { value: 'organization', label: 'Organizations', icon: '🏛️' },
  { value: 'creature-species', label: 'Creatures', icon: '🐉' },
  { value: 'culture-society', label: 'Cultures', icon: '🌍' },
  { value: 'religion-belief', label: 'Religions', icon: '⛪' },
  { value: 'language', label: 'Languages', icon: '💬' },
  { value: 'technology', label: 'Technology', icon: '⚙️' },
];

// * Sort options
const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'updated', label: 'Recently Updated' },
  { value: 'created', label: 'Recently Created' },
  { value: 'completion', label: 'Completion %' },
];

export function ElementBrowser({
  elements,
  onElementPress,
  onCreateElement,
  loading = false,
  refreshing = false,
  onRefresh,
}: ElementBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ElementCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'updated' | 'created' | 'completion'>('updated');
  const [showSortOptions, setShowSortOptions] = useState(false);

  // * Filter and sort elements
  const filteredElements = useMemo(() => {
    let filtered = [...elements];

    // * Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((e) => e.category === selectedCategory);
    }

    // * Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.description?.toLowerCase().includes(query) ||
          e.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // * Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'completion':
          return b.completionPercentage - a.completionPercentage;
        default:
          return 0;
      }
    });

    return filtered;
  }, [elements, selectedCategory, searchQuery, sortBy]);

  const renderElement = useCallback(
    ({ item }: { item: WorldElement }) => (
      <ElementCard
        element={item}
        icon={getCategoryIcon(item.category)}
        onPress={() => onElementPress?.(item)}
      />
    ),
    [onElementPress]
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" // ! HARDCODED: Should use design tokens
          color="#6366F1" />
          <Text style={styles.emptyText}>Loading elements...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📝</Text>
        <Text style={styles.emptyTitle}>
          {searchQuery || selectedCategory !== 'all'
            ? 'No elements found'
            : 'No elements yet'}
        </Text>
        <Text style={styles.emptyText}>
          {searchQuery || selectedCategory !== 'all'
            ? 'Try adjusting your filters'
            : 'Create your first element to get started'}
        </Text>
        {onCreateElement && !searchQuery && (
          <Pressable style={styles.createButton} onPress={onCreateElement}>
            <Text style={styles.createButtonText}>Create Element</Text>
          </Pressable>
        )}
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search elements..."
          // ! HARDCODED: Should use design tokens
          placeholderTextColor="#6B7280"
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

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORY_FILTERS}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.filterChip,
                selectedCategory === item.value && styles.filterChipSelected,
              ]}
              onPress={() => setSelectedCategory(item.value as ElementCategory | 'all')}
            >
              <Text style={styles.filterIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.filterLabel,
                  selectedCategory === item.value && styles.filterLabelSelected,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Pressable
          style={styles.sortButton}
          onPress={() => setShowSortOptions(!showSortOptions)}
        >
          <Text style={styles.sortIcon}>↕️</Text>
          <Text style={styles.sortText}>
            Sort by {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
          </Text>
        </Pressable>

        {/* Results Count */}
        <Text style={styles.resultCount}>
          {filteredElements.length} {filteredElements.length === 1 ? 'element' : 'elements'}
        </Text>
      </View>

      {/* Sort Dropdown */}
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
                setSortBy(option.value as typeof sortBy);
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

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredElements}
        renderItem={renderElement}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          filteredElements.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              // ! HARDCODED: Should use design tokens
              tintColor="#6366F1"
              // ! HARDCODED: Should use design tokens
              colors={['#6366F1']}
            />
          ) : undefined
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS === 'android'}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
      />

      {/* Floating Action Button */}
      {onCreateElement && filteredElements.length > 0 && (
        <Pressable style={styles.fab} onPress={onCreateElement}>
          <Text style={styles.fabIcon}>+</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#111827',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#1F2937',
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
    height: 40,
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
    fontSize: 14,
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 16,
    // ! HARDCODED: Should use design tokens
    color: '#6B7280',
  },
  filterContainer: {
    marginBottom: 12,
  },
  filterList: {
    paddingVertical: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#1F2937',
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipSelected: {
    backgroundColor: '// ! HARDCODED: Should use design tokens
      #4338CA20',
    // ! HARDCODED: Should use design tokens
    borderColor: '#6366F1',
  },
  filterIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  filterLabel: {
    fontSize: 12,
    // ! HARDCODED: Should use design tokens
    color: '#9CA3AF',
    fontWeight: '500',
  },
  filterLabelSelected: {
    // ! HARDCODED: Should use design tokens
    color: '#6366F1',
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#1F2937',
    borderRadius: 6,
  },
  sortIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  sortText: {
    fontSize: 12,
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
  },
  resultCount: {
    fontSize: 12,
    // ! HARDCODED: Should use design tokens
    color: '#6B7280',
  },
  sortDropdown: {
    position: 'absolute',
    top: 140,
    left: 16,
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#1F2937',
    borderRadius: 8,
    borderWidth: 1,
    // ! HARDCODED: Should use design tokens
    borderColor: '#374151',
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
  sortOptionSelected: {
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#374151',
  },
  sortOptionText: {
    fontSize: 14,
    // ! HARDCODED: Should use design tokens
    color: '#9CA3AF',
  },
  sortOptionTextSelected: {
    // ! HARDCODED: Should use design tokens
    color: '#6366F1',
    fontWeight: '600',
  },
  checkIcon: {
    fontSize: 12,
    // ! HARDCODED: Should use design tokens
    color: '#6366F1',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  listContentEmpty: {
    flex: 1,
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
    fontWeight: '600',
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    // ! HARDCODED: Should use design tokens
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#6366F1',
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    // ! HARDCODED: Should use design tokens
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  fabIcon: {
    fontSize: 28,
    // ! HARDCODED: Should use design tokens
    color: '#FFFFFF',
    fontWeight: '300',
  },
});
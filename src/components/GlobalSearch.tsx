import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp } from '../navigation/types';
import { useSearch } from './SearchProvider';
import { WorldElement, Project } from '../types/models';
import { getCategoryIcon } from '../utils/categoryMapping';
import { useTheme } from '../providers/ThemeProvider';
import { useSearchDebounce } from '../hooks/useDebounce';

interface GlobalSearchProps {
  visible: boolean;
  onClose: () => void;
}

// * Storage key for recent searches
const RECENT_SEARCHES_KEY = '@FantasyWritingApp:recentSearches';
const MAX_RECENT_SEARCHES = 10;

type SearchResult = 
  | { type: 'project'; item: Project }
  | { type: 'element'; item: WorldElement };

export function GlobalSearch({ visible, onClose }: GlobalSearchProps) {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { searchQuery, setSearchQuery, searchAll } = useSearch();
  const {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
    isSearching: isDebouncing
  } = useSearchDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecent, setShowRecent] = useState(true);
  const searchInputRef = useRef<TextInput>(null);

  // * Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // * Add keyboard shortcut listener for Command+K or Ctrl+K
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyDown = (event: KeyboardEvent) => {
        // * Check for Command+K (Mac) or Ctrl+K (Windows/Linux)
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
          event.preventDefault();
          if (!visible) {
            // * This would need to be handled at a higher level
            // * to actually open the modal
          } else {
            searchInputRef.current?.focus();
          }
        }
        // * ESC to close
        if (event.key === 'Escape' && visible) {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [visible, onClose]);

  // * Perform search when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      performSearch();
      setShowRecent(false);
    } else {
      setSearchResults([]);
      setShowRecent(true);
    }
  }, [debouncedSearchTerm]);

  // * Load recent searches from AsyncStorage
  const loadRecentSearches = async () => {
    try {
      const saved = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      // ! Failed to load recent searches
      console.error('Failed to load recent searches:', error);
    }
  };

  // * Save recent searches to AsyncStorage
  const saveRecentSearch = async (query: string) => {
    if (!query.trim()) return;
    
    try {
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, MAX_RECENT_SEARCHES);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      // ! Failed to save recent search
      console.error('Failed to save recent search:', error);
    }
  };

  // * Clear recent searches
  const clearRecentSearches = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      // ! Failed to clear recent searches
      console.error('Failed to clear recent searches:', error);
    }
  };

  const performSearch = useCallback(() => {
    setIsSearching(true);
    setSearchQuery(debouncedSearchTerm);
    
    const { elements, projects } = searchAll();
    
    const results: SearchResult[] = [
      ...projects.map(p => ({ type: 'project' as const, item: p })),
      ...elements.map(e => ({ type: 'element' as const, item: e })),
    ];
    
    setSearchResults(results);
    setIsSearching(false);
    
    // * Save to recent searches
    if (debouncedSearchTerm.trim() && results.length > 0) {
      saveRecentSearch(debouncedSearchTerm.trim());
    }
  }, [debouncedSearchTerm, searchAll, setSearchQuery]);

  const handleResultPress = (result: SearchResult) => {
    onClose();
    
    if (result.type === 'project') {
      navigation.navigate('Project', { projectId: result.item.id });
    } else {
      // * Navigate to element editor
      // TODO: * You might need to navigate to the project first, then the element
      navigation.navigate('Element', { elementId: result.item.id });
    }
  };

  // * Handle recent search selection
  const handleRecentSearchPress = (search: string) => {
    setLocalQuery(search);
    setShowRecent(false);
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => {
    const styles = getStyles(theme);
    
    if (item.type === 'project') {
      const project = item.item;
      return (
        <Pressable
          style={({ pressed }) => [
            styles.resultItem,
            pressed && styles.resultItemPressed,
          ]}
          onPress={() => handleResultPress(item)}
          testID={`search-result-project-${project.id}`}
        >
          <View style={styles.resultIcon}>
            <Text style={styles.resultIconText}>📚</Text>
          </View>
          <View style={styles.resultContent}>
            <Text style={styles.resultTitle}>{project.name}</Text>
            <Text style={styles.resultSubtitle}>
              Project • {project.elements?.length || 0} elements
            </Text>
            {project.description && (
              <Text style={styles.resultDescription} numberOfLines={2}>
                {project.description}
              </Text>
            )}
          </View>
        </Pressable>
      );
    } else {
      const element = item.item;
      return (
        <Pressable
          style={({ pressed }) => [
            styles.resultItem,
            pressed && styles.resultItemPressed,
          ]}
          onPress={() => handleResultPress(item)}
          testID={`search-result-element-${element.id}`}
        >
          <View style={styles.resultIcon}>
            <Text style={styles.resultIconText}>
              {getCategoryIcon(element.category)}
            </Text>
          </View>
          <View style={styles.resultContent}>
            <Text style={styles.resultTitle}>{element.name}</Text>
            <Text style={styles.resultSubtitle}>
              {element.category} • {element.completionPercentage}% complete
            </Text>
            {element.description && (
              <Text style={styles.resultDescription} numberOfLines={2}>
                {element.description}
              </Text>
            )}
          </View>
        </Pressable>
      );
    }
  };

  // * Render recent search item
  const renderRecentSearch = ({ item }: { item: string }) => {
    const styles = getStyles(theme);
    
    return (
      <Pressable
        style={({ pressed }) => [
          styles.recentItem,
          pressed && styles.recentItemPressed,
        ]}
        onPress={() => handleRecentSearchPress(item)}
        testID={`recent-search-${item}`}
      >
        <Text style={styles.recentIcon}>🕐</Text>
        <Text style={styles.recentText} numberOfLines={1}>
          {item}
        </Text>
      </Pressable>
    );
  };

  const renderEmpty = () => {
    const styles = getStyles(theme);
    
    if (!localQuery.trim()) {
      if (showRecent && recentSearches.length > 0) {
        return (
          <View style={styles.recentContainer}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>Recent Searches</Text>
              <Pressable onPress={clearRecentSearches} testID="clear-recent-searches">
                <Text style={styles.clearText}>Clear</Text>
              </Pressable>
            </View>
            <FlatList
              data={recentSearches}
              renderItem={renderRecentSearch}
              keyExtractor={(item, index) => `recent-${item}-${index}`}
              showsVerticalScrollIndicator={false}
              testID="recent-searches-list"
            />
          </View>
        );
      }
      
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Search Everything</Text>
          <Text style={styles.emptyText}>
            Search across all your projects and elements
          </Text>
          <Text style={styles.shortcutHint}>
            {Platform.OS === 'web' ? 'Press ⌘K to open search' : 'Start typing to search'}
          </Text>
        </View>
      );
    }

    if (isSearching) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Searching...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🔎</Text>
        <Text style={styles.emptyTitle}>No Results</Text>
        <Text style={styles.emptyText}>
          No projects or elements match "{searchTerm}"
        </Text>
      </View>
    );
  };

  const styles = getStyles(theme);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      testID="global-search-modal"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        testID="global-search-keyboard-avoiding"
      >
        <Pressable 
          style={styles.backdrop} 
          onPress={onClose}
          testID="global-search-backdrop"
        />
        
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Search projects and elements..."
                placeholderTextColor={theme.colors.text.tertiary}
                value={searchTerm}
                onChangeText={setSearchTerm}
                autoFocus
                autoCorrect={false}
                autoCapitalize="none"
                testID="global-search-input"
              />
              {searchTerm.length > 0 && (
                <Pressable
                  onPress={() => setSearchTerm('')}
                  style={styles.clearButton}
                  testID="global-search-clear-button"
                >
                  <Text style={styles.clearIcon}>✕</Text>
                </Pressable>
              )}
            </View>
            <Pressable 
              onPress={onClose} 
              style={styles.cancelButton}
              testID="global-search-cancel-button"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>

          {/* Results */}
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item, index) => 
              `${item.type}-${item.item.id}-${index}`
            }
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={[
              styles.listContent,
              searchResults.length === 0 && styles.listContentEmpty,
            ]}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            testID="global-search-results-list"
          />

          {/* Result Count or Keyboard Shortcut Hint */}
          <View style={styles.footer}>
            {searchResults.length > 0 ? (
              <Text style={styles.resultCount}>
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </Text>
            ) : (
              Platform.OS === 'web' && (
                <Text style={styles.keyboardHint}>
                  Press ESC to close • ⌘K to focus search
                </Text>
              )
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// * Create theme-aware styles
const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.surface.overlay,
  },
  modalContent: {
    flex: 1,
    backgroundColor: theme.colors.surface.modal,
    marginTop: Platform.OS === 'ios' ? 50 : 20,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    shadowColor: theme.colors.effects.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary.border,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface.backgroundAlt,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    height: 40,
    borderWidth: 1,
    borderColor: theme.colors.primary.borderLight,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.body,
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 16,
    color: theme.colors.text.tertiary,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.accent.swiftness,
    fontWeight: theme.typography.fontWeight.semibold as any,
    fontFamily: theme.typography.fontFamily.ui,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary.borderLight,
  },
  resultItemPressed: {
    backgroundColor: theme.colors.surface.cardHover,
    borderColor: theme.colors.metal.gold,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.metal.goldDark,
  },
  resultIconText: {
    fontSize: 20,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: 2,
    fontFamily: theme.typography.fontFamily.heading,
  },
  resultSubtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginBottom: 4,
    fontFamily: theme.typography.fontFamily.ui,
  },
  resultDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    lineHeight: 18,
    fontFamily: theme.typography.fontFamily.body,
  },
  separator: {
    height: theme.spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.heading,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.body,
  },
  shortcutHint: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.ui,
  },
  footer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.primary.borderLight,
  },
  resultCount: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.ui,
  },
  keyboardHint: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.ui,
  },
  // * Recent searches styles
  recentContainer: {
    flex: 1,
    paddingTop: theme.spacing.md,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  recentTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.heading,
  },
  clearText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.accent.swiftness,
    fontFamily: theme.typography.fontFamily.ui,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    backgroundColor: theme.colors.surface.backgroundAlt,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  recentItemPressed: {
    backgroundColor: theme.colors.surface.cardHover,
    borderColor: theme.colors.metal.goldDark,
  },
  recentIcon: {
    fontSize: 16,
    marginRight: theme.spacing.xs,
  },
  recentText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.body,
  },
});
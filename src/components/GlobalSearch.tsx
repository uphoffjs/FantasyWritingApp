import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../navigation/types';
import { useSearch } from './SearchProvider';
import { WorldElement, Project } from '../types/models';
import { getCategoryIcon } from '../utils/categoryMapping';

interface GlobalSearchProps {
  visible: boolean;
  onClose: () => void;
}

type SearchResult = 
  | { type: 'project'; item: Project }
  | { type: 'element'; item: WorldElement };

export function GlobalSearch({ visible, onClose }: GlobalSearchProps) {
  const navigation = useNavigation<NavigationProp>();
  const { searchQuery, setSearchQuery, searchAll } = useSearch();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery.trim()) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery]);

  const performSearch = useCallback(() => {
    setIsSearching(true);
    setSearchQuery(localQuery);
    
    const { elements, projects } = searchAll();
    
    const results: SearchResult[] = [
      ...projects.map(p => ({ type: 'project' as const, item: p })),
      ...elements.map(e => ({ type: 'element' as const, item: e })),
    ];
    
    setSearchResults(results);
    setIsSearching(false);
  }, [localQuery, searchAll, setSearchQuery]);

  const handleResultPress = (result: SearchResult) => {
    onClose();
    
    if (result.type === 'project') {
      navigation.navigate('Project', { projectId: result.item.id });
    } else {
      // Navigate to element editor
      // You might need to navigate to the project first, then the element
      navigation.navigate('Element', { elementId: result.item.id });
    }
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => {
    if (item.type === 'project') {
      const project = item.item;
      return (
        <Pressable
          style={styles.resultItem}
          onPress={() => handleResultPress(item)}
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
          style={styles.resultItem}
          onPress={() => handleResultPress(item)}
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

  const renderEmpty = () => {
    if (!localQuery.trim()) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Search Everything</Text>
          <Text style={styles.emptyText}>
            Search across all your projects and elements
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
          No projects or elements match "{localQuery}"
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search projects and elements..."
                placeholderTextColor="#6B7280"
                value={localQuery}
                onChangeText={setLocalQuery}
                autoFocus
                autoCorrect={false}
                autoCapitalize="none"
              />
              {localQuery.length > 0 && (
                <Pressable
                  onPress={() => setLocalQuery('')}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearIcon}>✕</Text>
                </Pressable>
              )}
            </View>
            <Pressable onPress={onClose} style={styles.cancelButton}>
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
          />

          {/* Result Count */}
          {searchResults.length > 0 && (
            <View style={styles.footer}>
              <Text style={styles.resultCount}>
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#111827',
    marginTop: Platform.OS === 'ios' ? 50 : 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
    height: 40,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#F9FAFB',
    fontSize: 14,
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 16,
    color: '#6B7280',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultIconText: {
    fontSize: 20,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  resultCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});
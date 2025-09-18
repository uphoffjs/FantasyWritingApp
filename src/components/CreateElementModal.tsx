import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useWorldbuildingStore } from '../store/worldbuildingStore';
import { ElementCategory } from '../types/models';
import { getCategoryIcon } from '../utils/categoryMapping';

interface CreateElementModalProps {
  visible: boolean;
  projectId: string;
  onClose: () => void;
  onSuccess?: (elementId: string) => void;
}

// * Element categories with icons
const ELEMENT_CATEGORIES = [
  { value: 'character', label: 'Character', icon: '👤', description: 'Protagonists, antagonists, supporting characters' },
  { value: 'location', label: 'Location', icon: '📍', description: 'Cities, buildings, landmarks' },
  { value: 'item-object', label: 'Item/Object', icon: '🗝️', description: 'Weapons, artifacts, tools' },
  { value: 'magic-power', label: 'Magic/Power', icon: '✨', description: 'Magical systems, abilities' },
  { value: 'event', label: 'Event', icon: '📅', description: 'Historical events, battles' },
  { value: 'organization', label: 'Organization', icon: '🏛️', description: 'Groups, factions, guilds' },
  { value: 'creature-species', label: 'Creature/Species', icon: '🐉', description: 'Monsters, races, animals' },
  { value: 'culture-society', label: 'Culture/Society', icon: '🌍', description: 'Civilizations, customs' },
  { value: 'religion-belief', label: 'Religion/Belief', icon: '⛪', description: 'Faiths, philosophies' },
  { value: 'language', label: 'Language', icon: '💬', description: 'Languages, dialects' },
  { value: 'technology', label: 'Technology', icon: '⚙️', description: 'Tools, inventions' },
  { value: 'custom', label: 'Custom', icon: '📝', description: 'Create your own category' },
];

// * Generate a unique default name for an element
function generateDefaultElementName(
  projectId: string,
  category: ElementCategory | 'custom'
): string {
  const state = useWorldbuildingStore.getState();
  const project = state.projects.find((p) => p.id === projectId);
  if (!project) return 'Untitled Element';

  const elements = project.elements.filter((e) => e.category === category);
  const categoryInfo = ELEMENT_CATEGORIES.find((c) => c.value === category);
  const categoryLabel = categoryInfo?.label || 'Element';

  // * Get all existing numbers for this category type
  const existingNumbers = elements
    .map((e) => {
      const match = e.name.match(new RegExp(`^Untitled ${categoryLabel} (\\d+)$`));
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);

  // * Find the next available number
  let nextNumber = 1;
  if (existingNumbers.length > 0) {
    const maxNumber = Math.max(...existingNumbers);
    for (let i = 1; i <= maxNumber + 1; i++) {
      if (!existingNumbers.includes(i)) {
        nextNumber = i;
        break;
      }
    }
  }

  return `Untitled ${categoryLabel} ${nextNumber}`;
}

export function CreateElementModal({
  visible,
  projectId,
  onClose,
  onSuccess,
}: CreateElementModalProps) {
  const { createElement } = useWorldbuildingStore();
  const [selectedCategory, setSelectedCategory] = useState<ElementCategory | 'custom' | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!selectedCategory || isCreating) return;

    setIsCreating(true);
    try {
      const defaultName = generateDefaultElementName(projectId, selectedCategory);
      // * For now, treat 'custom' as 'item-object' until we have proper custom type support
      const elementCategory: ElementCategory =
        selectedCategory === 'custom' ? 'item-object' : selectedCategory;
      
      const newElement = await createElement(projectId, defaultName, elementCategory);
      
      // * Small delay for visual feedback
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      onSuccess?.(newElement.id);
      handleClose();
      
      if (Platform.OS !== 'web') {
        Alert.alert('Success', `Created "${defaultName}"`);
      }
    } catch (error) {
      console.error('Failed to create element:', error);
      Alert.alert('Error', 'Failed to create element. Please try again.');
    } finally {
      setIsCreating(false);
    }
  }, [selectedCategory, projectId, createElement, onSuccess, isCreating]);

  const handleClose = () => {
    setSelectedCategory(null);
    onClose();
  };

  const handleCategoryPress = (category: ElementCategory | 'custom') => {
    setSelectedCategory(category);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.backdrop} onPress={handleClose} />

          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.dragIndicator} />
              <Text style={styles.title}>Create New Element</Text>
              <Pressable onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeIcon}>✕</Text>
              </Pressable>
            </View>

            {/* Instructions */}
            <Text style={styles.instructions}>
              Choose a category for your new element
            </Text>

            {/* Category Grid */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.categoryGrid}>
                {ELEMENT_CATEGORIES.map((category) => (
                  <Pressable
                    key={category.value}
                    style={[
                      styles.categoryCard,
                      selectedCategory === category.value && styles.categoryCardSelected,
                    ]}
                    onPress={() => handleCategoryPress(category.value as ElementCategory | 'custom')}
                    data-cy={`category-${category.value}`}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text
                      style={[
                        styles.categoryLabel,
                        selectedCategory === category.value && styles.categoryLabelSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {category.label}
                    </Text>
                    <Text
                      style={[
                        styles.categoryDescription,
                        selectedCategory === category.value && styles.categoryDescriptionSelected,
                      ]}
                      numberOfLines={2}
                    >
                      {category.description}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.button,
                  styles.createButton,
                  (!selectedCategory || isCreating) && styles.buttonDisabled,
                ]}
                onPress={handleCreate}
                disabled={!selectedCategory || isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator size="small" // ! HARDCODED: Should use design tokens
          color="#FFFFFF" />
                ) : (
                  <Text style={styles.createButtonText}>
                    {selectedCategory ? 'Create Element' : 'Select a Category'}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
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
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#4B5563',
    borderRadius: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 24,
    padding: 8,
  },
  closeIcon: {
    fontSize: 24,
    // ! HARDCODED: Should use design tokens
    color: '#9CA3AF',
  },
  instructions: {
    fontSize: 14,
    // ! HARDCODED: Should use design tokens
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryCardSelected: {
    // ! HARDCODED: Should use design tokens
    borderColor: '#6366F1',
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#4338CA20',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryLabelSelected: {
    // ! HARDCODED: Should use design tokens
    color: '#6366F1',
  },
  categoryDescription: {
    fontSize: 11,
    // ! HARDCODED: Should use design tokens
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 14,
  },
  categoryDescriptionSelected: {
    // ! HARDCODED: Should use design tokens
    color: '#9CA3AF',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#374151',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
  },
  createButton: {
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#6366F1',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    // ! HARDCODED: Should use design tokens
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
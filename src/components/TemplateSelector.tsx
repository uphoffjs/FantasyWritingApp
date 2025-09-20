import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { QuestionnaireTemplate, ElementCategory } from '../types/models';
import { useWorldbuildingStore } from '../store/worldbuildingStore';
import { DEFAULT_TEMPLATES } from '../types/worldbuilding';

interface TemplateSelectorProps {
  category: ElementCategory;
  onSelectTemplate: (template: QuestionnaireTemplate) => void;
  onClose: () => void;
  visible: boolean;
}

export function TemplateSelector({
  category,
  onSelectTemplate,
  onClose,
  visible,
}: TemplateSelectorProps) {
  const { templates = [] } = useWorldbuildingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: * Filter templates by category and search query
  const filteredTemplates = useMemo(() => {
    const categoryTemplates = templates.filter(t => t.category === category);
    
    // TODO: * Add default template if it exists
    const defaultTemplate = DEFAULT_TEMPLATES[category];
    if (defaultTemplate && defaultTemplate.questions?.length > 0) {
      const defaultWithId: QuestionnaireTemplate = {
        id: `default-${category}`,
        name: defaultTemplate.name || `Default ${category} Template`,
        description: defaultTemplate.description || '',
        category,
        questions: defaultTemplate.questions,
        isDefault: true,
        author: 'System',
        tags: ['default', 'starter'],
      };
      categoryTemplates.unshift(defaultWithId);
    }

    if (!searchQuery) return categoryTemplates;

    const query = searchQuery.toLowerCase();
    return categoryTemplates.filter(
      t =>
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [templates, category, searchQuery]);

  const handleSelectTemplate = () => {
    const selected = filteredTemplates.find(t => t.id === selectedTemplateId);
    if (selected) {
      onSelectTemplate(selected);
      onClose();
    }
  };

  const renderTemplate = (template: QuestionnaireTemplate) => {
    const isSelected = template.id === selectedTemplateId;

    return (
      <Pressable
        key={template.id}
        style={[styles.templateCard, isSelected && styles.templateCardSelected]}
        testID={`template-card-${template.id}`}
        onPress={() => setSelectedTemplateId(template.id)}
      >
        <View style={styles.templateHeader}>
          <Text style={styles.templateName}>{template.name}</Text>
          {template.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>

        {template.description && (
          <Text style={styles.templateDescription} numberOfLines={2}>
            {template.description}
          </Text>
        )}

        <View style={styles.templateMeta}>
          <Text style={styles.templateMetaText}>
            {template.questions.length} questions
          </Text>
          {template.author && (
            <Text style={styles.templateMetaText}>by {template.author}</Text>
          )}
        </View>

        {template.tags && template.tags.length > 0 && (
          <View style={styles.templateTags}>
            {template.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {template.metadata?.difficulty && (
          <View style={styles.difficultyContainer}>
            <Text style={styles.difficultyLabel}>Difficulty:</Text>
            <Text style={[
              styles.difficultyText,
              template.metadata.difficulty === 'beginner' && styles.difficultyBeginner,
              template.metadata.difficulty === 'intermediate' && styles.difficultyIntermediate,
              template.metadata.difficulty === 'advanced' && styles.difficultyAdvanced,
            ]}>
              {template.metadata.difficulty}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Template</Text>
            <Pressable onPress={onClose} style={styles.closeButton} testID="template-selector-close-button">
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.subtitle}>
            Choose a template for your {category} element
          </Text>

          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search templates..."
              testID="template-search-input" placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large"
          color="#6366F1" />
              <Text style={styles.loadingText}>Loading templates...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.templateList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.templateListContent}
            >
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map(renderTemplate)
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>📋</Text>
                  <Text style={styles.emptyTitle}>No Templates Found</Text>
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? ' // ! HARDCODED: Should use design tokensTry adjusting your search'
                      : `No templates available for ${category}`}
                  </Text>
                </View>
              )}
            </ScrollView>
          )}

          <View style={styles.footer}>
            <Pressable
              style={styles.cancelButton}
              onPress={onClose}
              testID="template-selector-cancel-button"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[
                styles.selectButton,
                !selectedTemplateId && styles.selectButtonDisabled,
              ]}
              onPress={handleSelectTemplate}
              disabled={!selectedTemplateId}
              testID="template-selector-use-button"
            >
              <Text style={styles.selectButtonText}>
                Use Template
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: { backgroundColor: '#111827', // ! HARDCODED: Should use design tokens
    borderRadius: 16,
    width: '90%',
    maxWidth: 600,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700', color: '#F9FAFB', // ! HARDCODED: Should use design tokens
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 24, color: '#6B7280', // ! HARDCODED: Should use design tokens
  },
  subtitle: {
    fontSize: 14, color: '#9CA3AF', // ! HARDCODED: Should use design tokens
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center', backgroundColor: '#1F2937', // ! HARDCODED: Should use design tokens
    borderRadius: 8,
    marginHorizontal: 24,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 20,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1, color: '#F9FAFB', // ! HARDCODED: Should use design tokens
    fontSize: 14,
  },
  templateList: {
    flex: 1,
  },
  templateListContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  templateCard: { backgroundColor: '#1F2937', // ! HARDCODED: Should use design tokens
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  templateCardSelected: { borderColor: '#6366F1', // ! HARDCODED: Should use design tokens backgroundColor: '#1F293780', // ! HARDCODED: Should use design tokens
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600', color: '#F9FAFB', // ! HARDCODED: Should use design tokens
    flex: 1,
  },
  defaultBadge: { backgroundColor: '#059669', // ! HARDCODED: Should use design tokens
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '600', color: '#FFFFFF', // ! HARDCODED: Should use design tokens
  },
  templateDescription: {
    fontSize: 13, color: '#9CA3AF', // ! HARDCODED: Should use design tokens
    marginBottom: 12,
    lineHeight: 18,
  },
  templateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  templateMetaText: {
    fontSize: 12, color: '#6B7280', // ! HARDCODED: Should use design tokens
  },
  templateTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: { backgroundColor: '#374151', // ! HARDCODED: Should use design tokens
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 11, color: '#9CA3AF', // ! HARDCODED: Should use design tokens
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  difficultyLabel: {
    fontSize: 12, color: '#6B7280', // ! HARDCODED: Should use design tokens
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  difficultyBeginner: { color: '#10B981', // ! HARDCODED: Should use design tokens
  },
  difficultyIntermediate: { color: '#F59E0B', // ! HARDCODED: Should use design tokens
  },
  difficultyAdvanced: { color: '#EF4444', // ! HARDCODED: Should use design tokens
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14, color: '#6B7280', // ! HARDCODED: Should use design tokens
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600', color: '#F9FAFB', // ! HARDCODED: Should use design tokens
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14, color: '#6B7280', // ! HARDCODED: Should use design tokens
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1, borderColor: '#4B5563', // ! HARDCODED: Should use design tokens
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600', color: '#D1D5DB', // ! HARDCODED: Should use design tokens
  },
  selectButton: { backgroundColor: '#6366F1', // ! HARDCODED: Should use design tokens
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  selectButtonDisabled: { backgroundColor: '#4B5563', // ! HARDCODED: Should use design tokens
    opacity: 0.5,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600', color: '#FFFFFF', // ! HARDCODED: Should use design tokens
  },
});
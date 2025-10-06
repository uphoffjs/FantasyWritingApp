/* eslint-disable @typescript-eslint/no-explicit-any */
// ! fontWeight type assertions required due to React Native TypeScript limitations

import React, { useState } from 'react';
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
} from 'react-native';
import { TextInput } from './TextInput';
import { Button } from './Button';
import { ImagePicker } from './ImagePicker';
import { useWorldbuildingStore } from '../store/worldbuildingStore';
import { useTheme, Theme } from '../providers/ThemeProvider';
import { getTestProps } from '../utils/react-native-web-polyfills';

interface CreateProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onProjectCreated?: (projectId: string) => void;
}

const genres = [
  'Fantasy',
  'Sci-Fi',
  'Horror',
  'Mystery',
  'Romance',
  'Historical',
  'Urban Fantasy',
  'Dystopian',
  'Post-Apocalyptic',
  'Steampunk',
  'Cyberpunk',
  'Other',
];

const statuses = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'revision', label: 'Revision' },
  { value: 'completed', label: 'Completed' },
];

// * Project templates for quick start
const projectTemplates = [
  { 
    id: 'fantasy-epic', 
    name: 'Epic Fantasy', 
    description: 'Multi-book saga with complex world-building',
    icon: '⚔️',
    genre: 'Fantasy',
    starter: true,
  },
  { 
    id: 'urban-fantasy', 
    name: 'Urban Fantasy', 
    description: 'Modern world with hidden magic',
    icon: '🏙️',
    genre: 'Urban Fantasy',
    starter: true,
  },
  { 
    id: 'sci-fi-space', 
    name: 'Space Opera', 
    description: 'Galactic adventures and alien civilizations',
    icon: '🚀',
    genre: 'Sci-Fi',
    starter: true,
  },
  { 
    id: 'mystery', 
    name: 'Mystery Thriller', 
    description: 'Crime solving and suspenseful investigations',
    icon: '🔍',
    genre: 'Mystery',
    starter: false,
  },
  { 
    id: 'dystopian', 
    name: 'Dystopian Future', 
    description: 'Post-apocalyptic or oppressive societies',
    icon: '🏚️',
    genre: 'Dystopian',
    starter: false,
  },
  { 
    id: 'blank', 
    name: 'Blank Project', 
    description: 'Start from scratch with no template',
    icon: '📝',
    genre: '',
    starter: false,
  },
];

export function CreateProjectModal({
  visible,
  onClose,
  onProjectCreated,
}: CreateProjectModalProps) {
  const { theme } = useTheme();
  const { createProject } = useWorldbuildingStore();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    genre: '',
    status: 'planning',
    coverImage: undefined as string | undefined,
    template: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    if (formData.name.length > 100) {
      newErrors.name = 'Project name must be less than 100 characters';
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }

    setIsCreating(true);
    try {
      // * Fix: createProject expects two arguments (name, description), not an object
      const projectId = createProject(
        formData.name.trim(),
        formData.description.trim()
      );
      
      onProjectCreated?.(projectId);
      handleClose();
      
      if (Platform.OS !== 'web') {
        Alert.alert('Success', 'Project created successfully!');
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      Alert.alert('Error', 'Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      genre: '',
      status: 'planning',
      coverImage: undefined,
      template: '',
    });
    setSelectedTemplate('');
    setErrors({});
    onClose();
  };

  // * Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = projectTemplates.find(t => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        template: templateId,
        genre: template.genre || formData.genre,
      });
    }
  };

  const styles = getStyles(theme);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
      {...getTestProps('create-project-modal')}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.backdrop} onPress={handleClose} {...getTestProps('create-project-backdrop')} />
          
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>✨ Create New Project</Text>
                <Pressable onPress={handleClose} style={styles.closeButton} {...getTestProps('create-project-close-button')}>
                  <Text style={styles.closeIcon}>✕</Text>
                </Pressable>
              </View>

              {/* Template Selection */}
              <View style={styles.templateSection}>
                <Text style={styles.sectionTitle}>Choose a Template</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.templateScroll}
                >
                  <View style={styles.templateContainer}>
                    {projectTemplates.map((template) => (
                      <Pressable
                        key={template.id}
                        style={[
                          styles.templateCard,
                          selectedTemplate === template.id && styles.templateCardSelected,
                        ]}
                        onPress={() => handleTemplateSelect(template.id)}
                        {...getTestProps(`template-${template.id}`)}
                      >
                        <Text style={styles.templateIcon}>{template.icon}</Text>
                        <Text style={[
                          styles.templateName,
                          selectedTemplate === template.id && styles.templateNameSelected,
                        ]}>{template.name}</Text>
                        {template.starter && (
                          <View style={styles.starterBadge}>
                            <Text style={styles.starterBadgeText}>STARTER</Text>
                          </View>
                        )}
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
                {selectedTemplate && (
                  <Text style={styles.templateDescription}>
                    {projectTemplates.find(t => t.id === selectedTemplate)?.description}
                  </Text>
                )}
              </View>

              {/* Form */}
              <View style={styles.form}>
                {/* Project Name */}
                <TextInput
                  label="Project Name *"
                  value={formData.name}
                  onChangeText={(text) => {
                    setFormData({ ...formData, name: text });
                    if (errors.name) {
                      setErrors({ ...errors, name: '' });
                    }
                  }}
                  placeholder="Enter project name"
                  error={errors.name}
                  autoFocus
                  {...getTestProps('create-project-name-input')}
                />

                {/* Description */}
                <TextInput
                  label="Description"
                  value={formData.description}
                  onChangeText={(text) => {
                    setFormData({ ...formData, description: text });
                    if (errors.description) {
                      setErrors({ ...errors, description: '' });
                    }
                  }}
                  placeholder="Brief description of your project"
                  multiline
                  numberOfLines={4}
                  error={errors.description}
                  {...getTestProps('create-project-description-input')}
                />

                {/* Cover Image */}
                <ImagePicker
                  value={formData.coverImage}
                  onChange={(imageUri) => setFormData({ ...formData, coverImage: imageUri })}
                  label="Cover Image (Optional)"
                  placeholder="Add a cover image"
                  {...getTestProps('create-project-cover-image')}
                />

                {/* Genre Selection */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Genre</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.genreScroll}
                  >
                    <View style={styles.genreContainer}>
                      {genres.map((genre) => (
                        <Pressable
                          key={genre}
                          style={[
                            styles.genreChip,
                            formData.genre === genre && styles.genreChipSelected,
                          ]}
                          onPress={() => setFormData({ ...formData, genre })}
                          {...getTestProps(`genre-chip-${genre.toLowerCase().replace(/\s+/g, '-')}`)}
                        >
                          <Text
                            style={[
                              styles.genreText,
                              formData.genre === genre && styles.genreTextSelected,
                            ]}
                          >
                            {genre}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* Status Selection */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Status</Text>
                  <View style={styles.statusContainer}>
                    {statuses.map((status) => (
                      <Pressable
                        key={status.value}
                        style={[
                          styles.statusOption,
                          formData.status === status.value && styles.statusOptionSelected,
                        ]}
                        onPress={() => setFormData({ ...formData, status: status.value })}
                        {...getTestProps(`status-option-${status.value}`)}
                      >
                        <View style={styles.radioCircle}>
                          {formData.status === status.value && (
                            <View style={styles.radioInner} />
                          )}
                        </View>
                        <Text style={styles.statusText}>{status.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <Button
                  title="Cancel"
                  onPress={handleClose}
                  variant="secondary"
                  size="medium"
                  {...getTestProps('create-project-cancel-button')}
                />
                <Button
                  title={isCreating ? 'Creating...' : 'Create Project'}
                  onPress={handleCreate}
                  variant="primary"
                  size="medium"
                  loading={isCreating}
                  disabled={!formData.name.trim() || isCreating}
                  {...getTestProps('create-project-submit-button')}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// * Create theme-aware styles
const getStyles = (theme: Theme) => StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.borderRadius.lg,
    width: '90%',
    maxWidth: 600,
    maxHeight: '90%',
    padding: theme.spacing.lg,
    shadowColor: theme.colors.effects.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary.borderLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary.borderLight,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.heading,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  closeIcon: {
    fontSize: 24,
    color: theme.colors.text.secondary,
  },
  // * Template section styles
  templateSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    fontFamily: theme.typography.fontFamily.heading,
  },
  templateScroll: {
    maxHeight: 120,
  },
  templateContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  templateCard: {
    backgroundColor: theme.colors.surface.backgroundAlt,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 100,
  },
  templateCardSelected: {
    borderColor: theme.colors.metal.gold,
    backgroundColor: theme.colors.surface.cardHover,
  },
  templateIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  templateName: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.ui,
  },
  templateNameSelected: {
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold as any,
  },
  starterBadge: {
    backgroundColor: theme.colors.attributes.vitality,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    marginTop: theme.spacing.xs,
  },
  starterBadgeText: {
    fontSize: theme.typography.fontSize.xxs,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text.onPrimary,
    fontFamily: theme.typography.fontFamily.ui,
  },
  templateDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.body,
  },
  // * Form styles
  form: {
    gap: theme.spacing.md,
  },
  fieldContainer: {
    marginTop: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.ui,
  },
  genreScroll: {
    maxHeight: 40,
  },
  genreContainer: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  genreChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface.backgroundElevated,
    borderWidth: 1,
    borderColor: theme.colors.primary.borderLight,
  },
  genreChipSelected: {
    backgroundColor: theme.colors.attributes.swiftness,
    borderColor: theme.colors.attributes.swiftness,
  },
  genreText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.ui,
  },
  genreTextSelected: {
    color: theme.colors.text.onPrimary,
    fontWeight: theme.typography.fontWeight.semibold as any,
  },
  statusContainer: {
    gap: theme.spacing.xs,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
  },
  statusOptionSelected: {
    opacity: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.metal.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.metal.gold,
  },
  statusText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.ui,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.primary.borderLight,
    paddingTop: theme.spacing.lg,
  },
});
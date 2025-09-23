/**
 * EditProjectModal.tsx
 * Modal for editing existing projects with fantasy theme integration
 * Includes cover image editing and all project metadata
 */

import React, { useState, useEffect } from 'react';
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
import { useTheme } from '../providers/ThemeProvider';
import { getTestProps } from '../utils/react-native-web-polyfills';

interface EditProjectModalProps {
  visible: boolean;
  projectId: string;
  onClose: () => void;
  onProjectUpdated?: (projectId: string) => void;
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

export function EditProjectModal({
  visible,
  projectId,
  onClose,
  onProjectUpdated,
}: EditProjectModalProps) {
  const { theme } = useTheme();
  const { projects, updateProject } = useWorldbuildingStore();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    genre: '',
    status: 'planning',
    coverImage: undefined as string | undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // * Load project data when modal opens or projectId changes
  useEffect(() => {
    if (visible && projectId) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setFormData({
          name: project.name || '',
          description: project.description || '',
          genre: (project as any).genre || '',
          status: (project as any).status || 'planning',
          coverImage: (project as any).coverImage || undefined,
        });
      }
    }
  }, [visible, projectId, projects]);

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

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // * Update project with new data
      updateProject(projectId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        ...formData, // * Include all extra fields like genre, status, coverImage
      });
      
      onProjectUpdated?.(projectId);
      handleClose();
      
      if (Platform.OS !== 'web') {
        Alert.alert('Success', 'Project updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update project:', error);
      Alert.alert('Error', 'Failed to update project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      genre: '',
      status: 'planning',
      coverImage: undefined,
    });
    setErrors({});
    onClose();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement project deletion
            console.log('Delete project:', projectId);
            handleClose();
          },
        },
      ]
    );
  };

  const styles = getStyles(theme);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
      testID="edit-project-modal"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.backdrop} onPress={handleClose} {...getTestProps('edit-project-backdrop')} />
          
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>✏️ Edit Project</Text>
                <Pressable onPress={handleClose} style={styles.closeButton} {...getTestProps('edit-project-close-button')}>
                  <Text style={styles.closeIcon}>✕</Text>
                </Pressable>
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
                  testID="edit-project-name-input"
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
                  testID="edit-project-description-input"
                />

                {/* Cover Image */}
                <ImagePicker
                  value={formData.coverImage}
                  onChange={(imageUri) => setFormData({ ...formData, coverImage: imageUri })}
                  label="Cover Image"
                  placeholder="Change cover image"
                  testID="edit-project-cover-image"
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
                          {...getTestProps(`edit-genre-chip-${genre.toLowerCase().replace(/\s+/g, '-')}`)}
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
                        {...getTestProps(`edit-status-option-${status.value}`)}
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

                {/* Project Stats */}
                <View style={styles.statsContainer}>
                  <Text style={styles.statsTitle}>📊 Project Statistics</Text>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Elements</Text>
                      <Text style={styles.statValue}>
                        {projects.find(p => p.id === projectId)?.elements?.length || 0}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Created</Text>
                      <Text style={styles.statValue}>
                        {new Date(projects.find(p => p.id === projectId)?.createdAt || Date.now()).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Last Updated</Text>
                      <Text style={styles.statValue}>
                        {new Date(projects.find(p => p.id === projectId)?.updatedAt || Date.now()).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <Pressable
                  style={styles.deleteButton}
                  onPress={handleDelete}
                  {...getTestProps('edit-project-delete-button')}
                >
                  <Text style={styles.deleteButtonText}>Delete Project</Text>
                </Pressable>
                
                <View style={styles.primaryActions}>
                  <Button
                    title="Cancel"
                    onPress={handleClose}
                    variant="secondary"
                    size="medium"
                    testID="edit-project-cancel-button"
                  />
                  <Button
                    title={isSaving ? 'Saving...' : 'Save Changes'}
                    onPress={handleSave}
                    variant="primary"
                    size="medium"
                    loading={isSaving}
                    disabled={!formData.name.trim() || isSaving}
                    testID="edit-project-save-button"
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// * Create theme-aware styles
const getStyles = (theme: any) => StyleSheet.create({
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
  // * Stats section
  statsContainer: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface.backgroundAlt,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary.borderLight,
  },
  statsTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily.heading,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xxs,
    fontFamily: theme.typography.fontFamily.ui,
  },
  statValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.metal.gold,
    fontFamily: theme.typography.fontFamily.heading,
  },
  // * Actions section
  actions: {
    marginTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.primary.borderLight,
    paddingTop: theme.spacing.lg,
  },
  deleteButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.semantic.dragonfire,
    marginBottom: theme.spacing.md,
  },
  deleteButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.semantic.dragonfire,
    fontFamily: theme.typography.fontFamily.ui,
  },
  primaryActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
});
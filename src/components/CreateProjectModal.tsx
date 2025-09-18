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
import { useWorldbuildingStore } from '../store/worldbuildingStore';

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

export function CreateProjectModal({
  visible,
  onClose,
  onProjectCreated,
}: CreateProjectModalProps) {
  const { createProject } = useWorldbuildingStore();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    genre: '',
    status: 'planning',
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
    });
    setErrors({});
    onClose();
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
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Create New Project</Text>
                <Pressable onPress={handleClose} style={styles.closeButton}>
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
                />
                <Button
                  title={isCreating ? 'Creating...' : 'Create Project'}
                  onPress={handleCreate}
                  variant="primary"
                  size="medium"
                  loading={isCreating}
                  disabled={!formData.name.trim() || isCreating}
                />
              </View>
            </ScrollView>
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
    justifyContent: 'center',
    alignItems: 'center',
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
    borderRadius: 16,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 24,
    // ! HARDCODED: Should use design tokens
    color: '#9CA3AF',
  },
  form: {
    gap: 20,
  },
  fieldContainer: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
    marginBottom: 8,
  },
  genreScroll: {
    maxHeight: 40,
  },
  genreContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genreChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#374151',
    borderWidth: 1,
    // ! HARDCODED: Should use design tokens
    borderColor: '#4B5563',
  },
  genreChipSelected: {
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#6366F1',
    // ! HARDCODED: Should use design tokens
    borderColor: '#6366F1',
  },
  genreText: {
    fontSize: 12,
    // ! HARDCODED: Should use design tokens
    color: '#9CA3AF',
  },
  genreTextSelected: {
    // ! HARDCODED: Should use design tokens
    color: '#FFFFFF',
    fontWeight: '500',
  },
  statusContainer: {
    gap: 8,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  statusOptionSelected: {
    opacity: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    // ! HARDCODED: Should use design tokens
    borderColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#6366F1',
  },
  statusText: {
    fontSize: 14,
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
});
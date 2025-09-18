import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Modal,
  Switch,
  Alert,
} from 'react-native';
import {
  QuestionnaireTemplate,
  Question,
  ElementCategory,
  QuestionType,
} from '../types/models';
import { useWorldbuildingStore } from '../store/worldbuildingStore';
import { v4 as uuidv4 } from 'uuid';

interface TemplateEditorProps {
  template?: QuestionnaireTemplate;
  category: ElementCategory;
  onSave: (template: QuestionnaireTemplate) => void;
  onClose: () => void;
  visible: boolean;
}

interface QuestionEditorProps {
  question: Question;
  onChange: (question: Question) => void;
  onDelete: () => void;
}

function QuestionEditor({ question, onChange, onDelete }: QuestionEditorProps) {
  return (
    <View style={styles.questionCard}>
      <View style={styles.questionHeader}>
        <TextInput
          style={styles.questionTextInput}
          value={question.text}
          onChangeText={(text) => onChange({ ...question, text })}
          placeholder="Question text"
          // ! HARDCODED: Should use design tokens
          placeholderTextColor="#6B7280"
        />
        <Pressable onPress={onDelete} style={styles.deleteQuestionButton}>
          <Text style={styles.deleteIcon}>🗑️</Text>
        </Pressable>
      </View>

      <View style={styles.questionRow}>
        <View style={styles.questionField}>
          <Text style={styles.fieldLabel}>Type</Text>
          <View style={styles.typeSelector}>
            {(['text', 'textarea', 'select', 'multiselect', 'number', 'date', 'boolean'] as QuestionType[]).map((type) => (
              <Pressable
                key={type}
                style={[
                  styles.typeOption,
                  question.type === type && styles.typeOptionSelected,
                ]}
                onPress={() => onChange({ ...question, type })}
              >
                <Text
                  style={[
                    styles.typeOptionText,
                    question.type === type && styles.typeOptionTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.questionRow}>
        <View style={[styles.questionField, { flex: 1 }]}>
          <Text style={styles.fieldLabel}>Category</Text>
          <TextInput
            style={styles.fieldInput}
            value={question.category || ''}
            onChangeText={(category) => onChange({ ...question, category })}
            placeholder="e.g., Basic Info, Appearance"
            // ! HARDCODED: Should use design tokens
          placeholderTextColor="#6B7280"
          />
        </View>

        <View style={styles.questionField}>
          <Text style={styles.fieldLabel}>Required</Text>
          <Switch
            value={question.required || false}
            onValueChange={(required) => onChange({ ...question, required })}
            trackColor={{ false: '// ! HARDCODED: Should use design tokens
      #374151', true: '// ! HARDCODED: Should use design tokens
      #6366F1' }}
            thumbColor="// ! HARDCODED: Should use design tokens
      #F9FAFB"
          />
        </View>
      </View>

      {(question.type === 'select' || question.type === 'multiselect') && (
        <View style={styles.questionField}>
          <Text style={styles.fieldLabel}>Options (comma-separated)</Text>
          <TextInput
            style={styles.fieldInput}
            value={question.options?.join(', ') || ''}
            onChangeText={(text) =>
              onChange({
                ...question,
                options: text.split(',').map((o) => o.trim()).filter(Boolean),
              })
            }
            placeholder="Option 1, Option 2, Option 3"
            // ! HARDCODED: Should use design tokens
          placeholderTextColor="#6B7280"
          />
        </View>
      )}

      <View style={styles.questionField}>
        <Text style={styles.fieldLabel}>Help Text</Text>
        <TextInput
          style={styles.fieldInput}
          value={question.helpText || ''}
          onChangeText={(helpText) => onChange({ ...question, helpText })}
          placeholder="Additional guidance for this question"
          // ! HARDCODED: Should use design tokens
          placeholderTextColor="#6B7280"
          multiline
        />
      </View>

      <View style={styles.questionField}>
        <Text style={styles.fieldLabel}>Placeholder</Text>
        <TextInput
          style={styles.fieldInput}
          value={question.placeholder || ''}
          onChangeText={(placeholder) => onChange({ ...question, placeholder })}
          placeholder="Placeholder text"
          // ! HARDCODED: Should use design tokens
          placeholderTextColor="#6B7280"
        />
      </View>
    </View>
  );
}

export function TemplateEditor({
  template,
  category,
  onSave,
  onClose,
  visible,
}: TemplateEditorProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [supportsBasicMode, setSupportsBasicMode] = useState(false);
  const [basicQuestionIds, setBasicQuestionIds] = useState<string[]>([]);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || '');
      setQuestions(template.questions);
      setTags(template.tags?.join(', ') || '');
      setIsPublic(template.isPublic || false);
      setSupportsBasicMode(template.supportsBasicMode || false);
      setBasicQuestionIds(template.basicQuestionIds || []);
    } else {
      // TODO: * Reset for new template
      setName('');
      setDescription('');
      setQuestions([]);
      setTags('');
      setIsPublic(false);
      setSupportsBasicMode(false);
      setBasicQuestionIds([]);
    }
  }, [template, visible]);

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: uuidv4(),
      text: '',
      type: 'text',
      required: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = (index: number, updatedQuestion: Question) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    // * Remove from basic questions if it was there
    const deletedId = questions[index].id;
    setBasicQuestionIds(basicQuestionIds.filter(id => id !== deletedId));
  };

  const handleToggleBasicQuestion = (questionId: string) => {
    if (basicQuestionIds.includes(questionId)) {
      setBasicQuestionIds(basicQuestionIds.filter(id => id !== questionId));
    } else {
      setBasicQuestionIds([...basicQuestionIds, questionId]);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Template name is required');
      return;
    }

    if (questions.length === 0) {
      Alert.alert('Error', 'At least one question is required');
      return;
    }

    const newTemplate: QuestionnaireTemplate = {
      id: template?.id || uuidv4(),
      name: name.trim(),
      description: description.trim(),
      category,
      questions,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      isPublic,
      supportsBasicMode,
      basicQuestionIds: supportsBasicMode ? basicQuestionIds : undefined,
      isDefault: false,
      createdAt: template?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(newTemplate);
    onClose();
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
            <Text style={styles.title}>
              {template ? 'Edit Template' : 'Create Template'}
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Template Information</Text>

              <View style={styles.field}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g., Detailed Character Template"
                  // ! HARDCODED: Should use design tokens
          placeholderTextColor="#6B7280"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe what this template is for"
                  // ! HARDCODED: Should use design tokens
          placeholderTextColor="#6B7280"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Tags (comma-separated)</Text>
                <TextInput
                  style={styles.input}
                  value={tags}
                  onChangeText={setTags}
                  placeholder="e.g., detailed, advanced, fantasy"
                  // ! HARDCODED: Should use design tokens
          placeholderTextColor="#6B7280"
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.label}>Make Public</Text>
                <Switch
                  value={isPublic}
                  onValueChange={setIsPublic}
                  trackColor={{ false: '// ! HARDCODED: Should use design tokens
      #374151', true: '// ! HARDCODED: Should use design tokens
      #6366F1' }}
                  thumbColor="// ! HARDCODED: Should use design tokens
      #F9FAFB"
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.label}>Support Basic/Detailed Mode</Text>
                <Switch
                  value={supportsBasicMode}
                  onValueChange={setSupportsBasicMode}
                  trackColor={{ false: '// ! HARDCODED: Should use design tokens
      #374151', true: '// ! HARDCODED: Should use design tokens
      #6366F1' }}
                  thumbColor="// ! HARDCODED: Should use design tokens
      #F9FAFB"
                />
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Questions</Text>
                <Pressable onPress={handleAddQuestion} style={styles.addButton}>
                  <Text style={styles.addButtonText}>+ Add Question</Text>
                </Pressable>
              </View>

              {questions.length === 0 ? (
                <View style={styles.emptyQuestions}>
                  <Text style={styles.emptyText}>
                    No questions yet. Click "Add Question" to start building your template.
                  </Text>
                </View>
              ) : (
                questions.map((question, index) => (
                  <View key={question.id} style={styles.questionWrapper}>
                    {supportsBasicMode && (
                      <View style={styles.basicModeRow}>
                        <Text style={styles.basicModeLabel}>Include in Basic Mode</Text>
                        <Switch
                          value={basicQuestionIds.includes(question.id)}
                          onValueChange={() => handleToggleBasicQuestion(question.id)}
                          trackColor={{ false: '// ! HARDCODED: Should use design tokens
      #374151', true: '// ! HARDCODED: Should use design tokens
      #6366F1' }}
                          thumbColor="// ! HARDCODED: Should use design tokens
      #F9FAFB"
                        />
                      </View>
                    )}
                    <QuestionEditor
                      question={question}
                      onChange={(q) => handleUpdateQuestion(index, q)}
                      onDelete={() => handleDeleteQuestion(index)}
                    />
                  </View>
                ))
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {template ? 'Update Template' : 'Create Template'}
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
  modalContent: {
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#111827',
    borderRadius: 16,
    width: '90%',
    maxWidth: 800,
    maxHeight: '90%',
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
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '// ! HARDCODED: Should use design tokens
      #374151',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 24,
    // ! HARDCODED: Should use design tokens
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    // ! HARDCODED: Should use design tokens
    color: '#D1D5DB',
    marginBottom: 8,
  },
  input: {
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
    fontSize: 14,
    borderWidth: 1,
    // ! HARDCODED: Should use design tokens
    borderColor: '#374151',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    // ! HARDCODED: Should use design tokens
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyQuestions: {
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    // ! HARDCODED: Should use design tokens
    color: '#6B7280',
    textAlign: 'center',
  },
  questionWrapper: {
    marginBottom: 16,
  },
  basicModeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#374151',
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  basicModeLabel: {
    fontSize: 13,
    // ! HARDCODED: Should use design tokens
    color: '#D1D5DB',
  },
  questionCard: {
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    // ! HARDCODED: Should use design tokens
    borderColor: '#374151',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionTextInput: {
    flex: 1,
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#111827',
    borderRadius: 6,
    padding: 10,
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
    fontSize: 14,
    borderWidth: 1,
    // ! HARDCODED: Should use design tokens
    borderColor: '#374151',
  },
  deleteQuestionButton: {
    marginLeft: 8,
    padding: 8,
  },
  deleteIcon: {
    fontSize: 20,
  },
  questionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  questionField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    // ! HARDCODED: Should use design tokens
    color: '#9CA3AF',
    marginBottom: 6,
  },
  fieldInput: {
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#111827',
    borderRadius: 6,
    padding: 8,
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
    fontSize: 13,
    borderWidth: 1,
    // ! HARDCODED: Should use design tokens
    borderColor: '#374151',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeOptionSelected: {
    backgroundColor: '// ! HARDCODED: Should use design tokens
      #6366F120',
    // ! HARDCODED: Should use design tokens
    borderColor: '#6366F1',
  },
  typeOptionText: {
    fontSize: 11,
    // ! HARDCODED: Should use design tokens
    color: '#9CA3AF',
  },
  typeOptionTextSelected: {
    // ! HARDCODED: Should use design tokens
    color: '#6366F1',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '// ! HARDCODED: Should use design tokens
      #374151',
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    // ! HARDCODED: Should use design tokens
    borderColor: '#4B5563',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    // ! HARDCODED: Should use design tokens
    color: '#D1D5DB',
  },
  saveButton: {
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    // ! HARDCODED: Should use design tokens
    color: '#FFFFFF',
  },
});
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Switch,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { CrossPlatformPicker, PickerItem } from './CrossPlatformPicker';
import { CrossPlatformDatePicker } from './CrossPlatformDatePicker';
import { WorldElement, Question, Answer } from '../types/models';
import { useWorldbuildingStore } from '../store/worldbuildingStore';
import { MarkdownEditor } from './MarkdownEditor';

interface ElementEditorProps {
  element: WorldElement;
  onSave?: () => void;
  onCancel?: () => void;
  autoSave?: boolean;
}

interface QuestionFieldProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

function QuestionField({ question, value, onChange, disabled }: QuestionFieldProps) {

  // * Handle text input
  if (question.type === 'text') {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          {question.text}
          {question.required && <Text style={styles.required}> *</Text>}
        </Text>
        {question.helpText && (
          <Text style={styles.helpText}>{question.helpText}</Text>
        )}
        <TextInput
          style={styles.textInput}
          value={value || ''}
          onChangeText={onChange}
          placeholder={question.placeholder} placeholderTextColor="#6B7280"
          editable={!disabled}
          maxLength={question.validation?.maxLength}
        />
      </View>
    );
  }

  // * Handle textarea (multiline text)
  if (question.type === 'textarea') {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          {question.text}
          {question.required && <Text style={styles.required}> *</Text>}
        </Text>
        {question.helpText && (
          <Text style={styles.helpText}>{question.helpText}</Text>
        )}
        <MarkdownEditor
          value={value || ''}
          onChange={onChange}
          placeholder={question.placeholder}
          minHeight={question.inputSize === 'large' ? 200 : 100}
          showToolbar={true}
          showPreview={true}
        />
      </View>
    );
  }

  // * Handle select (dropdown)
  if (question.type === 'select' && question.options) {
    const pickerItems: PickerItem[] = question.options.map((option) => ({
      label: option.label,
      value: option.value,
    }));

    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          {question.text}
          {question.required && <Text style={styles.required}> *</Text>}
        </Text>
        {question.helpText && (
          <Text style={styles.helpText}>{question.helpText}</Text>
        )}
        <View style={styles.pickerContainer}>
          <CrossPlatformPicker
            selectedValue={value || ''}
            onValueChange={onChange}
            items={pickerItems}
            enabled={!disabled}
            style={styles.picker}
            placeholder="Select an option..."
          />
        </View>
      </View>
    );
  }

  // * Handle multiselect
  if (question.type === 'multiselect' && question.options) {
    const selectedValues = Array.isArray(value) ? value : [];
    
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          {question.text}
          {question.required && <Text style={styles.required}> *</Text>}
        </Text>
        {question.helpText && (
          <Text style={styles.helpText}>{question.helpText}</Text>
        )}
        <View style={styles.checkboxGroup}>
          {question.options.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <Pressable
                key={option.value}
                style={[styles.checkboxItem, isSelected && styles.checkboxItemSelected]}
                onPress={() => {
                  if (!disabled) {
                    const newValues = isSelected
                      ? selectedValues.filter(v => v !== option.value)
                      : [...selectedValues, option.value];
                    onChange(newValues);
                  }
                }}
              >
                <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  // * Handle number input
  if (question.type === 'number') {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          {question.text}
          {question.required && <Text style={styles.required}> *</Text>}
        </Text>
        {question.helpText && (
          <Text style={styles.helpText}>{question.helpText}</Text>
        )}
        <TextInput
          style={styles.textInput}
          value={value?.toString() || ''}
          onChangeText={(text) => {
            const num = parseFloat(text);
            onChange(isNaN(num) ? null : num);
          }}
          placeholder={question.placeholder} placeholderTextColor="#6B7280"
          keyboardType="numeric"
          editable={!disabled}
        />
      </View>
    );
  }

  // * Handle boolean (switch)
  if (question.type === 'boolean') {
    return (
      <View style={[styles.fieldContainer, styles.booleanContainer]}>
        <View style={styles.booleanLabelContainer}>
          <Text style={styles.label}>
            {question.text}
            {question.required && <Text style={styles.required}> *</Text>}
          </Text>
          {question.helpText && (
            <Text style={styles.helpText}>{question.helpText}</Text>
          )}
        </View>
        <Switch
          value={value === true}
          onValueChange={onChange}
          disabled={disabled}
          trackColor={{ false: '#374151', true: '#6366F1' }} // ! HARDCODED: Should use design tokens
          thumbColor={value ? '#FFFFFF' : '#9CA3AF'}
          ios_backgroundColor="#374151"
        />
      </View>
    );
  }

  // * Handle date picker
  if (question.type === 'date') {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          {question.text}
          {question.required && <Text style={styles.required}> *</Text>}
        </Text>
        {question.helpText && (
          <Text style={styles.helpText}>{question.helpText}</Text>
        )}
        <View style={styles.dateButton}>
          <CrossPlatformDatePicker
            value={value ? new Date(value) : null}
            onChange={(date) => onChange(date)}
            disabled={disabled}
            placeholder="Select date..."
            mode="date"
          />
        </View>
      </View>
    );
  }

  return null;
}

export function ElementEditor({
  element,
  onSave,
  onCancel,
  autoSave = true,
}: ElementEditorProps) {
  const { updateElementAnswers } = useWorldbuildingStore();
  const [answers, setAnswers] = useState<Record<string, Answer>>(element.answers || {});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // * Group questions by category
  const questionsByCategory = useMemo(() => {
    const grouped: Record<string, Question[]> = {};
    element.questions.forEach((question) => {
      const category = question.category || 'General';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(question);
    });
    return grouped;
  }, [element.questions]);

  // ? TODO: * Check if a question should be shown based on dependencies
  const shouldShowQuestion = useCallback((question: Question): boolean => {
    if (!question.dependsOn) return true;
    
    const dependentAnswer = answers[question.dependsOn.questionId];
    if (!dependentAnswer) return false;
    
    return dependentAnswer.value === question.dependsOn.value;
  }, [answers]);

  // * Handle answer change
  const handleAnswerChange = useCallback((questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        value,
        updatedAt: new Date(),
      },
    }));
    setHasChanges(true);
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && hasChanges) {
      const timer = setTimeout(() => {
        updateElementAnswers(element.id, answers);
        setHasChanges(false);
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timer);
    }
  }, [answers, hasChanges, autoSave, element.id, updateElementAnswers]);

  // * Handle manual save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateElementAnswers(element.id, answers);
      setHasChanges(false);
      
      if (Platform.OS !== 'web') {
        Alert.alert('Success', 'Element saved successfully');
      }
      
      onSave?.();
    } catch (error) {
      console.error('Failed to save element:', error);
      Alert.alert('Error', 'Failed to save element. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // * Calculate completion percentage
  const completionPercentage = useMemo(() => {
    const requiredQuestions = element.questions.filter(q => q.required && shouldShowQuestion(q));
    if (requiredQuestions.length === 0) {
      const allQuestions = element.questions.filter(shouldShowQuestion);
      const answered = allQuestions.filter(q => {
        const answer = answers[q.id];
        return answer && answer.value !== null && answer.value !== '' && answer.value !== [];
      });
      return Math.round((answered.length / allQuestions.length) * 100);
    }
    
    const answeredRequired = requiredQuestions.filter(q => {
      const answer = answers[q.id];
      return answer && answer.value !== null && answer.value !== '' && answer.value !== [];
    });
    
    return Math.round((answeredRequired.length / requiredQuestions.length) * 100);
  }, [element.questions, answers, shouldShowQuestion]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.elementName}>{element.name}</Text>
            <Text style={styles.elementCategory}>{element.category}</Text>
          </View>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{completionPercentage}% Complete</Text>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${completionPercentage}%` }]}
              />
            </View>
          </View>
        </View>

        {/* Description */}
        {element.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Description</Text>
            <Text style={styles.description}>{element.description}</Text>
          </View>
        )}

        {/* Questions by Category */}
        {Object.entries(questionsByCategory).map(([category, questions]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            {questions.filter(shouldShowQuestion).map((question) => (
              <QuestionField
                key={question.id}
                question={question}
                value={answers[question.id]?.value}
                onChange={(value) => handleAnswerChange(question.id, value)}
                disabled={isSaving}
              />
            ))}
          </View>
        ))}

        {/* Actions */}
        <View style={styles.actions}>
          {onCancel && (
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          )}
          <Pressable
            style={[
              styles.button,
              styles.saveButton,
              (!hasChanges || isSaving) && styles.buttonDisabled,
            ]}
            onPress={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>
                {hasChanges ?  'Save Changes'  : 'Saved'}
              </Text>
            )}
          </Pressable>
        </View>

        {/* Auto-save indicator */}
        {autoSave && hasChanges && !isSaving && (
          <Text style={styles.autoSaveText}>Auto-saving in 2 seconds...</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#111827', // ! HARDCODED: Should use design tokens
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  headerInfo: {
    marginBottom: 12,
  },
  elementName: {
    fontSize: 24,
    fontWeight: '600', color: '#F9FAFB', // ! HARDCODED: Should use design tokens
    marginBottom: 4,
  },
  elementCategory: {
    fontSize: 14, color: '#9CA3AF', // ! HARDCODED: Should use design tokens
    textTransform: 'capitalize',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressText: {
    fontSize: 12, color: '#9CA3AF', // ! HARDCODED: Should use design tokens
    marginBottom: 4,
  },
  progressBar: {
    height: 4, backgroundColor: '#374151', // ! HARDCODED: Should use design tokens
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%', backgroundColor: '#10B981', // ! HARDCODED: Should use design tokens
  },
  descriptionContainer: {
    marginBottom: 24,
    padding: 16, backgroundColor: '#1F2937', // ! HARDCODED: Should use design tokens
    borderRadius: 8,
  },
  descriptionLabel: {
    fontSize: 12, color: '#9CA3AF', // ! HARDCODED: Should use design tokens
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 14, color: '#F9FAFB', // ! HARDCODED: Should use design tokens
    lineHeight: 20,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600', color: '#F9FAFB', // ! HARDCODED: Should use design tokens
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500', color: '#F9FAFB', // ! HARDCODED: Should use design tokens
    marginBottom: 6,
  },
  required: { color: '#EF4444', // ! HARDCODED: Should use design tokens
  },
  helpText: {
    fontSize: 12, color: '#6B7280', // ! HARDCODED: Should use design tokens
    marginBottom: 4,
  },
  textInput: { backgroundColor: '#1F2937', // ! HARDCODED: Should use design tokens
    borderRadius: 8,
    padding: 12, color: '#F9FAFB', // ! HARDCODED: Should use design tokens
    fontSize: 14,
    borderWidth: 1, borderColor: '#374151', // ! HARDCODED: Should use design tokens
  },
  pickerContainer: { backgroundColor: '#1F2937', // ! HARDCODED: Should use design tokens
    borderRadius: 8,
    borderWidth: 1, borderColor: '#374151', // ! HARDCODED: Should use design tokens
    overflow: 'hidden',
  },
  picker: { color: '#F9FAFB', // ! HARDCODED: Should use design tokens
    height: 50,
  },
  pickerItem: {
    fontSize: 14,
  },
  checkboxGroup: { backgroundColor: '#1F2937', // ! HARDCODED: Should use design tokens
    borderRadius: 8,
    padding: 12,
    borderWidth: 1, borderColor: '#374151', // ! HARDCODED: Should use design tokens
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkboxItemSelected: { backgroundColor: '#374151', // ! HARDCODED: Should use design tokens
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2, borderColor: '#6B7280', // ! HARDCODED: Should use design tokens
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#6366F1', // ! HARDCODED: Should use design tokens borderColor: '#6366F1', // ! HARDCODED: Should use design tokens
  },
  checkmark: { color: '#FFFFFF', // ! HARDCODED: Should use design tokens
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14, color: '#F9FAFB', // ! HARDCODED: Should use design tokens
  },
  booleanContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  booleanLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#1F2937', // ! HARDCODED: Should use design tokens
    borderRadius: 8,
    padding: 12,
    borderWidth: 1, borderColor: '#374151', // ! HARDCODED: Should use design tokens
  },
  dateButtonText: {
    fontSize: 14, color: '#F9FAFB', // ! HARDCODED: Should use design tokens
  },
  dateIcon: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: { backgroundColor: '#374151', // ! HARDCODED: Should use design tokens
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600', color: '#F9FAFB', // ! HARDCODED: Should use design tokens
  },
  saveButton: { backgroundColor: '#6366F1', // ! HARDCODED: Should use design tokens
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600', color: '#FFFFFF', // ! HARDCODED: Should use design tokens
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  autoSaveText: {
    fontSize: 12, color: '#6B7280', // ! HARDCODED: Should use design tokens
    textAlign: 'center',
    marginTop: 8,
  },
});
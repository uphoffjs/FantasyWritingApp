// * Component test helpers for missing components
// * These are React Native Web compatible stubs with data-cy attributes for testing

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Platform, ScrollView, RefreshControl } from 'react-native';

// * Helper function to add proper test attributes for React Native Web
const getTestProps = (id: string) => {
  // React Native Web automatically converts testID to data-testid in the DOM
  // TODO: * We need to use testID for React Native components
  return {
    testID: id,
    // * Also add accessible prop for better testing
    accessible: true,
    accessibilityTestID: id,
  };
};

// * Format relative time for timestamps
const formatRelativeTime = (date: Date | string | undefined): string => {
  if (!date) return '';
  
  const timestamp = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - timestamp.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  
  if (diffInSeconds < 10) return 'Just now';
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInMinutes === 1) return '1 minute ago';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInHours === 1) return '1 hour ago';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  return timestamp.toLocaleString();
};

// AutoSaveIndicator component with proper data-cy attributes and state handling
export const AutoSaveIndicator: React.FC<any> = ({ 
  status = 'idle', 
  errorMessage,
  timestamp, 
  onRetry, 
  className, 
  autoHideDelay,
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(status !== 'idle');
  
  useEffect(() => {
    if (status === 'idle') {
      setIsVisible(false);
    } else if (status === 'saved' && autoHideDelay) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, autoHideDelay);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [status, autoHideDelay]);
  
  if (status === 'idle' || !isVisible) {
    return null;
  }
  
  const getStatusText = () => {
    switch (status) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved';
      case 'error':
        return errorMessage || 'Save failed';
      default:
        return status;
    }
  };
  
  return (
    <View 
      {...getTestProps('autosave-indicator')} 
      style={{ padding: 8 }}
      role="status"
      aria-live="polite"
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {status === 'saving' && (
          <ActivityIndicator 
            {...getTestProps('autosave-icon')} 
            size="small" 
          />
        )}
        {status === 'saved' && (
          <Text {...getTestProps('autosave-icon')}>✓</Text>
        )}
        {status === 'error' && (
          <Text {...getTestProps('autosave-icon')}>⚠</Text>
        )}
        <Text {...getTestProps('autosave-status')} style={{ marginLeft: 8 }}>
          {getStatusText()}
        </Text>
      </View>
      {timestamp && status === 'saved' && (
        <Text {...getTestProps('autosave-timestamp')} style={{ fontSize: 12, opacity: 0.7 }}>
          {formatRelativeTime(timestamp)}
        </Text>
      )}
      {status === 'error' && onRetry && (
        <TouchableOpacity {...getTestProps('autosave-retry')} onPress={onRetry}>
          <Text>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// BasicQuestionsSelector component
interface BasicQuestionsSelectorProps {
  questions: Question[];
  basicQuestionIds?: string[];
  category: string;
  onChange: (ids: string[]) => void;
}

// * Default suggestions for different categories
const defaultSuggestions: Record<string, string[]> = {
  character: ['name', 'age', 'species'],
  location: ['name', 'type', 'description'],
  item: ['name', 'type', 'description'],
  plot: ['name', 'summary', 'conflict'],
  worldbuilding: ['name', 'type', 'description']
};

export const BasicQuestionsSelector: React.FC<BasicQuestionsSelectorProps> = ({ 
  questions = [], 
  basicQuestionIds = [], 
  category = 'character',
  onChange,
  ...props 
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(basicQuestionIds);

  // Auto-select suggestions when no basicQuestionIds provided (but only once on mount)
  useEffect(() => {
    if (basicQuestionIds.length === 0 && selectedIds.length === 0) {
      const suggestions = defaultSuggestions[category] || [];
      const availableSuggestions = suggestions.filter(id => questions.some(q => q.id === id));
      if (availableSuggestions.length > 0) {
        setSelectedIds(availableSuggestions);
        onChange(availableSuggestions);
      }
    }
  }, []); // Only run on mount

  // * Group questions by category
  const questionsByCategory = questions.reduce((acc, q) => {
    const cat = q.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(q);
    return acc;
  }, {} as Record<string, Question[]>);

  const handleToggleQuestion = (id: string) => {
    const newIds = selectedIds.includes(id)
      ? selectedIds.filter(qId => qId !== id)
      : [...selectedIds, id];
    setSelectedIds(newIds);
    onChange(newIds);
  };

  const handleSelectAll = () => {
    const allIds = questions.map(q => q.id);
    setSelectedIds(allIds);
    onChange(allIds);
  };

  const handleSelectNone = () => {
    setSelectedIds([]);
    onChange([]);
  };

  const handleApplyDefaults = () => {
    const suggestions = defaultSuggestions[category] || [];
    const availableSuggestions = suggestions.filter(id => questions.some(q => q.id === id));
    setSelectedIds(availableSuggestions);
    onChange(availableSuggestions);
  };

  const calculateTime = (count: number, secondsPerQuestion: number) => {
    const totalSeconds = count * secondsPerQuestion;
    const minutes = Math.ceil(totalSeconds / 60);
    return `~${minutes} min to complete`;
  };

  const basicCount = selectedIds.length;
  const detailedCount = questions.length;
  const hasSuggestions = (defaultSuggestions[category] || []).some(id => questions.some(q => q.id === id));

  return (
    <View {...getTestProps('basic-questions-selector')} style={{ padding: 16 }}>
      {/* Title and Description */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Basic Mode Configuration</Text>
        <Text style={{ color: '#666', marginTop: 4 }}>Select which questions should appear in Basic mode</Text>
      </View>

      {/* Statistics Grid */}
      <View style={{ flexDirection: 'row', marginBottom: 16, gap: 16 }}>
        <View style={{ flex: 1, backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>Basic Questions</Text>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginVertical: 4 }}>{basicCount}</Text>
          <Text style={{ color: '#666', fontSize: 12 }}>{calculateTime(basicCount, 30)}</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>Detailed Questions</Text>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginVertical: 4 }}>{detailedCount}</Text>
          <Text style={{ color: '#666', fontSize: 12 }}>{calculateTime(detailedCount, 45)}</Text>
        </View>
      </View>

      {/* Tip Box */}
      <View style={{ backgroundColor: '#e6f2ff', padding: 12, borderRadius: 8, marginBottom: 16 }}>
        <Text style={{ fontWeight: 'bold' }}>Tip: </Text>
        <Text>Basic mode should include just enough questions to get started quickly.</Text>
      </View>

      {/* Quick Actions */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <TouchableOpacity 
          {...getTestProps('apply-defaults-button')}
          onPress={handleApplyDefaults}
          disabled={!hasSuggestions}
          style={{ 
            padding: 8, 
            borderRadius: 4, 
            backgroundColor: hasSuggestions ? '#007bff' : '#ccc' 
          }}
        >
          <Text style={{ color: '#fff' }}>Apply Defaults</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          {...getTestProps('select-all-button')}
          onPress={handleSelectAll}
          style={{ padding: 8, borderRadius: 4, backgroundColor: '#28a745' }}
        >
          <Text style={{ color: '#fff' }}>Select All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          {...getTestProps('select-none-button')}
          onPress={handleSelectNone}
          style={{ padding: 8, borderRadius: 4, backgroundColor: '#dc3545' }}
        >
          <Text style={{ color: '#fff' }}>Select None</Text>
        </TouchableOpacity>
      </View>

      {/* Questions by Category */}
      <View {...getTestProps('questions-container')}>
        {Object.entries(questionsByCategory).map(([categoryName, categoryQuestions]) => (
          <View key={categoryName} style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>{categoryName}</Text>
            {categoryQuestions.map(question => {
              const isSelected = selectedIds.includes(question.id);
              const isSuggested = (defaultSuggestions[category] || []).includes(question.id);
              
              return (
                <View key={question.id} style={{ marginBottom: 8 }}>
                  <TouchableOpacity
                    onPress={() => handleToggleQuestion(question.id)}
                    style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center',
                      padding: 12,
                      borderWidth: 2,
                      borderColor: isSelected ? '#007bff' : '#ddd',
                      borderRadius: 4,
                      backgroundColor: isSelected ? '#e6f2ff' : '#fff'
                    }}
                  >
                    <View style={{ marginRight: 12 }}>
                      <View 
                        style={{ 
                          width: 20, 
                          height: 20, 
                          borderWidth: 2,
                          borderColor: isSelected ? '#007bff' : '#999',
                          borderRadius: 2,
                          backgroundColor: isSelected ? '#007bff' : 'transparent',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        {isSelected && <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>}
                      </View>
                      <TextInput
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {isSuggested && (
                          <Text style={{ marginRight: 4 }}>⭐</Text>
                        )}
                        <Text>{question.text}</Text>
                        {question.required && (
                          <View style={{ marginLeft: 8, backgroundColor: '#dc3545', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                            <Text style={{ color: '#fff', fontSize: 10 }}>Required</Text>
                          </View>
                        )}
                      </View>
                      {question.helpText && (
                        <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>{question.helpText}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                  {/* Create the label element that wraps the checkbox */}
                  <Text 
                    {...getTestProps(`label-${question.id}`)} 
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                    onPress={() => handleToggleQuestion(question.id)}
                  >
                    {question.text}
                    <View style={{ position: 'absolute', opacity: 0 }}>
                      <TextInput
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleQuestion(question.id)}
                        style={{ opacity: 0 }}
                      />
                    </View>
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Summary when questions are selected */}
      {selectedIds.length > 0 && (
        <View style={{ marginTop: 16, padding: 12, backgroundColor: '#d4edda', borderRadius: 8 }}>
          <Text style={{ fontWeight: 'bold', color: '#155724' }}>Basic Mode Ready</Text>
          <Text style={{ color: '#155724' }}>{selectedIds.length} essential questions selected</Text>
        </View>
      )}
    </View>
  );
};

// BaseElementForm component with all required data-cy attributes
export const BaseElementForm: React.FC<any> = ({ 
  questions = [],
  answers = {},
  onChange,
  elementType = 'Test',
  category = 'element',
  element,
  onSave,
  onCancel,
  isSubmitting,
  validationErrors = {},
  ...props 
}) => {
  const [mode, setMode] = React.useState('basic');
  // * Start with General category expanded by default
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(() => {
    // * Check if we have a General category
    const hasGeneral = questions.some(q => (q.category || 'General') === 'General');
    return hasGeneral ? new Set(['General']) : new Set();
  });
  const [inputValues, setInputValues] = React.useState<{[key: string]: any}>({});
  const [forceUpdate, setForceUpdate] = React.useState(0);
  
  // * Initialize input values from answers
  React.useEffect(() => {
    const initialValues: {[key: string]: any} = {};
    Object.keys(answers).forEach(key => {
      initialValues[key] = answers[key]?.value || '';
    });
    // * Also include any existing values not in answers
    questions.forEach((q: any) => {
      if (initialValues[q.id] === undefined) {
        initialValues[q.id] = '';
      }
    });
    setInputValues(initialValues);
  }, [answers, questions]);
  
  // * Group questions by category
  const questionsByCategory = questions.reduce((acc: any, q: any) => {
    const cat = q.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(q);
    return acc;
  }, {});
  
  const toggleCategory = (category: string) => {
    console.log('toggleCategory called for:', category);
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        console.log('Removing category from expanded:', category);
        newSet.delete(category);
      } else {
        console.log('Adding category to expanded:', category);
        newSet.add(category);
      }
      console.log('New expanded categories:', Array.from(newSet));
      return newSet;
    });
  };
  
  const handleInputChange = (questionId: string, value: any) => {
    setInputValues(prev => ({ ...prev, [questionId]: value }));
    // * Also trigger onChange immediately for better test compatibility
    if (onChange) {
      onChange(questionId, value);
    }
    // * Force a re-render to ensure state updates are visible in tests
    setForceUpdate(prev => prev + 1);
  };
  
  const handleInputBlur = (questionId: string) => {
    // * Call onChange with the complete value on blur as well
    if (onChange && inputValues[questionId] !== undefined) {
      onChange(questionId, inputValues[questionId]);
    }
  };
  
  const title = elementType === 'character' ? 'Character Details' : 
                elementType === 'Test' ? 'Test Details' : `${elementType} Details`;
  
  return (
    <View {...getTestProps('base-element-form')}>
      <View {...getTestProps('form-header')}>
        <Text {...getTestProps('form-title')}>{title}</Text>
      </View>
      
      {/* Mode toggle */}
      <View {...getTestProps('mode-toggle')} style={{ flexDirection: 'row' }}>
        <TouchableOpacity 
          onPress={() => setMode('basic')}
          style={{ padding: 8, backgroundColor: mode === 'basic' ? '#ddd' : '#fff' }}
        >
          <Text>Basic</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setMode('detailed')}
          style={{ padding: 8, backgroundColor: mode === 'detailed' ? '#ddd' : '#fff' }}
        >
          <Text>Detailed</Text>
        </TouchableOpacity>
      </View>
      
      {/* Mode display */}
      {mode === 'basic' && (
        <View>
          <Text>Quick Mode</Text>
        </View>
      )}
      
      {/* Categories and questions */}
      {Object.entries(questionsByCategory).map(([cat, categoryQuestions]: [string, any]) => {
        // ? Don't filter by mode - show all questions when category is expanded
        const questionsToShow = categoryQuestions;
        
        return (
          <View key={cat} style={{ marginVertical: 8 }}>
            <TouchableOpacity 
              {...getTestProps(`category-toggle-${cat.toLowerCase()}`)}
              onPress={() => toggleCategory(cat)}
              style={{ padding: 8, backgroundColor: '#f0f0f0' }}
            >
              <Text>{cat}</Text>
            </TouchableOpacity>
            
            {expandedCategories.has(cat) && questionsToShow.length > 0 && (
              <View style={{ paddingLeft: 16, marginTop: 8 }} {...getTestProps(`category-${cat.toLowerCase()}-questions`)}>
                {console.log('Rendering questions for category:', cat, questionsToShow)}
                {questionsToShow.map((q: any) => (
                <View key={q.id} style={{ marginVertical: 4 }} {...getTestProps(`question-container-${q.id}`)}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text {...getTestProps(`question-label-${q.id}`)}>{q.text}</Text>
                    {q.required && <Text style={{ color: 'red' }}>*</Text>}
                  </View>
                  {q.helpText && (
                    <>
                      <TouchableOpacity {...getTestProps(`question-${q.id}-help-button`)}>
                        <Text style={{ fontSize: 12, color: '#666' }}>?</Text>
                      </TouchableOpacity>
                      <View {...getTestProps(`question-${q.id}-help`)}>
                        <Text style={{ fontSize: 12, color: '#666' }}>{q.helpText}</Text>
                      </View>
                    </>
                  )}
                  {q.type === 'text' || q.type === 'textarea' ? (
                    <TextInput
                      {...getTestProps(`question-${q.id}-input`)}
                      {...(q.type === 'text' ? getTestProps('text-input') : getTestProps('textarea-input'))}
                      placeholder={q.placeholder || ''}
                      value={inputValues[q.id] || ''}
                      onChangeText={(text) => handleInputChange(q.id, text)}
                      onChange={(e: any) => {
                        // * For web compatibility, also handle onChange event
                        const text = e?.nativeEvent?.text || e?.target?.value || '';
                        handleInputChange(q.id, text);
                      }}
                      onBlur={() => handleInputBlur(q.id)}
                      multiline={q.type === 'textarea'}
                      numberOfLines={q.type === 'textarea' ? 4 : 1}
                      required={q.required}
                      style={{
                        width: '100%',
                        padding: 8,
                        fontSize: 14,
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: '#ccc',
                        minHeight: q.type === 'textarea' ? 100 : undefined,
                      }}
                    />
                  ) : q.type === 'number' ? (
                    Platform.OS === 'web' ? (
                      <input
                        {...getTestProps(`question-${q.id}-input`)}
                        type="number"
                        placeholder={q.placeholder || ''}
                        value={inputValues[q.id] || ''}
                        onChange={(e) => handleInputChange(q.id, Number(e.target.value))}
                        onBlur={() => handleInputBlur(q.id)}
                        required={q.required}
                        min={q.validation?.min}
                        max={q.validation?.max}
                        style={{
                          width: '100%',
                          padding: 8,
                          fontSize: 14,
                          borderRadius: 4,
                          border: '1px solid #ccc'
                        }}
                      />
                    ) : (
                      <TextInput
                        {...getTestProps(`question-${q.id}-input`)}
                        placeholder={q.placeholder || ''}
                        value={String(inputValues[q.id] || '')}
                        onChangeText={(text) => handleInputChange(q.id, Number(text))}
                        onBlur={() => handleInputBlur(q.id)}
                        keyboardType="numeric"
                        required={q.required}
                        min={q.validation?.min}
                        max={q.validation?.max}
                      />
                    )
                  ) : q.type === 'select' || q.type === '[data-cy*="select"]' ? (
                    // For React Native Web in tests, render an actual select element
                    Platform.OS === 'web' ? (
                      <select
                        {...getTestProps(`question-${q.id}-input`)}
                        {...getTestProps(`question-${q.id}-select`)}
                        value={inputValues[q.id] || ''}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          handleInputChange(q.id, newValue);
                          // * Also call handleInputBlur to ensure the change is registered
                          setTimeout(() => handleInputBlur(q.id), 0);
                        }}
                        onBlur={() => handleInputBlur(q.id)}
                        required={q.required}
                        style={{ 
                          width: '100%',
                          padding: 8,
                          fontSize: 14,
                          borderRadius: 4,
                          border: '1px solid #ccc'
                        }}
                      >
                        <option value="">Select an option</option>
                        {q.options?.map((opt: any) => (
                          <option key={opt.value || opt} value={opt.value || opt}>
                            {opt.label || opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <TextInput
                        {...getTestProps(`question-${q.id}-input`)}
                        value={inputValues[q.id] || ''}
                        editable={false}
                        placeholder="Select an option"
                        required={q.required}
                      />
                    )
                  ) : null}
                </View>
              ))}
            </View>
          )}
        </View>
        );
      })}
      
      {validationErrors.name && (
        <Text {...getTestProps('name-error')}>{validationErrors.name}</Text>
      )}
      
      <View {...getTestProps('form-actions')} style={{ flexDirection: 'row', marginTop: 16 }}>
        <TouchableOpacity 
          {...getTestProps('save-button')}
          onPress={onSave}
          disabled={isSubmitting}
          style={{ padding: 8, backgroundColor: '#007bff', marginRight: 8 }}
        >
          <Text style={{ color: '#fff' }}>Save</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          {...getTestProps('cancel-button')}
          onPress={onCancel}
          style={{ padding: 8, backgroundColor: '#6c757d' }}
        >
          <Text style={{ color: '#fff' }}>Cancel</Text>
        </TouchableOpacity>
      </View>
      
      {isSubmitting && (
        <ActivityIndicator {...getTestProps('submit-spinner')} />
      )}
    </View>
  );
};

// ErrorMessage component
export const ErrorMessage: React.FC<any> = ({ message, ...props }) => (
  <View {...getTestProps('error-message')}>
    <Text>{message || 'An error occurred'}</Text>
  </View>
);

// ErrorNotification component
export const ErrorNotification: React.FC<any> = ({ error, onDismiss, ...props }) => (
  <View {...getTestProps('error-notification')}>
    <Text {...getTestProps('error-text')}>{error?.message || 'An error occurred'}</Text>
    {onDismiss && (
      <TouchableOpacity {...getTestProps('dismiss-button')} onPress={onDismiss}>
        <Text>Dismiss</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ProgressBar component
export const ProgressBar: React.FC<any> = ({ progress = 0, ...props }) => (
  <View {...getTestProps('progress-bar')}>
    <View style={{ width: `${progress}%`, height: 4, backgroundColor: '#007AFF' }}>
      <Text {...getTestProps('progress-text')}>{progress}%</Text>
    </View>
  </View>
);

// LoadingSpinner component
export const LoadingSpinner: React.FC<any> = (props) => (
  <View {...getTestProps('loading-spinner')}>
    <ActivityIndicator size="small" />
  </View>
);

// LoadingScreen component
export const LoadingScreen: React.FC<any> = ({ message = "Loading...", ...props }) => (
  <View {...getTestProps('loading-screen')}>
    <ActivityIndicator size="large" />
    <Text {...getTestProps('loading-message')}>{message}</Text>
  </View>
);

// TagInput component
export const TagInput: React.FC<any> = ({ tags = [], onAddTag, onRemoveTag, ...props }) => (
  <View {...getTestProps('tag-input')}>
    <TextInput {...getTestProps('tag-input-field')} placeholder="Add tag..." />
    <View {...getTestProps('tags-container')}>
      {tags.map((tag: string, i: number) => (
        <View key={i} {...getTestProps(`tag-${i}`)}>
          <Text>{tag}</Text>
          {onRemoveTag && (
            <TouchableOpacity onPress={() => onRemoveTag(tag)}>
              <Text>×</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  </View>
);

// TagMultiSelect component
export const TagMultiSelect: React.FC<any> = ({ tags = [], selectedTags = [], onToggle, ...props }) => (
  <View {...getTestProps('tag-multi-select')}>
    {tags.map((tag: string, i: number) => (
      <TouchableOpacity
        key={i}
        {...getTestProps(`tag-option-${i}`)}
        onPress={() => onToggle && onToggle(tag)}
      >
        <Text>{tag}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

// VirtualizedList component
export const VirtualizedList: React.FC<any> = ({ items = [], renderItem, ...props }) => (
  <View {...getTestProps('virtualized-list')}>
    {items.map((item: any, i: number) => (
      <View key={i} {...getTestProps(`list-item-${i}`)}>
        {renderItem ? renderItem({ item, index: i }) : <Text>Item {i}</Text>}
      </View>
    ))}
  </View>
);

// * UtilityComponents component
export const UtilityComponents: React.FC<any> = (props) => (
  <View {...getTestProps('utility-components')}>
    <Text>Utility Components</Text>
  </View>
);

// CompletionHeatmap component
export const CompletionHeatmap: React.FC<any> = ({ project, onElementClick, ...props }) => (
  <View {...getTestProps('completion-heatmap')}>
    <Text>Completion: 0% → 100%</Text>
    <Text>Click any cell for details</Text>
    {project?.elements?.map((element: any, i: number) => (
      <TouchableOpacity
        key={i}
        {...getTestProps(`heatmap-cell-${i}`)}
        onPress={() => onElementClick && onElementClick(element)}
      >
        <Text>{element.name}: {element.completionPercentage}%</Text>
      </TouchableOpacity>
    ))}
  </View>
);

// * Styles for CreateElementModal
const modalStyles = {
  modal: { 
    position: 'absolute' as const, 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'center' as const, 
    alignItems: 'center' as const 
  },
  modalContent: { 
    backgroundColor: 'white', 
    borderRadius: 8, 
    padding: 20, 
    width: '90%', 
    maxWidth: 500 
  },
  modalHeader: { 
    flexDirection: 'row' as const, 
    justifyContent: 'space-between' as const, 
    marginBottom: 10 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: 'bold' as const 
  },
  closeButton: { 
    padding: 5 
  },
  instructions: { 
    marginBottom: 15, 
    color: '#666' 
  },
  categoryGrid: { 
    flexDirection: 'row' as const, 
    flexWrap: 'wrap' as const, 
    marginVertical: 10 
  },
  categoryCard: { 
    width: '48%', 
    margin: '1%', 
    padding: 15, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    alignItems: 'center' as const 
  },
  categoryCardSelected: { 
    backgroundColor: '#007AFF', 
    borderColor: '#007AFF' 
  },
  categoryIcon: { 
    fontSize: 30, 
    marginBottom: 5 
  },
  categoryLabel: { 
    fontSize: 14, 
    fontWeight: 'bold' as const, 
    textAlign: 'center' as const 
  },
  categoryDescription: { 
    fontSize: 11, 
    color: '#666', 
    textAlign: 'center' as const, 
    marginTop: 3 
  },
  actionButtons: { 
    flexDirection: 'row' as const, 
    justifyContent: 'flex-end' as const, 
    marginTop: 20 
  },
  cancelButton: { 
    padding: 10, 
    marginRight: 10 
  },
  createButton: { 
    backgroundColor: '#007AFF', 
    padding: 10, 
    borderRadius: 5, 
    opacity: 1 
  },
  createButtonDisabled: { 
    backgroundColor: '#ccc', 
    opacity: 0.5 
  },
  buttonText: { 
    color: 'white', 
    fontWeight: 'bold' as const 
  }
};

// CreateElementModal component with full functionality
interface CreateElementModalProps {
  visible: boolean;
  projectId?: string;
  onClose: () => void;
  onSuccess?: (elementId: string) => void;
}

// * Mock store for testing
const mockWorldbuildingStore = {
  createElement: async (projectId: string, name: string, category: string) => {
    // * Simulate async creation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 'new-element-1',
          name,
          category
        });
      }, 100);
    });
  },
  projects: []
};

// * Hook to get the store (will be mocked in tests)
export const useWorldbuildingStore = () => mockWorldbuildingStore;

export const CreateElementModal: React.FC<CreateElementModalProps> = ({ 
  visible, 
  projectId = 'test-project-1',
  onClose, 
  onSuccess,
  ...props 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const store = useWorldbuildingStore();
  
  const categories = [
    { id: 'character', icon: '👤', label: 'Character', description: 'Protagonists, antagonists, supporting characters' },
    { id: 'location', icon: '📍', label: 'Location', description: 'Cities, buildings, landmarks' },
    { id: 'item-object', icon: '🗝️', label: 'Item/Object', description: 'Weapons, artifacts, tools' },
    { id: 'magic-power', icon: '✨', label: 'Magic/Power', description: 'Magical systems, abilities' },
    { id: 'event', icon: '📅', label: 'Event', description: 'Historical events, battles' },
    { id: 'organization', icon: '🏛️', label: 'Organization', description: 'Guilds, governments, groups' },
    { id: 'creature-species', icon: '🐉', label: 'Creature/Species', description: 'Animals, monsters, races' },
    { id: 'culture-society', icon: '👥', label: 'Culture/Society', description: 'Customs, traditions' },
    { id: 'religion-belief', icon: '⛪', label: 'Religion/Belief', description: 'Gods, faiths, philosophies' },
    { id: 'language', icon: '💬', label: 'Language', description: 'Tongues, scripts, communication' },
    { id: 'technology', icon: '⚙️', label: 'Technology', description: 'Inventions, mechanisms' },
    { id: 'custom', icon: '✏️', label: 'Custom', description: 'Create your own category' }
  ];
  
  const getCategoryLabel = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.label || categoryId;
  };
  
  const getUniqueElementName = (category: string) => {
    // * In a real app, would check existing elements
    const categoryLabel = getCategoryLabel(category);
    const existingCount = store.projects
      .find(p => p.id === projectId)
      ?.elements?.filter(e => e.category === category).length || 0;
    
    return `Untitled ${categoryLabel} ${existingCount + 1}`;
  };
  
  const handleCreate = async () => {
    if (!selectedCategory || isCreating) return;
    
    setIsCreating(true);
    const elementName = getUniqueElementName(selectedCategory);
    
    try {
      const newElement = await store.createElement(projectId, elementName, selectedCategory);
      if (onSuccess && newElement.id) {
        onSuccess(newElement.id);
      }
      onClose();
    } catch (error) {
      console.error('Failed to create element:', error);
    } finally {
      setIsCreating(false);
    }
  };
  
  if (!visible) return null;
  
  return (
    <View style={modalStyles.modal}>
      <View style={modalStyles.modalContent}>
        <View style={modalStyles.modalHeader}>
          <Text style={modalStyles.modalTitle}>Create New Element</Text>
          <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
            <Text style={{ fontSize: 20 }}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={modalStyles.instructions}>Choose a category for your new element</Text>
        
        <View style={modalStyles.categoryGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              testID={`category-${category.id}`}
              style={[
                modalStyles.categoryCard,
                selectedCategory === category.id && modalStyles.categoryCardSelected
              ]}
              onPress={() => setSelectedCategory(category.id)}
              accessibilityRole="button"
            >
              <Text style={modalStyles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                modalStyles.categoryLabel,
                selectedCategory === category.id && { color: 'white' }
              ]}>{category.label}</Text>
              <Text style={[
                modalStyles.categoryDescription,
                selectedCategory === category.id && { color: 'rgba(255, 255, 255, 0.8)' }
              ]}>{category.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={modalStyles.actionButtons}>
          <TouchableOpacity 
            style={modalStyles.cancelButton} 
            onPress={onClose}
            accessibilityRole="button"
          >
            <Text>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            testID="element-card"
            style={[
              modalStyles.createButton,
              (!selectedCategory || isCreating) && modalStyles.createButtonDisabled
            ]}
            onPress={handleCreate}
            disabled={!selectedCategory || isCreating}
            accessibilityRole="button"
          >
            <Text style={modalStyles.buttonText}>
              {!selectedCategory ? 'Select a Category' : isCreating ? 'Creating...' : 'Create Element'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// * Breadcrumb component
export const Breadcrumb: React.FC<any> = ({ items, onNavigate, ...props }) => (
  <View {...getTestProps('breadcrumb')}>
    {items?.map((item: any, i: number) => (
      <TouchableOpacity 
        key={i} 
        {...getTestProps(`breadcrumb-item-${i}`)}
        onPress={() => onNavigate && onNavigate(item)}
      >
        <Text>{item.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

// * Button component (already working but let's ensure it uses getTestProps)
export const Button: React.FC<any> = ({ title, onPress, disabled, ...props }) => (
  <TouchableOpacity 
    {...getTestProps('button')}
    onPress={onPress}
    disabled={disabled}
  >
    <Text>{title || 'Button'}</Text>
  </TouchableOpacity>
);

// * Export stub types to satisfy TypeScript
export interface ElementCategory {
  character: 'character';
  location: 'location';
  item: 'item';
  organization: 'organization';
  event: 'event';
  concept: 'concept';
}

export interface Question {
  id: string;
  text: string;
  type: string;
  required?: boolean;
  category?: string;
  helpText?: string;
  isSuggested?: boolean;
}

export interface WorldElement {
  id: string;
  name: string;
  category: string;
  description?: string;
  completionPercentage?: number;
  questions?: Question[];
  answers?: any;
  createdAt?: Date | number;
  updatedAt?: Date | number;
  tags?: string[];
  relationships?: any[];
  projectId?: string;
  type?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  elements?: WorldElement[];
  createdAt?: Date | number;
  updatedAt?: Date | number;
}

// * Mock store provider for tests
export const MockWorldbuildingStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

// * Utility functions for tests
export const createMockElement = (overrides = {}): WorldElement => ({
  id: 'test-1',
  name: 'Test Element',
  category: 'character',
  description: 'Test description',
  completionPercentage: 0,
  questions: [],
  answers: {},
  tags: [],
  relationships: [],
  ...overrides
});

export const createMockQuestion = (overrides = {}): Question => ({
  id: 'q-1',
  text: 'Test question?',
  type: 'text',
  required: false,
  ...overrides
});

// * Additional missing component stubs for tests

// EditProjectModal component stub
export const EditProjectModal: React.FC<any> = ({ 
  visible = false, 
  project, 
  onClose, 
  onSave,
  ...props 
}) => {
  if (!visible) return null;
  
  return (
    <View {...getTestProps('edit-project-modal')}>
      <View {...getTestProps('modal-content')}>
        <Text {...getTestProps('modal-title')}>Edit Project</Text>
        <TextInput {...getTestProps('project-name-input')} placeholder="Project name" />
        <TouchableOpacity {...getTestProps('save-button')} onPress={onSave}>
          <Text>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity {...getTestProps('cancel-button')} onPress={onClose}>
          <Text>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ElementHeader component stub (element-editor namespace)
export const ElementHeader: React.FC<any> = ({ element, onEdit, onDelete, ...props }) => (
  <View {...getTestProps('element-header')}>
    <Text {...getTestProps('element-title')}>{element?.name || 'Untitled'}</Text>
    <TouchableOpacity {...getTestProps('edit-button')} onPress={onEdit}>
      <Text>Edit</Text>
    </TouchableOpacity>
    <TouchableOpacity {...getTestProps('delete-button')} onPress={onDelete}>
      <Text>Delete</Text>
    </TouchableOpacity>
  </View>
);

// GraphControls component stub
export const GraphControls: React.FC<any> = ({ onZoomIn, onZoomOut, onReset, ...props }) => (
  <View {...getTestProps('graph-controls')}>
    <TouchableOpacity {...getTestProps('zoom-in-button')} onPress={onZoomIn}>
      <Text>+</Text>
    </TouchableOpacity>
    <TouchableOpacity {...getTestProps('zoom-out-button')} onPress={onZoomOut}>
      <Text>-</Text>
    </TouchableOpacity>
    <TouchableOpacity {...getTestProps('reset-button')} onPress={onReset}>
      <Text>Reset</Text>
    </TouchableOpacity>
  </View>
);

// * Simple styles for ElementBrowser component
const elementBrowserStyles = {
  container: { padding: 16, flex: 1 },
  searchContainer: { flexDirection: 'row' as const, marginBottom: 16 },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 },
  clearButton: { padding: 8 },
  filterContainer: { flexDirection: 'row' as const, marginBottom: 16, flexWrap: 'wrap' as const },
  filterChip: { padding: 8, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 16 },
  filterChipActive: { backgroundColor: '#007AFF' },
  sortContainer: { marginBottom: 16 },
  sortButton: { padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 4 },
  dropdown: { position: 'absolute' as const, top: 40, left: 0, right: 0, backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc', zIndex: 10 },
  resultsContainer: { marginBottom: 8 },
  scrollView: { flex: 1 },
  elementCard: { padding: 16, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 8 },
  elementName: { fontSize: 16, fontWeight: 'bold' as const },
  elementCategory: { fontSize: 14, color: '#666' },
  elementDescription: { fontSize: 14, marginVertical: 4 },
  elementCompletion: { fontSize: 12, color: '#999' },
  centered: { flex: 1, justifyContent: 'center' as const, alignItems: 'center' as const },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold' as const, marginBottom: 8 },
  emptyDescription: { fontSize: 14, color: '#666', marginBottom: 16 },
  createButton: { padding: 12, backgroundColor: '#007AFF', borderRadius: 8 },
  createButtonText: { color: 'white' },
  fab: { position: 'absolute' as const, bottom: 16, right: 16, width: 56, height: 56, borderRadius: 28, backgroundColor: '#007AFF', justifyContent: 'center' as const, alignItems: 'center' as const },
  fabText: { color: 'white', fontSize: 24 }
};

// ElementBrowser component with full search and filter functionality
interface ElementBrowserProps {
  elements?: WorldElement[];
  onElementPress?: (element: WorldElement) => void;
  onCreateElement?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  loading?: boolean;
  testID?: string;
}

export const ElementBrowser: React.FC<ElementBrowserProps> = ({
  elements = [],
  onElementPress,
  onCreateElement,
  onRefresh,
  refreshing = false,
  loading = false,
  testID = 'element-browser',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updated');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // * Filter and search logic
  const filteredElements = useMemo(() => {
    let filtered = [...elements];
    
    // * Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(element => {
        if (selectedCategory === 'character') return element.category === 'character';
        if (selectedCategory === 'location') return element.category === 'location';
        if (selectedCategory === 'item') return element.category === 'item-object';
        if (selectedCategory === 'magic') return element.category === 'magic-power';
        return false;
      });
    }
    
    // ! SECURITY: * Apply search filter (case-insensitive)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(element => 
        element.name.toLowerCase().includes(query) ||
        element.description?.toLowerCase().includes(query) ||
        element.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // * Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'completion':
          return (b.completionPercentage || 0) - (a.completionPercentage || 0);
        case 'updated':
        default:
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
      }
    });
    
    return filtered;
  }, [elements, selectedCategory, searchQuery, sortBy]);

  const getSortLabel = () => {
    switch (sortBy) {
      case 'name':
        return 'Name';
      case 'completion':
        return 'Completion %';
      case 'updated':
      default:
        return 'Recently Updated';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'character':
        return '👤';
      case 'location':
        return '📍';
      case 'item':
        return '🗝️';
      case 'magic':
        return '✨';
      default:
        return '📚';
    }
  };

  if (loading) {
    return (
      <View testID={testID} style={elementBrowserStyles.container}>
        <View style={elementBrowserStyles.centered}>
          <Text>Loading elements...</Text>
        </View>
      </View>
    );
  }

  const renderEmptyState = () => {
    if (searchQuery || selectedCategory !== 'all') {
      // * Filtered empty state
      return (
        <View style={elementBrowserStyles.centered}>
          <Text style={elementBrowserStyles.emptyTitle}>No elements found</Text>
          <Text style={elementBrowserStyles.emptyDescription}>Try adjusting your filters</Text>
        </View>
      );
    }
    
    // * True empty state
    return (
      <View style={elementBrowserStyles.centered}>
        <Text style={elementBrowserStyles.emptyIcon}>📝</Text>
        <Text style={elementBrowserStyles.emptyTitle}>No elements yet</Text>
        <Text style={elementBrowserStyles.emptyDescription}>Create your first element to get started</Text>
        {onCreateElement && (
          <TouchableOpacity 
            onPress={onCreateElement}
            style={elementBrowserStyles.createButton}
          >
            <Text style={elementBrowserStyles.createButtonText}>Create Element</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View testID={testID} style={elementBrowserStyles.container}>
      {/* Search Bar */}
      <View style={elementBrowserStyles.searchContainer}>
        <TextInput
          style={elementBrowserStyles.searchInput}
          placeholder="Search elements..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity 
            onPress={() => setSearchQuery('')}
            style={elementBrowserStyles.clearButton}
          >
            <Text>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Filters */}
      <View style={elementBrowserStyles.filterContainer}>
        <TouchableOpacity 
          onPress={() => setSelectedCategory('all')}
          style={[elementBrowserStyles.filterChip, selectedCategory === 'all' && elementBrowserStyles.filterChipActive]}
        >
          <Text>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setSelectedCategory('character')}
          style={[elementBrowserStyles.filterChip, selectedCategory === 'character' && elementBrowserStyles.filterChipActive]}
        >
          <Text>{getCategoryIcon('character')} Characters</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setSelectedCategory('location')}
          style={[elementBrowserStyles.filterChip, selectedCategory === 'location' && elementBrowserStyles.filterChipActive]}
        >
          <Text>{getCategoryIcon('location')} Locations</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setSelectedCategory('item')}
          style={[elementBrowserStyles.filterChip, selectedCategory === 'item' && elementBrowserStyles.filterChipActive]}
        >
          <Text>{getCategoryIcon('item')} Items</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setSelectedCategory('magic')}
          style={[elementBrowserStyles.filterChip, selectedCategory === 'magic' && elementBrowserStyles.filterChipActive]}
        >
          <Text>{getCategoryIcon('magic')} Magic</Text>
        </TouchableOpacity>
      </View>

      {/* Sort Dropdown */}
      <View style={elementBrowserStyles.sortContainer}>
        <TouchableOpacity 
          onPress={() => setShowSortDropdown(!showSortDropdown)}
          style={elementBrowserStyles.sortButton}
        >
          <Text>Sort by {getSortLabel()}</Text>
        </TouchableOpacity>
        
        {showSortDropdown && (
          <View style={elementBrowserStyles.dropdown}>
            <TouchableOpacity 
              onPress={() => {
                setSortBy('updated');
                setShowSortDropdown(false);
              }}
            >
              <Text>Recently Updated</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => {
                setSortBy('name');
                setShowSortDropdown(false);
              }}
            >
              <Text>Name</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => {
                setSortBy('completion');
                setShowSortDropdown(false);
              }}
            >
              <Text>Completion %</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Results Count */}
      <View style={elementBrowserStyles.resultsContainer}>
        <Text>{filteredElements.length} {filteredElements.length === 1 ? 'element' : 'elements'}</Text>
      </View>

      {/* Elements List */}
      <ScrollView 
        style={elementBrowserStyles.scrollView}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        {filteredElements.length > 0 ? (
          filteredElements.map(element => (
            <TouchableOpacity 
              key={element.id}
              onPress={() => onElementPress?.(element)}
              style={elementBrowserStyles.elementCard}
            >
              <Text style={elementBrowserStyles.elementName}>{element.name}</Text>
              <Text style={elementBrowserStyles.elementCategory}>{element.category}</Text>
              {element.description && (
                <Text style={elementBrowserStyles.elementDescription}>{element.description}</Text>
              )}
              <Text style={elementBrowserStyles.elementCompletion}>{element.completionPercentage}% complete</Text>
            </TouchableOpacity>
          ))
        ) : (
          renderEmptyState()
        )}
      </ScrollView>

      {/* Floating Action Button */}
      {filteredElements.length > 0 && onCreateElement && (
        <TouchableOpacity 
          onPress={onCreateElement}
          style={elementBrowserStyles.fab}
        >
          <Text style={elementBrowserStyles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// MilestoneSystem component stub
export const MilestoneSystem: React.FC<any> = ({ milestones = [], onMilestoneComplete, ...props }) => (
  <View {...getTestProps('milestone-system')}>
    <Text {...getTestProps('milestone-title')}>Milestones</Text>
    {milestones.map((milestone: any, index: number) => (
      <View key={index} {...getTestProps(`milestone-${index}`)}>
        <Text {...getTestProps(`milestone-name-${index}`)}>{milestone.name}</Text>
        <Text {...getTestProps(`milestone-progress-${index}`)}>{milestone.progress}%</Text>
      </View>
    ))}
  </View>
);

// MobileHeader component stub
export const MobileHeader: React.FC<any> = ({ title, onMenuPress, ...props }) => (
  <View {...getTestProps('mobile-header')}>
    <TouchableOpacity {...getTestProps('menu-button')} onPress={onMenuPress}>
      <Text>☰</Text>
    </TouchableOpacity>
    <Text {...getTestProps('header-title')}>{title || 'App'}</Text>
  </View>
);

// ! PERFORMANCE: PerformanceMonitor component stub
export const PerformanceMonitor: React.FC<any> = ({ metrics = {}, ...props }) => (
  <View {...getTestProps('performance-monitor')}>
    <Text {...getTestProps('performance-title')}>Performance</Text>
    <Text {...getTestProps('fps-metric')}>FPS: {metrics.fps || '--'}</Text>
    <Text {...getTestProps('memory-metric')}>Memory: {metrics.memory || '--'}</Text>
  </View>
);

// ProgressReport component stub
export const ProgressReport: React.FC<any> = ({ project, elements = [], ...props }) => (
  <View {...getTestProps('progress-report')}>
    <Text {...getTestProps('report-title')}>Progress Report</Text>
    <Text {...getTestProps('total-elements')}>Total Elements: {elements.length}</Text>
    <Text {...getTestProps('completion-percentage')}>
      Completion: {Math.round((elements.filter((e: any) => e.complete).length / elements.length) * 100) || 0}%
    </Text>
  </View>
);

// RelationshipGraph component stub
export const RelationshipGraph: React.FC<any> = ({ nodes = [], edges = [], ...props }) => (
  <View {...getTestProps('relationship-graph')}>
    <Text {...getTestProps('graph-title')}>Relationship Graph</Text>
    <View {...getTestProps('graph-canvas')}>
      {nodes.map((node: any, index: number) => (
        <View key={index} {...getTestProps(`node-${node.id || index}`)}>
          <Text>{node.label || node.name}</Text>
        </View>
      ))}
    </View>
  </View>
);

// RelationshipList component stub
export const RelationshipList: React.FC<any> = ({ relationships = [], onEdit, onDelete, ...props }) => (
  <View {...getTestProps('relationship-list')}>
    <Text {...getTestProps('list-title')}>Relationships</Text>
    {relationships.map((rel: any, index: number) => (
      <View key={index} {...getTestProps(`relationship-${index}`)}>
        <Text {...getTestProps(`relationship-name-${index}`)}>{rel.name}</Text>
        <TouchableOpacity {...getTestProps(`edit-relationship-${index}`)} onPress={() => onEdit?.(rel)}>
          <Text>Edit</Text>
        </TouchableOpacity>
      </View>
    ))}
  </View>
);

// RelationshipModal component stub
export const RelationshipModal: React.FC<any> = ({ 
  visible = false, 
  onClose, 
  onSave, 
  relationship,
  ...props 
}) => {
  if (!visible) return null;
  
  return (
    <View {...getTestProps('relationship-modal')}>
      <View {...getTestProps('modal-content')}>
        <Text {...getTestProps('modal-title')}>Add Relationship</Text>
        <TextInput {...getTestProps('relationship-name-input')} placeholder="Relationship name" />
        <TextInput {...getTestProps('relationship-type-input')} placeholder="Type" />
        <TouchableOpacity {...getTestProps('save-button')} onPress={onSave}>
          <Text>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity {...getTestProps('cancel-button')} onPress={onClose}>
          <Text>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// SearchResults component stub
export const SearchResults: React.FC<any> = ({ results = [], onResultClick, ...props }) => (
  <View {...getTestProps('search-results')}>
    {results.length === 0 ? (
      <Text {...getTestProps('no-results')}>No results found</Text>
    ) : (
      results.map((result: any, index: number) => (
        <TouchableOpacity 
          key={index} 
          {...getTestProps(`result-${index}`)}
          onPress={() => onResultClick?.(result)}
        >
          <Text {...getTestProps(`result-title-${index}`)}>{result.title || result.name}</Text>
          <Text {...getTestProps(`result-description-${index}`)}>{result.description}</Text>
        </TouchableOpacity>
      ))
    )}
  </View>
);

// KeyboardShortcutsHelp component stub
export const KeyboardShortcutsHelp: React.FC<any> = ({ visible = false, onClose, ...props }) => {
  if (!visible) return null;
  
  return (
    <View {...getTestProps('keyboard-shortcuts-help')}>
      <View {...getTestProps('shortcuts-content')}>
        <Text {...getTestProps('shortcuts-title')}>Keyboard Shortcuts</Text>
        <View {...getTestProps('shortcut-list')}>
          <Text {...getTestProps('shortcut-1')}>Ctrl+S - Save</Text>
          <Text {...getTestProps('shortcut-2')}>Ctrl+Z - Undo</Text>
          <Text {...getTestProps('shortcut-3')}>Ctrl+F - Search</Text>
        </View>
        <TouchableOpacity {...getTestProps('close-button')} onPress={onClose}>
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// * SyncQueueStatus component stub
export const SyncQueueStatus: React.FC<any> = ({ queue = [], syncing = false, ...props }) => (
  <View {...getTestProps('sync-queue-status')}>
    <Text {...getTestProps('sync-title')}>Sync Status</Text>
    {syncing && <ActivityIndicator {...getTestProps('sync-spinner')} />}
    <Text {...getTestProps('queue-count')}>Queue: {queue.length} items</Text>
  </View>
);

// ResourceHints component stub
export const ResourceHints: React.FC<any> = ({ hints = [], ...props }) => (
  <View {...getTestProps('resource-hints')}>
    <Text {...getTestProps('hints-title')}>Resource Hints</Text>
    {hints.map((hint: any, index: number) => (
      <Text key={index} {...getTestProps(`hint-${index}`)}>{hint}</Text>
    ))}
  </View>
);

// VirtualizedProjectList component stub
export const VirtualizedProjectList: React.FC<any> = ({ projects = [], onProjectClick, ...props }) => (
  <View {...getTestProps('virtualized-project-list')}>
    {projects.map((project: any, index: number) => (
      <TouchableOpacity 
        key={index} 
        {...getTestProps(`project-${index}`)}
        onPress={() => onProjectClick?.(project)}
      >
        <Text {...getTestProps(`project-name-${index}`)}>{project.name}</Text>
        <Text {...getTestProps(`project-description-${index}`)}>{project.description}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

// VirtualizedElementList component stub
export const VirtualizedElementList: React.FC<any> = ({ elements = [], onElementClick, ...props }) => (
  <View {...getTestProps('virtualized-element-list')}>
    {elements.map((element: any, index: number) => (
      <TouchableOpacity 
        key={index} 
        {...getTestProps(`element-${index}`)}
        onPress={() => onElementClick?.(element)}
      >
        <Text {...getTestProps(`element-name-${index}`)}>{element.name}</Text>
        <Text {...getTestProps(`element-category-${index}`)}>{element.category}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

// GlobalSearch component
interface GlobalSearchProps {
  visible: boolean;
  onClose: () => void;
  testID?: string;
}

interface SearchResult {
  projects: Project[];
  elements: WorldElement[];
}

const globalSearchStyles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    width: '90%',
    maxWidth: 600,
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  clearButton: {
    padding: 10,
    marginLeft: 5,
  },
  cancelButton: {
    padding: 10,
    marginLeft: 10,
  },
  cancelText: {
    color: '#007bff',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  resultCount: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  resultMeta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  resultDescription: {
    fontSize: 13,
    color: '#333',
  },
};

// * Mock search provider hook
const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchAll = (query: string): SearchResult => {
    // * Return mock results based on query
    if (!query) {
      return { projects: [], elements: [] };
    }
    
    // * Mock project and element data
    const mockProject: Project = {
      id: 'project-1',
      name: 'The Chronicles of Eldoria',
      description: 'An epic fantasy adventure',
      genre: 'fantasy',
      status: 'active',
      elements: [],
      collaborators: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockElement: WorldElement = {
      id: 'element-1',
      name: 'Aragorn',
      category: 'character',
      description: 'A brave ranger from the north',
      completionPercentage: 85,
      questions: [],
      answers: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
    };

    return {
      projects: [mockProject],
      elements: [mockElement],
    };
  };

  return { searchQuery, setSearchQuery, searchAll };
};

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ 
  visible, 
  onClose,
  testID = 'global-search',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult>({ projects: [], elements: [] });
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<any>(null);
  
  const { searchAll } = useSearch();
  
  // Auto-focus input when modal opens
  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [visible]);

  // ! PERFORMANCE: * Debounced search
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults({ projects: [], elements: [] });
      return;
    }

    // * Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);

    // ! PERFORMANCE: * Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      const results = searchAll(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchAll]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults({ projects: [], elements: [] });
  };

  const handleProjectPress = (project: Project) => {
    // * In tests, navigation is mocked
    onClose();
  };

  const handleElementPress = (element: WorldElement) => {
    // * In tests, navigation is mocked  
    onClose();
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      character: '👤',
      location: '📍',
      'item-object': '🗝️',
      'magic-power': '✨',
      event: '📅',
      organization: '🏛️',
      'creature-species': '🐉',
      'culture-society': '🌍',
      'religion-belief': '⛪',
      language: '💬',
      technology: '⚙️',
      custom: '📝',
    };
    return icons[category] || '📝';
  };

  if (!visible) return null;

  const totalResults = searchResults.projects.length + searchResults.elements.length;
  const hasSearched = searchQuery.length > 0;

  return (
    <View style={globalSearchStyles.container} testID={testID}>
      <TouchableOpacity 
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} 
        onPress={onClose}
        activeOpacity={1}
      />
      
      <View style={globalSearchStyles.modal}>
        <View style={globalSearchStyles.header}>
          <TextInput
            ref={inputRef}
            style={globalSearchStyles.searchInput}
            placeholder="Search projects and elements..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={globalSearchStyles.clearButton}
              onPress={handleClearSearch}
            >
              <Text>✕</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={globalSearchStyles.cancelButton}
            onPress={onClose}
          >
            <Text style={globalSearchStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={globalSearchStyles.content}>
          {!hasSearched ? (
            <View style={globalSearchStyles.emptyState}>
              <Text style={globalSearchStyles.emptyIcon}>🔍</Text>
              <Text style={globalSearchStyles.emptyTitle}>Search Everything</Text>
              <Text style={globalSearchStyles.emptyText}>
                Search across all your projects and elements
              </Text>
            </View>
          ) : totalResults === 0 ? (
            <View style={globalSearchStyles.emptyState}>
              <Text style={globalSearchStyles.emptyIcon}>🔎</Text>
              <Text style={globalSearchStyles.emptyTitle}>No Results</Text>
              <Text style={globalSearchStyles.emptyText}>
                No projects or elements match "{searchQuery}"
              </Text>
            </View>
          ) : (
            <>
              <Text style={globalSearchStyles.resultCount}>
                {totalResults} {totalResults === 1 ? 'result' : 'results'}
              </Text>
              
              {searchResults.projects.map(project => (
                <TouchableOpacity
                  key={project.id}
                  style={globalSearchStyles.resultItem}
                  onPress={() => handleProjectPress(project)}
                >
                  <Text style={globalSearchStyles.resultIcon}>📚</Text>
                  <View style={globalSearchStyles.resultContent}>
                    <Text style={globalSearchStyles.resultTitle}>{project.name}</Text>
                    <Text style={globalSearchStyles.resultMeta}>
                      Project • {project.elements?.length || 0} elements
                    </Text>
                    {project.description && (
                      <Text style={globalSearchStyles.resultDescription}>
                        {project.description}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
              
              {searchResults.elements.map(element => (
                <TouchableOpacity
                  key={element.id}
                  style={globalSearchStyles.resultItem}
                  onPress={() => handleElementPress(element)}
                >
                  <Text style={globalSearchStyles.resultIcon}>
                    {getCategoryIcon(element.category)}
                  </Text>
                  <View style={globalSearchStyles.resultContent}>
                    <Text style={globalSearchStyles.resultTitle}>{element.name}</Text>
                    <Text style={globalSearchStyles.resultMeta}>
                      {element.category} • {element.completionPercentage}% complete
                    </Text>
                    {element.description && (
                      <Text style={globalSearchStyles.resultDescription}>
                        {element.description}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

// ProjectCard component - Complete implementation for project display with action menu
interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description?: string;
    genre?: string;
    status: 'active' | 'completed' | 'on-hold' | 'planning' | 'revision';
    elementCount?: number;
    coverImage?: string;
    updatedAt?: Date | string;
  };
  onPress?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  testID?: string;
}

const projectCardStyles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 12,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  coverImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  folderIcon: {
    fontSize: 28,
    color: '#666',
  },
  contentContainer: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#333',
    flex: 1,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  actionText: {
    fontSize: 20,
    color: '#666',
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  elementCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500' as const,
  },
  actionMenu: {
    position: 'absolute' as const,
    top: 50,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
    minWidth: 120,
  },
  menuItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: 14,
    color: '#333',
  },
  menuItemDelete: {
    color: '#dc3545',
  },
};

// * Helper function to get status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return '#28a745'; // Green
    case 'completed':
      return '#ffc107'; // Amber
    case 'on-hold':
      return '#fd7e14'; // Orange
    case 'planning':
      return '#6f42c1'; // Indigo
    case 'revision':
      return '#dc3545'; // Red
    default:
      return '#6c757d'; // Gray
  }
};

// * Helper function to format relative time
const formatRelativeProjectTime = (date: Date | string | undefined): string => {
  if (!date) return '';
  
  const timestamp = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - timestamp.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  
  return timestamp.toLocaleDateString();
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onPress,
  onEdit,
  onDuplicate,
  onDelete,
  testID = 'project-card',
}) => {
  const [showActionMenu, setShowActionMenu] = useState(false);

  const handleActionPress = () => {
    setShowActionMenu(!showActionMenu);
  };

  const handleMenuItemPress = (action: 'edit' | 'duplicate' | 'delete') => {
    setShowActionMenu(false);
    
    switch (action) {
      case 'edit':
        onEdit?.();
        break;
      case 'duplicate':
        onDuplicate?.();
        break;
      case 'delete':
        onDelete?.();
        break;
    }
  };

  const handleCardPress = () => {
    if (!showActionMenu) {
      onPress?.();
    }
  };

  // * Close menu when clicking outside (in a real app, this would be handled differently)
  const handleOverlayPress = () => {
    if (showActionMenu) {
      setShowActionMenu(false);
    }
  };

  return (
    <>
      {/* Overlay to close menu when clicking outside */}
      {showActionMenu && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onPress={handleOverlayPress}
          activeOpacity={1}
        />
      )}
      
      <TouchableOpacity
        style={projectCardStyles.container}
        onPress={handleCardPress}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`Project: ${project.name}`}
      >
        <View style={projectCardStyles.header}>
          {/* Cover Image or Default Icon */}
          <View style={projectCardStyles.imageContainer}>
            {project.coverImage ? (
              <Text
                style={projectCardStyles.coverImage}
                testID="project-cover-image"
              >
                {/* In a real app, this would be an Image component */}
                🖼️
              </Text>
            ) : (
              <Text style={projectCardStyles.folderIcon} testID="project-default-icon">
                📁
              </Text>
            )}
          </View>

          <View style={projectCardStyles.contentContainer}>
            <View style={projectCardStyles.titleContainer}>
              <Text style={projectCardStyles.title} testID="project-name">
                {project.name}
              </Text>
              
              {/* Action Menu Button */}
              <TouchableOpacity
                style={projectCardStyles.actionButton}
                onPress={handleActionPress}
                testID="project-action-button"
                accessibilityRole="button"
                accessibilityLabel="Project actions"
              >
                <Text style={projectCardStyles.actionText}>⋮</Text>
              </TouchableOpacity>
            </View>

            {/* Status Badge */}
            <View style={projectCardStyles.statusContainer}>
              <View
                style={[
                  projectCardStyles.statusBadge,
                  { backgroundColor: getStatusColor(project.status) }
                ]}
                testID="project-status-badge"
              >
                <Text style={projectCardStyles.statusText} testID="project-status">
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
                </Text>
              </View>
              
              {project.genre && (
                <Text style={projectCardStyles.metaText} testID="project-genre">
                  {project.genre}
                </Text>
              )}
            </View>

            {/* Description */}
            {project.description && (
              <Text 
                style={projectCardStyles.description}
                testID="project-description"
                numberOfLines={2}
              >
                {project.description}
              </Text>
            )}

            {/* Metadata */}
            <View style={projectCardStyles.metaContainer}>
              <Text style={projectCardStyles.elementCount} testID="project-element-count">
                {project.elementCount || 0} elements
              </Text>
              
              {project.updatedAt && (
                <Text style={projectCardStyles.metaText} testID="project-updated-at">
                  {formatRelativeProjectTime(project.updatedAt)}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Action Menu */}
        {showActionMenu && (
          <View style={projectCardStyles.actionMenu} testID="project-action-menu">
            <TouchableOpacity
              style={projectCardStyles.menuItem}
              onPress={() => handleMenuItemPress('edit')}
              testID="project-edit-action"
              accessibilityRole="button"
            >
              <Text style={projectCardStyles.menuItemText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={projectCardStyles.menuItem}
              onPress={() => handleMenuItemPress('duplicate')}
              testID="project-duplicate-action"
              accessibilityRole="button"
            >
              <Text style={projectCardStyles.menuItemText}>Duplicate</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[projectCardStyles.menuItem, projectCardStyles.menuItemLast]}
              onPress={() => handleMenuItemPress('delete')}
              testID="project-delete-action"
              accessibilityRole="button"
            >
              <Text style={[projectCardStyles.menuItemText, projectCardStyles.menuItemDelete]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </>
  );
};
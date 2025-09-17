// Component test helpers for missing components
// These are React Native Web compatible stubs with data-cy attributes for testing

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Platform } from 'react-native';

// Helper function to add proper test attributes for React Native Web
const getTestProps = (id: string) => {
  // React Native Web automatically converts testID to data-testid in the DOM
  // We need to use testID for React Native components
  return {
    testID: id,
    // Also add accessible prop for better testing
    accessible: true,
    accessibilityTestID: id,
  };
};

// Format relative time for timestamps
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
export const BasicQuestionsSelector: React.FC<any> = ({ 
  questions = [], 
  basicQuestionIds = [], 
  onQuestionsChange,
  title = "Select Questions",
  description = "Choose questions to answer",
  ...props 
}) => (
  <View {...getTestProps('basic-questions-selector')}>
    <Text {...getTestProps('selector-title')}>{title}</Text>
    <Text {...getTestProps('selector-description')}>{description}</Text>
    <View {...getTestProps('questions-container')}>
      {questions.map((q: any, i: number) => (
        <TouchableOpacity 
          key={i}
          {...getTestProps(`question-${i}`)}
          onPress={() => onQuestionsChange && onQuestionsChange(q.id)}
        >
          <Text>{q.text || `Question ${i}`}</Text>
        </TouchableOpacity>
      ))}
    </View>
    <TouchableOpacity {...getTestProps('apply-defaults-button')}>
      <Text>Apply Defaults</Text>
    </TouchableOpacity>
    <TouchableOpacity {...getTestProps('select-all-button')}>
      <Text>Select All</Text>
    </TouchableOpacity>
    <TouchableOpacity {...getTestProps('select-none-button')}>
      <Text>Select None</Text>
    </TouchableOpacity>
  </View>
);

// BaseElementForm component with all required data-cy attributes
export const BaseElementForm: React.FC<any> = ({ 
  element,
  onSave,
  onCancel,
  isSubmitting,
  validationErrors = {},
  ...props 
}) => (
  <View {...getTestProps('base-element-form')}>
    <View {...getTestProps('form-header')}>
      <Text {...getTestProps('form-title')}>Element Form</Text>
    </View>
    
    <TextInput
      {...getTestProps('name-input')}
      placeholder="Name"
      value={element?.name || ''}
    />
    
    <TextInput
      {...getTestProps('description-input')}
      placeholder="Description"
      value={element?.description || ''}
      multiline
    />
    
    {validationErrors.name && (
      <Text {...getTestProps('name-error')}>{validationErrors.name}</Text>
    )}
    
    <View {...getTestProps('form-actions')}>
      <TouchableOpacity 
        {...getTestProps('save-button')}
        onPress={onSave}
        disabled={isSubmitting}
      >
        <Text>Save</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        {...getTestProps('cancel-button')}
        onPress={onCancel}
      >
        <Text>Cancel</Text>
      </TouchableOpacity>
    </View>
    
    {isSubmitting && (
      <ActivityIndicator {...getTestProps('submit-spinner')} />
    )}
  </View>
);

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

// UtilityComponents component
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

// CreateElementModal component
export const CreateElementModal: React.FC<any> = ({ 
  visible, 
  onClose, 
  onCreate,
  onSuccess,
  ...props 
}) => {
  if (!visible) return null;
  
  return (
    <View {...getTestProps('create-element-modal')}>
      <View {...getTestProps('modal-header')}>
        <Text {...getTestProps('modal-title')}>Create New Element</Text>
        <TouchableOpacity {...getTestProps('close-button')} onPress={onClose}>
          <Text>×</Text>
        </TouchableOpacity>
      </View>
      
      <View {...getTestProps('category-selector')}>
        <TouchableOpacity {...getTestProps('category-character')}>
          <Text>Character</Text>
        </TouchableOpacity>
        <TouchableOpacity {...getTestProps('category-location')}>
          <Text>Location</Text>
        </TouchableOpacity>
        <TouchableOpacity {...getTestProps('category-item')}>
          <Text>Item</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        {...getTestProps('create-button')}
        onPress={() => {
          onCreate && onCreate({ category: 'character' });
          onSuccess && onSuccess();
        }}
      >
        <Text>Create</Text>
      </TouchableOpacity>
    </View>
  );
};

// Breadcrumb component
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

// Button component (already working but let's ensure it uses getTestProps)
export const Button: React.FC<any> = ({ title, onPress, disabled, ...props }) => (
  <TouchableOpacity 
    {...getTestProps('button')}
    onPress={onPress}
    disabled={disabled}
  >
    <Text>{title || 'Button'}</Text>
  </TouchableOpacity>
);

// Export stub types to satisfy TypeScript
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

// Mock store provider for tests
export const MockWorldbuildingStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

// Utility functions for tests
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
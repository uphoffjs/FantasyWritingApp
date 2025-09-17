// Component test helpers for missing components
// These are React Native Web compatible stubs with data-cy attributes for testing

import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';

// Helper function to add data-cy attribute for web testing
const withDataCy = (dataCy: string) => {
  // React Native Web will handle this properly for web testing
  return { 'data-cy': dataCy } as any;
};

// AutoSaveIndicator component with proper data-cy attributes
export const AutoSaveIndicator: React.FC<any> = ({ status = 'idle', error, timestamp, onRetry, className, autoHide, ...props }) => (
  <View {...withDataCy('autosave-indicator')} style={{ padding: 8 }}>
    <Text {...withDataCy('autosave-status')}>{status}</Text>
    {error && <Text {...withDataCy('autosave-error')}>{error}</Text>}
    {timestamp && <Text {...withDataCy('autosave-timestamp')}>Saved {timestamp}</Text>}
    {error && onRetry && (
      <TouchableOpacity {...withDataCy('autosave-retry')} onPress={onRetry}>
        <Text>Retry</Text>
      </TouchableOpacity>
    )}
  </View>
);

// BasicQuestionsSelector component
export const BasicQuestionsSelector: React.FC<any> = ({ 
  questions = [], 
  basicQuestionIds = [], 
  onQuestionsChange,
  title = "Select Questions",
  description = "Choose questions to answer",
  ...props 
}) => (
  <View {...withDataCy('basic-questions-selector')}>
    <Text {...withDataCy('selector-title')}>{title}</Text>
    <Text {...withDataCy('selector-description')}>{description}</Text>
    <View {...withDataCy('questions-container')}>
      {questions.map((q: any, i: number) => (
        <TouchableOpacity 
          key={i}
          {...withDataCy(`question-${i}`)}
          onPress={() => onQuestionsChange && onQuestionsChange(q.id)}
        >
          <Text>{q.text || `Question ${i}`}</Text>
        </TouchableOpacity>
      ))}
    </View>
    <TouchableOpacity {...withDataCy('apply-defaults-button')}>
      <Text>Apply Defaults</Text>
    </TouchableOpacity>
    <TouchableOpacity {...withDataCy('select-all-button')}>
      <Text>Select All</Text>
    </TouchableOpacity>
    <TouchableOpacity {...withDataCy('select-none-button')}>
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
  <View {...withDataCy('base-element-form')}>
    <View {...withDataCy('form-header')}>
      <Text {...withDataCy('form-title')}>Element Form</Text>
    </View>
    
    <TextInput
      {...withDataCy('name-input')}
      placeholder="Name"
      value={element?.name || ''}
    />
    
    <TextInput
      {...withDataCy('description-input')}
      placeholder="Description"
      value={element?.description || ''}
      multiline
    />
    
    {validationErrors.name && (
      <Text {...withDataCy('name-error')}>{validationErrors.name}</Text>
    )}
    
    <View {...withDataCy('form-actions')}>
      <TouchableOpacity 
        {...withDataCy('save-button')}
        onPress={onSave}
        disabled={isSubmitting}
      >
        <Text>Save</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        {...withDataCy('cancel-button')}
        onPress={onCancel}
      >
        <Text>Cancel</Text>
      </TouchableOpacity>
    </View>
    
    {isSubmitting && (
      <ActivityIndicator {...withDataCy('submit-spinner')} />
    )}
  </View>
);

// ErrorMessage component
export const ErrorMessage: React.FC<any> = ({ message, ...props }) => (
  <View {...withDataCy('error-message')}>
    <Text>{message || 'An error occurred'}</Text>
  </View>
);

// ErrorNotification component
export const ErrorNotification: React.FC<any> = ({ error, onDismiss, ...props }) => (
  <View {...withDataCy('error-notification')}>
    <Text {...withDataCy('error-text')}>{error?.message || 'An error occurred'}</Text>
    {onDismiss && (
      <TouchableOpacity {...withDataCy('dismiss-button')} onPress={onDismiss}>
        <Text>Dismiss</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ProgressBar component
export const ProgressBar: React.FC<any> = ({ progress = 0, ...props }) => (
  <View {...withDataCy('progress-bar')}>
    <View style={{ width: `${progress}%`, height: 4, backgroundColor: '#007AFF' }}>
      <Text {...withDataCy('progress-text')}>{progress}%</Text>
    </View>
  </View>
);

// LoadingSpinner component
export const LoadingSpinner: React.FC<any> = (props) => (
  <View {...withDataCy('loading-spinner')}>
    <ActivityIndicator size="small" />
  </View>
);

// LoadingScreen component
export const LoadingScreen: React.FC<any> = ({ message = "Loading...", ...props }) => (
  <View {...withDataCy('loading-screen')}>
    <ActivityIndicator size="large" />
    <Text {...withDataCy('loading-message')}>{message}</Text>
  </View>
);

// TagInput component
export const TagInput: React.FC<any> = ({ tags = [], onAddTag, onRemoveTag, ...props }) => (
  <View {...withDataCy('tag-input')}>
    <TextInput {...withDataCy('tag-input-field')} placeholder="Add tag..." />
    <View {...withDataCy('tags-container')}>
      {tags.map((tag: string, i: number) => (
        <View key={i} {...withDataCy(`tag-${i}`)}>
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
  <View {...withDataCy('tag-multi-select')}>
    {tags.map((tag: string, i: number) => (
      <TouchableOpacity
        key={i}
        {...withDataCy(`tag-option-${i}`)}
        onPress={() => onToggle && onToggle(tag)}
      >
        <Text>{tag}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

// VirtualizedList component
export const VirtualizedList: React.FC<any> = ({ items = [], renderItem, ...props }) => (
  <View {...withDataCy('virtualized-list')}>
    {items.map((item: any, i: number) => (
      <View key={i} {...withDataCy(`list-item-${i}`)}>
        {renderItem ? renderItem({ item, index: i }) : <Text>Item {i}</Text>}
      </View>
    ))}
  </View>
);

// UtilityComponents component
export const UtilityComponents: React.FC<any> = (props) => (
  <View {...withDataCy('utility-components')}>
    <Text>Utility Components</Text>
  </View>
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
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
  relationships?: any[];
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
export type QuestionType = 
  | 'text' 
  | 'textarea' 
  | 'select' 
  | 'multiselect' 
  | 'number' 
  | 'date' 
  | 'boolean';

export interface SelectOption {
  value: string;
  label: string;
}

export interface QuestionValidation {
  min?: number;          // Minimum value for numbers
  max?: number;          // Maximum value for numbers
  minLength?: number;    // Minimum length for text
  maxLength?: number;    // Maximum length for text
  pattern?: string;      // Regex pattern for validation
  message?: string;      // Custom validation message
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  category?: string;
  subcategory?: string;  // For finer grouping within categories
  required?: boolean;
  placeholder?: string;
  helpText?: string;     // User guidance text
  defaultValue?: string | string[] | number | boolean | Date;  // Default values
  inputSize?: 'small' | 'medium' | 'large';  // Visual size hint
  options?: SelectOption[];
  dependsOn?: {
    questionId: string;
    value: unknown;  // The expected value for the condition
  };
  validation?: QuestionValidation;  // Comprehensive validation
}

export interface QuestionCategory {
  id: string;
  name: string;
  order: number;
  description?: string;
}

export const DEFAULT_QUESTION_CATEGORIES: QuestionCategory[] = [
  { id: 'basic', name: 'Basic Information', order: 1 },
  { id: 'appearance', name: 'Appearance', order: 2 },
  { id: 'personality', name: 'Personality', order: 3 },
  { id: 'background', name: 'Background', order: 4 },
  { id: 'relationships', name: 'Relationships', order: 5 },
  { id: 'abilities', name: 'Abilities', order: 6 },
  { id: 'other', name: 'Other Details', order: 7 }
];
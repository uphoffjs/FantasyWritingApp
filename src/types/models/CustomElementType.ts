import { Question } from './Question';

/**
 * Custom element types allow users to define their own worldbuilding categories
 * beyond the standard predefined ones.
 */
export interface CustomElementType {
  id: string;
  name: string;
  singularName: string; // e.g., "Artifact" for "Artifacts"
  pluralName: string;   // e.g., "Artifacts"
  icon?: string;        // Icon identifier or emoji
  color?: string;       // Hex color for UI theming
  description?: string;
  baseQuestions: Question[]; // Default questions for this type
  createdBy: string;    // User ID who created this type
  createdAt: Date;
  updatedAt: Date;
  isShared?: boolean;   // Can other users in project use it
  metadata?: CustomTypeMetadata;
}

export interface CustomTypeMetadata {
  usageCount?: number;  // How many elements use this type
  tags?: string[];      // Categorization tags
  templateVersion?: number;
  isArchived?: boolean;
}

export interface CreateCustomTypeInput {
  name: string;
  singularName: string;
  pluralName: string;
  icon?: string;
  color?: string;
  description?: string;
  baseQuestions: Question[];
  isShared?: boolean;
  metadata?: Partial<CustomTypeMetadata>;
}

export interface UpdateCustomTypeInput {
  name?: string;
  singularName?: string;
  pluralName?: string;
  icon?: string;
  color?: string;
  description?: string;
  baseQuestions?: Question[];
  isShared?: boolean;
  metadata?: Partial<CustomTypeMetadata>;
}

// * Type guards
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Type guard requires runtime checking of unknown value properties
export function isCustomElementType(value: any): value is CustomElementType {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.singularName === 'string' &&
    typeof value.pluralName === 'string' &&
    Array.isArray(value.baseQuestions) &&
    typeof value.createdBy === 'string'
  );
}

// * Helper to check if element uses custom type
export function usesCustomType(element: { category: string; customTypeId?: string }): boolean {
  return element.category === 'custom' && !!element.customTypeId;
}

// * Validation helper
export function validateCustomTypeInput(input: CreateCustomTypeInput): void {
  if (!input.name || input.name.trim() === '') {
    throw new Error('Custom type name is required');
  }
  
  if (!input.singularName || input.singularName.trim() === '') {
    throw new Error('Singular name is required');
  }
  
  if (!input.pluralName || input.pluralName.trim() === '') {
    throw new Error('Plural name is required');
  }
  
  if (!input.baseQuestions || input.baseQuestions.length === 0) {
    throw new Error('At least one base question is required');
  }
}
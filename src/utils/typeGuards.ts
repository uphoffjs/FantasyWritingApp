import { 
  ElementCategory,
  ELEMENT_CATEGORIES,
  QuestionType, 
  WorldElement, 
  Project, 
  Question, 
  Answer, 
  Relationship,
  RelationshipType,
  RelationshipMetadata,
  RELATIONSHIP_TYPE_LABELS,
  QuestionnaireTemplate,
  QuestionValidation,
  CustomElementType
} from '../types/models';

/**
 * Type guards for runtime type checking of external data
 * These ensure data integrity when loading from localStorage, API, or imports
 */

// Helper functions
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasProperty<T extends string>(
  obj: unknown,
  key: T
): obj is Record<T, unknown> {
  return isRecord(obj) && key in obj;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isDate(value: unknown): value is Date {
  return value instanceof Date || (
    typeof value === 'string' && !isNaN(Date.parse(value))
  );
}

function isArray<T>(
  value: unknown,
  itemGuard?: (item: unknown) => item is T
): value is T[] {
  if (!Array.isArray(value)) return false;
  if (!itemGuard) return true;
  return value.every(itemGuard);
}

// Element Category type guard
export function isElementCategory(value: unknown): value is ElementCategory {
  return isString(value) && ELEMENT_CATEGORIES.includes(value as ElementCategory);
}

// Question Type guard
export function isQuestionType(value: unknown): value is QuestionType {
  const validTypes: QuestionType[] = [
    'text', 'textarea', 'select', 'multiselect', 
    'number', 'date', 'boolean'
  ];
  return isString(value) && validTypes.includes(value as QuestionType);
}

// Relationship Type guard
export function isRelationshipType(value: unknown): value is RelationshipType {
  return isString(value) && value in RELATIONSHIP_TYPE_LABELS;
}

// Removed ImageWithCaption - not in MVP

// Question Validation guard
export function isQuestionValidation(value: unknown): value is QuestionValidation {
  if (!isRecord(value)) return false;
  
  return (
    (!hasProperty(value, 'min') || isNumber(value.min)) &&
    (!hasProperty(value, 'max') || isNumber(value.max)) &&
    (!hasProperty(value, 'minLength') || isNumber(value.minLength)) &&
    (!hasProperty(value, 'maxLength') || isNumber(value.maxLength)) &&
    (!hasProperty(value, 'pattern') || isString(value.pattern)) &&
    (!hasProperty(value, 'message') || isString(value.message))  // Changed from customMessage to message
  );
}

// Question guard
export function isQuestion(value: unknown): value is Question {
  if (!isRecord(value)) return false;
  
  const hasRequiredFields = (
    hasProperty(value, 'id') && isString(value.id) &&
    hasProperty(value, 'text') && isString(value.text) &&
    hasProperty(value, 'type') && isQuestionType(value.type)
  );
  
  if (!hasRequiredFields) return false;
  
  // Check optional fields
  const optionalFieldsValid = (
    (!hasProperty(value, 'category') || isString(value.category)) &&
    (!hasProperty(value, 'subcategory') || isString(value.subcategory)) &&
    (!hasProperty(value, 'placeholder') || isString(value.placeholder)) &&
    (!hasProperty(value, 'options') || isArray(value.options, isString)) &&
    (!hasProperty(value, 'required') || isBoolean(value.required)) &&
    (!hasProperty(value, 'helpText') || isString(value.helpText)) &&
    (!hasProperty(value, 'validation') || isQuestionValidation(value.validation)) &&
    (!hasProperty(value, 'inputSize') || 
      (isString(value.inputSize) && ['small', 'medium', 'large'].includes(value.inputSize)))
  );
  
  return optionalFieldsValid;
}

// Answer guard
export function isAnswer(value: unknown): value is Answer {
  if (!isRecord(value)) return false;
  
  return (
    hasProperty(value, 'value') && (
      isString(value.value) || 
      isNumber(value.value) || 
      isBoolean(value.value) ||
      isDate(value.value) ||
      isArray(value.value, isString)
    ) &&
    hasProperty(value, 'updatedAt') && isDate(value.updatedAt) &&
    (!hasProperty(value, 'history') || isArray(value.history))  // history is optional
  );
}

// Relationship Metadata guard
export function isRelationshipMetadata(value: unknown): value is RelationshipMetadata {
  if (!isRecord(value)) return false;
  
  return (
    (!hasProperty(value, 'strength') || 
      (isString(value.strength) && ['weak', 'moderate', 'strong'].includes(value.strength))) &&
    (!hasProperty(value, 'startDate') || isDate(value.startDate)) &&
    (!hasProperty(value, 'endDate') || isDate(value.endDate)) &&
    (!hasProperty(value, 'notes') || isString(value.notes))
  );
}

// Relationship guard
export function isRelationship(value: unknown): value is Relationship {
  if (!isRecord(value)) return false;
  
  return (
    hasProperty(value, 'id') && isString(value.id) &&
    hasProperty(value, 'fromId') && isString(value.fromId) &&
    hasProperty(value, 'toId') && isString(value.toId) &&
    hasProperty(value, 'type') && isRelationshipType(value.type) &&
    hasProperty(value, 'createdAt') && isDate(value.createdAt) &&
    (!hasProperty(value, 'fromName') || isString(value.fromName)) &&
    (!hasProperty(value, 'toName') || isString(value.toName)) &&
    (!hasProperty(value, 'description') || isString(value.description)) &&
    (!hasProperty(value, 'metadata') || isRelationshipMetadata(value.metadata))
  );
}

// World Element guard
export function isWorldElement(value: unknown): value is WorldElement {
  if (!isRecord(value)) return false;
  
  const hasRequiredFields = (
    hasProperty(value, 'id') && isString(value.id) &&
    hasProperty(value, 'name') && isString(value.name) &&
    hasProperty(value, 'category') && isElementCategory(value.category) &&
    hasProperty(value, 'questions') && isArray(value.questions, isQuestion) &&
    hasProperty(value, 'answers') && isRecord(value.answers) &&
    hasProperty(value, 'completionPercentage') && isNumber(value.completionPercentage) &&
    hasProperty(value, 'createdAt') && isDate(value.createdAt) &&
    hasProperty(value, 'updatedAt') && isDate(value.updatedAt)
  );
  
  if (!hasRequiredFields) return false;
  
  // Check answers are all valid
  if (hasProperty(value, 'answers') && isRecord(value.answers)) {
    for (const answer of Object.values(value.answers)) {
      if (!isAnswer(answer)) return false;
    }
  }
  
  // Check optional fields
  const optionalFieldsValid = (
    (!hasProperty(value, 'description') || isString(value.description)) &&
    (!hasProperty(value, 'customTypeId') || isString(value.customTypeId)) &&
    (!hasProperty(value, 'templateId') || isString(value.templateId)) &&
    (!hasProperty(value, 'tags') || isArray(value.tags, isString)) &&
    (!hasProperty(value, 'relationships') || isArray(value.relationships, isRelationship)) &&
    (!hasProperty(value, 'metadata') || isRecord(value.metadata))
  );
  
  return optionalFieldsValid;
}

// Questionnaire Template guard
export function isQuestionnaireTemplate(value: unknown): value is QuestionnaireTemplate {
  if (!isRecord(value)) return false;
  
  return (
    hasProperty(value, 'id') && isString(value.id) &&
    hasProperty(value, 'name') && isString(value.name) &&
    hasProperty(value, 'category') && isElementCategory(value.category) &&
    hasProperty(value, 'questions') && isArray(value.questions, isQuestion) &&
    (!hasProperty(value, 'description') || isString(value.description)) &&
    (!hasProperty(value, 'isCustom') || isBoolean(value.isCustom))
  );
}

// Custom Element Type guard
export function isCustomElementType(value: unknown): value is CustomElementType {
  if (!isRecord(value)) return false;
  
  return (
    hasProperty(value, 'id') && isString(value.id) &&
    hasProperty(value, 'name') && isString(value.name) &&
    hasProperty(value, 'singularName') && isString(value.singularName) &&
    hasProperty(value, 'pluralName') && isString(value.pluralName) &&
    hasProperty(value, 'baseQuestions') && isArray(value.baseQuestions, isQuestion) &&
    hasProperty(value, 'createdBy') && isString(value.createdBy) &&
    hasProperty(value, 'createdAt') && isDate(value.createdAt) &&
    hasProperty(value, 'updatedAt') && isDate(value.updatedAt) &&
    (!hasProperty(value, 'icon') || isString(value.icon)) &&
    (!hasProperty(value, 'color') || isString(value.color)) &&
    (!hasProperty(value, 'description') || isString(value.description)) &&
    (!hasProperty(value, 'isShared') || isBoolean(value.isShared)) &&
    (!hasProperty(value, 'metadata') || isRecord(value.metadata))
  );
}

// Project Settings guard
export function isProjectSettings(value: unknown): value is { useRichText?: boolean } {
  if (!isRecord(value)) return false;
  
  return (!hasProperty(value, 'useRichText') || isBoolean(value.useRichText));
}

// Project guard
export function isProject(value: unknown): value is Project {
  if (!isRecord(value)) return false;
  
  const hasRequiredFields = (
    hasProperty(value, 'id') && isString(value.id) &&
    hasProperty(value, 'name') && isString(value.name) &&
    hasProperty(value, 'description') && isString(value.description) &&
    hasProperty(value, 'elements') && isArray(value.elements, isWorldElement) &&
    hasProperty(value, 'templates') && isArray(value.templates, isQuestionnaireTemplate) &&
    hasProperty(value, 'createdAt') && isDate(value.createdAt) &&
    hasProperty(value, 'updatedAt') && isDate(value.updatedAt)
  );
  
  if (!hasRequiredFields) return false;
  
  // Check optional fields
  const optionalFieldsValid = (
    (!hasProperty(value, 'genre') || isString(value.genre)) &&
    (!hasProperty(value, 'status') || isString(value.status)) &&
    (!hasProperty(value, 'isArchived') || isBoolean(value.isArchived)) &&
    (!hasProperty(value, 'coverImage') || isString(value.coverImage)) &&
    (!hasProperty(value, 'customTypes') || isArray(value.customTypes)) &&  // Added customTypes check
    (!hasProperty(value, 'metadata') || isRecord(value.metadata))  // Changed from settings to metadata
  );
  
  return optionalFieldsValid;
}

// Import/Export data validation
export interface ImportData {
  projects?: Project[];
  templates?: QuestionnaireTemplate[];
  version?: string;
  exportedAt?: string;
}

export function isImportData(value: unknown): value is ImportData {
  if (!isRecord(value)) return false;
  
  return (
    (!hasProperty(value, 'projects') || isArray(value.projects, isProject)) &&
    (!hasProperty(value, 'templates') || isArray(value.templates, isQuestionnaireTemplate)) &&
    (!hasProperty(value, 'version') || isString(value.version)) &&
    (!hasProperty(value, 'exportedAt') || isString(value.exportedAt))
  );
}

// Validation helper for store boundaries
export function validateExternalData<T>(
  data: unknown,
  guard: (value: unknown) => value is T,
  context: string
): T {
  if (!guard(data)) {
    throw new Error(`Invalid data format for ${context}`);
  }
  return data;
}

// Batch validation with partial results
export function validateArray<T>(
  items: unknown[],
  guard: (value: unknown) => value is T
): { valid: T[], invalid: Array<{ index: number; item: unknown }> } {
  const valid: T[] = [];
  const invalid: Array<{ index: number; item: unknown }> = [];
  
  items.forEach((item, index) => {
    if (guard(item)) {
      valid.push(item);
    } else {
      invalid.push({ index, item });
    }
  });
  
  return { valid, invalid };
}
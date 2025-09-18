// * Core worldbuilding types
import { Relationship } from './models/Relationship';

// Re-export for backward compatibility
export type { Relationship } from './models/Relationship';

export type ElementCategory = 
  | 'character'
  | 'location'
  | 'item-object'
  | 'magic-system'
  | 'culture-society'
  | 'race-species'
  | 'organization'
  | 'religion-belief'
  | 'technology'
  | 'historical-event'
  | 'language'
  | 'custom';

export type QuestionType = 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'date' | 'boolean';

export interface QuestionValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customMessage?: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  category?: string; // For grouping questions
  subcategory?: string; // For finer grouping within categories
  placeholder?: string;
  options?: string[]; // For select/multiselect
  required?: boolean;
  helpText?: string;
  validation?: QuestionValidation;
  defaultValue?: string | string[] | number | boolean | Date;
  dependsOn?: { questionId: string; value: string | number | boolean | string[] }; // Conditional questions
  inputSize?: 'small' | 'medium' | 'large'; // Visual size hint
}

export interface Answer {
  questionId: string;
  value: string | string[] | number | boolean | Date;
  lastUpdated: Date;
}

export interface ImageWithCaption {
  id: string;
  data: string; // base64 encoded image
  caption?: string;
}

export interface WorldElement {
  id: string;
  name: string;
  category: ElementCategory;
  description: string;
  questions: Question[];
  answers: Record<string, Answer>; // questionId -> Answer
  relationships: Relationship[];
  tags: string[];
  images?: ImageWithCaption[]; // Array of image objects with captions
  createdAt: Date;
  updatedAt: Date;
  completionPercentage: number;
  metadata?: {
    usageCount?: number;
    lastUsed?: Date;
  };
}

// * Relationship interface is now imported from ./models/Relationship

export interface ProjectSettings {
  useRichText: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  genre?: string;
  status?: string;
  isArchived?: boolean;
  coverImage?: string; // Base64 encoded image or URL
  elements: WorldElement[];
  templates: QuestionnaireTemplate[];
  settings?: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionnaireTemplate {
  id: string;
  name: string;
  category: ElementCategory;
  description: string;
  questions: Question[];
  isDefault?: boolean; // Pre-built templates
  // * Marketplace fields
  author?: string;
  rating?: number;
  downloads?: number;
  tags?: string[];
  version?: string;
  lastUpdated?: Date;
  // Basic/Detailed mode support
  supportsBasicMode?: boolean;
  basicQuestionIds?: string[];
  defaultMode?: 'basic' | 'detailed';
}

// TODO: * Default question templates for each category
export const DEFAULT_TEMPLATES: Record<ElementCategory, Partial<QuestionnaireTemplate>> = {
  'character': {
    name: 'Character Template',
    description: 'Comprehensive questionnaire for developing rich, multi-dimensional characters',
    questions: [] // Will be populated from templates
  },
  'location': {
    name: 'Location Template',
    description: 'Detailed questionnaire for creating immersive locations and settings',
    questions: [] // Will be populated from templates
  },
  'item-object': {
    name: 'Item/Object Template',
    description: 'Comprehensive questionnaire for magical artifacts, weapons, tools, and important objects',
    questions: [
      { id: 'name', text: 'Item Name', type: 'text', required: true, placeholder: 'e.g., Excalibur, Ring of Power' },
      { id: 'type', text: 'Item Type', type: 'select', category: 'Classification', options: ['Weapon', 'Armor', 'Jewelry', 'Tool', 'Artifact', 'Consumable', 'Container', 'Document', 'Clothing', 'Magical Item', 'Other'] },
      { id: 'description', text: 'Physical Description', type: 'textarea', category: 'Appearance', helpText: 'What does it look like? Size, weight, materials, distinguishing features' },
      { id: 'origin', text: 'Origin and History', type: 'textarea', category: 'History', helpText: 'Who created it? When? What is its history?' },
      { id: 'purpose', text: 'Purpose and Function', type: 'textarea', category: 'Function', helpText: 'What was it designed to do? What is its primary use?' },
      { id: 'powers', text: 'Special Properties/Powers', type: 'textarea', category: 'Abilities', helpText: 'Does it have magical properties, special abilities, or unique features?' },
      { id: 'limitations', text: 'Limitations and Drawbacks', type: 'textarea', category: 'Abilities', helpText: 'What are its weaknesses, costs, or limitations?' },
      { id: 'currentOwner', text: 'Current Owner/Location', type: 'text', category: 'Status', helpText: 'Who owns it now? Where is it kept?' },
      { id: 'previousOwners', text: 'Notable Previous Owners', type: 'textarea', category: 'History', helpText: 'Who has owned or used this item in the past?' },
      { id: 'significance', text: 'Cultural/Story Significance', type: 'textarea', category: 'Importance', helpText: 'Why is this item important to your world or story?' },
      { id: 'value', text: 'Value and Rarity', type: 'textarea', category: 'Status', helpText: 'How rare is it? What is it worth?' },
      { id: 'activation', text: 'How to Use/Activate', type: 'textarea', category: 'Function', helpText: 'Are there special requirements, words, or methods to use it?' }
    ]
  },
  'magic-system': {
    name: 'Magic System Template',
    questions: [
      { id: 'name', text: 'System Name', type: 'text', required: true },
      { id: 'source', text: 'Source of Magic', type: 'textarea', category: 'Fundamentals' },
      { id: 'rules', text: 'Rules and Limitations', type: 'textarea', category: 'Mechanics' },
      { id: 'users', text: 'Who Can Use It?', type: 'textarea', category: 'Access' },
      { id: 'cost', text: 'Cost or Consequences', type: 'textarea', category: 'Mechanics' },
      { id: 'types', text: 'Types of Magic', type: 'textarea', category: 'Categories' },
      { id: 'learning', text: 'How is it Learned?', type: 'textarea', category: 'Access' },
    ]
  },
  'culture-society': {
    name: 'Culture/Society Template',
    questions: [
      { id: 'name', text: 'Culture Name', type: 'text', required: true },
      { id: 'values', text: 'Core Values and Beliefs', type: 'textarea', category: 'Beliefs' },
      { id: 'structure', text: 'Social Structure', type: 'textarea', category: 'Organization' },
      { id: 'customs', text: 'Customs and Traditions', type: 'textarea', category: 'Daily Life' },
      { id: 'government', text: 'Government System', type: 'textarea', category: 'Organization' },
      { id: 'economy', text: 'Economic System', type: 'textarea', category: 'Organization' },
      { id: 'conflicts', text: 'Internal/External Conflicts', type: 'textarea', category: 'Politics' },
    ]
  },
  'race-species': {
    name: 'Race/Species Template',
    questions: [
      { id: 'name', text: 'Species Name', type: 'text', required: true },
      { id: 'appearance', text: 'Physical Description', type: 'textarea', category: 'Biology' },
      { id: 'habitat', text: 'Natural Habitat', type: 'textarea', category: 'Environment' },
      { id: 'diet', text: 'Diet and Feeding', type: 'textarea', category: 'Biology' },
      { id: 'behavior', text: 'Behavior Patterns', type: 'textarea', category: 'Psychology' },
      { id: 'abilities', text: 'Special Abilities', type: 'textarea', category: 'Abilities' },
      { id: 'society', text: 'Social Structure', type: 'textarea', category: 'Culture' },
      { id: 'reproduction', text: 'Life Cycle', type: 'textarea', category: 'Biology' },
    ]
  },
  'organization': {
    name: 'Organization Template',
    questions: [
      { id: 'name', text: 'Organization Name', type: 'text', required: true },
      { id: 'type', text: 'Type', type: 'select', options: ['Guild', 'Military', 'Religious', 'Criminal', 'Political', 'Commercial', 'Academic'] },
      { id: 'purpose', text: 'Purpose and Goals', type: 'textarea', category: 'Overview' },
      { id: 'structure', text: 'Hierarchy and Structure', type: 'textarea', category: 'Organization' },
      { id: 'membership', text: 'Membership Requirements', type: 'textarea', category: 'Members' },
      { id: 'resources', text: 'Resources and Assets', type: 'textarea', category: 'Resources' },
      { id: 'influence', text: 'Sphere of Influence', type: 'textarea', category: 'Politics' },
    ]
  },
  'religion-belief': {
    name: 'Religion/Belief System Template',
    questions: [
      { id: 'name', text: 'Religion Name', type: 'text', required: true },
      { id: 'deities', text: 'Deities or Central Figures', type: 'textarea', category: 'Divine' },
      { id: 'beliefs', text: 'Core Beliefs', type: 'textarea', category: 'Doctrine' },
      { id: 'practices', text: 'Rituals and Practices', type: 'textarea', category: 'Practice' },
      { id: 'clergy', text: 'Religious Hierarchy', type: 'textarea', category: 'Organization' },
      { id: 'texts', text: 'Sacred Texts', type: 'textarea', category: 'Doctrine' },
      { id: 'places', text: 'Holy Sites', type: 'textarea', category: 'Places' },
    ]
  },
  'technology': {
    name: 'Technology Template',
    questions: [
      { id: 'name', text: 'Technology Name', type: 'text', required: true },
      { id: 'function', text: 'Function and Purpose', type: 'textarea', category: 'Overview' },
      { id: 'mechanics', text: 'How It Works', type: 'textarea', category: 'Technical' },
      { id: 'materials', text: 'Required Materials', type: 'textarea', category: 'Construction' },
      { id: 'users', text: 'Who Can Use/Create It', type: 'textarea', category: 'Access' },
      { id: 'impact', text: 'Impact on Society', type: 'textarea', category: 'Effects' },
      { id: 'limitations', text: 'Limitations', type: 'textarea', category: 'Technical' },
    ]
  },
  'historical-event': {
    name: 'Historical Event Template',
    questions: [
      { id: 'name', text: 'Event Name', type: 'text', required: true },
      { id: 'date', text: 'When Did It Occur?', type: 'text', category: 'Timeline' },
      { id: 'location', text: 'Where Did It Happen?', type: 'textarea', category: 'Location' },
      { id: 'participants', text: 'Key Participants', type: 'textarea', category: 'People' },
      { id: 'causes', text: 'Causes', type: 'textarea', category: 'Context' },
      { id: 'events', text: 'What Happened?', type: 'textarea', category: 'Details' },
      { id: 'consequences', text: 'Consequences and Impact', type: 'textarea', category: 'Aftermath' },
    ]
  },
  'language': {
    name: 'Language Template',
    questions: [
      { id: 'name', text: 'Language Name', type: 'text', required: true },
      { id: 'speakers', text: 'Who Speaks It?', type: 'textarea', category: 'Speakers' },
      { id: 'writing', text: 'Writing System', type: 'textarea', category: 'Script' },
      { id: 'sounds', text: 'Phonetics and Sounds', type: 'textarea', category: 'Linguistics' },
      { id: 'grammar', text: 'Basic Grammar Rules', type: 'textarea', category: 'Linguistics' },
      { id: 'phrases', text: 'Common Phrases', type: 'textarea', category: 'Examples' },
      { id: 'naming', text: 'Naming Conventions', type: 'textarea', category: 'Culture' },
    ]
  },
  'custom': {
    name: 'Custom Element',
    questions: []
  }
};

// * Input types for creating/updating elements
export interface CreateElementInput {
  name: string;
  category: ElementCategory;
  customTypeId?: string;
  templateId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

// * Validation helpers
export function validateElementInput(input: CreateElementInput): void {
  if (!input.name || input.name.trim() === '') {
    throw new Error('Element name is required');
  }
  
  if (!input.category) {
    throw new Error('Category is required');
  }
  
  if (input.category === 'custom' && !input.customTypeId) {
    throw new Error('customTypeId is required when category is "custom"');
  }
  
  if (input.category !== 'custom' && input.customTypeId) {
    throw new Error('customTypeId should only be provided when category is "custom"');
  }
}

// * Type guards
export function hasStandardCategory(element: WorldElement): boolean {
  return element.category !== 'custom' && !element.customTypeId;
}

export function hasCustomType(element: WorldElement): boolean {
  return element.category === 'custom' && !!element.customTypeId;
}
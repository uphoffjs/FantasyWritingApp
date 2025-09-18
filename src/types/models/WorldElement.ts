import { ElementCategory } from './ElementCategory';
import { Question } from './Question';
import { Answer } from './Answer';
import { Relationship } from './Relationship';

export interface ElementMetadata {
  usageCount?: number;
  lastUsed?: Date;
  imageUrl?: string;
  tags?: string[];
}

export interface WorldElement {
  id: string;
  name: string;
  category: ElementCategory;    // Always required, use 'custom' for custom types
  customTypeId?: string;       // References CustomElementType when category is 'custom'
  description?: string;
  templateId?: string;
  questions: Question[];
  answers: Record<string, Answer>;
  completionPercentage: number;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  relationships?: Relationship[];
  metadata?: ElementMetadata;
}

export interface CreateElementInput {
  name: string;
  category: ElementCategory;   // Always required
  customTypeId?: string;       // Provide when category is 'custom'
  templateId?: string;
  tags?: string[];
  metadata?: Partial<ElementMetadata>;
}

export interface UpdateElementInput {
  name?: string;
  tags?: string[];
  metadata?: Partial<ElementMetadata>;
}

export interface ElementFilter {
  category?: ElementCategory;
  customTypeId?: string;
  tags?: string[];
  search?: string;
  completionMin?: number;
  completionMax?: number;
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
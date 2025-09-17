import { ElementCategory } from './ElementCategory';
import { Question } from './Question';

export interface QuestionnaireTemplate {
  id: string;
  name: string;
  category: ElementCategory;
  description?: string;
  questions: Question[];
  isDefault?: boolean;
  isPublic?: boolean;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
  metadata?: TemplateMetadata;
}

export interface TemplateMetadata {
  version?: number;
  author?: string;
  source?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: number; // in minutes
  downloadCount?: number;
  rating?: number;
  supportsBasicMode?: boolean;
  basicQuestionIds?: string[];
  defaultMode?: 'basic' | 'detailed';
}

export interface CreateTemplateInput {
  name: string;
  category: ElementCategory;
  description?: string;
  questions: Question[];
  isPublic?: boolean;
  tags?: string[];
  metadata?: TemplateMetadata;
}

export interface UpdateTemplateInput {
  name?: string;
  description?: string;
  questions?: Question[];
  isPublic?: boolean;
  tags?: string[];
  metadata?: Partial<TemplateMetadata>;
}

export interface TemplateFilter {
  category?: ElementCategory;
  isPublic?: boolean;
  tags?: string[];
  search?: string;
  difficulty?: string;
}

export const DEFAULT_TEMPLATE_IDS = {
  CHARACTER: 'default-character',
  LOCATION: 'default-location',
  ITEM_OBJECT: 'default-item-object',
  MAGIC_SYSTEM: 'default-magic-system',
  CULTURE_SOCIETY: 'default-culture-society',
  RACE_SPECIES: 'default-race-species',
  ORGANIZATION: 'default-organization',
  RELIGION_BELIEF: 'default-religion-belief',
  TECHNOLOGY: 'default-technology',
  HISTORICAL_EVENT: 'default-historical-event',
  LANGUAGE: 'default-language'
} as const;
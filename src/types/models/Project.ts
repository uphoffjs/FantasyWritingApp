import { WorldElement } from './WorldElement';
import { QuestionnaireTemplate } from './Template';
import { CustomElementType } from './CustomElementType';

export interface ProjectSettings {
  useRichText?: boolean;
  // Add other settings as needed
}

export interface ProjectMetadata {
  lastSyncedAt?: Date;
  version?: number;
  tags?: string[];
  isArchived?: boolean;
  settings?: ProjectSettings;  // Include settings here
}

export interface Project {
  id: string;
  name: string;
  description: string;
  genre?: string;
  status?: string;
  isArchived?: boolean;
  coverImage?: string;
  elements: WorldElement[];
  customTypes?: CustomElementType[];  // User-defined element types
  templates: QuestionnaireTemplate[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: ProjectMetadata;
}

export interface CreateProjectInput {
  name: string;
  description: string;
  metadata?: Partial<ProjectMetadata>;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  metadata?: Partial<ProjectMetadata>;
}

export interface ProjectStatistics {
  totalElements: number;
  elementsByCategory: Record<string, number>;
  totalRelationships: number;
  averageCompletion: number;
  lastActivity: Date;
}
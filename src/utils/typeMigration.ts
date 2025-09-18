import { 
  Question as NewQuestion, 
  SelectOption, 
  Answer as NewAnswer,
  WorldElement as NewWorldElement,
  Project as NewProject,
  QuestionValidation
} from '../types/worldbuilding';

// // DEPRECATED: * Old type definitions (for migration purposes only)
interface OldAnswer {
  questionId: string;
  value: string | string[] | number | boolean | Date;
  lastUpdated: Date;
}

interface OldQuestionValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customMessage?: string;
}

interface OldQuestion {
  id: string;
  text: string;
  type: string;
  category?: string;
  subcategory?: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  helpText?: string;
  validation?: OldQuestionValidation;
  defaultValue?: string | string[] | number | boolean | Date;
  dependsOn?: { questionId: string; value: any };
  inputSize?: 'small' | 'medium' | 'large';
}

interface OldWorldElement {
  id: string;
  name: string;
  category: string;
  description: string;
  questions: OldQuestion[];
  answers: Record<string, OldAnswer>;
  relationships: any[];
  tags: string[];
  images?: Array<{ id: string; data: string; caption?: string }>;
  createdAt: Date;
  updatedAt: Date;
  completionPercentage: number;
  metadata?: {
    usageCount?: number;
    lastUsed?: Date;
  };
}

interface OldProjectSettings {
  useRichText: boolean;
}

interface OldProject {
  id: string;
  name: string;
  description: string;
  genre?: string;
  status?: string;
  isArchived?: boolean;
  coverImage?: string;
  elements: OldWorldElement[];
  templates: any[];
  settings?: OldProjectSettings;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Convert old string[] options to new SelectOption[] format
 */
export function convertOptionsToSelectOptions(options: string[]): SelectOption[] {
  return options.map(opt => ({
    value: opt,
    label: opt
  }));
}

/**
 * Convert new SelectOption[] back to string[] for backward compatibility
 */
export function convertSelectOptionsToStrings(options: SelectOption[]): string[] {
  return options.map(opt => opt.value);
}

/**
 * Convert old answer format to new format
 */
export function convertOldAnswersToNew(
  oldAnswers: OldAnswer[] | Record<string, OldAnswer>
): Record<string, NewAnswer> {
  // * Handle both array and object formats
  if (Array.isArray(oldAnswers)) {
    const newAnswers: Record<string, NewAnswer> = {};
    oldAnswers.forEach(answer => {
      newAnswers[answer.questionId] = {
        value: answer.value,
        updatedAt: answer.lastUpdated,
        history: []
      };
    });
    return newAnswers;
  } else {
    // * Already in object format, just update field names
    const newAnswers: Record<string, NewAnswer> = {};
    Object.entries(oldAnswers).forEach(([questionId, answer]) => {
      newAnswers[questionId] = {
        value: answer.value,
        updatedAt: answer.lastUpdated,
        history: []
      };
    });
    return newAnswers;
  }
}

/**
 * Convert old question format to new format
 */
export function convertOldQuestionToNew(oldQuestion: OldQuestion): NewQuestion {
  // * Convert validation structure
  let validation: QuestionValidation | undefined;
  if (oldQuestion.validation) {
    validation = {
      min: oldQuestion.validation.min,
      max: oldQuestion.validation.max,
      minLength: oldQuestion.validation.minLength,
      maxLength: oldQuestion.validation.maxLength,
      pattern: oldQuestion.validation.pattern,
      message: oldQuestion.validation.customMessage
    };
  }

  // * Convert dependsOn field name
  let dependsOn = oldQuestion.dependsOn;
  if (dependsOn && 'value' in dependsOn) {
    dependsOn = {
      questionId: dependsOn.questionId,
      value: dependsOn.value
    };
  }

  return {
    id: oldQuestion.id,
    text: oldQuestion.text,
    type: oldQuestion.type as any, // Trust that types match
    category: oldQuestion.category,
    subcategory: oldQuestion.subcategory,
    required: oldQuestion.required,
    placeholder: oldQuestion.placeholder,
    helpText: oldQuestion.helpText,
    defaultValue: oldQuestion.defaultValue,
    inputSize: oldQuestion.inputSize,
    options: oldQuestion.options 
      ? convertOptionsToSelectOptions(oldQuestion.options)
      : undefined,
    dependsOn: dependsOn,
    validation: validation
  };
}

/**
 * Convert old world element to new format
 */
export function convertOldElementToNew(oldElement: OldWorldElement): NewWorldElement {
  // * Handle custom category
  const isCustom = oldElement.category === 'custom';
  
  return {
    id: oldElement.id,
    name: oldElement.name,
    category: isCustom ? undefined : oldElement.category as any,
    customTypeId: isCustom ? 'legacy-custom' : undefined, // Placeholder for legacy custom elements
    description: oldElement.description || undefined,
    questions: oldElement.questions.map(convertOldQuestionToNew),
    answers: convertOldAnswersToNew(oldElement.answers),
    completionPercentage: oldElement.completionPercentage,
    createdAt: oldElement.createdAt,
    updatedAt: oldElement.updatedAt,
    tags: oldElement.tags,
    relationships: oldElement.relationships,
    metadata: {
      usageCount: oldElement.metadata?.usageCount,
      lastUsed: oldElement.metadata?.lastUsed,
      // Note: Images removed from MVP - store first image URL if any
      imageUrl: oldElement.images?.[0]?.data ? 
        `data:image/png;base64,${oldElement.images[0].data}` : undefined
    }
  };
}

/**
 * Convert old project to new format
 */
export function convertOldProjectToNew(oldProject: OldProject): NewProject {
  return {
    id: oldProject.id,
    name: oldProject.name,
    description: oldProject.description,
    genre: oldProject.genre,
    status: oldProject.status,
    isArchived: oldProject.isArchived,
    coverImage: oldProject.coverImage,
    elements: oldProject.elements.map(convertOldElementToNew),
    customTypes: [], // Initialize empty custom types
    templates: oldProject.templates,
    createdAt: oldProject.createdAt,
    updatedAt: oldProject.updatedAt,
    metadata: {
      settings: oldProject.settings ? {
        useRichText: oldProject.settings.useRichText
      } : undefined
    }
  };
}

/**
 * Validate migration results
 */
export function validateMigration(oldData: any, newData: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // * Basic validation - ensure critical data is preserved
  if (oldData.id !== newData.id) {
    errors.push(`ID mismatch: ${oldData.id} !== ${newData.id}`);
  }

  if (oldData.name !== newData.name) {
    errors.push(`Name mismatch: ${oldData.name} !== ${newData.name}`);
  }

  // * For projects, check element count
  if (oldData.elements && newData.elements) {
    if (oldData.elements.length !== newData.elements.length) {
      errors.push(`Element count mismatch: ${oldData.elements.length} !== ${newData.elements.length}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Main migration function for full data migration
 */
export async function migrateAllData(
  oldProjects: OldProject[],
  options: {
    validateEach?: boolean;
    onProgress?: (current: number, total: number) => void;
  } = {}
): Promise<{
  projects: NewProject[];
  errors: Array<{ projectId: string; errors: string[] }>;
}> {
  const migratedProjects: NewProject[] = [];
  const migrationErrors: Array<{ projectId: string; errors: string[] }> = [];

  for (let i = 0; i < oldProjects.length; i++) {
    const oldProject = oldProjects[i];
    
    try {
      const newProject = convertOldProjectToNew(oldProject);
      
      if (options.validateEach) {
        const validation = validateMigration(oldProject, newProject);
        if (!validation.isValid) {
          migrationErrors.push({
            projectId: oldProject.id,
            errors: validation.errors
          });
        }
      }
      
      migratedProjects.push(newProject);
    } catch (error) {
      migrationErrors.push({
        projectId: oldProject.id,
        errors: [`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    }
    
    if (options.onProgress) {
      options.onProgress(i + 1, oldProjects.length);
    }
  }

  return {
    projects: migratedProjects,
    errors: migrationErrors
  };
}

/**
 * Create a legacy custom element type for migrated custom elements
 */
export function createLegacyCustomType() {
  return {
    id: 'legacy-custom',
    name: 'Custom Element',
    singularName: 'Custom Element',
    pluralName: 'Custom Elements',
    icon: '📋',
    description: 'Legacy custom element type for migrated elements',
    baseQuestions: [],
    createdBy: 'migration',
    createdAt: new Date(),
    updatedAt: new Date(),
    isShared: true,
    metadata: {
      isArchived: false
    }
  };
}
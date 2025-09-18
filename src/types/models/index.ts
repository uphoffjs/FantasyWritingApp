// * Export all model types from a central location
// * Using explicit exports for better tree shaking

// * Project types
export type { 
  Project, 
  ProjectSettings,
  ProjectMetadata,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectStatistics 
} from './Project';

// World Element types
export type { 
  WorldElement,
  ElementMetadata,
  CreateElementInput,
  UpdateElementInput,
  ElementFilter
} from './WorldElement';
export { 
  validateElementInput,
  hasStandardCategory,
  hasCustomType 
} from './WorldElement';

// Custom Element Type types
export type { 
  CustomElementType,
  CustomTypeMetadata,
  CreateCustomTypeInput,
  UpdateCustomTypeInput
} from './CustomElementType';
export { 
  isCustomElementType,
  usesCustomType 
} from './CustomElementType';

// Element Category types
export type { ElementCategory } from './ElementCategory';
export { 
  ELEMENT_CATEGORIES,
  ELEMENT_CATEGORY_LABELS,
  ELEMENT_CATEGORY_ICONS
} from './ElementCategory';

// * Question types
export type { 
  Question,
  QuestionType, 
  SelectOption,
  QuestionCategory,
  QuestionValidation
} from './Question';
export { DEFAULT_QUESTION_CATEGORIES } from './Question';

// * Answer types
export type { 
  Answer,
  AnswerHistory,
  AnswerUpdate,
  BulkAnswerUpdate
} from './Answer';
export { 
  isTextAnswer,
  isNumberAnswer,
  isBooleanAnswer,
  isDateAnswer,
  isMultiSelectAnswer
} from './Answer';

// * Relationship types
export type { 
  Relationship,
  RelationshipType,
  RelationshipMetadata,
  CreateRelationshipInput
} from './Relationship';
export { 
  BIDIRECTIONAL_RELATIONSHIPS,
  RELATIONSHIP_TYPE_LABELS,
  getInverseRelationship
} from './Relationship';

// TODO: * Template types
export type { 
  QuestionnaireTemplate,
  TemplateMetadata,
  CreateTemplateInput,
  UpdateTemplateInput,
  TemplateFilter
} from './Template';
export { DEFAULT_TEMPLATE_IDS } from './Template';

// TODO: Re-export DEFAULT_TEMPLATES from worldbuilding.ts for compatibility
export { DEFAULT_TEMPLATES } from '../worldbuilding';
import { Project, WorldElement, ElementCategory } from '../../../src/types/worldbuilding';

export const mockProject: Project = {
  id: 'test-project-1',
  name: 'Test Fantasy World',
  description: 'A test project for component testing',
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
  elements: [],
  theme: 'fantasy',
  tags: ['test', 'fantasy'],
  customTemplates: [],
  settings: {
    autoSave: true,
    autoSaveInterval: 5
  }
};

export const mockElement: WorldElement = {
  id: 'test-element-1',
  projectId: 'test-project-1',
  name: 'Test Character',
  category: 'Character' as ElementCategory,
  description: 'A test character for component testing',
  tags: ['hero', 'test'],
  answers: {
    'name': 'Test Character',
    'age': '25',
    'occupation': 'Adventurer'
  },
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
  completion: 75,
  images: [],
  customFields: {}
};

export const mockElements: WorldElement[] = [
  mockElement,
  {
    ...mockElement,
    id: 'test-element-2',
    name: 'Test Location',
    category: 'Location' as ElementCategory,
    description: 'A test location',
    tags: ['city', 'test'],
    completion: 50
  },
  {
    ...mockElement,
    id: 'test-element-3',
    name: 'Test Magic System',
    category: 'Magic/Power System' as ElementCategory,
    description: 'A test magic system',
    tags: ['magic', 'test'],
    completion: 90
  }
];

export const mockCategories = [
  'Character',
  'Location',
  'Magic/Power System',
  'Culture/Society',
  'Creature/Species',
  'Organization',
  'Religion/Belief System',
  'Technology',
  'Historical Event',
  'Language'
] as ElementCategory[];

export const mockRelationship = {
  id: 'test-relationship-1',
  fromId: 'test-element-1',
  toId: 'test-element-2',
  type: 'lives in',
  description: 'Character lives in this location',
  bidirectional: false
};

export const mockTemplate = {
  id: 'test-template-1',
  name: 'Basic Character Template',
  category: 'Character' as ElementCategory,
  questions: [
    {
      id: 'q1',
      text: 'What is the character\'s name?',
      type: 'text' as const,
      required: true,
      group: 'Basic Info'
    },
    {
      id: 'q2',
      text: 'How old is the character?',
      type: 'number' as const,
      required: false,
      group: 'Basic Info'
    },
    {
      id: 'q3',
      text: 'What is their occupation?',
      type: 'text' as const,
      required: false,
      group: 'Background'
    }
  ]
};
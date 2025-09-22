/**
 * @fileoverview Test Data Factory Functions
 * Provides consistent test data generation for Cypress tests
 *
 * Purpose:
 * - Generate consistent test data with sensible defaults
 * - Allow easy customization via overrides
 * - Support relationships between data entities
 * - Ensure unique IDs and timestamps for test isolation
 */

// * Base factory utilities
const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const generateTimestamp = (daysAgo: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

// * Project factory
export interface ProjectFactoryOptions {
  id?: string;
  name?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  settings?: any;
}

export const projectFactory = (overrides: ProjectFactoryOptions = {}): any => ({
  id: overrides.id || generateId('project'),
  name: overrides.name || `Test Project ${Date.now()}`,
  description: overrides.description || 'A test project for component testing',
  createdAt: overrides.createdAt || generateTimestamp(7),
  updatedAt: overrides.updatedAt || generateTimestamp(0),
  isActive: overrides.isActive !== undefined ? overrides.isActive : true,
  settings: overrides.settings || {
    theme: 'dark',
    autoSave: true,
    collaborators: [],
  },
  elements: [],
  relationships: [],
  notes: [],
  timelines: [],
});

// * Element factory
export interface ElementFactoryOptions {
  id?: string;
  projectId?: string;
  name?: string;
  category?: string;
  type?: string;
  description?: string;
  answers?: Record<string, any>;
  completionPercentage?: number;
  relationships?: any[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  imageUrl?: string;
}

export const elementFactory = (overrides: ElementFactoryOptions = {}): any => {
  const category = overrides.category || 'Characters';
  const type = overrides.type || 'character';

  return {
    id: overrides.id || generateId('element'),
    projectId: overrides.projectId || generateId('project'),
    name: overrides.name || `Test ${category.slice(0, -1)} ${Date.now()}`,
    category,
    type,
    description: overrides.description || `A test ${type} element for testing`,
    answers: overrides.answers || {},
    completionPercentage: overrides.completionPercentage !== undefined ? overrides.completionPercentage : 0,
    relationships: overrides.relationships || [],
    tags: overrides.tags || ['test', type],
    createdAt: overrides.createdAt || generateTimestamp(3),
    updatedAt: overrides.updatedAt || generateTimestamp(0),
    imageUrl: overrides.imageUrl || null,
    notes: [],
    history: [],
  };
};

// * Specialized element factories
export const characterFactory = (overrides: Partial<ElementFactoryOptions> = {}) =>
  elementFactory({
    category: 'Characters',
    type: 'character',
    name: overrides.name || `Character ${Date.now()}`,
    answers: {
      background: 'A mysterious past',
      motivation: 'Seeking adventure',
      personality: 'Brave and curious',
      appearance: 'Tall and striking',
      ...overrides.answers,
    },
    ...overrides,
  });

export const locationFactory = (overrides: Partial<ElementFactoryOptions> = {}) =>
  elementFactory({
    category: 'Locations',
    type: 'location',
    name: overrides.name || `Location ${Date.now()}`,
    answers: {
      description: 'A mystical place',
      significance: 'Central to the story',
      inhabitants: 'Various creatures',
      climate: 'Temperate',
      ...overrides.answers,
    },
    ...overrides,
  });

export const magicSystemFactory = (overrides: Partial<ElementFactoryOptions> = {}) =>
  elementFactory({
    category: 'Magic Systems',
    type: 'magic_system',
    name: overrides.name || `Magic System ${Date.now()}`,
    answers: {
      source: 'Natural energy',
      limitations: 'Requires focus',
      users: 'Trained mages',
      costs: 'Physical exhaustion',
      ...overrides.answers,
    },
    ...overrides,
  });

// * Relationship factory
export interface RelationshipFactoryOptions {
  id?: string;
  projectId?: string;
  sourceId?: string;
  targetId?: string;
  type?: string;
  description?: string;
  strength?: number;
  bidirectional?: boolean;
  metadata?: any;
  createdAt?: string;
  updatedAt?: string;
}

export const relationshipFactory = (overrides: RelationshipFactoryOptions = {}): any => ({
  id: overrides.id || generateId('relationship'),
  projectId: overrides.projectId || generateId('project'),
  sourceId: overrides.sourceId || generateId('element'),
  targetId: overrides.targetId || generateId('element'),
  type: overrides.type || 'related_to',
  description: overrides.description || 'A test relationship',
  strength: overrides.strength !== undefined ? overrides.strength : 5,
  bidirectional: overrides.bidirectional !== undefined ? overrides.bidirectional : false,
  metadata: overrides.metadata || {},
  createdAt: overrides.createdAt || generateTimestamp(1),
  updatedAt: overrides.updatedAt || generateTimestamp(0),
});

// * User factory
export interface UserFactoryOptions {
  id?: string;
  email?: string;
  name?: string;
  role?: 'user' | 'admin' | 'editor';
  avatar?: string;
  preferences?: any;
  projects?: string[];
  createdAt?: string;
  lastLogin?: string;
}

export const userFactory = (overrides: UserFactoryOptions = {}): any => ({
  id: overrides.id || generateId('user'),
  email: overrides.email || `test_${Date.now()}@example.com`,
  name: overrides.name || `Test User ${Date.now()}`,
  role: overrides.role || 'user',
  avatar: overrides.avatar || null,
  preferences: overrides.preferences || {
    theme: 'dark',
    notifications: true,
    autoSave: true,
  },
  projects: overrides.projects || [],
  createdAt: overrides.createdAt || generateTimestamp(30),
  lastLogin: overrides.lastLogin || generateTimestamp(0),
});

// * Scene/Chapter factories
export interface SceneFactoryOptions {
  id?: string;
  projectId?: string;
  chapterId?: string;
  title?: string;
  content?: string;
  order?: number;
  wordCount?: number;
  status?: 'draft' | 'review' | 'final';
  characters?: string[];
  locations?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export const sceneFactory = (overrides: SceneFactoryOptions = {}): any => ({
  id: overrides.id || generateId('scene'),
  projectId: overrides.projectId || generateId('project'),
  chapterId: overrides.chapterId || generateId('chapter'),
  title: overrides.title || `Scene ${Date.now()}`,
  content: overrides.content || 'Scene content goes here...',
  order: overrides.order !== undefined ? overrides.order : 1,
  wordCount: overrides.wordCount || 500,
  status: overrides.status || 'draft',
  characters: overrides.characters || [],
  locations: overrides.locations || [],
  createdAt: overrides.createdAt || generateTimestamp(2),
  updatedAt: overrides.updatedAt || generateTimestamp(0),
});

export const chapterFactory = (overrides: Partial<SceneFactoryOptions> = {}): any => ({
  id: overrides.id || generateId('chapter'),
  projectId: overrides.projectId || generateId('project'),
  title: overrides.title || `Chapter ${Date.now()}`,
  summary: 'Chapter summary here',
  scenes: [],
  order: overrides.order !== undefined ? overrides.order : 1,
  wordCount: overrides.wordCount || 2500,
  status: overrides.status || 'draft',
  createdAt: overrides.createdAt || generateTimestamp(5),
  updatedAt: overrides.updatedAt || generateTimestamp(0),
});

// * Complex data generators
export const generateProjectWithElements = (
  projectOverrides: ProjectFactoryOptions = {},
  elementCount: number = 5
): { project: any; elements: any[] } => {
  const project = projectFactory(projectOverrides);
  const elements = Array.from({ length: elementCount }, (_, index) => {
    const types = ['character', 'location', 'magic_system'];
    const type = types[index % types.length];

    switch (type) {
      case 'character':
        return characterFactory({ projectId: project.id });
      case 'location':
        return locationFactory({ projectId: project.id });
      case 'magic_system':
        return magicSystemFactory({ projectId: project.id });
      default:
        return elementFactory({ projectId: project.id });
    }
  });

  project.elements = elements.map(e => e.id);

  return { project, elements };
};

export const generateCompleteProject = (name: string = 'Complete Test Project'): any => {
  const { project, elements } = generateProjectWithElements({ name }, 10);

  // * Create relationships between elements
  const relationships = [];
  for (let i = 0; i < 5; i++) {
    relationships.push(
      relationshipFactory({
        projectId: project.id,
        sourceId: elements[i].id,
        targetId: elements[i + 1].id,
        type: 'connected_to',
        description: `Element ${i} connects to element ${i + 1}`,
      })
    );
  }

  // * Create scenes and chapters
  const chapters = Array.from({ length: 3 }, (_item, chapterIndex) => {
    const chapter = chapterFactory({
      projectId: project.id,
      title: `Chapter ${chapterIndex + 1}`,
      order: chapterIndex + 1,
    });

    const scenes = Array.from({ length: 3 }, (_sceneItem, sceneIndex) => {
      return sceneFactory({
        projectId: project.id,
        chapterId: chapter.id,
        title: `Scene ${sceneIndex + 1}`,
        order: sceneIndex + 1,
        characters: [elements[0].id, elements[1].id],
        locations: [elements[5].id],
      });
    });

    chapter.scenes = scenes.map(s => s.id);
    return { chapter, scenes };
  });

  return {
    project,
    elements,
    relationships,
    chapters: chapters.map(c => c.chapter),
    scenes: chapters.flatMap(c => c.scenes),
  };
};

// * Test data sets for different scenarios
export const testDataSets = {
  minimal: () => ({
    project: projectFactory({ name: 'Minimal Project' }),
    user: userFactory({ role: 'user' }),
  }),

  standard: () => {
    const { project, elements } = generateProjectWithElements(
      { name: 'Standard Project' },
      5
    );
    return {
      project,
      elements,
      user: userFactory({ role: 'user', projects: [project.id] }),
    };
  },

  complete: () => {
    const data = generateCompleteProject('Full Test Suite');
    return {
      ...data,
      user: userFactory({ role: 'admin', projects: [data.project.id] }),
    };
  },

  multiProject: () => {
    const projects = Array.from({ length: 3 }, (_, i) =>
      projectFactory({ name: `Project ${i + 1}` })
    );

    const allElements = projects.flatMap(project => {
      const { elements } = generateProjectWithElements({ id: project.id }, 3);
      return elements;
    });

    return {
      projects,
      elements: allElements,
      user: userFactory({
        role: 'admin',
        projects: projects.map(p => p.id),
      }),
    };
  },
};

// * Export all factories
export default {
  project: projectFactory,
  element: elementFactory,
  character: characterFactory,
  location: locationFactory,
  magicSystem: magicSystemFactory,
  relationship: relationshipFactory,
  user: userFactory,
  scene: sceneFactory,
  chapter: chapterFactory,
  generateProjectWithElements,
  generateCompleteProject,
  testDataSets,
};
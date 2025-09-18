// * Mock test data for Cypress tests in Writing App
// * Adapted from fantasy-element-builder for writing domain

export interface Story {
  id: string;
  title: string;
  description: string;
  genre?: string;
  status: 'draft' | 'in-progress' | 'completed' | 'published';
  characters: Character[];
  scenes: Scene[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Character {
  id: string;
  name: string;
  type: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  description: string;
  profile: Record<string, any>;
  relationships: Relationship[];
  tags: string[];
  images: string[];
  storyId: string;
  createdAt: Date;
  updatedAt: Date;
  developmentPercentage: number;
}

export interface Scene {
  id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  chapterNumber?: number;
  characters: string[];
  storyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Relationship {
  id: string;
  type: string;
  targetCharacterId: string;
  description: string;
}

export const mockStory: Story = {
  id: 'story-1',
  title: 'Test Epic',
  description: 'A test story for testing',
  genre: 'fantasy',
  status: 'draft',
  characters: [],
  scenes: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

export const mockCharacter: Character = {
  id: 'character-1',
  name: 'Test Hero',
  type: 'protagonist',
  description: 'A test character',
  profile: {
    fullName: 'Test Hero of the Realm',
    age: 25,
    occupation: 'Adventurer',
    homeland: 'Test Kingdom'
  },
  relationships: [],
  tags: ['test', 'hero', 'protagonist'],
  images: [],
  storyId: 'story-1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  developmentPercentage: 0
};

export const mockScene: Scene = {
  id: 'scene-1',
  title: 'The Beginning',
  description: 'Opening scene of the story',
  content: 'It was a dark and stormy night...',
  order: 1,
  chapterNumber: 1,
  characters: ['character-1'],
  storyId: 'story-1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

export const mockRelationship: Relationship = {
  id: 'rel-1',
  type: 'best friend',
  targetCharacterId: 'character-2',
  description: 'Loyal companion since childhood'
};

export const mockStories: Story[] = [
  mockStory,
  {
    id: 'story-2',
    title: 'Fantasy Epic',
    description: 'A grand fantasy adventure',
    genre: 'fantasy',
    status: 'in-progress',
    characters: [mockCharacter],
    scenes: [mockScene],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: 'story-3',
    title: 'Sci-Fi Adventure',
    description: 'A space-faring adventure',
    genre: 'science-fiction',
    status: 'draft',
    characters: [],
    scenes: [],
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  }
];

export const mockCharacters: Character[] = [
  mockCharacter,
  {
    ...mockCharacter,
    id: 'character-2',
    name: 'Test Villain',
    type: 'antagonist',
    description: 'A test antagonist',
    profile: {
      fullName: 'Dark Lord Test',
      age: 1000,
      occupation: 'Evil Overlord',
      homeland: 'Dark Realm'
    },
    tags: ['test', 'villain', 'antagonist']
  },
  {
    ...mockCharacter,
    id: 'character-3',
    name: 'Test Companion',
    type: 'supporting',
    description: 'A test supporting character',
    profile: {
      fullName: 'Faithful Test Companion',
      age: 30,
      occupation: 'Guide',
      homeland: 'Forest Village'
    },
    tags: ['test', 'companion', 'supporting']
  }
];

export const mockScenes: Scene[] = [
  mockScene,
  {
    ...mockScene,
    id: 'scene-2',
    title: 'The Journey Begins',
    description: 'Heroes set out on their quest',
    content: 'The hero took their first steps...',
    order: 2,
    chapterNumber: 1
  },
  {
    ...mockScene,
    id: 'scene-3',
    title: 'The Confrontation',
    description: 'Hero meets villain',
    content: 'Face to face with their greatest enemy...',
    order: 3,
    chapterNumber: 2
  }
];

export const createMockCharacter = (overrides?: Partial<Character>): Character => ({
  ...mockCharacter,
  id: `character-${Date.now()}`,
  ...overrides
});

export const createMockStory = (overrides?: Partial<Story>): Story => ({
  ...mockStory,
  id: `story-${Date.now()}`,
  ...overrides
});

export const createMockScene = (overrides?: Partial<Scene>): Scene => ({
  ...mockScene,
  id: `scene-${Date.now()}`,
  ...overrides
});

export const createMockRelationship = (overrides?: Partial<Relationship>): Relationship => ({
  id: `rel-${Date.now()}`,
  type: 'acquaintance',
  targetCharacterId: 'character-unknown',
  description: 'Test relationship',
  ...overrides
});

// TODO: * Character development templates
export const characterQuestions = {
  basic: [
    { id: 'name', label: 'Full Name', type: 'text', required: true },
    { id: 'age', label: 'Age', type: 'number', required: false },
    { id: 'occupation', label: 'Occupation', type: 'text', required: false },
    { id: 'homeland', label: 'Homeland', type: 'text', required: false }
  ],
  appearance: [
    { id: 'height', label: 'Height', type: 'text', required: false },
    { id: 'build', label: 'Build', type: 'select', options: ['Slim', 'Average', 'Athletic', 'Heavy'], required: false },
    { id: 'hair', label: 'Hair', type: 'text', required: false },
    { id: 'eyes', label: 'Eyes', type: 'text', required: false }
  ],
  personality: [
    { id: 'traits', label: 'Personality Traits', type: 'textarea', required: false },
    { id: 'strengths', label: 'Strengths', type: 'textarea', required: false },
    { id: 'weaknesses', label: 'Weaknesses', type: 'textarea', required: false },
    { id: 'fears', label: 'Fears', type: 'textarea', required: false }
  ],
  motivation: [
    { id: 'primaryGoal', label: 'Primary Goal', type: 'textarea', required: false },
    { id: 'coreBelief', label: 'Core Belief', type: 'textarea', required: false },
    { id: 'internalConflict', label: 'Internal Conflict', type: 'textarea', required: false }
  ],
  backstory: [
    { id: 'backstory', label: 'Backstory', type: 'textarea', required: false },
    { id: 'childhood', label: 'Childhood', type: 'textarea', required: false },
    { id: 'formativeEvent', label: 'Formative Event', type: 'textarea', required: false }
  ]
};

// TODO: * Story outline templates
export const storyStructure = {
  threeAct: {
    act1: ['Hook', 'Inciting Incident', 'Plot Point 1'],
    act2: ['Rising Action', 'Midpoint', 'Plot Point 2'],
    act3: ['Climax', 'Falling Action', 'Resolution']
  },
  heroJourney: [
    'Ordinary World',
    'Call to Adventure',
    'Refusal of the Call',
    'Meeting the Mentor',
    'Crossing the Threshold',
    'Tests and Trials',
    'Revelation',
    'Transformation',
    'Atonement',
    'Return'
  ]
};

export const genreOptions = [
  'Fantasy',
  'Science Fiction',
  'Mystery',
  'Romance',
  'Thriller',
  'Historical Fiction',
  'Literary Fiction',
  'Young Adult',
  'Middle Grade',
  'Horror',
  'Adventure',
  'Contemporary',
  'Paranormal',
  'Dystopian',
  'Urban Fantasy'
];

// Mock Project for worldbuilding tests
export interface Project {
  id: string;
  name: string;
  description: string;
  genre?: string;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const mockProject: Project = {
  id: 'project-1',
  name: 'Fantasy World',
  description: 'A magical realm filled with dragons and wizards',
  genre: 'Fantasy',
  isArchived: false,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString()
};

export const characterTypes = [
  'protagonist',
  'antagonist',
  'supporting',
  'minor'
];

export const relationshipTypes = [
  'family member',
  'best friend',
  'friend',
  'romantic interest',
  'mentor',
  'rival',
  'enemy',
  'ally',
  'colleague',
  'neighbor',
  'acquaintance'
];
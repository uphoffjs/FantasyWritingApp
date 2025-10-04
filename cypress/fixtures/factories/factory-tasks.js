/**
 * Factory task handlers for Cypress
 * JavaScript file that can be imported in cypress.config.ts
 * Provides test data creation and reset functionality
 */

// * Counter for unique IDs
let idCounter = 1;

// * Reset function to clear counters
function resetCounters() {
  idCounter = 1;
  console.log('Factory counters reset');
}

// * Create test data based on type
function createTestData(type, options = {}) {
  const baseId = idCounter++;

  const testDataGenerators = {
    // Story-related test data
    'story-creation': () => ({
      story: {
        id: `story-${baseId}`,
        title: `Test Story ${baseId}`,
        genre: 'fantasy',
        status: 'draft',
        chapters: [],
        characters: []
      }
    }),

    'story-editing': () => ({
      story: {
        id: `story-${baseId}`,
        title: `Editable Story ${baseId}`,
        genre: 'fantasy',
        status: 'in-progress',
        chapters: Array.from({ length: 3 }, (_, i) => ({
          id: `chapter-${baseId}-${i}`,
          title: `Chapter ${i + 1}`,
          content: `Content for chapter ${i + 1}`
        })),
        characters: [`char-${baseId}-1`, `char-${baseId}-2`]
      },
      characters: Array.from({ length: 2 }, (_, i) => ({
        id: `char-${baseId}-${i + 1}`,
        name: `Character ${i + 1}`,
        role: i === 0 ? 'protagonist' : 'antagonist'
      }))
    }),

    // Character-related test data
    'character-creation': () => ({
      character: {
        id: `char-${baseId}`,
        name: `Test Character ${baseId}`,
        role: 'protagonist',
        description: 'A test character'
      }
    }),

    'character-profile': () => ({
      character: {
        id: `char-${baseId}`,
        name: `Complete Character ${baseId}`,
        role: 'protagonist',
        description: 'A fully developed character',
        age: 25,
        appearance: {
          height: 'tall',
          build: 'athletic',
          hair: 'dark',
          eyes: 'blue'
        },
        personality: ['brave', 'clever', 'stubborn'],
        backstory: 'A detailed backstory...'
      },
      stories: Array.from({ length: 2 }, (_, i) => ({
        id: `story-${baseId}-${i}`,
        title: `Story ${i + 1}`,
        characterRole: 'main'
      }))
    }),

    // Element-related test data
    'element-browser': () => ({
      project: {
        id: `project-${baseId}`,
        name: `Test Project ${baseId}`,
        elements: Array.from({ length: 20 }, (_, i) => ({
          id: `element-${baseId}-${i}`,
          name: `Element ${i + 1}`,
          category: ['character', 'location', 'magic-power'][i % 3],
          description: `Description for element ${i + 1}`
        }))
      },
      filters: ['character', 'location', 'item-object']
    }),

    'element-creation': () => ({
      project: {
        id: `project-${baseId}`,
        name: `New Project ${baseId}`,
        elements: []
      },
      categories: ['character', 'location', 'magic-power']
    }),

    // Empty states
    'empty-states': () => ({
      projects: [],
      stories: [],
      characters: [],
      elements: []
    }),

    // Default fallback
    'default': () => ({
      project: {
        id: `project-${baseId}`,
        name: `Default Project ${baseId}`
      },
      data: options
    })
  };

  const generator = testDataGenerators[type] || testDataGenerators.default;
  return generator();
}

// * Create test scenarios
function createScenario(type = 'standard') {
  const baseId = idCounter++;

  switch (type) {
    case 'minimal':
      return {
        project: {
          id: `project-${baseId}`,
          name: `Minimal Project ${baseId}`,
          elements: []
        },
        stories: [],
        characters: []
      };

    case 'standard':
      return {
        project: {
          id: `project-${baseId}`,
          name: `Standard Project ${baseId}`,
          elements: Array.from({ length: 5 }, (_, i) => ({
            id: `element-${baseId}-${i}`,
            name: `Element ${i + 1}`,
            category: ['character', 'location', 'item'][i % 3]
          }))
        },
        stories: Array.from({ length: 2 }, (_, i) => ({
          id: `story-${baseId}-${i}`,
          title: `Story ${i + 1}`,
          status: 'draft'
        })),
        characters: Array.from({ length: 3 }, (_, i) => ({
          id: `char-${baseId}-${i}`,
          name: `Character ${i + 1}`,
          role: ['protagonist', 'antagonist', 'supporting'][i]
        }))
      };

    case 'complete':
      return {
        project: {
          id: `project-${baseId}`,
          name: `Complete Project ${baseId}`,
          description: 'A fully developed project',
          elements: Array.from({ length: 20 }, (_, i) => ({
            id: `element-${baseId}-${i}`,
            name: `Element ${i + 1}`,
            category: ['character', 'location', 'magic-power', 'culture', 'creature'][i % 5],
            description: `Detailed description for element ${i + 1}`,
            tags: [`tag-${i % 3}`, `tag-${i % 5}`]
          }))
        },
        stories: Array.from({ length: 5 }, (_, i) => ({
          id: `story-${baseId}-${i}`,
          title: `Story ${i + 1}`,
          status: ['published', 'draft', 'in-progress'][i % 3],
          chapters: Array.from({ length: 10 }, (_ch, j) => ({
            id: `chapter-${baseId}-${i}-${j}`,
            title: `Chapter ${j + 1}`,
            wordCount: 2500 + (j * 100)
          }))
        })),
        characters: Array.from({ length: 10 }, (_, i) => ({
          id: `char-${baseId}-${i}`,
          name: `Character ${i + 1}`,
          role: ['protagonist', 'antagonist', 'supporting', 'minor'][i % 4],
          description: `Full character profile ${i + 1}`,
          relationships: i > 0 ? [`char-${baseId}-${i - 1}`] : []
        }))
      };

    default:
      return createScenario('standard');
  }
}

// * Seed test data
function seedData(options = {}) {
  const defaults = {
    stories: 5,
    characters: 10,
    projects: 3,
    elements: 20
  };

  const config = { ...defaults, ...options };
  const baseId = idCounter++;

  return {
    stories: Array.from({ length: config.stories }, (_, i) => ({
      id: `story-${baseId}-${i}`,
      title: `Seeded Story ${i + 1}`,
      status: 'draft'
    })),
    characters: Array.from({ length: config.characters }, (_, i) => ({
      id: `char-${baseId}-${i}`,
      name: `Seeded Character ${i + 1}`,
      role: 'supporting'
    })),
    projects: Array.from({ length: config.projects }, (_, i) => ({
      id: `project-${baseId}-${i}`,
      name: `Seeded Project ${i + 1}`
    })),
    elements: Array.from({ length: config.elements }, (_, i) => ({
      id: `element-${baseId}-${i}`,
      name: `Seeded Element ${i + 1}`,
      category: 'generic'
    }))
  };
}

// * Export factory tasks for Cypress
const factoryTasks = {
  'factory:reset': () => {
    resetCounters();
    return null;
  },

  'factory:create': (args) => {
    const { type, options } = args;
    return createTestData(type, options);
  },

  'factory:scenario': (args) => {
    const { type } = args;
    return createScenario(type);
  },

  'factory:seed': (args) => {
    return seedData(args);
  }
};

// * Export for use in cypress.config.ts
module.exports = { factoryTasks };
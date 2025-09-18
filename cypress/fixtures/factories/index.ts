/**
 * Central factory index for all test data factories
 * Provides unified access and reset functionality
 */

export { StoryFactory, type Story, type Chapter } from './story.factory';
export { CharacterFactory, type Character, type CharacterRelationship, type CharacterAppearance } from './character.factory';
export { ProjectFactory, type Project, type WorldElement, type Question } from './project.factory';

/**
 * Master factory manager for test data
 */
export class FactoryManager {
  /**
   * Reset all factory counters
   * Should be called before each test to ensure clean state
   */
  static resetAll() {
    // * Import dynamically to avoid circular dependencies
    const { StoryFactory } = require('./story.factory');
    const { CharacterFactory } = require('./character.factory');
    const { ProjectFactory } = require('./project.factory');
    
    StoryFactory.reset();
    CharacterFactory.reset();
    ProjectFactory.reset();
  }

  /**
   * Create a complete test scenario with related data
   */
  static createScenario(type: 'minimal' | 'standard' | 'complete' = 'standard') {
    const { StoryFactory } = require('./story.factory');
    const { CharacterFactory } = require('./character.factory');
    const { ProjectFactory } = require('./project.factory');
    
    switch (type) {
      case 'minimal':
        return {
          project: ProjectFactory.createMinimal(),
          stories: [],
          characters: []
        };
      
      case 'standard':
        const characters = CharacterFactory.createCast().slice(0, 3);
        const stories = StoryFactory.createMany(2, {
          characters: characters.map(c => c.id)
        });
        const project = ProjectFactory.createWithElements(5);
        
        return {
          project,
          stories,
          characters
        };
      
      case 'complete':
        const fullCast = CharacterFactory.createCast();
        const completeStories = [
          StoryFactory.createComplete(),
          StoryFactory.createPublished(),
          StoryFactory.createDraft()
        ];
        const completeProject = ProjectFactory.createComplete();
        
        return {
          project: completeProject,
          stories: completeStories,
          characters: fullCast
        };
      
      default:
        return this.createScenario('standard');
    }
  }

  /**
   * Create mock data for specific test categories
   */
  static createForTest(testType: string): any {
    const { StoryFactory } = require('./story.factory');
    const { CharacterFactory } = require('./character.factory');
    const { ProjectFactory } = require('./project.factory');
    
    const testData: Record<string, () => any> = {
      // Story-related tests
      'story-creation': () => ({
        story: StoryFactory.createDraft(),
        characters: []
      }),
      'story-editing': () => ({
        story: StoryFactory.createWithChapters(3),
        characters: CharacterFactory.createMany(2)
      }),
      'story-publishing': () => ({
        story: StoryFactory.createComplete(),
        characters: CharacterFactory.createCast()
      }),
      
      // Character-related tests
      'character-creation': () => ({
        character: CharacterFactory.create(),
        story: StoryFactory.createDraft()
      }),
      'character-profile': () => ({
        character: CharacterFactory.createComplete(),
        stories: StoryFactory.createMany(2)
      }),
      'character-relationships': () => ({
        characters: CharacterFactory.createCast(),
        story: StoryFactory.createWithChapters(5)
      }),
      
      // Project-related tests
      'project-dashboard': () => ({
        projects: ProjectFactory.createMany(5),
        recentElements: ProjectFactory.createElements(10)
      }),
      'element-browser': () => ({
        project: ProjectFactory.createWithElements(20),
        filters: ['character', 'location', 'item-object']
      }),
      'element-creation': () => ({
        project: ProjectFactory.create(),
        categories: ['character', 'location', 'magic-power']
      }),
      
      // * Search tests
      'global-search': () => ({
        projects: ProjectFactory.createMany(3),
        stories: StoryFactory.createMany(5),
        characters: CharacterFactory.createMany(10),
        elements: ProjectFactory.createElements(15)
      }),
      
      // * Empty states
      'empty-states': () => ({
        projects: [],
        stories: [],
        characters: [],
        elements: []
      })
    };
    
    const creator = testData[testType];
    return creator ? creator() : this.createScenario('standard');
  }

  /**
   * Seed data for development/testing
   */
  static seed(options: {
    stories?: number;
    characters?: number;
    projects?: number;
    elements?: number;
  } = {}) {
    const { StoryFactory } = require('./story.factory');
    const { CharacterFactory } = require('./character.factory');
    const { ProjectFactory } = require('./project.factory');
    
    const defaults = {
      stories: 5,
      characters: 10,
      projects: 3,
      elements: 20
    };
    
    const config = { ...defaults, ...options };
    
    return {
      stories: StoryFactory.createMany(config.stories),
      characters: CharacterFactory.createMany(config.characters),
      projects: ProjectFactory.createMany(config.projects),
      elements: ProjectFactory.createElements(config.elements)
    };
  }
}

/**
 * Cypress task handlers for factory operations
 */
export const factoryTasks = {
  'factory:reset': () => {
    FactoryManager.resetAll();
    return null;
  },
  
  'factory:create': (args: { type: string; options?: any }) => {
    return FactoryManager.createForTest(args.type);
  },
  
  'factory:scenario': (args: { type: 'minimal' | 'standard' | 'complete' }) => {
    return FactoryManager.createScenario(args.type);
  },
  
  'factory:seed': (args: { stories?: number; characters?: number; projects?: number; elements?: number }) => {
    return FactoryManager.seed(args);
  }
};

// * Default export for convenience
export default FactoryManager;
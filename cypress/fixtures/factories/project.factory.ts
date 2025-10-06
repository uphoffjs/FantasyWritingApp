/**
 * Factory for generating test Project data
 * For the fantasy element builder domain
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
// Cypress fixture factories require 'any' type for test data flexibility
export interface Project {
  id: string;
  name: string;
  description?: string;
  genre?: string;
  status: 'active' | 'completed' | 'on-hold' | 'planning' | 'revision';
  elements: WorldElement[];
  collaborators?: string[];
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface WorldElement {
  id: string;
  name: string;
  category: 'character' | 'location' | 'item-object' | 'magic-power' | 
            'event' | 'organization' | 'creature-species' | 'culture-society' | 
            'religion-belief' | 'language' | 'technology' | 'custom';
  description?: string;
  completionPercentage: number;
  questions: Question[];
  answers: Record<string, any>;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  text: string;
  category: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'boolean';
  required?: boolean;
  options?: string[];
  defaultValue?: any;
}

export class ProjectFactory {
  private static idCounter = 1;
  private static elementIdCounter = 1;
  private static questionIdCounter = 1;

  /**
   * Reset counters for test isolation
   */
  static reset() {
    this.idCounter = 1;
    this.elementIdCounter = 1;
    this.questionIdCounter = 1;
  }

  /**
   * Create a single project with optional overrides
   */
  static create(overrides?: Partial<Project>): Project {
    const id = `project-${this.idCounter++}`;
    const now = new Date();
    
    return {
      id,
      name: `Test Project ${id}`,
      description: 'A fantasy world building project',
      genre: 'fantasy',
      status: 'active',
      elements: [],
      collaborators: [],
      createdAt: now,
      updatedAt: now,
      metadata: {},
      ...overrides
    };
  }

  /**
   * Create multiple projects
   */
  static createMany(count: number, overrides?: Partial<Project>): Project[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  /**
   * Create a world element
   */
  static createElement(overrides?: Partial<WorldElement>): WorldElement {
    const id = `element-${this.elementIdCounter++}`;
    const now = new Date();
    
    return {
      id,
      name: `Element ${id}`,
      category: 'character',
      description: 'A test element for the fantasy world',
      completionPercentage: Math.floor(Math.random() * 100),
      questions: [],
      answers: {},
      tags: [],
      createdAt: now,
      updatedAt: now,
      ...overrides
    };
  }

  /**
   * Create a question
   */
  static createQuestion(overrides?: Partial<Question>): Question {
    const id = `question-${this.questionIdCounter++}`;
    
    return {
      id,
      text: 'What is their primary motivation?',
      category: 'character',
      type: 'textarea',
      required: false,
      ...overrides
    };
  }

  /**
   * Create a project with elements
   */
  static createWithElements(elementCount: number = 3, projectOverrides?: Partial<Project>): Project {
    const elements = this.createElements(elementCount);
    
    return this.create({
      elements,
      metadata: {
        elementCount: elements.length,
        totalCompletion: Math.floor(
          elements.reduce((sum, el) => sum + el.completionPercentage, 0) / elements.length
        )
      },
      ...projectOverrides
    });
  }

  /**
   * Create multiple elements with various categories
   */
  static createElements(count: number): WorldElement[] {
    const categories = [
      'character', 'location', 'item-object', 'magic-power', 
      'event', 'organization', 'creature-species'
    ] as const;
    
    return Array.from({ length: count }, (_, index) => {
      const category = categories[index % categories.length];
      const questions = this.createQuestionsForCategory(category);
      
      return this.createElement({
        name: `${this.getCategoryName(category)} ${index + 1}`,
        category,
        questions,
        answers: this.generateAnswersForQuestions(questions),
        completionPercentage: Math.min(100, 20 + Math.floor(Math.random() * 80))
      });
    });
  }

  /**
   * Create questions for a specific category
   */
  static createQuestionsForCategory(category: string): Question[] {
    const questionTemplates: Record<string, Partial<Question>[]> = {
      character: [
        { text: 'What is their name?', type: 'text' },
        { text: 'What is their role in the story?', type: 'select', options: ['Protagonist', 'Antagonist', 'Supporting', 'Minor'] },
        { text: 'What is their backstory?', type: 'textarea' },
        { text: 'What are their primary motivations?', type: 'textarea' },
        { text: 'Do they have magical abilities?', type: 'boolean' }
      ],
      location: [
        { text: 'What is the name of this location?', type: 'text' },
        { text: 'What type of location is it?', type: 'select', options: ['City', 'Village', 'Forest', 'Mountain', 'Castle', 'Other'] },
        { text: 'Describe the atmosphere', type: 'textarea' },
        { text: 'What is its significance to the story?', type: 'textarea' },
        { text: 'Is it accessible to everyone?', type: 'boolean' }
      ],
      'item-object': [
        { text: 'What is the item called?', type: 'text' },
        { text: 'What is its primary function?', type: 'textarea' },
        { text: 'Is it magical?', type: 'boolean' },
        { text: 'Who can use it?', type: 'text' },
        { text: 'Where is it found?', type: 'text' }
      ],
      'magic-power': [
        { text: 'What is this power called?', type: 'text' },
        { text: 'How does it work?', type: 'textarea' },
        { text: 'What are its limitations?', type: 'textarea' },
        { text: 'Who can use it?', type: 'text' },
        { text: 'What is its source?', type: 'text' }
      ]
    };
    
    const templates = questionTemplates[category] || [
      { text: 'What is its name?', type: 'text' },
      { text: 'Describe it', type: 'textarea' }
    ];
    
    return templates.map(template => this.createQuestion({
      ...template,
      category
    }));
  }

  /**
   * Generate answers for questions
   */
  static generateAnswersForQuestions(questions: Question[]): Record<string, any> {
    const answers: Record<string, any> = {};
    
    questions.forEach(q => {
      switch (q.type) {
        case 'text':
          answers[q.id] = `Answer for ${q.text}`;
          break;
        case 'textarea':
          answers[q.id] = `Detailed answer for ${q.text}. This would contain more elaborate information about the element.`;
          break;
        case 'boolean':
          answers[q.id] = Math.random() > 0.5;
          break;
        case 'select':
          answers[q.id] = q.options?.[0] || '';
          break;
        case 'multiselect':
          answers[q.id] = q.options?.slice(0, 2) || [];
          break;
      }
    });
    
    return answers;
  }

  /**
   * Get a friendly name for a category
   */
  private static getCategoryName(category: string): string {
    const names: Record<string, string> = {
      'character': 'Character',
      'location': 'Location',
      'item-object': 'Item',
      'magic-power': 'Magic',
      'event': 'Event',
      'organization': 'Organization',
      'creature-species': 'Creature',
      'culture-society': 'Culture',
      'religion-belief': 'Religion',
      'language': 'Language',
      'technology': 'Technology',
      'custom': 'Custom'
    };
    
    return names[category] || 'Element';
  }

  /**
   * Create a complete fantasy project
   */
  static createComplete(): Project {
    const project = this.createWithElements(10);
    
    return {
      ...project,
      name: 'The Chronicles of Aetheria',
      description: 'A comprehensive fantasy world with rich lore and detailed characters',
      genre: 'high-fantasy',
      status: 'active',
      collaborators: ['user-1', 'user-2', 'user-3'],
      coverImage: 'https://example.com/fantasy-cover.jpg',
      metadata: {
        ...project.metadata,
        worldType: 'medieval-fantasy',
        magicSystem: 'elemental',
        languages: 5,
        cultures: 8,
        timeline: '1000 years of history'
      }
    };
  }

  /**
   * Create a project by status
   */
  static createByStatus(status: Project['status']): Project {
    const statusConfigs: Record<string, Partial<Project>> = {
      'active': {
        status: 'active',
        elements: this.createElements(5),
        metadata: { lastActivity: new Date() }
      },
      'completed': {
        status: 'completed',
        elements: this.createElements(10).map(el => ({ ...el, completionPercentage: 100 })),
        metadata: { completedAt: new Date() }
      },
      'on-hold': {
        status: 'on-hold',
        elements: this.createElements(3),
        metadata: { pausedReason: 'Waiting for research' }
      },
      'planning': {
        status: 'planning',
        elements: [],
        metadata: { plannedStartDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
      },
      'revision': {
        status: 'revision',
        elements: this.createElements(8),
        metadata: { revisionRound: 2 }
      }
    };
    
    return this.create(statusConfigs[status] || { status });
  }

  /**
   * Create a minimal project (for testing empty states)
   */
  static createMinimal(): Project {
    return this.create({
      name: 'Empty Project',
      description: '',
      elements: [],
      collaborators: []
    });
  }
}
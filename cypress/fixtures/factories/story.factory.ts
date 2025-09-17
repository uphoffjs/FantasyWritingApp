/**
 * Factory for generating test Story data
 * Adapted from fantasy-element-builder's element.factory.ts
 */

export interface Story {
  id: string;
  title: string;
  content: string;
  summary?: string;
  genre: string;
  status: 'draft' | 'published' | 'archived';
  wordCount: number;
  chapters: Chapter[];
  characters: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  metadata?: Record<string, any>;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  orderIndex: number;
  wordCount: number;
  status: 'draft' | 'published';
}

export class StoryFactory {
  private static idCounter = 1;
  private static chapterIdCounter = 1;

  /**
   * Reset counters for test isolation
   */
  static reset() {
    this.idCounter = 1;
    this.chapterIdCounter = 1;
  }

  /**
   * Create a single story with optional overrides
   */
  static create(overrides?: Partial<Story>): Story {
    const id = `story-${this.idCounter++}`;
    const now = new Date();
    
    return {
      id,
      title: `Test Story ${id}`,
      content: `Once upon a time in a land far, far away...`,
      summary: `A tale of adventure and mystery`,
      genre: 'fantasy',
      status: 'draft',
      wordCount: 150,
      chapters: [],
      characters: [],
      tags: ['adventure', 'fantasy', 'test'],
      createdAt: now,
      updatedAt: now,
      authorId: 'test-user-123',
      metadata: {},
      ...overrides
    };
  }

  /**
   * Create multiple stories
   */
  static createMany(count: number, overrides?: Partial<Story>): Story[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  /**
   * Create a story with chapters
   */
  static createWithChapters(chapterCount: number = 3, storyOverrides?: Partial<Story>): Story {
    const chapters = this.createChapters(chapterCount);
    const totalWordCount = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);
    
    return this.create({
      chapters,
      wordCount: totalWordCount,
      ...storyOverrides
    });
  }

  /**
   * Create chapters for a story
   */
  static createChapters(count: number): Chapter[] {
    return Array.from({ length: count }, (_, index) => {
      const id = `chapter-${this.chapterIdCounter++}`;
      return {
        id,
        title: `Chapter ${index + 1}: ${this.getChapterTitle(index)}`,
        content: this.generateChapterContent(index),
        orderIndex: index,
        wordCount: 500 + Math.floor(Math.random() * 1000),
        status: 'draft' as const
      };
    });
  }

  /**
   * Create a complete published story with all features
   */
  static createComplete(): Story {
    const story = this.createWithChapters(5);
    
    return {
      ...story,
      status: 'published',
      characters: ['protagonist-1', 'antagonist-1', 'sidekick-1'],
      tags: ['fantasy', 'adventure', 'magic', 'epic'],
      metadata: {
        readingTime: Math.floor(story.wordCount / 200),
        language: 'en',
        copyright: '© 2024 Test Author',
        isbn: '978-0-123456-78-9'
      }
    };
  }

  /**
   * Create a draft story (minimal data)
   */
  static createDraft(): Story {
    return this.create({
      status: 'draft',
      content: '',
      summary: undefined,
      chapters: [],
      wordCount: 0,
      tags: []
    });
  }

  /**
   * Create a published story
   */
  static createPublished(): Story {
    const story = this.createWithChapters(3);
    return {
      ...story,
      status: 'published',
      metadata: {
        publishedAt: new Date(),
        featured: false
      }
    };
  }

  /**
   * Create stories by genre
   */
  static createByGenre(genre: string, count: number = 1): Story[] {
    const genreTemplates: Record<string, Partial<Story>> = {
      fantasy: {
        genre: 'fantasy',
        tags: ['magic', 'dragons', 'adventure'],
        summary: 'An epic fantasy adventure'
      },
      scifi: {
        genre: 'scifi',
        tags: ['space', 'technology', 'future'],
        summary: 'A journey through space and time'
      },
      mystery: {
        genre: 'mystery',
        tags: ['detective', 'crime', 'suspense'],
        summary: 'A thrilling mystery to solve'
      },
      romance: {
        genre: 'romance',
        tags: ['love', 'relationships', 'drama'],
        summary: 'A heartwarming love story'
      }
    };

    const template = genreTemplates[genre] || { genre };
    return this.createMany(count, template);
  }

  /**
   * Helper to generate chapter titles
   */
  private static getChapterTitle(index: number): string {
    const titles = [
      'The Beginning',
      'The Journey',
      'The Challenge',
      'The Discovery',
      'The Conflict',
      'The Resolution',
      'The Revelation',
      'The Climax',
      'The Aftermath',
      'The End'
    ];
    return titles[index % titles.length];
  }

  /**
   * Helper to generate chapter content
   */
  private static generateChapterContent(index: number): string {
    const templates = [
      'The hero embarked on their journey, unaware of the challenges ahead...',
      'As dawn broke over the mountains, a new day of adventure began...',
      'The ancient prophecy spoke of a chosen one who would restore balance...',
      'In the depths of the forest, mysteries awaited those brave enough to explore...',
      'The final battle approached, and with it, the fate of the realm...'
    ];
    
    const baseContent = templates[index % templates.length];
    const padding = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10);
    
    return `${baseContent}\n\n${padding}`;
  }

  /**
   * Create a story with specific word count
   */
  static createWithWordCount(wordCount: number): Story {
    const chapterCount = Math.max(1, Math.floor(wordCount / 1000));
    const story = this.createWithChapters(chapterCount);
    
    return {
      ...story,
      wordCount,
      metadata: {
        ...story.metadata,
        readingTime: Math.floor(wordCount / 200)
      }
    };
  }

  /**
   * Create a story with relationships (characters)
   */
  static createWithCharacters(characterIds: string[]): Story {
    return this.create({
      characters: characterIds,
      metadata: {
        characterCount: characterIds.length,
        hasProtagonist: true,
        hasAntagonist: characterIds.length > 1
      }
    });
  }
}
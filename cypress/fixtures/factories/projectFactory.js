/**
 * Project Factory
 * Generates test project data for E2E tests
 */

import { faker } from '@faker-js/faker';

class ProjectFactory {
  static genres = [
    'Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Thriller',
    'Horror', 'Historical', 'Contemporary', 'Dystopian', 'Adventure'
  ];

  static statuses = ['draft', 'active', 'completed', 'archived'];

  /**
   * Generate a single project with optional overrides
   */
  static create(overrides = {}) {
    const randomId = faker.string.alphanumeric(8);

    return {
      id: `project-${randomId}`,
      userId: `user-${faker.string.alphanumeric(8)}`,
      name: faker.company.catchPhrase(),
      description: faker.lorem.paragraph(),
      genre: faker.helpers.arrayElement(this.genres),
      status: 'active',
      visibility: 'private',
      coverImage: faker.image.url(),
      tags: faker.helpers.arrayElements([
        'epic', 'adventure', 'magic', 'war', 'romance',
        'politics', 'mythology', 'dragons', 'prophecy'
      ], 3),
      settings: {
        autoSave: true,
        spellCheck: true,
        wordCountGoal: faker.number.int({ min: 50000, max: 150000 }),
        dailyWordGoal: faker.number.int({ min: 500, max: 2000 })
      },
      statistics: {
        elementCount: faker.number.int({ min: 0, max: 100 }),
        wordCount: faker.number.int({ min: 0, max: 50000 }),
        chapterCount: faker.number.int({ min: 0, max: 30 }),
        sceneCount: faker.number.int({ min: 0, max: 100 }),
        characterCount: faker.number.int({ min: 0, max: 50 }),
        locationCount: faker.number.int({ min: 0, max: 30 })
      },
      collaborators: [],
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      lastOpenedAt: faker.date.recent().toISOString(),
      ...overrides
    };
  }

  /**
   * Generate multiple projects
   */
  static createMany(count = 5, overrides = {}) {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  /**
   * Generate a fantasy project
   */
  static createFantasy() {
    return this.create({
      name: faker.helpers.arrayElement([
        'The Chronicles of ' + faker.location.country(),
        faker.person.firstName() + "'s Quest",
        'The ' + faker.word.adjective() + ' Kingdom',
        'Dragons of ' + faker.location.city()
      ]),
      genre: 'Fantasy',
      tags: ['magic', 'dragons', 'prophecy', 'kingdoms']
    });
  }

  /**
   * Generate a sci-fi project
   */
  static createSciFi() {
    return this.create({
      name: faker.helpers.arrayElement([
        'Stars of ' + faker.location.city(),
        'The ' + faker.word.adjective() + ' Galaxy',
        'Mission to ' + faker.science.chemicalElement().name,
        'Year ' + faker.number.int({ min: 2100, max: 3000 })
      ]),
      genre: 'Sci-Fi',
      tags: ['space', 'technology', 'aliens', 'future']
    });
  }

  /**
   * Generate a project with specific status
   */
  static createWithStatus(status) {
    return this.create({ status });
  }

  /**
   * Generate an archived project
   */
  static createArchived() {
    return this.create({
      status: 'archived',
      archivedAt: faker.date.past().toISOString()
    });
  }

  /**
   * Generate a collaborative project
   */
  static createCollaborative(collaboratorCount = 3) {
    const UserFactory = require('./userFactory').default;
    const collaborators = UserFactory.createMany(collaboratorCount).map(user => ({
      userId: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      role: faker.helpers.arrayElement(['editor', 'viewer', 'commenter']),
      addedAt: faker.date.past().toISOString()
    }));

    return this.create({ collaborators });
  }

  /**
   * Generate a project with elements
   */
  static createWithElements(elementCount = 10) {
    const ElementFactory = require('./elementFactory').default;
    const project = this.create();
    const elements = ElementFactory.createMany(elementCount, { projectId: project.id });

    return {
      ...project,
      elements,
      statistics: {
        ...project.statistics,
        elementCount: elements.length,
        characterCount: elements.filter(e => e.type === 'character').length,
        locationCount: elements.filter(e => e.type === 'location').length
      }
    };
  }

  /**
   * Generate a project with chapters
   */
  static createWithChapters(chapterCount = 5) {
    const chapters = Array.from({ length: chapterCount }, (_, i) => ({
      id: `chapter-${faker.string.alphanumeric(8)}`,
      number: i + 1,
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(5),
      wordCount: faker.number.int({ min: 1000, max: 5000 }),
      status: faker.helpers.arrayElement(['draft', 'review', 'complete']),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString()
    }));

    return this.create({
      chapters,
      statistics: {
        ...this.create().statistics,
        chapterCount: chapters.length,
        wordCount: chapters.reduce((sum, ch) => sum + ch.wordCount, 0)
      }
    });
  }

  /**
   * Generate project settings
   */
  static createSettings(overrides = {}) {
    return {
      autoSave: true,
      autoSaveInterval: 30000, // 30 seconds
      spellCheck: true,
      grammar: true,
      darkMode: false,
      fontSize: 'medium',
      fontFamily: 'serif',
      lineSpacing: 1.5,
      wordCountGoal: 80000,
      dailyWordGoal: 1000,
      showWordCount: true,
      showCharacterCount: true,
      backupEnabled: true,
      backupFrequency: 'daily',
      ...overrides
    };
  }

  /**
   * Generate project timeline
   */
  static createTimeline() {
    return Array.from({ length: 10 }, () => ({
      id: `event-${faker.string.alphanumeric(8)}`,
      date: faker.date.past().toISOString(),
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      characters: faker.helpers.arrayElements(['char-1', 'char-2', 'char-3'], 2),
      location: `location-${faker.string.alphanumeric(8)}`
    }));
  }

  /**
   * Generate project outline
   */
  static createOutline() {
    return {
      synopsis: faker.lorem.paragraphs(2),
      themes: faker.helpers.arrayElements([
        'redemption', 'love', 'sacrifice', 'power', 'identity',
        'freedom', 'justice', 'family', 'betrayal', 'hope'
      ], 3),
      conflicts: {
        main: faker.lorem.sentence(),
        subplots: Array.from({ length: 3 }, () => faker.lorem.sentence())
      },
      resolution: faker.lorem.paragraph()
    };
  }

  /**
   * Generate world-building data
   */
  static createWorldBuilding() {
    return {
      magicSystem: {
        name: faker.word.noun() + ' Magic',
        rules: Array.from({ length: 5 }, () => faker.lorem.sentence()),
        limitations: Array.from({ length: 3 }, () => faker.lorem.sentence()),
        users: faker.helpers.arrayElements(['wizards', 'sorcerers', 'mages', 'witches'], 2)
      },
      geography: {
        continents: faker.number.int({ min: 1, max: 7 }),
        kingdoms: Array.from({ length: 5 }, () => ({
          name: faker.location.country(),
          capital: faker.location.city(),
          ruler: faker.person.fullName(),
          population: faker.number.int({ min: 10000, max: 1000000 })
        }))
      },
      cultures: Array.from({ length: 3 }, () => ({
        name: faker.company.name() + ' People',
        traditions: Array.from({ length: 3 }, () => faker.lorem.sentence()),
        beliefs: faker.lorem.paragraph(),
        language: faker.word.noun() + 'ish'
      }))
    };
  }

  /**
   * Create empty project
   */
  static createEmpty() {
    return this.create({
      statistics: {
        elementCount: 0,
        wordCount: 0,
        chapterCount: 0,
        sceneCount: 0,
        characterCount: 0,
        locationCount: 0
      }
    });
  }

  /**
   * Create completed project
   */
  static createCompleted() {
    return this.create({
      status: 'completed',
      completedAt: faker.date.recent().toISOString(),
      statistics: {
        elementCount: faker.number.int({ min: 50, max: 200 }),
        wordCount: faker.number.int({ min: 70000, max: 120000 }),
        chapterCount: faker.number.int({ min: 20, max: 40 }),
        sceneCount: faker.number.int({ min: 80, max: 150 }),
        characterCount: faker.number.int({ min: 20, max: 50 }),
        locationCount: faker.number.int({ min: 10, max: 30 })
      }
    });
  }

  /**
   * Generate mock API response
   */
  static createAPIResponse(project = null) {
    const projectData = project || this.create();
    return {
      success: true,
      project: projectData,
      message: 'Project retrieved successfully'
    };
  }

  /**
   * Generate project list API response
   */
  static createListAPIResponse(count = 10) {
    return {
      success: true,
      projects: this.createMany(count),
      total: count,
      page: 1,
      perPage: 20
    };
  }
}

export default ProjectFactory;
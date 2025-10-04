/**
 * Element Factory
 * Generates test element data (characters, locations, items, etc.) for E2E tests
 */

import { faker } from '@faker-js/faker';

class ElementFactory {
  static elementTypes = [
    'character', 'location', 'item', 'event', 'organization',
    'creature', 'magic', 'culture', 'language', 'technology'
  ];

  static characterCategories = [
    'protagonist', 'antagonist', 'supporting', 'minor', 'mentor', 'sidekick'
  ];

  static locationCategories = [
    'city', 'village', 'forest', 'mountain', 'castle', 'dungeon', 'realm'
  ];

  static itemCategories = [
    'weapon', 'armor', 'artifact', 'tool', 'treasure', 'consumable'
  ];

  /**
   * Generate a base element with optional overrides
   */
  static create(overrides = {}) {
    const randomId = faker.string.alphanumeric(8);
    const type = overrides.type || faker.helpers.arrayElement(this.elementTypes);

    return {
      id: `element-${randomId}`,
      projectId: `project-${faker.string.alphanumeric(8)}`,
      type,
      name: this.generateName(type),
      description: faker.lorem.paragraph(),
      category: this.getCategory(type),
      tags: this.generateTags(type),
      imageUrl: faker.image.url(),
      completionPercentage: faker.number.int({ min: 0, max: 100 }),
      isPinned: false,
      isArchived: false,
      customFields: {},
      answers: {},
      relationships: [],
      notes: faker.lorem.paragraphs(2),
      metadata: {
        createdBy: `user-${faker.string.alphanumeric(8)}`,
        lastModifiedBy: `user-${faker.string.alphanumeric(8)}`,
        version: 1,
        revisionHistory: []
      },
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides
    };
  }

  /**
   * Generate multiple elements
   */
  static createMany(count = 5, overrides = {}) {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  /**
   * Generate a character element
   */
  static createCharacter(overrides = {}) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return this.create({
      type: 'character',
      name: `${firstName} ${lastName}`,
      category: faker.helpers.arrayElement(this.characterCategories),
      tags: ['character', ...faker.helpers.arrayElements([
        'hero', 'warrior', 'mage', 'rogue', 'noble', 'commoner'
      ], 2)],
      answers: {
        appearance: faker.person.jobDescriptor() + ' with ' + faker.color.human() + ' hair',
        personality: faker.helpers.arrayElements([
          'brave', 'cunning', 'wise', 'ambitious', 'loyal', 'mysterious'
        ], 3).join(', '),
        backstory: faker.lorem.paragraph(),
        motivation: faker.lorem.sentence(),
        fears: faker.lorem.sentence(),
        strengths: faker.helpers.arrayElements([
          'combat', 'magic', 'diplomacy', 'stealth', 'leadership'
        ], 2).join(', '),
        weaknesses: faker.lorem.sentence(),
        occupation: faker.person.jobTitle(),
        age: faker.number.int({ min: 16, max: 80 }),
        birthplace: faker.location.city()
      },
      ...overrides
    });
  }

  /**
   * Generate a location element
   */
  static createLocation(overrides = {}) {
    return this.create({
      type: 'location',
      name: faker.helpers.arrayElement([
        faker.location.city(),
        'The ' + faker.word.adjective() + ' ' + faker.location.direction(),
        faker.person.lastName() + "'s Keep",
        'Mount ' + faker.word.noun()
      ]),
      category: faker.helpers.arrayElement(this.locationCategories),
      tags: ['location', ...faker.helpers.arrayElements([
        'populated', 'abandoned', 'dangerous', 'sacred', 'hidden'
      ], 2)],
      answers: {
        geography: faker.lorem.sentence(),
        climate: faker.helpers.arrayElement(['tropical', 'temperate', 'arctic', 'desert', 'varied']),
        population: faker.number.int({ min: 0, max: 1000000 }),
        government: faker.helpers.arrayElement(['monarchy', 'democracy', 'theocracy', 'anarchy']),
        economy: faker.lorem.sentence(),
        culture: faker.lorem.sentence(),
        history: faker.lorem.paragraph(),
        landmarks: Array.from({ length: 3 }, () => faker.location.nearbyGPSCoordinate()).join(', '),
        dangers: faker.lorem.sentence(),
        resources: faker.commerce.productMaterial() + ', ' + faker.commerce.productMaterial()
      },
      ...overrides
    });
  }

  /**
   * Generate an item element
   */
  static createItem(overrides = {}) {
    return this.create({
      type: 'item',
      name: faker.helpers.arrayElement([
        'The ' + faker.word.adjective() + ' ' + faker.science.chemicalElement().name,
        faker.person.lastName() + "'s " + faker.commerce.product(),
        faker.word.adjective() + ' ' + faker.commerce.productMaterial()
      ]),
      category: faker.helpers.arrayElement(this.itemCategories),
      tags: ['item', ...faker.helpers.arrayElements([
        'magical', 'cursed', 'legendary', 'common', 'unique'
      ], 2)],
      answers: {
        appearance: faker.commerce.productDescription(),
        origin: faker.lorem.sentence(),
        powers: faker.lorem.sentence(),
        value: faker.commerce.price() + ' gold',
        rarity: faker.helpers.arrayElement(['common', 'uncommon', 'rare', 'legendary', 'unique']),
        weight: faker.number.int({ min: 1, max: 100 }) + ' lbs',
        material: faker.commerce.productMaterial(),
        creator: faker.person.fullName(),
        currentOwner: faker.person.fullName(),
        history: faker.lorem.paragraph()
      },
      ...overrides
    });
  }

  /**
   * Generate an event element
   */
  static createEvent(overrides = {}) {
    return this.create({
      type: 'event',
      name: faker.helpers.arrayElement([
        'The Battle of ' + faker.location.city(),
        'The ' + faker.word.adjective() + ' Revolution',
        faker.person.lastName() + "'s Coronation",
        'The Great ' + faker.word.noun()
      ]),
      tags: ['event', 'historical'],
      answers: {
        date: faker.date.past().toISOString(),
        duration: faker.number.int({ min: 1, max: 365 }) + ' days',
        location: faker.location.city(),
        participants: Array.from({ length: 3 }, () => faker.person.fullName()).join(', '),
        cause: faker.lorem.sentence(),
        outcome: faker.lorem.sentence(),
        significance: faker.lorem.paragraph(),
        casualties: faker.number.int({ min: 0, max: 10000 }),
        aftermath: faker.lorem.paragraph()
      },
      ...overrides
    });
  }

  /**
   * Generate an organization element
   */
  static createOrganization(overrides = {}) {
    return this.create({
      type: 'organization',
      name: faker.helpers.arrayElement([
        'The ' + faker.word.adjective() + ' Order',
        faker.company.name() + ' Guild',
        'Brotherhood of ' + faker.word.noun(),
        'The ' + faker.location.city() + ' Council'
      ]),
      tags: ['organization', ...faker.helpers.arrayElements([
        'guild', 'order', 'cult', 'merchant', 'military', 'religious'
      ], 2)],
      answers: {
        type: faker.helpers.arrayElement(['guild', 'order', 'government', 'merchant', 'military']),
        founded: faker.date.past().toISOString(),
        founder: faker.person.fullName(),
        headquarters: faker.location.city(),
        members: faker.number.int({ min: 10, max: 10000 }),
        purpose: faker.company.catchPhrase(),
        structure: faker.lorem.sentence(),
        resources: faker.lorem.sentence(),
        allies: Array.from({ length: 2 }, () => faker.company.name()).join(', '),
        enemies: Array.from({ length: 2 }, () => faker.company.name()).join(', '),
        motto: faker.company.catchPhrase()
      },
      ...overrides
    });
  }

  /**
   * Generate element with relationships
   */
  static createWithRelationships(relationshipCount = 3) {
    const element = this.create();
    const relationships = Array.from({ length: relationshipCount }, () => ({
      id: `rel-${faker.string.alphanumeric(8)}`,
      sourceId: element.id,
      targetId: `element-${faker.string.alphanumeric(8)}`,
      targetName: faker.person.fullName(),
      type: faker.helpers.arrayElement([
        'friend', 'enemy', 'family', 'ally', 'rival', 'mentor', 'student'
      ]),
      description: faker.lorem.sentence(),
      strength: faker.number.int({ min: 1, max: 10 }),
      createdAt: faker.date.past().toISOString()
    }));

    return { ...element, relationships };
  }

  /**
   * Generate element with custom questions answered
   */
  static createWithAnswers(questionCount = 10) {
    const element = this.create();
    const answers = {};

    for (let i = 0; i < questionCount; i++) {
      const questionId = `question-${i + 1}`;
      answers[questionId] = faker.lorem.sentence();
    }

    return { ...element, answers, completionPercentage: (questionCount / 10) * 100 };
  }

  /**
   * Helper: Generate appropriate name based on type
   */
  static generateName(type) {
    switch (type) {
      case 'character':
        return faker.person.fullName();
      case 'location':
        return faker.location.city();
      case 'item':
        return faker.commerce.product();
      case 'event':
        return 'The ' + faker.word.adjective() + ' ' + faker.word.noun();
      case 'organization':
        return faker.company.name();
      default:
        return faker.lorem.words(2);
    }
  }

  /**
   * Helper: Get appropriate category based on type
   */
  static getCategory(type) {
    switch (type) {
      case 'character':
        return faker.helpers.arrayElement(this.characterCategories);
      case 'location':
        return faker.helpers.arrayElement(this.locationCategories);
      case 'item':
        return faker.helpers.arrayElement(this.itemCategories);
      default:
        return 'general';
    }
  }

  /**
   * Helper: Generate appropriate tags based on type
   */
  static generateTags(type) {
    const baseTags = [type];
    switch (type) {
      case 'character':
        return [...baseTags, ...faker.helpers.arrayElements([
          'hero', 'villain', 'warrior', 'mage', 'noble', 'merchant'
        ], 2)];
      case 'location':
        return [...baseTags, ...faker.helpers.arrayElements([
          'city', 'wilderness', 'dungeon', 'sacred', 'dangerous'
        ], 2)];
      case 'item':
        return [...baseTags, ...faker.helpers.arrayElements([
          'magical', 'weapon', 'armor', 'artifact', 'consumable'
        ], 2)];
      default:
        return [...baseTags, faker.word.adjective(), faker.word.noun()];
    }
  }

  /**
   * Create a complete world with various elements
   */
  static createWorld(elementCounts = {}) {
    const counts = {
      characters: 10,
      locations: 5,
      items: 3,
      events: 2,
      organizations: 2,
      ...elementCounts
    };

    return {
      characters: Array.from({ length: counts.characters }, () => this.createCharacter()),
      locations: Array.from({ length: counts.locations }, () => this.createLocation()),
      items: Array.from({ length: counts.items }, () => this.createItem()),
      events: Array.from({ length: counts.events }, () => this.createEvent()),
      organizations: Array.from({ length: counts.organizations }, () => this.createOrganization())
    };
  }

  /**
   * Generate mock API response
   */
  static createAPIResponse(element = null) {
    const elementData = element || this.create();
    return {
      success: true,
      element: elementData,
      message: 'Element retrieved successfully'
    };
  }

  /**
   * Generate element list API response
   */
  static createListAPIResponse(count = 10, type = null) {
    const elements = type
      ? this.createMany(count, { type })
      : this.createMany(count);

    return {
      success: true,
      elements,
      total: count,
      page: 1,
      perPage: 20,
      filters: { type }
    };
  }
}

export default ElementFactory;
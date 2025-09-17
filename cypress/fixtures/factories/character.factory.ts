/**
 * Factory for generating test Character data
 * Adapted from fantasy-element-builder patterns
 */

export interface Character {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  age?: number;
  gender?: string;
  description: string;
  backstory: string;
  personality: string[];
  goals: string[];
  conflicts: string[];
  relationships: CharacterRelationship[];
  storyIds: string[];
  appearance?: CharacterAppearance;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterRelationship {
  characterId: string;
  characterName: string;
  relationshipType: string;
  description: string;
}

export interface CharacterAppearance {
  height?: string;
  build?: string;
  hairColor?: string;
  eyeColor?: string;
  distinguishingFeatures?: string[];
}

export class CharacterFactory {
  private static idCounter = 1;

  /**
   * Reset counter for test isolation
   */
  static reset() {
    this.idCounter = 1;
  }

  /**
   * Create a single character with optional overrides
   */
  static create(overrides?: Partial<Character>): Character {
    const id = `character-${this.idCounter++}`;
    const now = new Date();
    
    return {
      id,
      name: `Character ${id}`,
      role: 'supporting',
      age: 25 + Math.floor(Math.random() * 30),
      gender: 'unspecified',
      description: 'A mysterious figure with hidden depths',
      backstory: 'Born in a small village, they always dreamed of adventure...',
      personality: ['brave', 'curious', 'loyal'],
      goals: ['Discover their true purpose', 'Protect their loved ones'],
      conflicts: ['Internal struggle with destiny', 'External conflict with antagonist'],
      relationships: [],
      storyIds: [],
      appearance: {
        height: 'average',
        build: 'athletic',
        hairColor: 'brown',
        eyeColor: 'green',
        distinguishingFeatures: ['scar above left eyebrow']
      },
      metadata: {},
      createdAt: now,
      updatedAt: now,
      ...overrides
    };
  }

  /**
   * Create multiple characters
   */
  static createMany(count: number, overrides?: Partial<Character>): Character[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  /**
   * Create a protagonist
   */
  static createProtagonist(overrides?: Partial<Character>): Character {
    return this.create({
      name: 'Hero Protagonist',
      role: 'protagonist',
      description: 'The brave hero of our story',
      backstory: 'Chosen by fate to save the realm...',
      personality: ['brave', 'determined', 'compassionate', 'resourceful'],
      goals: ['Save the world', 'Find their true identity', 'Master their powers'],
      conflicts: ['Self-doubt', 'Responsibility vs desire', 'Past trauma'],
      ...overrides
    });
  }

  /**
   * Create an antagonist
   */
  static createAntagonist(overrides?: Partial<Character>): Character {
    return this.create({
      name: 'Dark Lord',
      role: 'antagonist',
      description: 'The primary villain opposing the hero',
      backstory: 'Once noble, now corrupted by power...',
      personality: ['ruthless', 'intelligent', 'charismatic', 'obsessive'],
      goals: ['Conquer the realm', 'Obtain ultimate power', 'Destroy the hero'],
      conflicts: ['Past connection to hero', 'Internal humanity', 'Fear of weakness'],
      appearance: {
        height: 'tall',
        build: 'imposing',
        hairColor: 'black',
        eyeColor: 'red',
        distinguishingFeatures: ['dark armor', 'glowing eyes', 'commanding presence']
      },
      ...overrides
    });
  }

  /**
   * Create a supporting character
   */
  static createSupporting(overrides?: Partial<Character>): Character {
    const supportingRoles = [
      { name: 'Wise Mentor', personality: ['wise', 'patient', 'mysterious'] },
      { name: 'Loyal Friend', personality: ['loyal', 'brave', 'humorous'] },
      { name: 'Love Interest', personality: ['intelligent', 'independent', 'caring'] },
      { name: 'Comic Relief', personality: ['funny', 'optimistic', 'clumsy'] }
    ];
    
    const role = supportingRoles[Math.floor(Math.random() * supportingRoles.length)];
    
    return this.create({
      name: role.name,
      role: 'supporting',
      personality: role.personality,
      ...overrides
    });
  }

  /**
   * Create a character with relationships
   */
  static createWithRelationships(relationships: CharacterRelationship[], overrides?: Partial<Character>): Character {
    return this.create({
      relationships,
      metadata: {
        relationshipCount: relationships.length,
        hasFamily: relationships.some(r => r.relationshipType.includes('family')),
        hasRomance: relationships.some(r => r.relationshipType.includes('love'))
      },
      ...overrides
    });
  }

  /**
   * Create a complete character profile
   */
  static createComplete(): Character {
    return this.create({
      name: 'Elena Starweaver',
      role: 'protagonist',
      age: 28,
      gender: 'female',
      description: 'A skilled mage with a mysterious past and untapped potential',
      backstory: `Born during a lunar eclipse, Elena was marked by destiny from birth. 
                  Raised by her grandmother after her parents disappeared mysteriously, 
                  she discovered her magical abilities at age 16. Now she seeks answers 
                  about her heritage while protecting her realm from dark forces.`,
      personality: ['intelligent', 'determined', 'compassionate', 'stubborn', 'curious'],
      goals: [
        'Discover the truth about her parents',
        'Master her magical abilities',
        'Protect the innocent from dark magic',
        'Find her place in the world'
      ],
      conflicts: [
        'Fear of her own power',
        'Trust issues from past betrayal',
        'Duty vs personal desires',
        'Connection to dark magic through bloodline'
      ],
      relationships: [
        {
          characterId: 'character-mentor-1',
          characterName: 'Master Aldwin',
          relationshipType: 'mentor',
          description: 'Her magical teacher and father figure'
        },
        {
          characterId: 'character-friend-1',
          characterName: 'Marcus Ironshield',
          relationshipType: 'best friend',
          description: 'Childhood friend and loyal companion'
        },
        {
          characterId: 'character-rival-1',
          characterName: 'Lyra Shadowmend',
          relationshipType: 'rival',
          description: 'Fellow mage with conflicting ideals'
        }
      ],
      storyIds: ['story-1', 'story-2'],
      appearance: {
        height: '5\'7"',
        build: 'athletic',
        hairColor: 'silver with purple streaks',
        eyeColor: 'violet',
        distinguishingFeatures: [
          'Crescent moon birthmark on left shoulder',
          'Glowing tattoos when using magic',
          'Always wears grandmother\'s pendant'
        ]
      },
      metadata: {
        magicType: 'elemental',
        powerLevel: 'high',
        alignment: 'chaotic good',
        voiceDescription: 'melodic with slight accent',
        theme: 'self-discovery and acceptance'
      }
    });
  }

  /**
   * Create a cast of characters for a story
   */
  static createCast(): Character[] {
    return [
      this.createProtagonist({ name: 'Aria Lightbringer' }),
      this.createAntagonist({ name: 'Lord Shadowthorne' }),
      this.createSupporting({ 
        name: 'Gandric the Wise',
        personality: ['wise', 'cryptic', 'protective'],
        backstory: 'Ancient wizard who has guided many heroes'
      }),
      this.createSupporting({
        name: 'Finn Quickblade',
        personality: ['loyal', 'brave', 'impulsive'],
        backstory: 'Street thief turned hero\'s companion'
      }),
      this.createSupporting({
        name: 'Princess Celeste',
        personality: ['intelligent', 'diplomatic', 'determined'],
        backstory: 'Heir to the throne, secretly trains as a warrior'
      }),
      this.create({
        name: 'The Shadow',
        role: 'minor',
        description: 'Mysterious figure watching from afar',
        personality: ['enigmatic', 'observant'],
        goals: ['Unknown']
      })
    ];
  }

  /**
   * Create a character by archetype
   */
  static createByArchetype(archetype: string): Character {
    const archetypes: Record<string, Partial<Character>> = {
      hero: {
        role: 'protagonist',
        personality: ['brave', 'selfless', 'determined'],
        goals: ['Save the world', 'Protect the innocent']
      },
      mentor: {
        role: 'supporting',
        age: 60 + Math.floor(Math.random() * 20),
        personality: ['wise', 'patient', 'experienced'],
        goals: ['Guide the hero', 'Pass on knowledge']
      },
      trickster: {
        role: 'supporting',
        personality: ['cunning', 'playful', 'unpredictable'],
        goals: ['Create chaos', 'Expose truth through mischief']
      },
      guardian: {
        role: 'supporting',
        personality: ['protective', 'strong', 'loyal'],
        goals: ['Protect the protagonist', 'Uphold duty']
      },
      shadow: {
        role: 'antagonist',
        personality: ['dark', 'powerful', 'corrupted'],
        goals: ['Destroy the hero', 'Spread darkness']
      }
    };

    const template = archetypes[archetype] || {};
    return this.create(template);
  }
}
/**
 * Fantasy Master Color Palette
 * A comprehensive color system for the Fantasy Writing App
 * Based on RPG attributes, classes, and fantasy UI elements
 */

export const fantasyMasterColors = {
  // ===== ATTRIBUTE COLORS =====
  // Named after classic RPG attributes
  attributes: {
    // Strength - Red tones for power and might
    might: {
      DEFAULT: '#A31C1C',
      lightest: '#FBE9E9',
      lighter: '#F5C1C1',
      light: '#E89B9B',
      soft: '#D87272',
      medium: '#C84545',
      strong: '#B33030',
      base: '#A31C1C',
      dark: '#741313',
      darkest: '#4C0B0B',
    },
    
    // Speed - Blue tones for swiftness and agility
    swiftness: {
      DEFAULT: '#1C4FA3',
      lightest: '#E8EFFA',
      lighter: '#C3D6F5',
      light: '#9DBBEF',
      soft: '#789FE8',
      medium: '#4F7EDA',
      strong: '#3369C3',
      base: '#1C4FA3',
      dark: '#153A7A',
      darkest: '#0F2652',
    },
    
    // Endurance - Green tones for vitality and stamina
    vitality: {
      DEFAULT: '#2E7D4F',
      lightest: '#E8F4EC',
      lighter: '#C2E3D0',
      light: '#9BD2B3',
      soft: '#74C095',
      medium: '#4DAD78',
      strong: '#3E9A67',
      base: '#2E7D4F',
      dark: '#205C39',
      darkest: '#143D26',
    },
    
    // Dexterity - Amber tones for finesse and precision
    finesse: {
      DEFAULT: '#E3941C',
      lightest: '#FFF4E0',
      lighter: '#FCDDA6',
      light: '#F8C56D',
      soft: '#F3AD34',
      medium: '#E3941C',
      strong: '#C77E13',
      base: '#A7660E',
      dark: '#7D4C0A',
      darkest: '#523204',
    },
  },

  // ===== CLASS COLORS =====
  // Named after fantasy archetypes
  classes: {
    // Fighter/Warrior - Red tones
    warrior: {
      DEFAULT: '#A31C1C',
      50: '#FBE9E9',
      100: '#F5C1C1',
      200: '#E89B9B',
      300: '#D87272',
      400: '#C84545',
      500: '#B33030',
      600: '#A31C1C',
      700: '#741313',
      800: '#4C0B0B',
      900: '#3A0808',
    },
    
    // Assassin/Rogue - Dark gray tones
    shadow: {
      DEFAULT: '#1F1F1F',
      50: '#EAEAEA',
      100: '#C6C6C6',
      200: '#A3A3A3',
      300: '#7F7F7F',
      400: '#5C5C5C',
      500: '#3A3A3A',
      600: '#2B2B2B',
      700: '#1F1F1F',
      800: '#141414',
      900: '#0A0A0A',
    },
    
    // Ranger - Forest green tones
    hunter: {
      DEFAULT: '#3A7F3C',
      50: '#EAF5EA',
      100: '#C9E3CB',
      200: '#A7D0AC',
      300: '#86BE8E',
      400: '#64AC6F',
      500: '#4E975A',
      600: '#3A7F3C',
      700: '#2A5E2B',
      800: '#1C3F1C',
      900: '#0F2A0F',
    },
    
    // Scout - Ocean blue tones
    explorer: {
      DEFAULT: '#2C5FA3',
      50: '#EAF1FA',
      100: '#C7DAF2',
      200: '#A4C2E9',
      300: '#81A9E0',
      400: '#5F91D7',
      500: '#4575BD',
      600: '#2C5FA3',
      700: '#204679',
      800: '#142D4F',
      900: '#0A1A30',
    },
    
    // Tank/Guardian - Purple tones
    guardian: {
      DEFAULT: '#5C2E91',
      50: '#F2ECF8',
      100: '#D9C7F0',
      200: '#BF9FE7',
      300: '#A677DF',
      400: '#8D4ED6',
      500: '#743AB9',
      600: '#5C2E91',
      700: '#411E6A',
      800: '#2C1349',
      900: '#1A0A2E',
    },
  },

  // ===== UI COLORS =====
  // Fantasy-themed UI elements
  ui: {
    // Parchment backgrounds
    parchment: {
      DEFAULT: '#F5F0E6',
      50: '#FFFFFF',
      100: '#FDFBF8',
      200: '#FAF6EF',
      300: '#F5F0E6',
      400: '#F0E9DC',
      500: '#EAE2D3',
      600: '#E5DCCC',
      700: '#DFD6C5',
      800: '#D9D0BE',
      900: '#CCBFAA',
    },
    
    // Dark theme backgrounds (like ancient stone)
    obsidian: {
      DEFAULT: '#1A1815',
      50: '#3A3632',
      100: '#2F2C28',
      200: '#252320',
      300: '#1E1B18',
      400: '#1A1815',
      500: '#171513',
      600: '#141210',
      700: '#110F0D',
      800: '#0E0C0B',
      900: '#050404',
    },
    
    // Text colors - Ink variations
    ink: {
      primary: {
        DEFAULT: '#2D1C15',
        light: '#6F4D3F',
        lighter: '#8D7367',
        dark: '#1A0D08',
        darker: '#0F0705',
      },
      secondary: {
        DEFAULT: '#5B463C',
        light: '#937C73',
        lighter: '#AA9890',
        dark: '#3D2E27',
        darker: '#201712',
      },
    },
    
    // Metallic accents
    metals: {
      gold: {
        DEFAULT: '#C9A94F',
        pale: '#FFFBE9',
        light: '#F5EBB7',
        soft: '#EAD985',
        bright: '#E0C952',
        base: '#C9A94F',
        antique: '#AD8F3D',
        tarnished: '#8F742E',
        dark: '#70591F',
        shadow: '#523F10',
      },
      silver: {
        DEFAULT: '#B0B4B9',
        pale: '#F7F8F9',
        light: '#E1E3E5',
        soft: '#CACDCF',
        bright: '#B4B6B9',
        base: '#B0B4B9',
        antique: '#92969B',
        tarnished: '#74787D',
        dark: '#565A5E',
        shadow: '#383B3F',
      },
      bronze: {
        DEFAULT: '#B08D57',
        light: '#D4B896',
        dark: '#8B6F45',
      },
      copper: {
        DEFAULT: '#B87333',
        light: '#E09D5D',
        dark: '#8B5A2B',
      },
    },
  },

  // ===== SEMANTIC COLORS =====
  // Status and feedback colors with fantasy names
  semantic: {
    // Danger/Error - Dragon's fire
    dragonfire: {
      DEFAULT: '#C03030',
      pale: '#FCEDED',
      light: '#F7BEBE',
      soft: '#F19090',
      medium: '#EC6161',
      strong: '#E73333',
      base: '#C03030',
      dark: '#992525',
      darker: '#731A1A',
      shadow: '#4D0F0F',
    },
    
    // Success - Healing potion green
    elixir: {
      DEFAULT: '#4FA361',
      pale: '#E8F5ED',
      light: '#C3E3CF',
      soft: '#9FD1B1',
      medium: '#7ABF93',
      strong: '#56AD75',
      base: '#4FA361',
      dark: '#3C7F4B',
      darker: '#2D5F38',
      shadow: '#1E3F26',
    },
    
    // Warning - Sunburst yellow
    sunburst: {
      DEFAULT: '#F59E0B',
      pale: '#FEF3C7',
      light: '#FDE68A',
      soft: '#FCD34D',
      medium: '#FBBF24',
      strong: '#F59E0B',
      base: '#D97706',
      dark: '#B45309',
      darker: '#92400E',
      shadow: '#78350F',
    },
    
    // Info - Mystic blue
    mystic: {
      DEFAULT: '#3B82F6',
      pale: '#EFF6FF',
      light: '#DBEAFE',
      soft: '#BFDBFE',
      medium: '#93C5FD',
      strong: '#60A5FA',
      base: '#3B82F6',
      dark: '#2563EB',
      darker: '#1D4ED8',
      shadow: '#1E40AF',
    },
  },

  // ===== ELEMENT TYPES =====
  // For different content categories
  elements: {
    character: '#A31C1C', // Warrior red
    location: '#2E7D4F',  // Vitality green
    item: '#C9A94F',      // Gold
    magic: '#5C2E91',     // Guardian purple
    creature: '#3A7F3C',  // Hunter green
    culture: '#E3941C',   // Finesse amber
    organization: '#2C5FA3', // Explorer blue
    religion: '#B0B4B9',  // Silver
    technology: '#B87333', // Copper
    history: '#8B6F45',   // Dark bronze
    language: '#1C4FA3',  // Swiftness blue
  },

  // ===== SPECIAL EFFECTS =====
  effects: {
    glow: {
      gold: 'rgba(201, 169, 79, 0.3)',
      silver: 'rgba(176, 180, 185, 0.3)',
      magic: 'rgba(92, 46, 145, 0.3)',
      fire: 'rgba(192, 48, 48, 0.3)',
      ice: 'rgba(28, 79, 163, 0.3)',
      nature: 'rgba(46, 125, 79, 0.3)',
    },
    shadow: {
      soft: 'rgba(26, 22, 19, 0.1)',
      medium: 'rgba(26, 22, 19, 0.2)',
      strong: 'rgba(26, 22, 19, 0.3)',
      deep: 'rgba(26, 22, 19, 0.5)',
    },
  },
};

// Export type for TypeScript
export type FantasyMasterColors = typeof fantasyMasterColors;
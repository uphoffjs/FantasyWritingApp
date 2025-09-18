/**
 * Unified Design Token System
 * Single source of truth for all colors across app, mockups, and Storybook
 * Imports from fantasyMasterColors and structures for export
 */

const { fantasyMasterColors } = require('../constants/fantasyMasterColors');

// * Transform the fantasyMasterColors into design tokens format
const tokens = {
  color: {
    // * Attribute Colors - RPG-inspired characteristics
    attribute: {
      might: fantasyMasterColors.attributes.might,
      swiftness: fantasyMasterColors.attributes.swiftness,
      vitality: fantasyMasterColors.attributes.vitality,
      finesse: fantasyMasterColors.attributes.finesse,
    },
    
    // * Class Colors - Fantasy archetypes
    class: {
      warrior: fantasyMasterColors.classes.warrior,
      shadow: fantasyMasterColors.classes.shadow,
      hunter: fantasyMasterColors.classes.hunter,
      explorer: fantasyMasterColors.classes.explorer,
      guardian: fantasyMasterColors.classes.guardian,
    },
    
    // * UI Colors - Interface elements
    ui: {
      parchment: fantasyMasterColors.ui.parchment,
      obsidian: fantasyMasterColors.ui.obsidian,
      ink: fantasyMasterColors.ui.ink,
      
      // * Metals need special handling for CSS compatibility
      metals: {
        gold: fantasyMasterColors.ui.metals.gold,
        silver: fantasyMasterColors.ui.metals.silver,
        bronze: fantasyMasterColors.ui.metals.bronze,
        copper: fantasyMasterColors.ui.metals.copper,
        // * Add brass as antique gold for consistency
        brass: {
          DEFAULT: fantasyMasterColors.ui.metals.gold.antique,
          light: fantasyMasterColors.ui.metals.gold.soft,
          dark: fantasyMasterColors.ui.metals.gold.tarnished,
        }
      },
    },
    
    // * Semantic Colors - Status and feedback
    semantic: {
      dragonfire: fantasyMasterColors.semantic.dragonfire,
      elixir: fantasyMasterColors.semantic.elixir,
      sunburst: fantasyMasterColors.semantic.sunburst,
      mystic: fantasyMasterColors.semantic.mystic,
    },
    
    // * Element Type Colors - Content categories
    element: fantasyMasterColors.elements,
    
    // * Effects - Special visual effects
    effect: fantasyMasterColors.effects,
  },
  
  // * Typography scales (for future use)
  typography: {
    fontFamily: {
      cinzel: ['Cinzel', 'Georgia', 'serif'],
      garamond: ['EB Garamond', 'Georgia', 'serif'],
      sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    },
  },
  
  // * Spacing scale (8px grid)
  spacing: {
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem',  // 8px
    3: '0.75rem', // 12px
    4: '1rem',    // 16px
    5: '1.25rem', // 20px
    6: '1.5rem',  // 24px
    8: '2rem',    // 32px
    10: '2.5rem', // 40px
    12: '3rem',   // 48px
    16: '4rem',   // 64px
    20: '5rem',   // 80px
    24: '6rem',   // 96px
  },
  
  // * Animation durations
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      verySlow: '1000ms',
    },
    easing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  
  // * Shadows (parchment-themed)
  shadow: {
    sm: '0 1px 3px rgba(26, 22, 19, 0.1)',
    md: '0 2px 8px rgba(26, 22, 19, 0.1)',
    lg: '0 4px 12px rgba(26, 22, 19, 0.15)',
    xl: '0 8px 24px rgba(26, 22, 19, 0.2)',
  },
  
  // * Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem', // 2px
    md: '0.25rem',  // 4px
    lg: '0.5rem',   // 8px
    xl: '0.75rem',  // 12px
    full: '9999px',
  },
};

module.exports = { tokens };
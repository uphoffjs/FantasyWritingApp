/** @type {import('tailwindcss').Config} */
const { fantasyTomeColors: _fantasyTomeColors } = require('./src/constants/fantasyTomeColors.js');
const { tokens } = require('./src/design-tokens/tokens.js'); // Use unified tokens
const { fantasyMasterColors } = require('./src/constants/fantasyMasterColors.js'); // Keep for backward compat

module.exports = {
  content: [
    "./index.html",
    "./index.web.js",
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./web/**/*.{js,ts,jsx,tsx,html}",
    // Make sure to include any dynamic class names
    "./src/constants/colors.ts",
    "./src/constants/fantasyTomeColors.ts",
    "./src/constants/fantasyMasterColors.ts",
    "./src/constants/fantasyMasterColors.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        'cinzel': ['Cinzel', 'Georgia', 'serif'],
        'garamond': ['EB Garamond', 'Georgia', 'serif'],
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // === UNIFIED TOKEN COLORS ===
        
        // Attribute-based colors (from unified tokens)
        might: tokens.color.attribute.might,
        swiftness: tokens.color.attribute.swiftness,
        vitality: tokens.color.attribute.vitality,
        finesse: tokens.color.attribute.finesse,
        
        // Class-based colors (from unified tokens)
        warrior: tokens.color.class.warrior,
        shadow: tokens.color.class.shadow,
        hunter: tokens.color.class.hunter,
        explorer: tokens.color.class.explorer,
        guardian: tokens.color.class.guardian,
        
        // UI colors (from unified tokens)
        parchment: tokens.color.ui.parchment,
        obsidian: tokens.color.ui.obsidian,
        ink: tokens.color.ui.ink,
        metals: tokens.color.ui.metals,
        
        // Semantic colors (from unified tokens)
        dragonfire: tokens.color.semantic.dragonfire,
        elixir: tokens.color.semantic.elixir,
        sunburst: tokens.color.semantic.sunburst,
        mystic: tokens.color.semantic.mystic,
        
        // Element type colors (from unified tokens)
        character: tokens.color.element.character,
        location: tokens.color.element.location,
        item: tokens.color.element.item,
        magic: tokens.color.element.magic,
        creature: tokens.color.element.creature,
        culture: tokens.color.element.culture,
        organization: tokens.color.element.organization,
        religion: tokens.color.element.religion,
        technology: tokens.color.element.technology,
        history: tokens.color.element.history,
        language: tokens.color.element.language,
        
        // === LEGACY COLORS (kept for compatibility) ===
        
        // Semantic color aliases for backward compatibility
        forest: fantasyMasterColors.semantic.elixir.base,
        flame: fantasyMasterColors.semantic.sunburst.base,
        blood: fantasyMasterColors.semantic.dragonfire.base,
        sapphire: fantasyMasterColors.semantic.mystic.base,
        
        'forest-light': fantasyMasterColors.semantic.elixir.light,
        'flame-light': fantasyMasterColors.semantic.sunburst.light,
        'blood-light': fantasyMasterColors.semantic.dragonfire.light,
        'sapphire-light': fantasyMasterColors.semantic.mystic.light,
        
        // UI States (mapped to new colors)
        states: {
          hover: fantasyMasterColors.ui.parchment[200],
          active: fantasyMasterColors.ui.parchment[400],
          disabled: fantasyMasterColors.ui.ink.secondary.lighter,
          focus: fantasyMasterColors.semantic.mystic.medium,
        },
        
        // Legacy colors for backwards compatibility (will remove later)
        dark: {
          900: '#0A0E13',
          800: '#141824',
          700: '#1E2235',
          600: '#282C45',
        },
        teal: {
          700: '#0F7B8A',
          600: '#14A8BD',
          500: '#14A8BD',
          400: '#38BED3',
          300: '#5FD4E3',
        },
        gold: {
          500: '#D4A574',
          400: '#DEB887',
          300: '#E8CBB0',
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'seal-press': 'sealPress 0.3s ease-out',
        'page-turn': 'pageTurn 0.5s ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        shimmer: {
          '0%': { opacity: '0.8' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.8' }
        },
        sealPress: {
          '0%': { transform: 'scale(1.2) rotate(-5deg)', opacity: '0' },
          '50%': { transform: 'scale(0.95) rotate(2deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' }
        },
        pageTurn: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(-20deg)' }
        }
      },
      boxShadow: {
        'parchment': '0 2px 8px rgba(26, 22, 19, 0.1)',
        'parchment-hover': '0 4px 12px rgba(26, 22, 19, 0.15)',
        'parchment-active': '0 1px 4px rgba(26, 22, 19, 0.2)',
        'gold-glow': '0 0 20px rgba(255, 215, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
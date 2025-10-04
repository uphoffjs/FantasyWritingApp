/**
 * * Shared Fantasy Design Tokens - TypeScript/React Native Version
 * * This is synchronized with fantasy-tokens.css
 * * Used by React Native components and can be imported into Storybook
 */

import { Platform } from 'react-native';

// * ========== COLOR TOKENS ==========
export const colors = {
  // * Primary Colors - Attribute-based
  might: '#A31C1C',
  swiftness: '#1C4FA3', 
  vitality: '#2E7D4F',
  finesse: '#E3941C',
  
  // * Neutral Colors - UI Base
  parchment: '#F5F0E6',
  obsidian: '#1A1815',
  ink: '#2D1C15',
  inkSecondary: '#5B463C',
  
  // * Metallic Accents
  gold: '#C9A94F',
  silver: '#B0B4B9',
  bronze: '#B08D57',
  copper: '#B87333',
  
  // * Semantic Colors
  danger: '#C03030',
  success: '#4FA361',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // * Element Type Colors
  character: '#A31C1C',
  location: '#2E7D4F',
  magic: '#5C2E91',
  item: '#C9A94F',
  creature: '#3A7F3C',
  culture: '#E3941C',
  organization: '#2C5FA3',
  religion: '#B0B4B9',
  technology: '#B87333',
  history: '#8B6F45',
  language: '#1C4FA3',
};

// * Dark mode color overrides
export const darkColors = {
  ...colors,
  parchment: '#1A1815',
  obsidian: '#F5F0E6',
  ink: '#F5F0E6',
  inkSecondary: '#D9D0BE',
  danger: '#E73333',
  success: '#56AD75',
  warning: '#FBBF24',
  info: '#60A5FA',
};

// * ========== TYPOGRAPHY ==========
export const typography = {
  // * Font Families
  fontFamily: {
    primary: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'System',
    }),
    secondary: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      web: 'Georgia, "Times New Roman", serif',
      default: 'serif',
    }),
    mono: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      web: '"SF Mono", Monaco, Consolas, monospace',
      default: 'monospace',
    }),
  },
  
  // * Font Sizes (in points for React Native)
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // * Font Weights
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // * Line Heights (multipliers)
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
};

// * ========== SPACING ==========
// * Based on 8px grid system
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
};

// * ========== BORDERS ==========
export const borders = {
  // * Border Width
  width: {
    0: 0,
    1: 1,
    2: 2,
    4: 4,
    8: 8,
  },
  
  // * Border Radius
  radius: {
    none: 0,
    sm: 2,
    md: 4,
    lg: 8,
    xl: 12,
    '2xl': 16,
    '3xl': 24,
    full: 9999,
  },
};

// * ========== SHADOWS ==========
// * React Native shadow properties
export const shadows = {
  xs: {
    shadowColor: '#1A1613',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: '#1A1613',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A1613',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1A1613',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: '#1A1613',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 12,
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

// * Glow effects (web-specific, used via style prop)
export const glowEffects = {
  gold: { boxShadow: '0 0 20px rgba(201, 169, 79, 0.5)' },
  magic: { boxShadow: '0 0 20px rgba(92, 46, 145, 0.5)' },
  fire: { boxShadow: '0 0 20px rgba(192, 48, 48, 0.5)' },
};

// * ========== ANIMATIONS ==========
export const animations = {
  // * Durations (in ms)
  duration: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 750,
    slowest: 1000,
  },
  
  // * React Native doesn't support easing strings directly
  // * These are for reference and can be used with Animated API
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// * ========== Z-INDEX LAYERS ==========
export const zIndex = {
  negative: -1,
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  dropdown: 1000,
  sticky: 1020,
  modal: 1030,
  popover: 1040,
  tooltip: 1050,
};

// * ========== BREAKPOINTS ==========
// * For responsive design on web
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// * Helper function to get current theme colors
export const getThemeColors = (isDarkMode: boolean) => {
  return isDarkMode ? darkColors : colors;
};

// * Export all tokens as a single object for convenience
export const tokens = {
  colors,
  darkColors,
  typography,
  spacing,
  borders,
  shadows,
  glowEffects,
  animations,
  zIndex,
  breakpoints,
};

export default tokens;
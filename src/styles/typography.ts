/**
 * typography.ts
 * * Cross-platform typography system for React Native
 * * Supports web fonts (Cinzel, EB Garamond) with native fallbacks
 * ! IMPORTANT: Web fonts load from Google Fonts, native uses system fonts
 */

import { Platform, TextStyle } from 'react-native';

// * Font family constants with platform-specific fallbacks
export const fontFamilies = {
  // * Headers: Fantasy/medieval feel with Cinzel on web
  heading: Platform.select({
    web: "'Cinzel', Georgia, serif",
    ios: 'Baskerville-Bold', // Elegant serif available on iOS
    android: 'serif', // Android serif fallback
    default: 'System',
  }) as string,
  
  // * Body text: Readable serif with EB Garamond on web
  body: Platform.select({
    web: "'EB Garamond', Georgia, serif",
    ios: 'Georgia', // Available on iOS
    android: 'serif', // Android serif
    default: 'System',
  }) as string,
  
  // * UI elements: Clean sans-serif with Inter on web
  ui: Platform.select({
    web: "'Inter', -apple-system, system-ui, sans-serif",
    ios: 'System', // San Francisco on iOS
    android: 'Roboto', // Default Android font
    default: 'System',
  }) as string,
  
  // * Monospace for code/data
  monospace: Platform.select({
    web: "'Courier New', monospace",
    ios: 'Courier',
    android: 'monospace',
    default: 'monospace',
  }) as string,
};

// * Font size scale (in pixels)
export const fontSizes = {
  xs: 12,    // Extra small - metadata, timestamps
  sm: 14,    // Small - captions, labels
  base: 16,  // Base - body text
  lg: 18,    // Large - emphasized body
  xl: 20,    // Extra large - small headings
  '2xl': 24, // 2X Large - section headings
  '3xl': 30, // 3X Large - subsection headings
  '4xl': 36, // 4X Large - major headings
  '5xl': 48, // 5X Large - page titles
  '6xl': 60, // 6X Large - hero titles (web only)
  '7xl': 72, // 7X Large - display titles (web only)
} as const;

// * Font weights with cross-platform values
export const fontWeights = {
  normal: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
};

// * Line height multipliers
export const lineHeights = {
  none: 1,      // No extra line height
  tight: 1.25,  // Tight - headings
  snug: 1.375,  // Snug - subheadings
  normal: 1.5,  // Normal - body text
  relaxed: 1.625, // Relaxed - readable body
  loose: 2,     // Loose - spacious text
} as const;

// * Letter spacing (tracking)
export const letterSpacing = {
  tighter: -0.05,
  tight: -0.025,
  normal: 0,
  wide: 0.025,
  wider: 0.05,
  widest: 0.1,
} as const;

// * Pre-defined text styles for common use cases
export const textStyles = {
  // * Headings
  h1: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes['5xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['5xl'] * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,
  
  h2: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes['4xl'] * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,
  
  h3: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes['3xl'] * lineHeights.snug,
  } as TextStyle,
  
  h4: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes['2xl'] * lineHeights.snug,
  } as TextStyle,
  
  h5: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.xl * lineHeights.normal,
  } as TextStyle,
  
  h6: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.lg * lineHeights.normal,
  } as TextStyle,
  
  // * Body text styles
  bodyLarge: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.lg * lineHeights.relaxed,
  } as TextStyle,
  
  body: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.base * lineHeights.normal,
  } as TextStyle,
  
  bodySmall: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.sm * lineHeights.normal,
  } as TextStyle,
  
  // * UI text styles
  button: {
    fontFamily: fontFamilies.ui,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.base * lineHeights.tight,
    letterSpacing: letterSpacing.wide,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  } as TextStyle,
  
  label: {
    fontFamily: fontFamilies.ui,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.tight,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,
  
  caption: {
    fontFamily: fontFamilies.ui,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.xs * lineHeights.normal,
  } as TextStyle,
  
  // * Special styles
  code: {
    fontFamily: fontFamilies.monospace,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.sm * lineHeights.normal,
  } as TextStyle,
  
  quote: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.normal,
    fontStyle: 'italic',
    lineHeight: fontSizes.lg * lineHeights.relaxed,
  } as TextStyle,
};

// * Responsive font scaling for different screen sizes
export const getResponsiveFontSize = (baseSize: number): number => {
  // TODO: Implement responsive scaling based on screen dimensions
  // For now, return base size
  return baseSize;
};

// * Typography utility functions
export const createTextStyle = (
  family: keyof typeof fontFamilies,
  size: keyof typeof fontSizes,
  weight: keyof typeof fontWeights = 'normal',
  lineHeightMultiplier: keyof typeof lineHeights = 'normal'
): TextStyle => ({
  fontFamily: fontFamilies[family],
  fontSize: fontSizes[size],
  fontWeight: fontWeights[weight],
  lineHeight: fontSizes[size] * lineHeights[lineHeightMultiplier],
});

// * Export type definitions
export type FontFamily = keyof typeof fontFamilies;
export type FontSize = keyof typeof fontSizes;
export type FontWeight = keyof typeof fontWeights;
export type LineHeight = keyof typeof lineHeights;
export type LetterSpacing = keyof typeof letterSpacing;
export type TextStylePreset = keyof typeof textStyles;
/**
 * Color Mapping: Tailwind CSS → Fantasy Tome Theme
 *
 * This file defines the comprehensive mapping from Tailwind colors to Fantasy theme colors.
 * Used by the color replacement script to migrate 369 color literal instances.
 *
 * @see claudedocs/COLOR_MAPPING.md - Complete mapping documentation
 * @see TODO-COLOR-MAPPING.md - Migration plan and progress
 */

export interface ColorMapping {
  text: Record<string, string | 'CONTEXT'>;
  backgrounds: Record<string, string>;
  borders: Record<string, string>;
  semantic: {
    success: {
      text: string;
      bg: string;
      light: string;
    };
    error: Record<string, string>;
    info: Record<string, string>;
  };
  special: Record<string, string>;
}

/**
 * Complete Tailwind → Fantasy color mapping
 *
 * CONTEXT-DEPENDENT COLORS:
 * - '#F9FAFB' requires parent background analysis:
 *   - On dark backgrounds (gray-700+): Use 'fantasyTomeColors.parchment.vellum'
 *   - On light backgrounds: Use 'fantasyTomeColors.ink.black'
 */
export const tailwindToFantasyMap: ColorMapping = {
  // ===================================================================
  // TEXT COLORS (116 instances)
  // ===================================================================
  text: {
    // Context-dependent white/gray-50 (54 instances)
    '#F9FAFB': 'CONTEXT', // Requires parent background check

    // Pure white variants (31 instances total)
    '#FFFFFF': 'fantasyTomeColors.parchment.vellum',
    'white': 'fantasyTomeColors.parchment.vellum',
    '#fff': 'fantasyTomeColors.parchment.vellum',

    // Muted/disabled text (37 instances)
    '#9CA3AF': 'fantasyTomeColors.ink.light', // gray-400 → ink.light (5.1:1 contrast)

    // Secondary text (25 instances)
    '#6B7280': 'fantasyTomeColors.ink.faded', // gray-500 → ink.faded (6.5:1 contrast)

    // Light gray text (6 instances)
    '#D1D5DB': 'fantasyTomeColors.ink.light', // gray-300 → ink.light

    // Fantasy custom text colors (already matching)
    '#5C4A3A': 'fantasyTomeColors.ink.light', // Already matches ink.light
    '#4A3C30': 'fantasyTomeColors.ink.faded', // Already matches ink.faded

    // Custom grays
    '#333': 'fantasyTomeColors.ink.brown',
    '#666': 'fantasyTomeColors.ink.faded',
  },

  // ===================================================================
  // BACKGROUND COLORS (127 instances)
  // ===================================================================
  backgrounds: {
    // Dark backgrounds (33 instances)
    '#374151': 'fantasyTomeColors.ink.brown', // gray-700 → sepia tone (9.2:1 contrast)
    '#1F2937': 'fantasyTomeColors.ink.black', // gray-800 → rich black (14.5:1 contrast)
    '#111827': 'fantasyTomeColors.ink.scribe', // gray-900 → darkest ink

    // Light backgrounds (2 instances)
    '#FAF7F2': 'fantasyTomeColors.parchment.aged', // Custom cream → aged parchment

    // Interactive/brand backgrounds (17 instances)
    '#6366F1': 'fantasyTomeColors.elements.magic.primary', // indigo-500 → magic primary
    '#007AFF': 'fantasyTomeColors.elements.culture.primary', // blue-600 → culture primary

    // Semantic backgrounds (10 instances)
    '#10B981': 'fantasyTomeColors.semantic.success', // green-500 → forest success
    '#059669': 'fantasyTomeColors.semantic.success', // green-600 → success emphasis
    '#A31C1C': 'fantasyTomeColors.semantic.error', // red-custom → blood error
    '#7C2D1220': 'fantasyTomeColors.semantic.errorLight', // red-custom-light with opacity

    // Utility backgrounds (3 instances)
    '#4B5563': 'fantasyTomeColors.ink.faded', // gray-600 → medium dark

    // Keep as-is
    'transparent': 'transparent',
  },

  // ===================================================================
  // BORDER COLORS (45 instances)
  // ===================================================================
  borders: {
    // Dark borders (24 instances total: 15 with bg + 4 bottom + 3 top + 2 gray-600)
    '#374151': 'fantasyTomeColors.parchment.border', // gray-700 → main border (3.2:1 visibility)
    '#4B5563': 'fantasyTomeColors.parchment.border', // gray-600 → medium borders

    // Semantic borders (3 instances)
    '#991B1B': 'fantasyTomeColors.semantic.error', // red-700 → error borders

    // Keep as-is (7 instances)
    'transparent': 'transparent',
  },

  // ===================================================================
  // SEMANTIC COLORS (38 instances)
  // ===================================================================
  semantic: {
    success: {
      text: 'fantasyTomeColors.semantic.success',
      bg: 'fantasyTomeColors.semantic.success',
      light: 'fantasyTomeColors.semantic.successLight',
    },

    error: {
      '#EF4444': 'fantasyTomeColors.semantic.error', // red-500 → blood error
      '#DC2626': 'fantasyTomeColors.semantic.error', // red-600 → error emphasis
      '#FCA5A5': 'fantasyTomeColors.semantic.errorLight', // red-400 → light error
      '#862e2e': 'fantasyTomeColors.semantic.error', // red-custom → error
      '#A31C1C': 'fantasyTomeColors.semantic.error', // red-custom bg
      '#7C2D1220': 'fantasyTomeColors.semantic.errorLight', // red-custom-light with opacity
      '#991B1B': 'fantasyTomeColors.semantic.error', // red-700 border
    },

    info: {
      '#6366F1': 'fantasyTomeColors.elements.magic.primary', // indigo-500 → magic/info
      '#007AFF': 'fantasyTomeColors.elements.culture.primary', // blue-600 → culture/info
    },
  },

  // ===================================================================
  // SPECIAL CASES (43 instances)
  // ===================================================================
  special: {
    // Overlays & shadows (20 instances total: 6 overlays + 14 shadows)
    'rgba(0, 0, 0, 0.5)': 'fantasyTomeColors.states.active', // Modal overlays (or keep custom)
    '#000': 'fantasyTomeColors.ink.scribe', // Shadow color for depth

    // Transparent (7 instances)
    'transparent': 'transparent',

    // State colors (3 instances)
    '#4338CA20': 'fantasyTomeColors.elements.magic.secondary', // Hover with 0.12 opacity

    // Accent colors (2 instances)
    '#C9A94F': 'fantasyTomeColors.metals.gold', // Gold accents
  },
};

/**
 * Context rules for ambiguous color mappings
 */
export const contextRules = {
  /**
   * Rule 1: White/Gray-50 - CONTEXT-DEPENDENT (54 instances)
   *
   * Check parent background color:
   * - On dark backgrounds (gray-700+): Use parchment.vellum
   * - On light backgrounds: Use ink.black
   * - Modal/dialog text on dark: Use parchment.vellum
   */
  whiteGray50: {
    darkBackgrounds: ['#374151', '#1F2937', '#111827'], // gray-700, gray-800, gray-900
    onDark: 'fantasyTomeColors.parchment.vellum',
    onLight: 'fantasyTomeColors.ink.black',
  },

  /**
   * Rule 2: Indigo Colors - PRIMARY ACTIONS (19 instances)
   *
   * Map to magic theme for interactive elements:
   * - Background: magic.primary
   * - Text: magic.primary
   * - Hover background: magic.secondary
   */
  indigo: {
    background: 'fantasyTomeColors.elements.magic.primary',
    text: 'fantasyTomeColors.elements.magic.primary',
    hover: 'fantasyTomeColors.elements.magic.secondary',
  },

  /**
   * Rule 3: Borders with transparent - KEEP AS-IS (7 instances)
   */
  transparentBorders: {
    keep: 'transparent',
  },

  /**
   * Rule 4: Shadow Colors - DARK INK (14 instances)
   *
   * All shadowColor: '#000' → ink.scribe
   */
  shadows: {
    mapping: 'fantasyTomeColors.ink.scribe',
  },

  /**
   * Rule 5: Overlays - STATES OR CUSTOM (6 instances)
   *
   * Modal/dropdown overlays:
   * - Prefer: states.active (rgba(26, 22, 19, 0.1))
   * - If needed: Keep custom rgba for specific opacity
   */
  overlays: {
    preferred: 'fantasyTomeColors.states.active',
    keepCustomIf: 'specific opacity required',
  },
};

/**
 * Files affected by color migration (18 production files)
 */
export const affectedFiles = [
  'src/ViteTest.tsx',
  'src/components/AuthGuard.tsx',
  'src/components/CreateElementModal.tsx',
  'src/components/CreateElementModal.web.tsx',
  'src/components/CrossPlatformDatePicker.tsx',
  'src/components/ElementBrowser.tsx',
  'src/components/ElementBrowser.web.tsx',
  'src/components/ErrorBoundary.tsx',
  'src/components/ErrorMessage.tsx',
  'src/components/ErrorNotification.tsx',
  'src/components/LinkModal.tsx',
  'src/components/MarkdownEditor.tsx',
  'src/components/ProjectList.tsx',
  'src/components/RelationshipManager.tsx',
  'src/components/RelationshipManager.web.tsx',
  'src/components/TemplateSelector.tsx',
  'src/components/TextInput.tsx',
  'src/screens/SettingsScreen.tsx',
];

/**
 * WCAG compliance verification
 * All mappings meet WCAG AA standards (4.5:1 for text, 3:1 for UI)
 */
export const wcagCompliance = {
  '#9CA3AF': { new: 'ink.light (#5C4A3A)', contrast: '5.1:1', status: 'AA' },
  '#6B7280': { new: 'ink.faded (#4A3C30)', contrast: '6.5:1', status: 'AA' },
  '#374151': { new: 'ink.brown (#332518)', contrast: '9.2:1', status: 'AAA' },
  '#1F2937': { new: 'ink.black (#1A1613)', contrast: '14.5:1', status: 'AAA' },
  '#6366F1': { new: 'magic.primary (#4B2673)', contrast: '7.2:1', status: 'AAA' },
  '#10B981': { new: 'semantic.success (#2D5016)', contrast: '9.5:1', status: 'AAA' },
  '#EF4444': { new: 'semantic.error (#6B0000)', contrast: '8.0:1', status: 'AAA' },
};

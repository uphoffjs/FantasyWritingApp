/**
 * ThemeProvider.tsx
 * Provides theme context with light/dark modes using fantasyMasterColors
 * Includes persistence to AsyncStorage and system preference detection
 */

import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { Appearance, Platform, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fantasyMasterColors } from '../constants/fantasyMasterColors';
import { fontFamilies, fontSizes, fontWeights, lineHeights, letterSpacing, textStyles } from '../styles/typography';

// * Theme type definitions
export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  // * Primary palette
  primary: {
    DEFAULT: string;
    text: string;
    textInverse: string;
    background: string;
    backgroundAlt: string;
    border: string;
    borderLight: string;
    hover: string;
    pressed: string;
  };
  // * Secondary palette
  secondary: {
    DEFAULT: string;
    text: string;
    background: string;
    border: string;
  };
  // * UI surfaces
  surface: {
    background: string;
    backgroundAlt: string;
    backgroundElevated: string;
    card: string;
    cardHover: string;
    modal: string;
    overlay: string;
  };
  // * Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
    link: string;
    linkHover: string;
  };
  // * Semantic colors (status)
  semantic: {
    success: string;
    successBackground: string;
    successBorder: string;
    error: string;
    errorBackground: string;
    errorBorder: string;
    warning: string;
    warningBackground: string;
    warningBorder: string;
    info: string;
    infoBackground: string;
    infoBorder: string;
  };
  // * Interactive elements
  button: {
    primary: string;
    primaryText: string;
    primaryHover: string;
    primaryPressed: string;
    secondary: string;
    secondaryText: string;
    secondaryHover: string;
    secondaryPressed: string;
    danger: string;
    dangerText: string;
    dangerHover: string;
    dangerPressed: string;
    disabled: string;
    disabledText: string;
  };
  // * Accent colors from attributes
  accent: {
    might: string;
    swiftness: string;
    vitality: string;
    finesse: string;
  };
  // * Metal accents
  metal: {
    gold: string;
    goldDark: string;
    silver: string;
    silverDark: string;
    bronze: string;
    copper: string;
  };
  // * Element type colors
  elements: {
    character: string;
    location: string;
    item: string;
    magic: string;
    creature: string;
    culture: string;
    organization: string;
    religion: string;
    technology: string;
    history: string;
    language: string;
  };
  // * Special effects
  effects: {
    shadow: string;
    shadowMedium: string;
    shadowStrong: string;
    glow: string;
    glowGold: string;
    glowMagic: string;
  };
}

interface Theme {
  mode: 'light' | 'dark';
  colors: ThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  typography: {
    fontFamily: typeof fontFamilies;
    fontSize: typeof fontSizes;
    fontWeight: typeof fontWeights;
    lineHeight: typeof lineHeights;
    letterSpacing: typeof letterSpacing;
    textStyles: typeof textStyles;
  };
}

// * Light theme mapping (Parchment & Ink)
const lightTheme: ThemeColors = {
  primary: {
    DEFAULT: fantasyMasterColors.attributes.swiftness.base,
    text: fantasyMasterColors.ui.ink.primary.DEFAULT,
    textInverse: fantasyMasterColors.ui.parchment['50'],
    background: fantasyMasterColors.ui.parchment.DEFAULT,
    backgroundAlt: fantasyMasterColors.ui.parchment['200'],
    border: fantasyMasterColors.ui.metals.gold.tarnished,
    borderLight: fantasyMasterColors.ui.metals.gold.soft,
    hover: fantasyMasterColors.attributes.swiftness.strong,
    pressed: fantasyMasterColors.attributes.swiftness.dark,
  },
  secondary: {
    DEFAULT: fantasyMasterColors.ui.metals.silver.base,
    text: fantasyMasterColors.ui.ink.secondary.DEFAULT,
    background: fantasyMasterColors.ui.parchment['100'],
    border: fantasyMasterColors.ui.metals.silver.antique,
  },
  surface: {
    background: fantasyMasterColors.ui.parchment['100'],
    backgroundAlt: fantasyMasterColors.ui.parchment['200'],
    backgroundElevated: fantasyMasterColors.ui.parchment['50'],
    card: fantasyMasterColors.ui.parchment.DEFAULT,
    cardHover: fantasyMasterColors.ui.parchment['200'],
    modal: fantasyMasterColors.ui.parchment['50'],
    overlay: 'rgba(26, 22, 19, 0.5)',
  },
  text: {
    primary: fantasyMasterColors.ui.ink.primary.DEFAULT,
    secondary: fantasyMasterColors.ui.ink.secondary.DEFAULT,
    tertiary: fantasyMasterColors.ui.ink.secondary.light,
    disabled: fantasyMasterColors.ui.ink.secondary.lighter,
    inverse: fantasyMasterColors.ui.parchment['50'],
    link: fantasyMasterColors.attributes.swiftness.base,
    linkHover: fantasyMasterColors.attributes.swiftness.strong,
  },
  semantic: {
    success: fantasyMasterColors.semantic.elixir.base,
    successBackground: fantasyMasterColors.semantic.elixir.pale,
    successBorder: fantasyMasterColors.semantic.elixir.light,
    error: fantasyMasterColors.semantic.dragonfire.base,
    errorBackground: fantasyMasterColors.semantic.dragonfire.pale,
    errorBorder: fantasyMasterColors.semantic.dragonfire.light,
    warning: fantasyMasterColors.semantic.sunburst.base,
    warningBackground: fantasyMasterColors.semantic.sunburst.pale,
    warningBorder: fantasyMasterColors.semantic.sunburst.light,
    info: fantasyMasterColors.semantic.mystic.base,
    infoBackground: fantasyMasterColors.semantic.mystic.pale,
    infoBorder: fantasyMasterColors.semantic.mystic.light,
  },
  button: {
    primary: fantasyMasterColors.attributes.swiftness.base,
    primaryText: fantasyMasterColors.ui.parchment['50'],
    primaryHover: fantasyMasterColors.attributes.swiftness.strong,
    primaryPressed: fantasyMasterColors.attributes.swiftness.dark,
    secondary: fantasyMasterColors.ui.metals.silver.base,
    secondaryText: fantasyMasterColors.ui.ink.primary.DEFAULT,
    secondaryHover: fantasyMasterColors.ui.metals.silver.antique,
    secondaryPressed: fantasyMasterColors.ui.metals.silver.tarnished,
    danger: fantasyMasterColors.semantic.dragonfire.base,
    dangerText: fantasyMasterColors.ui.parchment['50'],
    dangerHover: fantasyMasterColors.semantic.dragonfire.strong,
    dangerPressed: fantasyMasterColors.semantic.dragonfire.dark,
    disabled: fantasyMasterColors.ui.parchment['400'],
    disabledText: fantasyMasterColors.ui.ink.secondary.lighter,
  },
  accent: {
    might: fantasyMasterColors.attributes.might.base,
    swiftness: fantasyMasterColors.attributes.swiftness.base,
    vitality: fantasyMasterColors.attributes.vitality.base,
    finesse: fantasyMasterColors.attributes.finesse.base,
  },
  metal: {
    gold: fantasyMasterColors.ui.metals.gold.base,
    goldDark: fantasyMasterColors.ui.metals.gold.antique,
    silver: fantasyMasterColors.ui.metals.silver.base,
    silverDark: fantasyMasterColors.ui.metals.silver.antique,
    bronze: fantasyMasterColors.ui.metals.bronze.DEFAULT,
    copper: fantasyMasterColors.ui.metals.copper.DEFAULT,
  },
  elements: fantasyMasterColors.elements,
  effects: {
    shadow: fantasyMasterColors.effects.shadow.soft,
    shadowMedium: fantasyMasterColors.effects.shadow.medium,
    shadowStrong: fantasyMasterColors.effects.shadow.strong,
    glow: fantasyMasterColors.effects.glow.gold,
    glowGold: fantasyMasterColors.effects.glow.gold,
    glowMagic: fantasyMasterColors.effects.glow.magic,
  },
};

// * Dark theme mapping (Midnight Scriptorium)
const darkTheme: ThemeColors = {
  primary: {
    DEFAULT: fantasyMasterColors.attributes.swiftness.light,
    text: fantasyMasterColors.ui.parchment['100'],
    textInverse: fantasyMasterColors.ui.obsidian['900'],
    background: fantasyMasterColors.ui.obsidian['400'],
    backgroundAlt: fantasyMasterColors.ui.obsidian['500'],
    border: fantasyMasterColors.ui.metals.gold.dark,
    borderLight: fantasyMasterColors.ui.metals.gold.tarnished,
    hover: fantasyMasterColors.attributes.swiftness.soft,
    pressed: fantasyMasterColors.attributes.swiftness.medium,
  },
  secondary: {
    DEFAULT: fantasyMasterColors.ui.metals.silver.tarnished,
    text: fantasyMasterColors.ui.parchment['200'],
    background: fantasyMasterColors.ui.obsidian['300'],
    border: fantasyMasterColors.ui.metals.silver.dark,
  },
  surface: {
    background: fantasyMasterColors.ui.obsidian['500'],
    backgroundAlt: fantasyMasterColors.ui.obsidian['600'],
    backgroundElevated: fantasyMasterColors.ui.obsidian['300'],
    card: fantasyMasterColors.ui.obsidian['400'],
    cardHover: fantasyMasterColors.ui.obsidian['300'],
    modal: fantasyMasterColors.ui.obsidian['300'],
    overlay: 'rgba(5, 4, 4, 0.7)',
  },
  text: {
    primary: fantasyMasterColors.ui.parchment['100'],
    secondary: fantasyMasterColors.ui.parchment['300'],
    tertiary: fantasyMasterColors.ui.parchment['500'],
    disabled: fantasyMasterColors.ui.parchment['700'],
    inverse: fantasyMasterColors.ui.obsidian['900'],
    link: fantasyMasterColors.attributes.swiftness.light,
    linkHover: fantasyMasterColors.attributes.swiftness.soft,
  },
  semantic: {
    success: fantasyMasterColors.semantic.elixir.soft,
    successBackground: fantasyMasterColors.semantic.elixir.shadow,
    successBorder: fantasyMasterColors.semantic.elixir.dark,
    error: fantasyMasterColors.semantic.dragonfire.soft,
    errorBackground: fantasyMasterColors.semantic.dragonfire.shadow,
    errorBorder: fantasyMasterColors.semantic.dragonfire.dark,
    warning: fantasyMasterColors.semantic.sunburst.soft,
    warningBackground: fantasyMasterColors.semantic.sunburst.shadow,
    warningBorder: fantasyMasterColors.semantic.sunburst.dark,
    info: fantasyMasterColors.semantic.mystic.soft,
    infoBackground: fantasyMasterColors.semantic.mystic.shadow,
    infoBorder: fantasyMasterColors.semantic.mystic.dark,
  },
  button: {
    primary: fantasyMasterColors.attributes.swiftness.light,
    primaryText: fantasyMasterColors.ui.obsidian['900'],
    primaryHover: fantasyMasterColors.attributes.swiftness.soft,
    primaryPressed: fantasyMasterColors.attributes.swiftness.medium,
    secondary: fantasyMasterColors.ui.metals.silver.tarnished,
    secondaryText: fantasyMasterColors.ui.parchment['100'],
    secondaryHover: fantasyMasterColors.ui.metals.silver.dark,
    secondaryPressed: fantasyMasterColors.ui.metals.silver.shadow,
    danger: fantasyMasterColors.semantic.dragonfire.soft,
    dangerText: fantasyMasterColors.ui.parchment['100'],
    dangerHover: fantasyMasterColors.semantic.dragonfire.medium,
    dangerPressed: fantasyMasterColors.semantic.dragonfire.strong,
    disabled: fantasyMasterColors.ui.obsidian['700'],
    disabledText: fantasyMasterColors.ui.parchment['700'],
  },
  accent: {
    might: fantasyMasterColors.attributes.might.light,
    swiftness: fantasyMasterColors.attributes.swiftness.light,
    vitality: fantasyMasterColors.attributes.vitality.light,
    finesse: fantasyMasterColors.attributes.finesse.light,
  },
  metal: {
    gold: fantasyMasterColors.ui.metals.gold.bright,
    goldDark: fantasyMasterColors.ui.metals.gold.tarnished,
    silver: fantasyMasterColors.ui.metals.silver.bright,
    silverDark: fantasyMasterColors.ui.metals.silver.tarnished,
    bronze: fantasyMasterColors.ui.metals.bronze.light,
    copper: fantasyMasterColors.ui.metals.copper.light,
  },
  elements: {
    // * Lighter versions for dark mode visibility
    character: fantasyMasterColors.classes.warrior['300'],
    location: fantasyMasterColors.attributes.vitality.light,
    item: fantasyMasterColors.ui.metals.gold.bright,
    magic: fantasyMasterColors.classes.guardian['300'],
    creature: fantasyMasterColors.classes.hunter['300'],
    culture: fantasyMasterColors.attributes.finesse.light,
    organization: fantasyMasterColors.classes.explorer['300'],
    religion: fantasyMasterColors.ui.metals.silver.bright,
    technology: fantasyMasterColors.ui.metals.copper.light,
    history: fantasyMasterColors.ui.metals.bronze.light,
    language: fantasyMasterColors.attributes.swiftness.light,
  },
  effects: {
    shadow: fantasyMasterColors.effects.shadow.deep,
    shadowMedium: fantasyMasterColors.effects.shadow.strong,
    shadowStrong: fantasyMasterColors.effects.shadow.medium,
    glow: fantasyMasterColors.effects.glow.silver,
    glowGold: fantasyMasterColors.effects.glow.gold,
    glowMagic: fantasyMasterColors.effects.glow.magic,
  },
};

// * Shared spacing and typography
const sharedThemeValues = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
  typography: {
    fontFamily: fontFamilies,
    fontSize: fontSizes,
    fontWeight: fontWeights,
    lineHeight: lineHeights,
    letterSpacing: letterSpacing,
    textStyles: textStyles,
  },
};

// * Theme context interface
interface ThemeContextValue {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isLoading: boolean;
}

// * Create theme context
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// * Storage key for theme persistence
const THEME_STORAGE_KEY = '@FantasyWritingApp:theme';

// * ThemeProvider component
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);

  // * Load saved theme preference from AsyncStorage
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeMode(savedTheme as ThemeMode);
        }
      } catch (error) {
        // ! Failed to load theme preference
        console.error('Failed to load theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  // * Save theme preference to AsyncStorage
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(THEME_STORAGE_KEY, themeMode).catch((error) => {
        // ! Failed to save theme preference
        console.error('Failed to save theme preference:', error);
      });
    }
  }, [themeMode, isLoading]);

  // * Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(() => {
      // * Trigger re-render when system theme changes
      // * The theme will update automatically via useColorScheme hook
    });

    return () => subscription?.remove();
  }, []);

  // * Determine actual theme based on mode
  const actualTheme = useMemo((): 'light' | 'dark' => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode as 'light' | 'dark';
  }, [themeMode, systemColorScheme]);

  // * Create theme object
  const theme = useMemo((): Theme => {
    const colors = actualTheme === 'dark' ? darkTheme : lightTheme;
    
    return {
      mode: actualTheme,
      colors,
      ...sharedThemeValues,
    };
  }, [actualTheme]);

  // * Toggle theme function
  const toggleTheme = () => {
    setThemeMode((current) => {
      if (current === 'light') return 'dark';
      if (current === 'dark') return 'system';
      return 'light';
    });
  };

  const contextValue = useMemo(
    () => ({
      theme,
      themeMode,
      setThemeMode,
      toggleTheme,
      isLoading,
    }),
    [theme, themeMode, isLoading]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// * Custom hook to use theme
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// * Export theme types for TypeScript
export type { Theme, ThemeColors };
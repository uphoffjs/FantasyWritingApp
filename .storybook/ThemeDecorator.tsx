import React, { useEffect } from 'react';
import { useDarkMode } from 'storybook-dark-mode';

// * Theme provider decorator for Storybook
export const ThemeDecorator = (Story: any) => {
  const isDarkMode = useDarkMode();

  useEffect(() => {
    // * Apply theme to document root for CSS variables
    const root = document.documentElement;
    
    if (isDarkMode) {
      // * Dark theme colors and settings
      root.setAttribute('data-theme', 'dark');
      root.style.setProperty('--color-background-primary', '#1a202c');
      root.style.setProperty('--color-background-secondary', '#2d3748');
      root.style.setProperty('--color-background-tertiary', '#4a5568');
      root.style.setProperty('--color-background-paper', '#243142');
      root.style.setProperty('--color-text-primary', '#f7fafc');
      root.style.setProperty('--color-text-secondary', '#e2e8f0');
      root.style.setProperty('--color-text-tertiary', '#cbd5e0');
      root.style.setProperty('--color-text-disabled', '#718096');
      root.style.setProperty('--color-border-default', '#4a5568');
      root.style.setProperty('--color-border-focus', '#55b59b');
      root.style.setProperty('--color-border-error', '#fc8181');
      
      // * Primary colors for dark theme
      root.style.setProperty('--color-primary-50', '#1a3d33');
      root.style.setProperty('--color-primary-100', '#1f4a3d');
      root.style.setProperty('--color-primary-200', '#255747');
      root.style.setProperty('--color-primary-300', '#2a6451');
      root.style.setProperty('--color-primary-400', '#30715b');
      root.style.setProperty('--color-primary-500', '#2da888');
      root.style.setProperty('--color-primary-600', '#3fb896');
      root.style.setProperty('--color-primary-700', '#51c8a4');
      root.style.setProperty('--color-primary-800', '#63d8b2');
      root.style.setProperty('--color-primary-900', '#75e8c0');
    } else {
      // * Light theme colors and settings
      root.setAttribute('data-theme', 'light');
      root.style.setProperty('--color-background-primary', '#ffffff');
      root.style.setProperty('--color-background-secondary', '#f5f7fa');
      root.style.setProperty('--color-background-tertiary', '#e8ebf0');
      root.style.setProperty('--color-background-paper', '#fafbfc');
      root.style.setProperty('--color-text-primary', '#1a202c');
      root.style.setProperty('--color-text-secondary', '#4a5568');
      root.style.setProperty('--color-text-tertiary', '#718096');
      root.style.setProperty('--color-text-disabled', '#cbd5e0');
      root.style.setProperty('--color-border-default', '#e2e8f0');
      root.style.setProperty('--color-border-focus', '#2da888');
      root.style.setProperty('--color-border-error', '#f44336');
      
      // * Primary colors for light theme
      root.style.setProperty('--color-primary-50', '#e8f4f1');
      root.style.setProperty('--color-primary-100', '#c5e4dc');
      root.style.setProperty('--color-primary-200', '#9fd3c5');
      root.style.setProperty('--color-primary-300', '#76c2ad');
      root.style.setProperty('--color-primary-400', '#55b59b');
      root.style.setProperty('--color-primary-500', '#2da888');
      root.style.setProperty('--color-primary-600', '#239a7c');
      root.style.setProperty('--color-primary-700', '#008970');
      root.style.setProperty('--color-primary-800', '#007862');
      root.style.setProperty('--color-primary-900', '#005d48');
    }

    // * Common colors that don't change between themes
    root.style.setProperty('--color-success', '#4caf50');
    root.style.setProperty('--color-warning', '#ff9800');
    root.style.setProperty('--color-error', '#f44336');
    root.style.setProperty('--color-info', '#2196f3');
    
    // * Typography settings
    root.style.setProperty('--font-family-heading', 'Cinzel, serif');
    root.style.setProperty('--font-family-body', 'Crimson Text, serif');
    root.style.setProperty('--font-family-ui', 'system-ui, -apple-system, sans-serif');
    root.style.setProperty('--font-family-mono', 'Fira Code, monospace');
    
    // * Spacing scale
    root.style.setProperty('--space-1', '0.25rem');
    root.style.setProperty('--space-2', '0.5rem');
    root.style.setProperty('--space-3', '0.75rem');
    root.style.setProperty('--space-4', '1rem');
    root.style.setProperty('--space-5', '1.5rem');
    root.style.setProperty('--space-6', '2rem');
    root.style.setProperty('--space-8', '3rem');
    root.style.setProperty('--space-10', '4rem');
    
    // * Border radius
    root.style.setProperty('--radius-sm', '0.25rem');
    root.style.setProperty('--radius-md', '0.5rem');
    root.style.setProperty('--radius-lg', '0.75rem');
    root.style.setProperty('--radius-xl', '1rem');
    root.style.setProperty('--radius-full', '9999px');
    
    // * Shadows
    if (isDarkMode) {
      root.style.setProperty('--shadow-sm', '0 1px 2px 0 rgba(0, 0, 0, 0.5)');
      root.style.setProperty('--shadow-md', '0 4px 6px -1px rgba(0, 0, 0, 0.5)');
      root.style.setProperty('--shadow-lg', '0 10px 15px -3px rgba(0, 0, 0, 0.5)');
      root.style.setProperty('--shadow-xl', '0 20px 25px -5px rgba(0, 0, 0, 0.5)');
    } else {
      root.style.setProperty('--shadow-sm', '0 1px 2px 0 rgba(0, 0, 0, 0.05)');
      root.style.setProperty('--shadow-md', '0 4px 6px -1px rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--shadow-lg', '0 10px 15px -3px rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--shadow-xl', '0 20px 25px -5px rgba(0, 0, 0, 0.1)');
    }
    
    // * Animation durations
    root.style.setProperty('--duration-instant', '100ms');
    root.style.setProperty('--duration-quick', '200ms');
    root.style.setProperty('--duration-normal', '300ms');
    root.style.setProperty('--duration-slow', '500ms');
    
  }, [isDarkMode]);

  // * Create theme context value
  const theme = {
    mode: isDarkMode ? 'dark' : 'light',
    colors: {
      background: {
        primary: `var(--color-background-primary)`,
        secondary: `var(--color-background-secondary)`,
        tertiary: `var(--color-background-tertiary)`,
        paper: `var(--color-background-paper)`,
      },
      text: {
        primary: `var(--color-text-primary)`,
        secondary: `var(--color-text-secondary)`,
        tertiary: `var(--color-text-tertiary)`,
        disabled: `var(--color-text-disabled)`,
      },
      border: {
        default: `var(--color-border-default)`,
        focus: `var(--color-border-focus)`,
        error: `var(--color-border-error)`,
      },
      primary: {
        50: `var(--color-primary-50)`,
        100: `var(--color-primary-100)`,
        200: `var(--color-primary-200)`,
        300: `var(--color-primary-300)`,
        400: `var(--color-primary-400)`,
        500: `var(--color-primary-500)`,
        600: `var(--color-primary-600)`,
        700: `var(--color-primary-700)`,
        800: `var(--color-primary-800)`,
        900: `var(--color-primary-900)`,
      },
    },
    spacing: {
      xs: `var(--space-1)`,
      sm: `var(--space-2)`,
      md: `var(--space-4)`,
      lg: `var(--space-6)`,
      xl: `var(--space-8)`,
    },
    typography: {
      fontFamily: {
        heading: `var(--font-family-heading)`,
        body: `var(--font-family-body)`,
        ui: `var(--font-family-ui)`,
        mono: `var(--font-family-mono)`,
      },
    },
  };

  return (
    <div 
      style={{
        backgroundColor: theme.colors.background.primary,
        color: theme.colors.text.primary,
        minHeight: '100vh',
        transition: 'all var(--duration-normal) ease-in-out',
      }}
    >
      <Story theme={theme} />
    </div>
  );
};

export default ThemeDecorator;
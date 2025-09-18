/**
 * Style Dictionary Configuration
 * Transforms design tokens into platform-specific formats
 */

const { tokens } = require('./src/design-tokens/tokens');

// * Helper function to flatten nested color objects for CSS variables
function flattenColors(obj, prefix = '') {
  let result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}-${key}` : key;
    
    if (typeof value === 'string') {
      result[newKey] = { value };
    } else if (typeof value === 'object' && value !== null) {
      // * Handle DEFAULT key specially
      if (value.DEFAULT) {
        result[newKey] = { value: value.DEFAULT };
      }
      // * Recursively flatten nested objects
      const nested = flattenColors(value, newKey);
      result = { ...result, ...nested };
    }
  }
  
  return result;
}

// * Transform tokens into style-dictionary format
const styleDictionaryTokens = {
  color: flattenColors(tokens.color),
  spacing: Object.entries(tokens.spacing).reduce((acc, [key, value]) => ({
    ...acc,
    [`spacing-${key}`]: { value }
  }), {}),
  typography: {
    fontFamily: Object.entries(tokens.typography.fontFamily).reduce((acc, [key, value]) => ({
      ...acc,
      [`font-${key}`]: { value: value.join(', ') }
    }), {})
  },
  animation: {
    ...Object.entries(tokens.animation.duration).reduce((acc, [key, value]) => ({
      ...acc,
      [`duration-${key}`]: { value }
    }), {}),
    ...Object.entries(tokens.animation.easing).reduce((acc, [key, value]) => ({
      ...acc,
      [`easing-${key}`]: { value }
    }), {})
  },
  shadow: Object.entries(tokens.shadow).reduce((acc, [key, value]) => ({
    ...acc,
    [`shadow-${key}`]: { value }
  }), {}),
  borderRadius: Object.entries(tokens.borderRadius).reduce((acc, [key, value]) => ({
    ...acc,
    [`radius-${key}`]: { value }
  }), {})
};

module.exports = {
  source: ['src/design-tokens/tokens.js'],
  tokens: styleDictionaryTokens,
  platforms: {
    // * CSS Variables for mockups
    css: {
      transformGroup: 'css',
      buildPath: 'build/css/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables',
        options: {
          outputReferences: true
        }
      }]
    },
    
    // * SCSS for potential Sass usage
    scss: {
      transformGroup: 'scss',
      buildPath: 'build/scss/',
      files: [{
        destination: '_variables.scss',
        format: 'scss/variables',
        options: {
          outputReferences: true
        }
      }]
    },
    
    // * JavaScript ES6 modules for React Native
    js: {
      transformGroup: 'js',
      buildPath: 'build/js/',
      files: [{
        destination: 'tokens.js',
        format: 'javascript/es6',
        options: {
          outputReferences: true
        }
      }]
    },
    
    // * TypeScript definitions
    ts: {
      transformGroup: 'js',
      buildPath: 'build/ts/',
      files: [{
        destination: 'tokens.d.ts',
        format: 'typescript/es6-declarations'
      }]
    },
    
    // * JSON for potential API usage
    json: {
      transformGroup: 'js',
      buildPath: 'build/json/',
      files: [{
        destination: 'tokens.json',
        format: 'json/nested'
      }]
    },
    
    // * Tailwind config export
    tailwind: {
      transformGroup: 'js',
      buildPath: 'build/tailwind/',
      files: [{
        destination: 'colors.js',
        format: 'javascript/module',
        filter: (token) => token.path[0] === 'color',
        options: {
          outputReferences: false
        }
      }]
    }
  }
};
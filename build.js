/**
 * Style Dictionary Build Script
 * Generates CSS variables, Tailwind config, and TypeScript types from design tokens
 */

const StyleDictionary = require('style-dictionary');
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
      Object.entries(value).forEach(([subKey, subValue]) => {
        if (subKey !== 'DEFAULT') {
          if (typeof subValue === 'string') {
            result[`${newKey}-${subKey}`] = { value: subValue };
          } else if (typeof subValue === 'object') {
            const nested = flattenColors({ [subKey]: subValue }, newKey);
            result = { ...result, ...nested };
          }
        }
      });
    }
  }
  
  return result;
}

// * Build the style dictionary
const sd = StyleDictionary.extend({
  tokens: {
    color: flattenColors(tokens.color),
  },
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'build/css/',
      files: [{
        destination: 'tokens.css',
        format: 'css/variables',
        options: {
          outputReferences: false
        }
      }]
    },
    js: {
      transformGroup: 'js',
      buildPath: 'build/js/',
      files: [{
        destination: 'tokens.js',
        format: 'javascript/es6'
      }]
    },
    json: {
      transformGroup: 'js',
      buildPath: 'build/json/',
      files: [{
        destination: 'tokens.json',
        format: 'json/nested'
      }]
    }
  }
});

console.log('Building design tokens...');
sd.buildAllPlatforms();
console.log('\n✅ Design tokens built successfully!\n');
console.log('Generated files:');
console.log('  - build/css/tokens.css (CSS variables for mockups)');
console.log('  - build/js/tokens.js (JavaScript for React)');
console.log('  - build/json/tokens.json (JSON format)');
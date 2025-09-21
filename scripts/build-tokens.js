/**
 * Build Design Tokens
 * Exports tokens to CSS, JavaScript, and JSON formats
 */

const fs = require('fs');
const path = require('path');
const { tokens } = require('../src/design-tokens/tokens');

// * Ensure build directories exist
const buildDirs = ['build', 'build/css', 'build/js', 'build/json'];
buildDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// * Helper function to convert nested object to CSS variables
function objectToCSSVariables(obj, prefix = '') {
  const cssVars = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const varName = prefix ? `${prefix}-${key}` : key;
    
    if (typeof value === 'string') {
      cssVars.push(`  --${varName}: ${value};`);
    } else if (typeof value === 'object' && value !== null) {
      // * Handle DEFAULT key specially
      if (value.DEFAULT) {
        cssVars.push(`  --${varName}: ${value.DEFAULT};`);
      }
      // * Recursively process nested objects
      Object.entries(value).forEach(([subKey, subValue]) => {
        if (subKey !== 'DEFAULT') {
          if (typeof subValue === 'string') {
            cssVars.push(`  --${varName}-${subKey}: ${subValue};`);
          } else if (typeof subValue === 'object') {
            cssVars.push(...objectToCSSVariables({ [subKey]: subValue }, varName));
          }
        }
      });
    }
  }
  
  return cssVars;
}

// * Generate CSS Variables file
console.log('Building CSS variables...');
const cssContent = `:root {
  /* * Fantasy Master Design Tokens */
  /* * Generated from unified token system */
  
  /* * Attribute Colors */
${objectToCSSVariables(tokens.color.attribute, 'attribute').join('\n')}
  
  /* * Class Colors */
${objectToCSSVariables(tokens.color.class, 'class').join('\n')}
  
  /* * UI Colors - Parchment */
${objectToCSSVariables(tokens.color.ui.parchment, 'parchment').join('\n')}
  
  /* * UI Colors - Obsidian */
${objectToCSSVariables(tokens.color.ui.obsidian, 'obsidian').join('\n')}
  
  /* * UI Colors - Metals */
${objectToCSSVariables(tokens.color.ui.metals, 'metals').join('\n')}
  
  /* * UI Colors - Ink */
${objectToCSSVariables(tokens.color.ui.ink.primary, 'ink-primary').join('\n')}
${objectToCSSVariables(tokens.color.ui.ink.secondary, 'ink-secondary').join('\n')}
  
  /* * Semantic Colors */
${objectToCSSVariables(tokens.color.semantic, 'semantic').join('\n')}
  
  /* * Element Type Colors */
${objectToCSSVariables(tokens.color.element, 'element').join('\n')}
  
  /* * Effect Colors */
${objectToCSSVariables(tokens.color.effect.glow, 'glow').join('\n')}
${objectToCSSVariables(tokens.color.effect.shadow, 'shadow').join('\n')}
  
  /* * Spacing */
${Object.entries(tokens.spacing).map(([key, value]) => `  --spacing-${key}: ${value};`).join('\n')}
  
  /* * Animation */
${Object.entries(tokens.animation.duration).map(([key, value]) => `  --duration-${key}: ${value};`).join('\n')}
${Object.entries(tokens.animation.easing).map(([key, value]) => `  --easing-${key}: ${value};`).join('\n')}
  
  /* * Shadows */
${Object.entries(tokens.shadow).map(([key, value]) => `  --shadow-${key}: ${value};`).join('\n')}
  
  /* * Border Radius */
${Object.entries(tokens.borderRadius).map(([key, value]) => `  --radius-${key}: ${value};`).join('\n')}
}`;

fs.writeFileSync(path.join('build', 'css', 'tokens.css'), cssContent);
console.log('✅ CSS variables generated: build/css/tokens.css');

// * Generate JavaScript module
console.log('Building JavaScript module...');
const jsContent = `/**
 * Fantasy Master Design Tokens - JavaScript Export
 * Auto-generated from unified token system
 */

export const tokens = ${JSON.stringify(tokens, null, 2)};

export default tokens;`;

fs.writeFileSync(path.join('build', 'js', 'tokens.js'), jsContent);
console.log('✅ JavaScript module generated: build/js/tokens.js');

// * Generate JSON file
console.log('Building JSON export...');
fs.writeFileSync(
  path.join('build', 'json', 'tokens.json'), 
  JSON.stringify(tokens, null, 2)
);
console.log('✅ JSON export generated: build/json/tokens.json');

// * Generate Tailwind colors config
console.log('Building Tailwind config...');
const tailwindColors = {};

// * Helper to extract just the color values for Tailwind
function extractColors(obj, prefix = '') {
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = value;
    } else if (typeof value === 'object' && value !== null) {
      result[key] = extractColors(value);
    }
  }
  
  return result;
}

const tailwindConfig = `/**
 * Tailwind Color Configuration
 * Auto-generated from Fantasy Master Design Tokens
 */

module.exports = {
  attributes: ${JSON.stringify(extractColors(tokens.color.attribute), null, 2)},
  classes: ${JSON.stringify(extractColors(tokens.color.class), null, 2)},
  ui: ${JSON.stringify(extractColors(tokens.color.ui), null, 2)},
  semantic: ${JSON.stringify(extractColors(tokens.color.semantic), null, 2)},
  elements: ${JSON.stringify(extractColors(tokens.color.element), null, 2)},
};`;

fs.writeFileSync(path.join('build', 'js', 'tailwind-colors.js'), tailwindConfig);
console.log('✅ Tailwind config generated: build/js/tailwind-colors.js');

console.log('\n🎉 All design tokens built successfully!');
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// * Better Comments patterns to apply
const patterns = [
  // Basic comment enhancements
  { from: /^(\s*)\/\/ ([A-Z][a-z]+ [a-z]+)/gm, to: '$1// * $2' },
  { from: /^(\s*)\/\/ (Auth|Sync|Profile|Mode|Internal|Initial)/gm, to: '$1// * $2' },
  
  // Security warnings
  { from: /^(\s*)\/\/ (.*(?:security|password|token|auth|login|credential|sensitive).*)/gmi, to: '$1// ! SECURITY: $2' },
  { from: /localStorage\.getItem/g, to: '// ! SECURITY: Using localStorage\n      localStorage.getItem' },
  
  // Performance notes
  { from: /^(\s*)\/\/ (.*(?:performance|optimization|cache|debounce|throttle|lazy).*)/gmi, to: '$1// ! PERFORMANCE: $2' },
  
  // TODOs
  { from: /^(\s*)\/\/ (.*(?:todo|fixme|hack|temp|temporary).*)/gmi, to: '$1// TODO: $2' },
  { from: /^(\s*)\/\/ (.*(?:should|need to|must|fix|improve|refactor).*)/gmi, to: '$1// TODO: $2' },
  
  // Questions/Design decisions
  { from: /^(\s*)\/\/ (.*\?.*)/gm, to: '$1// ? $2' },
  { from: /^(\s*)\/\/ (.*(?:why|how|what if|consider|review).*)/gmi, to: '$1// ? $2' },
  
  // Deprecated code
  { from: /^(\s*)\/\/ (.*(?:deprecated|legacy|old|unused|obsolete).*)/gmi, to: '$1// // DEPRECATED: $2' },
  
  // Important highlights
  { from: /^(\s*)\/\/ (Variants|Sizes|States|Text styles|Platform|Web|iOS|Android)/gm, to: '$1// * $2' },
  { from: /^(\s*)\/\/ (Component|Helper|Utility|Service|Store|Hook)/gm, to: '$1// * $2' },
];

// * Hardcoded values that need design tokens
const hardcodedPatterns = [
  { from: /#[0-9A-Fa-f]{6}/g, replacement: '// ! HARDCODED: Should use design tokens\n      $&' },
  { from: /\b\d+px\b/g, replacement: '// ! HARDCODED: Should use design tokens\n      $&' },
];

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Apply Better Comments patterns
    patterns.forEach(pattern => {
      const newContent = content.replace(pattern.from, pattern.to);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    // Apply hardcoded value warnings (more selective)
    if (filePath.includes('components/') || filePath.includes('styles')) {
      hardcodedPatterns.forEach(pattern => {
        if (content.includes('color') || content.includes('backgroundColor')) {
          const newContent = content.replace(pattern.from, pattern.replacement);
          if (newContent !== content) {
            content = newContent;
            modified = true;
          }
        }
      });
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let updatedCount = 0;
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other irrelevant directories
        if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(item)) {
          walkDir(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          if (updateFile(fullPath)) {
            updatedCount++;
          }
        }
      }
    });
  }
  
  walkDir(dirPath);
  return updatedCount;
}

// * Main execution
const srcDir = path.join(__dirname, '..', 'src');
const cypressDir = path.join(__dirname, '..', 'cypress');

console.log('🚀 Starting Better Comments update...\n');

console.log('📁 Processing src/ directory...');
const srcUpdated = processDirectory(srcDir);

console.log('\n📁 Processing cypress/ directory...');
const cypressUpdated = processDirectory(cypressDir);

console.log(`\n✨ Completed! Updated ${srcUpdated + cypressUpdated} files total.`);
console.log(`   - src/: ${srcUpdated} files`);
console.log(`   - cypress/: ${cypressUpdated} files`);
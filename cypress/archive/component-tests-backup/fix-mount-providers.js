#!/usr/bin/env node

/**
 * * Script to fix cy.mount() calls to use cy.mountWithProviders()
 * * This ensures all components have access to necessary providers like ThemeProvider
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// * Find all .cy.tsx files
const testFiles = glob.sync('cypress/component/**/*.cy.tsx');

let totalFixed = 0;
let filesUpdated = 0;

testFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;

  // * Replace cy.mount( with cy.mountWithProviders(
  // * But be careful not to replace cy.mountWithProviders( that already exist
  content = content.replace(/cy\.mount\(/g, (match, offset) => {
    // * Check if it's already mountWithProviders
    const before = content.substring(Math.max(0, offset - 15), offset);
    if (before.includes('mountWithProviders')) {
      return match;
    }
    totalFixed++;
    return 'cy.mountWithProviders(';
  });

  // * Only write if content changed
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    filesUpdated++;
    console.log(`✅ Fixed: ${file}`);
  }
});

console.log('\n📊 Summary:');
console.log(`Files updated: ${filesUpdated}`);
console.log(`Mount calls fixed: ${totalFixed}`);
console.log('\n✨ All cy.mount() calls have been updated to cy.mountWithProviders()');
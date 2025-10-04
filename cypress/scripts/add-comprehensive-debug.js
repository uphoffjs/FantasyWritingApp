#!/usr/bin/env node

/**
 * Script to add cy.comprehensiveDebug() to beforeEach hooks in Cypress test files
 * Following Cypress best practices for mandatory debug setup
 */

const fs = require('fs');
const path = require('path');

const files = [
  'cypress/e2e/auth/authentication.cy.ts',
  'cypress/e2e/auth/user-registration.cy.js',
  'cypress/e2e/characters/character-editor.cy.ts',
  'cypress/e2e/characters/character-full-workflow.cy.ts',
  'cypress/e2e/elements/character-creation.cy.js',
  'cypress/e2e/homepage.cy.ts',
  'cypress/e2e/integration/command-verification.cy.ts',
  'cypress/e2e/navigation/navigation.cy.ts',
  'cypress/e2e/scenes/scene-editor.cy.ts',
  'cypress/e2e/search/search-filter-flows.cy.js',
  'cypress/e2e/smoke/basic-functionality.cy.ts',
  'cypress/e2e/stories/story-crud.cy.ts',
  'cypress/e2e/stories/story-scene-management.cy.js',
  'cypress/e2e/user-journeys/auth-flow.cy.ts',
  'cypress/e2e/user-journeys/project-element-flow.cy.ts',
];

function addComprehensiveDebug(filePath) {
  const absolutePath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(absolutePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(absolutePath, 'utf8');

  // Check if cy.comprehensiveDebug() already exists
  if (content.includes('cy.comprehensiveDebug()')) {
    console.log(`✅ Already has cy.comprehensiveDebug(): ${filePath}`);
    return true;
  }

  // Pattern to find beforeEach with function() syntax
  const beforeEachPattern1 = /beforeEach\(function\s*\(\)\s*\{/g;
  // Pattern to find beforeEach with arrow function
  const beforeEachPattern2 = /beforeEach\(\s*\(\)\s*=>\s*\{/g;
  // Pattern to find beforeEach with async
  const beforeEachPattern3 = /beforeEach\(async\s*\(\)\s*=>\s*\{/g;
  const beforeEachPattern4 = /beforeEach\(async\s+function\s*\(\)\s*\{/g;

  let modified = false;

  // Add cy.comprehensiveDebug() at the beginning of each beforeEach
  const addDebugCommand = (match) => {
    return match + '\n    // ! MANDATORY: Comprehensive debug setup\n    cy.comprehensiveDebug();\n';
  };

  if (beforeEachPattern1.test(content)) {
    content = content.replace(beforeEachPattern1, addDebugCommand);
    modified = true;
  }

  if (beforeEachPattern2.test(content)) {
    content = content.replace(beforeEachPattern2, addDebugCommand);
    modified = true;
  }

  if (beforeEachPattern3.test(content)) {
    content = content.replace(beforeEachPattern3, addDebugCommand);
    modified = true;
  }

  if (beforeEachPattern4.test(content)) {
    content = content.replace(beforeEachPattern4, addDebugCommand);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(absolutePath, content, 'utf8');
    console.log(`✅ Added cy.comprehensiveDebug() to: ${filePath}`);
    return true;
  } else {
    console.log(`⚠️  No beforeEach found or couldn't modify: ${filePath}`);
    return false;
  }
}

console.log('Adding cy.comprehensiveDebug() to Cypress test files...\n');

let successCount = 0;
let failCount = 0;

files.forEach(file => {
  if (addComprehensiveDebug(file)) {
    successCount++;
  } else {
    failCount++;
  }
});

console.log('\n========================================');
console.log(`✅ Successfully updated: ${successCount} files`);
if (failCount > 0) {
  console.log(`❌ Failed or skipped: ${failCount} files`);
}
console.log('========================================');
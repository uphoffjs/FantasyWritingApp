#!/usr/bin/env node

/**
 * Script to update Cypress E2E tests to use session-based authentication
 * This updates test files to use cy.apiLogin() instead of setupAuth()
 * and replaces data-testid with data-cy selectors
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// * Files that need to be updated according to CYPRESS_BEST_PRACTICES_TODO.md
const filesToUpdate = [
  'cypress/e2e/homepage.cy.ts',
  'cypress/e2e/integration/command-verification.cy.ts',
  'cypress/e2e/login-navigation.cy.ts',
  'cypress/e2e/navigation/navigation.cy.ts',
  'cypress/e2e/scenes/scene-editor.cy.ts',
  'cypress/e2e/smoke/basic-functionality.cy.ts',
  'cypress/e2e/stories/story-crud.cy.ts',
  'cypress/e2e/sync/sync-services.cy.ts',
  'cypress/e2e/responsive/viewport-testing-example.cy.ts',
  'cypress/e2e/performance/performance-monitoring-example.cy.ts',
  'cypress/e2e/user-journeys/auth-flow.cy.ts',
  'cypress/e2e/user-journeys/project-element-flow.cy.ts'
];

function updateFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;

  // * Remove setupAuth import if exists
  content = content.replace(/import\s+{\s*setupAuth[^}]*}\s+from\s+['"][^'"]+['"]\n?/g, '');

  // * Replace setupAuth() calls with cy.apiLogin()
  content = content.replace(/setupAuth\(\)/g, "cy.apiLogin('test@example.com', 'testpassword123')");
  content = content.replace(/setupAuth\([^)]+\)/g, "cy.apiLogin('test@example.com', 'testpassword123')");

  // * Add comment about session-based auth if setupAuth was replaced
  if (content.includes('cy.apiLogin')) {
    content = content.replace(
      /cy\.setupTestEnvironment\(\)\n\s*cy\.apiLogin/g,
      'cy.setupTestEnvironment()\n    // * Use session-based API login for faster authentication\n    cy.apiLogin'
    );
  }

  // * Replace data-testid with data-cy
  content = content.replace(/\[data-testid=/g, '[data-cy=');
  content = content.replace(/data-testid="/g, 'data-cy="');

  // * Check if file was modified
  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    return true;
  } else {
    console.log(`⏭️  No changes needed: ${filePath}`);
    return false;
  }
}

console.log('🔄 Updating Cypress E2E tests to use session-based authentication...\n');

let updatedCount = 0;
let skippedCount = 0;

filesToUpdate.forEach(file => {
  if (updateFile(file)) {
    updatedCount++;
  } else {
    skippedCount++;
  }
});

console.log('\n📊 Summary:');
console.log(`   ✅ Updated: ${updatedCount} files`);
console.log(`   ⏭️  Skipped: ${skippedCount} files`);
console.log('\n✨ Session update complete!');
console.log('\n📝 Next steps:');
console.log('   1. Run tests to verify they still pass');
console.log('   2. Update CYPRESS_BEST_PRACTICES_TODO.md to mark Phase 3 complete');
console.log('   3. Commit changes');
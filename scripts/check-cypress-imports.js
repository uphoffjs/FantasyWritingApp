#!/usr/bin/env node

/**
 * check-cypress-imports.js
 * * Pre-commit hook script to check Cypress test files for import issues
 * ! Specifically checks for common Cypress test import problems
 */

const fs = require('fs');

// * Files passed by lint-staged
const files = process.argv.slice(2);

const errors = [];
const warnings = [];

// * Cypress-specific import patterns to check
const cypressPatterns = {
  // * Check for importing mountWithProviders (should use cy.mountWithProviders)
  importMountWithProviders: /import\s+.*mountWithProviders.*\s+from/,
  // * Check for importing from test-data with wrong exports
  wrongTestDataExport: /import\s+\{?\s*(mockElement|createMockElements)\s*\}?\s+from\s+['"].*test-data/,
  // * Check for factory imports with capital F
  capitalFactory: /import\s+\{?\s*([A-Z]\w*Factory)\s*\}?\s+from\s+['"].*factories/,
  // * Check for cy.stub() at module level (should be in beforeEach)
  moduleStub: /^(const|let|var)\s+\w+\s*=\s*cy\.stub\(\)/m,
  // * Check for missing data-cy selectors
  missingDataCy: /cy\.(get|find|contains)\s*\(\s*['"][^'"[]*['"]\s*\)/,
  // * Check for incorrect relative imports
  incorrectRelativePath: /from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\//, // Too many ../
};

// * Known components that don't exist (to check for skip)
const missingComponents = [
  'ElementFooter', 'ElementImages', 'ElementRelationships', 'ElementTags',
  'SpeciesSelector', 'SpeciesDropdown', 'QuickCreateForm',
  'Header', 'MobileMenuDrawer', 'MobileBreadcrumbs', 'MobileBackButton',
  'MobileNavigation', 'PerformanceDashboard', 'PerformanceProfiler',
  'SyncIndicator', 'CloudSaveButton', 'OfflineBanner', 'ConflictResolver',
  'ImageUpload', 'MarkdownExportModal', 'RichTextEditor', 'TagMultiSelect',
  'Toast', 'EmailVerificationBanner', 'MigrationPrompt', 'AccountMenu'
];

// * Check each Cypress test file
files.forEach(file => {
  if (!fs.existsSync(file)) {
    return;
  }

  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // * Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('/*')) {
      return;
    }

    // * Check for importing mountWithProviders
    if (cypressPatterns.importMountWithProviders.test(line)) {
      errors.push({
        file,
        line: index + 1,
        issue: 'Do not import mountWithProviders, use cy.mountWithProviders() instead',
        text: line.trim()
      });
    }

    // * Check for capital Factory imports
    const factoryMatch = line.match(cypressPatterns.capitalFactory);
    if (factoryMatch) {
      const correctName = factoryMatch[1].charAt(0).toLowerCase() + factoryMatch[1].slice(1);
      errors.push({
        file,
        line: index + 1,
        issue: `Use lowercase factory name: ${correctName} instead of ${factoryMatch[1]}`,
        text: line.trim()
      });
    }

    // * Check for cy.stub() at module level
    if (cypressPatterns.moduleStub.test(line)) {
      errors.push({
        file,
        line: index + 1,
        issue: 'Do not use cy.stub() at module level, move it inside beforeEach()',
        text: line.trim()
      });
    }

    // * Check for missing data-cy selectors (warning only)
    if (cypressPatterns.missingDataCy.test(line)) {
      const hasDataCy = line.includes('[data-cy=') || line.includes('data-cy="');
      const hasDataTest = line.includes('[data-test') || line.includes('data-test');
      const isGetByDataCy = line.includes('getByDataCy');

      if (!hasDataCy && !hasDataTest && !isGetByDataCy) {
        warnings.push({
          file,
          line: index + 1,
          issue: 'Consider using data-cy selector instead of string selector',
          text: line.trim()
        });
      }
    }

    // * Check for too many ../
    if (cypressPatterns.incorrectRelativePath.test(line)) {
      errors.push({
        file,
        line: index + 1,
        issue: 'Import path has too many "../" - check if path is correct',
        text: line.trim()
      });
    }

    // * Check for missing components that should be skipped
    missingComponents.forEach(component => {
      const importPattern = new RegExp(`import.*${component}.*from`);
      if (importPattern.test(line) && !line.trim().startsWith('//')) {
        // * Check if the describe block is skipped
        const hasSkip = content.includes(`describe.skip`) || content.includes(`it.skip`);
        if (!hasSkip) {
          errors.push({
            file,
            line: index + 1,
            issue: `Component "${component}" does not exist - use describe.skip() or comment out import`,
            text: line.trim()
          });
        }
      }
    });
  });

  // * Check for test structure issues
  if (!content.includes('beforeEach')) {
    warnings.push({
      file,
      line: 0,
      issue: 'Consider adding beforeEach() for test setup',
      text: 'Missing beforeEach block'
    });
  }

  if (content.includes('cy.wait(') && content.match(/cy\.wait\(\d+\)/)) {
    errors.push({
      file,
      line: 0,
      issue: 'Avoid arbitrary waits like cy.wait(3000) - use proper assertions instead',
      text: 'Found cy.wait() with fixed time'
    });
  }
});

// * Report errors and warnings
if (errors.length > 0) {
  console.error('\n❌ Cypress Import Issues Found:\n');
  errors.forEach(error => {
    console.error(`📁 ${error.file}:${error.line}`);
    console.error(`   Issue: ${error.issue}`);
    if (error.text) {
      console.error(`   Line: ${error.text}`);
    }
    console.error('');
  });
  console.error(`\n❌ Total errors: ${errors.length}\n`);
  console.error('💡 Fix these issues before committing.\n');
}

if (warnings.length > 0) {
  console.warn('\n⚠️  Cypress Test Warnings:\n');
  warnings.forEach(warning => {
    console.warn(`📁 ${warning.file}:${warning.line}`);
    console.warn(`   Warning: ${warning.issue}`);
    if (warning.text) {
      console.warn(`   Line: ${warning.text}`);
    }
    console.warn('');
  });
  console.warn(`\n⚠️  Total warnings: ${warnings.length} (not blocking commit)\n`);
}

if (errors.length > 0) {
  process.exit(1);
} else if (warnings.length === 0) {
  console.log('✅ Cypress import checks passed');
}
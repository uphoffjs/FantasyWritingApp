#!/usr/bin/env node

/**
 * Fix systematic syntax errors caused by over-aggressive pattern replacement
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();

function fixSyntaxErrors(content, filePath) {
  console.log(`Fixing syntax errors in ${filePath}`);

  // 1. Fix double semicolons
  content = content.replace(/;;\s*$/gm, ';');
  content = content.replace(/;;/g, ';');

  // 2. Fix array item semicolons (should be commas)
  content = content.replace(/\)\s*;\s*,/g, '),');
  content = content.replace(/}\s*;\s*,/g, '},');

  // 3. Fix function calls ending with semicolon comma
  content = content.replace(/\(\)\s*;\s*,/g, '(),');

  // 4. Fix remaining [data-cy*="select"] artifacts
  content = content.replace(/\[data-cy\*="select"\]/g, 'select');
  content = content.replace(/\[data-cy\*="button"\]/g, 'button');

  // 5. Fix broken object property definitions
  content = content.replace(/(\w+):\s*;\s*,/g, '$1: undefined,');

  // 6. Fix malformed function parameter patterns
  content = content.replace(/\(\s*;\s*\)/g, '()');

  // 7. Fix empty cy.then blocks
  content = content.replace(/cy\.then\(\(\) => \{\s*;\s*\}\);?/g, '');

  // 8. Fix malformed expect statements
  content = content.replace(/expect\(\s*\)\./g, 'expect(element).');

  // 9. Fix broken variable declarations
  content = content.replace(/let\s+(\w+)\s*;\s*const\s+\1/g, 'const $1');
  content = content.replace(/const\s+(\w+)\s*;\s*\1\s*=/g, 'const $1 =');

  // 10. Fix misplaced afterEach blocks (remove duplicates)
  const afterEachPattern = /afterEach\(function\(\) \{\s*\/\/ ! Capture debug info if test failed\s*if \(this\.currentTest\.state === 'failed'\) \{\s*cy\.captureFailureDebug\(\);\s*\}\s*\}\);/g;
  const afterEachMatches = content.match(afterEachPattern);
  if (afterEachMatches && afterEachMatches.length > 1) {
    // Keep only the first one, remove duplicates
    let isFirst = true;
    content = content.replace(afterEachPattern, (match) => {
      if (isFirst) {
        isFirst = false;
        return match;
      }
      return '';
    });
  }

  // 11. Fix broken describe block structures
  content = content.replace(/describe\(\s*;\s*\)/g, 'describe("Test", () => {})');

  // 12. Fix broken expect chains
  content = content.replace(/\.should\(\s*;\s*\)/g, '.should("exist")');

  // 13. Fix mock object property syntax
  content = content.replace(/createRace:\s*cy\.stub\(\)\.resolves\([^)]+\)\s*;\s*,/g,
    'createRace: cy.stub().resolves({ id: "newRace", name: "New Race", category: "race-species", completion: 0 }),');

  return content;
}

function processTestFiles() {
  console.log('🔧 Fixing systematic syntax errors in test files...\n');

  // Get all component test files
  function findTestFiles(dir) {
    const files = [];
    const dirents = fs.readdirSync(dir, { withFileTypes: true });

    for (const dirent of dirents) {
      const fullPath = path.join(dir, dirent.name);
      if (dirent.isDirectory()) {
        files.push(...findTestFiles(fullPath));
      } else if (dirent.name.endsWith('.cy.tsx')) {
        files.push(path.relative(PROJECT_ROOT, fullPath));
      }
    }
    return files;
  }

  const testFiles = findTestFiles(path.join(PROJECT_ROOT, 'cypress/component'));

  testFiles.forEach(filePath => {
    const fullPath = path.join(PROJECT_ROOT, filePath);

    if (!fs.existsSync(fullPath)) {
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    content = fixSyntaxErrors(content, filePath);

    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    } else {
      console.log(`⏭️  Skipped: ${filePath} (no changes needed)`);
    }
  });

  console.log('\n✅ Syntax error fixes completed!');
}

if (require.main === module) {
  processTestFiles();
}

module.exports = { fixSyntaxErrors };
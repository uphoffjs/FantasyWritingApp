#!/usr/bin/env node

/**
 * Final syntax cleanup for remaining parsing errors
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();

function finalCleanup(content) {
  // Fix array syntax with semicolon instead of comma at end
  content = content.replace(/}\s*;\s*\]/g, '}]');
  content = content.replace(/\)\s*;\s*\]/g, ')]');

  // Fix syntax errors in array items
  content = content.replace(/ElementFactory\.create\([^)]+\)\s*;\s*,/g,
    (match) => match.replace(');,', '),'));

  // Fix broken semicolon placement
  content = content.replace(/\s*;\s*\)/g, ')');
  content = content.replace(/\s*;\s*]/g, ']');

  // Fix malformed function calls
  content = content.replace(/cy\.stub\(\)\s*;\s*,/g, 'cy.stub(),');

  // Fix broken afterEach placements
  content = content.replace(/afterEach\(function\(\) \{[^}]*\}\);[\s\n]*const/g,
    (match) => {
      const parts = match.split('const');
      return parts[0] + '\n  const' + parts[1];
    });

  // Fix any remaining double semicolons
  content = content.replace(/;;+/g, ';');

  return content;
}

function processFile(filePath) {
  const fullPath = path.join(PROJECT_ROOT, filePath);

  if (!fs.existsSync(fullPath)) {
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;

  content = finalCleanup(content);

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Cleaned up: ${filePath}`);
    return true;
  }

  return false;
}

function main() {
  console.log('🧹 Final syntax cleanup...\n');

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

  let cleanedCount = 0;
  testFiles.forEach(filePath => {
    if (processFile(filePath)) {
      cleanedCount++;
    }
  });

  console.log(`\n✅ Cleaned up ${cleanedCount} files`);
  console.log('🎉 Final syntax cleanup completed!');
}

if (require.main === module) {
  main();
}

module.exports = { finalCleanup };
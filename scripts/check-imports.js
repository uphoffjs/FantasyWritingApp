#!/usr/bin/env node

/**
 * check-imports.js
 * * Pre-commit hook script to check for common import issues
 * ! Prevents commits with broken imports that would fail at build time
 */

const fs = require('fs');
const path = require('path');

// * Files passed by lint-staged
const files = process.argv.slice(2);

const errors = [];

// * Common import issues to check for
const importPatterns = {
  // * Check for incorrect factory imports (should be lowercase)
  incorrectFactory: /import\s+.*\s+from\s+['"].*factories.*['"].*[A-Z]Factory/,
  // * Check for importing from index files without extension
  missingExtension: /from\s+['"]\.\/[^'"]*(?<!\.tsx?|\.jsx?|\.json|\.css)['"]$/m,
  // * Check for absolute imports that should be relative
  absoluteImport: /import\s+.*\s+from\s+['"]src\//,
  // * Check for React Native specific imports in web files
  rnWebIssue: /import\s+.*\s+from\s+['"]react-native(?!-web)/
};

// * Check each file for import issues
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

    // * Check for incorrect factory imports
    if (importPatterns.incorrectFactory.test(line)) {
      errors.push({
        file,
        line: index + 1,
        issue: 'Incorrect factory import (use lowercase: elementFactory, not ElementFactory)',
        text: line.trim()
      });
    }

    // * Check for absolute imports
    if (importPatterns.absoluteImport.test(line)) {
      errors.push({
        file,
        line: index + 1,
        issue: 'Use relative imports or @ alias instead of src/',
        text: line.trim()
      });
    }

    // * Check for React Native imports in .web files
    if (file.includes('.web.') && importPatterns.rnWebIssue.test(line)) {
      errors.push({
        file,
        line: index + 1,
        issue: 'Use react-native-web imports in .web files',
        text: line.trim()
      });
    }
  });

  // * Check for circular dependencies (basic check)
  const importMatches = content.match(/import\s+.*\s+from\s+['"]([^'"]+)['"]/g) || [];
  importMatches.forEach(imp => {
    const importPath = imp.match(/from\s+['"]([^'"]+)['"]/)?.[1];
    if (importPath && importPath.startsWith('.')) {
      const resolvedPath = path.resolve(path.dirname(file), importPath);
      // * Check if the imported file imports back to this file
      // This is a simplified check - a full check would require AST parsing
      if (fs.existsSync(resolvedPath + '.ts') || fs.existsSync(resolvedPath + '.tsx')) {
        const targetFile = fs.existsSync(resolvedPath + '.ts') ?
          resolvedPath + '.ts' : resolvedPath + '.tsx';
        const targetContent = fs.readFileSync(targetFile, 'utf8');
        const fileName = path.basename(file, path.extname(file));
        if (targetContent.includes(`from './${fileName}'`) ||
            targetContent.includes(`from "./${fileName}"`)) {
          errors.push({
            file,
            line: 0,
            issue: `Potential circular dependency with ${path.basename(targetFile)}`,
            text: imp
          });
        }
      }
    }
  });
});

// * Report errors
if (errors.length > 0) {
  console.error('\n❌ Import Issues Found:\n');
  errors.forEach(error => {
    console.error(`📁 ${error.file}:${error.line}`);
    console.error(`   Issue: ${error.issue}`);
    console.error(`   Line: ${error.text}`);
    console.error('');
  });
  console.error(`\n❌ Total issues: ${errors.length}\n`);
  console.error('💡 Fix these import issues before committing.\n');
  process.exit(1);
} else {
  console.log('✅ Import checks passed');
}
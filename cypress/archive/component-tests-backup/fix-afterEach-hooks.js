#!/usr/bin/env node

/**
 * Fix afterEach hooks in Cypress component tests
 * Ensures cy.captureFailureDebug() is only called when tests fail
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const COMPONENT_TEST_DIR = path.join(__dirname);
const TEST_FILE_PATTERN = '**/*.cy.{ts,tsx,js,jsx}';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Statistics tracking
const stats = {
  totalFiles: 0,
  filesFixed: 0,
  hooksFixed: 0
};

/**
 * Fix afterEach hooks that call cy.captureFailureDebug() unconditionally
 */
function fixAfterEachHooks(content) {
  let modified = false;

  // Pattern 1: afterEach with unconditional cy.captureFailureDebug()
  const pattern1 = /afterEach\s*\(\s*function\s*\(\)\s*\{\s*(?:\/\/[^\n]*\n\s*)?cy\.captureFailureDebug\(\);?\s*\}/g;

  if (pattern1.test(content)) {
    content = content.replace(pattern1, `afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  }`);
    modified = true;
    stats.hooksFixed++;
  }

  // Pattern 2: afterEach with comment and unconditional cy.captureFailureDebug()
  const pattern2 = /afterEach\s*\(\s*function\s*\(\)\s*\{\s*\/\/[^\n]*\n\s*cy\.captureFailureDebug\(\);\s*\}\);/g;

  if (!modified && pattern2.test(content)) {
    content = content.replace(pattern2, `afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });`);
    modified = true;
    stats.hooksFixed++;
  }

  return { content, modified };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  console.log(`${colors.cyan}Processing: ${colors.reset}${path.relative(COMPONENT_TEST_DIR, filePath)}`);

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Apply fix
  const result = fixAfterEachHooks(content);
  content = result.content;

  // Write back if changed
  if (result.modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    stats.filesFixed++;
    console.log(`  ${colors.green}✓ Fixed afterEach hook${colors.reset}`);
  } else {
    // Check if file has correct pattern already
    if (content.includes('if (this.currentTest.state === \'failed\')')) {
      console.log(`  ${colors.yellow}⚬ Already has correct afterEach pattern${colors.reset}`);
    } else if (content.includes('cy.captureFailureDebug()')) {
      console.log(`  ${colors.red}✗ Has different afterEach pattern - needs manual review${colors.reset}`);
    } else {
      console.log(`  ${colors.yellow}⚬ No afterEach with captureFailureDebug${colors.reset}`);
    }
  }
}

/**
 * Main execution
 */
function main() {
  console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}         Fix afterEach Hooks in Component Tests        ${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);

  // Find all test files
  const files = glob.sync(TEST_FILE_PATTERN, {
    cwd: COMPONENT_TEST_DIR,
    absolute: true,
    ignore: [
      '**/node_modules/**',
      '**/fix-compliance.js',
      '**/fix-afterEach-hooks.js',
      '**/validate-compliance.js',
      '**/*.md'
    ]
  });

  stats.totalFiles = files.length;

  console.log(`Found ${colors.cyan}${files.length}${colors.reset} component test files\n`);

  // Process each file
  files.forEach(processFile);

  // Print summary
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}                      Summary                          ${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}✓${colors.reset} Files processed: ${stats.totalFiles}`);
  console.log(`${colors.green}✓${colors.reset} Files fixed: ${stats.filesFixed}`);
  console.log(`${colors.green}✓${colors.reset} afterEach hooks fixed: ${stats.hooksFixed}`);

  if (stats.filesFixed > 0) {
    console.log(`\n${colors.green}Success!${colors.reset} Fixed ${stats.filesFixed} files with ${stats.hooksFixed} afterEach hooks.`);
    console.log(`\n${colors.yellow}⚠ Note:${colors.reset} Tests should now only capture debug info when they fail.`);
  } else {
    console.log(`\n${colors.green}All files already have correct afterEach patterns or don't use captureFailureDebug!${colors.reset}`);
  }
}

// Execute
main();
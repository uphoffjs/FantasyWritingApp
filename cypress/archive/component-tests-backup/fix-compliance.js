#!/usr/bin/env node

/**
 * Cypress Component Test Compliance Fix Script
 *
 * This script automatically fixes critical compliance issues in component test files:
 * 1. Replaces data-testid with data-cy
 * 2. Adds mandatory debug commands
 * 3. Adds failure capture hooks
 * 4. Adds test documentation headers
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
  selectorsFixed: 0,
  debugCommandsAdded: 0,
  failureCaptureAdded: 0,
  headersAdded: 0
};

/**
 * Fix selectors: Replace data-testid with data-cy
 */
function fixSelectors(content) {
  const regex = /data-testid/g;
  const matches = content.match(regex);
  const count = matches ? matches.length : 0;

  if (count > 0) {
    stats.selectorsFixed += count;
    return content.replace(regex, 'data-cy');
  }
  return content;
}

/**
 * Add mandatory debug commands to beforeEach
 */
function addDebugCommands(content) {
  // Check if cy.comprehensiveDebug() already exists
  if (content.includes('cy.comprehensiveDebug()')) {
    return content;
  }

  // Pattern to find beforeEach blocks
  const beforeEachPattern = /beforeEach\s*\(\s*(?:function\s*\(\)|(?:\(\)|\(\s*\))\s*=>)\s*\{/g;

  let modified = false;
  content = content.replace(beforeEachPattern, (match) => {
    modified = true;
    return `${match}
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();
`;
  });

  if (modified) {
    stats.debugCommandsAdded++;
  }

  return content;
}

/**
 * Add failure capture to afterEach
 */
function addFailureCapture(content) {
  // Check if afterEach with captureFailureDebug already exists
  if (content.includes('cy.captureFailureDebug()')) {
    return content;
  }

  // Check if there's already an afterEach
  const hasAfterEach = /afterEach\s*\(/g.test(content);

  if (hasAfterEach) {
    // Add to existing afterEach
    const afterEachPattern = /afterEach\s*\(\s*function\s*\(\)\s*\{/g;
    content = content.replace(afterEachPattern, (match) => {
      stats.failureCaptureAdded++;
      return `${match}
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
`;
    });
  } else {
    // Add new afterEach after the last beforeEach
    const describePattern = /describe\s*\([^)]+,\s*\(\)\s*=>\s*\{/g;
    content = content.replace(describePattern, (match) => {
      stats.failureCaptureAdded++;
      return `${match}
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
`;
    });
  }

  return content;
}

/**
 * Add documentation header if missing
 */
function addDocumentationHeader(content, fileName) {
  // Check if file already has a documentation header
  if (content.startsWith('/**') || content.includes('@fileoverview')) {
    return content;
  }

  const componentName = path.basename(fileName, path.extname(fileName))
    .replace('.cy', '')
    .replace(/([A-Z])/g, ' $1')
    .trim();

  const header = `/**
 * @fileoverview ${componentName} Component Tests
 * Tests for US-X.X: [User Story Name]
 *
 * User Story:
 * As a [user type]
 * I want to [action]
 * So that [benefit]
 *
 * Acceptance Criteria:
 * - [Criterion 1]
 * - [Criterion 2]
 * - [Criterion 3]
 */

`;

  stats.headersAdded++;
  return header + content;
}

/**
 * Fix function syntax in hooks
 */
function fixFunctionSyntax(content) {
  // Replace arrow functions with function() in beforeEach/afterEach
  content = content.replace(/beforeEach\s*\(\s*\(\)\s*=>\s*\{/g, 'beforeEach(function() {');
  content = content.replace(/afterEach\s*\(\s*\(\)\s*=>\s*\{/g, 'afterEach(function() {');

  return content;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  console.log(`${colors.cyan}Processing: ${colors.reset}${path.relative(COMPONENT_TEST_DIR, filePath)}`);

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Apply fixes
  content = fixSelectors(content);
  content = addDebugCommands(content);
  content = addFailureCapture(content);
  content = fixFunctionSyntax(content);
  content = addDocumentationHeader(content, path.basename(filePath));

  // Write back if changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    stats.filesFixed++;
    console.log(`  ${colors.green}✓ Fixed${colors.reset}`);
  } else {
    console.log(`  ${colors.yellow}⚬ Already compliant${colors.reset}`);
  }
}

/**
 * Main execution
 */
function main() {
  console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}     Cypress Component Test Compliance Fix Script      ${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);

  // Find all test files
  const files = glob.sync(TEST_FILE_PATTERN, {
    cwd: COMPONENT_TEST_DIR,
    absolute: true,
    ignore: ['**/node_modules/**', '**/fix-compliance.js']
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
  console.log(`${colors.green}✓${colors.reset} Selectors fixed: ${stats.selectorsFixed}`);
  console.log(`${colors.green}✓${colors.reset} Debug commands added: ${stats.debugCommandsAdded}`);
  console.log(`${colors.green}✓${colors.reset} Failure captures added: ${stats.failureCaptureAdded}`);
  console.log(`${colors.green}✓${colors.reset} Headers added: ${stats.headersAdded}`);

  if (stats.filesFixed > 0) {
    console.log(`\n${colors.green}Success!${colors.reset} Fixed ${stats.filesFixed} files.`);
    console.log(`\n${colors.yellow}⚠ Note:${colors.reset} Please review the changes and update documentation headers with actual user stories.`);
  } else {
    console.log(`\n${colors.green}All files are already compliant!${colors.reset}`);
  }
}

// Check if glob is installed
try {
  require.resolve('glob');
  main();
} catch(e) {
  console.log(`${colors.red}Error: 'glob' package not found.${colors.reset}`);
  console.log(`Please install it first:`);
  console.log(`  ${colors.cyan}npm install --save-dev glob${colors.reset}`);
  console.log(`Then run this script again:`);
  console.log(`  ${colors.cyan}node fix-compliance.js${colors.reset}`);
  process.exit(1);
}
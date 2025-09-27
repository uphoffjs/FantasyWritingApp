#!/usr/bin/env node

/**
 * Cypress Component Test Compliance Validation Script
 *
 * This script validates that all component test files follow the documented best practices:
 * - Uses data-cy selectors (not data-testid)
 * - Includes mandatory debug commands
 * - Has failure capture hooks
 * - Uses proper function syntax
 * - No conditional statements
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
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Validation results
const results = {
  totalFiles: 0,
  compliantFiles: 0,
  violations: {
    selectors: [],
    debugCommands: [],
    cleanState: [],
    failureCapture: [],
    functionSyntax: [],
    conditionals: [],
    consoleLog: [],
    documentation: []
  }
};

/**
 * Validation Rules
 */
const validationRules = [
  {
    name: 'Selector Compliance',
    test: (content, filePath) => {
      const hasDataTestId = /data-testid/g.test(content);
      if (hasDataTestId) {
        const matches = content.match(/data-testid/g);
        results.violations.selectors.push({
          file: filePath,
          count: matches.length,
          message: `Found ${matches.length} instances of data-testid (should use data-cy)`
        });
        return false;
      }
      return true;
    }
  },
  {
    name: 'Debug Commands',
    test: (content, filePath) => {
      const hasComprehensiveDebug = /cy\.comprehensiveDebug\(\)/g.test(content);
      if (!hasComprehensiveDebug) {
        results.violations.debugCommands.push({
          file: filePath,
          message: 'Missing cy.comprehensiveDebug() in beforeEach'
        });
        return false;
      }
      return true;
    }
  },
  {
    name: 'Clean State',
    test: (content, filePath) => {
      const hasCleanState = /cy\.cleanState\(\)/g.test(content);
      if (!hasCleanState) {
        results.violations.cleanState.push({
          file: filePath,
          message: 'Missing cy.cleanState() in beforeEach'
        });
        return false;
      }
      return true;
    }
  },
  {
    name: 'Failure Capture',
    test: (content, filePath) => {
      const hasFailureCapture = /cy\.captureFailureDebug\(\)/g.test(content);
      if (!hasFailureCapture) {
        results.violations.failureCapture.push({
          file: filePath,
          message: 'Missing cy.captureFailureDebug() in afterEach'
        });
        return false;
      }
      return true;
    }
  },
  {
    name: 'Function Syntax',
    test: (content, filePath) => {
      const hasArrowInHooks = /(beforeEach|afterEach)\s*\(\s*\(\)\s*=>/g.test(content);
      if (hasArrowInHooks) {
        results.violations.functionSyntax.push({
          file: filePath,
          message: 'Using arrow functions in hooks (should use function())'
        });
        return false;
      }
      return true;
    }
  },
  {
    name: 'No Conditionals',
    test: (content, filePath) => {
      // Look for if statements in test blocks
      const testBlockPattern = /it\s*\([^{]+\{[\s\S]*?\n\s*\}\)/g;
      const testBlocks = content.match(testBlockPattern) || [];

      for (const block of testBlocks) {
        // Check for if statements (excluding comments and strings)
        const cleanBlock = block
          .replace(/\/\/.*$/gm, '') // Remove single-line comments
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
          .replace(/'[^']*'/g, '""') // Replace single-quoted strings
          .replace(/"[^"]*"/g, '""'); // Replace double-quoted strings

        if (/\bif\s*\(/.test(cleanBlock)) {
          results.violations.conditionals.push({
            file: filePath,
            message: 'Found conditional statement (if/else) in test'
          });
          return false;
        }
      }
      return true;
    }
  },
  {
    name: 'No Console Logs',
    test: (content, filePath) => {
      // Check for console.log statements (excluding comments)
      const cleanContent = content
        .replace(/\/\/.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '');

      if (/console\.log\(/g.test(cleanContent)) {
        const matches = cleanContent.match(/console\.log\(/g);
        results.violations.consoleLog.push({
          file: filePath,
          count: matches.length,
          message: `Found ${matches.length} console.log statements`
        });
        return false;
      }
      return true;
    }
  },
  {
    name: 'Documentation Header',
    test: (content, filePath) => {
      const hasDocHeader = content.startsWith('/**') || /@fileoverview/.test(content);
      if (!hasDocHeader) {
        results.violations.documentation.push({
          file: filePath,
          message: 'Missing documentation header with user story'
        });
        return false;
      }
      return true;
    }
  }
];

/**
 * Validate a single file
 */
function validateFile(filePath) {
  const relativePath = path.relative(COMPONENT_TEST_DIR, filePath);
  const content = fs.readFileSync(filePath, 'utf8');

  let isCompliant = true;
  const failedRules = [];

  for (const rule of validationRules) {
    if (!rule.test(content, relativePath)) {
      isCompliant = false;
      failedRules.push(rule.name);
    }
  }

  if (isCompliant) {
    results.compliantFiles++;
    console.log(`${colors.green}✓${colors.reset} ${relativePath}`);
  } else {
    console.log(`${colors.red}✗${colors.reset} ${relativePath}`);
    failedRules.forEach(rule => {
      console.log(`  ${colors.yellow}⚠${colors.reset} Failed: ${rule}`);
    });
  }
}

/**
 * Print detailed violations report
 */
function printViolationsReport() {
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}                 Violations Report                      ${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);

  const violationTypes = [
    { key: 'selectors', title: '🔴 Selector Issues (data-testid → data-cy)', priority: 'P0' },
    { key: 'debugCommands', title: '🔴 Missing Debug Commands', priority: 'P0' },
    { key: 'cleanState', title: '🔴 Missing Clean State', priority: 'P0' },
    { key: 'failureCapture', title: '🔴 Missing Failure Capture', priority: 'P0' },
    { key: 'functionSyntax', title: '🟡 Function Syntax Issues', priority: 'P1' },
    { key: 'conditionals', title: '🔴 Conditional Statements Found', priority: 'P0' },
    { key: 'consoleLog', title: '🟡 Console.log Statements', priority: 'P1' },
    { key: 'documentation', title: '🟢 Missing Documentation Headers', priority: 'P2' }
  ];

  for (const { key, title, priority } of violationTypes) {
    const violations = results.violations[key];
    if (violations.length > 0) {
      console.log(`${colors.cyan}${title} [${priority}]${colors.reset}`);
      console.log(`${colors.cyan}${'─'.repeat(50)}${colors.reset}`);
      violations.forEach(v => {
        console.log(`  ${colors.red}•${colors.reset} ${v.file}`);
        if (v.message) {
          console.log(`    ${colors.yellow}${v.message}${colors.reset}`);
        }
      });
      console.log();
    }
  }
}

/**
 * Calculate and print compliance percentage
 */
function printComplianceScore() {
  const compliancePercentage = results.totalFiles > 0
    ? Math.round((results.compliantFiles / results.totalFiles) * 100)
    : 0;

  console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}                  Compliance Score                      ${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);

  // Visual progress bar
  const barLength = 40;
  const filledLength = Math.round((compliancePercentage / 100) * barLength);
  const emptyLength = barLength - filledLength;
  const progressBar = '█'.repeat(filledLength) + '░'.repeat(emptyLength);

  let scoreColor = colors.red;
  if (compliancePercentage >= 80) scoreColor = colors.green;
  else if (compliancePercentage >= 50) scoreColor = colors.yellow;

  console.log(`${scoreColor}[${progressBar}] ${compliancePercentage}%${colors.reset}`);
  console.log(`\n${colors.cyan}Files:${colors.reset} ${results.compliantFiles}/${results.totalFiles} compliant`);

  // Violation counts
  const totalViolations = Object.values(results.violations)
    .reduce((sum, violations) => sum + violations.length, 0);

  console.log(`${colors.cyan}Total Violations:${colors.reset} ${totalViolations}`);
}

/**
 * Generate fix command suggestions
 */
function printFixSuggestions() {
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}                   Fix Suggestions                      ${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);

  console.log(`${colors.green}To automatically fix most issues, run:${colors.reset}`);
  console.log(`  ${colors.cyan}node fix-compliance.js${colors.reset}`);
  console.log();

  if (results.violations.selectors.length > 0) {
    console.log(`${colors.yellow}Quick fix for selectors:${colors.reset}`);
    console.log(`  find . -name "*.cy.tsx" -exec sed -i '' 's/data-testid/data-cy/g' {} +`);
    console.log();
  }

  console.log(`${colors.yellow}Manual review required for:${colors.reset}`);
  console.log(`  • Conditional statements (if/else) in tests`);
  console.log(`  • Console.log statements`);
  console.log(`  • User story documentation in headers`);
}

/**
 * Main execution
 */
function main() {
  console.log(`${colors.magenta}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.magenta}   Cypress Component Test Compliance Validator         ${colors.reset}`);
  console.log(`${colors.magenta}═══════════════════════════════════════════════════════${colors.reset}\n`);

  // Find all test files
  const files = glob.sync(TEST_FILE_PATTERN, {
    cwd: COMPONENT_TEST_DIR,
    absolute: true,
    ignore: ['**/node_modules/**', '**/*.js']
  });

  results.totalFiles = files.length;

  console.log(`Validating ${colors.cyan}${files.length}${colors.reset} component test files...\n`);

  // Validate each file
  files.forEach(validateFile);

  // Print reports
  printViolationsReport();
  printComplianceScore();

  if (results.compliantFiles < results.totalFiles) {
    printFixSuggestions();
  } else {
    console.log(`\n${colors.green}🎉 All files are fully compliant!${colors.reset}`);
  }

  // Exit with error if not fully compliant (for CI/CD)
  if (results.compliantFiles < results.totalFiles) {
    process.exit(1);
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
  console.log(`  ${colors.cyan}node validate-compliance.js${colors.reset}`);
  process.exit(1);
}
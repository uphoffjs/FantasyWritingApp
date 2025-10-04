#!/usr/bin/env node

/**
 * Script to fix export/import mismatches in Cypress component tests
 * Addresses the most critical import issues found in test analysis
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Fix patterns for the most common import issues
const importFixes = [
  // CalculationService -> calculationService (144 occurrences)
  {
    pattern: /import\s*{\s*CalculationService\s*}/g,
    replacement: 'import { calculationService }',
    description: 'Fix CalculationService import (should be lowercase)'
  },
  {
    pattern: /from\s*['"](.*)CalculationService['"]/g,
    replacement: 'from "$1calculationService"',
    description: 'Fix CalculationService path'
  },

  // PerformanceMonitorComponent -> PerformanceMonitor (25 occurrences)
  {
    pattern: /import\s*{\s*PerformanceMonitorComponent\s*}/g,
    replacement: 'import { PerformanceMonitor }',
    description: 'Fix PerformanceMonitor import name'
  },
  {
    pattern: /<PerformanceMonitorComponent/g,
    replacement: '<PerformanceMonitor',
    description: 'Fix PerformanceMonitor JSX usage'
  },

  // ElementFactory -> elementFactory (9 occurrences)
  {
    pattern: /import\s*{\s*ElementFactory\s*}/g,
    replacement: 'import { elementFactory }',
    description: 'Fix ElementFactory import (should be lowercase)'
  },

  // AuthGuard - convert to default import (12 occurrences)
  {
    pattern: /import\s*{\s*AuthGuard\s*}\s*from/g,
    replacement: 'import AuthGuard from',
    description: 'Fix AuthGuard import (should be default import)'
  },

  // Fix mockElement imports
  {
    pattern: /import\s*{\s*mockElement\s*}\s*from\s*['"]\.\.\/fixtures\/elements['"]/g,
    replacement: 'import { createMockElement as mockElement } from "../fixtures/elements"',
    description: 'Fix mockElement import'
  }
];

// Add mountWithProviders export to component-wrapper
function fixComponentWrapper() {
  const wrapperPath = path.join(__dirname, 'cypress/support/component-wrapper.tsx');

  if (fs.existsSync(wrapperPath)) {
    let content = fs.readFileSync(wrapperPath, 'utf8');

    // Check if mountWithProviders is already exported
    if (!content.includes('export const mountWithProviders')) {
      // Add the mountWithProviders function
      const mountFunction = `
// Export mountWithProviders for use in tests
export const mountWithProviders = (component: React.ReactElement, options = {}) => {
  return cy.mount(
    <TestWrapper {...options}>
      {component}
    </TestWrapper>
  );
};
`;

      // Add before the final closing of the file
      content = content.replace(/(\n*)$/, mountFunction + '$1');

      fs.writeFileSync(wrapperPath, content, 'utf8');
      console.log('✅ Added mountWithProviders export to component-wrapper.tsx');
    } else {
      console.log('✓ mountWithProviders already exported in component-wrapper.tsx');
    }
  } else {
    console.log('⚠️ component-wrapper.tsx not found');
  }
}

// Process all test files
function processTestFiles() {
  const testFiles = glob.sync('cypress/component/**/*.cy.{ts,tsx}', {
    cwd: __dirname,
    absolute: true
  });

  console.log(`Found ${testFiles.length} test files to process`);

  let totalFixes = 0;
  const fixCounts = {};

  testFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileFixes = 0;

    importFixes.forEach(fix => {
      const matches = content.match(fix.pattern);
      if (matches) {
        const count = matches.length;
        content = content.replace(fix.pattern, fix.replacement);
        modified = true;
        fileFixes += count;

        if (!fixCounts[fix.description]) {
          fixCounts[fix.description] = 0;
        }
        fixCounts[fix.description] += count;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      totalFixes += fileFixes;
      const relativePath = path.relative(__dirname, filePath);
      console.log(`  ✓ Fixed ${fileFixes} imports in ${relativePath}`);
    }
  });

  console.log('\n📊 Summary of fixes:');
  Object.entries(fixCounts).forEach(([desc, count]) => {
    console.log(`  - ${desc}: ${count} occurrences`);
  });
  console.log(`\nTotal fixes applied: ${totalFixes}`);
}

// Check and fix service exports
function checkServiceExports() {
  const servicePaths = [
    'src/services/calculationService.ts',
    'src/services/CalculationService.ts',
    'src/utils/calculationService.ts',
    'src/utils/CalculationService.ts'
  ];

  for (const servicePath of servicePaths) {
    const fullPath = path.join(__dirname, servicePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');

      // Check what's actually exported
      const hasNamedExport = content.includes('export const calculationService') ||
                             content.includes('export { calculationService');
      const hasDefaultExport = content.includes('export default');

      console.log(`\n📁 Found ${servicePath}:`);
      console.log(`  - Has named export 'calculationService': ${hasNamedExport}`);
      console.log(`  - Has default export: ${hasDefaultExport}`);

      // If only has default export, we might need to update imports differently
      if (!hasNamedExport && hasDefaultExport) {
        console.log('  ⚠️ Only default export found - imports should use default import syntax');
      }

      return; // Found the file
    }
  }

  console.log('⚠️ CalculationService file not found in expected locations');
}

// Main execution
console.log('🔧 Fixing import/export mismatches in Cypress component tests...\n');

// Fix component wrapper
fixComponentWrapper();

// Check service exports
checkServiceExports();

// Process test files
console.log('\n📝 Processing test files...');
processTestFiles();

console.log('\n✅ Import/export fixes completed!');
console.log('Next steps:');
console.log('1. Run tests again to see if import errors are resolved');
console.log('2. Fix any remaining missing component imports');
console.log('3. Ensure all referenced components exist in the codebase');
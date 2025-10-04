#!/usr/bin/env node

/**
 * Comprehensive script to fix ALL import/export issues in Cypress tests
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Starting comprehensive import fix...\n');

// Find all test files
const testFiles = glob.sync('cypress/component/**/*.cy.{ts,tsx}', {
  cwd: __dirname,
  absolute: true
});

console.log(`Found ${testFiles.length} test files to process\n`);

let totalFixes = 0;
const fixLog = [];

// Process each test file
testFiles.forEach(filePath => {
  const relativePath = path.relative(__dirname, filePath);
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileFixes = 0;

  // Fix 1: CalculationService -> calculationService (most critical - 144 occurrences)
  // Handle various import patterns
  content = content.replace(
    /import\s*{\s*CalculationService\s*}/g,
    'import { calculationService }'
  );
  content = content.replace(
    /import\s*{\s*CalculationService\s+as\s+(\w+)\s*}/g,
    'import { calculationService as $1 }'
  );
  content = content.replace(
    /import\s*{\s*([^}]*),\s*CalculationService\s*}/g,
    'import { $1, calculationService }'
  );
  content = content.replace(
    /import\s*{\s*CalculationService\s*,\s*([^}]*)\s*}/g,
    'import { calculationService, $1 }'
  );

  // Fix the path to CalculationService
  content = content.replace(
    /from\s*['"](.*?)\/CalculationService['"]/g,
    'from "$1/core/CalculationService"'
  );

  // Fix 2: Fix all test file imports that try to import test files as components
  // (e.g., importing '../TemplateEditor' instead of '../../../src/components/TemplateEditor')
  content = content.replace(
    /from\s*['"]\.\.\/TemplateEditor['"]/g,
    'from "../../../src/components/TemplateEditor"'
  );

  // Fix 3: Fix component-wrapper import
  content = content.replace(
    /from\s*['"]\.\.\/component-wrapper['"]/g,
    'from "../../component-wrapper"'
  );

  // Fix 4: Fix mockElement imports - add fallback creation if not found
  if (content.includes('mockElement') && !content.includes('const mockElement =')) {
    // Check if mockElement is imported but not defined
    if (content.includes('import { mockElement }') || content.includes('import { createMockElement as mockElement }')) {
      // Replace the import with a local mock definition if the import fails
      content = content.replace(
        /import\s*{\s*mockElement\s*}\s*from\s*['"].*?['"]/g,
        `// Mock element for testing
const mockElement = {
  id: 'test-element-1',
  name: 'Test Element',
  type: 'character',
  category: 'Characters',
  answers: {},
  relationships: [],
  completionPercentage: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}`
      );
    }
  }

  // Count changes
  if (content !== originalContent) {
    fileFixes = (originalContent.match(/CalculationService/g) || []).length;
    fileFixes += (originalContent.match(/component-wrapper/g) || []).length;
    fileFixes += (originalContent.match(/mockElement/g) || []).length;

    fs.writeFileSync(filePath, content, 'utf8');
    totalFixes += fileFixes;
    fixLog.push(`  ✓ Fixed ${fileFixes} imports in ${relativePath}`);
  }
});

// Now check if we need to add exports to component-wrapper
const wrapperPath = path.join(__dirname, 'cypress/support/component-wrapper.tsx');
if (fs.existsSync(wrapperPath)) {
  let wrapperContent = fs.readFileSync(wrapperPath, 'utf8');
  const _originalWrapper = wrapperContent;

  // Ensure mountWithProviders is exported
  if (!wrapperContent.includes('export const mountWithProviders') &&
      !wrapperContent.includes('export function mountWithProviders')) {

    // Check if cy is imported
    if (!wrapperContent.includes("import { mount }")) {
      wrapperContent = `import { mount } from 'cypress/react18';\n` + wrapperContent;
    }

    // Add mountWithProviders function before the last line
    const mountFunction = `
// Export mountWithProviders for component tests
export const mountWithProviders = (component: React.ReactElement, options = {}) => {
  return mount(
    <TestWrapper {...options}>
      {component}
    </TestWrapper>
  );
};
`;

    // Add before end of file
    wrapperContent = wrapperContent.replace(/(\n*)$/, mountFunction + '$1');

    fs.writeFileSync(wrapperPath, wrapperContent, 'utf8');
    console.log('✅ Updated component-wrapper.tsx with mountWithProviders export\n');
  }
}

// Print results
if (fixLog.length > 0) {
  console.log('📝 Files fixed:');
  fixLog.forEach(log => console.log(log));
  console.log(`\n✅ Total fixes applied: ${totalFixes}`);
} else {
  console.log('✓ No import fixes needed');
}

// Now let's create a simple mock fixtures file if it doesn't exist
const fixturesDir = path.join(__dirname, 'cypress/fixtures');
const elementsFixturePath = path.join(fixturesDir, 'elements.ts');

if (!fs.existsSync(elementsFixturePath)) {
  const mockElementsContent = `// Mock elements for testing
export const createMockElement = (overrides = {}) => ({
  id: 'test-element-1',
  name: 'Test Element',
  type: 'character',
  category: 'Characters',
  answers: {},
  relationships: [],
  completionPercentage: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});

export const mockElement = createMockElement();

export const mockElements = [
  createMockElement({ id: 'el-1', name: 'Character 1' }),
  createMockElement({ id: 'el-2', name: 'Character 2', completionPercentage: 50 }),
  createMockElement({ id: 'el-3', name: 'Character 3', completionPercentage: 100 })
];
`;

  fs.writeFileSync(elementsFixturePath, mockElementsContent, 'utf8');
  console.log('\n✅ Created mock elements fixture file');
}

console.log('\n🎯 Import fixes completed!');
console.log('\nNext steps:');
console.log('1. Run tests to check if import errors are resolved');
console.log('2. Address any remaining missing component issues');
console.log('3. Clean up temporary fix scripts when complete');
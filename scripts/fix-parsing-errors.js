#!/usr/bin/env node

/**
 * Fix parsing errors caused by over-aggressive conditional statement removal
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();

// Common incorrect replacements to fix
const REPLACEMENTS = [
  // Fix selection -> [data-cy*="select"]ion
  {
    from: /\[data-cy\*="select"\]ion/g,
    to: 'selection'
  },
  // Fix selected -> [data-cy*="select"]ed
  {
    from: /\[data-cy\*="select"\]ed/g,
    to: 'selected'
  },
  // Fix ele[data-cy*="select"] -> element pattern
  {
    from: /ele\[data-cy\*="select"\]/g,
    to: 'element'
  },
  // Fix cy.then(() => { ; }); empty patterns
  {
    from: /cy\.then\(\(\) => \{\s*;\s*\}\);/g,
    to: ''
  },
  // Fix broken variable declarations
  {
    from: /let\s+mockOnFocus\s*;\s*let\s+mockOnBlur\s*;/g,
    to: 'const mockOnFocus = cy.stub();\n    const mockOnBlur = cy.stub();'
  },
  // Fix missing semicolons after cy.then blocks
  {
    from: /(\}\s*)\s*\)/g,
    to: '$1);'
  }
];

function fixFile(filePath) {
  const fullPath = path.join(PROJECT_ROOT, filePath);

  if (!fs.existsSync(fullPath)) {
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Apply replacements
  REPLACEMENTS.forEach(replacement => {
    const newContent = content.replace(replacement.from, replacement.to);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });

  // Fix specific parsing errors manually

  // Fix ErrorBoundary.cy.tsx - likely has broken cy.then pattern
  if (filePath.includes('ErrorBoundary.cy.tsx')) {
    content = content.replace(/cy\.then\(\(\) => \{\s*cy\.get\(/g, 'cy.get(');
    modified = true;
  }

  // Fix ErrorMessage.cy.tsx - similar pattern
  if (filePath.includes('ErrorMessage.cy.tsx')) {
    content = content.replace(/cy\.then\(\(\) => \{\s*cy\.contains\(/g, 'cy.contains(');
    modified = true;
  }

  // Fix Toast.cy.tsx - likely console.log removal issue
  if (filePath.includes('Toast.cy.tsx')) {
    // Fix any malformed expressions after console.log removal
    content = content.replace(/;\s*;/g, ';');
    content = content.replace(/expect\(\s*\)\./g, 'expect(toastElement).');
    modified = true;
  }

  // Fix TextInput.cy.tsx - variable declaration issues
  if (filePath.includes('TextInput.cy.tsx')) {
    content = content.replace(/let\s+mockOnFocus\s*;\s*let\s+mockOnBlur\s*;/g,
      'const mockOnFocus = cy.stub();\n    const mockOnBlur = cy.stub();');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }

  return false;
}

function main() {
  console.log('🔧 Fixing parsing errors caused by conditional removal...\n');

  // Files with specific parsing errors from lint output
  const errorFiles = [
    'cypress/component/elements/LinkModal.cy.tsx',
    'cypress/component/elements/SpeciesSelector.cy.tsx',
    'cypress/component/errors/ErrorBoundary.cy.tsx',
    'cypress/component/errors/ErrorMessage.cy.tsx',
    'cypress/component/errors/ErrorNotification.cy.tsx',
    'cypress/component/forms/ElementForms.cy.tsx',
    'cypress/component/navigation/Header.cy.tsx',
    'cypress/component/navigation/MobileNavigation.cy.tsx',
    'cypress/component/projects/CreateProjectModal.cy.tsx',
    'cypress/component/sync/SyncComponents.cy.tsx',
    'cypress/component/ui/ImageUpload.cy.tsx',
    'cypress/component/ui/MarkdownExportModal.cy.tsx',
    'cypress/component/ui/RichTextEditor.cy.tsx',
    'cypress/component/ui/TagMultiSelect.cy.tsx',
    'cypress/component/ui/TextInput.cy.tsx',
    'cypress/component/ui/Toast.cy.tsx',
    'cypress/component/utilities/TemplateComponents.cy.tsx',
    'cypress/component/utilities/TemplateEditor.cy.tsx',
    'cypress/component/visualization/VirtualizedList.cy.tsx'
  ];

  errorFiles.forEach(filePath => {
    fixFile(filePath);
  });

  console.log('\n✅ Parsing error fixes completed!');
}

if (require.main === module) {
  main();
}

module.exports = { fixFile, REPLACEMENTS };
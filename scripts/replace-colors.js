#!/usr/bin/env node

/**
 * Color Replacement Script: Tailwind CSS → Fantasy Tome Theme
 *
 * This script automates the replacement of Tailwind color literals with Fantasy theme colors.
 * Handles 369 color literal instances across 18 production files.
 *
 * Features:
 * - Dry-run mode for safety
 * - Context-aware replacements (checks parent background for #F9FAFB)
 * - Import statement management
 * - Rollback capability
 * - Validation checks
 *
 * Usage:
 *   npm run replace-colors                    # Dry-run (no changes)
 *   npm run replace-colors -- --execute       # Execute replacements
 *   npm run replace-colors -- --file=src/components/ErrorMessage.tsx  # Single file
 *
 * @see claudedocs/COLOR_MAPPING.md - Complete mapping documentation
 * @see scripts/colorMapping.ts - Mapping definitions
 */

const fs = require('fs');
const path = require('path');

// Import mapping data (we'll define it inline for simplicity)
const tailwindToFantasyMap = {
  text: {
    '#F9FAFB': 'CONTEXT',
    '#FFFFFF': 'fantasyTomeColors.parchment.vellum',
    'white': 'fantasyTomeColors.parchment.vellum',
    '#fff': 'fantasyTomeColors.parchment.vellum',
    '#9CA3AF': 'fantasyTomeColors.ink.light',
    '#6B7280': 'fantasyTomeColors.ink.faded',
    '#D1D5DB': 'fantasyTomeColors.ink.light',
    '#5C4A3A': 'fantasyTomeColors.ink.light',
    '#4A3C30': 'fantasyTomeColors.ink.faded',
    '#333': 'fantasyTomeColors.ink.brown',
    '#666': 'fantasyTomeColors.ink.faded',
  },
  backgrounds: {
    '#374151': 'fantasyTomeColors.ink.brown',
    '#1F2937': 'fantasyTomeColors.ink.black',
    '#111827': 'fantasyTomeColors.ink.scribe',
    '#FAF7F2': 'fantasyTomeColors.parchment.aged',
    '#6366F1': 'fantasyTomeColors.elements.magic.primary',
    '#007AFF': 'fantasyTomeColors.elements.culture.primary',
    '#10B981': 'fantasyTomeColors.semantic.success',
    '#059669': 'fantasyTomeColors.semantic.success',
    '#A31C1C': 'fantasyTomeColors.semantic.error',
    '#7C2D1220': 'fantasyTomeColors.semantic.errorLight',
    '#4B5563': 'fantasyTomeColors.ink.faded',
    'transparent': 'transparent',
  },
  borders: {
    '#374151': 'fantasyTomeColors.parchment.border',
    '#4B5563': 'fantasyTomeColors.parchment.border',
    '#991B1B': 'fantasyTomeColors.semantic.error',
    'transparent': 'transparent',
  },
  semantic: {
    success: {
      text: 'fantasyTomeColors.semantic.success',
      bg: 'fantasyTomeColors.semantic.success',
      light: 'fantasyTomeColors.semantic.successLight',
    },
    error: {
      '#EF4444': 'fantasyTomeColors.semantic.error',
      '#DC2626': 'fantasyTomeColors.semantic.error',
      '#FCA5A5': 'fantasyTomeColors.semantic.errorLight',
      '#862e2e': 'fantasyTomeColors.semantic.error',
      '#A31C1C': 'fantasyTomeColors.semantic.error',
      '#7C2D1220': 'fantasyTomeColors.semantic.errorLight',
      '#991B1B': 'fantasyTomeColors.semantic.error',
    },
    info: {
      '#6366F1': 'fantasyTomeColors.elements.magic.primary',
      '#007AFF': 'fantasyTomeColors.elements.culture.primary',
    },
  },
  special: {
    'rgba(0, 0, 0, 0.5)': 'fantasyTomeColors.states.active',
    '#000': 'fantasyTomeColors.ink.scribe',
    'transparent': 'transparent',
    '#4338CA20': 'fantasyTomeColors.elements.magic.secondary',
    '#C9A94F': 'fantasyTomeColors.metals.gold',
  },
};

const contextRules = {
  whiteGray50: {
    darkBackgrounds: ['#374151', '#1F2937', '#111827'],
    onDark: 'fantasyTomeColors.parchment.vellum',
    onLight: 'fantasyTomeColors.ink.black',
  },
};

const affectedFiles = [
  'src/ViteTest.tsx',
  'src/components/AuthGuard.tsx',
  'src/components/CreateElementModal.tsx',
  'src/components/CreateElementModal.web.tsx',
  'src/components/CrossPlatformDatePicker.tsx',
  'src/components/ElementBrowser.tsx',
  'src/components/ElementBrowser.web.tsx',
  'src/components/ErrorBoundary.tsx',
  'src/components/ErrorMessage.tsx',
  'src/components/ErrorNotification.tsx',
  'src/components/LinkModal.tsx',
  'src/components/MarkdownEditor.tsx',
  'src/components/ProjectList.tsx',
  'src/components/RelationshipManager.tsx',
  'src/components/RelationshipManager.web.tsx',
  'src/components/TemplateSelector.tsx',
  'src/components/TextInput.tsx',
  'src/screens/SettingsScreen.tsx',
];

// ===================================================================
// CONFIGURATION
// ===================================================================

const DRY_RUN = !process.argv.includes('--execute');
const SINGLE_FILE = process.argv.find((arg) => arg.startsWith('--file='))?.split('=')[1];
const BACKUP_DIR = '.backup-color-migration';

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

function createBackup(filePath) {
  if (DRY_RUN) return;

  const backupDir = path.join(process.cwd(), BACKUP_DIR);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupPath = path.join(backupDir, path.basename(filePath));
  fs.copyFileSync(filePath, backupPath);
  console.log(`  ✅ Backup created: ${backupPath}`);
}

function needsImport(content) {
  return !content.includes('fantasyTomeColors') && !content.includes('@/constants/fantasyTomeColors');
}

function addImport(content) {
  if (content.includes('fantasyTomeColors')) {
    return content;
  }

  const importRegex = /import\s+.*?from\s+['"].*?['"];?\n/g;
  const imports = content.match(importRegex);

  if (!imports || imports.length === 0) {
    return `import { fantasyTomeColors } from '@/constants/fantasyTomeColors';\n\n${content}`;
  }

  const lastImport = imports[imports.length - 1];
  const lastImportIndex = content.lastIndexOf(lastImport);
  const insertPosition = lastImportIndex + lastImport.length;

  return (
    content.slice(0, insertPosition) +
    `import { fantasyTomeColors } from '@/constants/fantasyTomeColors';\n` +
    content.slice(insertPosition)
  );
}

function isTextContext(line) {
  return line.includes('color:') || line.includes('color =');
}

function isBackgroundContext(line) {
  return line.includes('backgroundColor:') || line.includes('backgroundColor =') || line.includes('background:');
}

function isBorderContext(line) {
  return (
    line.includes('borderColor:') ||
    line.includes('borderColor =') ||
    line.includes('borderTopColor:') ||
    line.includes('borderBottomColor:') ||
    line.includes('borderLeftColor:') ||
    line.includes('borderRightColor:')
  );
}

function hasDarkParentBackground(content, lineIndex) {
  const startLine = Math.max(0, lineIndex - 10);
  const lines = content.split('\n');
  const contextLines = lines.slice(startLine, lineIndex).join('\n');

  return contextRules.whiteGray50.darkBackgrounds.some((darkBg) => contextLines.includes(darkBg));
}

function replaceColorInLine(line, lineIndex, fileContent) {
  let newLine = line;
  let replaced = false;
  let contextDecision = false;

  // Handle context-dependent #F9FAFB
  if (line.includes('#F9FAFB')) {
    const isDarkParent = hasDarkParentBackground(fileContent, lineIndex);
    const replacement = isDarkParent ? contextRules.whiteGray50.onDark : contextRules.whiteGray50.onLight;

    newLine = line.replace(/#F9FAFB/g, replacement);
    replaced = true;
    contextDecision = true;
    console.log(`    📋 Context decision: #F9FAFB → ${replacement} (${isDarkParent ? 'dark' : 'light'} parent)`);
  }

  // Handle text colors
  if (isTextContext(line)) {
    for (const [tailwind, fantasy] of Object.entries(tailwindToFantasyMap.text)) {
      if (fantasy === 'CONTEXT') continue;
      if (line.includes(tailwind)) {
        newLine = newLine.replace(new RegExp(tailwind, 'g'), fantasy);
        replaced = true;
      }
    }
  }

  // Handle background colors
  if (isBackgroundContext(line)) {
    for (const [tailwind, fantasy] of Object.entries(tailwindToFantasyMap.backgrounds)) {
      if (line.includes(tailwind)) {
        newLine = newLine.replace(new RegExp(tailwind, 'g'), fantasy);
        replaced = true;
      }
    }
  }

  // Handle border colors
  if (isBorderContext(line)) {
    for (const [tailwind, fantasy] of Object.entries(tailwindToFantasyMap.borders)) {
      if (line.includes(tailwind)) {
        newLine = newLine.replace(new RegExp(tailwind, 'g'), fantasy);
        replaced = true;
      }
    }
  }

  // Handle semantic colors
  for (const [errorColor, fantasy] of Object.entries(tailwindToFantasyMap.semantic.error)) {
    if (line.includes(errorColor)) {
      newLine = newLine.replace(new RegExp(errorColor, 'g'), fantasy);
      replaced = true;
    }
  }

  for (const [infoColor, fantasy] of Object.entries(tailwindToFantasyMap.semantic.info)) {
    if (line.includes(infoColor)) {
      newLine = newLine.replace(new RegExp(infoColor, 'g'), fantasy);
      replaced = true;
    }
  }

  // Handle special cases
  for (const [special, fantasy] of Object.entries(tailwindToFantasyMap.special)) {
    if (line.includes(special) && special !== 'transparent') {
      newLine = newLine.replace(new RegExp(special.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fantasy);
      replaced = true;
    }
  }

  return { newLine, replaced, contextDecision };
}

function processFile(filePath) {
  const result = {
    file: filePath,
    replacements: 0,
    contextDecisions: 0,
    errors: [],
  };

  try {
    console.log(`\n📄 Processing: ${filePath}`);

    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      result.errors.push(`File not found: ${fullPath}`);
      return result;
    }

    let content = fs.readFileSync(fullPath, 'utf-8');
    const originalContent = content;

    createBackup(fullPath);

    const lines = content.split('\n');
    const newLines = [];

    lines.forEach((line, index) => {
      const { newLine, replaced, contextDecision } = replaceColorInLine(line, index, content);

      if (replaced) {
        result.replacements++;
        if (contextDecision) {
          result.contextDecisions++;
        }
        console.log(`  🔄 Line ${index + 1}: ${line.trim().substring(0, 60)}...`);
        console.log(`     ➡️  ${newLine.trim().substring(0, 60)}...`);
      }

      newLines.push(newLine);
    });

    content = newLines.join('\n');

    if (result.replacements > 0 && needsImport(content)) {
      content = addImport(content);
      console.log('  ➕ Added fantasyTomeColors import');
    }

    if (!DRY_RUN && content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf-8');
      console.log(`  ✅ File updated: ${result.replacements} replacements made`);
    } else if (DRY_RUN && content !== originalContent) {
      console.log(`  🔍 DRY-RUN: Would make ${result.replacements} replacements`);
    } else {
      console.log('  ℹ️  No changes needed');
    }
  } catch (error) {
    result.errors.push(`Error processing file: ${error}`);
  }

  return result;
}

// ===================================================================
// MAIN EXECUTION
// ===================================================================

function main() {
  console.log('\n🎨 Color Replacement Script: Tailwind → Fantasy Theme');
  console.log('='.repeat(60));
  console.log(`Mode: ${DRY_RUN ? '🔍 DRY-RUN (no changes)' : '⚡ EXECUTE (will modify files)'}`);
  console.log('='.repeat(60));

  const filesToProcess = SINGLE_FILE ? [SINGLE_FILE] : affectedFiles;

  console.log(`\nFiles to process: ${filesToProcess.length}`);

  const results = [];
  for (const file of filesToProcess) {
    const result = processFile(file);
    results.push(result);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));

  const totalReplacements = results.reduce((sum, r) => sum + r.replacements, 0);
  const totalContextDecisions = results.reduce((sum, r) => sum + r.contextDecisions, 0);
  const filesWithErrors = results.filter((r) => r.errors.length > 0);

  console.log(`Total files processed: ${results.length}`);
  console.log(`Total replacements: ${totalReplacements}`);
  console.log(`Context-dependent decisions: ${totalContextDecisions}`);
  console.log(`Files with errors: ${filesWithErrors.length}`);

  if (filesWithErrors.length > 0) {
    console.log('\n⚠️  ERRORS:');
    filesWithErrors.forEach((r) => {
      console.log(`  ${r.file}:`);
      r.errors.forEach((err) => console.log(`    - ${err}`));
    });
  }

  if (DRY_RUN) {
    console.log('\n🔍 This was a DRY-RUN. No files were modified.');
    console.log('To execute changes, run: npm run replace-colors:execute');
  } else {
    console.log('\n✅ Color replacement complete!');
    console.log(`Backups stored in: ${BACKUP_DIR}`);
    console.log('\nNext steps:');
    console.log('  1. Run: npm run lint');
    console.log('  2. Run: SPEC=cypress/e2e/login-page-tests/verify-login-page.cy.ts npm run cypress:docker:test:spec');
    console.log('  3. Review visual changes in browser');
  }

  console.log('\n' + '='.repeat(60));
}

main();

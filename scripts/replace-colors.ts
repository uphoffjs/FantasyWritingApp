#!/usr/bin/env ts-node

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
 *   npm run replace-colors -- --file src/components/ErrorMessage.tsx  # Single file
 *
 * @see claudedocs/COLOR_MAPPING.md - Complete mapping documentation
 * @see scripts/colorMapping.ts - Mapping definitions
 */

import * as fs from 'fs';
import * as path from 'path';
import { tailwindToFantasyMap, contextRules, affectedFiles } from './colorMapping';

// ===================================================================
// CONFIGURATION
// ===================================================================

const DRY_RUN = !process.argv.includes('--execute');
const SINGLE_FILE = process.argv.find((arg) => arg.startsWith('--file='))?.split('=')[1];
const BACKUP_DIR = '.backup-color-migration';

interface ReplacementResult {
  file: string;
  replacements: number;
  contextDecisions: number;
  errors: string[];
}

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

/**
 * Create backup of file before modification
 */
function createBackup(filePath: string): void {
  if (DRY_RUN) return;

  const backupDir = path.join(process.cwd(), BACKUP_DIR);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupPath = path.join(backupDir, path.basename(filePath));
  fs.copyFileSync(filePath, backupPath);
  console.log(`  ✅ Backup created: ${backupPath}`);
}

/**
 * Check if file needs fantasyTomeColors import
 */
function needsImport(content: string): boolean {
  return !content.includes('fantasyTomeColors') && !content.includes('@/constants/fantasyTomeColors');
}

/**
 * Add fantasyTomeColors import to file
 */
function addImport(content: string): string {
  // Check if there's already a fantasyTomeColors import
  if (content.includes('fantasyTomeColors')) {
    return content;
  }

  // Find the last import statement
  const importRegex = /import\s+.*?from\s+['"].*?['"];?\n/g;
  const imports = content.match(importRegex);

  if (!imports || imports.length === 0) {
    // No imports found, add at the top
    return `import { fantasyTomeColors } from '@/constants/fantasyTomeColors';\n\n${content}`;
  }

  // Add after the last import
  const lastImport = imports[imports.length - 1];
  const lastImportIndex = content.lastIndexOf(lastImport);
  const insertPosition = lastImportIndex + lastImport.length;

  return (
    content.slice(0, insertPosition) +
    `import { fantasyTomeColors } from '@/constants/fantasyTomeColors';\n` +
    content.slice(insertPosition)
  );
}

/**
 * Determine if a color is used in a text context (color property)
 */
function isTextContext(line: string): boolean {
  return line.includes('color:') || line.includes('color =');
}

/**
 * Determine if a color is used in a background context
 */
function isBackgroundContext(line: string): boolean {
  return line.includes('backgroundColor:') || line.includes('backgroundColor =') || line.includes('background:');
}

/**
 * Determine if a color is used in a border context
 */
function isBorderContext(line: string): boolean {
  return (
    line.includes('borderColor:') ||
    line.includes('borderColor =') ||
    line.includes('borderTopColor:') ||
    line.includes('borderBottomColor:') ||
    line.includes('borderLeftColor:') ||
    line.includes('borderRightColor:')
  );
}

/**
 * Check if parent has dark background (for context-dependent colors)
 */
function hasDarkParentBackground(content: string, lineIndex: number): boolean {
  // Look for backgroundColor in surrounding lines (up to 10 lines before)
  const startLine = Math.max(0, lineIndex - 10);
  const lines = content.split('\n');
  const contextLines = lines.slice(startLine, lineIndex).join('\n');

  // Check for dark background colors
  return contextRules.whiteGray50.darkBackgrounds.some((darkBg) => contextLines.includes(darkBg));
}

/**
 * Replace color in a single line
 */
function replaceColorInLine(
  line: string,
  lineIndex: number,
  fileContent: string
): { newLine: string; replaced: boolean; contextDecision: boolean } {
  let newLine = line;
  let replaced = false;
  let contextDecision = false;

  // Handle context-dependent #F9FAFB
  if (line.includes('#F9FAFB')) {
    const isDarkParent = hasDarkParentBackground(fileContent, lineIndex);
    const replacement = isDarkParent
      ? contextRules.whiteGray50.onDark
      : contextRules.whiteGray50.onLight;

    newLine = line.replace(/#F9FAFB/g, replacement);
    replaced = true;
    contextDecision = true;
    console.log(`    📋 Context decision: #F9FAFB → ${replacement} (${isDarkParent ? 'dark' : 'light'} parent)`);
  }

  // Handle text colors
  if (isTextContext(line)) {
    for (const [tailwind, fantasy] of Object.entries(tailwindToFantasyMap.text)) {
      if (fantasy === 'CONTEXT') continue; // Already handled above
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

  // Handle semantic colors (error, success, info)
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
      // Keep transparent as-is
      newLine = newLine.replace(new RegExp(special.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fantasy);
      replaced = true;
    }
  }

  return { newLine, replaced, contextDecision };
}

/**
 * Process a single file
 */
function processFile(filePath: string): ReplacementResult {
  const result: ReplacementResult = {
    file: filePath,
    replacements: 0,
    contextDecisions: 0,
    errors: [],
  };

  try {
    console.log(`\n📄 Processing: ${filePath}`);

    // Read file
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      result.errors.push(`File not found: ${fullPath}`);
      return result;
    }

    let content = fs.readFileSync(fullPath, 'utf-8');
    const originalContent = content;

    // Create backup
    createBackup(fullPath);

    // Process line by line
    const lines = content.split('\n');
    const newLines: string[] = [];

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

    // Add import if needed and replacements were made
    if (result.replacements > 0 && needsImport(content)) {
      content = addImport(content);
      console.log('  ➕ Added fantasyTomeColors import');
    }

    // Write file (if not dry-run)
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

  // Determine files to process
  const filesToProcess = SINGLE_FILE ? [SINGLE_FILE] : affectedFiles;

  console.log(`\nFiles to process: ${filesToProcess.length}`);

  // Process files
  const results: ReplacementResult[] = [];
  for (const file of filesToProcess) {
    const result = processFile(file);
    results.push(result);
  }

  // Summary
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
    console.log('To execute changes, run: npm run replace-colors -- --execute');
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

// Run the script
main();

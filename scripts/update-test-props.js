#!/usr/bin/env node

/**
 * Script to update React Native components to use getTestProps helper
 * This ensures proper data-cy attributes on web for Cypress testing
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// * Track statistics
let filesProcessed = 0;
let filesUpdated = 0;
let testIDsReplaced = 0;

/**
 * Process a single file to update testID usage
 */
function processFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  let updatedContent = fileContent;
  let fileWasUpdated = false;

  // * Skip .web.tsx files that already use getTestProps
  if (filePath.includes('.web.tsx') && fileContent.includes('getTestProps')) {
    console.log(`⏭️  Skipping ${path.basename(filePath)} - Already uses getTestProps`);
    filesProcessed++;
    return;
  }

  // * Check if file has any testID usage
  if (!fileContent.includes('testID')) {
    filesProcessed++;
    return;
  }

  console.log(`\n📄 Processing ${path.basename(filePath)}...`);

  // * Add import for getTestProps if not present
  if (fileContent.includes('testID') && !fileContent.includes('getTestProps')) {
    // Find the last import statement
    const importRegex = /^import .* from .*;?\s*$/gm;
    let lastImportIndex = 0;
    let match;

    while ((match = importRegex.exec(updatedContent)) !== null) {
      lastImportIndex = match.index + match[0].length;
    }

    // * Add the getTestProps import after the last import
    if (lastImportIndex > 0) {
      const importStatement = "\nimport { getTestProps } from '../utils/react-native-web-polyfills';";

      // * Adjust path based on file location
      const depth = (filePath.match(/\//g) || []).length - (path.join(__dirname, '..', 'src/components').match(/\//g) || []).length - 1;
      const relativePath = depth > 0 ? '../'.repeat(depth) + 'utils/react-native-web-polyfills' : '../utils/react-native-web-polyfills';

      const adjustedImport = `\nimport { getTestProps } from '${relativePath}';`;

      updatedContent = updatedContent.slice(0, lastImportIndex) + adjustedImport + updatedContent.slice(lastImportIndex);
      fileWasUpdated = true;
      console.log(`  ✅ Added getTestProps import`);
    }
  }

  // * Replace direct testID usage with getTestProps
  // Pattern 1: testID={someVar}
  const testIDPattern1 = /testID=\{([^}]+)\}/g;
  let replacements1 = 0;
  updatedContent = updatedContent.replace(testIDPattern1, (match, variable) => {
    replacements1++;
    return `{...getTestProps(${variable})}`;
  });

  if (replacements1 > 0) {
    console.log(`  ✅ Replaced ${replacements1} testID={variable} patterns`);
    fileWasUpdated = true;
    testIDsReplaced += replacements1;
  }

  // * Pattern 2: testID="string"
  const testIDPattern2 = /testID="([^"]+)"/g;
  let replacements2 = 0;
  updatedContent = updatedContent.replace(testIDPattern2, (match, id) => {
    replacements2++;
    return `{...getTestProps('${id}')}`;
  });

  if (replacements2 > 0) {
    console.log(`  ✅ Replaced ${replacements2} testID="string" patterns`);
    fileWasUpdated = true;
    testIDsReplaced += replacements2;
  }

  // * Pattern 3: testID={`template-${var}`}
  const testIDPattern3 = /testID=\{`([^`]+)`\}/g;
  let replacements3 = 0;
  updatedContent = updatedContent.replace(testIDPattern3, (match, template) => {
    replacements3++;
    return `{...getTestProps(\`${template}\`)}`;
  });

  if (replacements3 > 0) {
    console.log(`  ✅ Replaced ${replacements3} testID={template} patterns`);
    fileWasUpdated = true;
    testIDsReplaced += replacements3;
  }

  // * Handle conditional testID usage
  // Pattern: testID={testID ? testID : undefined}
  const conditionalPattern = /testID=\{([^?]+)\s*\?\s*([^:]+)\s*:\s*undefined\s*\}/g;
  let replacements4 = 0;
  updatedContent = updatedContent.replace(conditionalPattern, (match, check, value) => {
    replacements4++;
    // If check and value are the same, simplify
    if (check.trim() === value.trim()) {
      return `{...(${check.trim()} ? getTestProps(${value.trim()}) : {})}`;
    }
    return `{...(${check} ? getTestProps(${value}) : {})}`;
  });

  if (replacements4 > 0) {
    console.log(`  ✅ Replaced ${replacements4} conditional testID patterns`);
    fileWasUpdated = true;
    testIDsReplaced += replacements4;
  }

  // * Handle optional testID prop in component interfaces
  // Don't replace interface definitions, only usages

  // * Write the file if it was updated
  if (fileWasUpdated) {
    fs.writeFileSync(filePath, updatedContent);
    filesUpdated++;
    console.log(`  ✅ File updated successfully`);
  } else {
    console.log(`  ℹ️  No changes needed`);
  }

  filesProcessed++;
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting React Native test props update...\n');
  console.log('📋 This script will:');
  console.log('  1. Add getTestProps imports where needed');
  console.log('  2. Replace testID props with getTestProps spread');
  console.log('  3. Ensure data-cy attributes work on web platform\n');

  // * Find all component files (excluding .web.tsx files that already use getTestProps)
  const componentFiles = glob.sync('src/components/**/*.tsx', {
    cwd: path.join(__dirname, '..'),
    absolute: true,
    ignore: [
      '**/node_modules/**',
      '**/*.test.tsx',
      '**/*.spec.tsx',
      '**/stories/**'
    ]
  });

  console.log(`📁 Found ${componentFiles.length} component files to process\n`);

  // * Process each file
  componentFiles.forEach(processFile);

  // * Also process screen files
  console.log('\n📁 Processing screen files...\n');
  const screenFiles = glob.sync('src/screens/**/*.tsx', {
    cwd: path.join(__dirname, '..'),
    absolute: true,
    ignore: [
      '**/node_modules/**',
      '**/*.test.tsx',
      '**/*.spec.tsx'
    ]
  });

  screenFiles.forEach(processFile);

  // * Print summary
  console.log('\n' + '='.repeat(50));
  console.log('✅ Update Complete!');
  console.log('='.repeat(50));
  console.log(`📊 Statistics:`);
  console.log(`  Files processed: ${filesProcessed}`);
  console.log(`  Files updated: ${filesUpdated}`);
  console.log(`  testIDs replaced: ${testIDsReplaced}`);

  if (filesUpdated > 0) {
    console.log('\n⚠️  Important Notes:');
    console.log('  1. Review the changes to ensure correctness');
    console.log('  2. Run tests to verify functionality');
    console.log('  3. Some complex patterns might need manual adjustment');
    console.log('  4. Components now properly expose data-cy on web!');
  } else {
    console.log('\n✨ All components already using proper test attributes!');
  }
}

// * Check if glob is installed
try {
  require.resolve('glob');
  main();
} catch (e) {
  console.error('❌ Missing dependency: glob');
  console.log('📦 Installing glob...');
  require('child_process').execSync('npm install glob', { stdio: 'inherit' });
  console.log('✅ Dependency installed. Please run the script again.');
  process.exit(0);
}
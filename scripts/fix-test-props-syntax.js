#!/usr/bin/env node

/**
 * Script to fix syntax errors in test props usage
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// * Find all affected files
const files = glob.sync('src/**/*.tsx', {
  cwd: path.join(__dirname, '..'),
  absolute: true
});

let filesFixed = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let fixed = content;

  // * Fix various malformed patterns
  // Pattern: ${testID)- should be ${testID}-
  fixed = fixed.replace(/\$\{testID\)\-/g, '${testID}-');

  // Pattern: getTestProps(testID} should be getTestProps(testID)}
  fixed = fixed.replace(/getTestProps\(testID\}/g, 'getTestProps(testID)}');

  // Pattern: getTestProps(testID) without closing brace
  fixed = fixed.replace(/\{\.\.\.getTestProps\(testID\)\s*([^}])/g, '{...getTestProps(testID)}$1');

  // Pattern: ${testID)  should be ${testID}
  fixed = fixed.replace(/\$\{testID\)/g, '${testID}');

  // Pattern: fix incomplete closing in templates
  fixed = fixed.replace(/getTestProps\(`\$\{testID\}\-([^`]+)`\}\)/g, 'getTestProps(`${testID}-$1`)}');

  if (fixed !== content) {
    fs.writeFileSync(file, fixed);
    console.log(`✅ Fixed ${path.basename(file)}`);
    filesFixed++;
  }
});

console.log(`\n📊 Fixed ${filesFixed} files`);
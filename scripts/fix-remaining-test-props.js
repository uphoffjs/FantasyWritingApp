#!/usr/bin/env node

/**
 * Fix remaining malformed getTestProps calls with template literals
 */

const fs = require('fs');
const path = require('path');

// Find all TypeScript/JavaScript files
function findFiles(dir, pattern) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip node_modules and other non-source directories
    if (entry.name === 'node_modules' ||
        entry.name === '.git' ||
        entry.name === 'dist' ||
        entry.name === 'build') {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...findFiles(fullPath, pattern));
    } else if (pattern.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

// Fix malformed template literals in getTestProps calls
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let changes = 0;

  // Pattern 1: Fix template literals with missing closing parenthesis
  // {...getTestProps(`${something}`} -> {...getTestProps(`${something}`)}
  const pattern1 = /\{\.\.\.getTestProps\(`\$\{[^}]+\}`\}/g;
  content = content.replace(pattern1, (match) => {
    const fixed = match.slice(0, -1) + ')}';
    if (fixed !== match) changes++;
    return fixed;
  });

  // Pattern 2: Fix template literals with string concatenation missing closing parenthesis
  // {...getTestProps(`${something}-text`} -> {...getTestProps(`${something}-text`)}
  const pattern2 = /\{\.\.\.getTestProps\(`\$\{[^}]+\}[^`]*`\}/g;
  content = content.replace(pattern2, (match) => {
    const fixed = match.slice(0, -1) + ')}';
    if (fixed !== match) changes++;
    return fixed;
  });

  // Pattern 3: Fix getTestProps without spread operator missing closing parenthesis
  // getTestProps(`${something}`} -> getTestProps(`${something}`)
  const pattern3 = /getTestProps\(`\$\{[^}]+\}`\}(?!\))/g;
  content = content.replace(pattern3, (match) => {
    const fixed = match.slice(0, -1) + ')';
    return fixed;
  });

  // Pattern 4: Fix getTestProps with string concatenation without spread missing closing parenthesis
  // getTestProps(`${something}-text`} -> getTestProps(`${something}-text`)
  const pattern4 = /getTestProps\(`\$\{[^}]+\}[^`]*`\}(?!\))/g;
  content = content.replace(pattern4, (match) => {
    const fixed = match.slice(0, -1) + ')';
    return fixed;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${changes} issues in ${filePath}`);
    return true;
  }

  return false;
}

// Main execution
const srcDir = path.join(__dirname, '..', 'src');
const files = [
  ...findFiles(srcDir, /\.(tsx?|jsx?)$/),
];

let totalFixed = 0;
for (const file of files) {
  if (fixFile(file)) {
    totalFixed++;
  }
}

console.log(`\nFixed ${totalFixed} files total`);
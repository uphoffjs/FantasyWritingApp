#!/usr/bin/env node

/**
 * Fix malformed function calls with missing closing parentheses
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

// Fix malformed function calls
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let changes = 0;

  // Pattern 1: Fix arrow function calls with object property missing closing parenthesis
  // () => someFunction(obj.prop} -> () => someFunction(obj.prop)}
  const pattern1 = /\(\) => \w+\([a-zA-Z_$][a-zA-Z0-9_$]*\.[a-zA-Z_$][a-zA-Z0-9_$]*\}/g;
  content = content.replace(pattern1, (match) => {
    const fixed = match.slice(0, -1) + ')}';
    changes++;
    return fixed;
  });

  // Pattern 2: Fix onClick handlers with function calls missing closing parenthesis
  // onClick={() => handleSomething(param} -> onClick={() => handleSomething(param)}
  const pattern2 = /onClick=\{?\(\) => \w+\([^)]*\}(?!\))/g;
  content = content.replace(pattern2, (match) => {
    const fixed = match.slice(0, -1) + ')}';
    changes++;
    return fixed;
  });

  // Pattern 3: Fix onPress handlers with function calls missing closing parenthesis
  // onPress={() => handleSomething(param} -> onPress={() => handleSomething(param)}
  const pattern3 = /onPress=\{?\(\) => \w+\([^)]*\}(?!\))/g;
  content = content.replace(pattern3, (match) => {
    const fixed = match.slice(0, -1) + ')}';
    changes++;
    return fixed;
  });

  // Pattern 4: Fix onChange handlers with function calls missing closing parenthesis
  const pattern4 = /onChange=\{?\(\) => \w+\([^)]*\}(?!\))/g;
  content = content.replace(pattern4, (match) => {
    const fixed = match.slice(0, -1) + ')}';
    changes++;
    return fixed;
  });

  // Pattern 5: Fix any event handler pattern
  const pattern5 = /on[A-Z][a-zA-Z]*=\{?\(\) => \w+\([^)]*\}(?!\))/g;
  content = content.replace(pattern5, (match) => {
    const fixed = match.slice(0, -1) + ')}';
    changes++;
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
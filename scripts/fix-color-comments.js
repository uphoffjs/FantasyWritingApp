#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix malformed color comments
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix broken color values with comments
    const fixes = [
      // Fix malformed color strings
      {
        from: /color="\s*\/\/ ! HARDCODED: Should use design tokens\s*\n\s*(#[A-Fa-f0-9]{6})"/g,
        to: '// ! HARDCODED: Should use design tokens\n          color="$1"'
      },
      {
        from: /backgroundColor:\s*'\/\/ ! HARDCODED: Should use design tokens\s*\n\s*(#[A-Fa-f0-9]{6})'/g,
        to: '// ! HARDCODED: Should use design tokens\n    backgroundColor: \'$1\''
      },
      {
        from: /borderColor:\s*'\/\/ ! HARDCODED: Should use design tokens\s*\n\s*(#[A-Fa-f0-9]{6})'/g,
        to: '// ! HARDCODED: Should use design tokens\n    borderColor: \'$1\''
      },
      {
        from: /color:\s*'\/\/ ! HARDCODED: Should use design tokens\s*\n\s*(#[A-Fa-f0-9]{6})'/g,
        to: '// ! HARDCODED: Should use design tokens\n    color: \'$1\''
      },
      {
        from: /tintColor="\s*\/\/ ! HARDCODED: Should use design tokens\s*\n\s*(#[A-Fa-f0-9]{6})"/g,
        to: '// ! HARDCODED: Should use design tokens\n              tintColor="$1"'
      },
      {
        from: /colors=\{\['\s*\/\/ ! HARDCODED: Should use design tokens\s*\n\s*(#[A-Fa-f0-9]{6})'\]\}/g,
        to: '// ! HARDCODED: Should use design tokens\n              colors={[\'$1\']}'
      },
      {
        from: /placeholderTextColor="\s*\/\/ ! HARDCODED: Should use design tokens\s*\n\s*(#[A-Fa-f0-9]{6})"/g,
        to: '// ! HARDCODED: Should use design tokens\n          placeholderTextColor="$1"'
      },
      
      // Fix double comments
      {
        from: /\/\/ \? TODO: \/\/ \? TODO:/g,
        to: '// ? TODO:'
      },
      {
        from: /\/\/ ! SECURITY: \/\/ ! SECURITY:/g,
        to: '// ! SECURITY:'
      },
      {
        from: /\/\/ \* \/\/ \*/g,
        to: '// *'
      }
    ];
    
    fixes.forEach(fix => {
      const newContent = content.replace(fix.from, fix.to);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let fixedCount = 0;
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(item)) {
          walkDir(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          if (fixFile(fullPath)) {
            fixedCount++;
          }
        }
      }
    });
  }
  
  walkDir(dirPath);
  return fixedCount;
}

console.log('🔧 Fixing malformed color comments...\n');

const srcDir = path.join(__dirname, '..', 'src');
const cypressDir = path.join(__dirname, '..', 'cypress');

console.log('📁 Processing src/ directory...');
const srcFixed = processDirectory(srcDir);

console.log('\n📁 Processing cypress/ directory...');
const cypressFixed = processDirectory(cypressDir);

console.log(`\n✨ Fixed ${srcFixed + cypressFixed} files total.`);
console.log(`   - src/: ${srcFixed} files`);
console.log(`   - cypress/: ${cypressFixed} files`);
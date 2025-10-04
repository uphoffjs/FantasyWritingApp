#!/usr/bin/env node

// * Script to check if any protected files have been modified
// ! This script is critical for preventing unauthorized changes to protected files

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// * Load protected files configuration
const configPath = path.join(__dirname, 'protected-files.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log('🛡️  Checking for modifications to protected files...\n');

try {
  // * Get list of staged files
  const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);

  if (stagedFiles.length === 0) {
    console.log('✅ No staged files to check\n');
    process.exit(0);
  }

  // * Check if any staged files are protected
  const protectedModifications = [];

  for (const file of stagedFiles) {
    const protection = config.protected.find(p => p.path === file);
    if (protection) {
      protectedModifications.push({
        file: file,
        reason: protection.reason
      });
    }
  }

  if (protectedModifications.length > 0) {
    console.error('❌ ERROR: Attempt to modify protected files detected!\n');
    console.error('The following protected files have been modified:\n');

    protectedModifications.forEach(({ file, reason }) => {
      console.error(`  ❌ ${file}`);
      console.error(`     Reason: ${reason}\n`);
    });

    console.error('🚫 These files are protected and cannot be modified through normal commits.');
    console.error('📋 To modify these files, you must:');
    console.error('   1. Unstage the protected files: git reset HEAD <file>');
    console.error('   2. Contact the project maintainer for special approval');
    console.error('   3. Follow the documented exception process\n');

    process.exit(1);
  }

  console.log('✅ No protected files modified\n');
  process.exit(0);

} catch (error) {
  console.error('❌ Error checking protected files:', error.message);
  process.exit(1);
}

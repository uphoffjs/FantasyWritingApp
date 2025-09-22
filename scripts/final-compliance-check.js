#!/usr/bin/env node

/**
 * Final compliance check for Cypress component tests
 * Verifies all compliance requirements are met
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();

// Compliance rules to check
const COMPLIANCE_RULES = {
  debugCommand: {
    pattern: /cy\.comprehensiveDebug\(\)/,
    message: 'Missing cy.comprehensiveDebug() in beforeEach'
  },
  cleanState: {
    pattern: /cy\.cleanState\(\)/,
    message: 'Missing cy.cleanState() in beforeEach'
  },
  failureCapture: {
    pattern: /cy\.captureFailureDebug\(\)/,
    message: 'Missing cy.captureFailureDebug() in afterEach'
  },
  beforeEachHook: {
    pattern: /beforeEach\(function\(\)/,
    message: 'Missing beforeEach hook with function() syntax'
  },
  afterEachHook: {
    pattern: /afterEach\(function\(\)/,
    message: 'Missing afterEach hook with function() syntax'
  },
  noConsoleLogs: {
    pattern: /console\.log\(/,
    message: 'Contains console.log statements',
    shouldNotMatch: true
  },
  noTestConditionals: {
    pattern: /\bif\s*\([^)]*\.should\(['"]/,
    message: 'Contains conditional test assertions (should use direct assertions)',
    shouldNotMatch: true
  }
};

function checkFileCompliance(filePath) {
  const fullPath = path.join(PROJECT_ROOT, filePath);

  if (!fs.existsSync(fullPath)) {
    return { filePath, compliant: false, errors: ['File not found'] };
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const errors = [];

  // Check each compliance rule
  Object.entries(COMPLIANCE_RULES).forEach(([ruleName, rule]) => {
    const matches = content.match(rule.pattern);

    if (rule.shouldNotMatch) {
      // Rule should NOT match (e.g., no console.log)
      if (matches) {
        errors.push(rule.message);
      }
    } else {
      // Rule should match (e.g., has cy.comprehensiveDebug)
      if (!matches) {
        errors.push(rule.message);
      }
    }
  });

  return {
    filePath,
    compliant: errors.length === 0,
    errors
  };
}

function getAllTestFiles() {
  function findTestFiles(dir) {
    const files = [];
    const dirents = fs.readdirSync(dir, { withFileTypes: true });

    for (const dirent of dirents) {
      const fullPath = path.join(dir, dirent.name);
      if (dirent.isDirectory()) {
        files.push(...findTestFiles(fullPath));
      } else if (dirent.name.endsWith('.cy.tsx')) {
        files.push(path.relative(PROJECT_ROOT, fullPath));
      }
    }
    return files;
  }

  return findTestFiles(path.join(PROJECT_ROOT, 'cypress/component'));
}

function generateComplianceReport() {
  console.log('🔍 Running final compliance check for Cypress component tests...\n');

  const testFiles = getAllTestFiles();
  const results = testFiles.map(checkFileCompliance);

  const compliantFiles = results.filter(r => r.compliant);
  const nonCompliantFiles = results.filter(r => !r.compliant);

  const compliancePercentage = Math.round((compliantFiles.length / results.length) * 100);

  console.log(`📊 COMPLIANCE REPORT`);
  console.log(`==================`);
  console.log(`Total files: ${results.length}`);
  console.log(`Compliant: ${compliantFiles.length}`);
  console.log(`Non-compliant: ${nonCompliantFiles.length}`);
  console.log(`Compliance rate: ${compliancePercentage}%\n`);

  if (nonCompliantFiles.length > 0) {
    console.log(`❌ NON-COMPLIANT FILES (${nonCompliantFiles.length}):`);
    console.log(`=====================================`);

    nonCompliantFiles.forEach(file => {
      console.log(`\n📁 ${file.filePath}`);
      file.errors.forEach(error => {
        console.log(`   ❌ ${error}`);
      });
    });

    console.log(`\n🔧 RECOMMENDED ACTIONS:`);
    console.log(`========================`);

    // Count error types
    const errorCounts = {};
    nonCompliantFiles.forEach(file => {
      file.errors.forEach(error => {
        errorCounts[error] = (errorCounts[error] || 0) + 1;
      });
    });

    Object.entries(errorCounts).forEach(([error, count]) => {
      console.log(`${count} files: ${error}`);
    });

  } else {
    console.log(`✅ ALL FILES ARE COMPLIANT!`);
    console.log(`🎉 100% compliance achieved!`);
  }

  // Summary
  console.log(`\n📈 SUMMARY`);
  console.log(`===========`);
  if (compliancePercentage === 100) {
    console.log(`🎯 TARGET ACHIEVED: 100% compliance reached!`);
    console.log(`🚀 All Cypress component tests follow the required standards.`);
  } else {
    console.log(`🎯 TARGET: 100% compliance`);
    console.log(`📊 CURRENT: ${compliancePercentage}% compliance`);
    console.log(`📈 PROGRESS: ${nonCompliantFiles.length} files remaining`);
  }

  return {
    totalFiles: results.length,
    compliantFiles: compliantFiles.length,
    nonCompliantFiles: nonCompliantFiles.length,
    compliancePercentage,
    isFullyCompliant: compliancePercentage === 100,
    results
  };
}

if (require.main === module) {
  const report = generateComplianceReport();
  process.exit(report.isFullyCompliant ? 0 : 1);
}

module.exports = { checkFileCompliance, generateComplianceReport };
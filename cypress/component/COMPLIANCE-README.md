# Cypress Component Test Compliance Guide

## 🎯 Overview

This directory contains 70+ component test files that must follow strict Cypress best practices. This guide provides tools and processes to ensure 100% compliance with the documented testing standards.

## 📋 Compliance Requirements

All component tests MUST:

2. ✅ Include `cy.comprehensiveDebug()` in `beforeEach`
3. ✅ Include `cy.cleanState()` in `beforeEach`
4. ✅ Include failure capture in `afterEach`
5. ✅ Use `function()` syntax in hooks (not arrow functions)
6. ✅ Have NO conditional statements (if/else)
7. ✅ Have NO `console.log` statements
8. ✅ Include documentation headers with user stories

## 🛠 Available Tools

### 1. **TODO.md** - Comprehensive Task List
- Detailed list of all compliance issues
- Prioritized by severity (P0-P3)
- Implementation plan with timeline
- Progress tracking metrics

### 2. **validate-compliance.js** - Validation Script
Checks all test files for compliance violations:

```bash
# First install dependency
npm install --save-dev glob

# Run validation
node validate-compliance.js
```

**Output includes:**
- File-by-file compliance status
- Detailed violations report
- Overall compliance score (percentage)
- Fix suggestions

### 3. **fix-compliance.js** - Automated Fix Script
Automatically fixes most compliance issues:

```bash
# First install dependency (if not already installed)
npm install --save-dev glob

# Run automatic fixes
node fix-compliance.js
```

**Fixes applied:**
- Replaces `data-testid` with `data-cy`
- Adds mandatory debug commands
- Adds failure capture hooks
- Fixes function syntax in hooks
- Adds documentation headers (template)

**Manual review required for:**
- Conditional statements (if/else)
- Console.log statements
- User story details in headers

## 📊 Current Status

As of initial assessment:
- **Total Files**: 70+
- **Compliance**: ~5%
- **Main Issues**:
  - 100% using wrong selectors (data-testid)
  - 95% missing debug commands
  - 100% missing failure capture
  - 90% missing documentation headers

## 🚀 Quick Start Guide

### Step 1: Assess Current Status
```bash
node validate-compliance.js
```

### Step 2: Apply Automatic Fixes
```bash
node fix-compliance.js
```

### Step 3: Manual Review
1. Review changes made by the script
2. Update documentation headers with actual user stories
3. Fix any conditional statements manually
4. Remove console.log statements

### Step 4: Validate Compliance
```bash
node validate-compliance.js
```

### Step 5: Run Tests
```bash
npm run cypress:component
```

## 📝 Manual Fix Examples

### Fixing Selectors
```typescript
// ❌ WRONG
cy.get('[data-testid="element-card"]')

// ✅ CORRECT
cy.get('[data-cy="element-card"]')
```

### Adding Debug Commands
```typescript
beforeEach(function() {  // Note: function(), not arrow
  // ! MANDATORY: Comprehensive debug setup
  cy.comprehensiveDebug();

  // * Clean state before each test
  cy.cleanState();

  // Your other setup...
});
```

### Adding Failure Capture
```typescript
afterEach(function() {
  // ! Capture debug info if test failed
  if (this.currentTest.state === 'failed') {
    cy.captureFailureDebug();
  }
});
```

### Removing Conditionals
```typescript
// ❌ WRONG
it('should handle optional data', () => {
  if (data) {
    cy.get('[data-cy="data"]').should('exist');
  }
});

// ✅ CORRECT - Use separate tests
it('should handle data when present', () => {
  cy.get('[data-cy="data"]').should('exist');
});

it('should handle missing data', () => {
  cy.get('[data-cy="no-data"]').should('exist');
});
```

## 🎯 Success Criteria

The component tests are considered compliant when:

```bash
node validate-compliance.js
# Shows: 100% compliance
# Shows: 0 violations
# Exit code: 0
```

## 🔄 CI/CD Integration

Add to your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Validate Cypress Compliance
  run: |
    cd cypress/component
    npm install --save-dev glob
    node validate-compliance.js
```

## 📚 Reference Documentation

- [Cypress Best Practices](../docs/cypress-best-practices.md)
- [Advanced Testing Strategy](../docs/ADVANCED-TESTING-STRATEGY.md)
- [Project Guidelines](../../CLAUDE.md)

## ⚠️ Important Notes

1. **Server Requirement**: Always start the dev server before running tests:
   ```bash
   npm run web  # Port 3002
   ```

2. **React Native**: Components use `testID` prop which converts to `data-cy` on web

3. **Session Management**: Use `cy.session()` for authentication caching

4. **Test Isolation**: Each test must be completely independent

## 🆘 Troubleshooting

### Tests failing after fixes?
1. Ensure dev server is running (`npm run web`)
2. Check that custom commands are properly imported
3. Verify `cy.comprehensiveDebug()` command exists in support files

### Selectors not working?
- Components must use `testID` prop (React Native)
- Tests must use `data-cy` selector
- The conversion happens automatically on web platform

### Debug commands not found?
Check that `/cypress/support/commands/debug.ts` is imported in:
- `/cypress/support/commands/index.ts`
- `/cypress/support/e2e.ts`

## 📈 Progress Tracking

Track your progress:
1. Run validation before starting: `node validate-compliance.js > before.txt`
2. Apply fixes: `node fix-compliance.js`
3. Run validation after: `node validate-compliance.js > after.txt`
4. Compare: `diff before.txt after.txt`

---

*For questions or issues, refer to the main project documentation or the Cypress best practices guide.*
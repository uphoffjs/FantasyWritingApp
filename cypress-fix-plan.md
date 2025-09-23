# Cypress Component Test Fix Plan

**Created**: September 23, 2025
**Priority**: URGENT - All tests are currently blocked

## 🚨 Immediate Fix Required

### Problem
The `factoryTasks` object is imported but not being registered in the component test configuration.

### Root Cause
In `cypress.config.ts`, the factory tasks are imported at line 3:
```typescript
import { factoryTasks } from "./cypress/fixtures/factories";
```

However, they are only registered in the E2E configuration (line 50), NOT in the component configuration (line 121).

### Solution

**File**: `/cypress.config.ts`

**Current Component Config** (line 100-133):
```typescript
setupNodeEvents(on, config) {
  codeCoverageTask(on, config);

  on("task", {
    log(message) { ... },
    logRNWarning(message) { ... },
    clearRNCache() { ... },
    // MISSING: ...factoryTasks
  });
```

**Required Fix**:
```typescript
setupNodeEvents(on, config) {
  codeCoverageTask(on, config);

  on("task", {
    log(message) { ... },
    logRNWarning(message) { ... },
    clearRNCache() { ... },
    ...factoryTasks,  // ADD THIS LINE
  });
```

## Fix Implementation Steps

### Step 1: Apply Factory Task Fix (2 minutes)
```bash
# Edit cypress.config.ts
# Add ...factoryTasks to line 121 in component.setupNodeEvents
```

### Step 2: Verify Single Test (2 minutes)
```bash
# Test with simplest component
npm run test:component:electron -- --spec "cypress/component/ui/Button.cy.tsx"
```

### Step 3: Fix Module Resolution Errors (15 minutes)

#### Missing Components to Check:
1. **element-editor components**:
   ```bash
   find src -type f -name "*Element*" | grep -E "(Footer|Images|Relationships|Tags)"
   ```

2. **Missing UI components**:
   ```bash
   find src -type f -name "*Modal*" | grep Link
   find src -type f -name "*Header*"
   find src -type f -name "*SpeciesSelector*"
   ```

#### Quick Fix Options:
- **Option A**: If components don't exist, comment out failing tests
- **Option B**: Create mock components for testing
- **Option C**: Update import paths to correct locations

### Step 4: Test Categories Progressively (30 minutes)

#### Testing Order (simplest to complex):
1. **UI Components** (Button, LoadingSpinner)
   ```bash
   npm run test:component:electron -- --spec "cypress/component/ui/Button.cy.tsx"
   ```

2. **Error Components** (ErrorMessage, ErrorBoundary)
   ```bash
   npm run test:component:electron -- --spec "cypress/component/errors/*.cy.tsx"
   ```

3. **Form Components** (TextInput, BasicQuestionsSelector)
   ```bash
   npm run test:component:electron -- --spec "cypress/component/forms/*.cy.tsx"
   ```

4. **Complex Components** (ProjectList, ElementBrowser)
   ```bash
   npm run test:component:electron -- --spec "cypress/component/projects/*.cy.tsx"
   ```

## Module Resolution Fix Details

### Pattern 1: Incorrect Path Depth
**Issue**: `../../../src/components/Header`
**Check**: Count directory levels from test file to src/
```bash
# From cypress/component/navigation/ to src/ is 3 levels up
# Verify: ls ../../../src/components/Header* from test directory
```

### Pattern 2: Missing File Extensions
**Issue**: Some imports might need explicit extensions
**Fix**: Add `.tsx` or `/index.tsx` to imports

### Pattern 3: Moved/Renamed Components
**Quick Discovery Script**:
```bash
#!/bin/bash
# Find all potentially missing components
MISSING_COMPONENTS=(
  "ElementFooter"
  "ElementImages"
  "ElementRelationships"
  "ElementTags"
  "LinkModal"
  "SpeciesSelector"
  "Header"
  "EmailVerificationBanner"
  "MigrationPrompt"
  "AccountMenu"
)

for component in "${MISSING_COMPONENTS[@]}"; do
  echo "Searching for: $component"
  find src -name "*${component}*" -type f | head -5
  echo "---"
done
```

## Verification Checklist

### After Factory Fix:
- [ ] No more `factory:reset` errors
- [ ] Tests run but may fail for other reasons
- [ ] Can see actual test assertions running

### After Module Resolution:
- [ ] No webpack compilation errors
- [ ] All 73 spec files load successfully
- [ ] Can see test descriptions in output

### After Full Fix:
- [ ] At least 50% of tests passing
- [ ] No systematic configuration errors
- [ ] Test suite completes in < 10 minutes

## Alternative Quick Solutions

### Option 1: Bypass Factory System (5 minutes)
```typescript
// cypress/support/factory-helpers.ts
export function registerFactoryHooks() {
  beforeEach(() => {
    // cy.task('factory:reset');  // Comment out
    // Or provide a no-op implementation
    cy.window().then(() => {
      // Reset any in-memory state
    });
  });
}
```

### Option 2: Create Minimal Factory Tasks (10 minutes)
```typescript
// cypress.config.ts - Add to component section
on("task", {
  'factory:reset': () => null,
  'factory:create': () => ({}),
  'factory:scenario': () => ({ project: {}, stories: [], characters: [] }),
  'factory:seed': () => ({ stories: [], characters: [], projects: [], elements: [] }),
  // ... other tasks
});
```

### Option 3: Skip Component Tests Temporarily
Focus on E2E tests if they're working:
```bash
npm run test:e2e
```

## Expected Outcomes

### After Immediate Fix (5 minutes):
- Factory task errors eliminated
- Tests attempt to run actual assertions
- Can identify real test failures vs configuration issues

### After Module Fixes (30 minutes):
- All spec files compile successfully
- Can run full test suite
- Get accurate pass/fail metrics

### After Test Updates (2-4 hours):
- 80%+ tests passing
- Clear understanding of actual component issues
- Actionable list of component bugs

## Risk Mitigation

**If factory fix doesn't work:**
- Check if factoryTasks export exists and is correct
- Verify no TypeScript errors in factory files
- Try minimal factory implementation first

**If module resolution persists:**
- Create temporary mock components
- Skip failing specs temporarily
- Focus on working test categories

**If tests still fail after fixes:**
- Components may have actual bugs
- Review recent code changes
- Check if test expectations are outdated

## Summary

The primary issue is a simple configuration oversight - factory tasks are imported but not registered for component tests. This single-line fix will unblock ALL tests. Secondary module resolution issues affect ~20% of tests and can be fixed incrementally.

**Total estimated fix time**:
- Critical fix: 2 minutes
- Module resolution: 30 minutes
- Full validation: 1 hour

**Success criteria**:
After applying the factory task fix, you should immediately see tests attempting to run actual test logic instead of failing on the beforeEach hook.
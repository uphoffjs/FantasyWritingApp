# Mutation Testing Guide

**Purpose**: Validate that Cypress tests correctly catch real component failures by systematically breaking source code and verifying tests fail as expected.

**Target Audience**: Developers implementing or validating E2E test quality
**Last Updated**: 2025-10-06
**Version**: 1.0

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Why Mutation Testing](#why-mutation-testing)
3. [When to Use Mutation Testing](#when-to-use-mutation-testing)
4. [Prerequisites](#prerequisites)
5. [Mutation Testing Workflow](#mutation-testing-workflow)
6. [Git-Based Safety Strategy](#git-based-safety-strategy)
7. [Helper Script Reference](#helper-script-reference)
8. [Documentation Templates](#documentation-templates)
9. [Common Mutation Types](#common-mutation-types)
10. [Component-Specific Patterns](#component-specific-patterns)
11. [Troubleshooting](#troubleshooting)
12. [Examples](#examples)

---

## Overview

**Mutation Testing** is a quality assurance technique that validates test effectiveness by:

1. **Introducing controlled defects** (mutations) into source code
2. **Running existing tests** against the mutated code
3. **Verifying tests fail** when they should catch the defect
4. **Documenting gaps** where tests pass despite broken code

**Expected Outcome**: Tests should **FAIL** when components are broken. If tests **PASS** despite mutations, it indicates missing test coverage or weak assertions.

---

## Why Mutation Testing

### The Problem

- ✅ **Tests pass** = Confidence in code quality?
- ❌ **Reality**: Tests might pass even when critical functionality is broken
- ❓ **Question**: How do we know our tests actually validate what they claim to test?

### The Solution

Mutation testing answers: **"Do our tests catch real bugs?"**

### Benefits

1. **Validates Test Quality**: Proves tests detect actual failures
2. **Identifies Missing Assertions**: Finds gaps in test validation
3. **Prevents False Confidence**: Exposes weak tests before production bugs
4. **Improves Test Robustness**: Guides test improvement priorities
5. **One-Time Investment**: Upfront effort prevents ongoing production issues

### ROI Calculation

- **Time Investment**: 10-20 hours for comprehensive mutation testing
- **Cost Savings**: 1 production bug caught = hours of debugging, hotfixes, customer impact
- **Confidence Gain**: Quantifiable test quality metrics (% mutations caught)

---

## When to Use Mutation Testing

### ✅ Ideal Scenarios

1. **New Test Suite Validation**: Validate comprehensive test suites after creation
2. **Critical Path Testing**: Verify tests for auth, payments, data integrity
3. **Pre-Production**: One-time validation before major releases
4. **Test Quality Audit**: Periodic assessment of test effectiveness
5. **After Major Refactoring**: Ensure tests still validate correctly

### ❌ Not Recommended For

1. **Every Code Change**: Too time-intensive for routine development
2. **Rapidly Changing Features**: Wait until feature stabilizes
3. **Low-Risk Components**: Focus on critical paths first
4. **Temporary/Prototype Code**: Only test production-bound code

### Decision Framework

```
┌─────────────────────────────────────────────┐
│ Is this a critical path component?         │
│ (auth, payments, data, core features)      │
└──────────────┬─────────────────────────────┘
               │
          Yes  │  No → Skip mutation testing
               │
               ▼
┌─────────────────────────────────────────────┐
│ Are Cypress tests implemented?             │
└──────────────┬─────────────────────────────┘
               │
          Yes  │  No → Implement tests first
               │
               ▼
┌─────────────────────────────────────────────┐
│ Has component stabilized?                   │
│ (not changing daily)                        │
└──────────────┬─────────────────────────────┘
               │
          Yes  │  No → Wait for stabilization
               │
               ▼
        ✅ PERFORM MUTATION TESTING
```

---

## Prerequisites

### Required Tools

- ✅ **Git**: Version control for safe mutation workflow
- ✅ **Cypress**: E2E testing framework
- ✅ **Docker** (recommended): Consistent test environment
- ✅ **npm**: Package manager for running tests

### Required Knowledge

- ✅ Understanding of component structure
- ✅ Familiarity with Cypress test syntax
- ✅ Basic Git branching and checkout commands
- ✅ Knowledge of `data-cy` attribute testing pattern

### Required State

- ✅ All Cypress tests passing
- ✅ Clean working directory (`git status` clean)
- ✅ Development server runnable (`npm run web`)
- ✅ Docker installed (if using Docker test strategy)

### Pre-Flight Checklist

```bash
# 1. Verify tests pass
npm run cypress:run

# 2. Check Git status
git status  # Should show clean working tree

# 3. Verify on main/dev branch (not feature branch)
git branch  # Should be on main or dev

# 4. Test server starts
npm run web  # Should start without errors
```

---

## Mutation Testing Workflow

### Phase 1: Setup (30 minutes)

#### Step 1.1: Create Isolated Branch

```bash
# Ensure on main/dev branch
git checkout main
git pull

# Create temporary mutation testing branch
git checkout -b mutation-testing

# Verify branch creation
git branch  # Should show * mutation-testing
```

**Why**: Isolation prevents accidental commits of broken code.

#### Step 1.2: Set Up Documentation Structure

```bash
# Create mutation testing directory
mkdir -p claudedocs/mutation-testing/reports

# Create tracking file
touch claudedocs/mutation-testing/SUMMARY.md
```

#### Step 1.3: Identify Components to Test

```bash
# List all Cypress E2E tests
ls -la cypress/e2e/**/*.cy.ts

# For each test, identify tested component
# Example: verify-login-page.cy.ts → LoginScreen.tsx
```

Create inventory file:

```markdown
# claudedocs/mutation-testing/component-inventory.md

| Test File                | Component File                    | Priority | Status  |
| ------------------------ | --------------------------------- | -------- | ------- |
| verify-login-page.cy.ts  | src/screens/LoginScreen.tsx       | P0       | Pending |
| project-list-tests.cy.ts | src/screens/ProjectListScreen.tsx | P1       | Pending |
```

---

### Phase 2: Planning (1-2 hours)

#### Step 2.1: Analyze Component Structure

For each component, identify:

1. **UI Elements**: Inputs, buttons, text displays
2. **Data Attributes**: All `data-cy` attributes
3. **Behaviors**: Event handlers, navigation, validation
4. **Conditional Logic**: Error states, loading states, empty states
5. **State Management**: Store interactions, localStorage

#### Step 2.2: Define Mutation Categories

**Category 1: UI Element Removal**

- Remove input fields
- Remove buttons
- Remove text displays
- Remove images/icons

**Category 2: Data Attribute Modification**

- Remove `data-cy` attributes
- Change `data-cy` values
- Remove `testID` (React Native)

**Category 3: Text Content Changes**

- Change button text
- Change labels
- Change error messages
- Change headings

**Category 4: Behavior Breaking**

- Disable event handlers
- Break navigation
- Remove form submission
- Break validation logic

**Category 5: Conditional Rendering**

- Remove error display
- Remove loading indicators
- Remove empty state handling

#### Step 2.3: Create Mutation Plan

For each component, document planned mutations:

```markdown
# LoginScreen Mutation Plan

## Component: src/screens/LoginScreen.tsx

## Test: cypress/e2e/login-page-tests/verify-login-page.cy.ts

### Planned Mutations (15 total)

**UI Elements:**

1. Remove email TextInput → Expect: timeout finding [data-cy=email-input]
2. Remove password TextInput → Expect: timeout finding [data-cy=password-input]
3. Remove submit button → Expect: timeout finding [data-cy=submit-btn]

**Data Attributes:** 4. Remove data-cy="email-input" → Expect: selector not found 5. Remove data-cy="password-input" → Expect: selector not found 6. Remove data-cy="submit-btn" → Expect: selector not found

**Text Content:** 7. Change button "Login" → "Sign In" → Expect: text assertion fails

**Behaviors:** 8. Comment out onSubmit handler → Expect: timeout waiting for navigation 9. Break navigation (remove navigate call) → Expect: URL assertion fails 10. Remove validation → Expect: validation test fails

**Conditional Rendering:** 11. Remove error message Text → Expect: error visibility assertion fails 12. Remove loading state → Expect: loading indicator test fails

**Edge Cases:** 13. Change error message text → Expect: error text assertion fails 14. Remove "Remember Me" switch → Expect: switch test fails 15. Break session persistence → Expect: persistence test fails
```

---

### Phase 3: Execution (6-12 hours)

#### Per-Component Workflow

```bash
# Mutation testing loop for each component

for mutation in mutation_list; do
  # 1. Edit component (introduce mutation)
  # Manual: Edit src/screens/LoginScreen.tsx

  # 2. Run specific test
  SPEC=cypress/e2e/login-page-tests/verify-login-page.cy.ts npm run cypress:docker:test:spec

  # 3. Document result
  # - Did test FAIL? ✅ GOOD (mutation caught)
  # - Did test PASS? ❌ BAD (mutation not caught)

  # 4. Restore immediately
  git checkout src/screens/LoginScreen.tsx

  # 5. Verify restoration
  git status  # Should show clean

  # 6. Continue to next mutation
done
```

#### Detailed Steps per Mutation

**Step 3.1: Introduce Mutation**

Example: Remove email input field

```tsx
// BEFORE (original code)
<TextInput
  data-cy="email-input"
  placeholder="Email"
  value={email}
  onChangeText={setEmail}
/>;

// AFTER (mutated code)
{
  /* MUTATION: Removed email input */
}
```

**Step 3.2: Run Test**

```bash
# Run the specific test that should catch this mutation
SPEC=cypress/e2e/login-page-tests/verify-login-page.cy.ts npm run cypress:docker:test:spec

# Expected result: TEST SHOULD FAIL
# Actual result: Document what happened
```

**Step 3.3: Capture Results**

Document in real-time:

```markdown
### Mutation #1: Remove Email Input Field

**Component:** src/screens/LoginScreen.tsx
**Line:** 45-50
**Change:** Removed `<TextInput data-cy="email-input">`

**Test Result:** ❌ FAILED (Expected - test caught it!)
**Error Message:**
```

CypressError: Timed out retrying after 4000ms: Expected to find element: `[data-cy="email-input"]`, but never found it.

```

**Test Behavior:** Test correctly failed when email input was missing
**Verdict:** ✅ Test properly validates email input existence
```

**Step 3.4: Restore Immediately**

```bash
# Restore the file
git checkout src/screens/LoginScreen.tsx

# Verify clean state
git diff  # Should show no changes
git status  # Should be clean

# CRITICAL: Never continue to next mutation without restoring!
```

---

### Phase 4: Documentation (2-3 hours)

#### Step 4.1: Generate Per-Component Reports

Use template from [Documentation Templates](#documentation-templates) section.

Create: `claudedocs/mutation-testing/reports/LoginScreen-mutation-report.md`

#### Step 4.2: Analyze Results

Calculate metrics:

```
Total Mutations: 15
Caught by Tests: 14 (93.3%)
Missed by Tests: 1 (6.7%)
Test Quality Score: A (Excellent)
```

#### Step 4.3: Identify Test Gaps

For mutations that tests did NOT catch:

````markdown
## ❌ Test Gaps Identified

### Gap #1: Error Message Display Not Validated

**Mutation:** Removed error message Text element
**Test Result:** ✅ PASSED (tests didn't fail)
**Issue:** Test doesn't assert error message visibility
**Fix Needed:** Add assertion:

```typescript
cy.get('[data-cy="error-message"]')
  .should('be.visible')
  .and('contain', 'Invalid credentials');
```
````

**Priority:** P1 (Missing critical validation)

````

#### Step 4.4: Create Aggregate Summary

Create: `claudedocs/mutation-testing/SUMMARY.md`

See [Documentation Templates](#documentation-templates) for full template.

---

### Phase 5: Analysis & Remediation (2-4 hours)

#### Step 5.1: Prioritize Test Improvements

Rank gaps by severity:

**P0 - Critical**: Security, auth, data integrity gaps
**P1 - High**: User-facing errors, key workflows
**P2 - Medium**: Edge cases, less common paths
**P3 - Low**: Nice-to-have validations

#### Step 5.2: Update Tests

For each identified gap:

1. Switch to feature branch (not mutation-testing branch)
2. Add missing assertions
3. Run test to verify improvement
4. Commit test improvements
5. Re-run mutation if needed to verify fix

```bash
# Create improvement branch
git checkout main
git checkout -b fix/improve-login-test-assertions

# Edit test file
# Add missing assertions

# Verify improvement
SPEC=cypress/e2e/login-page-tests/verify-login-page.cy.ts npm run cypress:run:spec

# Commit
git add cypress/e2e/login-page-tests/verify-login-page.cy.ts
git commit -m "test(login): add error message visibility assertion"

# Merge
git checkout main
git merge --no-ff fix/improve-login-test-assertions
````

#### Step 5.3: Re-Validate (Optional)

After test improvements, optionally re-run specific mutations to verify gaps are closed.

---

## Git-Based Safety Strategy

### Multi-Layer Protection

**Layer 1: Branch Isolation**

```bash
# Work ONLY on mutation-testing branch
git checkout -b mutation-testing

# Verify branch
git branch  # Should show * mutation-testing
```

**Layer 2: Per-Mutation Restoration**

```bash
# After EVERY mutation test
git checkout path/to/component.tsx

# Verify restoration
git diff  # Should be empty
```

**Layer 3: Audit Trail**

```bash
# Before restoring, optionally capture change
git diff > logs/mutation-03-remove-email-input.diff

# Then restore
git checkout .
```

**Layer 4: Prevent Commits**

```bash
# NEVER commit on mutation-testing branch
# If you accidentally stage changes:
git reset HEAD .

# Verify nothing staged
git status
```

**Layer 5: Cleanup**

```bash
# When mutation testing complete
git checkout main

# Delete branch
git branch -D mutation-testing

# Verify back on main
git branch
```

### Safety Checklist

Before starting mutation testing session:

- [ ] Created `mutation-testing` branch
- [ ] Verified NOT on main/dev branch
- [ ] No uncommitted changes (`git status` clean)
- [ ] Helper script available (optional but recommended)

During mutation testing:

- [ ] Restore after EVERY mutation
- [ ] Verify restoration with `git diff` before next mutation
- [ ] Document results before restoration
- [ ] Never commit broken code

After mutation testing session:

- [ ] All files restored (`git status` clean)
- [ ] Switched back to main branch
- [ ] Deleted mutation-testing branch
- [ ] Reports saved in `claudedocs/mutation-testing/`

---

## Helper Script Reference

### Script: `scripts/mutation-test-helper.sh`

**Purpose**: Automate repetitive mutation testing tasks with built-in safety checks.

**Usage:**

```bash
# Make executable
chmod +x scripts/mutation-test-helper.sh

# Start mutation session
./scripts/mutation-test-helper.sh start

# Run test after mutation
./scripts/mutation-test-helper.sh test <test-file-path>

# Restore after test
./scripts/mutation-test-helper.sh restore <component-file>

# End mutation session
./scripts/mutation-test-helper.sh end
```

**Features:**

1. **Branch Validation**: Ensures on `mutation-testing` branch
2. **Automatic Restoration**: `git checkout` after test run
3. **Result Logging**: Captures test output and results
4. **Safety Checks**: Prevents commits, validates state
5. **Progress Tracking**: Logs mutations tested

**See**: [scripts/mutation-test-helper.sh](../scripts/mutation-test-helper.sh) for implementation

---

## Documentation Templates

### Per-Component Mutation Report

````markdown
# Mutation Test Report: [ComponentName]

**Component:** [path/to/Component.tsx]
**Test:** [cypress/e2e/path/to/test.cy.ts]
**Date:** [YYYY-MM-DD]
**Tested By:** [Name/Claude]

---

## 📊 Summary

| Metric             | Value    |
| ------------------ | -------- |
| Total Mutations    | 15       |
| Caught by Tests    | 14 (93%) |
| Missed by Tests    | 1 (7%)   |
| Test Quality Score | A        |

**Verdict:** ✅ Excellent test coverage

---

## ✅ PASSED Mutations (Test Correctly Failed)

| #   | Mutation Type    | What Was Broken            | Expected Result         | Actual Result                               |
| --- | ---------------- | -------------------------- | ----------------------- | ------------------------------------------- |
| 1   | Remove Element   | Email TextInput            | Test fails with timeout | ❌ FAILED - "Element not found"             |
| 2   | Remove Element   | Password TextInput         | Test fails with timeout | ❌ FAILED - "Element not found"             |
| 3   | Remove Element   | Submit button              | Test fails with timeout | ❌ FAILED - "Element not found"             |
| 4   | Remove Attribute | data-cy="email-input"      | Selector fails          | ❌ FAILED - "Selector not found"            |
| 5   | Change Text      | Button "Login" → "Sign In" | Text assertion fails    | ❌ FAILED - "Expected Login, found Sign In" |

---

## ❌ FAILED Mutations (Test Did NOT Catch)

| #   | Mutation Type  | What Was Broken    | Expected Result  | Actual Result | Issue                               |
| --- | -------------- | ------------------ | ---------------- | ------------- | ----------------------------------- |
| 1   | Remove Element | Error message Text | Test should fail | ✅ PASSED     | Test doesn't validate error display |

---

## 🔧 Recommended Test Improvements

### Priority 1: Add Error Message Validation

**Issue:** Test doesn't assert error message visibility
**Current Test:** Missing error visibility assertion
**Required Addition:**

```typescript
// Add to error handling test
cy.get('[data-cy="error-message"]')
  .should('be.visible')
  .and('contain', 'Invalid credentials');
```
````

**Impact:** Prevents shipping broken error feedback to users

---

## 📝 Detailed Mutation Log

### Mutation #1: Remove Email Input

**Line:** 45-50
**Change:** Removed `<TextInput data-cy="email-input">` element

**Test Command:**

```bash
SPEC=cypress/e2e/login-page-tests/verify-login-page.cy.ts npm run cypress:docker:test:spec
```

**Expected:** Test should fail with "Element not found"
**Actual:** ❌ Test FAILED as expected

**Error Message:**

```
CypressError: Timed out retrying after 4000ms: Expected to find element: `[data-cy="email-input"]`, but never found it.
    at cypressFindElement (verify-login-page.cy.ts:45:8)
```

**Verdict:** ✅ Test correctly validates email input existence

---

[Continue for all mutations...]

---

## 🎯 Next Steps

1. [ ] Implement recommended test improvements (Priority 1 items)
2. [ ] Re-run affected mutations to verify fixes
3. [ ] Update test documentation with new assertions
4. [ ] Archive this report for future reference

---

**Report Generated:** [timestamp]
**Mutation Branch:** mutation-testing
**Restored:** ✅ All changes reverted

````

### Aggregate Summary Template

```markdown
# Mutation Testing Summary Report

**Project:** Fantasy Writing App
**Date Range:** [Start Date] - [End Date]
**Components Tested:** [N] components
**Total Mutations:** [N] mutations

---

## 📊 Overall Statistics

| Metric | Value | Percentage |
|--------|-------|------------|
| Total Mutations | 324 | 100% |
| Caught by Tests | 301 | 92.9% |
| Missed by Tests | 23 | 7.1% |
| Components Tested | 28 | - |
| Tests Validated | 35 | - |

**Overall Test Quality Score:** A (Excellent)

---

## 🏆 Test Quality by Component

| Component | Mutations | Caught | Missed | Score | Status |
|-----------|-----------|--------|--------|-------|--------|
| LoginScreen | 15 | 14 | 1 | A | ✅ |
| ProjectListScreen | 12 | 12 | 0 | A+ | ✅ |
| ProjectCard | 10 | 8 | 2 | B | ⚠️ |
| ElementEditor | 18 | 15 | 3 | B+ | ⚠️ |

**Legend:**
- **A+ (95-100%)**: Excellent coverage
- **A (90-94%)**: Very good coverage
- **B (80-89%)**: Good coverage, some gaps
- **C (70-79%)**: Acceptable, needs improvement
- **D (60-69%)**: Poor coverage, significant gaps
- **F (<60%)**: Failing, critical gaps

---

## 🔍 Common Test Gaps Identified

### Gap Pattern #1: Error Message Validation
- **Occurrence:** 8 components
- **Issue:** Tests don't validate error message visibility
- **Fix:** Add `cy.get('[data-cy="error-message"]').should('be.visible')`
- **Priority:** P1

### Gap Pattern #2: Loading State Validation
- **Occurrence:** 5 components
- **Issue:** Tests don't wait for loading completion
- **Fix:** Add loading indicator assertions
- **Priority:** P2

### Gap Pattern #3: Empty State Handling
- **Occurrence:** 4 components
- **Issue:** Tests don't validate empty state display
- **Fix:** Add empty state assertions
- **Priority:** P2

---

## ✅ Test Improvements Completed

1. [ ] LoginScreen: Added error message visibility assertion
2. [ ] ProjectCard: Added empty state validation
3. [ ] ElementEditor: Added loading state checks

---

## 📈 Quality Improvement Recommendations

### Immediate Actions (P0-P1)
1. Add error message validation to all auth components
2. Add form validation assertions
3. Add navigation verification

### Short-Term Actions (P2)
1. Add loading state validation across components
2. Add empty state handling verification
3. Improve conditional rendering tests

### Long-Term Actions (P3)
1. Periodic mutation testing (quarterly)
2. Mutation testing for new components
3. Automated mutation testing integration

---

## 🎯 Success Metrics

**Target:** >90% mutation detection rate
**Achieved:** 92.9% ✅ **TARGET MET**

**Critical Components:**
- Auth (LoginScreen): 93% ✅
- Projects (ProjectListScreen): 100% ✅
- Elements (ElementEditor): 83% ⚠️ (Needs improvement)

---

## 📝 Methodology Notes

- **Branch:** mutation-testing (deleted after completion)
- **Safety:** Git checkout restoration after each mutation
- **Duration:** ~18 hours total effort
- **Tools:** Cypress, Docker, Git
- **Test Strategy:** Docker-based execution for consistency

---

**Report Generated:** [timestamp]
**Author:** [Name]
**Status:** Complete ✅
````

---

## Common Mutation Types

### Category 1: UI Element Mutations

**What to Break:**

- Input fields (TextInput, Select, Checkbox)
- Buttons (submit, cancel, action buttons)
- Text displays (labels, headings, error messages)
- Images and icons
- Lists and grids

**Expected Test Failures:**

- Element not found errors
- Timeout waiting for element
- Selector not matching

**Example Mutations:**

```tsx
// MUTATION 1: Remove input
<TextInput data-cy="email-input" /> // ← Remove this line

// MUTATION 2: Remove button
<Button data-cy="submit-btn">Login</Button> // ← Remove this line

// MUTATION 3: Remove text display
<Text data-cy="error-message">{error}</Text> // ← Remove this line
```

---

### Category 2: Data Attribute Mutations

**What to Break:**

- Remove `data-cy` attributes
- Change `data-cy` values
- Remove `testID` (React Native)

**Expected Test Failures:**

- Selector not found
- Element not found (if test relies on data-cy)

**Example Mutations:**

```tsx
// ORIGINAL
<TextInput
  data-cy="email-input"  // ← Remove or change this
  placeholder="Email"
/>

// MUTATION 1: Remove data-cy
<TextInput
  placeholder="Email"
/>

// MUTATION 2: Change data-cy value
<TextInput
  data-cy="email-field"  // Changed from "email-input"
  placeholder="Email"
/>
```

---

### Category 3: Text Content Mutations

**What to Break:**

- Button text
- Labels and placeholders
- Error messages
- Headings and titles
- Success messages

**Expected Test Failures:**

- Text assertion failures
- Content mismatch errors

**Example Mutations:**

```tsx
// MUTATION 1: Change button text
<Button>Login</Button>  // Original
<Button>Sign In</Button>  // Mutated

// MUTATION 2: Change error message
<Text>{error || 'Invalid credentials'}</Text>  // Original
<Text>{error || 'Login failed'}</Text>  // Mutated

// MUTATION 3: Change label
<Text>Email Address</Text>  // Original
<Text>Email</Text>  // Mutated
```

---

### Category 4: Behavior Mutations

**What to Break:**

- Event handlers (onPress, onSubmit, onChange)
- Navigation calls
- Form submission logic
- Validation functions
- State updates

**Expected Test Failures:**

- Timeout waiting for navigation
- Form not submitting
- Validation not triggering
- State not updating

**Example Mutations:**

```tsx
// MUTATION 1: Disable event handler
<Button onPress={handleSubmit}>  // Original
<Button onPress={() => {}}>  // Mutated - no-op handler

// MUTATION 2: Remove navigation
const handleSubmit = () => {
  auth.login();
  navigation.navigate('Projects');  // ← Remove this line
};

// MUTATION 3: Break validation
const validate = () => {
  if (!email) return false;  // ← Comment out this line
  return true;
};
```

---

### Category 5: Conditional Rendering Mutations

**What to Break:**

- Error state display
- Loading indicators
- Empty state handling
- Success/failure feedback
- Conditional components

**Expected Test Failures:**

- Element should be visible but isn't
- Loading indicator not appearing
- Error message not showing

**Example Mutations:**

```tsx
// MUTATION 1: Remove error display
{
  error && <Text data-cy="error-message">{error}</Text>;
} // Original
{
  false && <Text data-cy="error-message">{error}</Text>;
} // Mutated

// MUTATION 2: Remove loading indicator
{
  loading && <Spinner />;
} // Original
{
  false && <Spinner />;
} // Mutated

// MUTATION 3: Remove empty state
{
  items.length === 0 && <EmptyState />;
} // Original
{
  false && <EmptyState />;
} // Mutated
```

---

## Component-Specific Patterns

### LoginScreen / Authentication Components

**Critical Mutations:**

1. Remove email/password inputs
2. Remove login button
3. Remove data-cy attributes
4. Break onSubmit handler
5. Remove error message display
6. Break navigation after login
7. Remove "Remember Me" toggle
8. Break session persistence
9. Change button text
10. Remove loading state

**Priority**: P0 (Critical Path)

---

### ProjectListScreen / List Components

**Critical Mutations:**

1. Remove project cards/items
2. Remove "Create" button
3. Remove empty state display
4. Break item navigation
5. Remove search/filter inputs
6. Break data loading
7. Remove loading indicator
8. Change action button text
9. Remove data-cy on list items
10. Break pagination/infinite scroll

**Priority**: P1 (Core Feature)

---

### ProjectCard / Card Components

**Critical Mutations:**

1. Remove card title/name
2. Remove action buttons (edit, delete)
3. Remove data-cy attributes
4. Break click handlers
5. Remove images/thumbnails
6. Change button text
7. Remove status indicators
8. Break conditional rendering (archived, etc.)

**Priority**: P1 (Core Feature)

---

### ElementEditor / Form Components

**Critical Mutations:**

1. Remove form inputs (name, description)
2. Remove save/cancel buttons
3. Break form submission
4. Remove validation logic
5. Remove error displays
6. Break data binding
7. Remove loading states
8. Change button text
9. Remove data-cy attributes
10. Break navigation after save

**Priority**: P1 (Core Feature)

---

### Modal / Overlay Components

**Critical Mutations:**

1. Remove close button (X)
2. Remove cancel button
3. Break modal dismissal
4. Remove backdrop
5. Break escape key handler
6. Remove form elements
7. Change button text
8. Remove data-cy attributes

**Priority**: P2 (Supporting Feature)

---

## Troubleshooting

### Issue: Test Passes Despite Obvious Mutation

**Symptom:** Removed critical element, but test still passes

**Possible Causes:**

1. Test doesn't actually interact with that element
2. Test has weak assertions (e.g., only checks URL, not element)
3. Element removal doesn't affect test flow
4. Test uses alternative selector

**Solution:**

- Review test file to see what it actually validates
- Add missing assertions for removed element
- Document as test gap in report
- Prioritize test improvement

**Example:**

```typescript
// WEAK TEST (doesn't validate email input exists)
cy.visit('/');
cy.url().should('include', '/login'); // Only checks URL

// STRONG TEST (validates email input)
cy.visit('/');
cy.get('[data-cy="email-input"]').should('exist'); // Validates element
cy.url().should('include', '/login');
```

---

### Issue: Test Fails for Wrong Reason

**Symptom:** Test fails, but not with expected error message

**Possible Causes:**

1. Mutation broke earlier step in test
2. Multiple elements affected by single mutation
3. Cascading failures

**Solution:**

- Review full error message and stack trace
- Document actual failure reason
- Still counts as mutation caught (test failed)
- Note unexpected failure pattern in report

---

### Issue: Cannot Restore File

**Symptom:** `git checkout` doesn't restore file

**Possible Causes:**

1. File not tracked by Git
2. Typo in file path
3. Already restored (no changes to restore)

**Solution:**

```bash
# Check file status
git status path/to/file.tsx

# Verify file is tracked
git ls-files | grep file.tsx

# Check if changes exist
git diff path/to/file.tsx

# Force restoration of all changes
git checkout .
```

---

### Issue: Test Takes Too Long

**Symptom:** Each mutation test takes >2 minutes

**Solutions:**

1. **Use Docker**: More consistent, often faster

   ```bash
   SPEC=path/to/test.cy.ts npm run cypress:docker:test:spec
   ```

2. **Run Headless**: Skip UI overhead

   ```bash
   SPEC=path/to/test.cy.ts npm run cypress:run:spec
   ```

3. **Test Only Affected Spec**: Don't run full suite

   ```bash
   # GOOD: Single spec
   SPEC=cypress/e2e/auth/login.cy.ts npm run cypress:run:spec

   # BAD: All specs
   npm run cypress:run
   ```

---

### Issue: Accidental Commit of Broken Code

**Symptom:** Committed mutation to main branch

**Solution:**

```bash
# If not yet pushed
git reset --soft HEAD~1  # Undo commit, keep changes
git checkout .  # Restore files
git status  # Verify clean

# If already pushed (requires caution)
# 1. Contact team about force push
# 2. Create fix commit instead of rewriting history
git revert HEAD
git push
```

**Prevention:**

- Always work on `mutation-testing` branch
- Never commit on mutation-testing branch
- Use helper script to prevent commits

---

### Issue: Lost Track of Which Mutations Completed

**Symptom:** Not sure which mutations have been tested

**Solution:**

1. **Use Checklist**: Check off mutations as you complete them
2. **Use Helper Script**: Auto-logs completed mutations
3. **Create Progress File**: Track in real-time

```markdown
# mutation-progress.md

## LoginScreen Mutations

- [x] 1. Remove email input - CAUGHT ✅
- [x] 2. Remove password input - CAUGHT ✅
- [x] 3. Remove button - CAUGHT ✅
- [ ] 4. Remove data-cy email - IN PROGRESS
- [ ] 5. Remove data-cy password - TODO
```

---

## Examples

### Example 1: LoginScreen Email Input Mutation

**Component:** `src/screens/LoginScreen.tsx:45-50`

**Original Code:**

```tsx
<TextInput
  data-cy="email-input"
  placeholder="Email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
/>
```

**Mutation:** Remove email input entirely

**Mutated Code:**

```tsx
{
  /* MUTATION: Removed email input field */
}
```

**Test File:** `cypress/e2e/login-page-tests/verify-login-page.cy.ts`

**Test Command:**

```bash
SPEC=cypress/e2e/login-page-tests/verify-login-page.cy.ts npm run cypress:docker:test:spec
```

**Expected Result:** Test should FAIL with timeout finding `[data-cy="email-input"]`

**Actual Result:** ❌ TEST FAILED (as expected)

**Error Output:**

```
1) User Sign In Flow
     should display login page elements:

     CypressError: Timed out retrying after 4000ms: Expected to find element: `[data-cy="email-input"]`, but never found it.

      at Context.eval (webpack:///./cypress/e2e/login-page-tests/verify-login-page.cy.ts:45:8)

Test Duration: 4.2s
```

**Analysis:**

- ✅ Test correctly detected missing email input
- ✅ Failed with appropriate error message
- ✅ Timeout indicates test was looking for element
- ✅ No false positive

**Verdict:** Test properly validates email input existence

**Restoration:**

```bash
git checkout src/screens/LoginScreen.tsx
git diff  # Verify restoration (should show no changes)
```

---

### Example 2: ProjectCard Title Text Change

**Component:** `src/components/ProjectCard.tsx:78`

**Original Code:**

```tsx
<Text data-cy="project-title" style={styles.title}>
  {project.name}
</Text>
```

**Mutation:** Change data-cy value

**Mutated Code:**

```tsx
<Text data-cy="project-name" style={styles.title}>
  {project.name}
</Text>
```

**Test File:** `cypress/e2e/project-tests/project-list.cy.ts`

**Expected Result:** Test should FAIL with selector not found

**Actual Result:** ❌ TEST FAILED (as expected)

**Error Output:**

```
1) Project List
     should display project cards:

     CypressError: Timed out retrying after 4000ms: Expected to find element: `[data-cy="project-title"]`, but never found it.
```

**Verdict:** Test properly relies on specific data-cy attribute

---

### Example 3: Error Message Display (Gap Found)

**Component:** `src/screens/LoginScreen.tsx:120-122`

**Original Code:**

```tsx
{
  error && (
    <Text data-cy="error-message" style={styles.error}>
      {error}
    </Text>
  );
}
```

**Mutation:** Remove error message display

**Mutated Code:**

```tsx
{
  false && (
    <Text data-cy="error-message" style={styles.error}>
      {error}
    </Text>
  );
}
```

**Test File:** `cypress/e2e/login-page-tests/verify-login-page.cy.ts`

**Expected Result:** Test should FAIL when checking error display

**Actual Result:** ✅ TEST PASSED (unexpected - gap found!)

**Test Code Review:**

```typescript
it('should reject invalid credentials', () => {
  cy.visit('/');
  cy.get('[data-cy="email-input"]').type('wrong@test.com');
  cy.get('[data-cy="password-input"]').type('wrongpass');
  cy.get('[data-cy="submit-btn"]').click();

  // ❌ MISSING: No assertion for error message visibility!

  cy.url().should('include', '/login'); // Only checks URL
});
```

**Analysis:**

- ❌ Test does NOT validate error message display
- ❌ Test only checks URL stays on login page
- ❌ Missing critical assertion

**Gap Identified:** Test doesn't validate error feedback to user

**Recommended Fix:**

```typescript
it('should reject invalid credentials', () => {
  cy.visit('/');
  cy.get('[data-cy="email-input"]').type('wrong@test.com');
  cy.get('[data-cy="password-input"]').type('wrongpass');
  cy.get('[data-cy="submit-btn"]').click();

  // ✅ ADD THIS: Validate error message
  cy.get('[data-cy="error-message"]')
    .should('be.visible')
    .and('contain', 'Invalid credentials');

  cy.url().should('include', '/login');
});
```

**Priority:** P1 (Critical user feedback validation missing)

---

## Appendix A: Mutation Testing Checklist

### Pre-Session Checklist

- [ ] All tests passing
- [ ] Git status clean
- [ ] On main/dev branch
- [ ] Created mutation-testing branch
- [ ] Documentation structure ready
- [ ] Component inventory created
- [ ] Mutation plan documented

### During-Session Checklist

- [ ] Edit component (introduce mutation)
- [ ] Run specific test
- [ ] Document result immediately
- [ ] Restore file with `git checkout`
- [ ] Verify restoration with `git diff`
- [ ] Continue to next mutation

### Post-Session Checklist

- [ ] All files restored
- [ ] Git status clean
- [ ] Switched to main branch
- [ ] Deleted mutation-testing branch
- [ ] Per-component reports generated
- [ ] Aggregate summary created
- [ ] Test gaps documented
- [ ] Improvement tasks created

---

## Appendix B: Quality Score Rubric

| Score | Percentage | Description          | Action Required             |
| ----- | ---------- | -------------------- | --------------------------- |
| A+    | 95-100%    | Exceptional coverage | Maintain quality            |
| A     | 90-94%     | Excellent coverage   | Minor improvements          |
| B+    | 85-89%     | Very good coverage   | Review gaps                 |
| B     | 80-84%     | Good coverage        | Targeted improvements       |
| C+    | 75-79%     | Acceptable coverage  | Systematic improvements     |
| C     | 70-74%     | Marginal coverage    | Significant work needed     |
| D     | 60-69%     | Poor coverage        | Major improvements required |
| F     | <60%       | Failing coverage     | Comprehensive test rewrite  |

**Critical Components** (auth, payments, data):

- Minimum acceptable: B (80%)
- Target: A (90%+)

**Standard Components** (UI, navigation):

- Minimum acceptable: C (70%)
- Target: B+ (85%+)

---

## Appendix C: Integration with Auth Test Phases

Mutation testing is integrated into auth test implementation phases:

- **[Phase 1](../TODO-AUTH-TESTS-PHASE-1-INFRASTRUCTURE.md)**: Infrastructure validation
- **[Phase 2](../TODO-AUTH-TESTS-PHASE-2-SIGNIN.md)**: Sign-in flow validation
- **[Phase 3](../TODO-AUTH-TESTS-PHASE-3-SIGNUP.md)**: Sign-up flow validation
- **[Phase 4](../TODO-AUTH-TESTS-PHASE-4-SESSION.md)**: Session management validation
- **[Phase 5](../TODO-AUTH-TESTS-PHASE-5-RECOVERY.md)**: Password recovery validation

Each phase includes component-specific mutation testing tasks.

---

## Appendix D: Related Documentation

- **[CYPRESS-COMPLETE-REFERENCE.md](./CYPRESS-COMPLETE-REFERENCE.md)**: Comprehensive Cypress testing guide
- **[TEST-VALIDATION-GUIDE.md](./TEST-VALIDATION-GUIDE.md)**: Test validation workflows
- **[QUICK-TEST-REFERENCE.md](../cypress/docs/QUICK-TEST-REFERENCE.md)**: Quick testing reference
- **[E2E-TEST-PLAN.md](./E2E-TEST-PLAN.md)**: Complete E2E testing strategy

---

**Version**: 1.0
**Last Updated**: 2025-10-06
**Maintained By**: Development Team
**Questions?**: See [Troubleshooting](#troubleshooting) section

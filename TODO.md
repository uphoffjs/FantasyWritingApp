# Cypress Component Test Fixes - Comprehensive TODO

**Generated**: 2025-09-25
**Total Issues Found**: 47 webpack warnings + multiple runtime failures
**Estimated Completion Time**: 4-6 hours
**Priority Levels**: 🔴 Critical | 🟡 High | 🔵 Medium | ⚪ Low

---

## 📊 Summary of Root Causes

1. **Import/Export Mismatches**: 47 webpack warnings from incorrect factory names and missing exports
2. **Selector Strategy Issues**: Tests using text content instead of data-cy attributes
3. **Data Structure Mismatches**: Tests expecting properties that don't exist
4. **Test Utility Issues**: mountWithProviders being imported instead of used as command
5. **Performance Problems**: Tests timing out, slow webpack compilation

---

## 🔴 CRITICAL - Import/Export Fixes (Blocks Test Execution)

### ❌ Task 1: Fix Factory Name Mismatches
**Root Cause**: Tests import `ElementFactory`, `ProjectFactory`, `QuestionFactory` with capital F, but exports use lowercase `elementFactory`, `projectFactory`

**Files to Fix**:
- [ ] `/cypress/component/elements/ElementEditor.cy.tsx` - Change `ElementFactory` to `elementFactory`
- [ ] `/cypress/component/forms/ElementForms.cy.tsx` - Change `QuestionFactory` to factory function
- [ ] `/cypress/component/utilities/test-single.cy.tsx` - Change `ProjectFactory` to `projectFactory`

**Fix Required**:
```typescript
// WRONG
import { ElementFactory } from '../../fixtures/factories';

// CORRECT
import { elementFactory } from '../../fixtures/factories';
```

**Verification**: `npm run test:component -- --spec "**/ElementEditor.cy.tsx"` should load without warnings

---

### ❌ Task 2: Create Missing Mock Exports
**Root Cause**: Tests expect `mockElement` and `createMockElements` but they don't exist in test-data

**Files to Fix**:
- [ ] `/cypress/support/test-data.ts` - Add `mockElement` and `createMockElements` exports
- [ ] Update imports in:
  - `/cypress/component/elements/RelationshipList.cy.tsx`
  - `/cypress/component/elements/RelationshipModal.cy.tsx`
  - `/cypress/component/utilities/SearchResults.cy.tsx`

**Fix Required**:
```typescript
// In /cypress/support/test-data.ts, add:
export const mockElement = {
  id: 'element-1',
  name: 'Test Element',
  category: 'character',
  type: 'character',
  description: 'Test element description',
  projectId: 'project-1',
  relationships: [],
  completionPercentage: 75
};

export const createMockElements = (count: number = 3) => {
  return Array.from({ length: count }, (_, i) => ({
    ...mockElement,
    id: `element-${i + 1}`,
    name: `Test Element ${i + 1}`
  }));
};
```

**Verification**: Webpack warnings about missing exports should disappear

---

### ❌ Task 3: Fix mountWithProviders Usage
**Root Cause**: `TemplateEditor.cy.tsx` imports mountWithProviders but it's only available as a Cypress command

**Files to Fix**:
- [ ] `/cypress/component/utilities/TemplateEditor.cy.tsx` - Remove import, use `cy.mountWithProviders()`
- [ ] `/cypress/component/utilities/COMPONENT-TEST-TEMPLATE.cy.tsx` - Remove import if present

**Fix Required**:
```typescript
// REMOVE this line:
import { mountWithProviders } from '../../support/component';

// Use as Cypress command:
cy.mountWithProviders(<Component />);
```

**Verification**: No webpack warnings about mountWithProviders

---

### ❌ Task 4: Create QuestionFactory
**Root Cause**: `ElementForms.cy.tsx` expects QuestionFactory but it doesn't exist

**Files to Fix**:
- [ ] `/cypress/fixtures/factories.ts` - Add questionFactory function

**Fix Required**:
```typescript
// Add to factories.ts:
export const questionFactory = (overrides = {}) => ({
  id: generateId('question'),
  text: overrides.text || 'Test question?',
  type: overrides.type || 'text',
  required: overrides.required || false,
  category: overrides.category || 'general',
  placeholder: overrides.placeholder || 'Enter your answer',
  options: overrides.options || [],
  validation: overrides.validation || null,
  ...overrides
});
```

---

## 🟡 HIGH - Runtime Test Failures

### ❌ Task 5: Fix Close Button Selector
**Root Cause**: Test looks for '✕' text content instead of using data-cy attribute

**Files to Fix**:
- [ ] `/cypress/component/elements/CreateElementModal.cy.tsx` - Update selector
- [ ] `/src/components/elements/CreateElementModal.tsx` - Add data-cy attribute

**Fix Required**:
```typescript
// In test file:
// WRONG
cy.contains('button', '✕').click();

// CORRECT
cy.getByDataCy('modal-close-button').click();

// In component:
<button data-cy="modal-close-button" onClick={onClose}>✕</button>
```

**Verification**: Close functionality test should pass

---

### ❌ Task 6: Fix Text Assertion Mismatches
**Root Cause**: Test expects "item object" but component renders "item-object • general"

**Files to Fix**:
- [ ] `/cypress/component/elements/ElementCard.cy.tsx` - Update assertions

**Fix Required**:
```typescript
// WRONG
cy.get('[data-cy="element-category"]').should('contain.text', 'item object');

// CORRECT
cy.get('[data-cy="element-category"]').should('contain.text', 'item-object');
// OR use partial match:
cy.get('[data-cy="element-category"]').should('include.text', 'item-object');
```

---

### ❌ Task 7: Fix Data Seeding Dependencies
**Root Cause**: Test accesses `undefined.projects` - fixture data not properly initialized

**Files to Fix**:
- [ ] `/cypress/component/examples/DataSeedingExample.cy.tsx` - Initialize fixture data

**Fix Required**:
```typescript
// Ensure fixture is loaded before accessing:
beforeEach(() => {
  cy.fixture('minimal').then((data) => {
    // Store fixture data properly
    cy.wrap(data).as('testData');
  });
});

// Access safely:
cy.get('@testData').then((data) => {
  expect(data.projects).to.exist;
});
```

---

## 🔵 MEDIUM - React Warnings & Props

### ⚠️ Task 8: Fix React DOM Property Warnings
**Root Cause**: React Native props being passed to DOM elements

**Files to Fix**:
- [ ] Components using `testID`, `accessibilityTestID`
- [ ] Components with invalid DOM properties

**Fix Required**:
```typescript
// Filter out React Native specific props before passing to DOM:
const { testID, accessibilityTestID, ...domProps } = props;
return <div {...domProps} data-cy={testID} />;
```

---

### ⚠️ Task 9: Fix Non-Boolean Attributes
**Root Cause**: Boolean values passed to non-boolean DOM attributes

**Files to Fix**:
- [ ] Components with `accessible`, `collapsable` attributes

**Fix Required**:
```typescript
// WRONG
<div accessible={true} />

// CORRECT - don't pass or convert to string
<div aria-accessible="true" />
```

---

## ⚪ LOW - Performance Optimizations

### 💡 Task 10: Optimize Test Execution Speed
**Root Cause**: Webpack compilation slow, tests timing out

**Actions**:
- [ ] Add webpack cache configuration for test builds
- [ ] Reduce bundle size by code splitting test utilities
- [ ] Use electron browser instead of Chrome for faster execution
- [ ] Consider running tests in parallel groups

**Fix Required**:
```javascript
// In cypress.config.js:
component: {
  devServer: {
    framework: 'react',
    bundler: 'webpack',
    webpackConfig: {
      cache: {
        type: 'filesystem',
        cacheDirectory: path.resolve(__dirname, '.webpack-cache')
      },
      optimization: {
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false
      }
    }
  }
}
```

---

## 📋 Verification Checklist

After all fixes are complete, verify:

- [ ] All webpack warnings resolved
- [ ] No import errors in console
- [ ] All tests load successfully
- [ ] Close button tests pass
- [ ] Text assertions pass
- [ ] Data seeding tests pass
- [ ] No React warnings in console
- [ ] Tests complete in < 2 minutes

---

## 🚀 Implementation Order

1. **Phase 1 - Critical Fixes** (1-2 hours)
   - Fix all import/export issues (Tasks 1-4)
   - Verify tests can load

2. **Phase 2 - Runtime Fixes** (1-2 hours)
   - Fix selector issues (Task 5)
   - Fix assertions (Task 6)
   - Fix data dependencies (Task 7)

3. **Phase 3 - Warnings** (1 hour)
   - Fix React warnings (Tasks 8-9)

4. **Phase 4 - Optimization** (1 hour)
   - Improve performance (Task 10)

---

## 📈 Success Metrics

- **Before**: 47+ webpack warnings, multiple test failures, 3-5 minute timeouts
- **Target**: 0 warnings, 100% tests passing, < 2 minute execution time
- **Measurement**: Run `npm run test:component` and check output

---

## 🔄 Continuous Improvement

After fixing immediate issues:

1. Add pre-commit hooks to catch import issues
2. Create factory generator CLI tool
3. Standardize selector patterns with ESLint rules
4. Add performance budgets for test execution
5. Document test patterns in CONTRIBUTING.md

---

## 📝 Notes

- All file paths are relative to project root
- Use `npm run lint` after each fix to ensure code quality
- Consider creating a feature branch for these fixes
- Test incrementally - don't try to fix everything at once
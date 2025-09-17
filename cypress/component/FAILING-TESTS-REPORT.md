# Cypress Component Test Failure Report

Generated: 2025-09-11

## Summary

The Cypress component tests are experiencing significant failures. Many tests appear to have issues with:
1. **cy.stub() being called outside of test blocks** - This is a critical issue affecting multiple test files
2. **Missing required props or incorrect prop types**
3. **Tailwind CSS class name changes** (e.g., `text-forest-500` vs `text-green-500`)
4. **Missing DOM elements that tests expect to find**
5. **Undefined functions like `rerender`**

## Failing Test Files

### 1. AutoSaveIndicator.cy.tsx
**Status**: 9 passing, 3 failing

**Failures**:
- `should show saved state` - CSS class mismatch (`text-forest-500` vs expected `text-green-500`)
- `should show error state` - CSS class mismatch (`text-blood-500` vs expected `text-red-500`)
- `should transition between states smoothly` - `rerender is not a function`

**Fix needed**: 
- Update test expectations to match actual Tailwind classes used
- Fix the rerender function issue (likely need to use cy.mount again instead)

### 2. ElementCard.cy.tsx
**Status**: All tests failing (0 passing, 25 failing)

**Failures**:
- Cannot call `cy.stub()` outside a running test

**Fix needed**:
- Move `cy.stub()` calls inside `beforeEach` or individual test blocks

### 3. ElementEditor.cy.tsx
**Status**: 1 passing, 39 failing

**Main issues**:
- Missing required props (elementData)
- DOM elements not found
- Navigation failures

**Fix needed**:
- Provide complete mock data for all required props
- Update selectors to match actual DOM structure

### 4. ProgressBar.cy.tsx
**Status**: 1 passing, 7 failing

**Failures**:
- Missing percentage value display
- Animation and transition issues
- Missing labels

**Fix needed**:
- Update component implementation or test expectations

### 5. TagInput.cy.tsx
**Status**: 1 passing, 15 failing

**Main issues**:
- Input field not found
- Tag elements not rendering
- Keyboard interactions failing

**Fix needed**:
- Verify component structure and update selectors

### 6. SpeciesSelector.cy.tsx
**Status**: 1 passing, all others failing

**Main issue**:
- `cy.stub()` called outside test blocks

**Fix needed**:
- Restructure test setup

### 7. graph/GraphComponents.cy.tsx
**Status**: 1 passing, 29 failing

**Main issues**:
- Missing required context providers
- Graph visualization not rendering
- Mock data issues

**Fix needed**:
- Wrap components in required providers
- Provide complete mock data

### 8. graph/RelationshipGraph.cy.tsx
**Status**: 1 passing, 23 failing

**Similar issues to GraphComponents**

### 9. data-display/CompletionHeatmap.cy.tsx
**Status**: Test file has syntax errors

**Fix needed**:
- `cy.stub()` called outside test blocks

### 10. data-display/MilestoneSystem.cy.tsx
**Status**: Test file has syntax errors

**Fix needed**:
- `cy.stub()` called outside test blocks

### 11. data-display/ProgressReport.cy.tsx
**Status**: Test file has syntax errors

**Fix needed**:
- `cy.stub()` called outside test blocks

### 12. elements/ElementForms.cy.tsx
**Status**: 1 passing, extensive failures

**Main issues**:
- Missing form elements
- Validation not working as expected
- Mode toggle issues

### 13. element-editor/ElementEditorComponents.cy.tsx
**Status**: Test file has syntax errors

**Fix needed**:
- `cy.stub()` called outside test blocks

### 14. lists/ElementBrowser.cy.tsx
**Status**: 1 passing, 27 failing

**Main issues**:
- Component not rendering properly
- Missing required props
- Search functionality broken

### 15. utility/ErrorBoundary.cy.tsx
**Status**: Unknown (likely has issues based on pattern)

### 16. utility/UtilityComponents.cy.tsx
**Status**: Unknown (likely has issues based on pattern)

## Critical Issues to Fix First

### Priority 1: Fix cy.stub() placement
Many test files have `cy.stub()` being called at the module level instead of inside tests. This needs to be fixed in:
- ElementCard.cy.tsx
- SpeciesSelector.cy.tsx
- CompletionHeatmap.cy.tsx
- MilestoneSystem.cy.tsx
- ProgressReport.cy.tsx
- ElementEditorComponents.cy.tsx

**Pattern to fix**:
```typescript
// WRONG - at module level
const mockOnChange = cy.stub();

// CORRECT - inside beforeEach or test
beforeEach(() => {
  const mockOnChange = cy.stub();
});
```

### Priority 2: Update CSS class expectations
The application uses custom Tailwind classes (e.g., `text-forest-500`, `text-blood-500`) but tests expect standard ones.

### Priority 3: Provide complete mock data
Many components require complex props that aren't being provided in tests.

### Priority 4: Add missing data-cy attributes
Some components may be missing the data-cy attributes that tests are looking for.

## Recommended Action Plan

1. **Fix all cy.stub() placement issues** - This is blocking many tests from even running
2. **Update CSS class expectations** to match the actual theme
3. **Create comprehensive mock data fixtures** for complex components
4. **Add missing data-cy attributes** to components
5. **Wrap components in required providers** (Router, Store, etc.)
6. **Run tests individually** to fix one file at a time
7. **Update test selectors** to match actual DOM structure

## Commands to Run Individual Test Files

```bash
# Fix and test one file at a time
npx cypress run --component --spec "cypress/component/AutoSaveIndicator.cy.tsx"
npx cypress run --component --spec "cypress/component/ElementCard.cy.tsx"
# etc...
```

## Notes

- The test suite appears to have been written without running against the actual components
- Many tests assume a different component structure than what exists
- Consider using the Cypress Test Runner in interactive mode to debug: `npm run cypress:open`
- Some components may have changed since tests were written

## Next Steps

1. Start with fixing the `cy.stub()` placement issues as these prevent tests from running at all
2. Use interactive mode to see what the components actually render
3. Update tests to match the real component behavior
4. Consider adding integration tests for complex workflows
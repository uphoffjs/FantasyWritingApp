# Test Issues TODO List

Based on test results from 2025-09-24. Issues are categorized by priority and type (Test Fix vs Component Fix).

## 🔴 Critical - Blocking Test Execution

### 1. DataSeedingExample.cy.tsx - Missing Test Data Structure
**Type**: Test Fix
**Issue**: Cannot read properties of undefined (reading 'projects')
**Location**: cypress/component/examples/DataSeedingExample.cy.tsx:49
**Root Cause**: Fixture data not properly loaded or missing structure
**Solution**:
- [x] Check if fixture file exists at expected location
- [x] Ensure fixture has proper 'projects' property structure
- [x] Add null checking before accessing nested properties
- [x] Update test to use factory methods for data generation

### 2. Test Performance - Excessive Timeouts
**Type**: Infrastructure Fix
**Issue**: Tests timing out after 3-5 minutes per suite
**Root Cause**: Webpack bundling delays, possible memory leaks
**Solution**:
- [x] Created optimized webpack.test.js for test builds
- [x] Added filesystem caching for faster rebuilds
- [x] Configured cypress to use optimized webpack config
- [x] Implemented test splitting strategy with separate npm scripts
- [x] Fixed import paths (PerformanceMonitor, types)
- [x] Fix remaining module resolution issues with React Native Web
- [ ] Consider using vite or esbuild instead of webpack for faster builds

## 🟡 High Priority - Failing Tests

### 3. CreateElementModal.cy.tsx - Close Button Selector
**Type**: Component Fix
**Issue**: Close button with '✕' character not found
**Location**: CreateElementModal component close button
**Root Cause**: Using text content instead of data-cy selector
**Solution**:
- [x] Add `data-cy="modal-close-button"` to close button in CreateElementModal
- [x] Update test to use `cy.get('[data-cy=modal-close-button]')`
- [x] Remove reliance on special characters in selectors

### 4. ElementCard.cy.tsx - Text Content Assertion
**Type**: Test Fix
**Issue**: Expected 'item object' but got 'item-object • general'
**Root Cause**: Component now includes category and bullet separator
**Solution**:
- [x] Update test assertion to match new format
- [x] Use `.contains()` for partial text matching
- [x] Or test each part separately (category and type)

## 🟠 Medium Priority - Console Warnings

### 5. React Native Web Props Issues
**Type**: Component Fix
**Issue**: Invalid DOM properties (testID, accessibilityTestID)
**Components**: Multiple React Native components
**Solution**:
- [x] Update Platform.select() to properly handle web testID conversion
- [x] Create helper function to convert testID → data-cy for web
- [x] Remove accessibilityTestID from web builds
- [x] Fix prop spreading that passes RN props to DOM elements

### 6. Style Property Naming
**Type**: Component Fix
**Issue**: Invalid CSS property 'transform-origin' (should be transformOrigin)
**Components**: Components using inline styles
**Solution**:
- [x] Search for 'transform-origin' in styles
- [x] Replace with camelCase 'transformOrigin' (Note: SVG strings use correct kebab-case)
- [x] Audit other CSS properties for similar issues

### 7. Boolean Attributes on DOM Elements
**Type**: Component Fix
**Issue**: Non-boolean attributes receiving boolean values
**Properties**: accessible, collapsable
**Solution**:
- [x] Find components setting these attributes
- [x] Convert boolean values to strings or undefined (Fixed in getTestProps and getAccessibilityProps)
- [x] Update prop types to handle proper conversion

### 8. Deprecated pointerEvents Prop
**Type**: Component Fix
**Issue**: props.pointerEvents deprecated, should use style.pointerEvents
**Solution**:
- [x] Search for pointerEvents prop usage (None found - already using style.pointerEvents)
- [x] Move to style object instead of prop (Already correct)
- [x] Update any shared components using this pattern (No changes needed)

## 🟢 Low Priority - Enhancement

### 9. Test Data Factories
**Type**: Test Enhancement
**Issue**: Inconsistent test data generation
**Solution**:
- [x] Implement consistent factory pattern for all test data
- [x] Create shared test utilities for common scenarios
- [x] Document factory usage patterns

### 10. Selector Strategy Standardization
**Type**: Test Enhancement
**Issue**: Mixed selector strategies across tests
**Solution**:
- [x] Audit all tests for selector usage
- [x] Ensure all use data-cy attributes
- [x] Create custom commands for common selections
- [x] Update CLAUDE.md with selector best practices

## 📊 Implementation Plan

### Phase 1: Unblock Tests (Day 1) ✅ COMPLETED
1. Fix DataSeedingExample fixture issue (#1) ✅
2. Add data-cy to CreateElementModal close button (#3) ✅
3. Update ElementCard text assertions (#4) ✅

### Phase 2: Fix Components (Day 2-3) ✅ COMPLETED
4. Fix React Native web prop issues (#5) ✅
5. Fix style property naming (#6) ✅
6. Fix boolean attributes (#7) ✅
7. Fix deprecated pointerEvents (#8) ✅

### Phase 3: Optimize Performance (Day 4-5) ⚠️ IN PROGRESS
8. Investigate webpack performance (#2) ✅
9. Implement test splitting ✅
10. Created optimized webpack.test.js config ✅
11. Added test:split:* npm scripts for parallel execution ✅
12. Fixed module resolution issues (partially complete) ⚠️

### Phase 4: Enhancement (Day 6) ✅ COMPLETED
11. Implement test data factories (#9) ✅
12. Standardize selectors (#10) ✅
13. Update documentation ✅

## Verification Checklist

After each fix:
- [x] Run affected test locally
- [x] Verify no new console warnings
- [x] Check test execution time
- [x] Update test documentation if needed
- [x] Run `npm run lint` before committing

## Success Metrics

- All component tests passing ✅
- Test execution under 60 seconds total
- Zero console warnings/errors
- 100% data-cy selector usage
- Documented test patterns

## Notes

- Priority based on blocking impact and user experience
- Component fixes take precedence over test-only fixes
- Performance issues may require architectural changes
- Consider implementing pre-commit hooks for test validation

## Update Log

### 2025-09-24
- Fixed React Native web props issues by updating getTestProps and getAccessibilityProps functions
- Removed invalid DOM attributes (testID, accessibilityTestID, accessible) from web builds
- Updated test helper functions to avoid DOM warnings
- Verified transform-origin usage (correct in SVG strings)
- Confirmed no pointerEvents prop issues (already using style.pointerEvents)
- Added data-cy attribute to CreateElementModal close button in test helpers
- **Performance Optimization Phase 3:**
  - Created optimized webpack.test.js with aggressive caching and minimal transformations
  - Configured Cypress to use the optimized webpack config for component tests
  - Implemented test splitting strategy with npm scripts for parallel execution
  - Added test:split:* scripts for elements, forms, navigation, ui, errors, etc.
  - Fixed PerformanceMonitor import path (services → utils)
  - Created types/index.ts to aggregate type exports
  - Added module resolution paths to webpack config
  - Partial fix for React Native Web module resolution issues

### 2025-09-24 (Update 2)
- **Completed React Native Web Module Resolution Fix:**
  - Installed timers-browserify package
  - Updated webpack.test.js to include timers polyfill in resolve.fallback
  - Fixed ProvidePlugin configuration to use timers-browserify
  - Verified tests now run without module resolution errors

### 2025-09-24 (Update 3)
- **Completed Test Data Factory Implementation:**
  - Fixed factory import path in factory-helpers.ts
  - Verified comprehensive factory system already exists with:
    - Project, Element, Character, Location, Magic System factories
    - Relationship, User, Scene, Chapter, Story factories
    - Test-specific data generators for 12+ scenarios
    - Factory Manager with reset and scenario creation
  - Created FACTORY_PATTERNS.md documentation with:
    - Usage examples for all factory types
    - Best practices and patterns
    - Troubleshooting guide
    - Migration guide from hard-coded data
- **Phase 3 Complete**: All React Native Web module resolution issues resolved
- **Phase 4 Progress**: Test factory implementation and documentation complete
  - **COMPLETED: Fixed remaining React Native Web module resolution by installing timers-browserify**

### 2025-09-24 (Update 4)
- **Completed Selector Standardization (Phase 4):**
  - Audited all component tests for selector usage patterns
  - Fixed PerformanceComponents.cy.tsx to use data-cy selectors instead of class/element selectors
  - Created custom Cypress commands in selectors.ts:
    - getByDataCy() - Preferred method for getting elements
    - clickButton() - Smart button selection with data-cy fallback
    - getModal(), getCard(), getPerformanceElement() - Specialized commands
  - Updated CLAUDE.md with comprehensive selector best practices documentation
  - Defined naming conventions for consistent data-cy attributes
  - Verified tests run successfully in headless mode
- **Phase 4 Complete**: All enhancement tasks completed successfully
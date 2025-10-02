# Linting Errors Fix Plan

**Generated**: 2025-10-02
**Total Errors**: 642 errors, 1254 warnings
**Files Affected**: 177 files

---

## 📊 Error Summary by Type

| Category | Count | Priority |
|----------|-------|----------|
| React Native Color Literals | 595 | 🟡 Medium |
| TypeScript `any` Type | 416 | 🟡 Medium |
| Undefined Variables | 263 | 🔴 High |
| Restricted Syntax (testID) | 228 | 🔴 High |
| React Native Inline Styles | 202 | 🟡 Medium |
| Unused Variables | 89 | 🟢 Low |
| React Hooks Dependencies | 30 | 🔴 High |
| Variable Shadowing | 11 | 🟢 Low |
| Other | 8 | 🟢 Low |

---

## 🎯 Phase 1: Critical Errors (Priority: 🔴 High)

### 1.1 Fix Undefined Variables (263 errors)

**Files Affected**: Primarily `e2e/` directory, some Cypress support files

**Root Cause**: Missing global type definitions for Detox and Cypress

**Fix Strategy**:
```typescript
// Add to appropriate .d.ts files or eslint config
```

**Tasks**:
- [x] Add Detox type definitions to `e2e/` test files
- [x] Verify Cypress types are properly imported in `cypress/support/`
- [x] Add NodeJS types where needed (EventListener, NodeJS.Timeout)
- [x] Add React types where needed

**Files to Fix**:
- `e2e/app-launch.test.js` (36 errors)
- `e2e/element-creation.test.js` (60+ errors)
- `e2e/helpers.js` (10+ errors)
- `e2e/image-handling.test.js`
- `e2e/project-operations.test.js`
- `e2e/questionnaire-navigation.test.js`
- `cypress/support/performance-utils.ts` (4 errors)
- `cypress/support/test-optimization-config.ts` (5 errors)

---

### 1.2 Fix Missing testID Attributes (228 errors)

**Files Affected**: Primarily test files

**Root Cause**: Interactive elements missing `testID` attribute (Golden Rule #2)

**Fix Strategy**:
```tsx
// Add testID to all interactive elements
<Button testID="button-name" onPress={...} />
<TextInput testID="input-name" onChangeText={...} />
<TouchableOpacity testID="touchable-name" onPress={...} />
```

**Tasks**:
- [ ] Fix test files in `__tests__/components/Navigation.test.tsx` (9 errors)
- [ ] Review and add testID to all TouchableOpacity/Pressable in tests
- [ ] Add testID to all Button components in tests
- [ ] Add testID to all TextInput components in tests

**Files to Fix**:
- `__tests__/components/Navigation.test.tsx` (9 errors)
- Review all test files for interactive element coverage

---

### 1.3 Fix React Hooks Dependencies (30 errors)

**Files Affected**: Test files and integration tests

**Root Cause**: Missing dependencies in useEffect/useCallback hooks

**Fix Strategy**:
```typescript
// Option 1: Add missing dependency
useEffect(() => {
  navigation.navigate(...);
}, [navigation]); // Add navigation

// Option 2: Use eslint-disable if intentional
// eslint-disable-next-line react-hooks/exhaustive-deps

// Option 3: Wrap function in useCallback
const saveState = useCallback(() => {...}, [deps]);
```

**Tasks**:
- [ ] Fix `__tests__/integration/navigationIntegration.test.tsx` (4 errors)
- [ ] Review all useEffect hooks for missing dependencies
- [ ] Add useCallback where appropriate
- [ ] Document intentional exclusions with comments

**Files to Fix**:
- `__tests__/integration/navigationIntegration.test.tsx` (4 errors)

---

## 🎯 Phase 2: Style & Quality Issues (Priority: 🟡 Medium)

### 2.1 Replace Color Literals (595 warnings)

**Files Affected**: Widespread across components and styles

**Root Cause**: Hardcoded color values instead of design tokens

**Fix Strategy**:
```typescript
// Before
<View style={{ backgroundColor: '#f0f0f0' }} />
<Text style={{ color: 'red' }} />

// After
import { colors } from '../constants/fantasyTomeColors';
<View style={{ backgroundColor: colors.background.secondary }} />
<Text style={{ color: colors.error.primary }} />
```

**Tasks**:
- [ ] Audit `src/constants/fantasyTomeColors.ts` for complete color palette
- [ ] Map all color literals to design tokens
- [ ] Replace color literals in components (systematic approach)
- [ ] Replace color literals in screens
- [ ] Replace color literals in tests (use theme colors)

**Approach**: Use morphllm MCP for bulk replacement once mapping is defined

---

### 2.2 Remove Inline Styles (202 warnings)

**Files Affected**: Components and test files

**Root Cause**: Inline style objects instead of StyleSheet

**Fix Strategy**:
```typescript
// Before
<View style={{ padding: 16, margin: 8 }} />

// After
const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 8,
  },
});
<View style={styles.container} />
```

**Tasks**:
- [ ] Create StyleSheet for each component with inline styles
- [ ] Move all inline styles to StyleSheet definitions
- [ ] Use design tokens for spacing/sizing values
- [ ] Keep inline styles only for dynamic computed values

**Approach**: Component-by-component refactor

---

### 2.3 Replace `any` Types (416 warnings)

**Files Affected**: Throughout codebase

**Root Cause**: Insufficient type definitions

**Fix Strategy**:
```typescript
// Before
const data: any = getData();
function process(value: any) {...}

// After
interface DataType {
  id: string;
  name: string;
}
const data: DataType = getData();
function process(value: DataType) {...}
```

**Tasks**:
- [ ] Identify common `any` patterns
- [ ] Create proper type definitions in `src/types/`
- [ ] Replace `any` in function parameters
- [ ] Replace `any` in return types
- [ ] Replace `any` in variable declarations
- [ ] Use `unknown` where type is truly unknown

**Priority Files**:
- Cypress support files (127 warnings)
- Test utilities (50+ warnings)
- Store files
- Component files

---

## 🎯 Phase 3: Code Quality (Priority: 🟢 Low)

### 3.1 Remove Unused Variables (89 warnings)

**Fix Strategy**:
- Remove truly unused variables
- Prefix intentionally unused with `_` (e.g., `_unusedParam`)
- Use type-only imports where applicable

**Tasks**:
- [ ] Review and fix unused variables in source files
- [ ] Review and fix unused variables in test files
- [ ] Use destructuring to omit unused values: `const { _unused, ...rest } = obj`

---

### 3.2 Fix Variable Shadowing (11 warnings)

**Fix Strategy**:
```typescript
// Before
const navigation = useNavigation();
items.map((item) => {
  const navigation = item.navigation; // shadows outer
});

// After
const navigation = useNavigation();
items.map((item) => {
  const itemNavigation = item.navigation; // unique name
});
```

**Tasks**:
- [ ] Rename shadowed variables with more specific names
- [ ] Review nested scopes for shadowing issues

---

### 3.3 Miscellaneous Fixes

**Tasks**:
- [ ] Fix dot notation usage (5 warnings) - Use `obj.property` instead of `obj["property"]`
- [ ] Fix namespace usage (5 errors) - Convert to ES2015 modules
- [ ] Fix `Function` type usage (5 errors) - Use proper function signatures
- [ ] Fix script URL warnings (2 warnings) - Review `javascript:` URLs
- [ ] Fix radix parameter (1 warning) - Add radix to `parseInt()`

---

## 🚀 Execution Strategy

### Recommended Order

1. **Phase 1: Critical Errors** (Week 1-2)
   - Fix undefined variables first (enables proper type checking)
   - Add missing testID attributes (critical for testing)
   - Fix React Hooks dependencies (prevents bugs)

2. **Phase 2: Style & Quality** (Week 3-4)
   - Replace color literals (improves maintainability)
   - Remove inline styles (improves performance)
   - Replace `any` types (improves type safety)

3. **Phase 3: Code Quality** (Week 5)
   - Clean up unused variables
   - Fix shadowing issues
   - Miscellaneous fixes

### Tools to Use

- **Manual Fix**: testID attributes, React Hooks dependencies
- **morphllm MCP**: Bulk color literal replacement, inline style conversion
- **Sequential MCP**: Complex type definition creation
- **Batch Operations**: Use parallel Read/Edit for similar fixes

### Validation Gates

After each phase:
```bash
npm run lint                    # Verify fixes
npm run test                    # Ensure no regressions
npm run cypress:run:spec        # Test critical paths
```

### Progress Tracking

Create checkpoint after each sub-task:
```bash
/sc:save
write_memory("lint-phase-X", "completed: [description]")
```

---

## 📝 Notes

### Protected Files
Do not modify these files (pre-commit protection):
- `cypress/e2e/login-page-tests/verify-login-page.cy.ts`
- `scripts/check-protected-files.js`
- `scripts/pre-commit-test.sh`

### ESLint Configuration
Current config: `.eslintrc.js`
Consider creating separate configs for:
- Test files (more permissive)
- E2E files (allow Detox globals)
- Storybook files (allow story-specific patterns)

### Type Definitions Needed

Priority type definitions to create:
1. Detox globals for `e2e/` directory
2. Cypress custom commands (already exists, verify)
3. Common data structures (WorldElement, Project, etc.)
4. Navigation types (already exists, verify coverage)

---

## 🎯 Success Metrics

**Target**: Reduce from 1896 problems to < 50 problems

**Phase 1**: Eliminate all errors (642 → 0)
**Phase 2**: Reduce warnings by 80% (1254 → ~250)
**Phase 3**: Reduce warnings by 95% (1254 → ~63)

**Final Goal**: Clean lint output for production readiness

---

**Version**: 1.0
**Last Updated**: 2025-10-02

# Cypress Support Files Compliance TODO

## 📋 Analysis Summary
Based on comprehensive analysis of Cypress best practices documentation and current implementation, this document outlines all required improvements to ensure the `/cypress/support` directory fully complies with documented standards.

## 🚨 CRITICAL Requirements (MUST HAVE)

### 1. ✅ Mandatory Debug Commands - **COMPLETED**
- [x] `cy.comprehensiveDebug()` exists in `/commands/debug.ts`
- [x] `cy.cleanState()` exists in `/commands/setup.ts`
- [x] `cy.captureFailureDebug()` exists in `/commands/debug.ts`

### 2. 🔄 Session Management Enhancement - **NEEDS IMPROVEMENT**

#### Current State
- Basic `sessionLogin` exists in `/commands/auth.ts`
- Missing `cacheAcrossSpecs: true` option
- No role-based session management

#### Required Changes
```typescript
// Update auth.ts with enhanced session management:
- Add cacheAcrossSpecs: true to all session commands
- Implement loginAs(role) command for role-based testing
- Add API-based login optimization
- Include session validation strategies
```

### 3. ❌ Data Seeding Strategies - **MISSING CRITICAL METHODS**

#### Required Commands to Add
```typescript
// Method 1: cy.exec() strategy
Cypress.Commands.add('execSeed', (script: string) => {
  cy.exec(`npm run ${script}`);
});

// Method 2: cy.task() strategy (requires cypress.config.js update)
Cypress.Commands.add('taskSeed', (data: any) => {
  cy.task('db:seed', data);
});

// Method 3: cy.request() API seeding
Cypress.Commands.add('apiSeed', (endpoint: string, data: any) => {
  cy.request('POST', `/test/seed/${endpoint}`, data);
});

// Method 4: Stubbing responses (already partially exists)
Cypress.Commands.add('stubResponses', (fixtures: Record<string, any>) => {
  // Implementation needed
});
```

## 📂 File Organization Requirements

### Current Structure ✅
```
cypress/support/
├── commands/
│   ├── auth.ts ✅
│   ├── character.ts ✅
│   ├── debug.ts ✅
│   ├── index.ts ✅
│   ├── navigation.ts ✅
│   ├── setup.ts ✅
│   ├── story.ts ✅
│   └── utility.ts ✅
```

### Additional Files Needed 🔴
```
cypress/support/
├── commands/
│   ├── elements/ (NEW - for element-specific commands)
│   ├── projects/ (NEW - for project management)
│   ├── responsive/ (NEW - for viewport/touch commands)
│   └── seeding/ (NEW - for data seeding strategies)
```

## 📝 Command-Specific Improvements

### auth.ts Enhancements
- [ ] Add `cacheAcrossSpecs: true` to sessionLogin
- [ ] Implement `loginAs(role)` with predefined test users
- [ ] Add validation callback to verify token expiry
- [ ] Implement faster API-based login as primary method
- [ ] Add multi-domain session support if needed

### setup.ts Enhancements
- [ ] Add `cy.exec()` based seeding
- [ ] Implement `cy.task()` based seeding
- [ ] Add `cy.request()` API seeding
- [ ] Create fixture stubbing utilities
- [ ] Ensure all clear operations are comprehensive

### debug.ts Enhancements
- [ ] Add network failure capture
- [ ] Implement performance metrics logging
- [ ] Add memory usage tracking
- [ ] Create debug data export to JSON

### New: responsive.ts (Create)
```typescript
// Commands needed:
- testResponsive(callback) // Test multiple viewports
- simulateTouch(selector, gesture) // Touch interactions
- swipe(selector, direction) // Swipe gestures (partial exists)
- setMobileViewport() // Set mobile viewport
- setTabletViewport() // Set tablet viewport
- setDesktopViewport() // Set desktop viewport
```

### New: seeding.ts (Create)
```typescript
// Consolidate all data seeding strategies:
- seedViaExec(script)
- seedViaTask(data)
- seedViaAPI(endpoint, data)
- seedViaFixtures(fixtures)
- seedTestUser(userData)
- seedTestProject(projectData)
- seedTestElements(elements)
```

## ⚠️ Code Quality Issues to Fix

### 1. Selector Compliance
- [ ] Audit ALL files for non-data-cy selectors
- [ ] Replace any class/ID selectors with data-cy
- [ ] Ensure testID mapping for React Native Web

### 2. Promise Chain Issues
- [x] Fixed in debug.ts (cy.task in callbacks)
- [x] Fixed in setup.ts (cy commands in then())
- [ ] Audit remaining files for similar issues

### 3. TypeScript Declarations
- [ ] Update index.d.ts with all new commands
- [ ] Add proper return types for all commands
- [ ] Include parameter documentation

### 4. Function Syntax
- [ ] Ensure hooks use `function()` not arrow functions
- [ ] Document requirement in comments

## 🎯 React Native Web Specific Requirements

### Currently Missing
- [ ] Platform detection helpers
- [ ] AsyncStorage/localStorage abstraction
- [ ] Touch event simulation (partial exists)
- [ ] React Navigation helpers
- [ ] Error boundary detection (partial exists)

### Files to Create/Update
- [ ] `react-native-commands.ts` - Consolidate RN-specific commands
- [ ] `react-native-web-helpers.ts` - Update with documented patterns
- [ ] `test-providers.tsx` - Ensure proper wrapper components

## 📋 Implementation Priority

### Phase 1: Critical Fixes (Immediate)
1. Update auth.ts with enhanced session management
2. Add missing data seeding strategies
3. Fix TypeScript declarations

### Phase 2: Organization (Next Sprint)
1. Create category folders for commands
2. Reorganize existing commands
3. Add comprehensive documentation

### Phase 3: Enhancement (Future)
1. Add performance monitoring
2. Implement advanced debugging
3. Create test data factories

## ✅ Validation Checklist

Before marking complete, ensure:
- [ ] All commands use `data-cy` selectors exclusively
- [ ] `cy.comprehensiveDebug()` is called in EVERY test file's beforeEach
- [ ] `cy.cleanState()` is called before each test
- [ ] Session management uses `cacheAcrossSpecs: true`
- [ ] All 4 data seeding strategies are implemented
- [ ] TypeScript declarations are complete and accurate
- [ ] No conditional logic (if/else) in test commands
- [ ] Hooks use `function()` syntax, not arrow functions
- [ ] Commands are organized by category
- [ ] Documentation is comprehensive

## 📚 Reference Documentation
- Primary: `/cypress/docs/cypress-best-practices.md`
- Advanced: `/cypress/docs/ADVANCED-TESTING-STRATEGY.md`
- Project: `/CLAUDE.md`

## 🔄 Progress Tracking

### Completed ✅
- [x] Analysis of current implementation
- [x] Identification of gaps
- [x] Creation of improvement plan

### In Progress 🔄
- [ ] Enhanced session management
- [ ] Data seeding strategies
- [ ] Command reorganization

### Pending ⏳
- [ ] Responsive commands
- [ ] Performance monitoring
- [ ] Advanced debugging features

---

**Last Updated**: ${new Date().toISOString()}
**Priority**: HIGH - These changes are critical for test reliability and maintainability
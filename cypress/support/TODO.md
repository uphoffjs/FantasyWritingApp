# Cypress Support Files Compliance TODO

## 📋 Analysis Summary
Based on comprehensive analysis of Cypress best practices documentation and current implementation, this document outlines all required improvements to ensure the `/cypress/support` directory fully complies with documented standards.

## 🚨 CRITICAL Requirements (MUST HAVE)

### 1. ✅ Mandatory Debug Commands - **COMPLETED**
- [x] `cy.comprehensiveDebug()` exists in `/commands/debug.ts`
- [x] `cy.cleanState()` exists in `/commands/setup.ts`
- [x] `cy.captureFailureDebug()` exists in `/commands/debug.ts`

### 2. ✅ Session Management Enhancement - **COMPLETED**

#### Current State
- Enhanced `sessionLogin` exists in `/commands/auth.ts` with `cacheAcrossSpecs: true`
- Role-based session management implemented with `loginAs(role)` command
- API-based login optimized with session caching
- Token expiry validation included

#### Completed Changes
```typescript
// auth.ts has been updated with:
- ✅ Added cacheAcrossSpecs: true to all session commands
- ✅ Implemented loginAs(role) command for role-based testing
- ✅ Enhanced API-based login optimization with caching
- ✅ Included session validation strategies with token expiry checks
```

### 3. ✅ Data Seeding Strategies - **COMPLETED**

#### Implemented Commands in `/commands/seeding.ts`
```typescript
// ✅ Method 1: cy.exec() strategy - execSeed
// ✅ Method 2: cy.task() strategy - taskSeed
// ✅ Method 3: cy.request() API seeding - apiSeed
// ✅ Method 4: Stubbing responses - stubResponses
// ✅ Additional helpers:
// - seedTestUser()
// - seedTestProject()
// - seedTestElements()
// - clearTestData()
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

### Additional Files Created ✅
```
cypress/support/
├── commands/
│   ├── elements/ ✅ (CREATED - element-specific commands)
│   ├── projects/ ✅ (CREATED - project management commands)
│   ├── responsive.ts ✅ (CREATED - viewport/touch commands)
│   └── seeding.ts ✅ (CREATED - data seeding strategies)
```

## 📝 Command-Specific Improvements

### auth.ts Enhancements
- [x] Add `cacheAcrossSpecs: true` to sessionLogin
- [x] Implement `loginAs(role)` with predefined test users
- [x] Add validation callback to verify token expiry
- [x] Implement faster API-based login as primary method
- [ ] Add multi-domain session support if needed

### setup.ts Enhancements
- [x] Add `cy.exec()` based seeding (in seeding.ts)
- [x] Implement `cy.task()` based seeding (in seeding.ts)
- [x] Add `cy.request()` API seeding (in seeding.ts)
- [x] Create fixture stubbing utilities (in seeding.ts)
- [ ] Ensure all clear operations are comprehensive

### debug.ts Enhancements
- [x] Add network failure capture
- [x] Implement performance metrics logging
- [x] Add memory usage tracking
- [x] Create debug data export to JSON

### responsive.ts (CREATED) ✅
```typescript
// Commands implemented:
- ✅ testResponsive(callback) // Test multiple viewports
- ✅ simulateTouch(selector, gesture) // Touch interactions
- ✅ Swipe gestures (all directions)
- ✅ setMobileViewport() // Set mobile viewport
- ✅ setTabletViewport() // Set tablet viewport
- ✅ setDesktopViewport() // Set desktop viewport
- ✅ isMobileViewport() // Check viewport size
- ✅ isTabletViewport() // Check viewport size
- ✅ isDesktopViewport() // Check viewport size
- ✅ testVisibilityAcrossViewports() // Cross-viewport testing
- ✅ pinch() // Pinch zoom gesture
- ✅ rotate() // Rotation gesture
```

### seeding.ts (CREATED) ✅
```typescript
// All data seeding strategies implemented:
- ✅ execSeed(script)
- ✅ taskSeed(seedType, data)
- ✅ apiSeed(endpoint, data)
- ✅ stubResponses(fixtures)
- ✅ seedTestUser(userData)
- ✅ seedTestProject(projectData)
- ✅ seedTestElements(elements)
- ✅ clearTestData()
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
- [x] Update index.d.ts with all new commands
- [x] Add proper return types for all commands
- [x] Include parameter documentation

### 4. Function Syntax
- [ ] Ensure hooks use `function()` not arrow functions
- [ ] Document requirement in comments

## 🎯 React Native Web Specific Requirements

### Currently Missing
- [x] Platform detection helpers
- [x] AsyncStorage/localStorage abstraction
- [x] Touch event simulation (partial exists)
- [x] React Navigation helpers
- [x] Error boundary detection (partial exists)

### Files to Create/Update
- [x] `react-native-commands.ts` - Consolidate RN-specific commands ✅ CREATED
- [ ] `react-native-web-helpers.ts` - Update with documented patterns
- [ ] `test-providers.tsx` - Ensure proper wrapper components

## 📋 Implementation Priority

### Phase 1: Critical Fixes (Immediate)
1. Update auth.ts with enhanced session management
2. Add missing data seeding strategies
3. Fix TypeScript declarations

### Phase 2: Organization (Next Sprint) ✅ COMPLETED
1. ✅ Create category folders for commands (elements/, projects/ created)
2. ✅ Reorganize existing commands (organized into folders)
3. ✅ Add comprehensive documentation (all commands documented)

### Phase 3: Enhancement (Future) - PARTIALLY COMPLETE
1. ✅ Add performance monitoring (COMPLETED)
2. ✅ Implement advanced debugging (COMPLETED)
3. ⏳ Create test data factories (PENDING)

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
- [x] Enhanced session management with cacheAcrossSpecs
- [x] Implemented role-based login (loginAs)
- [x] Created comprehensive data seeding strategies
- [x] Created responsive/viewport commands
- [x] Updated TypeScript declarations for all new commands

### In Progress 🔄
- [x] Command reorganization into category folders ✅ COMPLETED
- [x] Additional React Native Web helpers ✅ COMPLETED
- [x] Performance monitoring ✅ COMPLETED

### Pending ⏳
- [x] Responsive commands ✅ COMPLETED
- [x] Performance monitoring ✅ COMPLETED
- [x] Advanced debugging features ✅ COMPLETED

---

**Last Updated**: 2025-09-22T14:00:00.000Z
**Priority**: HIGH - These changes are critical for test reliability and maintainability

## 📈 Implementation Status Update

### Phase 1 Completed (Critical Fixes)
1. ✅ Enhanced session management with `cacheAcrossSpecs: true`
2. ✅ Implemented role-based login with `loginAs(role)` command
3. ✅ Created comprehensive data seeding strategies (all 4 methods)
4. ✅ Updated TypeScript declarations for all new commands
5. ✅ Created responsive/viewport commands for React Native Web testing

### Next Steps
- ✅ Create element-specific and project-specific command folders (COMPLETED)
- ✅ Add performance monitoring commands (COMPLETED)
- ✅ Implement advanced debugging features (COMPLETED)
- ✅ Reorganize commands into category folders (COMPLETED)

### Remaining Work
- [ ] Create test data factories
- [ ] Audit ALL files for non-data-cy selectors
- [ ] Ensure hooks use `function()` not arrow functions
- [ ] Add multi-domain session support if needed
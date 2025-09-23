# CLAUDE.md - FantasyWritingApp Quick Reference

## 🚨 MANDATORY CHECKLIST
1. ✅ Read existing files before editing (use Read tool)
2. ✅ Use ONLY `data-cy` attributes for test selectors (React Native: `testID`)
3. ✅ Run `npm run lint` before marking tasks complete
4. ✅ Include helpful code comments (Better Comments syntax)
5. ✅ Fix code first when tests fail
6. ✅ Mobile-first development

## Project Overview
**FantasyWritingApp**: Cross-platform creative writing app (React Native) for managing stories, characters, scenes, and chapters.

**Core Elements**: Characters, Locations, Magic Systems, Cultures, Creatures, Organizations, Religions, Technologies, Historical Events, Languages

## Tech Stack
- **Framework**: React Native 0.75.4 + TypeScript 5.2.2
- **State**: Zustand with AsyncStorage
- **Navigation**: React Navigation 6
- **Testing**: Cypress (web E2E), Jest
- **Platforms**: iOS, Android, Web (port 3002)
- **Backend**: Supabase

## Essential Commands
```bash
npm run web           # Dev server port 3002
npm run lint          # MANDATORY before commits
npm run cypress:open  # Open Cypress UI
npm run cypress:run   # Run headless tests
npm run test          # Jest tests
npm run build:web     # Production build
```

## Project Structure
```
src/
├── components/       # UI components (common/native/web)
├── screens/         # Screen components
├── store/          # Zustand stores
├── types/          # TypeScript definitions
├── navigation/     # React Navigation
├── utils/          # Utilities
cypress/            # E2E tests
├── e2e/           # Test specs
├── support/       # Commands & utilities
```

## Better Comments Syntax
Use these prefixes for clear, categorized comments throughout the codebase:

```javascript
// * Highlights - Important information
// ! Alerts - Warnings, deprecated code, or critical issues
// ? Questions - Queries or areas needing clarification
// TODO: Tasks - Items to complete or improve
// // Strikethrough - Commented out code (double slash)

// Examples:
// * This component handles user authentication
// ! DEPRECATED: Use useAuthStore() instead of this function
// ? Should we add rate limiting to this endpoint?
// TODO: Add error boundary to this component
// // const oldImplementation = legacy();
```

## Critical Development Rules

### NEVER Do
- ❌ Use selectors other than `data-cy`/`testID`
- ❌ Skip reading files before editing
- ❌ Use HTML elements (use React Native components)
- ❌ Use `if` statements in Cypress tests
- ❌ Leave console.log statements
- ❌ Skip `npm run lint`

### ALWAYS Do
- ✅ React Native components only (View, Text, TouchableOpacity, TextInput)
- ✅ Platform.select() for platform-specific code
- ✅ StyleSheet.create() for styles
- ✅ Error boundaries on all components
- ✅ Validate/sanitize user inputs
- ✅ Add accessibility props

## Cypress Testing Rules
```javascript
// MANDATORY Structure
describe('Feature', () => {
  beforeEach(function() {  // Must use function()
    cy.comprehensiveDebug();  // MANDATORY
    cy.cleanState();          // MANDATORY
    cy.visit('/');
  });

  afterEach(function() {
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  it('test description', () => {
    // Arrange → Act → Assert pattern
    // NO if/else statements
    // Use only data-cy selectors
  });
});
```

### Session Management
- Use cy.session() for all auth
- Add `cacheAcrossSpecs: true`
- Include validation callback
- Unique session IDs

### Data Seeding Methods
1. cy.exec() - System commands
2. cy.task() - Node.js code
3. cy.request() - API seeding
4. cy.intercept() - Fixture stubbing

## Platform Handling
- Web: `Platform.OS === 'web'`
- Mobile: Touch events, no hover states
- Responsive: useWindowDimensions()
- Storage: AsyncStorage (mobile) / localStorage (web)

## Testing Coverage Requirements
- Lines: 80%
- Branches: 75%
- Functions: 80%
- Critical paths: 100% E2E coverage

## Error Handling
- Error boundaries required
- Loading/error/success states
- Network error handling with cy.intercept()
- Console error capture in tests

## Quick Debug Process
1. Check webpack output (BashOutput tool)
2. Verify http://localhost:3002 responds
3. Run Cypress tests for console errors
4. Check TypeScript compilation
5. Verify dependencies (npm ls)

## React Native Pitfalls
- Text must be in Text component
- Images need explicit dimensions
- No CSS strings in styles
- No hover states on mobile
- Use testID → converts to data-cy on web

## Git Workflow
```bash
# Feature branches only (never main)
git checkout -b feature/[name]
git commit -m "feat: description"  # conventional commits
```

## File Paths Reference
- `/cypress/e2e/` - E2E tests
- `/cypress/support/` - Custom commands
- `/src/components/` - Components
- `/src/screens/` - Screens
- `/src/store/` - Zustand stores
- `/src/types/` - TypeScript types

## Testing Compliance Docs
For detailed Cypress compliance requirements, see:
- `/cypress/support/TODO.md` - Improvements checklist
- `/cypress/support/IMPLEMENTATION_PLAN.md` - Implementation details
- `/cypress/support/COMPLIANCE_SUMMARY.md` - Current status (65% compliant)

---
**After compacting: Re-read this file for context**
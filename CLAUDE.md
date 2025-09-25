# CLAUDE.md - FantasyWritingApp Quick Reference

## 🚨 MANDATORY CHECKLIST
1. ✅ Read existing files before editing (use Read tool)
2. ✅ Use ONLY `data-cy` attributes for test selectors (React Native: `testID`)
3. ✅ Run `npm run lint` before marking tasks complete
4. ✅ Include helpful code comments (Better Comments syntax)
5. ✅ Fix code first when tests fail
6. ✅ Mobile-first development
7. ✅ Clear context every 90 minutes (see Context Management below)

## 🧠 Context Management

### Quick Context Commands
```bash
# The Golden Sequence™ - Use every 90 minutes
/sc:save                          # Save config
write_memory("checkpoint", state) # Save context
/clear                           # Clear conversation
/sc:load                         # Reload config
read_memory("checkpoint")        # Restore context
```

### Context Health Monitoring
| Indicator | Action Required |
|-----------|----------------|
| **Slow responses** | Clear immediately |
| **90+ minutes** | Proactive clear |
| **Before break** | Save checkpoint |
| **Task complete** | Update memory |
| **End of day** | Save EOD summary |

### Essential Memory Keys
```bash
"checkpoint"        # Current work state
"EOD"              # End of day summary
"feature_[name]"   # Feature-specific context
"bug_[id]"         # Debug session state
"temp_*"           # Temporary (delete after use)
```

### 📚 Context Documentation
- **[CONTEXT_MANAGEMENT_GUIDE.md](./CONTEXT_MANAGEMENT_GUIDE.md)** - Comprehensive context management strategies
- **[SESSION_BEST_PRACTICES.md](./SESSION_BEST_PRACTICES.md)** - Optimal session patterns and workflows
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Command cheat sheet for quick access
- **[claude-save-and-clear-workflow.md](./claude-save-and-clear-workflow.md)** - Step-by-step clear workflow

### When to Clear Context
- ✅ Every 90-120 minutes (mandatory)
- ✅ Before complex operations
- ✅ When responses feel slow
- ✅ After completing major features
- ✅ Before/after debugging sessions

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

## Critical Development Rules (Aligned with Cypress.io)

### NEVER Do (Cypress.io Best Practices)
- ❌ Start servers within Cypress tests - start BEFORE
- ❌ Visit external sites - only test your application
- ❌ Use arbitrary waits like `cy.wait(3000)`
- ❌ Use CSS selectors, IDs, or tag selectors
- ❌ Assign Cypress returns to variables
- ❌ Use `if/else` statements in tests
- ❌ Create dependent tests - each must be independent
- ❌ Clean after tests - clean BEFORE
- ❌ Skip baseUrl configuration
- ❌ Leave console.log statements
- ❌ Skip `npm run lint`

### ALWAYS Do (Cypress & React Native Standards)
- ✅ Start dev server BEFORE running Cypress
- ✅ Set baseUrl in cypress.config.js
- ✅ Use `data-cy` attributes exclusively
- ✅ Use cy.session() with validation for auth
- ✅ Write independent, isolated tests
- ✅ Clean state BEFORE each test
- ✅ React Native components only (View, Text, TouchableOpacity, TextInput)
- ✅ Platform.select() for platform-specific code
- ✅ StyleSheet.create() for styles
- ✅ Error boundaries on all components
- ✅ Validate/sanitize user inputs
- ✅ Add accessibility props

## Cypress Testing Rules (Per Cypress.io Best Practices)
```javascript
// MANDATORY Structure (Aligned with Official Docs)
describe('Feature', () => {
  beforeEach(function() {  // Must use function()
    cy.comprehensiveDebug();  // Project requirement
    cy.cleanState();          // Clean BEFORE (Cypress.io rule)

    // Use session for auth (Cypress.io pattern)
    cy.session('user', setup, {
      validate() {            // Validation required
        cy.getCookie('auth').should('exist');
      },
      cacheAcrossSpecs: true
    });

    cy.visit('/');           // Uses baseUrl
  });

  afterEach(function() {
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  it('test description', () => {
    // Arrange → Act → Assert pattern
    // NO if/else statements (Cypress.io rule)
    // NO arbitrary waits (Cypress.io rule)
    // Use only data-cy selectors (Cypress.io rule)
    // Each test independent (Cypress.io rule)
  });
});
```

### Session Management (Cypress.io Patterns)
```javascript
// CORRECT per Cypress.io
cy.session(
  ['user', 'role', 'env'],  // Composite key
  () => {
    // PREFER API login (faster)
    cy.request('POST', '/api/login', credentials)
      .then(res => {
        window.localStorage.setItem('token', res.body.token);
      });
  },
  {
    validate() {            // MANDATORY
      cy.window().then(win => {
        expect(win.localStorage.getItem('token')).to.not.be.null;
      });
    },
    cacheAcrossSpecs: true  // Share across files
  }
);

// ALWAYS navigate after session
cy.visit('/dashboard');
```

### Data Seeding Methods (Cypress.io Patterns)
1. **cy.exec()** - System commands (DB reset)
2. **cy.task()** - Node.js code (complex seeding)
3. **cy.request()** - API seeding (PREFERRED for speed)
4. **cy.intercept()** - Stub responses (not seeding)

```javascript
// BEST: API seeding (fast)
cy.request('POST', '/api/seed/user', userData);

// Good: Task for complex operations
cy.task('seedDatabase', { users: 5 });

// Stubbing (different from seeding)
cy.intercept('GET', '/api/users', { fixture: 'users.json' });
```

## Selector Best Practices (Cypress.io Official Priority)

### Priority Order (From Official Docs)
1. **`data-cy`** - Cypress team's PREFERRED selector
2. **`data-test`** - Alternative test attribute
3. **`data-testid`** - Testing Library compatibility
4. **`testID`** - React Native (converts to data-cy)
5. **`[role][name]`** - Semantic HTML (if above unavailable)

### NEVER Use (Cypress.io Anti-patterns)
- ❌ **`.class`** - CSS classes change
- ❌ **`#id`** - IDs aren't unique
- ❌ **`button`** - Too generic
- ❌ **`[title="..."]`** - Attributes change
- ❌ **`cy.contains('text')`** - Text changes

### Custom Cypress Commands (Best Practices)
```javascript
// PREFERRED: Use data-cy attributes (Cypress.io)
cy.get('[data-cy="submit-button"]').click();
cy.getByDataCy('submit-button').click(); // Custom helper

// NEVER assign to variables (Cypress.io rule)
// ❌ WRONG
const button = cy.get('[data-cy="submit"]');

// ✅ CORRECT - Use aliases
cy.get('[data-cy="submit"]').as('submitBtn');
cy.get('@submitBtn').click();

// Specialized commands for common patterns
cy.clickButton('Submit');           // Looks for data-cy first, then text
cy.getModal('create-element');      // Gets modal with data-cy pattern
cy.getCard('element-card');         // Gets card with data-cy pattern
cy.getPerformanceElement('toggle'); // Gets performance-[element]

// Within parent elements
cy.getByDataCy('form').findByTestId('field');
```

### Adding Selectors to Components
```javascript
// React Native components
<TouchableOpacity
  testID="submit-button"  // Converts to data-cy on web
  data-cy="submit-button"  // Explicit for web
>

// Web-specific components
<button data-cy="submit-button">Submit</button>

// Performance components
<div data-cy="performance-monitor-toggle">
<div data-cy="performance-dashboard-overlay">
<button data-cy="clear-metrics-button">
```

### Naming Conventions
- **Buttons**: `[action]-button` (e.g., `submit-button`, `cancel-button`)
- **Modals**: `[name]-modal` (e.g., `create-element-modal`)
- **Cards**: `[type]-card` (e.g., `element-card`, `project-card`)
- **Forms**: `[name]-form` (e.g., `login-form`, `element-form`)
- **Inputs**: `[field]-input` (e.g., `email-input`, `password-input`)
- **Performance**: `performance-[element]` (e.g., `performance-monitor-toggle`)

## Platform Handling
- Web: `Platform.OS === 'web'`
- Mobile: Touch events, no hover states
- Responsive: useWindowDimensions()
- Storage: AsyncStorage (mobile) / localStorage (web)

## Testing Coverage Requirements (Realistic Targets)
- **Lines**: 80% (75-85% range acceptable)
- **Branches**: 75% (70-80% realistic)
- **Functions**: 80% (75-85% good)
- **Critical paths**: 90% E2E (100% unrealistic)
- **Note**: Avoid 100% targets - they're unrealistic per Cypress.io

## Error Handling
- Error boundaries required
- Loading/error/success states
- Network error handling with cy.intercept()
- Console error capture in tests

## Quick Debug Process (Cypress.io Aligned)
1. **Ensure server is running on port 3002 FIRST**
2. Check webpack output (BashOutput tool)
3. Verify http://localhost:3002 responds
4. **Check baseUrl is set in cypress.config.js**
5. Run Cypress tests for console errors
6. **Check for arbitrary waits** (grep for cy.wait)
7. **Verify all tests are independent**
8. Check TypeScript compilation
9. Verify dependencies (npm ls)

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

## Testing Compliance Docs (Updated Hierarchy)
**Primary References (in order)**:
1. **[Cypress.io Official Best Practices](https://docs.cypress.io/guides/references/best-practices)** - Ultimate authority
2. **`/cypress/CYPRESS-TESTING-STANDARDS.md`** - Project authority (v2.0.0)
3. **`/cypress/docs/cypress-best-practices.md`** - Detailed guide
4. **`/cypress/docs/ADVANCED-TESTING-STRATEGY.md`** - Advanced patterns

**Implementation Tracking**:
- `/cypress/support/TODO.md` - Improvements checklist
- `/cypress/support/IMPLEMENTATION_PLAN.md` - Implementation details
- `/cypress/support/COMPLIANCE_SUMMARY.md` - Current status

## Test Results Management

### File Naming Convention
All test result files MUST include timestamps for easy identification:
```
test-results-YYYYMMDD-HHmmss-[type].md
test-results-20250124-143022-component.md   # Component tests
test-results-20250124-143022-e2e.md         # E2E tests
test-results-20250124-143022-unit.md        # Unit tests
test-results-20250124-143022-all.md         # All test types
```

### Directory Structure
```
test-results/
├── latest/                                  # Always contains most recent results
│   ├── test-results-latest.md             # Symlink or copy of newest report
│   ├── test-results-latest-component.md   # Latest component test results
│   ├── test-results-latest-e2e.md         # Latest E2E test results
│   └── summary.json                       # Machine-readable summary
├── 2025-01/                                # Monthly archives
│   ├── test-results-20250124-143022-component.md
│   └── test-results-20250124-093015-e2e.md
└── archive/                                # Older results (30+ days)
```

### Metadata Header (MANDATORY)
Every test results file MUST start with:
```markdown
---
timestamp: 2025-01-24T14:30:22Z    # ISO 8601 format
type: component                     # component|e2e|unit|all
runner: cypress                     # cypress|jest|vitest
status: complete                    # complete|partial|failed
duration: 3m42s
passed: 45
failed: 3
skipped: 2
coverage: 78%
previous: test-results-20250124-093015-component.md
---
```

### Quick Access Commands
Add these to package.json scripts:
```json
{
  "test:report": "npm run test:component && node scripts/generate-report.js",
  "test:latest": "cat test-results/latest/test-results-latest.md",
  "test:clean": "node scripts/archive-old-results.js",
  "test:compare": "node scripts/compare-results.js"
}
```

### Generate Report Script Example
```javascript
// scripts/generate-report.js
const timestamp = new Date().toISOString()
  .replace(/[:.]/g, '-')
  .slice(0, 19);
const filename = `test-results-${timestamp}-${process.env.TEST_TYPE || 'all'}.md`;
// Generate report with metadata header
// Copy to test-results/latest/test-results-latest.md
```

### Finding Latest Results
1. **Quick Check**: `test-results/latest/test-results-latest.md`
2. **By Type**: `test-results/latest/test-results-latest-[type].md`
3. **Summary**: `test-results/latest/summary.json` (machine-readable)
4. **Command**: `npm run test:latest`
5. **Git**: `git log -1 --name-only | grep test-results`

### Retention Policy
- **Latest**: Always kept in `test-results/latest/`
- **30 days**: Keep in monthly folders (`YYYY-MM/`)
- **Archive**: Move to `archive/` after 30 days
- **CI/CD**: Tag with build number: `test-results-YYYYMMDD-HHmmss-build-123.md`

### Comparison Features
```bash
# Compare with previous run
npm run test:compare

# Compare specific dates
npm run test:compare -- --from=20250123 --to=20250124

# Generate trend report
npm run test:trend -- --days=7
```

### Integration with CI/CD
```yaml
# .github/workflows/test.yml example
- name: Run Tests with Timestamp
  run: |
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    npm run test:all -- --report=test-results-$TIMESTAMP-all.md
    cp test-results-$TIMESTAMP-all.md test-results/latest/test-results-latest.md
```

### Best Practices
1. **Always use ISO 8601** timestamps for consistency
2. **Include metadata headers** for searchability
3. **Maintain latest symlinks** for quick access
4. **Archive old results** to prevent clutter
5. **Use semantic naming** for test types
6. **Generate diffs** for regression detection
7. **Track trends** over time for quality metrics

---
**After compacting: Re-read this file for context**
# Cypress Essential Knowledge Summary

This document consolidates the key concepts from all Cypress documentation for quick reference during development of the FantasyWritingApp.

## Quick Reference Links
- [Introduction to Cypress](./cypress-introduction-to-cypress.md)
- [Best Practices](./cypress-best-practices.md)
- [Testing Types](./cypress-testing-types.md)
- [Writing & Organizing Tests](./cypress-writing-organizing-tests.md)
- [Interacting with Elements](./cypress-interacting-with-elements.md)
- [Variables & Aliases](./cypress-variables-and-aliases.md)
- [Test Isolation](./cypress-test-isolation.md)
- [Retry-ability](./cypress-retry-ability.md)
- [Open Mode](./cypress-open-mode.md)

## Core Principles

### 1. Asynchronous Command Queue
```javascript
// ❌ WRONG - Don't assign Cypress commands
const button = cy.get('[data-cy="button"]')

// ✅ CORRECT - Chain commands
cy.get('[data-cy="button"]').click()
```

### 2. Automatic Waiting & Retry
- Default timeout: 4 seconds
- Commands automatically retry until element is found or timeout
- No need for explicit waits in most cases

### 3. Test Isolation
- Each test should be completely independent
- Clean state in `beforeEach`, not `afterEach`
- Use `cy.session()` for login caching

## Critical Rules for FantasyWritingApp

### ⚠️ MANDATORY: Element Selection
```javascript
// ! ONLY use data-cy attributes
cy.get('[data-cy="element-name"]')  // ✅ ONLY acceptable selector

// ! NEVER use these
cy.get('.class')     // ❌ Forbidden
cy.get('#id')        // ❌ Forbidden
cy.get('button')     // ❌ Forbidden
```

### React Native Web Integration
```tsx
// * In components, use testID (converts to data-cy on web)
<TouchableOpacity testID="submit-button">
  <Text>Submit</Text>
</TouchableOpacity>

// * Platform-specific attributes
const getTestProps = (id: string) => {
  if (Platform.OS === 'web') {
    return { 'data-cy': id };
  }
  return { testID: id };
};
```

## Testing Types

### E2E Testing (Primary)
- Test complete user workflows
- Cover critical paths (login → create project → add elements)
- Use fixtures for consistent data

### Component Testing
- Test individual React Native components
- Verify props, events, and rendering
- Use cypress/component/*.cy.tsx files

### API Testing
- Use `cy.request()` for direct API calls
- Validate responses and status codes
- Good for setup/teardown operations

## File Organization

```
cypress/
├── docs/                  # All documentation
├── e2e/                   # End-to-end tests
│   ├── auth/             # Authentication flows
│   ├── elements/         # Element management
│   └── projects/         # Project workflows
├── component/            # Component tests
├── fixtures/             # Test data
├── support/              # Helpers & commands
│   ├── commands.js       # Custom commands
│   ├── e2e.js           # E2E support
│   └── component.js     # Component support
└── cypress.config.ts     # Configuration
```

## Essential Commands & Patterns

### Custom Commands
```javascript
// cypress/support/commands.js
Cypress.Commands.add('login', (email = 'test@example.com') => {
  cy.session(email, () => {
    cy.visit('/login')
    cy.get('[data-cy="email-input"]').type(email)
    cy.get('[data-cy="password-input"]').type('password')
    cy.get('[data-cy="login-button"]').click()
  })
})

Cypress.Commands.add('createElement', (elementData) => {
  cy.get('[data-cy="new-element-button"]').click()
  cy.get('[data-cy="element-title-input"]').type(elementData.title)
  cy.get('[data-cy="save-button"]').click()
})
```

### Element Interactions
```javascript
// * Basic interactions
cy.get('[data-cy="input"]').type('text')
cy.get('[data-cy="button"]').click()
cy.get('[data-cy="select"]').select('option')

// * Advanced interactions
cy.get('[data-cy="file-input"]').selectFile('path/to/file')
cy.get('[data-cy="element"]').trigger('touchstart')
cy.get('[data-cy="draggable"]').drag('[data-cy="drop-zone"]')

// * Assertions
cy.get('[data-cy="element"]')
  .should('be.visible')
  .and('contain', 'text')
  .and('have.class', 'active')
```

### Variables & Aliases
```javascript
// * Element aliases
cy.get('[data-cy="complex-selector"]').as('myElement')
cy.get('@myElement').click()

// * Value extraction
cy.get('[data-cy="count"]').then(($el) => {
  const count = parseInt($el.text())
  expect(count).to.be.greaterThan(0)
})

// * Network aliases
cy.intercept('GET', '/api/elements').as('getElements')
cy.wait('@getElements')
```

### Test Isolation Best Practices
```javascript
describe('Element Management', () => {
  beforeEach(() => {
    // * Clean state BEFORE each test
    cy.task('db:reset')
    cy.task('db:seed')
    cy.login()
    cy.visit('/elements')
  })

  it('creates element', () => {
    // Test is completely independent
  })
})
```

### Network Handling
```javascript
// * Intercept and stub
cy.intercept('GET', '/api/elements', { fixture: 'elements.json' })

// * Wait for requests
cy.intercept('POST', '/api/elements/*').as('saveElement')
cy.get('[data-cy="save"]').click()
cy.wait('@saveElement').its('response.statusCode').should('eq', 200)
```

## Retry-ability & Flake Prevention

### Understanding Retry Behavior
- Queries (`cy.get()`) retry automatically
- Assertions retry with their preceding query
- Actions (`click()`, `type()`) don't retry
- Use proper waiting strategies, not fixed delays

### Handling Async Operations
```javascript
// ✅ GOOD - Wait for specific conditions
cy.get('[data-cy="loading"]').should('not.exist')
cy.get('[data-cy="data"]').should('be.visible')

// ❌ BAD - Arbitrary waits
cy.wait(3000)
```

## Debugging with Open Mode

### Key Features
1. **Command Log**: Interactive timeline of all commands
2. **Time Travel**: Hover over commands to see app state
3. **Selector Playground**: Find optimal selectors
4. **DevTools Integration**: Full browser DevTools access
5. **Real-time Reload**: Auto-reload on test changes

### Debug Commands
```javascript
cy.pause()  // Pause execution
cy.debug()  // Debugger breakpoint
cy.log('message')  // Log to command log
cy.screenshot('name')  // Capture screenshot
```

## Configuration Essentials

```typescript
// cypress.config.ts
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3002',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    video: false,  // Enable only for debugging
    
    retries: {
      runMode: 2,    // CI retries
      openMode: 0    // No retries locally
    },
    
    setupNodeEvents(on, config) {
      on('task', {
        'db:reset': () => { /* reset logic */ },
        'db:seed': (data) => { /* seed logic */ }
      })
    }
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack'
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}'
  }
})
```

## Testing Checklist

### Before Writing Tests
- [ ] Ensure all elements have `data-cy` attributes
- [ ] Plan test structure (describe/it blocks)
- [ ] Identify reusable patterns for custom commands
- [ ] Set up fixtures for test data

### During Test Development
- [ ] Write independent, isolated tests
- [ ] Use semantic `data-cy` names
- [ ] Implement proper waiting (no arbitrary delays)
- [ ] Add meaningful assertions
- [ ] Handle both success and error cases

### Before Committing
- [ ] Run tests locally (`npm run cypress:run`)
- [ ] Check for console errors
- [ ] Verify no sensitive data in tests
- [ ] Update documentation if needed
- [ ] Clean up any debug code (cy.pause(), console.log)

## Common Patterns for FantasyWritingApp

### Project Creation Flow
```javascript
it('creates a new project', () => {
  cy.visit('/projects')
  cy.get('[data-cy="new-project-button"]').click()
  cy.get('[data-cy="project-name-input"]').type('Fantasy World')
  cy.get('[data-cy="project-description"]').type('Epic adventure')
  cy.get('[data-cy="save-project-button"]').click()
  cy.url().should('include', '/project/')
  cy.get('[data-cy="project-title"]').should('contain', 'Fantasy World')
})
```

### Element Management
```javascript
it('manages elements', () => {
  cy.createProject('Test Project')
  cy.get('[data-cy="add-element-button"]').click()
  cy.get('[data-cy="element-type-select"]').select('Character')
  cy.get('[data-cy="element-name"]').type('Hero')
  cy.get('[data-cy="save-element"]').click()
  cy.get('[data-cy="element-list"]').should('contain', 'Hero')
})
```

### Responsive Testing
```javascript
describe('Mobile View', () => {
  beforeEach(() => {
    cy.viewport('iphone-x')
  })
  
  it('shows mobile navigation', () => {
    cy.get('[data-cy="mobile-menu"]').should('be.visible')
    cy.get('[data-cy="desktop-sidebar"]').should('not.exist')
  })
})
```

## Performance Tips

1. **Batch Assertions**: Chain multiple assertions on same element
2. **Smart Waits**: Use route aliases instead of fixed delays
3. **Parallel Execution**: Run tests in parallel in CI
4. **Selective Testing**: Use tags to run subset of tests
5. **Fixture Caching**: Reuse fixtures across tests

## Troubleshooting Guide

| Problem | Solution |
|---------|----------|
| Element not found | Check `data-cy` attribute exists |
| Test flakiness | Add proper waits, check async operations |
| Timeout errors | Increase timeout or fix slow operations |
| Network failures | Use `cy.intercept()` to stub responses |
| State pollution | Ensure proper test isolation |
| Login issues | Use `cy.session()` for caching |

## Key Takeaways

1. **ALWAYS use `data-cy` selectors** - No exceptions
2. **Tests must be independent** - Each test stands alone
3. **Let Cypress wait** - Don't use arbitrary delays
4. **Clean state before tests** - Not after
5. **Chain commands** - Don't assign to variables
6. **Think like a user** - Test real workflows
7. **Use custom commands** - DRY principle
8. **Leverage Open Mode** - For debugging
9. **Handle async properly** - Wait for specific conditions
10. **Document your tests** - Clear descriptions

---

*For detailed information on any topic, refer to the individual documentation files linked at the top of this document.*
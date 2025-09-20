# Cypress Best Practices Guide

This document outlines essential best practices for writing effective, maintainable, and reliable Cypress tests for the FantasyWritingApp project.

## Table of Contents
1. [Organizing Tests](#organizing-tests)
2. [Selecting Elements](#selecting-elements)
3. [Test Independence](#test-independence)
4. [State Management](#state-management)
5. [Avoiding Common Pitfalls](#avoiding-common-pitfalls)
6. [Authentication & Login](#authentication--login)
7. [Network Requests & Waiting](#network-requests--waiting)
8. [Configuration Best Practices](#configuration-best-practices)

---

## Organizing Tests

### Test Structure
- **Write specs in isolation**: Each test spec should be able to run independently
- **Group related tests**: Use `describe` blocks to organize related test cases
- **Use meaningful test names**: Test names should clearly describe what is being tested

```javascript
// Good - Clear, descriptive test structure
describe('Element Creation', () => {
  beforeEach(() => {
    // Reset state before each test
    cy.visit('/elements')
  })

  it('should create a new character element', () => {
    // Test implementation
  })

  it('should validate required fields', () => {
    // Test implementation
  })
})
```

### File Organization
```
cypress/
├── e2e/                    # End-to-end tests
│   ├── elements/          # Element-related tests
│   ├── projects/          # Project management tests
│   └── auth/              # Authentication tests
├── component/             # Component tests
├── fixtures/              # Test data
└── support/               # Helper commands and utilities
```

---

## Selecting Elements

### ✅ Best Practice: Use Data Attributes

**Always use `data-cy` attributes for element selection** in the FantasyWritingApp project:

```javascript
// ✅ GOOD - Using data-cy attribute
cy.get('[data-cy="create-element-button"]').click()
cy.get('[data-cy="element-title-input"]').type('Dragon')

// ❌ BAD - Don't use these selectors
cy.get('.btn-primary').click()        // CSS class
cy.get('#submit').click()              // ID
cy.get('button').contains('Submit')   // Tag + text
```

### Implementing Data Attributes in React Native

For React Native components, use `testID` which converts to `data-cy` on web:

```tsx
// React Native component
<TouchableOpacity 
  testID="create-element-button"  // Becomes data-cy on web
  onPress={handleCreate}
>
  <Text>Create Element</Text>
</TouchableOpacity>

// For web-specific attributes
import { Platform } from 'react-native';

const getTestProps = (id: string) => {
  if (Platform.OS === 'web') {
    return { 'data-cy': id };
  }
  return { testID: id };
};

<TextInput {...getTestProps('element-title-input')} />
```

### Selector Priority Order
1. **`data-cy`** - Preferred for all test selectors
2. **`data-test`** - Alternative if data-cy not available
3. **`data-testid`** - For compatibility with Testing Library
4. **Role attributes** - For accessibility testing
5. Never use CSS classes, IDs, or tag names

---

## Test Independence

### Each Test Should Stand Alone

Tests should not depend on the execution order or results of other tests:

```javascript
// ✅ GOOD - Independent tests
describe('Project Management', () => {
  beforeEach(() => {
    // Create fresh state for each test
    cy.task('db:seed')
    cy.login()
    cy.visit('/projects')
  })

  it('creates a new project', () => {
    cy.get('[data-cy="new-project-button"]').click()
    // Test continues...
  })

  it('deletes a project', () => {
    // This test creates its own project to delete
    cy.createProject({ name: 'Test Project' })
    cy.get('[data-cy="delete-project-button"]').click()
    // Test continues...
  })
})

// ❌ BAD - Dependent tests
it('creates a project', () => {
  cy.get('[data-cy="new-project-button"]').click()
  // Creates project...
})

it('edits the project created above', () => {
  // This assumes the previous test ran and succeeded
  cy.get('[data-cy="edit-button"]').click()
})
```

---

## State Management

### Clean State Before Tests, Not After

```javascript
// ✅ GOOD - Clean state in beforeEach
beforeEach(() => {
  cy.task('db:reset')
  cy.task('db:seed', { projects: 2, elements: 5 })
})

// ❌ BAD - Don't clean in afterEach
afterEach(() => {
  // Avoid cleanup here - if test fails, cleanup might not run
  cy.task('db:clean')
})
```

### Using Aliases and Closures

Avoid assigning return values directly:

```javascript
// ❌ BAD - Don't do this
const button = cy.get('[data-cy="submit-button"]')
button.click()

// ✅ GOOD - Use aliases
cy.get('[data-cy="submit-button"]').as('submitBtn')
cy.get('@submitBtn').click()

// ✅ GOOD - Use then() for accessing values
cy.get('[data-cy="element-count"]').then(($count) => {
  const count = parseInt($count.text())
  expect(count).to.be.greaterThan(0)
})
```

---

## Avoiding Common Pitfalls

### Don't Use Arbitrary Waits

```javascript
// ❌ BAD - Fixed wait times
cy.wait(3000) // Arbitrary wait

// ✅ GOOD - Wait for specific conditions
cy.get('[data-cy="loading-spinner"]').should('not.exist')
cy.get('[data-cy="element-list"]').should('be.visible')
cy.get('[data-cy="save-status"]').should('contain', 'Saved')
```

### Don't Visit External Sites

```javascript
// ❌ BAD - Testing external sites
cy.visit('https://google.com')

// ✅ GOOD - Only test your application
cy.visit('/elements')

// For external API calls, use cy.request() or cy.intercept()
cy.intercept('GET', 'https://api.external.com/**', { 
  fixture: 'external-api-response.json' 
})
```

### Don't Start Web Servers in Tests

```javascript
// ❌ BAD - Starting server in test
before(() => {
  exec('npm run start')
})

// ✅ GOOD - Use start-server-and-test in package.json
// package.json
{
  "scripts": {
    "test:e2e": "start-server-and-test web http://localhost:3002 cypress:run"
  }
}
```

---

## Authentication & Login

### Programmatic Login

```javascript
// cypress/support/commands.js
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password') => {
  // Programmatic login - faster than UI login
  cy.request('POST', '/api/auth/login', { email, password })
    .then((response) => {
      window.localStorage.setItem('authToken', response.body.token)
    })
})

// In tests
beforeEach(() => {
  cy.login()
  cy.visit('/dashboard')
})
```

### Using cy.session() for Login Caching

```javascript
Cypress.Commands.add('login', (email = 'test@example.com') => {
  cy.session(
    email,
    () => {
      cy.visit('/login')
      cy.get('[data-cy="email-input"]').type(email)
      cy.get('[data-cy="password-input"]').type('password')
      cy.get('[data-cy="login-button"]').click()
      cy.url().should('include', '/dashboard')
    },
    {
      validate() {
        cy.getCookie('auth-token').should('exist')
      }
    }
  )
})
```

---

## Network Requests & Waiting

### Intercepting and Waiting for Requests

```javascript
// ✅ GOOD - Wait for specific network requests
it('saves element changes', () => {
  cy.intercept('PUT', '/api/elements/*').as('saveElement')
  
  cy.get('[data-cy="element-title-input"]').clear().type('Updated Title')
  cy.get('[data-cy="save-button"]').click()
  
  // Wait for the save request to complete
  cy.wait('@saveElement').then((interception) => {
    expect(interception.response.statusCode).to.equal(200)
  })
  
  cy.get('[data-cy="save-status"]').should('contain', 'Saved')
})
```

### Stubbing Network Responses

```javascript
// Stub API responses for consistent testing
cy.intercept('GET', '/api/elements', {
  fixture: 'elements-list.json'
}).as('getElements')

cy.visit('/elements')
cy.wait('@getElements')
```

---

## Configuration Best Practices

### cypress.config.ts Settings

```typescript
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3002',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,  // Only enable for debugging
    screenshotOnRunFailure: true,
    
    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    // Retries
    retries: {
      runMode: 2,    // Retry failed tests in CI
      openMode: 0    // No retries in interactive mode
    },
    
    setupNodeEvents(on, config) {
      // Task implementations
      on('task', {
        'db:reset': () => {
          // Reset database
          return null
        },
        'db:seed': (data) => {
          // Seed database
          return null
        }
      })
    }
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack'
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts'
  }
})
```

### Environment Variables

```javascript
// cypress.env.json
{
  "API_URL": "http://localhost:3000/api",
  "TEST_USER_EMAIL": "test@example.com",
  "TEST_USER_PASSWORD": "testpassword"
}

// Usage in tests
const apiUrl = Cypress.env('API_URL')
cy.request(`${apiUrl}/elements`)
```

---

## Custom Commands

### Define Reusable Commands

```javascript
// cypress/support/commands.js

// Element creation helper
Cypress.Commands.add('createElement', (elementData) => {
  cy.get('[data-cy="new-element-button"]').click()
  cy.get('[data-cy="element-title-input"]').type(elementData.title)
  cy.get('[data-cy="element-type-select"]').select(elementData.type)
  if (elementData.description) {
    cy.get('[data-cy="element-description-input"]').type(elementData.description)
  }
  cy.get('[data-cy="save-element-button"]').click()
  cy.get('[data-cy="element-saved-notification"]').should('be.visible')
})

// Project navigation helper
Cypress.Commands.add('navigateToProject', (projectName) => {
  cy.visit('/projects')
  cy.get(`[data-cy="project-card-${projectName}"]`).click()
  cy.url().should('include', '/project/')
})

// TypeScript type definitions
declare global {
  namespace Cypress {
    interface Chainable {
      createElement(elementData: {
        title: string
        type: string
        description?: string
      }): Chainable<void>
      navigateToProject(projectName: string): Chainable<void>
      login(email?: string, password?: string): Chainable<void>
    }
  }
}
```

---

## Testing Different Viewports

### Mobile and Responsive Testing

```javascript
describe('Responsive Design', () => {
  const viewports = [
    { device: 'iphone-x', width: 375, height: 812 },
    { device: 'ipad-2', width: 768, height: 1024 },
    { device: 'desktop', width: 1920, height: 1080 }
  ]

  viewports.forEach(({ device, width, height }) => {
    context(`${device} viewport`, () => {
      beforeEach(() => {
        cy.viewport(width, height)
        cy.visit('/elements')
      })

      it('displays properly on ' + device, () => {
        if (width < 768) {
          // Mobile specific assertions
          cy.get('[data-cy="mobile-menu"]').should('be.visible')
          cy.get('[data-cy="desktop-sidebar"]').should('not.exist')
        } else {
          // Desktop assertions
          cy.get('[data-cy="desktop-sidebar"]').should('be.visible')
          cy.get('[data-cy="mobile-menu"]').should('not.exist')
        }
      })
    })
  })
})
```

---

## Performance Considerations

### Optimize Test Execution

1. **Parallel Execution**: Run tests in parallel in CI
2. **Smart Test Selection**: Only run affected tests on PRs
3. **Fixture Management**: Use fixtures for large test data
4. **Command Batching**: Combine multiple assertions when possible

```javascript
// ✅ GOOD - Batched assertions
cy.get('[data-cy="element-card"]')
  .should('be.visible')
  .and('contain', 'Dragon')
  .and('have.class', 'active')

// ❌ LESS EFFICIENT - Multiple separate gets
cy.get('[data-cy="element-card"]').should('be.visible')
cy.get('[data-cy="element-card"]').should('contain', 'Dragon')
cy.get('[data-cy="element-card"]').should('have.class', 'active')
```

---

## Debugging Tips

### Using Debug Commands

```javascript
// Pause test execution
cy.pause()

// Debug specific elements
cy.get('[data-cy="complex-element"]').debug()

// Log to console
cy.log('Current state:', someVariable)

// Take screenshots for debugging
cy.screenshot('before-action')
cy.get('[data-cy="button"]').click()
cy.screenshot('after-action')
```

### Cypress Studio

Enable Cypress Studio for generating test code:

```javascript
// cypress.config.ts
export default defineConfig({
  e2e: {
    experimentalStudio: true
  }
})
```

---

## Summary Checklist

- [ ] Always use `data-cy` attributes for element selection
- [ ] Write independent, isolated tests
- [ ] Clean state before tests, not after
- [ ] Avoid arbitrary waits - wait for specific conditions
- [ ] Use programmatic login instead of UI login
- [ ] Intercept and control network requests
- [ ] Configure appropriate timeouts and retries
- [ ] Create custom commands for common operations
- [ ] Test across different viewports
- [ ] Never test external sites
- [ ] Run linting before committing test code

---

*This document is based on official Cypress best practices and adapted specifically for the FantasyWritingApp React Native project.*
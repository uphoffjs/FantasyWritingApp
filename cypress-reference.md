# Cypress Testing Framework - Complete Reference Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Core Features](#core-features)
3. [Installation & Setup](#installation--setup)
4. [Commands Reference](#commands-reference)
5. [Best Practices](#best-practices)
6. [Testing Patterns](#testing-patterns)
7. [Component Testing](#component-testing)
8. [Configuration](#configuration)
9. [Common Patterns](#common-patterns)

---

## Introduction

Cypress is a modern web testing tool designed to address key pain points developers and QA engineers face when testing web applications. It provides comprehensive solutions for testing across different aspects of web development.

### Mission Statement
> "Our mission is to build a thriving testing solution that enhances productivity, makes testing an enjoyable experience, and generates developer happiness."

### Key Differentiators
- **Native Browser Access**: Direct interaction with application objects
- **Automatic Waiting**: Eliminates need for manual async handling
- **Debugging Tools**: Integrated snapshots and time-travel debugging
- **Consistent Results**: Flake-resistant test execution

### Unique Architecture
Cypress operates differently from traditional testing tools like Selenium:
- Runs directly in the browser's run loop
- Provides native access to application objects
- Offers real-time synchronization between test runner and application

---

## Core Features

### Testing Capabilities
- **End-to-End Testing**: Simulate real user interactions in the browser
- **Component Testing**: Test individual UI components across frameworks
- **Accessibility Testing**: Identify potential accessibility issues
- **UI Coverage**: Visualize test coverage across application

---

## Installation & Setup

### Quick Installation
```bash
# Install Cypress as dev dependency
npm install cypress --save-dev

# or using Yarn
yarn add cypress --dev

# or using pnpm
pnpm add -D cypress
```

### Initial Setup
```bash
# Open Cypress for the first time
npx cypress open

# Run tests in headless mode
npx cypress run
```

### Project Structure
```
cypress/
├── e2e/                 # End-to-end test files
├── component/           # Component test files
├── fixtures/            # Test data files
├── support/             # Support files and custom commands
│   ├── commands.js      # Custom commands
│   └── e2e.js          # E2E support file
└── downloads/           # Downloaded files during tests
```

---

## Commands Reference

### Queries
Queries read application state and return a subject for further actions.

#### `.get(selector)`
Find DOM elements by selector
```javascript
cy.get('[data-cy="submit"]')
cy.get('.class-name')
cy.get('#id')
```

#### `.contains(content)`
Select DOM element by text content
```javascript
cy.contains('Submit')
cy.contains('[data-cy="article"]', 'My Article')
```

#### `.find(selector)`
Find descendant elements
```javascript
cy.get('.parent').find('.child')
```

#### `.first()` / `.last()`
Select first or last item in collection
```javascript
cy.get('li').first()
cy.get('li').last()
```

#### `.eq(index)`
Select element at specific index
```javascript
cy.get('li').eq(2) // Third item (0-indexed)
```

### Assertions

#### `.should(chainers, value)`
Assert on application state with automatic retries
```javascript
cy.get('[data-cy="input"]')
  .should('be.visible')
  .should('have.value', 'expected value')
  .should('have.class', 'active')
```

Common chainers:
- `be.visible` / `not.be.visible`
- `exist` / `not.exist`
- `have.length`
- `have.value`
- `have.text`
- `have.class`
- `be.checked`
- `be.disabled` / `be.enabled`

#### `.and()`
Alias for `.should()`, useful for chaining assertions
```javascript
cy.get('[data-cy="form"]')
  .should('be.visible')
  .and('have.class', 'active')
  .and('contain', 'Submit')
```

### Actions

#### `.click()`
Click a DOM element
```javascript
cy.get('[data-cy="button"]').click()
cy.get('[data-cy="button"]').click({ force: true }) // Force click
cy.get('[data-cy="button"]').dblclick() // Double click
cy.get('[data-cy="button"]').rightclick() // Right click
```

#### `.type(text)`
Type into an input
```javascript
cy.get('[data-cy="input"]').type('Hello World')
cy.get('[data-cy="input"]').type('{enter}') // Special keys
cy.get('[data-cy="input"]').clear().type('New text') // Clear then type
```

#### `.check()` / `.uncheck()`
Check or uncheck checkboxes/radio buttons
```javascript
cy.get('[type="checkbox"]').check()
cy.get('[type="checkbox"]').uncheck()
cy.get('[type="radio"]').check('value')
```

#### `.select(value)`
Select an option in a dropdown
```javascript
cy.get('select').select('option-value')
cy.get('select').select(['option1', 'option2']) // Multi-select
```

#### `.scrollIntoView()`
Scroll element into view
```javascript
cy.get('[data-cy="footer"]').scrollIntoView()
cy.scrollTo('bottom')
cy.scrollTo(0, 500)
```

### Network Requests

#### `.intercept()`
Spy and stub network requests
```javascript
// Spy on requests
cy.intercept('GET', '/api/users').as('getUsers')
cy.wait('@getUsers')

// Stub responses
cy.intercept('GET', '/api/users', { fixture: 'users.json' })

// Dynamic stubbing
cy.intercept('POST', '/api/users', (req) => {
  req.reply({
    statusCode: 201,
    body: { id: 123, name: req.body.name }
  })
})
```

#### `.request()`
Make HTTP requests
```javascript
cy.request('GET', '/api/users')
cy.request({
  method: 'POST',
  url: '/api/users',
  body: { name: 'Jane' }
})
```

### Other Useful Commands

#### `.fixture()`
Load test data
```javascript
cy.fixture('users.json').then((users) => {
  cy.get('[data-cy="name"]').type(users[0].name)
})
```

#### `.task()`
Execute Node.js code
```javascript
// In cypress.config.js
module.exports = {
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          console.log(message)
          return null
        }
      })
    }
  }
}

// In test
cy.task('log', 'Hello from Node')
```

#### `.screenshot()`
Capture screenshots
```javascript
cy.screenshot()
cy.screenshot('my-screenshot')
cy.get('[data-cy="header"]').screenshot()
```

---

## Best Practices

### 1. Test Organization

#### Independent Tests
```javascript
// ✅ Good - Tests can run independently
describe('User Dashboard', () => {
  beforeEach(() => {
    cy.visit('/dashboard')
    cy.login() // Custom command
  })

  it('displays user profile', () => {
    cy.get('[data-cy="profile"]').should('be.visible')
  })

  it('shows recent activity', () => {
    cy.get('[data-cy="activity"]').should('have.length.greaterThan', 0)
  })
})

// ❌ Bad - Tests depend on each other
it('test 1', () => {
  cy.visit('/page')
  // Sets up state
})

it('test 2', () => {
  // Depends on state from test 1
})
```

### 2. Element Selection

#### Use Data Attributes
```javascript
// ✅ Best Practice - Use data-cy attributes
cy.get('[data-cy="submit-button"]').click()
cy.get('[data-testid="user-email"]').type('user@example.com')

// ❌ Avoid - Brittle selectors
cy.get('.btn.btn-primary').click() // Classes can change
cy.get('#submit').click() // IDs might not be unique
cy.contains('Submit').click() // Text can change
```

### 3. Waiting Strategies

#### Use Explicit Waits
```javascript
// ✅ Good - Wait for specific conditions
cy.intercept('GET', '/api/data').as('getData')
cy.get('[data-cy="load-button"]').click()
cy.wait('@getData')

// ✅ Good - Assert on element state
cy.get('[data-cy="spinner"]').should('not.exist')
cy.get('[data-cy="content"]').should('be.visible')

// ❌ Bad - Arbitrary waits
cy.wait(5000) // Avoid fixed waits
```

### 4. Custom Commands

Create reusable commands in `cypress/support/commands.js`:
```javascript
// Login command
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login')
    cy.get('[data-cy="email"]').type(email)
    cy.get('[data-cy="password"]').type(password)
    cy.get('[data-cy="submit"]').click()
    cy.url().should('include', '/dashboard')
  })
})

// Usage in tests
cy.login('user@example.com', 'password123')
```

### 5. Assertions

#### Comprehensive Assertions
```javascript
// ✅ Good - Multiple assertions in one test
it('displays product correctly', () => {
  cy.visit('/products/1')
  
  cy.get('[data-cy="product-card"]').within(() => {
    cy.get('[data-cy="title"]').should('have.text', 'Product Name')
    cy.get('[data-cy="price"]').should('contain', '$99.99')
    cy.get('[data-cy="add-to-cart"]').should('be.enabled')
    cy.get('[data-cy="image"]').should('be.visible')
  })
})

// ❌ Avoid - Tiny tests with single assertions
it('has title', () => {
  cy.get('[data-cy="title"]').should('exist')
})

it('has price', () => {
  cy.get('[data-cy="price"]').should('exist')
})
```

### 6. State Management

#### Reset State Before Tests
```javascript
// ✅ Good - Reset in beforeEach
beforeEach(() => {
  cy.task('db:reset') // Reset database
  cy.clearCookies()
  cy.clearLocalStorage()
})

// ❌ Bad - Reset in afterEach (can fail and affect next test)
afterEach(() => {
  // Cleanup here is risky
})
```

---

## Testing Patterns

### Page Object Pattern
```javascript
// cypress/support/pages/LoginPage.js
class LoginPage {
  visit() {
    cy.visit('/login')
  }

  fillEmail(email) {
    cy.get('[data-cy="email"]').type(email)
  }

  fillPassword(password) {
    cy.get('[data-cy="password"]').type(password)
  }

  submit() {
    cy.get('[data-cy="submit"]').click()
  }

  login(email, password) {
    this.fillEmail(email)
    this.fillPassword(password)
    this.submit()
  }
}

export default new LoginPage()

// Usage in test
import loginPage from '../support/pages/LoginPage'

it('logs in successfully', () => {
  loginPage.visit()
  loginPage.login('user@example.com', 'password')
  cy.url().should('include', '/dashboard')
})
```

### Testing Forms
```javascript
describe('Form Validation', () => {
  it('validates required fields', () => {
    cy.visit('/signup')
    
    // Submit empty form
    cy.get('[data-cy="submit"]').click()
    
    // Check validation messages
    cy.get('[data-cy="email-error"]').should('contain', 'Email is required')
    cy.get('[data-cy="password-error"]').should('contain', 'Password is required')
    
    // Fill form correctly
    cy.get('[data-cy="email"]').type('user@example.com')
    cy.get('[data-cy="password"]').type('StrongPass123!')
    cy.get('[data-cy="confirm-password"]').type('StrongPass123!')
    
    // Submit should work now
    cy.get('[data-cy="submit"]').click()
    cy.url().should('include', '/welcome')
  })
})
```

### Testing Lists and Tables
```javascript
describe('Data Table', () => {
  it('filters and sorts data', () => {
    cy.visit('/users')
    
    // Check initial data
    cy.get('[data-cy="user-row"]').should('have.length', 10)
    
    // Apply filter
    cy.get('[data-cy="search"]').type('John')
    cy.get('[data-cy="user-row"]').should('have.length.lessThan', 10)
    
    // Sort by name
    cy.get('[data-cy="sort-name"]').click()
    cy.get('[data-cy="user-row"]').first()
      .should('contain', 'Alice') // Assuming alphabetical
    
    // Sort reverse
    cy.get('[data-cy="sort-name"]').click()
    cy.get('[data-cy="user-row"]').first()
      .should('contain', 'Zoe')
  })
})
```

---

## Component Testing

### Setup for React
```javascript
// cypress.config.js
import { defineConfig } from 'cypress'

export default defineConfig({
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite', // or 'webpack'
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
  },
})
```

### Example Component Test
```javascript
// Button.cy.jsx
import Button from './Button'

describe('Button Component', () => {
  it('renders with text', () => {
    cy.mount(<Button>Click me</Button>)
    cy.get('button').should('have.text', 'Click me')
  })

  it('handles click events', () => {
    const onClick = cy.stub()
    cy.mount(<Button onClick={onClick}>Click me</Button>)
    
    cy.get('button').click()
    cy.wrap(onClick).should('have.been.called')
  })

  it('can be disabled', () => {
    cy.mount(<Button disabled>Click me</Button>)
    cy.get('button').should('be.disabled')
  })
})
```

---

## Configuration

### cypress.config.js
```javascript
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    
    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    // Test isolation
    testIsolation: true,
    
    // Retries
    retries: {
      runMode: 2,
      openMode: 0,
    },
    
    setupNodeEvents(on, config) {
      // Node event listeners
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
      })
    },
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
  
  // Environment variables
  env: {
    apiUrl: 'http://localhost:3001',
    auth_username: 'testuser',
    auth_password: 'testpass',
  },
})
```

### Environment Variables
```javascript
// Access in tests
const apiUrl = Cypress.env('apiUrl')
const username = Cypress.env('auth_username')

// Override via CLI
// cypress run --env apiUrl=http://staging.example.com
```

---

## Common Patterns

### Authentication
```javascript
// Using cy.session() for efficient auth
Cypress.Commands.add('login', (username = 'testuser', password = 'testpass') => {
  cy.session(
    [username, password],
    () => {
      cy.visit('/login')
      cy.get('[data-cy="username"]').type(username)
      cy.get('[data-cy="password"]').type(password)
      cy.get('[data-cy="submit"]').click()
      cy.url().should('include', '/dashboard')
    },
    {
      validate() {
        cy.getCookie('auth-token').should('exist')
      },
    }
  )
})

// Usage
beforeEach(() => {
  cy.login()
  cy.visit('/protected-page')
})
```

### API Testing
```javascript
describe('API Tests', () => {
  it('creates a new user', () => {
    cy.request({
      method: 'POST',
      url: '/api/users',
      body: {
        name: 'Jane Doe',
        email: 'jane@example.com',
      },
    }).then((response) => {
      expect(response.status).to.eq(201)
      expect(response.body).to.have.property('id')
      expect(response.body.name).to.eq('Jane Doe')
    })
  })

  it('handles errors correctly', () => {
    cy.request({
      method: 'POST',
      url: '/api/users',
      body: { name: '' }, // Invalid data
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.error).to.include('Name is required')
    })
  })
})
```

### File Upload
```javascript
it('uploads a file', () => {
  cy.visit('/upload')
  
  cy.get('[data-cy="file-input"]').selectFile('cypress/fixtures/image.png')
  
  // Or drag and drop
  cy.get('[data-cy="drop-zone"]').selectFile('cypress/fixtures/document.pdf', {
    action: 'drag-drop'
  })
  
  cy.get('[data-cy="upload-button"]').click()
  cy.get('[data-cy="success-message"]').should('be.visible')
})
```

### Accessibility Testing
```javascript
// Install cypress-axe
// npm install --save-dev cypress-axe

// In support/commands.js
import 'cypress-axe'

// In tests
describe('Accessibility', () => {
  it('has no detectable a11y violations', () => {
    cy.visit('/')
    cy.injectAxe()
    
    // Check entire page
    cy.checkA11y()
    
    // Check specific element
    cy.checkA11y('[data-cy="main-content"]')
    
    // Exclude certain rules
    cy.checkA11y(null, {
      rules: {
        'color-contrast': { enabled: false }
      }
    })
  })
})
```

### Visual Testing
```javascript
// Using Percy (install @percy/cypress)
it('visual regression test', () => {
  cy.visit('/home')
  cy.percySnapshot('Homepage')
  
  // Open modal
  cy.get('[data-cy="open-modal"]').click()
  cy.percySnapshot('Homepage with modal')
})

// Using built-in screenshots
it('captures screenshots', () => {
  cy.visit('/dashboard')
  cy.screenshot('dashboard-full')
  
  cy.get('[data-cy="chart"]').screenshot('chart-only')
})
```

---

## Anti-Patterns to Avoid

### ❌ Don't Share State Between Tests
```javascript
// Bad
let sharedUser

it('creates user', () => {
  // Creates and stores user
  sharedUser = createUser()
})

it('updates user', () => {
  // Uses shared user - fragile!
  updateUser(sharedUser)
})
```

### ❌ Don't Use After Hooks for Cleanup
```javascript
// Bad
afterEach(() => {
  cy.task('db:cleanup') // Might not run if test fails
})

// Good
beforeEach(() => {
  cy.task('db:reset') // Always runs before test
})
```

### ❌ Don't Test External Services
```javascript
// Bad
it('logs in via Google', () => {
  cy.visit('/login')
  cy.get('[data-cy="google-login"]').click()
  // Trying to interact with Google's auth page - won't work!
})

// Good
it('logs in programmatically', () => {
  cy.request('POST', '/api/auth/test-login', {
    provider: 'google',
    testUser: true
  })
})
```

### ❌ Don't Use Brittle Selectors
```javascript
// Bad
cy.get('.btn.btn-lg.btn-primary:nth-child(2)')
cy.get('#__next > div > div.container > button')
cy.contains('Submit') // Text might change

// Good
cy.get('[data-cy="submit-button"]')
cy.get('[data-testid="form-submit"]')
```

### ❌ Don't Use Fixed Waits
```javascript
// Bad
cy.wait(5000) // Arbitrary wait

// Good
cy.intercept('GET', '/api/data').as('getData')
cy.wait('@getData')
// or
cy.get('[data-cy="spinner"]').should('not.exist')
```

---

## Debugging Tips

### Using debugger
```javascript
it('debug test', () => {
  cy.visit('/page')
  cy.get('[data-cy="button"]').then(($el) => {
    debugger // Pause here in DevTools
  })
})
```

### Using cy.pause()
```javascript
it('pause test', () => {
  cy.visit('/page')
  cy.get('[data-cy="input"]').type('text')
  cy.pause() // Pause test execution
  cy.get('[data-cy="submit"]').click()
})
```

### Using cy.debug()
```javascript
cy.get('[data-cy="element"]')
  .debug() // Logs element info to console
  .click()
```

### Console Logging
```javascript
cy.get('[data-cy="element"]').then(($el) => {
  console.log('Element:', $el)
  cy.log('Element text:', $el.text()) // Logs to Command Log
})
```

---

## Continuous Integration

### GitHub Actions Example
```yaml
# .github/workflows/cypress.yml
name: Cypress Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start application
        run: npm start &
        env:
          CI: true
      
      - name: Run Cypress tests
        uses: cypress-io/github-action@v5
        with:
          wait-on: 'http://localhost:3000'
          wait-on-timeout: 120
          browser: chrome
          record: true
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Resources

- [Official Cypress Documentation](https://docs.cypress.io)
- [Cypress Real World App](https://github.com/cypress-io/cypress-realworld-app)
- [Cypress Examples](https://github.com/cypress-io/cypress-example-recipes)
- [Cypress Discord Community](https://discord.gg/cypress)

---

This reference guide covers the essential aspects of Cypress testing. For specific use cases or advanced topics, refer to the official documentation.
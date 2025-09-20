# Test Isolation

## Understanding Test Isolation

Test isolation ensures that each test runs independently without being affected by the state left behind by previous tests. This is crucial for reliable, maintainable test suites.

### Core Principles of Test Isolation

```javascript
// ✅ GOOD: Each test is self-contained
describe('Isolated Story Tests', () => {
  beforeEach(() => {
    // * Reset state before each test
    cy.task('resetDatabase')
    cy.clearLocalStorage()
    cy.clearCookies()
    cy.visit('/stories')
  })

  it('test 1: creates a new story', () => {
    cy.get('[data-cy="create-story-button"]').click()
    cy.get('[data-cy="title-input"]').type('Test Story 1')
    cy.get('[data-cy="save-button"]').click()
    
    cy.get('[data-cy="story-title"]').should('contain', 'Test Story 1')
    // This test doesn't rely on any external state
  })

  it('test 2: edits an existing story', () => {
    // This test sets up its own data
    cy.createTestStory({ title: 'Story to Edit' })
    
    cy.get('[data-cy="edit-button"]').click()
    cy.get('[data-cy="title-input"]').clear().type('Edited Story')
    cy.get('[data-cy="save-button"]').click()
    
    cy.get('[data-cy="story-title"]').should('contain', 'Edited Story')
  })

  it('test 3: deletes a story', () => {
    // Independent setup
    cy.createTestStory({ title: 'Story to Delete' })
    
    cy.get('[data-cy="delete-button"]').click()
    cy.get('[data-cy="confirm-delete"]').click()
    
    cy.get('[data-cy="empty-stories-message"]').should('be.visible')
  })
})

// ❌ BAD: Tests depend on each other
describe('Non-Isolated Tests (Anti-pattern)', () => {
  let storyId // This creates dependencies between tests

  it('creates a story', () => {
    cy.get('[data-cy="create-story-button"]').click()
    cy.get('[data-cy="title-input"]').type('Dependent Story')
    cy.get('[data-cy="save-button"]').click()
    
    cy.url().then((url) => {
      storyId = url.split('/').pop() // Test 2 depends on this
    })
  })

  it('edits the story from test 1', () => {
    // ❌ This test will fail if test 1 fails or runs in different order
    cy.visit(`/stories/${storyId}/edit`)
    cy.get('[data-cy="title-input"]').clear().type('Edited Story')
    cy.get('[data-cy="save-button"]').click()
  })
})
```

## State Management and Cleanup

### Application State Reset

```javascript
describe('Application State Management', () => {
  beforeEach(() => {
    // * Comprehensive state reset
    cy.task('resetDatabase')       // Reset backend data
    cy.clearLocalStorage()         // Clear browser storage
    cy.clearCookies()             // Clear cookies
    cy.clearIndexedDB()           // Clear IndexedDB (if used)
    
    // ? Reset any application-specific state
    cy.window().then((win) => {
      // Clear any global variables
      win.appState = {}
      // Reset any caches
      if (win.clearAppCache) {
        win.clearAppCache()
      }
    })

    // ! Setup clean authentication state
    cy.login('test@example.com', 'password123')
    cy.visit('/stories')
  })

  afterEach(() => {
    // * Additional cleanup after each test
    cy.clearLocalStorage()
    cy.clearCookies()
    
    // Clean up any test-specific resources
    cy.task('cleanupTestFiles')
  })

  it('test runs with clean state', () => {
    // Test can assume clean state
    cy.get('[data-cy="story-list"]').should('be.empty')
    cy.get('[data-cy="user-stories-count"]').should('contain', '0')
  })
})
```

### Database State Management

```javascript
// cypress/support/commands.js
Cypress.Commands.add('resetDatabase', () => {
  cy.task('db:reset')
})

Cypress.Commands.add('seedDatabase', (fixtures = []) => {
  cy.task('db:seed', fixtures)
})

// cypress.config.js
export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        // * Complete database reset
        'db:reset'() {
          // Truncate all tables
          // Reset auto-increment counters
          // Clear any cached data
          return null
        },

        // * Seed specific test data
        'db:seed'(fixtures) {
          fixtures.forEach(fixture => {
            // Load fixture data into database
            const data = require(`./cypress/fixtures/${fixture}.json`)
            // Insert data into appropriate tables
          })
          return null
        },

        // ? Cleanup test-specific data
        'cleanupTestFiles'() {
          // Remove uploaded files
          // Clean temporary directories
          return null
        }
      })
    }
  }
})

// Usage in tests
describe('Database-Dependent Tests', () => {
  beforeEach(() => {
    cy.resetDatabase()
    cy.seedDatabase(['users', 'stories'])
    cy.visit('/stories')
  })

  it('displays seeded stories', () => {
    cy.get('[data-cy="story-item"]').should('have.length', 3)
  })
})
```

### Browser Storage Isolation

```javascript
describe('Browser Storage Isolation', () => {
  beforeEach(() => {
    // * Clear all forms of browser storage
    cy.clearLocalStorage()
    cy.clearSessionStorage()
    cy.clearCookies()
    
    // Clear IndexedDB (React Native AsyncStorage on web)
    cy.clearIndexedDB()

    // ? Custom storage cleanup for React Native Web
    cy.window().then((win) => {
      // Clear React Native AsyncStorage simulation
      if (win.localStorage) {
        Object.keys(win.localStorage).forEach(key => {
          if (key.startsWith('@AsyncStorage:')) {
            win.localStorage.removeItem(key)
          }
        })
      }
    })
  })

  it('starts with empty storage', () => {
    cy.getAllLocalStorage().should('deep.equal', {})
    cy.getAllCookies().should('have.length', 0)
    
    // ? Verify application reflects empty state
    cy.get('[data-cy="user-data"]').should('not.exist')
    cy.get('[data-cy="cached-stories"]').should('not.exist')
  })

  it('test 1: stores user preferences', () => {
    cy.get('[data-cy="theme-dark"]').click()
    cy.get('[data-cy="save-preferences"]').click()
    
    // Verify storage was updated
    cy.window().its('localStorage').invoke('getItem', 'userPreferences')
      .should('contain', 'dark')
  })

  it('test 2: runs with clean storage (independent of test 1)', () => {
    // This test starts with clean storage
    cy.window().its('localStorage').invoke('getItem', 'userPreferences')
      .should('be.null')
    
    cy.get('[data-cy="theme-light"]').should('be.checked') // Default theme
  })
})
```

## Network Request Isolation

### Intercept Management

```javascript
describe('Network Request Isolation', () => {
  beforeEach(() => {
    // * Reset all network intercepts
    cy.intercept('GET', '/api/stories', { fixture: 'empty-stories.json' }).as('getStories')
    cy.intercept('POST', '/api/stories').as('createStory')
    cy.intercept('PUT', '/api/stories/*').as('updateStory')
    cy.intercept('DELETE', '/api/stories/*').as('deleteStory')
    
    cy.visit('/stories')
    cy.wait('@getStories')
  })

  it('test 1: creates a story', () => {
    // * Override default intercept for this test
    cy.intercept('POST', '/api/stories', {
      statusCode: 201,
      body: { id: 'new-story-1', title: 'New Story', content: 'Content' }
    }).as('createStorySuccess')

    cy.get('[data-cy="create-story-button"]').click()
    cy.get('[data-cy="title-input"]').type('New Story')
    cy.get('[data-cy="save-button"]').click()

    cy.wait('@createStorySuccess')
    cy.get('[data-cy="success-message"]').should('be.visible')
  })

  it('test 2: handles creation error', () => {
    // * Different intercept for error scenario
    cy.intercept('POST', '/api/stories', {
      statusCode: 400,
      body: { error: 'Title is required' }
    }).as('createStoryError')

    cy.get('[data-cy="create-story-button"]').click()
    cy.get('[data-cy="save-button"]').click() // No title entered

    cy.wait('@createStoryError')
    cy.get('[data-cy="error-message"]').should('contain', 'Title is required')
  })

  afterEach(() => {
    // ? Clear any test-specific intercepts
    // Cypress automatically resets intercepts between tests
  })
})
```

### API Response Mocking

```javascript
describe('API Response Isolation', () => {
  it('test with minimal data', () => {
    // * Test-specific data setup
    cy.intercept('GET', '/api/stories', {
      body: [
        { id: '1', title: 'Single Story', wordCount: 100 }
      ]
    }).as('getSingleStory')

    cy.visit('/stories')
    cy.wait('@getSingleStory')

    cy.get('[data-cy="story-item"]').should('have.length', 1)
    cy.get('[data-cy="total-word-count"]').should('contain', '100')
  })

  it('test with large dataset', () => {
    // * Different data for stress testing
    const manyStories = Array.from({ length: 50 }, (_, i) => ({
      id: `story-${i}`,
      title: `Story ${i}`,
      wordCount: 1000 + i
    }))

    cy.intercept('GET', '/api/stories', { body: manyStories }).as('getManyStories')

    cy.visit('/stories')
    cy.wait('@getManyStories')

    cy.get('[data-cy="story-item"]').should('have.length', 50)
    cy.get('[data-cy="load-more-button"]').should('be.visible')
  })

  it('test with empty response', () => {
    // * Empty state testing
    cy.intercept('GET', '/api/stories', { body: [] }).as('getEmptyStories')

    cy.visit('/stories')
    cy.wait('@getEmptyStories')

    cy.get('[data-cy="empty-state"]').should('be.visible')
    cy.get('[data-cy="create-first-story-button"]').should('be.visible')
  })
})
```

## Session Management

### Authentication State Isolation

```javascript
describe('Authentication State Isolation', () => {
  beforeEach(() => {
    // * Clear authentication state
    cy.clearCookies()
    cy.clearLocalStorage()
    
    // Clear any JWT tokens or auth headers
    cy.window().then((win) => {
      delete win.authToken
      delete win.currentUser
    })
  })

  it('test 1: authenticated user flow', () => {
    // * Setup authentication for this test only
    cy.login('user@example.com', 'password123')
    cy.visit('/stories')

    cy.get('[data-cy="user-menu"]').should('be.visible')
    cy.get('[data-cy="create-story-button"]').should('be.enabled')
  })

  it('test 2: unauthenticated user flow', () => {
    // This test starts unauthenticated
    cy.visit('/stories')

    cy.url().should('include', '/login')
    cy.get('[data-cy="login-form"]').should('be.visible')
  })

  it('test 3: expired session handling', () => {
    // * Setup expired session
    cy.login('user@example.com', 'password123')
    
    // Simulate expired token
    cy.window().then((win) => {
      win.localStorage.setItem('authToken', 'expired-token')
    })

    cy.visit('/stories')
    
    // Should redirect to login
    cy.url().should('include', '/login')
    cy.get('[data-cy="session-expired-message"]').should('be.visible')
  })
})
```

### User Session Commands

```javascript
// cypress/support/commands.js
Cypress.Commands.add('loginWithSession', (email, password, options = {}) => {
  const sessionName = `${email}-${password}`
  
  cy.session(sessionName, () => {
    cy.visit('/login')
    cy.get('[data-cy="email-input"]').type(email)
    cy.get('[data-cy="password-input"]').type(password)
    cy.get('[data-cy="login-button"]').click()
    
    cy.url().should('not.include', '/login')
    cy.get('[data-cy="user-menu"]').should('be.visible')
  }, {
    validate() {
      // * Validate session is still valid
      cy.visit('/dashboard')
      cy.get('[data-cy="user-menu"]').should('be.visible')
    },
    cacheAcrossSpecs: options.persist || false
  })
})

Cypress.Commands.add('logoutAndClearSession', () => {
  cy.get('[data-cy="user-menu"]').click()
  cy.get('[data-cy="logout-button"]').click()
  
  // Wait for logout to complete
  cy.url().should('include', '/login')
  
  // Clear session cache
  Cypress.session.clearAllSavedSessions()
})

// Usage
describe('Session-Aware Tests', () => {
  beforeEach(() => {
    cy.loginWithSession('test@example.com', 'password123')
    cy.visit('/stories')
  })

  it('maintains session across tests', () => {
    cy.get('[data-cy="user-menu"]').should('be.visible')
    // Session is maintained but test is still isolated
  })
})
```

## Component State Isolation

### React Component State

```javascript
describe('Component State Isolation', () => {
  beforeEach(() => {
    // * Mount component with clean state for each test
    cy.visit('/stories/new')
  })

  it('test 1: form validation state', () => {
    // * Trigger validation errors
    cy.get('[data-cy="save-button"]').click()
    cy.get('[data-cy="title-error"]').should('be.visible')
    cy.get('[data-cy="content-error"]').should('be.visible')

    // Form is in error state
    cy.get('[data-cy="form-status"]').should('have.class', 'error')
  })

  it('test 2: starts with clean form (no error state)', () => {
    // This test gets a fresh component mount
    cy.get('[data-cy="title-error"]').should('not.exist')
    cy.get('[data-cy="content-error"]').should('not.exist')
    cy.get('[data-cy="form-status"]').should('not.have.class', 'error')
  })

  it('test 3: component remounts between tests', () => {
    // * Verify component state is reset
    cy.get('[data-cy="title-input"]').should('have.value', '')
    cy.get('[data-cy="content-input"]').should('have.value', '')
    cy.get('[data-cy="word-count"]').should('contain', '0')
  })
})
```

### React Native State Isolation

```javascript
describe('React Native Component Isolation', () => {
  it('AsyncStorage state isolation', () => {
    // * Each test gets isolated AsyncStorage
    cy.visit('/stories')
    
    // Verify AsyncStorage is empty
    cy.window().then((win) => {
      // React Native Web AsyncStorage simulation
      const asyncStorageKeys = Object.keys(win.localStorage)
        .filter(key => key.startsWith('@AsyncStorage:'))
      
      expect(asyncStorageKeys).to.have.length(0)
    })

    // Test can safely modify AsyncStorage
    cy.get('[data-cy="auto-save-toggle"]').click()
    
    cy.window().then((win) => {
      const autoSaveValue = win.localStorage.getItem('@AsyncStorage:autoSave')
      expect(autoSaveValue).to.equal('true')
    })
  })

  it('Navigation state isolation', () => {
    // * React Navigation state is reset
    cy.visit('/stories')
    
    // Navigate through the app
    cy.get('[data-cy="story-item"]').first().click()
    cy.get('[data-cy="edit-button"]').click()
    
    // History stack is maintained within test
    cy.get('[data-cy="back-button"]').click()
    cy.get('[data-cy="story-details"]').should('be.visible')
  })
})
```

## Performance and Memory Isolation

### Memory Leak Prevention

```javascript
describe('Memory Leak Prevention', () => {
  beforeEach(() => {
    // * Monitor memory usage
    cy.window().then((win) => {
      if (win.performance && win.performance.memory) {
        cy.wrap(win.performance.memory.usedJSHeapSize).as('initialMemory')
      }
    })
  })

  afterEach(() => {
    // * Check for memory leaks
    cy.get('@initialMemory').then((initialMemory) => {
      cy.window().then((win) => {
        if (win.performance && win.performance.memory) {
          const finalMemory = win.performance.memory.usedJSHeapSize
          const memoryIncrease = finalMemory - initialMemory
          
          // ! Alert if memory increased significantly
          if (memoryIncrease > 10 * 1024 * 1024) { // 10MB
            cy.log(`Warning: Memory increased by ${memoryIncrease / 1024 / 1024}MB`)
          }
        }
      })
    })

    // ? Force garbage collection if available
    cy.window().then((win) => {
      if (win.gc) {
        win.gc()
      }
    })
  })

  it('does not leak memory', () => {
    // Test that creates many elements
    for (let i = 0; i < 100; i++) {
      cy.get('[data-cy="create-story-button"]').click()
      cy.get('[data-cy="cancel-button"]').click()
    }
    
    // Memory check happens in afterEach
  })
})
```

### Resource Cleanup

```javascript
describe('Resource Cleanup', () => {
  let createdFiles = []
  let openConnections = []

  beforeEach(() => {
    createdFiles = []
    openConnections = []
  })

  afterEach(() => {
    // * Cleanup created resources
    createdFiles.forEach(file => {
      cy.task('deleteFile', file)
    })

    openConnections.forEach(connection => {
      cy.task('closeConnection', connection)
    })

    // Reset tracking arrays
    createdFiles = []
    openConnections = []
  })

  it('cleans up file uploads', () => {
    cy.get('[data-cy="file-upload"]').selectFile('cypress/fixtures/test-image.jpg')
    
    // Track uploaded file for cleanup
    cy.get('[data-cy="uploaded-file-path"]').then(($el) => {
      const filePath = $el.text()
      createdFiles.push(filePath)
    })

    cy.get('[data-cy="save-button"]').click()
    // File will be cleaned up in afterEach
  })

  it('cleans up WebSocket connections', () => {
    // * Open WebSocket connection
    cy.window().then((win) => {
      const ws = new win.WebSocket('ws://localhost:8080')
      openConnections.push(ws)
      
      ws.onopen = () => {
        cy.log('WebSocket connected')
      }
    })

    // Connection will be closed in afterEach
  })
})
```

## Parallel Test Execution

### Safe Parallel Testing

```javascript
describe('Parallel-Safe Tests', () => {
  beforeEach(() => {
    // * Use unique test data to avoid conflicts
    const testId = Cypress.env('testId') || Math.random().toString(36).substr(2, 9)
    cy.wrap(testId).as('testId')

    // Create isolated test environment
    cy.task('createTestEnvironment', testId)
  })

  afterEach(() => {
    // * Cleanup test-specific resources
    cy.get('@testId').then((testId) => {
      cy.task('cleanupTestEnvironment', testId)
    })
  })

  it('test 1 runs safely in parallel', function() {
    // Use unique identifiers
    const uniqueTitle = `Story-${this.testId}`
    
    cy.get('[data-cy="title-input"]').type(uniqueTitle)
    cy.get('[data-cy="save-button"]').click()
    
    cy.get('[data-cy="story-title"]').should('contain', uniqueTitle)
  })

  it('test 2 runs safely in parallel', function() {
    // Different unique identifier
    const uniqueTitle = `Parallel-${this.testId}`
    
    cy.get('[data-cy="title-input"]').type(uniqueTitle)
    cy.get('[data-cy="save-button"]').click()
    
    cy.get('[data-cy="story-title"]').should('contain', uniqueTitle)
  })
})
```

### Database Isolation for Parallel Tests

```javascript
// cypress.config.js
export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        'createTestEnvironment'(testId) {
          // * Create isolated database schema or namespace
          const dbName = `test_db_${testId}`
          // Create database
          // Migrate schema
          // Seed initial data
          return dbName
        },

        'cleanupTestEnvironment'(testId) {
          // * Drop test database
          const dbName = `test_db_${testId}`
          // Drop database
          // Clean up files
          return null
        }
      })
    }
  }
})
```

This comprehensive guide covers all aspects of test isolation in Cypress, ensuring your tests are reliable, maintainable, and can run independently in any order or in parallel.
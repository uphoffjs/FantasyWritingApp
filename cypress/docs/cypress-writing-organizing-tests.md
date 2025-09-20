# Writing and Organizing Tests

## Test Structure and Organization

### File Organization

Cypress follows a clear directory structure for organizing different types of tests and supporting files:

```
cypress/
├── e2e/                    # End-to-end tests
│   ├── auth/              # Authentication-related tests
│   │   ├── login.cy.js
│   │   └── registration.cy.js
│   ├── stories/           # Story management tests
│   │   ├── story-creation.cy.js
│   │   ├── story-editing.cy.js
│   │   └── story-deletion.cy.js
│   └── navigation/        # Navigation and routing tests
│       └── app-navigation.cy.js
├── component/             # Component tests
│   ├── StoryCard.cy.tsx
│   ├── CharacterForm.cy.tsx
│   └── ProjectList.cy.tsx
├── fixtures/             # Test data and mock responses
│   ├── stories.json
│   ├── characters.json
│   └── users.json
├── support/              # Shared utilities and configurations
│   ├── commands.js       # Custom commands
│   ├── e2e.js           # E2E test setup
│   └── component.js     # Component test setup
└── downloads/            # Downloaded files during tests
```

### Naming Conventions

```javascript
// * File naming patterns
// E2E tests: feature-name.cy.js
user-authentication.cy.js
story-management.cy.js
character-creation.cy.js

// Component tests: ComponentName.cy.tsx
StoryCard.cy.tsx
ProjectList.cy.tsx
CharacterForm.cy.tsx

// Fixture files: data-type.json
stories.json
users.json
mock-api-responses.json
```

## Test Structure Patterns

### Describe Blocks for Organization

```javascript
// cypress/e2e/story-management.cy.js
describe('Story Management', () => {
  // * Context blocks group related tests
  context('Story Creation', () => {
    beforeEach(() => {
      cy.visit('/stories')
      cy.get('[data-cy="create-story-button"]').click()
    })

    it('creates a story with valid data', () => {
      // Test implementation
    })

    it('validates required fields', () => {
      // Test implementation
    })

    it('handles character limit enforcement', () => {
      // Test implementation
    })
  })

  context('Story Editing', () => {
    beforeEach(() => {
      // ? Setup existing story for editing tests
      cy.fixture('stories').then((stories) => {
        cy.visit(`/stories/${stories[0].id}/edit`)
      })
    })

    it('saves changes automatically', () => {
      // Test implementation
    })

    it('preserves unsaved changes on navigation', () => {
      // Test implementation
    })
  })

  context('Story Deletion', () => {
    it('confirms deletion before removing story', () => {
      // Test implementation
    })

    it('permanently removes story from list', () => {
      // Test implementation
    })
  })
})
```

### Test Hooks and Lifecycle

```javascript
describe('Fantasy Writing App', () => {
  // * Runs once before all tests in this describe block
  before(() => {
    // Database seeding, one-time setup
    cy.task('db:seed')
    cy.task('resetUserData')
  })

  // * Runs once after all tests in this describe block
  after(() => {
    // Cleanup operations
    cy.task('db:cleanup')
    cy.clearLocalStorage()
  })

  // * Runs before each test
  beforeEach(() => {
    // Common setup for each test
    cy.visit('/')
    cy.window().then((win) => {
      win.localStorage.setItem('user', JSON.stringify({
        id: 'test-user',
        email: 'test@example.com'
      }))
    })
  })

  // * Runs after each test
  afterEach(() => {
    // Cleanup after each test
    cy.clearCookies()
    cy.clearLocalStorage()
    // ! Important: Reset application state
    cy.task('resetTestData')
  })

  it('loads the home screen correctly', () => {
    cy.get('[data-cy="app-title"]').should('contain', 'Fantasy Writing App')
    cy.get('[data-cy="story-list"]').should('be.visible')
  })
})
```

### Page Object Pattern

```javascript
// cypress/support/pages/StoryPage.js
export class StoryPage {
  // * Define page elements
  elements = {
    titleInput: () => cy.get('[data-cy="story-title-input"]'),
    contentEditor: () => cy.get('[data-cy="story-content-editor"]'),
    saveButton: () => cy.get('[data-cy="save-story-button"]'),
    publishButton: () => cy.get('[data-cy="publish-story-button"]'),
    wordCount: () => cy.get('[data-cy="word-count-display"]'),
    chapterList: () => cy.get('[data-cy="chapter-list"]'),
    addChapterButton: () => cy.get('[data-cy="add-chapter-button"]')
  }

  // * Define page actions
  visit(storyId = 'new') {
    cy.visit(`/stories/${storyId}`)
    return this
  }

  enterTitle(title) {
    this.elements.titleInput().clear().type(title)
    return this
  }

  enterContent(content) {
    this.elements.contentEditor().clear().type(content)
    return this
  }

  save() {
    this.elements.saveButton().click()
    // ? Wait for save confirmation
    cy.get('[data-cy="save-success"]').should('be.visible')
    return this
  }

  publish() {
    this.elements.publishButton().click()
    cy.get('[data-cy="publish-confirmation"]').within(() => {
      cy.get('[data-cy="confirm-publish"]').click()
    })
    return this
  }

  addChapter(title) {
    this.elements.addChapterButton().click()
    cy.get('[data-cy="chapter-title-input"]').type(title)
    cy.get('[data-cy="create-chapter-button"]').click()
    return this
  }

  // * Verification methods
  shouldHaveTitle(title) {
    this.elements.titleInput().should('have.value', title)
    return this
  }

  shouldShowWordCount(count) {
    this.elements.wordCount().should('contain', count)
    return this
  }

  shouldHaveChapters(chapterTitles) {
    chapterTitles.forEach((title, index) => {
      this.elements.chapterList()
        .find(`[data-cy="chapter-item"]:eq(${index})`)
        .should('contain', title)
    })
    return this
  }
}

// Usage in tests
import { StoryPage } from '../support/pages/StoryPage'

describe('Story Creation', () => {
  const storyPage = new StoryPage()

  it('creates a complete story with chapters', () => {
    storyPage
      .visit()
      .enterTitle('My Epic Fantasy Novel')
      .enterContent('Once upon a time in a magical kingdom...')
      .save()
      .addChapter('Chapter 1: The Beginning')
      .addChapter('Chapter 2: The Journey')
      .shouldHaveTitle('My Epic Fantasy Novel')
      .shouldHaveChapters(['Chapter 1: The Beginning', 'Chapter 2: The Journey'])
  })
})
```

## Custom Commands

### Creating Reusable Commands

```javascript
// cypress/support/commands.js

// * Authentication command
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  cy.session([email, password], () => {
    cy.visit('/login')
    cy.get('[data-cy="email-input"]').type(email)
    cy.get('[data-cy="password-input"]').type(password)
    cy.get('[data-cy="login-button"]').click()
    cy.url().should('include', '/dashboard')
  })
})

// * Story creation command
Cypress.Commands.add('createStory', (storyData = {}) => {
  const defaultStory = {
    title: 'Test Story',
    content: 'Test content',
    genre: 'fantasy'
  }
  
  const story = { ...defaultStory, ...storyData }
  
  cy.get('[data-cy="create-story-button"]').click()
  cy.get('[data-cy="story-title-input"]').type(story.title)
  cy.get('[data-cy="story-content-editor"]').type(story.content)
  cy.get('[data-cy="genre-select"]').select(story.genre)
  cy.get('[data-cy="save-story-button"]').click()
  
  // ! Wait for story to be created and return story data
  cy.get('[data-cy="story-created-message"]').should('be.visible')
  cy.url().should('match', /\/stories\/\d+/)
  
  return cy.wrap(story)
})

// * Database operations
Cypress.Commands.add('seedDatabase', (fixtures = []) => {
  fixtures.forEach(fixture => {
    cy.task('db:seed', fixture)
  })
})

// * Wait for loading states
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('[data-cy="loading-spinner"]').should('not.exist')
  cy.get('[data-cy="page-content"]').should('be.visible')
})

// * Form filling helper
Cypress.Commands.add('fillForm', (formData) => {
  Object.entries(formData).forEach(([field, value]) => {
    if (typeof value === 'string') {
      cy.get(`[data-cy="${field}-input"]`).clear().type(value)
    } else if (typeof value === 'boolean') {
      if (value) {
        cy.get(`[data-cy="${field}-checkbox"]`).check()
      } else {
        cy.get(`[data-cy="${field}-checkbox"]`).uncheck()
      }
    } else if (Array.isArray(value)) {
      cy.get(`[data-cy="${field}-select"]`).select(value)
    }
  })
})

// ? Custom assertion for story validation
Cypress.Commands.add('shouldBeValidStory', { prevSubject: true }, (subject) => {
  cy.wrap(subject).should('have.property', 'id')
  cy.wrap(subject).should('have.property', 'title').and('not.be.empty')
  cy.wrap(subject).should('have.property', 'content')
  cy.wrap(subject).should('have.property', 'wordCount').and('be.a', 'number')
  cy.wrap(subject).should('have.property', 'createdAt')
  
  return cy.wrap(subject)
})
```

### TypeScript Command Definitions

```typescript
// cypress/support/commands.ts
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login with email and password
       * @param email - User email
       * @param password - User password
       */
      login(email?: string, password?: string): Chainable<void>
      
      /**
       * Create a new story
       * @param storyData - Story data object
       */
      createStory(storyData?: Partial<Story>): Chainable<Story>
      
      /**
       * Seed database with fixture data
       * @param fixtures - Array of fixture names
       */
      seedDatabase(fixtures?: string[]): Chainable<void>
      
      /**
       * Wait for page to finish loading
       */
      waitForPageLoad(): Chainable<void>
      
      /**
       * Fill form with data object
       * @param formData - Object with field names and values
       */
      fillForm(formData: Record<string, any>): Chainable<void>
      
      /**
       * Assert that subject is a valid story object
       */
      shouldBeValidStory(): Chainable<Story>
    }
  }
}

interface Story {
  id: string
  title: string
  content: string
  wordCount: number
  createdAt: string
  updatedAt: string
  genre: string
  status: 'draft' | 'published' | 'archived'
}
```

## Test Configuration

### Cypress Configuration File

```javascript
// cypress.config.js
import { defineConfig } from 'cypress'

export default defineConfig({
  // * Global configuration
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  responseTimeout: 10000,
  pageLoadTimeout: 30000,
  
  // ! Security and debugging
  chromeWebSecurity: false,
  video: false,
  screenshotOnRunFailure: true,
  trashAssetsBeforeRuns: true,
  
  // * Viewport settings
  viewportWidth: 1280,
  viewportHeight: 720,
  
  e2e: {
    baseUrl: 'http://localhost:3002',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    excludeSpecPattern: '*.hot-update.js',
    
    // ? Custom environment variables
    env: {
      apiUrl: 'http://localhost:3001',
      testUser: {
        email: 'test@example.com',
        password: 'password123'
      }
    },
    
    setupNodeEvents(on, config) {
      // * Database tasks
      on('task', {
        'db:seed'(fixture) {
          // Seed database with fixture data
          return null
        },
        
        'db:cleanup'() {
          // Clean up database
          return null
        },
        
        'resetUserData'() {
          // Reset user-specific data
          return null
        },
        
        'resetTestData'() {
          // Reset test data between tests
          return null
        }
      })
      
      // ? File system tasks
      on('task', {
        'fileExists'(filename) {
          return require('fs').existsSync(filename)
        },
        
        'readFile'(filename) {
          return require('fs').readFileSync(filename, 'utf8')
        }
      })
      
      return config
    }
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack'
    },
    supportFile: 'cypress/support/component.js',
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    indexHtmlFile: 'cypress/support/component-index.html',
    
    env: {
      coverage: true
    }
  }
})
```

### Environment-Specific Configuration

```javascript
// cypress/config/development.json
{
  "baseUrl": "http://localhost:3002",
  "env": {
    "apiUrl": "http://localhost:3001",
    "database": "test_db_dev"
  }
}

// cypress/config/staging.json
{
  "baseUrl": "https://staging.fantasywritingapp.com",
  "env": {
    "apiUrl": "https://api-staging.fantasywritingapp.com",
    "database": "test_db_staging"
  }
}

// Usage with config files
// npx cypress run --config-file cypress/config/staging.json
```

## Data Management

### Fixtures for Test Data

```json
// cypress/fixtures/stories.json
[
  {
    "id": "story-1",
    "title": "The Dragon's Quest",
    "content": "In a land far away, there lived a mighty dragon...",
    "wordCount": 1250,
    "genre": "fantasy",
    "status": "draft",
    "chapters": [
      {
        "id": "chapter-1",
        "title": "The Beginning",
        "orderIndex": 0,
        "wordCount": 500
      },
      {
        "id": "chapter-2", 
        "title": "The Journey",
        "orderIndex": 1,
        "wordCount": 750
      }
    ],
    "characters": ["char-1", "char-2"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
]
```

```json
// cypress/fixtures/characters.json
[
  {
    "id": "char-1",
    "name": "Aria Dragonborn",
    "role": "protagonist",
    "description": "A brave warrior with dragon heritage",
    "personality": ["courageous", "loyal", "impulsive"],
    "backstory": "Born in the dragon lands...",
    "relationships": [
      {
        "characterId": "char-2",
        "type": "ally",
        "description": "Trusted companion"
      }
    ]
  },
  {
    "id": "char-2",
    "name": "Elron Swiftarrow",
    "role": "supporting",
    "description": "An elven archer and guide",
    "personality": ["wise", "patient", "mysterious"],
    "backstory": "Guardian of the ancient forests..."
  }
]
```

### Using Fixtures in Tests

```javascript
describe('Story Management with Fixtures', () => {
  beforeEach(() => {
    // * Load and use fixture data
    cy.fixture('stories').as('storiesData')
    cy.fixture('characters').as('charactersData')
  })

  it('displays existing stories from fixtures', function() {
    // Access fixture data using 'this'
    cy.seedDatabase(['stories', 'characters'])
    cy.visit('/stories')
    
    this.storiesData.forEach((story, index) => {
      cy.get(`[data-cy="story-item-${index}"]`)
        .should('contain', story.title)
        .and('contain', `${story.wordCount} words`)
    })
  })

  it('loads story with associated characters', function() {
    const story = this.storiesData[0]
    cy.visit(`/stories/${story.id}`)
    
    // ? Verify characters are loaded
    story.characters.forEach(characterId => {
      const character = this.charactersData.find(c => c.id === characterId)
      cy.get('[data-cy="story-characters"]')
        .should('contain', character.name)
    })
  })

  // * Alternative: Load fixtures directly in test
  it('creates story from fixture template', () => {
    cy.fixture('story-templates/fantasy-template').then((template) => {
      cy.createStory(template)
      
      cy.get('[data-cy="story-title"]').should('contain', template.title)
      cy.get('[data-cy="story-genre"]').should('contain', template.genre)
    })
  })
})
```

## Test Isolation and Independence

### Ensuring Test Independence

```javascript
describe('Test Isolation Best Practices', () => {
  beforeEach(() => {
    // * Reset application state before each test
    cy.task('resetTestData')
    cy.clearLocalStorage()
    cy.clearCookies()
    
    // ? Setup clean environment
    cy.login()
    cy.visit('/stories')
  })

  it('test 1 - creates a story', () => {
    cy.createStory({ title: 'Test Story 1' })
    // ! This test should not affect other tests
  })

  it('test 2 - edits a story', () => {
    // This test should start with clean state
    cy.createStory({ title: 'Story to Edit' })
    cy.get('[data-cy="edit-button"]').click()
    cy.get('[data-cy="story-title-input"]').clear().type('Edited Title')
    cy.get('[data-cy="save-button"]').click()
    
    cy.get('[data-cy="story-title"]').should('contain', 'Edited Title')
  })

  it('test 3 - deletes a story', () => {
    // Independent test that doesn't rely on previous tests
    cy.createStory({ title: 'Story to Delete' })
    cy.get('[data-cy="delete-button"]').click()
    cy.get('[data-cy="confirm-delete"]').click()
    
    cy.get('[data-cy="empty-stories-message"]').should('be.visible')
  })
})
```

### State Management Between Tests

```javascript
// * Using cy.session for authentication state
Cypress.Commands.add('loginWithSession', (user = 'testUser') => {
  cy.session(user, () => {
    cy.visit('/login')
    cy.get('[data-cy="email-input"]').type('test@example.com')
    cy.get('[data-cy="password-input"]').type('password123')
    cy.get('[data-cy="login-button"]').click()
    cy.url().should('include', '/dashboard')
  }, {
    validate() {
      // ? Validate that session is still valid
      cy.visit('/dashboard')
      cy.get('[data-cy="user-menu"]').should('be.visible')
    }
  })
})

// Usage in tests maintains session across tests
describe('Authenticated User Stories', () => {
  beforeEach(() => {
    cy.loginWithSession()
    cy.visit('/stories')
  })

  // Tests will reuse the authenticated session
})
```

## Advanced Test Organization

### Shared Test Behaviors

```javascript
// cypress/support/shared-behaviors.js
export const sharedBehaviors = {
  // * Form validation behaviors
  testRequiredFields(fields) {
    return () => {
      fields.forEach(field => {
        it(`validates ${field} is required`, () => {
          cy.get('[data-cy="save-button"]').click()
          cy.get(`[data-cy="${field}-error"]`)
            .should('be.visible')
            .and('contain', 'required')
        })
      })
    }
  },

  // * Loading state behaviors
  testLoadingStates(elements) {
    return () => {
      it('shows loading state while processing', () => {
        elements.forEach(element => {
          cy.get(`[data-cy="${element}-loading"]`).should('be.visible')
        })
      })

      it('hides loading state when complete', () => {
        cy.waitForPageLoad()
        elements.forEach(element => {
          cy.get(`[data-cy="${element}-loading"]`).should('not.exist')
        })
      })
    }
  },

  // * Error handling behaviors
  testErrorStates(scenarios) {
    return () => {
      scenarios.forEach(scenario => {
        it(`handles ${scenario.name} error`, () => {
          // Setup error condition
          cy.intercept('POST', scenario.endpoint, {
            statusCode: scenario.statusCode,
            body: { error: scenario.error }
          })

          // Trigger action
          cy.get(`[data-cy="${scenario.trigger}"]`).click()

          // Verify error handling
          cy.get('[data-cy="error-message"]')
            .should('be.visible')
            .and('contain', scenario.expectedMessage)
        })
      })
    }
  }
}

// Usage in test files
import { sharedBehaviors } from '../support/shared-behaviors'

describe('Story Form', () => {
  context('Form Validation', sharedBehaviors.testRequiredFields([
    'title', 'content', 'genre'
  ]))

  context('Loading States', sharedBehaviors.testLoadingStates([
    'save', 'publish', 'delete'
  ]))

  context('Error Handling', sharedBehaviors.testErrorStates([
    {
      name: 'server error',
      endpoint: '/api/stories',
      statusCode: 500,
      error: 'Internal server error',
      trigger: 'save-button',
      expectedMessage: 'Unable to save story'
    }
  ]))
})
```

### Test Suites and Tags

```javascript
// * Tagging tests for different execution scenarios
describe('Story Management', { tags: ['@smoke', '@stories'] }, () => {
  it('creates a basic story', { tags: ['@critical'] }, () => {
    // Critical path test
  })

  it('validates story fields', { tags: ['@validation'] }, () => {
    // Validation test
  })

  it('handles edge cases', { tags: ['@edge-case'] }, () => {
    // Edge case test
  })
})

// Run specific tagged tests
// npx cypress run --env grepTags="@smoke"
// npx cypress run --env grepTags="@critical+@stories"
```

### Cross-Browser Testing Organization

```javascript
// cypress/support/browsers.js
export const browserTests = {
  runOnAllBrowsers(testFn) {
    const browsers = ['chrome', 'firefox', 'edge']
    
    browsers.forEach(browser => {
      context(`${browser} browser`, () => {
        before(() => {
          // ? Browser-specific setup
          Cypress.browser.name === browser
        })
        
        testFn()
      })
    })
  }
}

// Usage
import { browserTests } from '../support/browsers'

describe('Cross-Browser Story Creation', () => {
  browserTests.runOnAllBrowsers(() => {
    it('creates story consistently across browsers', () => {
      cy.createStory({ title: 'Cross-Browser Test Story' })
      cy.get('[data-cy="story-title"]').should('contain', 'Cross-Browser Test Story')
    })
  })
})
```

This comprehensive guide covers all aspects of writing and organizing Cypress tests, from basic structure to advanced patterns for maintaining large test suites effectively.
# Introduction to Cypress

A comprehensive guide to understanding Cypress fundamentals and core concepts for testing the FantasyWritingApp.

## What is Cypress?

Cypress is a next-generation front-end testing tool built for the modern web. It addresses the key pain points developers and QA engineers face when testing modern applications.

### Key Characteristics

- **All-in-one**: Complete end-to-end testing framework, assertion library, with mocking and stubbing
- **JavaScript-based**: Written in JavaScript, runs in the browser alongside your application
- **Real-time reloading**: Automatically reloads whenever you make changes to your tests
- **Time travel**: Takes snapshots as your tests run for debugging
- **Automatic waiting**: Never need to add waits or sleeps - Cypress automatically waits for commands and assertions

## Core Philosophy

### 1. Testing Should Be Enjoyable

Cypress makes setting up, writing, running, and debugging tests easy. The experience is designed to be intuitive and productive.

### 2. Tests Should Be Reliable

Tests run in the same run-loop as your application, eliminating flakiness and providing consistent results.

### 3. Tests Should Be Fast

By running in the browser, Cypress has native access to every single object, making tests execute quickly.

## Architectural Concepts

### The Cypress Architecture

```
┌─────────────────────────────────────┐
│         Node.js Process             │
│  (Proxy, File Watching, Plugins)    │
└─────────────────────────────────────┘
                  ↕
┌─────────────────────────────────────┐
│          Browser Process            │
│  ┌─────────────────────────────┐   │
│  │    Your Application (iframe) │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │    Cypress Test Runner       │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### How Cypress Works

1. **Executes in the same run loop** - Cypress operates within your application, not outside of it
2. **Network layer control** - Cypress operates at the network layer, reading and altering web traffic on the fly
3. **Consistent results** - Because Cypress controls the entire automation process, it can deliver consistent, reliable results

## Command Queue and Execution

### Asynchronous Nature

Cypress commands are **asynchronous** and get queued for execution at a later time. This is fundamentally different from synchronous code execution:

```javascript
// * This doesn't work as expected
const button = cy.get('[data-cy="submit-button"]'); // Wrong!
button.click(); // This won't work

// * This is the correct approach
cy.get('[data-cy="submit-button"]').click(); // Correct!
```

### Command Chaining

Commands are chained together and executed serially:

```javascript
describe('Element Creation', () => {
  it('creates a new fantasy element', () => {
    // * Each command is enqueued and executed in order
    cy.visit('/elements')
      .get('[data-cy="new-element-button"]')
      .click()
      .get('[data-cy="element-title-input"]')
      .type('Ancient Dragon')
      .get('[data-cy="element-type-select"]')
      .select('Creature')
      .get('[data-cy="save-button"]')
      .click();

    // * Assertion also gets queued
    cy.get('[data-cy="element-list"]').should('contain', 'Ancient Dragon');
  });
});
```

## Querying Elements

### jQuery-like Syntax

Cypress uses a familiar jQuery-like syntax for querying elements:

```javascript
// * Basic element selection
cy.get('.class-name');
cy.get('#element-id');
cy.get('[data-cy="element-name"]'); // Preferred for testing!

// * Traversal commands
cy.get('[data-cy="element-list"]').find('[data-cy="element-card"]');
cy.get('[data-cy="form"]').within(() => {
  cy.get('[data-cy="input"]').type('text');
});

// * Filtering
cy.get('[data-cy="element-card"]').first();
cy.get('[data-cy="element-card"]').eq(2);
cy.get('[data-cy="element-card"]').filter('.active');
```

### Automatic Retry-ability

Cypress automatically retries queries until elements are found or timeout is reached:

```javascript
// * Cypress will keep trying to find this element for 4 seconds (default)
cy.get('[data-cy="async-loaded-element"]').should('be.visible').click();

// * Custom timeout for slow-loading elements
cy.get('[data-cy="slow-element"]', { timeout: 10000 }).should('exist');
```

## Assertions

### Built-in Assertions

Many Cypress commands have built-in assertions:

```javascript
// * These commands automatically assert the element exists
cy.visit('/projects'); // Asserts page loads successfully
cy.contains('My Project'); // Asserts text is found
cy.get('[data-cy="element"]').click(); // Asserts element is actionable
```

### Explicit Assertions

#### Using `.should()` and `.and()`

```javascript
cy.get('[data-cy="project-title"]')
  .should('be.visible')
  .and('contain', 'Fantasy World')
  .and('have.class', 'active');

// * Negative assertions
cy.get('[data-cy="error-message"]').should('not.exist');

// * Custom assertions
cy.get('[data-cy="element-count"]').should($count => {
  const count = parseInt($count.text());
  expect(count).to.be.greaterThan(0);
  expect(count).to.be.lessThan(100);
});
```

#### Using `expect()` for Values

```javascript
cy.get('[data-cy="story-stats"]').then($stats => {
  const wordCount = $stats.attr('data-word-count');
  expect(parseInt(wordCount)).to.be.greaterThan(1000);
});
```

## Timeouts

### Default Timeouts

Cypress has intelligent default timeouts:

```javascript
// Default timeouts
{
  defaultCommandTimeout: 4000,    // Most commands
  execTimeout: 60000,             // cy.exec()
  taskTimeout: 60000,             // cy.task()
  pageLoadTimeout: 60000,         // cy.visit()
  requestTimeout: 5000,           // cy.wait() for routes
  responseTimeout: 30000          // cy.request()
}
```

### Custom Timeouts

```javascript
// * Per-command timeout
cy.get('[data-cy="slow-element"]', { timeout: 10000 });

// * Global configuration in cypress.config.ts
export default defineConfig({
  e2e: {
    defaultCommandTimeout: 10000, // 10 seconds for all commands
  },
});
```

## Best Practices for Your React Native Web App

### 1. Element Selection Strategy

```javascript
// ! ALWAYS use data-cy attributes for the FantasyWritingApp
cy.get('[data-cy="create-project-button"]'); // ✅ Correct

// ! NEVER use these selectors
cy.get('.btn-primary'); // ❌ Wrong - CSS class
cy.get('#submit'); // ❌ Wrong - ID
cy.get('button'); // ❌ Wrong - Tag name
```

### 2. Handling React Native Web Components

```javascript
describe('React Native Web Components', () => {
  it('handles TouchableOpacity interactions', () => {
    // * React Native Web converts testID to data-cy
    cy.get('[data-cy="touchable-button"]')
      .should('have.attr', 'role', 'button')
      .click();
  });

  it('handles TextInput components', () => {
    cy.get('[data-cy="story-title-input"]')
      .type('My Fantasy Novel')
      .should('have.value', 'My Fantasy Novel');
  });

  it('handles ScrollView components', () => {
    cy.get('[data-cy="scrollable-content"]').scrollTo('bottom');
  });
});
```

### 3. Writing Deterministic Tests

```javascript
describe('Deterministic Testing', () => {
  beforeEach(() => {
    // * Reset state before each test
    cy.task('db:seed');
    cy.visit('/projects');
  });

  it('always produces the same result', () => {
    // * Use fixtures for consistent data
    cy.fixture('sample-project.json').then(project => {
      cy.createProject(project);
      cy.get('[data-cy="project-list"]').should('contain', project.title);
    });
  });
});
```

## The Testing Mindset

### Think Like a User

Write tests that mirror how users interact with your application:

```javascript
it('user creates a new story', () => {
  // * Follow the user journey
  cy.visit('/');
  cy.get('[data-cy="login-button"]').click();
  cy.login('user@example.com', 'password');

  // Navigate to stories
  cy.get('[data-cy="nav-stories"]').click();

  // Create new story
  cy.get('[data-cy="new-story-button"]').click();
  cy.get('[data-cy="story-title-input"]').type('Epic Fantasy');
  cy.get('[data-cy="story-genre-select"]').select('Fantasy');
  cy.get('[data-cy="save-story-button"]').click();

  // Verify creation
  cy.url().should('include', '/story/');
  cy.get('[data-cy="story-header"]').should('contain', 'Epic Fantasy');
});
```

### Test the Critical Path

Focus on the most important user journeys:

```javascript
describe('Critical User Paths', () => {
  it('completes the core workflow', () => {
    // 1. User signs up
    // 2. Creates a project
    // 3. Adds elements
    // 4. Creates relationships
    // 5. Exports data
  });
});
```

## Debugging in Cypress

### Using Debug Commands

```javascript
// * Pause test execution
cy.pause();

// * Debug specific element
cy.get('[data-cy="complex-element"]').debug();

// * Log to Command Log
cy.log('Current state:', 'loaded');

// * Take screenshots
cy.screenshot('before-interaction');
```

### Time Travel Debugging

Cypress automatically takes snapshots of your application at each command. You can:

- Hover over commands in the Command Log to see the application state
- Click on commands to pin the snapshot
- Use browser DevTools while paused on a snapshot

## Common Patterns for FantasyWritingApp

### Testing Element Creation

```javascript
describe('Element Management', () => {
  it('creates a new character element', () => {
    cy.visit('/project/123/elements');
    cy.get('[data-cy="new-element-button"]').click();
    cy.get('[data-cy="element-type-select"]').select('Character');
    cy.get('[data-cy="element-name-input"]').type('Gandalf');
    cy.get('[data-cy="element-description-textarea"]').type(
      'A wise wizard with great power',
    );
    cy.get('[data-cy="save-element-button"]').click();

    // Verify element was created
    cy.get('[data-cy="element-list"]').should('contain', 'Gandalf');
    cy.get('[data-cy="element-card-Gandalf"]').should(
      'have.attr',
      'data-element-type',
      'Character',
    );
  });
});
```

### Testing Relationships

```javascript
describe('Element Relationships', () => {
  it('creates relationship between elements', () => {
    cy.createCharacter('Frodo');
    cy.createLocation('The Shire');

    cy.visit('/relationships');
    cy.get('[data-cy="new-relationship-button"]').click();
    cy.get('[data-cy="source-element-select"]').select('Frodo');
    cy.get('[data-cy="relationship-type-select"]').select('lives in');
    cy.get('[data-cy="target-element-select"]').select('The Shire');
    cy.get('[data-cy="save-relationship-button"]').click();

    cy.get('[data-cy="relationship-graph"]').should(
      'contain',
      'Frodo lives in The Shire',
    );
  });
});
```

## Summary

Cypress fundamentally changes how you think about testing by:

1. **Running in the browser** - Direct access to your application
2. **Automatic waiting** - No explicit waits needed
3. **Time travel** - Debug by seeing exactly what happened
4. **Real-time feedback** - See tests run as you write them
5. **Consistent results** - Eliminate flaky tests

For the FantasyWritingApp, this means:

- Fast, reliable tests for your React Native Web components
- Easy debugging of complex user workflows
- Confidence in your cross-platform functionality
- Better user experience through comprehensive testing

Remember: Always use `data-cy` attributes, write tests that mirror user behavior, and leverage Cypress's automatic retry-ability for robust testing.

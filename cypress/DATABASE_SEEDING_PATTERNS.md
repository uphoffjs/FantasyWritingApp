# Database Seeding Patterns for E2E Testing

**Version**: 1.0.0
**Last Updated**: 2025-01-27
**Status**: Active

## Overview

This document describes the database seeding patterns used in Cypress E2E tests for the FantasyWritingApp. Following Cypress.io best practices, we prioritize API-based seeding for speed and reliability.

## 🎯 Core Principles

1. **Clean BEFORE, not AFTER** - Always clean state before tests, never after
2. **API-First Seeding** - Use cy.request() for fastest seeding
3. **Isolated Test Data** - Each test creates its own data
4. **Deterministic IDs** - Use predictable IDs for reliable selection
5. **Minimal Data Sets** - Create only what's needed for the test

## 📊 Seeding Methods (Ranked by Performance)

### 1. API Seeding with cy.request() ⚡ FASTEST
```javascript
// Best for: Most seeding scenarios
cy.request('POST', '/api/test/seed', {
  users: 1,
  projects: 2,
  elements: 10
}).then(response => {
  cy.wrap(response.body).as('testData');
});
```

**Advantages:**
- Fastest execution (~100ms)
- No UI interaction required
- Runs in parallel with other requests
- Direct database access

**Use When:**
- Setting up initial state
- Creating bulk test data
- Need fastest possible seeding

### 2. Task-Based Seeding with cy.task() 🚀 FAST
```javascript
// Best for: Complex seeding logic
cy.task('seedDatabase', {
  users: [{
    email: 'test@example.com',
    password: 'Test123!',
    projects: 5
  }]
}).then(data => {
  cy.wrap(data).as('seededData');
});
```

**Implementation in cypress.config.js:**
```javascript
const { seedDatabase } = require('./cypress/plugins/seeders');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        seedDatabase(params) {
          return seedDatabase(params);
        },
        cleanDatabase() {
          return cleanDatabase();
        }
      });
    }
  }
});
```

**Advantages:**
- Runs in Node.js environment
- Direct database access
- Can handle complex logic
- Reusable across tests

**Use When:**
- Complex seeding logic required
- Need Node.js capabilities
- Database transactions needed

### 3. Fixture-Based Stubbing with cy.intercept() 📦 INSTANT
```javascript
// Best for: Mocking API responses (not true seeding)
cy.intercept('GET', '/api/projects', {
  fixture: 'projects.json'
}).as('getProjects');
```

**Advantages:**
- Instant response (0ms network time)
- Predictable data
- No backend required
- Perfect for edge cases

**Use When:**
- Testing error states
- Testing UI behavior
- Backend is unavailable
- Need deterministic responses

### 4. UI-Based Seeding ❌ SLOWEST - AVOID
```javascript
// AVOID: Only use when testing the UI flow itself
cy.visit('/register');
cy.get('[data-cy="email"]').type('test@example.com');
cy.get('[data-cy="password"]').type('Test123!');
cy.get('[data-cy="submit"]').click();
```

**Disadvantages:**
- Slowest method (2-10 seconds)
- Brittle (UI changes break seeding)
- Can't run in parallel
- Tests UI when not needed

**Use Only When:**
- Testing the registration flow itself
- No other option available

## 🏭 Test Data Factories

### Using Element Factory
```javascript
import ElementFactory from '../fixtures/factories/elementFactory';

describe('Element Management', () => {
  beforeEach(() => {
    // Create test data
    const character = ElementFactory.createCharacter({
      name: 'Test Character',
      projectId: 'test-project-123'
    });

    // Seed via API
    cy.request('POST', '/api/elements', character)
      .its('body.element')
      .as('testCharacter');
  });

  it('should display character details', function() {
    cy.visit(`/element/${this.testCharacter.id}`);
    cy.contains(this.testCharacter.name).should('be.visible');
  });
});
```

### Using Project Factory
```javascript
import ProjectFactory from '../fixtures/factories/projectFactory';

describe('Project Management', () => {
  beforeEach(() => {
    const project = ProjectFactory.create({
      name: 'Test Fantasy World',
      elementCount: 25
    });

    cy.task('seedProject', project).as('testProject');
  });
});
```

## 🔄 Database Cleanup Patterns

### Before Each Test
```javascript
beforeEach(() => {
  // Clean specific test data
  cy.task('cleanTestData', {
    prefix: 'test-',
    olderThan: '1 hour'
  });
});
```

### Before Test Suite
```javascript
before(() => {
  // Full database reset for suite
  cy.task('resetDatabase');
});
```

### Selective Cleanup
```javascript
beforeEach(() => {
  // Clean only specific tables
  cy.task('cleanTables', ['test_users', 'test_projects']);
});
```

## 🎯 Seeding Strategies by Test Type

### Authentication Tests
```javascript
describe('Authentication', () => {
  beforeEach(() => {
    // Seed user via API
    cy.request('POST', '/api/test/users', {
      email: `user-${Date.now()}@test.com`,
      password: 'Test123!'
    }).as('testUser');
  });

  it('should login with valid credentials', function() {
    cy.visit('/login');
    cy.get('[data-cy="email"]').type(this.testUser.email);
    cy.get('[data-cy="password"]').type('Test123!');
    cy.get('[data-cy="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

### CRUD Operations
```javascript
describe('Element CRUD', () => {
  beforeEach(() => {
    // Seed complete project with elements
    cy.task('seedCompleteProject', {
      elements: {
        characters: 5,
        locations: 3,
        items: 2
      }
    }).as('testData');
  });

  it('should update element', function() {
    const element = this.testData.elements[0];

    cy.request('PATCH', `/api/elements/${element.id}`, {
      name: 'Updated Name'
    });

    cy.visit(`/element/${element.id}`);
    cy.contains('Updated Name').should('be.visible');
  });
});
```

### Search and Filter Tests
```javascript
describe('Search Functionality', () => {
  beforeEach(() => {
    // Seed searchable data
    const elements = ElementFactory.createMany(50, {
      projectId: 'test-project'
    });

    cy.request('POST', '/api/test/bulk-seed', {
      elements
    }).as('searchableElements');
  });

  it('should filter by type', function() {
    cy.visit('/elements');
    cy.get('[data-cy="filter-type"]').select('character');

    cy.get('[data-cy="element-card"]').each($card => {
      cy.wrap($card).should('contain', 'Character');
    });
  });
});
```

## 📝 Best Practices Implementation

### 1. Unique Test Data
```javascript
// Good: Timestamp ensures uniqueness
const email = `test-${Date.now()}@example.com`;

// Bad: Can conflict with other tests
const email = 'test@example.com';
```

### 2. Aliasing for Readability
```javascript
// Good: Clear aliases
cy.request('POST', '/api/projects', projectData)
  .its('body.project')
  .as('testProject');

// Later in test
cy.get('@testProject').then(project => {
  cy.visit(`/project/${project.id}`);
});
```

### 3. Parallel-Safe Seeding
```javascript
// Good: Each test creates isolated data
beforeEach(() => {
  const testId = Cypress._.random(0, 1e6);
  cy.task('seedIsolatedData', { testId }).as('testData');
});

// Bad: Shared data can cause conflicts
before(() => {
  cy.task('seedSharedData');
});
```

### 4. Performance Optimization
```javascript
// Good: Single request for multiple entities
cy.request('POST', '/api/test/seed-bulk', {
  users: 1,
  projects: 5,
  elements: 20
});

// Bad: Multiple sequential requests
cy.request('POST', '/api/users', userData);
cy.request('POST', '/api/projects', projectData);
cy.request('POST', '/api/elements', elementData);
```

## 🚀 Advanced Patterns

### Conditional Seeding
```javascript
beforeEach(() => {
  // Only seed if not already present
  cy.request({
    method: 'GET',
    url: '/api/test/check-data',
    failOnStatusCode: false
  }).then(response => {
    if (response.status === 404) {
      cy.task('seedDatabase');
    }
  });
});
```

### Seeding with Relationships
```javascript
cy.task('seedRelatedData', {
  user: {
    email: 'test@example.com',
    projects: [{
      name: 'Test Project',
      elements: [{
        type: 'character',
        name: 'Hero',
        relationships: [{
          targetName: 'Villain',
          type: 'enemy'
        }]
      }]
    }]
  }
}).as('complexData');
```

### Transaction-Based Seeding
```javascript
cy.task('seedInTransaction', {
  operations: [
    { type: 'createUser', data: userData },
    { type: 'createProject', data: projectData },
    { type: 'linkUserProject', data: linkData }
  ],
  rollbackOnError: true
});
```

## 🔍 Debugging Seeding Issues

### Enable Debug Logging
```javascript
// cypress.config.js
module.exports = defineConfig({
  e2e: {
    env: {
      DEBUG_SEEDING: true
    }
  }
});

// In tests
if (Cypress.env('DEBUG_SEEDING')) {
  cy.task('seedDatabase', data).then(result => {
    console.log('Seeding result:', result);
  });
}
```

### Verify Seeded Data
```javascript
it('should have seeded data', () => {
  // Seed data
  cy.task('seedDatabase', { users: 1 }).as('seeded');

  // Verify via API
  cy.get('@seeded').then(data => {
    cy.request(`/api/users/${data.user.id}`)
      .its('status')
      .should('eq', 200);
  });
});
```

## ⚠️ Common Pitfalls to Avoid

1. **Using UI for seeding** - 10x slower than API
2. **Cleaning after tests** - Can affect subsequent tests
3. **Hardcoded IDs** - Causes conflicts in parallel runs
4. **Sequential seeding** - Use bulk operations instead
5. **Not aliasing data** - Makes tests harder to read
6. **Shared test data** - Causes flaky tests
7. **Missing cleanup** - Accumulates test data

## 📊 Performance Benchmarks

| Method | Time | Use Case |
|--------|------|----------|
| cy.intercept (stub) | 0ms | Mock responses |
| cy.request (API) | 50-200ms | Real data seeding |
| cy.task (DB) | 100-300ms | Complex seeding |
| UI interaction | 2000-10000ms | Testing UI only |

## 🔗 Related Documentation

- [Cypress Best Practices](./CYPRESS_BEST_PRACTICES.md)
- [Test Data Factories](./fixtures/factories/README.md)
- [E2E Testing Strategy](./E2E_TESTING_STRATEGY.md)
- [CI/CD Configuration](./.github/workflows/cypress-e2e.yml)

---

**Remember**: The fastest test is the one that doesn't touch the UI unnecessarily. Always seed via API or cy.task() unless testing the UI flow itself.
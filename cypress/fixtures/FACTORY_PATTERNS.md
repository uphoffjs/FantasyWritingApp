# Test Data Factory Patterns

## Overview

The FantasyWritingApp test suite uses a comprehensive factory system for generating consistent, realistic test data. This document outlines the patterns and best practices for using these factories in your tests.

## Available Factories

### Core Entity Factories

1. **Project Factory** - Creates project entities with settings and metadata
2. **Element Factory** - Base factory for all story elements
3. **Character Factory** - Specialized factory for character elements
4. **Location Factory** - Specialized factory for location elements
5. **Magic System Factory** - Specialized factory for magic system elements
6. **Relationship Factory** - Creates connections between elements
7. **User Factory** - Creates user entities with preferences
8. **Scene Factory** - Creates scene entities within chapters
9. **Chapter Factory** - Creates chapter entities within projects
10. **Story Factory** - Creates complete story structures

## Basic Usage

### Using Factory Commands in Tests

```typescript
// In your test file
describe('Element Browser', () => {
  beforeEach(() => {
    // Reset all factories to ensure clean state
    cy.resetFactories();
  });

  it('should display elements correctly', () => {
    // Create test data using factories
    cy.createTestData('element-browser').then((data) => {
      // data contains project with 20 elements
      cy.visit(`/projects/${data.project.id}`);

      // Test your component with realistic data
      cy.get('[data-cy=element-list]').should('have.length', 20);
    });
  });
});
```

### Direct Factory Usage

```typescript
import factories from '../fixtures/factories';

// Create a single character
const character = factories.character({
  name: 'Aragorn',
  answers: {
    background: 'Heir of Isildur',
    motivation: 'Restore the kingdom of Gondor'
  }
});

// Create a project with elements
const { project, elements } = factories.generateProjectWithElements(
  { name: 'Middle Earth' },
  10 // number of elements
);
```

## Factory Patterns

### 1. Minimal Test Data
Use when you need just the bare minimum for a test to run.

```typescript
cy.createScenario('minimal').then((data) => {
  // Returns: minimal project, user
  // Use for: Simple UI tests, empty states
});
```

### 2. Standard Test Data
Default scenario with reasonable amount of test data.

```typescript
cy.createScenario('standard').then((data) => {
  // Returns: project with 5 elements, 2 stories, 3 characters
  // Use for: Most component tests
});
```

### 3. Complete Test Data
Full dataset for comprehensive testing.

```typescript
cy.createScenario('complete').then((data) => {
  // Returns: Complete project with all relationships, chapters, scenes
  // Use for: Integration tests, complex workflows
});
```

### 4. Test-Specific Data
Generate data tailored to specific test scenarios.

```typescript
// Available test types:
const testTypes = [
  'story-creation',      // New story workflow
  'story-editing',       // Story with chapters
  'story-publishing',    // Complete story ready to publish
  'character-creation',  // New character workflow
  'character-profile',   // Complete character profile
  'character-relationships', // Characters with connections
  'project-dashboard',   // Multiple projects for dashboard
  'element-browser',     // Project with many elements
  'element-creation',    // Empty project for creating elements
  'global-search',       // Data across all entity types
  'empty-states'         // Empty collections for UI testing
];

cy.createTestData('element-browser').then((data) => {
  // Returns data specific to element browser testing
});
```

## Advanced Patterns

### Seeding Multiple Entities

```typescript
cy.seedData({
  stories: 10,
  characters: 20,
  projects: 5,
  elements: 50
}).then((data) => {
  // Use for performance testing or realistic datasets
});
```

### Creating Related Data

```typescript
// Create a project with interconnected elements
const completeProject = factories.generateCompleteProject('My Fantasy World');

// This creates:
// - 1 project
// - 10 elements (mixed types)
// - 5 relationships between elements
// - 3 chapters with 3 scenes each
// - Characters and locations linked to scenes
```

### Custom Overrides

```typescript
// Override specific fields while keeping sensible defaults
const customCharacter = factories.character({
  name: 'Custom Name',
  completionPercentage: 75,
  tags: ['hero', 'warrior', 'leader'],
  answers: {
    background: 'Custom background story',
    // Other answer fields get defaults
  }
});
```

## Best Practices

### 1. Always Reset Before Tests
```typescript
beforeEach(() => {
  cy.resetFactories(); // Ensures clean state
});
```

### 2. Use Appropriate Data Amounts
- **Unit Tests**: Use minimal data
- **Component Tests**: Use standard scenario
- **Integration Tests**: Use complete scenario
- **Performance Tests**: Use seeded data with larger amounts

### 3. Leverage Test-Specific Generators
Instead of manually creating data, use the test-specific generators:
```typescript
// Good
cy.createTestData('character-profile');

// Less optimal
cy.task('factory:create', {
  type: 'character',
  options: { /* manual configuration */ }
});
```

### 4. Keep Data Realistic
Factories generate realistic data with:
- Proper timestamps (createdAt, updatedAt)
- Unique IDs with prefixes
- Sensible defaults for all fields
- Proper relationships between entities

### 5. Use TypeScript Types
Import types for better IDE support:
```typescript
import type { Project, Character, Story } from '../fixtures/factories/index';

cy.createTestData('project-dashboard').then((data: {
  projects: Project[],
  recentElements: WorldElement[]
}) => {
  // TypeScript knows the shape of your data
});
```

## Common Scenarios

### Testing Empty States
```typescript
cy.createTestData('empty-states').then(() => {
  cy.visit('/projects');
  cy.get('[data-cy=empty-state]').should('be.visible');
});
```

### Testing Search Functionality
```typescript
cy.createTestData('global-search').then((data) => {
  // Provides data across all entity types
  cy.get('[data-cy=search-input]').type('Test');
  // Verify search results across projects, stories, characters
});
```

### Testing Relationships
```typescript
cy.createTestData('character-relationships').then((data) => {
  // Characters with predefined connections
  cy.visit(`/characters/${data.characters[0].id}`);
  cy.get('[data-cy=relationship-list]').should('not.be.empty');
});
```

## Troubleshooting

### Issue: Tests are flaky
**Solution**: Ensure you're resetting factories in beforeEach:
```typescript
beforeEach(() => {
  cy.resetFactories();
  cy.cleanState(); // Also clear browser state
});
```

### Issue: Data doesn't appear in tests
**Solution**: Check that factory tasks are registered in cypress.config.ts:
```javascript
const { factoryTasks } = require('./cypress/fixtures/factories/factory-tasks.js');

setupNodeEvents(on, config) {
  on('task', {
    ...factoryTasks
  });
}
```

### Issue: TypeScript errors with factory data
**Solution**: Import types from the factory index:
```typescript
import type { Character, Story } from '../fixtures/factories/index';
```

## Migration Guide

If you have existing tests using hard-coded data:

### Before (Hard-coded):
```typescript
const testData = {
  id: 'test-123',
  name: 'Test Character',
  description: 'A test character'
};
```

### After (Using Factories):
```typescript
cy.createTestData('character-creation').then((data) => {
  // Use data.character with realistic, consistent structure
});
```

## Summary

The factory system provides:
- **Consistency**: Same data structure across all tests
- **Realism**: Believable test data with proper relationships
- **Flexibility**: Easy overrides and customization
- **Maintainability**: Central location for test data logic
- **Performance**: Efficient data generation with caching

Use factories for all test data needs to ensure reliable, maintainable tests.
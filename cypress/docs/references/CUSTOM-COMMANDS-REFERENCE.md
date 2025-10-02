# Custom Cypress Commands Reference for FantasyWritingApp

## 📚 Overview

This document provides a comprehensive reference for all custom Cypress commands used in the FantasyWritingApp test suite. These commands are designed specifically for React Native Web testing and follow patterns proven in production applications.

## 🏗️ Architecture

Commands are organized into logical categories with each command in its own file for maintainability:

```
cypress/support/commands/
├── auth/              # Authentication & state management
├── elements/          # Element CRUD operations
├── projects/          # Project management
├── navigation/        # App navigation helpers
├── responsive/        # Viewport & touch interactions
├── debug/            # Debugging utilities
└── index.js          # Command aggregator
```

## 📖 Command Categories

### 1. Authentication & State Management

#### `cy.cleanState()`

Resets the application to a clean state by clearing all storage mechanisms.

**Usage:**

```javascript
cy.cleanState();
```

**Implementation:**

```javascript
// cypress/support/commands/auth/cleanState.js
Cypress.Commands.add('cleanState', () => {
  cy.window().then(win => {
    // * Clear React Native Web AsyncStorage (localStorage)
    win.localStorage.clear();
    win.sessionStorage.clear();

    // * Clear IndexedDB for Zustand persistence
    if (win.indexedDB) {
      win.indexedDB.deleteDatabase('fantasy-writing-app');
    }

    // * Clear any service worker caches
    if ('caches' in win) {
      win.caches.keys().then(names => {
        names.forEach(name => win.caches.delete(name));
      });
    }
  });

  // * Clear Cypress-level storage
  cy.clearCookies();
  cy.clearLocalStorage();
});
```

#### `cy.setupTestUser(options)`

Creates an authenticated test user with optional configuration.

**Parameters:**

- `options` (Object): User configuration
  - `username` (String): Username (default: auto-generated)
  - `email` (String): Email address (default: auto-generated)
  - `projects` (Array): Initial projects
  - `elements` (Array): Initial elements

**Returns:** User object

**Usage:**

```javascript
cy.setupTestUser({
  username: 'test_writer',
  projects: [{ name: 'My Fantasy World' }],
});
```

#### `cy.loginAsNewUser()`

Creates and logs in a fresh test user with no existing data.

**Usage:**

```javascript
cy.loginAsNewUser();
```

#### `cy.loginAsExistingUser(userData)`

Logs in with pre-configured user data and existing projects/elements.

**Parameters:**

- `userData` (Object): Complete user data including projects and elements

**Usage:**

```javascript
cy.loginAsExistingUser({
  id: 'user_123',
  projects: mockProjects,
  elements: mockElements,
});
```

### 2. Element Management

#### `cy.createElement(elementData)`

Creates a new element with specified or default data.

**Parameters:**

- `elementData` (Object): Element configuration
  - `name` (String): Element name (required)
  - `type` (String): Element type (default: 'character')
  - `category` (String): Element category
  - `answers` (Object): Questionnaire answers
  - `relationships` (Array): Related elements

**Returns:** Created element object

**Usage:**

```javascript
cy.createElement({
  name: 'Gandalf',
  type: 'character',
  category: 'Characters',
  answers: {
    appearance: 'Grey wizard with pointed hat',
    personality: 'Wise and mysterious',
  },
});
```

#### `cy.navigateToElement(elementId)`

Navigates to the element editor for a specific element.

**Parameters:**

- `elementId` (String): Element ID

**Usage:**

```javascript
cy.navigateToElement('element_123');
```

#### `cy.fillQuestionnaire(answers)`

Fills out element questionnaire with provided answers.

**Parameters:**

- `answers` (Object): Key-value pairs of question IDs and answers

**Usage:**

```javascript
cy.fillQuestionnaire({
  basic_name: 'Aragorn',
  basic_description: 'Ranger of the North',
  appearance_height: 'Tall',
  personality_traits: 'Noble, brave, humble',
});
```

#### `cy.createRelationship(fromElement, toElement, type)`

Creates a relationship between two elements.

**Parameters:**

- `fromElement` (String): Source element ID
- `toElement` (String): Target element ID
- `type` (String): Relationship type

**Usage:**

```javascript
cy.createRelationship('gandalf_id', 'frodo_id', 'mentors');
```

### 3. Project Management

#### `cy.createProject(projectData)`

Creates a new project with specified configuration.

**Parameters:**

- `projectData` (Object): Project configuration
  - `name` (String): Project name (required)
  - `description` (String): Project description
  - `genre` (String): Project genre
  - `elements` (Array): Initial elements

**Returns:** Created project object

**Usage:**

```javascript
cy.createProject({
  name: 'The Lord of the Rings',
  genre: 'High Fantasy',
  description: 'Epic quest to destroy the One Ring',
});
```

#### `cy.switchProject(projectId)`

Switches the active project context.

**Parameters:**

- `projectId` (String): Target project ID

**Usage:**

```javascript
cy.switchProject('project_lotr');
```

#### `cy.importProject(jsonData)`

Imports a project from JSON data.

**Parameters:**

- `jsonData` (Object|String): Project data or path to JSON file

**Usage:**

```javascript
cy.importProject('./fixtures/sample-project.json');
```

### 4. Navigation Helpers

#### `cy.navigateTo(path)`

Enhanced navigation with React Navigation support.

**Parameters:**

- `path` (String): Navigation path

**Usage:**

```javascript
cy.navigateTo('/app/elements');
cy.navigateTo('ElementEditor', { elementId: '123' }); // React Navigation
```

#### `cy.goBack()`

Navigates back in the React Navigation stack.

**Usage:**

```javascript
cy.goBack();
```

#### `cy.openDrawer()`

Opens the navigation drawer on mobile viewports.

**Usage:**

```javascript
cy.openDrawer();
```

### 5. Responsive & Touch Interactions

#### `cy.testResponsive(callback)`

Tests functionality across multiple viewports.

**Parameters:**

- `callback` (Function): Test function to run at each viewport

**Usage:**

```javascript
cy.testResponsive(viewport => {
  cy.get('[data-cy="dashboard"]').should('be.visible');

  if (viewport.name === 'mobile') {
    cy.get('[data-cy="mobile-nav"]').should('be.visible');
  } else {
    cy.get('[data-cy="sidebar"]').should('be.visible');
  }
});
```

#### `cy.simulateTouch(selector, gesture)`

Simulates touch gestures for React Native components.

**Parameters:**

- `selector` (String): Element selector
- `gesture` (String): Gesture type ('tap', 'longPress', 'swipeLeft', 'swipeRight', 'pinch', 'spread')

**Usage:**

```javascript
cy.simulateTouch('[data-cy="element-card"]', 'longPress');
cy.simulateTouch('[data-cy="element-list-item"]', 'swipeLeft');
```

**Implementation:**

```javascript
// cypress/support/commands/responsive/simulateTouch.js
Cypress.Commands.add('simulateTouch', (selector, gesture) => {
  const gestures = {
    tap: () => {
      cy.get(selector).trigger('touchstart').trigger('touchend');
    },

    longPress: () => {
      cy.get(selector).trigger('touchstart').wait(500).trigger('touchend');
    },

    swipeLeft: () => {
      cy.get(selector)
        .trigger('touchstart', {
          touches: [{ clientX: 300, clientY: 100 }],
        })
        .trigger('touchmove', {
          touches: [{ clientX: 50, clientY: 100 }],
        })
        .trigger('touchend');
    },

    swipeRight: () => {
      cy.get(selector)
        .trigger('touchstart', {
          touches: [{ clientX: 50, clientY: 100 }],
        })
        .trigger('touchmove', {
          touches: [{ clientX: 300, clientY: 100 }],
        })
        .trigger('touchend');
    },

    pinch: () => {
      cy.get(selector)
        .trigger('touchstart', {
          touches: [
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 200 },
          ],
        })
        .trigger('touchmove', {
          touches: [
            { clientX: 150, clientY: 150 },
            { clientX: 150, clientY: 150 },
          ],
        })
        .trigger('touchend');
    },

    spread: () => {
      cy.get(selector)
        .trigger('touchstart', {
          touches: [
            { clientX: 150, clientY: 150 },
            { clientX: 150, clientY: 150 },
          ],
        })
        .trigger('touchmove', {
          touches: [
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 200 },
          ],
        })
        .trigger('touchend');
    },
  };

  if (gestures[gesture]) {
    gestures[gesture]();
  } else {
    throw new Error(`Unknown gesture: ${gesture}`);
  }
});
```

#### `cy.setViewport(device)`

Sets viewport to predefined device dimensions.

**Parameters:**

- `device` (String): Device name ('mobile', 'tablet', 'desktop') or specific device

**Usage:**

```javascript
cy.setViewport('mobile');
cy.setViewport('iphone-x');
cy.setViewport({ width: 375, height: 812 });
```

### 6. Debug Utilities

#### `cy.comprehensiveDebug()`

**MANDATORY**: Sets up comprehensive debugging for all tests.

**Usage:**

```javascript
beforeEach(() => {
  cy.comprehensiveDebug(); // ! Required in every test file
});
```

**Features:**

- Captures uncaught exceptions
- Logs console errors and warnings
- Monitors network failures
- Creates debug artifacts on failure
- Takes failure screenshots

#### `cy.captureFailureDebug()`

Captures additional debugging information on test failure.

**Usage:**

```javascript
afterEach(function () {
  if (this.currentTest.state === 'failed') {
    cy.captureFailureDebug();
  }
});
```

#### `cy.logDebugInfo(label, data)`

Logs structured debug information during test execution.

**Parameters:**

- `label` (String): Debug label
- `data` (Any): Data to log

**Usage:**

```javascript
cy.logDebugInfo('Store State', storeData);
cy.logDebugInfo('API Response', response);
```

#### `cy.captureStoreState()`

Captures current Zustand store state for debugging.

**Returns:** Current store state

**Usage:**

```javascript
cy.captureStoreState().then(state => {
  expect(state.projects).to.have.length(2);
});
```

### 7. Validation Helpers

#### `cy.validateElement(elementId, expectations)`

Validates an element against expected properties.

**Parameters:**

- `elementId` (String): Element ID
- `expectations` (Object): Expected properties

**Usage:**

```javascript
cy.validateElement('gandalf_id', {
  name: 'Gandalf',
  type: 'character',
  completionPercentage: 75,
});
```

#### `cy.validateAccessibility()`

Runs accessibility checks on the current page.

**Usage:**

```javascript
cy.validateAccessibility();
```

#### `cy.validateResponsive()`

Validates responsive behavior across breakpoints.

**Usage:**

```javascript
cy.validateResponsive();
```

## 🎯 Usage Examples

### Complete Test Flow Example

```javascript
describe('Element Management Flow', () => {
  beforeEach(() => {
    // ! Mandatory debug setup
    cy.comprehensiveDebug();

    // * Clean state
    cy.cleanState();

    // * Setup test user
    cy.setupTestUser({
      username: 'fantasy_writer',
      projects: [{ name: 'Middle Earth' }],
    });
  });

  afterEach(function () {
    // ! Capture debug info on failure
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  it('should manage elements across devices', () => {
    // * Test across viewports
    cy.testResponsive(viewport => {
      // * Navigate to elements
      cy.navigateTo('/app/elements');

      // * Create element
      cy.createElement({
        name: 'Aragorn',
        type: 'character',
      });

      // * Fill questionnaire
      cy.fillQuestionnaire({
        appearance: 'Tall, dark-haired ranger',
        personality: 'Noble and brave',
      });

      // * Mobile-specific interactions
      if (viewport.name === 'mobile') {
        cy.simulateTouch('[data-cy="element-card"]', 'longPress');
        cy.get('[data-cy="context-menu"]').should('be.visible');
      }

      // * Validate element
      cy.validateElement('aragorn_id', {
        completionPercentage: 20,
      });
    });
  });
});
```

### Component Testing Example

```javascript
describe('ElementCard Component', () => {
  beforeEach(() => {
    cy.comprehensiveDebug();
  });

  it('should handle touch interactions', () => {
    const element = {
      id: 'test_123',
      name: 'Test Element',
      type: 'character',
      completionPercentage: 50,
    };

    cy.mount(
      <TestWrapper>
        <ElementCard element={element} />
      </TestWrapper>,
    );

    // * Test touch gestures
    cy.simulateTouch('[data-cy="element-card"]', 'tap');
    cy.get('[data-cy="element-editor"]').should('be.visible');

    cy.goBack();

    cy.simulateTouch('[data-cy="element-card"]', 'swipeLeft');
    cy.get('[data-cy="delete-option"]').should('be.visible');
  });
});
```

## 🔧 Implementation Guidelines

### Creating New Commands

1. **File Structure**: One command per file

```javascript
// cypress/support/commands/[category]/[commandName].js
```

2. **Documentation**: Include JSDoc comments

```javascript
/**
 * Brief description of command
 * @param {Type} param - Parameter description
 * @returns {Type} Return value description
 */
Cypress.Commands.add('commandName', param => {
  // Implementation
});
```

3. **Error Handling**: Always include error handling

```javascript
Cypress.Commands.add('safeCommand', param => {
  if (!param) {
    throw new Error('Parameter required');
  }

  try {
    // Command logic
  } catch (error) {
    cy.log(`Command failed: ${error.message}`);
    throw error;
  }
});
```

4. **React Native Considerations**: Handle platform differences

```javascript
Cypress.Commands.add('platformAwareCommand', () => {
  cy.window().then(win => {
    // React Native Web check
    if (win.Platform && win.Platform.OS === 'web') {
      // Web-specific logic
    }
  });
});
```

## 📝 Best Practices

### DO's ✅

1. Use descriptive command names
2. Return values when appropriate
3. Include comprehensive error messages
4. Document all parameters and return values
5. Use `cy.wrap()` for returning values
6. Handle both success and failure cases
7. Make commands idempotent when possible
8. Use data-cy selectors consistently
9. Include debug logging for complex operations
10. Test commands in isolation

### DON'Ts ❌

1. Don't use hardcoded waits
2. Don't include test assertions in commands
3. Don't modify global state unnecessarily
4. Don't catch errors without re-throwing
5. Don't use CSS selectors
6. Don't assume element existence
7. Don't mix concerns in single command
8. Don't ignore React Native platform differences
9. Don't skip error handling
10. Don't create overly complex commands

## 🚀 Performance Tips

1. **Batch Operations**: Combine related operations

```javascript
cy.setupCompleteTestEnvironment(); // Single command for full setup
```

2. **Lazy Loading**: Load data only when needed

```javascript
cy.getElement(id).then(element => {
  if (element.needsData) {
    cy.loadElementData(id);
  }
});
```

3. **Caching**: Cache expensive operations

```javascript
let cachedUser;
Cypress.Commands.add('getCachedUser', () => {
  if (cachedUser) return cy.wrap(cachedUser);
  return cy.setupTestUser().then(user => {
    cachedUser = user;
    return user;
  });
});
```

## 🔍 Debugging Commands

When commands fail, use these debugging techniques:

1. **Add Debug Logging**:

```javascript
cy.log('Command started', { param });
```

2. **Use Debug Mode**:

```javascript
Cypress.Commands.add('debugCommand', param => {
  if (Cypress.env('DEBUG')) {
    cy.pause(); // Pause for inspection
  }
  // Command logic
});
```

3. **Capture State**:

```javascript
cy.captureStoreState().then(state => {
  cy.log('Current state:', state);
});
```

## 📚 Further Reading

- [ADVANCED-TESTING-STRATEGY.md](./ADVANCED-TESTING-STRATEGY.md) - Complete testing strategy
- [REACT-NATIVE-PATTERNS.md](./REACT-NATIVE-PATTERNS.md) - React Native specific patterns
- [DEBUG-UTILITIES.md](./DEBUG-UTILITIES.md) - Debugging guide
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)

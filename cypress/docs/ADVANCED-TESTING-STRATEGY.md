# Advanced Cypress Testing Strategy for FantasyWritingApp

## 📚 Table of Contents
1. [Overview](#overview)
2. [Testing Philosophy](#testing-philosophy)
3. [Test Organization](#test-organization)
4. [Custom Commands Architecture](#custom-commands-architecture)
5. [Component Testing Strategy](#component-testing-strategy)
6. [E2E Testing Strategy](#e2e-testing-strategy)
7. [React Native Web Considerations](#react-native-web-considerations)
8. [Debugging & Error Handling](#debugging--error-handling)
9. [Performance & Optimization](#performance--optimization)
10. [Best Practices](#best-practices)

## Overview

This document outlines the comprehensive Cypress testing strategy for FantasyWritingApp, a React Native application tested through React Native Web. The patterns are derived from battle-tested approaches used in production applications, adapted specifically for React Native's unique requirements.

## Testing Philosophy

### Core Principles
1. **DRY (Don't Repeat Yourself)**: Modular, reusable test utilities
2. **User-Centric Testing**: Test actual user workflows, not implementation
3. **Comprehensive Coverage**: E2E for critical paths, components for UI logic
4. **Defensive Testing**: Mandatory debug utilities for failure analysis
5. **React Native First**: All patterns consider mobile-first development

### Testing Pyramid for React Native
```
        /\
       /E2E\      (15%) - Critical user journeys
      /------\
     /Component\  (35%) - UI components and interactions  
    /----------\
   /Unit Testing\ (50%) - Business logic, stores, utilities
  /--------------\
```

## Test Organization

### Directory Structure
```
cypress/
├── component/                # Component tests
│   ├── common/              # Shared components
│   ├── elements/            # Element-specific components
│   ├── projects/            # Project management components
│   └── navigation/          # Navigation components
├── e2e/                     # End-to-end tests
│   ├── elements/            # Element CRUD operations
│   ├── projects/            # Project workflows
│   ├── auth/                # Authentication flows
│   ├── navigation/          # App navigation
│   └── responsive/          # Responsive design tests
├── fixtures/                # Test data factories
│   ├── elements.json        # Element fixtures
│   ├── projects.json        # Project fixtures
│   └── users.json          # User fixtures
├── support/                 # Utilities and commands
│   ├── commands/           # Custom commands (organized by category)
│   │   ├── auth/          # Authentication commands
│   │   ├── elements/      # Element-specific commands
│   │   ├── debug/         # Debugging utilities
│   │   └── responsive/    # Viewport and responsive commands
│   ├── component-wrapper.jsx  # Component test wrapper
│   ├── test-helpers.js       # Shared utilities
│   └── commands.js           # Command aggregator
└── docs/                    # Testing documentation
```

### Test File Naming Convention
- **E2E Tests**: `[feature]-[action].cy.js`
  - Example: `element-creation.cy.js`, `project-management.cy.js`
- **Component Tests**: `[ComponentName].cy.jsx` or `[ComponentName].cy.tsx`
  - Example: `ElementCard.cy.jsx`, `ProjectList.cy.tsx`

### Test Structure Template
```javascript
/**
 * @fileoverview [Feature] [Test Type] Tests
 * Tests for US-X.X: [User Story Name]
 * 
 * User Story:
 * As a [user type]
 * I want to [action]
 * So that [benefit]
 * 
 * Acceptance Criteria:
 * - [Criterion 1]
 * - [Criterion 2]
 * - [Criterion 3]
 */

describe('[Feature Name]', () => {
  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();
    
    // * Clean state before each test
    cy.cleanState();
    
    // * Setup test user/data
    cy.setupTestData();
  });
  
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
  
  it('should [expected behavior]', () => {
    // * Arrange - Setup test conditions
    // * Act - Perform actions
    // * Assert - Verify outcomes
  });
});
```

## Custom Commands Architecture

### Command Categories

#### 1. Authentication Commands (`cypress/support/commands/auth/`)
```javascript
// cleanState.js - Reset application to clean state
Cypress.Commands.add('cleanState', () => {
  cy.window().then((win) => {
    // * Clear AsyncStorage (React Native Web)
    win.localStorage.clear();
    win.sessionStorage.clear();
    
    // * Clear IndexedDB for Zustand persistence
    if (win.indexedDB) {
      win.indexedDB.deleteDatabase('fantasy-writing-app');
    }
  });
  
  // * Clear cookies
  cy.clearCookies();
  cy.clearLocalStorage();
});

// setupTestUser.js - Create authenticated test user
Cypress.Commands.add('setupTestUser', (options = {}) => {
  const defaults = {
    username: 'test_user_' + Date.now(),
    email: `test_${Date.now()}@example.com`,
    projects: [],
    elements: []
  };
  
  const userData = { ...defaults, ...options };
  
  // * Set up Zustand store directly
  cy.window().then((win) => {
    const storeData = {
      auth: {
        user: userData,
        isAuthenticated: true
      },
      projects: userData.projects,
      elements: userData.elements
    };
    
    win.localStorage.setItem('fantasy-writing-app-store', JSON.stringify(storeData));
  });
  
  return cy.wrap(userData);
});
```

#### 2. Element Commands (`cypress/support/commands/elements/`)
```javascript
// createElement.js - Create test elements
Cypress.Commands.add('createElement', (elementData) => {
  const defaults = {
    id: 'element_' + Date.now(),
    name: 'Test Element',
    type: 'character',
    category: 'Characters',
    answers: {},
    relationships: [],
    completionPercentage: 0,
    createdAt: new Date().toISOString()
  };
  
  const element = { ...defaults, ...elementData };
  
  // * Add to store
  cy.window().then((win) => {
    const store = JSON.parse(win.localStorage.getItem('fantasy-writing-app-store') || '{}');
    store.elements = store.elements || [];
    store.elements.push(element);
    win.localStorage.setItem('fantasy-writing-app-store', JSON.stringify(store));
  });
  
  return cy.wrap(element);
});

// navigateToElement.js - Navigate to element editor
Cypress.Commands.add('navigateToElement', (elementId) => {
  cy.visit(`/app/elements/${elementId}`);
  cy.get('[data-cy="element-editor"]').should('be.visible');
});
```

#### 3. Debug Commands (`cypress/support/commands/debug/`)
```javascript
// comprehensiveDebug.js - Complete debug setup
Cypress.Commands.add('comprehensiveDebug', () => {
  const testInfo = {
    title: Cypress.currentTest.title,
    spec: Cypress.spec.name,
    timestamp: Date.now()
  };
  
  // * Arrays to store debug information
  const errors = [];
  const logs = [];
  const networkErrors = [];
  
  // ! Capture uncaught exceptions
  Cypress.on('uncaught:exception', (err) => {
    errors.push({
      timestamp: new Date().toISOString(),
      message: err.message,
      stack: err.stack,
      phase: 'execution'
    });
    
    // ? Don't fail test on uncaught exceptions during setup
    return false;
  });
  
  // ! Capture network failures
  cy.intercept('**', (req) => {
    req.on('response', (res) => {
      if (res.statusCode >= 400) {
        networkErrors.push({
          timestamp: new Date().toISOString(),
          url: req.url,
          method: req.method,
          statusCode: res.statusCode,
          phase: 'network'
        });
      }
    });
  });
  
  // ! Listen for console errors and warnings
  cy.window().then((win) => {
    const originalError = win.console.error;
    win.console.error = (...args) => {
      errors.push({
        timestamp: new Date().toISOString(),
        type: 'console_error',
        message: args.join(' ')
      });
      originalError.apply(win.console, args);
    };
    
    const originalWarn = win.console.warn;
    win.console.warn = (...args) => {
      logs.push({
        timestamp: new Date().toISOString(),
        type: 'console_warn',
        message: args.join(' ')
      });
      originalWarn.apply(win.console, args);
    };
  });
  
  // ! Set up failure capture
  cy.on('fail', (err) => {
    const failureData = {
      testInfo,
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack
      },
      errors,
      logs,
      networkErrors,
      summary: {
        totalErrors: errors.length,
        totalLogs: logs.length,
        totalNetworkErrors: networkErrors.length
      }
    };
    
    // * Save debug info
    const filename = `debug-${testInfo.spec}-${testInfo.timestamp}.json`;
    cy.writeFile(`cypress/debug-logs/${filename}`, failureData);
    
    // * Take screenshot
    cy.screenshot(`failure-${testInfo.title}-${testInfo.timestamp}`, {
      capture: 'fullPage'
    });
    
    throw err;
  });
});

// captureFailureDebug.js - Capture additional failure info
Cypress.Commands.add('captureFailureDebug', () => {
  // * Capture current state
  cy.window().then((win) => {
    const debugInfo = {
      url: win.location.href,
      localStorage: { ...win.localStorage },
      sessionStorage: { ...win.sessionStorage },
      viewport: {
        width: win.innerWidth,
        height: win.innerHeight
      }
    };
    
    console.log('Debug Info:', debugInfo);
  });
  
  // * Take failure screenshot
  cy.screenshot('test-failure', { capture: 'fullPage' });
});
```

#### 4. Responsive Commands (`cypress/support/commands/responsive/`)
```javascript
// testResponsive.js - Test multiple viewports
Cypress.Commands.add('testResponsive', (callback) => {
  const viewports = [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 }
  ];
  
  viewports.forEach(viewport => {
    cy.viewport(viewport.width, viewport.height);
    callback(viewport);
  });
});

// simulateTouch.js - Simulate touch interactions (React Native Web)
Cypress.Commands.add('simulateTouch', (selector, gesture) => {
  switch(gesture) {
    case 'tap':
      cy.get(selector).trigger('touchstart').trigger('touchend');
      break;
    case 'longPress':
      cy.get(selector).trigger('touchstart').wait(500).trigger('touchend');
      break;
    case 'swipeLeft':
      cy.get(selector)
        .trigger('touchstart', { touches: [{ clientX: 300, clientY: 100 }] })
        .trigger('touchmove', { touches: [{ clientX: 50, clientY: 100 }] })
        .trigger('touchend');
      break;
    case 'swipeRight':
      cy.get(selector)
        .trigger('touchstart', { touches: [{ clientX: 50, clientY: 100 }] })
        .trigger('touchmove', { touches: [{ clientX: 300, clientY: 100 }] })
        .trigger('touchend');
      break;
  }
});
```

## Component Testing Strategy

### Component Test Wrapper
```jsx
// cypress/support/component-wrapper.jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as StoreProvider } from '../src/store/Provider';

export const TestWrapper = ({ children, initialState = {} }) => {
  return (
    <StoreProvider initialState={initialState}>
      <NavigationContainer>
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#1a1a2e',
          color: 'white',
          padding: '20px'
        }}>
          {children}
        </div>
      </NavigationContainer>
    </StoreProvider>
  );
};
```

### Component Testing Patterns

#### 1. Testing All Component States
```javascript
describe('ElementCard Component', () => {
  it('should render all states correctly', () => {
    const states = [
      { completionPercentage: 0, expectedClass: 'empty-state' },
      { completionPercentage: 50, expectedClass: 'partial-state' },
      { completionPercentage: 100, expectedClass: 'complete-state' }
    ];
    
    states.forEach(state => {
      cy.mount(
        <TestWrapper>
          <ElementCard element={{ ...baseElement, ...state }} />
        </TestWrapper>
      );
      
      cy.get('[data-cy="element-card"]')
        .should('have.class', state.expectedClass);
    });
  });
});
```

#### 2. Testing Touch Interactions (React Native)
```javascript
describe('Touch Interactions', () => {
  it('should handle touch gestures', () => {
    cy.mount(
      <TestWrapper>
        <SwipeableElementList elements={mockElements} />
      </TestWrapper>
    );
    
    // * Test swipe to delete
    cy.simulateTouch('[data-cy="element-0"]', 'swipeLeft');
    cy.get('[data-cy="delete-button"]').should('be.visible');
    
    // * Test long press for options
    cy.simulateTouch('[data-cy="element-1"]', 'longPress');
    cy.get('[data-cy="context-menu"]').should('be.visible');
  });
});
```

#### 3. Testing React Native Components
```javascript
describe('React Native Components', () => {
  it('should handle ScrollView correctly', () => {
    cy.mount(
      <TestWrapper>
        <ScrollView testID="element-scroll">
          {elements.map(el => <ElementCard key={el.id} element={el} />)}
        </ScrollView>
      </TestWrapper>
    );
    
    // * React Native Web converts testID to data-cy
    cy.get('[data-cy="element-scroll"]').should('be.visible');
    cy.get('[data-cy="element-scroll"]').scrollTo('bottom');
  });
  
  it('should handle TextInput correctly', () => {
    cy.mount(
      <TestWrapper>
        <TextInput
          testID="element-name-input"
          placeholder="Enter element name"
        />
      </TestWrapper>
    );
    
    cy.get('[data-cy="element-name-input"]')
      .type('Dragon King')
      .should('have.value', 'Dragon King');
  });
});
```

## E2E Testing Strategy

### Critical User Journeys

#### 1. Element Creation Flow
```javascript
describe('Element Creation E2E', () => {
  it('should create a new character element', () => {
    // * Setup
    cy.setupTestUser();
    cy.visit('/app/elements');
    
    // * Create element
    cy.get('[data-cy="create-element-button"]').click();
    cy.get('[data-cy="element-type-select"]').select('character');
    cy.get('[data-cy="element-name-input"]').type('Aragorn');
    cy.get('[data-cy="save-element-button"]').click();
    
    // * Fill questionnaire
    cy.get('[data-cy="question-0-input"]').type('A ranger from the North');
    cy.get('[data-cy="question-1-input"]').type('To reclaim his throne');
    cy.get('[data-cy="save-answers-button"]').click();
    
    // * Verify creation
    cy.get('[data-cy="element-card"]').should('contain', 'Aragorn');
    cy.get('[data-cy="completion-percentage"]').should('contain', '20%');
  });
});
```

#### 2. Project Management Flow
```javascript
describe('Project Management E2E', () => {
  it('should manage multiple projects', () => {
    cy.setupTestUser();
    
    // * Create first project
    cy.createProject({ name: 'Lord of the Rings' });
    cy.createProject({ name: 'The Hobbit' });
    
    // * Switch projects
    cy.get('[data-cy="project-selector"]').select('The Hobbit');
    cy.get('[data-cy="active-project"]').should('contain', 'The Hobbit');
    
    // * Add elements to project
    cy.createElement({ name: 'Bilbo', projectId: 'the-hobbit' });
    cy.get('[data-cy="project-elements"]').should('contain', 'Bilbo');
  });
});
```

## React Native Web Considerations

### 1. Platform-Specific Testing
```javascript
// Test platform detection
cy.window().then((win) => {
  expect(win.Platform.OS).to.equal('web');
});

// Test React Native Web transformations
cy.get('[testID="my-component"]').should('not.exist');
cy.get('[data-cy="my-component"]').should('exist'); // testID becomes data-cy
```

### 2. AsyncStorage Testing
```javascript
// React Native AsyncStorage becomes localStorage in web
cy.window().then((win) => {
  // Set data
  win.localStorage.setItem('@FantasyApp:user', JSON.stringify(userData));
  
  // Get data
  const user = JSON.parse(win.localStorage.getItem('@FantasyApp:user'));
  expect(user).to.deep.equal(userData);
});
```

### 3. Navigation Testing
```javascript
// React Navigation testing
cy.get('[data-cy="navigate-to-elements"]').click();
cy.url().should('include', '/elements');

// Back navigation
cy.go('back');
cy.url().should('include', '/dashboard');
```

## Debugging & Error Handling

### Debug Output Structure
```
cypress/debug-logs/
├── comprehensive-debug-[spec]-[test]-[timestamp].json
├── failure-screenshots/
│   └── failure-[test]-[timestamp].png
└── summary-[date].json
```

### Debug Information Captured
1. **Test Context**: Test name, spec file, timestamp
2. **Errors**: Uncaught exceptions, console errors, assertion failures
3. **Network**: Failed requests, response codes, timeouts
4. **State**: localStorage, sessionStorage, store state
5. **Environment**: Viewport, URL, browser info
6. **Screenshots**: Full-page captures on failure

## Performance & Optimization

### 1. Parallel Execution
```bash
# Run component and E2E tests in parallel
npm run cypress:run -- --record --parallel
```

### 2. Test Data Factories
```javascript
// cypress/fixtures/factories.js
export const elementFactory = (overrides = {}) => ({
  id: `element_${Date.now()}`,
  name: 'Test Element',
  type: 'character',
  category: 'Characters',
  ...overrides
});

export const projectFactory = (overrides = {}) => ({
  id: `project_${Date.now()}`,
  name: 'Test Project',
  elements: [],
  ...overrides
});
```

### 3. Selective Test Running
```javascript
// Tag tests for selective execution
it('should handle large datasets @performance', () => {
  // Performance-critical test
});

// Run only performance tests
npm run cypress:run -- --env grep=@performance
```

## Best Practices

### DO's ✅
1. **Always use data-cy selectors** (testID for React Native components)
2. **Include comprehensive debug setup** in every test file
3. **Test user workflows**, not implementation details
4. **Clean state between tests** for isolation
5. **Document test purpose** with user stories
6. **Test responsive behavior** across viewports
7. **Capture failure context** for debugging
8. **Use factories** for test data generation
9. **Test touch interactions** for mobile experience
10. **Organize commands** by category

### DON'Ts ❌
1. **Never use CSS selectors** for element selection
2. **Don't use conditional logic** in tests (no if statements)
3. **Don't test external services** directly
4. **Avoid hardcoded waits** (use proper assertions)
5. **Don't skip error handling** in commands
6. **Never leave console.log** in test code
7. **Don't test implementation details**
8. **Avoid testing third-party components** in isolation
9. **Don't ignore test failures** without investigation
10. **Never commit sensitive data** in fixtures

## React Native Specific Patterns

### 1. Testing FlatList/ScrollView
```javascript
cy.get('[data-cy="element-list"]').within(() => {
  // Scroll to bottom
  cy.scrollTo('bottom');
  
  // Verify virtualization
  cy.get('[data-cy^="element-"]').should('have.length.at.least', 10);
});
```

### 2. Testing Modal/Overlay Components
```javascript
cy.get('[data-cy="open-modal-button"]').click();
cy.get('[data-cy="modal-backdrop"]').should('be.visible');
cy.get('[data-cy="modal-content"]').should('be.visible');

// Dismiss modal
cy.get('[data-cy="modal-backdrop"]').click({ force: true });
cy.get('[data-cy="modal-content"]').should('not.exist');
```

### 3. Testing Keyboard Interactions
```javascript
// React Native TextInput keyboard handling
cy.get('[data-cy="search-input"]')
  .type('dragon{enter}');
  
cy.get('[data-cy="search-results"]')
  .should('contain', 'Dragon');
```

## Conclusion

This comprehensive testing strategy ensures robust, maintainable tests for the FantasyWritingApp. By following these patterns and best practices, the test suite will provide confidence in the application's functionality across all platforms while maintaining excellent debugging capabilities and performance.
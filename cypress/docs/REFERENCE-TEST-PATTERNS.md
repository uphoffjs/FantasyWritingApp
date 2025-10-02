# Cypress Test Patterns Reference

**Purpose**: This document contains reference test patterns and examples for writing Cypress tests in the Fantasy Writing App. These are not actual tests to be run, but examples demonstrating proper test structure, custom commands, and testing patterns.

**Created**: 2025-10-02
**Status**: Reference Documentation Only

---

## Table of Contents

- [Basic Test Structure](#basic-test-structure)
- [Custom Command Verification](#custom-command-verification)
- [Authentication Patterns](#authentication-patterns)
- [Element Editor Integration](#element-editor-integration)
- [Navigation and Routing](#navigation-and-routing)
- [Project CRUD Operations](#project-crud-operations)
- [Element Full Workflow](#element-full-workflow)

---

## Basic Test Structure

### Simple Page Load Test

```typescript
describe('Simple Test', () => {
  it('should load the login page', () => {
    cy.visit('/');
    cy.url().should('include', '/login');
  });
});
```

### Testing Command Existence

```typescript
it('should use createProject command if available', () => {
  // Check if custom command exists
  const commandExists = typeof cy.createProject === 'function';
  cy.log(`createProject command exists: ${commandExists}`);

  cy.visit('/');
});
```

---

## Custom Command Verification

### Testing clearLocalStorage Command

```typescript
it('should verify clearLocalStorage command works', () => {
  // Set data in localStorage
  cy.window().then(win => {
    win.localStorage.setItem('test-key', 'test-value');
  });

  // Clear using custom command
  cy.clearLocalStorage();

  // Verify cleared
  cy.window().then(win => {
    expect(win.localStorage.length).to.equal(0);
  });
});
```

### Testing setupAuth Function

```typescript
import { setupAuth, clearAuth } from '../../support/test-helpers';

it('should verify setupAuth function works', () => {
  cy.clearLocalStorage();

  // Call setupAuth
  setupAuth();

  // Verify auth data was set
  cy.window().then(win => {
    const authToken = win.localStorage.getItem('supabase.auth.token');
    expect(authToken).to.not.be.null;

    const parsed = JSON.parse(authToken!);
    expect(parsed).to.have.property('access_token', 'mock-jwt-token');
    expect(parsed).to.have.property('user');
    expect(parsed.user).to.have.property('email', 'test@example.com');
  });
});
```

### Testing setupAuth with Custom User Data

```typescript
it('should verify setupAuth with custom user data', () => {
  cy.clearLocalStorage();

  // Call setupAuth with custom data
  setupAuth({
    user: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
    },
  });

  // Verify custom data was set
  cy.window().then(win => {
    const authToken = win.localStorage.getItem('supabase.auth.token');
    const parsed = JSON.parse(authToken!);
    expect(parsed.user).to.have.property('email', 'admin@example.com');
    expect(parsed.user).to.have.property('name', 'Admin User');
    expect(parsed.user).to.have.property('role', 'admin');
  });
});
```

### Testing clearAuth Function

```typescript
it('should verify clearAuth function works', () => {
  // Set up auth first
  setupAuth();

  // Verify auth is set
  cy.window().then(win => {
    expect(win.localStorage.getItem('supabase.auth.token')).to.not.be.null;
  });

  // Clear auth
  clearAuth();

  // Verify auth is cleared
  cy.window().then(win => {
    expect(win.localStorage.getItem('supabase.auth.token')).to.be.null;
    expect(win.localStorage.getItem('worldbuilding-user')).to.be.null;
    expect(win.localStorage.getItem('worldbuilding-authenticated')).to.be.null;
  });
});
```

### Testing setupTestEnvironment Command

```typescript
it('should verify setupTestEnvironment command works', () => {
  // Add data to localStorage
  cy.window().then(win => {
    win.localStorage.setItem('test-data', 'some value');
  });

  // Call setupTestEnvironment
  cy.setupTestEnvironment();

  // Verify localStorage was cleared and offline mode set
  cy.window().then(win => {
    expect(win.localStorage.getItem('test-data')).to.be.null;
    expect(
      win.localStorage.getItem('fantasy-element-builder-offline-mode'),
    ).to.equal('true');
  });
});
```

---

## Authentication Patterns

### Authenticated User Tests

```typescript
describe('Authenticated User Tests', () => {
  beforeEach(() => {
    // Setup test environment with auth
    cy.setupTestEnvironment();
    setupAuth();
    cy.visit('/projects');
    // Wait for page to load properly
    cy.url().should('include', '/projects');
  });

  it('should show authenticated user interface', () => {
    cy.url().should('include', '/projects');

    // Get started button should be visible for new users
    cy.get('[data-cy="get-started"]').should('be.visible');
  });

  it('should allow creating a project as authenticated user', () => {
    // Click get started
    cy.get('[data-cy="get-started"]').click();

    // Fill in project details
    cy.get('[data-cy="project-name"]').type('My Fantasy World');
    cy.get('[data-cy="project-description"]').type(
      'A world of magic and adventure',
    );
    cy.get('[data-cy="submit"]').click();

    // Verify project was created
    cy.get('[data-cy="project-card"]').should('contain', 'My Fantasy World');
  });

  it('should persist auth state across page reloads', () => {
    // Create a project
    cy.get('[data-cy="get-started"]').click();
    cy.get('[data-cy="project-name"]').type('Test Project');
    cy.get('[data-cy="submit"]').click();

    // Reload the page
    cy.reload();

    // Auth state should persist, project should still be visible
    cy.get('[data-cy="project-card"]').should('contain', 'Test Project');
  });
});
```

### Different User Roles

```typescript
describe('Different User Roles', () => {
  it('should mock admin user', () => {
    cy.setupTestEnvironment();
    setupAuth({
      user: {
        email: 'admin@example.com',
        role: 'admin',
        name: 'Admin User',
      },
    });
    cy.visit('/projects');
    cy.url().should('include', '/projects');
  });

  it('should mock developer user', () => {
    cy.setupTestEnvironment();
    setupAuth({
      user: {
        email: 'dev@example.com',
        role: 'developer',
        name: 'Developer User',
      },
    });
    cy.visit('/projects');
    cy.url().should('include', '/projects');
  });
});
```

### Logged Out State

```typescript
describe('Logged Out State', () => {
  beforeEach(() => {
    // Clear everything and don't set auth
    cy.window().then(win => {
      win.localStorage.clear();
    });
    cy.visit('/');
  });

  it('should redirect to login when not authenticated', () => {
    // Should be redirected to login
    cy.url().should('include', '/login');
  });
});
```

### Switching Between Users

```typescript
it('should switch from regular user to admin', () => {
  // Start as regular user
  cy.setupTestEnvironment();
  setupAuth({
    user: { email: 'user@example.com', role: 'user' },
  });
  cy.visit('/projects');
  cy.url().should('include', '/projects');

  // Create a project
  cy.get('[data-cy="get-started"]').click();
  cy.get('[data-cy="project-name"]').type('User Project');
  cy.get('[data-cy="submit"]').click();

  // Clear auth and switch to admin
  clearAuth();
  setupAuth({
    user: { email: 'admin@example.com', role: 'admin' },
  });
  cy.reload();

  // Projects are stored locally, so admin sees same projects
  cy.get('[data-cy="project-card"]').should('contain', 'User Project');
});
```

### Supabase API Mocking

```typescript
describe('Supabase API Mocking', () => {
  it('should intercept Supabase API calls', () => {
    cy.setupTestEnvironment();
    setupAuth(); // Sets up API mocks by default
    cy.visit('/projects');
    cy.url().should('include', '/projects');

    // Create a project (will use mocked API if needed)
    cy.get('[data-cy="get-started"]').click();
    cy.get('[data-cy="project-name"]').type('API Test Project');
    cy.get('[data-cy="submit"]').click();

    // Verify the project appears
    cy.get('[data-cy="project-card"]').should('contain', 'API Test Project');
  });

  it('should work without Supabase mocking', () => {
    // Only set localStorage, don't mock API calls
    cy.setupTestEnvironment();
    setupAuth({ skipSupabase: true });
    cy.visit('/projects');
    cy.url().should('include', '/projects');

    // Should still work with offline mode
    cy.get('[data-cy="get-started"]').should('be.visible');
  });
});
```

---

## Element Editor Integration

### Setup for Element Editor Tests

```typescript
beforeEach(() => {
  // Setup test environment
  cy.setupTestEnvironment();
  setupAuth();
  cy.visit('/projects');
  cy.url().should('include', '/projects');

  // Create a project through the UI
  cy.get('[data-cy="get-started"], [data-cy="create-project"]').first().click();
  cy.get('[data-cy="project-name"]').type('Test World');
  cy.get('[data-cy="project-description"]').type('A test fantasy world');
  cy.get('[data-cy="submit"]').click();

  // Wait for project to be created
  cy.get('[data-cy="project-card"]').should('contain', 'Test World');
});
```

### Navigate and Show Element Creation

```typescript
it('should navigate to project and show element creation button', () => {
  // Navigate to the project
  cy.get('[data-cy="project-card"]').first().click();

  // Should show create element button
  cy.get('[data-cy="create-element-button"], button')
    .contains(/New Element|Create Element/i)
    .should('be.visible');
});
```

### Open Create Element Modal

```typescript
it('should open create element modal when clicking create button', () => {
  // Navigate to the project
  cy.get('[data-cy="project-card"]').first().click();

  // Click create element button
  cy.get('[data-cy="create-element-button"], button')
    .contains(/New Element|Create Element/i)
    .click();

  // Modal should be visible with category selection
  cy.contains('[data-cy*="category"], button', 'Character').should(
    'be.visible',
  );
  cy.contains('[data-cy*="category"], button', 'Location').should('be.visible');
});
```

---

## Navigation and Routing

### Setup for Navigation Tests

```typescript
beforeEach(() => {
  cy.setupTestEnvironment();
  setupAuth();
  cy.visit('/projects');
  cy.url().should('include', '/projects');

  // Create a project through the UI
  cy.get('[data-cy="get-started"], [data-cy="create-project"]').first().click();
  cy.get('[data-cy="project-name"]').type('Navigation Test World');
  cy.get('[data-cy="project-description"]').type('Testing navigation features');
  cy.get('[data-cy="submit"]').click();

  cy.get('[data-cy="project-card"]').should('contain', 'Navigation Test World');
});
```

### Basic Navigation Between Views

```typescript
it('should navigate between project list and project view', () => {
  // Navigate to project
  cy.get('[data-cy="project-card"]').first().click();
  cy.url().should('include', '/project/');

  // Navigate back using browser back
  cy.go('back');
  cy.url().should('include', '/projects');
  cy.get('[data-cy="project-card"]').should('exist');
});
```

### Direct URL Navigation

```typescript
it('should navigate between project list and project view using URL', () => {
  // Get project ID from the card
  cy.get('[data-cy="project-card"]').first().click();

  // Store the URL
  cy.url().then(projectUrl => {
    // Go back to projects
    cy.visit('/projects');
    cy.get('[data-cy="project-card"]').should('exist');

    // Navigate directly to project using URL
    cy.visit(projectUrl);
    cy.url().should('include', '/project/');
  });
});
```

### State Persistence After Refresh

```typescript
it('should maintain navigation state after page refresh', () => {
  // Navigate to project
  cy.get('[data-cy="project-card"]').first().click();
  cy.url().should('include', '/project/');

  // Refresh the page
  cy.reload();

  // Should still be on the project page
  cy.url().should('include', '/project/');
});
```

### Deep Linking

```typescript
it('should handle deep linking to projects', () => {
  // Get project card and extract ID
  cy.get('[data-cy="project-card"]')
    .first()
    .then($card => {
      // Navigate to project to get the URL
      cy.wrap($card).click();

      cy.url().then(url => {
        // Extract project ID from URL
        const projectId = url.split('/project/')[1];

        // Navigate away
        cy.visit('/projects');

        // Deep link directly to the project
        cy.visit(`/project/${projectId}`);

        // Should load the project
        cy.url().should('include', `/project/${projectId}`);
      });
    });
});
```

### Browser Button Navigation

```typescript
it('should handle navigation with browser buttons', () => {
  // Start at projects list
  cy.url().should('include', '/projects');

  // Navigate to project
  cy.get('[data-cy="project-card"]').first().click();
  cy.url().should('include', '/project/');

  // Use browser back button
  cy.go('back');
  cy.url().should('include', '/projects');

  // Use browser forward button
  cy.go('forward');
  cy.url().should('include', '/project/');
});
```

### Authentication Redirect

```typescript
it('should redirect to login when not authenticated', () => {
  // Clear auth
  cy.window().then(win => {
    win.localStorage.clear();
  });

  // Try to visit projects page
  cy.visit('/projects');

  // Should redirect to login
  cy.url().should('include', '/login');
});
```

---

## Project CRUD Operations

### Create First Project

```typescript
describe('Project Creation', () => {
  beforeEach(() => {
    cy.setupTestEnvironment();
    setupAuth();
    cy.visit('/projects');
    cy.url().should('include', '/projects');
  });

  it('should allow user to create their first project', () => {
    cy.url().should('include', '/projects');

    // Click Get Started button
    cy.get('[data-cy="get-started"]').should('be.visible').click();

    // Verify modal opens
    cy.get('[data-cy="create-project-modal"]').should('be.visible');

    // Fill in project details
    const projectName = 'My Fantasy World';
    const projectDescription = 'A world of magic and adventure';

    cy.get('[data-cy="project-name"]').type(projectName);
    cy.get('[data-cy="project-description"]').type(projectDescription);

    // Submit the form
    cy.get('[data-cy="submit"]').click();

    // Verify modal closes
    cy.get('[data-cy="create-project-modal"]').should('not.exist');

    // Verify project appears in list
    cy.get('[data-cy="project-card"]')
      .should('contain', projectName)
      .and('contain', projectDescription);

    // Verify persistence after reload
    cy.reload();
    cy.get('[data-cy="project-card"]')
      .should('contain', projectName)
      .and('contain', projectDescription);
  });
});
```

### Form Validation

```typescript
it('should validate required fields when creating a project', () => {
  cy.get('[data-cy="get-started"]').click();

  // Submit button should be disabled without required fields
  cy.get('[data-cy="submit"]').should('be.disabled');

  // Type and clear to trigger validation
  cy.get('[data-cy="project-name"]').type(' ');
  cy.get('[data-cy="project-name"]').clear();

  // Submit button should still be disabled
  cy.get('[data-cy="submit"]').should('be.disabled');

  // Fill in name and submit
  cy.get('[data-cy="project-name"]').type('Test Project');
  cy.get('[data-cy="submit"]').click();

  // Project created successfully
  cy.get('[data-cy="create-project-modal"]').should('not.exist');
  cy.get('[data-cy="project-card"]').should('contain', 'Test Project');
});
```

### Error Handling

```typescript
it('should handle project creation errors gracefully', () => {
  // Mock a server error
  cy.intercept('POST', '**/rest/v1/projects', {
    statusCode: 500,
    body: { error: 'Internal server error' },
  }).as('createProjectError');

  // Try to create a project
  cy.get('[data-cy="get-started"]').click();
  cy.get('[data-cy="project-name"]').type('Failed Project');
  cy.get('[data-cy="submit"]').click();

  // Since we're using localStorage, project should still be created
  cy.get('[data-cy="create-project-modal"]').should('not.exist');
  cy.get('[data-cy="project-card"]').should('contain', 'Failed Project');
});
```

### Cancel Project Creation

```typescript
it('should allow canceling project creation', () => {
  // Open modal
  cy.get('[data-cy="get-started"]').click();

  // Type some data
  cy.get('[data-cy="project-name"]').type('Cancelled Project');

  // Click cancel
  cy.get('[data-cy="cancel"]').click();

  // Modal closes without creating project
  cy.get('[data-cy="create-project-modal"]').should('not.exist');

  // Back at welcome screen
  cy.get('[data-cy="get-started"]').should('be.visible');
});
```

### Create Additional Projects

```typescript
describe('Project Creation - With Existing Projects', () => {
  beforeEach(() => {
    cy.window().then(win => {
      win.localStorage.clear();
    });

    setupAuth();
    cy.visit('/projects');
    cy.url().should('include', '/projects');

    // Create first project
    cy.get('[data-cy="get-started"]').click();
    cy.get('[data-cy="project-name"]').type('Existing Project');
    cy.get('[data-cy="project-description"]').type('A test project');
    cy.get('[data-cy="submit"]').click();

    cy.get('[data-cy="project-card"]').should('contain', 'Existing Project');
  });

  it('should show create project button when projects exist', () => {
    // Should see existing project
    cy.get('[data-cy="project-card"]').should('contain', 'Existing Project');

    // Should have create project button (multiple variants)
    cy.get('[data-cy="create-project"], [data-cy="fab-create-project"]')
      .first()
      .should('be.visible');

    // Test clicking opens modal
    cy.get('[data-cy="create-project"], [data-cy="fab-create-project"]')
      .first()
      .click();

    cy.get('[data-cy="create-project-modal"]').should('be.visible');
  });
});
```

---

## Element Full Workflow

### Setup with Factory Reset

```typescript
beforeEach(() => {
  // Setup test environment
  cy.task('factory:reset');
  cy.visit('/');

  // Create a test project first
  cy.get('[data-cy="get-started"], [data-cy="create-project-button"]')
    .first()
    .click();
  cy.get('[data-cy="project-name-input"]').type('Test Fantasy World');
  cy.get('[data-cy="project-description-input"]').type('E2E test world');
  cy.get('[data-cy="project-submit"]').click();

  // Navigate to project
  cy.contains('Test Fantasy World').should('be.visible');
  cy.get('[data-cy="project-card"]').contains('Test Fantasy World').click();

  cy.url().should('include', '/project');
});
```

### Create Character with Form Filling

```typescript
it('creates a character element with complete form filling', () => {
  // Click create element button
  cy.get('[data-cy="create-element-button"]').click();

  // Select Character category
  cy.get('[data-cy="category-character"]').click();

  // Fill in basic information
  cy.get('[data-cy="element-name-input"]').type('Gandalf the Grey');
  cy.get('[data-cy="element-description-input"]').type(
    'A wise wizard and member of the Fellowship',
  );

  // Submit the creation form
  cy.get('[data-cy="create-element-submit"]').click();

  // Should redirect to element editor
  cy.url().should('include', '/element');

  // Verify element was created
  cy.contains('Gandalf the Grey').should('be.visible');

  // Check that BaseElementForm is rendered
  cy.get('[data-cy="base-element-form"]').should('be.visible');

  // Expand a category to fill in questions
  cy.get('[data-cy="category-toggle-general"]').click();

  // Fill in answers (testing answer persistence)
  cy.get('[data-cy="question-name-input"]').clear();
  cy.get('[data-cy="question-name-input"]').type('Gandalf Stormcrow');
  cy.get('[data-cy="question-age-input"]').type('2000');

  // Check that changes are auto-saved
  cy.get('[data-cy="question-name-input"]').should(
    'have.value',
    'Gandalf Stormcrow',
  );

  // Navigate away and back to verify persistence
  cy.go('back');
  cy.contains('Gandalf the Grey').click();

  // Verify answers were persisted
  cy.get('[data-cy="category-toggle-general"]').click();
  cy.get('[data-cy="question-name-input"]').should(
    'have.value',
    'Gandalf Stormcrow',
  );
  cy.get('[data-cy="question-age-input"]').should('have.value', '2000');
});
```

### Different Question Types

```typescript
it('handles different question types in forms', () => {
  // Create element with various question types
  cy.get('[data-cy="create-element-button"]').click();
  cy.get('[data-cy="category-magic"]').click();
  cy.get('[data-cy="element-name-input"]').type('Fire Magic System');
  cy.get('[data-cy="create-element-submit"]').click();

  // Test different question types
  cy.get('[data-cy="category-toggle-details"]').click();

  // Text input
  cy.get('[data-cy="question-source-input"]').type('Ancient dragon teachings');

  // Number input
  cy.get('[data-cy="question-power-level-input"]').type('9');

  // Select dropdown
  cy.get('[data-cy="question-rarity-select"]').select('Rare');

  // Boolean/checkbox
  cy.get('[data-cy="question-requires-training-toggle"]').click();

  // Textarea
  cy.get('[data-cy="question-description-input"]').type(
    'A powerful and dangerous form of magic',
  );

  // Verify all inputs retained values
  cy.get('[data-cy="question-source-input"]').should(
    'have.value',
    'Ancient dragon teachings',
  );
  cy.get('[data-cy="question-power-level-input"]').should('have.value', '9');
  cy.get('[data-cy="question-rarity-select"]').should('have.value', 'Rare');
  cy.get('[data-cy="question-requires-training-toggle"]').should('be.checked');
});
```

### Edit Element Information

```typescript
it('edits element basic information', () => {
  // Create element first
  cy.get('[data-cy="create-element-button"]').click();
  cy.get('[data-cy="category-character"]').click();
  cy.get('[data-cy="element-name-input"]').type('Frodo Baggins');
  cy.get('[data-cy="element-description-input"]').type('Ring bearer');
  cy.get('[data-cy="create-element-submit"]').click();

  // Edit the element
  cy.get('[data-cy="element-header-edit"]').click();
  cy.get('[data-cy="element-name-edit-input"]').clear();
  cy.get('[data-cy="element-name-edit-input"]').type(
    'Frodo Baggins of the Shire',
  );
  cy.get('[data-cy="element-description-edit-input"]').clear();
  cy.get('[data-cy="element-description-edit-input"]').type(
    'Ring bearer and hero of Middle-earth',
  );
  cy.get('[data-cy="element-header-save"]').click();

  // Verify changes
  cy.contains('Frodo Baggins of the Shire').should('be.visible');
  cy.contains('Ring bearer and hero of Middle-earth').should('be.visible');
});
```

### Track Completion Percentage

```typescript
it('tracks completion percentage', () => {
  // Create element
  cy.get('[data-cy="create-element-button"]').click();
  cy.get('[data-cy="category-character"]').click();
  cy.get('[data-cy="element-name-input"]').type('Frodo Baggins');
  cy.get('[data-cy="create-element-submit"]').click();

  // Check initial completion
  cy.get('[data-cy="completion-percentage"]').then($el => {
    const initialCompletion = parseInt($el.text(), 10);

    // Fill in some questions
    cy.get('[data-cy="category-toggle-general"]').click();
    cy.get('[data-cy="question-name-input"]').type('Frodo');
    cy.get('[data-cy="question-age-input"]').type('50');

    // Completion should increase
    cy.get('[data-cy="completion-percentage"]').then($newEl => {
      const newCompletion = parseInt($newEl.text(), 10);
      expect(newCompletion).to.be.greaterThan(initialCompletion);
    });
  });
});
```

---

## Best Practices Summary

### 1. Test Structure

- Use descriptive `describe` and `it` blocks
- Keep tests focused on single functionality
- Use proper `beforeEach` for common setup

### 2. Selectors

- **Always use `data-cy` attributes** for selectors
- Never use class names, IDs, or tag names
- Use descriptive data-cy values: `data-cy="create-project-button"`

### 3. Assertions

- Use proper Cypress assertions: `.should('be.visible')`
- Wait for elements with assertions, not `cy.wait()`
- Verify state changes after actions

### 4. Command Chains

- **Avoid unsafe chains**: Don't chain `.clear().type()`
- Split into separate commands:

  ```typescript
  // Bad
  cy.get('[data-cy="input"]').clear().type('text');

  // Good
  cy.get('[data-cy="input"]').clear();
  cy.get('[data-cy="input"]').type('text');
  ```

### 5. Custom Commands

- Use `setupAuth()` for authentication setup
- Use `clearAuth()` to clear authentication
- Use `cy.setupTestEnvironment()` to reset state

### 6. Page Navigation

- Use `cy.url().should('include', '/path')` to verify navigation
- Don't use `cy.wait()` for page loads
- Use URL assertions for page load verification

### 7. Data Persistence

- Test data persistence across page reloads
- Verify localStorage state when needed
- Test both online and offline modes

### 8. Error Handling

- Mock API errors with `cy.intercept()`
- Test graceful failure scenarios
- Verify error messages are displayed

---

## Related Documentation

- [QUICK-TEST-REFERENCE.md](./QUICK-TEST-REFERENCE.md) - Quick test writing guide
- [CYPRESS-COMPLETE-REFERENCE.md](../claudedocs/CYPRESS-COMPLETE-REFERENCE.md) - Complete Cypress reference
- [cypress-best-practices.md](./cypress-best-practices.md) - Comprehensive best practices
- [CUSTOM-COMMANDS-REFERENCE.md](./CUSTOM-COMMANDS-REFERENCE.md) - Custom command documentation

---

**Note**: These patterns are for reference only. For actual test implementation, see the [QUICK-TEST-REFERENCE.md](./QUICK-TEST-REFERENCE.md) guide and use the mandatory test template.

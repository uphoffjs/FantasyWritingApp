# Writing and Organizing Tests - TypeScript Guide

**Official Reference**: [Cypress.io - Writing and Organizing Tests](https://docs.cypress.io/app/core-concepts/writing-and-organizing-tests)

> This guide provides comprehensive coverage of Cypress test organization patterns with TypeScript-specific examples for the FantasyWritingApp project.

---

## 🚨 MANDATORY PROJECT REQUIREMENTS

**Every Cypress test file in this project MUST follow these three rules:**

### Rule 1: One `describe()` Block Per File

Each test file should contain exactly **ONE** top-level `describe()` block. This keeps test files focused on a single feature or functionality.

### Rule 2: Required `beforeEach()` Hook

Every `describe()` block **MUST** start with this exact `beforeEach()` hook:

```typescript
beforeEach(() => {
  // Clear cookies and local storage before each test to ensure a clean state
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.comprehensiveDebugWithBuildCapture(); // Capture build info for debugging
  cy.comprehensiveDebug(); // Ensure debug capture is active
});
```

### Rule 3: Multiple Tests Allowed

You can and should have multiple `it()` test cases inside the single `describe()` block to test different aspects of the feature.

### Quick Example

```typescript
// ✅ CORRECT Structure
describe('Feature Name', () => {
  // MANDATORY beforeEach first
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.comprehensiveDebugWithBuildCapture();
    cy.comprehensiveDebug();
  });

  // Multiple tests allowed
  it('does thing A', () => {
    /* ... */
  });
  it('does thing B', () => {
    /* ... */
  });
  it('does thing C', () => {
    /* ... */
  });
});
```

---

## Table of Contents

1. [Folder Structure](#folder-structure)
2. [Spec Files](#spec-files)
3. [Writing Your First Test](#writing-your-first-test)
4. [Test Structure](#test-structure)
5. [Hooks](#hooks)
6. [Excluding and Including Tests](#excluding-and-including-tests)
7. [Dynamically Generate Tests](#dynamically-generate-tests)
8. [Test Configuration](#test-configuration)
9. [Running Tests](#running-tests)
10. [TypeScript Support](#typescript-support)
11. [Project-Specific Patterns](#project-specific-patterns)

---

## Folder Structure

Cypress automatically scaffolds a suggested folder structure when you initialize your project. By default, it creates the following directories:

```
cypress/
├── e2e/                      # End-to-end test specs
│   ├── login-page/          # Feature-based organization
│   │   └── verify-login-page.cy.ts
│   ├── elements/
│   │   ├── create-element.cy.ts
│   │   └── element-list.cy.ts
│   └── projects/
│       └── project-management.cy.ts
├── fixtures/                 # Static test data
│   ├── users.json
│   ├── elements.json
│   └── projects.json
├── support/                  # Reusable test code
│   ├── commands.ts          # Custom commands
│   ├── e2e.ts              # E2E test configuration
│   └── component.ts        # Component test configuration
└── downloads/               # Downloaded files during tests
```

### Directory Purpose

**`cypress/e2e/`**: Contains your end-to-end test specification files. This is where you write tests that simulate user interactions with your application.

**`cypress/fixtures/`**: Stores external pieces of static data that can be used by your tests. Fixtures are typically JSON files but can be other file types.

**`cypress/support/`**: Contains reusable behavior such as custom commands or global overrides that you want to apply and make available to all your spec files.

**`cypress/downloads/`**: Stores files downloaded during test execution (automatic).

### Configuring Folder Structure

You can customize the folder structure in your `cypress.config.ts` file:

```typescript
// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.{ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    downloadsFolder: 'cypress/downloads',
  },
  component: {
    specPattern: 'cypress/component/**/*.cy.{ts,tsx}',
    supportFile: 'cypress/support/component.ts',
  },
});
```

---

## Spec Files

Spec files are test files that contain your test suites and test cases. Cypress supports several file extensions:

### Supported Extensions

- `.ts` - TypeScript (recommended for this project)
- `.tsx` - TypeScript with JSX
- `.js` - JavaScript
- `.jsx` - JavaScript with JSX
- `.coffee` - CoffeeScript
- `.cjsx` - CoffeeScript with JSX

### File Naming Convention

Cypress looks for spec files with specific patterns. By default:

```typescript
// Default pattern
'**/*.cy.{ts,tsx,js,jsx}';

// Example spec file names
login - page.cy.ts;
element - creation.cy.ts;
project - management.cy.tsx;
```

### Creating Your First Spec

```typescript
// cypress/e2e/my-first-test.cy.ts
describe('My First Test', () => {
  it('visits the app', () => {
    cy.visit('/');
  });
});
```

---

## Writing Your First Test

### Basic Test Structure

A Cypress test follows a simple pattern using Mocha's BDD (Behavior-Driven Development) syntax:

```typescript
// cypress/e2e/login-page/verify-login-page.cy.ts
describe('Login Page', () => {
  it('should display the login form', () => {
    // Arrange - Set up test conditions
    cy.visit('/login');

    // Act - Perform actions (if needed)
    // (In this case, just visiting is the action)

    // Assert - Verify expected outcomes
    cy.get('[data-cy="login-form"]').should('be.visible');
    cy.get('[data-cy="email-input"]').should('exist');
    cy.get('[data-cy="password-input"]').should('exist');
    cy.get('[data-cy="login-button"]').should('be.visible');
  });
});
```

### Understanding Test Structure

**`describe()`**: Defines a test suite - a group of related tests. You can nest `describe()` blocks to organize tests hierarchically.

**`it()`**: Defines an individual test case. Each `it()` block should test one specific behavior.

**`cy.visit()`**: Navigates to a URL in your application.

**`cy.get()`**: Queries the DOM for elements.

**`.should()`**: Creates an assertion about the selected element.

---

## Test Structure

### Using `describe()` for Test Suites

Use `describe()` to define a test suite - a group of related tests:

```typescript
// cypress/e2e/elements/element-management.cy.ts
describe('Element Management', () => {
  // ! MANDATORY beforeEach
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.comprehensiveDebugWithBuildCapture();
    cy.comprehensiveDebug();
  });

  it('should create a character element', () => {
    cy.visit('/elements/new');
    cy.get('[data-cy="element-type-select"]').select('character');
    cy.get('[data-cy="element-name-input"]').type('Aria Stormblade');
    cy.get('[data-cy="save-element-button"]').click();
    cy.get('[data-cy="success-message"]').should('contain', 'Element created');
  });

  it('should edit a character element', () => {
    // Test implementation
  });

  it('should create a location element', () => {
    // Test implementation
  });
});
```

### Using `it()` for Individual Tests

Use `it()` to define individual test cases within a `describe()` block:

```typescript
describe('Element Creation', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.comprehensiveDebugWithBuildCapture();
    cy.comprehensiveDebug();
  });

  it('creates an element with valid data', () => {
    // Test implementation
  });

  it('validates required fields before saving', () => {
    // Test implementation
  });
});
```

### ⚠️ DO NOT USE: `context()` and `specify()`

**Mocha provides aliases that we DO NOT use in this project:**

- ❌ **`context()`** - Alias for `describe()` - DO NOT USE
- ❌ **`specify()`** - Alias for `it()` - DO NOT USE

**Why we don't use them:**

- Creates inconsistency in the codebase
- No functional benefit over `describe()` and `it()`
- Our project rule: ONE `describe()` per file eliminates need for nested contexts
- Simpler is better - stick to `describe()` and `it()`

```typescript
// ❌ WRONG: Using context() and specify()
describe('Element Management', () => {
  context('Character Elements', () => {
    // DON'T USE context()
    specify('creates character', () => {
      // DON'T USE specify()
      // Test implementation
    });
  });
});

// ✅ CORRECT: Using describe() and it() only
describe('Element Management', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.comprehensiveDebugWithBuildCapture();
    cy.comprehensiveDebug();
  });

  it('creates character element', () => {
    // Test implementation
  });

  it('creates location element', () => {
    // Test implementation
  });
});
```

---

## Hooks

Hooks allow you to set up conditions before or after tests run. Cypress provides four hooks from Mocha:

### Available Hooks

**`before()`**: Runs once before all tests in the block
**`beforeEach()`**: Runs before each test in the block
**`afterEach()`**: Runs after each test in the block
**`after()`**: Runs once after all tests in the block

### 🚨 MANDATORY: Project Requirements

**Every test file MUST follow these rules:**

1. ✅ **One `describe()` block per file** - Each test file should have exactly ONE top-level `describe()` block
2. ✅ **Multiple tests allowed** - You can have multiple `it()` tests inside the single `describe()` block
3. ✅ **Required `beforeEach()` hook** - Every `describe()` block MUST include this exact `beforeEach()` setup:

```typescript
beforeEach(() => {
  // Clear cookies and local storage before each test to ensure a clean state
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.comprehensiveDebugWithBuildCapture(); // Capture build info for debugging
  cy.comprehensiveDebug(); // Ensure debug capture is active
});
```

**Why these requirements?**

- **Single `describe()` block**: Keeps test files focused and organized by feature
- **Clear state before each test**: Prevents test pollution and ensures independence
- **Debug capture**: Critical for troubleshooting failures and build issues
- **Consistent structure**: Makes tests predictable and easier to maintain

### Complete Hook Example with TypeScript

```typescript
// cypress/e2e/elements/element-workflow.cy.ts
// ✅ CORRECT: Single describe() block per file
describe('Element Workflow', () => {
  // ! MANDATORY: Required beforeEach() hook in EVERY describe block
  beforeEach(() => {
    // Clear cookies and local storage before each test to ensure a clean state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.comprehensiveDebugWithBuildCapture(); // Capture build info for debugging
    cy.comprehensiveDebug(); // Ensure debug capture is active
  });

  // * Optional: before() hook for expensive one-time setup
  before(() => {
    // Seed database with initial data
    cy.task('db:seed', { type: 'elements' });
  });

  // * Optional: Additional beforeEach() logic can be added after the mandatory one
  beforeEach(() => {
    // Set up authentication session
    cy.session(
      'user',
      () => {
        cy.visit('/login');
        cy.get('[data-cy="email-input"]').type('test@example.com');
        cy.get('[data-cy="password-input"]').type('password123');
        cy.get('[data-cy="login-button"]').click();
      },
      {
        validate() {
          cy.getCookie('auth-token').should('exist');
        },
      },
    );

    // Navigate to elements page
    cy.visit('/elements');
  });

  // * Optional: afterEach() hook for test cleanup
  afterEach(function () {
    // Capture failure information if test failed
    if (this.currentTest?.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  // * Optional: after() hook for final cleanup
  after(() => {
    // Clean up database
    cy.task('db:cleanup');
  });

  // ✅ Multiple it() tests allowed in single describe() block
  it('creates an element successfully', () => {
    cy.get('[data-cy="create-element-button"]').click();
    cy.get('[data-cy="element-name-input"]').type('Test Element');
    cy.get('[data-cy="save-button"]').click();
    cy.get('[data-cy="success-message"]').should('be.visible');
  });

  it('validates element fields', () => {
    cy.get('[data-cy="create-element-button"]').click();
    cy.get('[data-cy="save-button"]').click();
    cy.get('[data-cy="name-error"]').should('contain', 'Name is required');
  });

  it('edits an existing element', () => {
    cy.get('[data-cy="element-card"]').first().click();
    cy.get('[data-cy="edit-button"]').click();
    cy.get('[data-cy="element-name-input"]').clear().type('Updated Name');
    cy.get('[data-cy="save-button"]').click();
    cy.get('[data-cy="success-message"]').should('be.visible');
  });
});
```

### Hook Execution Order

```
before() - runs once
  └─ beforeEach() - runs before test 1
      └─ test 1 executes
  └─ afterEach() - runs after test 1
  └─ beforeEach() - runs before test 2
      └─ test 2 executes
  └─ afterEach() - runs after test 2
after() - runs once
```

### Important Hook Notes

1. **MANDATORY `beforeEach()`** - Every `describe()` block must start with the required cleanup and debug setup
2. **Single `describe()` per file** - Keep test files focused on one feature/functionality
3. **Multiple `it()` tests allowed** - Group related test cases in the single `describe()` block
4. **Use `function()` syntax** when you need access to the test context (`this.currentTest`)
5. **Avoid arrow functions** if you need to access `this.currentTest`
6. **Clean state in `beforeEach()`**, not `afterEach()` (Cypress best practice)
7. **Use `before()` sparingly** - Tests should be independent

### ❌ Common Mistakes to Avoid

```typescript
// ❌ WRONG: Multiple describe() blocks in one file
describe('Element Creation', () => {
  it('creates element', () => {});
});

describe('Element Editing', () => {
  it('edits element', () => {});
});

// ❌ WRONG: Using context() instead of describe()
describe('Element Management', () => {
  context('Creation', () => {
    // DON'T USE context()
    it('creates element', () => {});
  });
});

// ❌ WRONG: Using specify() instead of it()
describe('Element Management', () => {
  specify('creates element', () => {}); // DON'T USE specify()
});

// ❌ WRONG: Missing mandatory beforeEach() hook
describe('Element Management', () => {
  it('creates element', () => {});
});

// ❌ WRONG: beforeEach() missing required cleanup
describe('Element Management', () => {
  beforeEach(() => {
    cy.visit('/elements'); // Missing clearCookies, clearLocalStorage, debug setup
  });
  it('creates element', () => {});
});

// ✅ CORRECT: Single describe() with mandatory beforeEach()
describe('Element Management', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.comprehensiveDebugWithBuildCapture();
    cy.comprehensiveDebug();
  });

  it('creates element', () => {});
  it('edits element', () => {});
  it('deletes element', () => {});
});
```

---

## Excluding and Including Tests

### Skip Tests with `.skip()`

Temporarily skip tests without deleting them:

```typescript
describe('Element Features', () => {
  it('creates an element', () => {
    // This test will run
  });

  it.skip('deletes an element', () => {
    // This test will be skipped
  });

  // Skip entire suite
  describe.skip('Advanced Features', () => {
    it('feature 1', () => {
      // All tests in this suite are skipped
    });
  });
});
```

### Run Only Specific Tests with `.only()`

Run only specific tests during development:

```typescript
describe('Element Features', () => {
  it('creates an element', () => {
    // This test will NOT run
  });

  it.only('edits an element', () => {
    // ONLY this test will run
  });

  it('deletes an element', () => {
    // This test will NOT run
  });
});
```

**⚠️ Warning**: Always remove `.only()` before committing. Consider using a pre-commit hook to prevent this:

```typescript
// .husky/pre-commit
#!/bin/sh
if grep -r "\.only(" cypress/e2e/; then
  echo "❌ Found .only() in tests. Remove before committing."
  exit 1
fi
```

---

## Dynamically Generate Tests

Generate tests programmatically using loops or data structures:

### Array-Based Test Generation

```typescript
// cypress/e2e/elements/element-types.cy.ts
import type { ElementCategory } from '../../support/types';

describe('Element Type Validation', () => {
  const elementTypes: ElementCategory[] = [
    'character',
    'location',
    'magic-system',
    'culture',
    'creature',
    'organization',
  ];

  elementTypes.forEach(type => {
    it(`should create a ${type} element`, () => {
      cy.visit('/elements/new');
      cy.get('[data-cy="element-type-select"]').select(type);
      cy.get('[data-cy="element-name-input"]').type(`Test ${type}`);
      cy.get('[data-cy="save-button"]').click();
      cy.get('[data-cy="success-message"]').should('be.visible');
    });
  });
});
```

### Fixture-Based Test Generation

```typescript
// cypress/e2e/elements/element-validation.cy.ts
describe('Element Field Validation', () => {
  let validationRules: Array<{
    field: string;
    rule: string;
    errorMessage: string;
  }>;

  before(() => {
    cy.fixture('validation-rules.json').then(rules => {
      validationRules = rules;
    });
  });

  beforeEach(() => {
    cy.visit('/elements/new');
  });

  it('should validate all required fields', function () {
    validationRules.forEach(rule => {
      cy.get('[data-cy="save-button"]').click();
      cy.get(`[data-cy="${rule.field}-error"]`).should(
        'contain',
        rule.errorMessage,
      );
    });
  });
});
```

### Data-Driven Testing with TypeScript

```typescript
interface TestCase {
  description: string;
  input: {
    name: string;
    type: string;
    description: string;
  };
  expected: {
    success: boolean;
    message: string;
  };
}

describe('Element Creation Scenarios', () => {
  const testCases: TestCase[] = [
    {
      description: 'creates element with valid data',
      input: {
        name: 'Aria Stormblade',
        type: 'character',
        description: 'A brave warrior',
      },
      expected: {
        success: true,
        message: 'Element created successfully',
      },
    },
    {
      description: 'rejects element with empty name',
      input: {
        name: '',
        type: 'character',
        description: 'A brave warrior',
      },
      expected: {
        success: false,
        message: 'Name is required',
      },
    },
  ];

  testCases.forEach(testCase => {
    it(testCase.description, () => {
      cy.visit('/elements/new');
      cy.get('[data-cy="element-name-input"]').type(testCase.input.name);
      cy.get('[data-cy="element-type-select"]').select(testCase.input.type);
      cy.get('[data-cy="element-description-input"]').type(
        testCase.input.description,
      );
      cy.get('[data-cy="save-button"]').click();

      if (testCase.expected.success) {
        cy.get('[data-cy="success-message"]').should(
          'contain',
          testCase.expected.message,
        );
      } else {
        cy.get('[data-cy="error-message"]').should(
          'contain',
          testCase.expected.message,
        );
      }
    });
  });
});
```

---

## Test Configuration

### Configuring Individual Tests

Override configuration for specific tests:

```typescript
describe('Element Management', () => {
  // Configure specific test with custom timeout
  it(
    'handles slow element creation',
    {
      defaultCommandTimeout: 10000,
      requestTimeout: 15000,
    },
    () => {
      cy.visit('/elements/new');
      cy.get('[data-cy="element-name-input"]').type('Complex Element');
      cy.get('[data-cy="save-button"]').click();
      cy.get('[data-cy="success-message"]', { timeout: 10000 }).should(
        'be.visible',
      );
    },
  );

  // Browser-specific test
  it(
    'tests Chrome-specific feature',
    {
      browser: 'chrome',
    },
    () => {
      // Only runs in Chrome
      cy.visit('/elements');
    },
  );

  // Set viewport for specific test
  it(
    'tests mobile layout',
    {
      viewportWidth: 375,
      viewportHeight: 667,
    },
    () => {
      cy.visit('/elements');
      cy.get('[data-cy="mobile-menu"]').should('be.visible');
    },
  );
});
```

### Suite-Level Configuration

Apply configuration to entire test suites:

```typescript
describe(
  'Mobile Element Management',
  {
    viewportWidth: 375,
    viewportHeight: 667,
  },
  () => {
    it('displays mobile navigation', () => {
      cy.visit('/elements');
      cy.get('[data-cy="mobile-menu"]').should('be.visible');
    });

    it('creates element on mobile', () => {
      cy.visit('/elements/new');
      cy.get('[data-cy="element-name-input"]').type('Mobile Element');
      cy.get('[data-cy="save-button"]').click();
    });
  },
);
```

### Conditional Test Execution

```typescript
describe('Browser-Specific Tests', () => {
  // Run only in specific browsers
  it(
    'tests Firefox-specific behavior',
    {
      browser: 'firefox',
    },
    () => {
      cy.visit('/elements');
      // Firefox-specific test
    },
  );

  // Skip in specific browsers
  it(
    'skips in Firefox',
    {
      browser: '!firefox',
    },
    () => {
      cy.visit('/elements');
      // Runs in all browsers except Firefox
    },
  );
});
```

---

## Running Tests

### Running All Tests

```bash
# Open Cypress Test Runner (interactive mode)
npm run cypress:open

# Run all E2E tests (headless mode)
npm run cypress:run
npm run test:e2e  # Alias

# Run component tests
npm run test:component
```

### Running Specific Tests

```bash
# Run single test file
SPEC=cypress/e2e/login-page/verify-login-page.cy.ts npm run cypress:run:spec

# Run tests matching pattern
SPEC=cypress/e2e/elements/*.cy.ts npm run cypress:run:spec

# Run in interactive mode
SPEC=cypress/e2e/login-page/verify-login-page.cy.ts npm run cypress:open:spec
```

### Test Execution Options

```bash
# Run in specific browser
npm run cypress:run -- --browser chrome
npm run cypress:run -- --browser firefox
npm run cypress:run -- --browser edge

# Run with specific configuration
npm run cypress:run -- --config viewportWidth=1920,viewportHeight=1080

# Run with environment variables
npm run cypress:run -- --env apiUrl=http://localhost:3001

# Run tests matching grep pattern (requires cypress-grep plugin)
npm run cypress:run -- --env grep="creates element"
```

---

## TypeScript Support

### TypeScript Configuration

Cypress automatically detects and processes TypeScript files. Ensure your `tsconfig.json` includes Cypress types:

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["es5", "dom"],
    "types": ["cypress", "node"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Custom Command Type Definitions

Define types for custom commands:

```typescript
// cypress/support/commands.ts
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to log in via UI
       * @param email - User email address
       * @param password - User password
       * @example cy.login('user@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>;

      /**
       * Create an element via UI
       * @param elementData - Element data object
       * @example cy.createElement({ name: 'Aria', type: 'character' })
       */
      createElement(elementData: ElementData): Chainable<string>;

      /**
       * Clean application state
       * @example cy.cleanState()
       */
      cleanState(): Chainable<void>;
    }
  }
}

interface ElementData {
  name: string;
  type: string;
  description?: string;
}

// Implement commands
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session(
    [email, password],
    () => {
      cy.visit('/login');
      cy.get('[data-cy="email-input"]').type(email);
      cy.get('[data-cy="password-input"]').type(password);
      cy.get('[data-cy="login-button"]').click();
    },
    {
      validate() {
        cy.getCookie('auth-token').should('exist');
      },
    },
  );
});

Cypress.Commands.add('createElement', (elementData: ElementData) => {
  cy.visit('/elements/new');
  cy.get('[data-cy="element-name-input"]').type(elementData.name);
  cy.get('[data-cy="element-type-select"]').select(elementData.type);
  if (elementData.description) {
    cy.get('[data-cy="element-description-input"]').type(
      elementData.description,
    );
  }
  cy.get('[data-cy="save-button"]').click();
  cy.get('[data-cy="success-message"]').should('be.visible');
  return cy.url().then(url => {
    const id = url.split('/').pop() as string;
    return cy.wrap(id);
  });
});

export {};
```

### Using Types in Tests

```typescript
// cypress/e2e/elements/typed-element-test.cy.ts
import type { ElementCategory, WorldElement } from '../../../src/types';

describe('Typed Element Management', () => {
  let testElement: Partial<WorldElement>;

  // ! MANDATORY: Required beforeEach() hook
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.comprehensiveDebugWithBuildCapture();
    cy.comprehensiveDebug();
  });

  before(() => {
    testElement = {
      name: 'Aria Stormblade',
      type: 'character' as ElementCategory,
      description: 'A brave warrior with magical abilities',
    };
  });

  it('creates element with typed data', () => {
    cy.visit('/elements/new');

    // TypeScript ensures correct field names
    cy.get('[data-cy="element-name-input"]').type(testElement.name!);
    cy.get('[data-cy="element-type-select"]').select(testElement.type!);
    cy.get('[data-cy="element-description-input"]').type(
      testElement.description!,
    );

    cy.get('[data-cy="save-button"]').click();
    cy.get('[data-cy="success-message"]').should('be.visible');
  });
});
```

---

## Project-Specific Patterns

### FantasyWritingApp Test Structure Template

**Every test file MUST follow this exact structure:**

```typescript
// cypress/e2e/elements/element-creation.cy.ts
import type { ElementCategory } from '../../../src/types';

// ✅ RULE 1: Exactly ONE describe() block per file
describe('Element Creation', () => {
  // ! RULE 2: MANDATORY beforeEach() hook - MUST be first
  beforeEach(() => {
    // Clear cookies and local storage before each test to ensure a clean state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.comprehensiveDebugWithBuildCapture(); // Capture build info for debugging
    cy.comprehensiveDebug(); // Ensure debug capture is active
  });

  // * Optional: Additional beforeEach() hooks for test-specific setup
  beforeEach(() => {
    // Set up authentication using cy.session
    cy.session(
      'authenticated-user',
      () => {
        cy.visit('/login');
        cy.get('[data-cy="email-input"]').type('test@example.com');
        cy.get('[data-cy="password-input"]').type('password123');
        cy.get('[data-cy="login-button"]').click();
        cy.url().should('include', '/projects');
      },
      {
        validate() {
          // Validate session is still valid
          cy.getCookie('auth-token').should('exist');
        },
        cacheAcrossSpecs: true,
      },
    );

    // * Navigate to starting point
    cy.visit('/elements');
  });

  // * Optional: afterEach() hook for failure capture
  afterEach(function () {
    // Capture debug info if test failed
    if (this.currentTest?.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  // ✅ RULE 3: Multiple it() tests allowed in single describe() block
  it('creates a character element successfully', () => {
    const elementData = {
      name: 'Aria Stormblade',
      type: 'character' as ElementCategory,
      description: 'A brave warrior with dragon heritage',
    };

    cy.get('[data-cy="create-element-button"]').click();
    cy.get('[data-cy="element-type-select"]').select(elementData.type);
    cy.get('[data-cy="element-name-input"]').type(elementData.name);
    cy.get('[data-cy="element-description-input"]').type(
      elementData.description,
    );
    cy.get('[data-cy="save-button"]').click();

    // Verify success
    cy.get('[data-cy="success-message"]').should('contain', 'Element created');
    cy.get('[data-cy="element-name"]').should('contain', elementData.name);
  });

  it('validates required fields', () => {
    cy.get('[data-cy="create-element-button"]').click();
    cy.get('[data-cy="save-button"]').click();

    // Verify validation errors
    cy.get('[data-cy="name-error"]').should('contain', 'Name is required');
    cy.get('[data-cy="type-error"]').should('contain', 'Type is required');
  });

  it('edits an existing element', () => {
    // Create element first
    cy.get('[data-cy="create-element-button"]').click();
    cy.get('[data-cy="element-type-select"]').select('character');
    cy.get('[data-cy="element-name-input"]').type('Original Name');
    cy.get('[data-cy="save-button"]').click();

    // Edit the element
    cy.get('[data-cy="edit-button"]').click();
    cy.get('[data-cy="element-name-input"]').clear().type('Updated Name');
    cy.get('[data-cy="save-button"]').click();

    // Verify update
    cy.get('[data-cy="element-name"]').should('contain', 'Updated Name');
  });
});
```

### Using Custom Commands (Still Following Structure Rules)

```typescript
// Simplified test using custom commands
// ✅ Still follows: ONE describe() block per file
describe('Element Management with Custom Commands', () => {
  // ! MANDATORY: Required beforeEach() hook FIRST
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.comprehensiveDebugWithBuildCapture();
    cy.comprehensiveDebug();
  });

  // * Optional: Additional setup with custom commands
  beforeEach(() => {
    cy.login('test@example.com', 'password123');
    cy.visit('/elements');
  });

  // ✅ Multiple it() tests with custom commands
  it('creates element using custom command', () => {
    cy.createElement({
      name: 'Aria Stormblade',
      type: 'character',
      description: 'A brave warrior',
    }).then(elementId => {
      // Use the returned element ID
      cy.visit(`/elements/${elementId}`);
      cy.get('[data-cy="element-name"]').should('contain', 'Aria Stormblade');
    });
  });
});
```

### Fixture-Based Testing

```typescript
// cypress/fixtures/elements.json
[
  {
    name: 'Aria Stormblade',
    type: 'character',
    description: 'A brave warrior with dragon heritage',
  },
  {
    name: 'Crystal Caverns',
    type: 'location',
    description: 'Ancient underground caves filled with magical crystals',
  },
];

// cypress/e2e/elements/fixture-based-test.cy.ts
describe('Element Creation from Fixtures', () => {
  // ! MANDATORY: Required beforeEach() hook FIRST
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.comprehensiveDebugWithBuildCapture();
    cy.comprehensiveDebug();
  });

  // * Additional setup after mandatory hook
  beforeEach(() => {
    cy.login('test@example.com', 'password123');
    cy.fixture('elements.json').as('elementsData');
  });

  it('creates all elements from fixture', function () {
    this.elementsData.forEach((element: any, index: number) => {
      cy.createElement(element);
      cy.visit('/elements');
      cy.get(`[data-cy="element-card-${index}"]`).should(
        'contain',
        element.name,
      );
    });
  });
});
```

---

## Best Practices Summary

### 🚨 PROJECT-SPECIFIC MANDATORY RULES

1. **✅ ONE `describe()` block per file** - Keep test files focused on single features
2. **✅ MANDATORY `beforeEach()` hook** - Every `describe()` must start with:
   ```typescript
   beforeEach(() => {
     cy.clearCookies();
     cy.clearLocalStorage();
     cy.comprehensiveDebugWithBuildCapture();
     cy.comprehensiveDebug();
   });
   ```
3. **✅ Multiple `it()` tests allowed** - Group related test cases in single `describe()` block

### ✅ DO

- ✅ Use TypeScript for type safety and better IDE support
- ✅ Use `describe()` and `it()` ONLY for test structure
- ✅ Use `data-cy` attributes for selectors (never CSS classes or IDs)
- ✅ Write independent tests that can run in any order
- ✅ Use `cy.session()` for authentication to improve performance
- ✅ Clean state in `beforeEach()`, not `afterEach()`
- ✅ Organize tests by feature, not by file type
- ✅ Use fixtures for test data
- ✅ Use custom commands for common operations
- ✅ Use meaningful test descriptions

### ❌ DON'T

- ❌ Don't create multiple `describe()` blocks in one file
- ❌ Don't skip the mandatory `beforeEach()` cleanup hook
- ❌ Don't use `context()` (alias for `describe()`)
- ❌ Don't use `specify()` (alias for `it()`)
- ❌ Don't use conditional logic (if/else) in tests
- ❌ Don't start servers within Cypress tests
- ❌ Don't visit external sites
- ❌ Don't use arbitrary waits (`cy.wait(3000)`)
- ❌ Don't assign Cypress commands to variables
- ❌ Don't create dependent tests
- ❌ Don't use CSS classes, IDs, or tag selectors
- ❌ Don't commit tests with `.only()`
- ❌ Don't skip `baseUrl` configuration

---

## Additional Resources

### Official Cypress Documentation

- [Writing and Organizing Tests](https://docs.cypress.io/app/core-concepts/writing-and-organizing-tests)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [TypeScript Support](https://docs.cypress.io/guides/tooling/typescript-support)
- [Custom Commands](https://docs.cypress.io/api/cypress-api/custom-commands)

### Project Documentation

- [CLAUDE.md](../../CLAUDE.md) - Project quick reference
- [cypress-best-practices.md](./cypress-best-practices.md) - Comprehensive best practices
- [CUSTOM-COMMANDS-REFERENCE.md](./CUSTOM-COMMANDS-REFERENCE.md) - Custom command reference
- [SELECTOR-PATTERNS.md](./SELECTOR-PATTERNS.md) - Selector strategy guide
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - General testing guidelines

---

**Last Updated**: 2025-10-02
**Cypress Version**: 13.x
**TypeScript Version**: 5.2.2

---

## Summary: Golden Rules

Remember these mandatory rules for every Cypress test file:

### Structure Rules

1. **📄 ONE `describe()` block per file** - Focus on single feature
2. **✅ Multiple `it()` tests allowed** - Group related test cases
3. **❌ NO `context()`** - Don't use (alias for `describe()`)
4. **❌ NO `specify()`** - Don't use (alias for `it()`)

### Setup Rules

5. **🧹 MANDATORY `beforeEach()` cleanup hook** - Must be first in every `describe()`:
   ```typescript
   beforeEach(() => {
     cy.clearCookies();
     cy.clearLocalStorage();
     cy.comprehensiveDebugWithBuildCapture();
     cy.comprehensiveDebug();
   });
   ```

### Why These Rules?

- **Consistency**: Same structure across all test files
- **Simplicity**: Only `describe()` and `it()` - no confusion
- **Maintainability**: Easy to find, read, and modify tests
- **Debuggability**: Comprehensive debug capture on every test
- **Clean State**: Fresh environment for every test

Following these rules ensures consistent, maintainable, and debuggable tests across the entire project.

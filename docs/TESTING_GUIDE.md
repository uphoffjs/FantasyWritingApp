# Fantasy Writing App Testing Guide

## 📚 Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Types and When to Use](#test-types-and-when-to-use)
3. [Testing Stack](#testing-stack)
4. [Naming Conventions](#naming-conventions)
5. [Component Testing](#component-testing)
6. [Integration Testing](#integration-testing)
7. [E2E Testing](#e2e-testing)
8. [Test Patterns](#test-patterns)
9. [Anti-Patterns](#anti-patterns)
10. [Mocking Strategies](#mocking-strategies)
11. [Troubleshooting](#troubleshooting)
12. [Code Review Checklist](#code-review-checklist)

---

## Testing Philosophy

### Core Principles

1. **Test User Behavior, Not Implementation**
   - Focus on what users do, not how code works
   - Tests should survive refactoring

2. **The Testing Trophy** 🏆
   ```
        E2E      (5%)
       /    \
    Integration  (25%)
     /      \
   Unit Tests   (70%)
   ```

3. **Test Confidence vs Effort**
   - Prioritize tests that give maximum confidence with minimum maintenance
   - Integration tests provide the best balance

4. **Fast Feedback Loop**
   - Unit tests: < 100ms per test
   - Integration tests: < 500ms per test
   - E2E tests: < 30s per test

5. **Test Independence**
   - Each test must be able to run in isolation
   - No test should depend on another test's outcome
   - Clean state before each test, not after

---

## Test Types and When to Use

### Unit Tests (Jest + RNTL)
**When to use:**
- Pure functions with complex logic
- Custom hooks
- Utility functions
- State management actions
- Component rendering logic

**Example scenarios:**
- Date formatting functions
- Validation utilities
- Calculation logic
- Store reducers

### Integration Tests (Jest + RNTL)
**When to use:**
- Component interactions
- Form workflows
- Navigation flows
- Store integration with components
- API integration with components

**Example scenarios:**
- User completes a form and sees success message
- Navigation between screens with data passing
- Multiple components working together

### E2E Tests (Cypress for Web, Detox for Native)
**When to use:**
- Critical user journeys
- Multi-step workflows
- Cross-feature interactions
- Smoke tests for deployments

**Example scenarios:**
- User registration → login → create project → add element
- Complete story creation workflow
- Search and filter operations

---

## Testing Stack

### React Native Components
```javascript
// Jest + React Native Testing Library
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../test/testUtils';
```

### Web E2E
```javascript
// Cypress
cy.visit('/');
cy.get('[data-cy="login-button"]').click();
```

### Native E2E (Future)
```javascript
// Detox
await element(by.id('login-button')).tap();
```

---

## Naming Conventions

### File Naming
```
ComponentName.test.tsx    // Unit/Integration tests
ComponentName.cy.tsx      // Cypress component tests (deprecated)
feature.e2e.js           // E2E tests
```

### Test Suite Naming
```javascript
describe('ComponentName', () => {
  describe('Feature/Behavior Group', () => {
    it('should [expected behavior] when [condition]', () => {
      // Test implementation
    });
  });
});
```

### Test IDs
```javascript
// React Native
<TouchableOpacity testID="submit-button">

// Cypress selector
cy.get('[data-cy="submit-button"]');
```

### Naming Examples
```javascript
// ✅ Good
describe('LoginForm', () => {
  it('should display error message when email is invalid', () => {});
  it('should navigate to dashboard after successful login', () => {});
});

// ❌ Bad
describe('Login', () => {
  it('works', () => {});
  it('test email validation', () => {});
});
```

---

## Component Testing

### Basic Component Test Structure
```javascript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { MyComponent } from '../MyComponent';
import { renderWithProviders } from '../../test/testUtils';

describe('MyComponent', () => {
  // Setup
  const defaultProps = {
    title: 'Test Title',
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render title correctly', () => {
      const { getByText } = render(
        <MyComponent {...defaultProps} />
      );

      expect(getByText('Test Title')).toBeTruthy();
    });

    it('should render with custom styles', () => {
      const { getByTestId } = render(
        <MyComponent
          {...defaultProps}
          style={{ backgroundColor: 'red' }}
          testID="my-component"
        />
      );

      const component = getByTestId('my-component');
      expect(component.props.style).toEqual(
        expect.objectContaining({ backgroundColor: 'red' })
      );
    });
  });

  describe('Interactions', () => {
    it('should call onPress when pressed', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <MyComponent {...defaultProps} onPress={onPress} />
      );

      fireEvent.press(getByTestId('my-component'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when disabled', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <MyComponent
          {...defaultProps}
          onPress={onPress}
          disabled
        />
      );

      fireEvent.press(getByTestId('my-component'));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('Async Behavior', () => {
    it('should load data on mount', async () => {
      const { getByText, queryByTestId } = render(
        <MyComponent {...defaultProps} loadOnMount />
      );

      // Loading state
      expect(queryByTestId('loading-indicator')).toBeTruthy();

      // Wait for data
      await waitFor(() => {
        expect(getByText('Loaded Data')).toBeTruthy();
      });

      // Loading indicator gone
      expect(queryByTestId('loading-indicator')).toBeNull();
    });
  });
});
```

### Testing with Providers
```javascript
describe('ComponentWithStore', () => {
  it('should update store on action', () => {
    const { getByText, getByTestId } = renderWithProviders(
      <ComponentWithStore />
    );

    fireEvent.press(getByTestId('increment-button'));

    expect(getByText('Count: 1')).toBeTruthy();
  });
});
```

### Testing Lists
```javascript
describe('ItemList', () => {
  const mockItems = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' },
  ];

  it('should render all items', () => {
    const { getAllByTestId } = render(
      <ItemList items={mockItems} />
    );

    const items = getAllByTestId(/^item-/);
    expect(items).toHaveLength(3);
  });

  it('should render empty state when no items', () => {
    const { getByText } = render(
      <ItemList items={[]} />
    );

    expect(getByText('No items found')).toBeTruthy();
  });
});
```

---

## Integration Testing

### Form Submission Flow
```javascript
describe('CreateElementForm Integration', () => {
  it('should create element and navigate on success', async () => {
    const mockNavigate = jest.fn();
    const mockAddElement = jest.fn().mockResolvedValue({ id: '123' });

    const { getByTestId, getByText } = renderWithProviders(
      <CreateElementForm />,
      {
        navigation: { navigate: mockNavigate },
        store: { addElement: mockAddElement },
      }
    );

    // Fill form
    fireEvent.changeText(
      getByTestId('name-input'),
      'New Character'
    );
    fireEvent.changeText(
      getByTestId('description-input'),
      'Character description'
    );

    // Submit
    fireEvent.press(getByTestId('submit-button'));

    // Wait for async operations
    await waitFor(() => {
      expect(mockAddElement).toHaveBeenCalledWith({
        name: 'New Character',
        description: 'Character description',
      });
      expect(mockNavigate).toHaveBeenCalledWith('Element', {
        elementId: '123',
      });
    });
  });

  it('should show validation errors for invalid input', async () => {
    const { getByTestId, getByText } = renderWithProviders(
      <CreateElementForm />
    );

    // Submit without filling required fields
    fireEvent.press(getByTestId('submit-button'));

    await waitFor(() => {
      expect(getByText('Name is required')).toBeTruthy();
    });
  });
});
```

### Navigation Flow
```javascript
describe('Navigation Integration', () => {
  it('should navigate through app flow', async () => {
    const { getByTestId, getByText } = renderWithProviders(
      <App />
    );

    // Start at login
    expect(getByText('Login')).toBeTruthy();

    // Login
    fireEvent.changeText(getByTestId('email-input'), 'test@test.com');
    fireEvent.changeText(getByTestId('password-input'), 'password');
    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => {
      expect(getByText('Projects')).toBeTruthy();
    });

    // Navigate to project
    fireEvent.press(getByTestId('project-card-1'));

    await waitFor(() => {
      expect(getByText('Project Details')).toBeTruthy();
    });
  });
});
```

---

## E2E Testing

### Cypress E2E Test Structure
```javascript
// cypress/e2e/user-journey.cy.js
describe('User Journey: Create Story', () => {
  beforeEach(() => {
    cy.task('db:seed');
    cy.login('test@example.com', 'password');
  });

  it('should complete story creation workflow', () => {
    // Navigate to projects
    cy.visit('/projects');

    // Create new project
    cy.get('[data-cy="create-project-button"]').click();
    cy.get('[data-cy="project-name-input"]').type('My Fantasy World');
    cy.get('[data-cy="project-description-input"]').type('Epic adventure');
    cy.get('[data-cy="submit-button"]').click();

    // Should redirect to project page
    cy.url().should('include', '/project/');
    cy.contains('My Fantasy World').should('be.visible');

    // Add character
    cy.get('[data-cy="add-element-button"]').click();
    cy.get('[data-cy="element-type-select"]').select('character');
    cy.get('[data-cy="element-name-input"]').type('Hero');
    cy.get('[data-cy="element-description-input"]').type('Main protagonist');
    cy.get('[data-cy="save-element-button"]').click();

    // Verify character was added
    cy.get('[data-cy="element-list"]').within(() => {
      cy.contains('Hero').should('be.visible');
    });
  });
});
```

### Page Object Pattern
```javascript
// cypress/support/pages/ProjectPage.js
class ProjectPage {
  visit(projectId) {
    cy.visit(`/project/${projectId}`);
  }

  get addElementButton() {
    return cy.get('[data-cy="add-element-button"]');
  }

  get elementList() {
    return cy.get('[data-cy="element-list"]');
  }

  addCharacter(name, description) {
    this.addElementButton.click();
    cy.get('[data-cy="element-type-select"]').select('character');
    cy.get('[data-cy="element-name-input"]').type(name);
    cy.get('[data-cy="element-description-input"]').type(description);
    cy.get('[data-cy="save-element-button"]').click();
  }

  verifyElementExists(name) {
    this.elementList.within(() => {
      cy.contains(name).should('be.visible');
    });
  }
}

export default new ProjectPage();

// Usage in test
import projectPage from '../support/pages/ProjectPage';

it('should add character to project', () => {
  projectPage.visit('project-123');
  projectPage.addCharacter('Hero', 'Main character');
  projectPage.verifyElementExists('Hero');
});
```

---

## Test Patterns

### Testing Async Operations
```javascript
// ✅ Good - Using waitFor
it('should load data', async () => {
  const { getByText } = render(<AsyncComponent />);

  await waitFor(() => {
    expect(getByText('Loaded')).toBeTruthy();
  });
});

// ❌ Bad - Arbitrary timeout
it('should load data', (done) => {
  const { getByText } = render(<AsyncComponent />);

  setTimeout(() => {
    expect(getByText('Loaded')).toBeTruthy();
    done();
  }, 1000);
});
```

### Testing Hooks
```javascript
import { renderHook, act } from '@testing-library/react-hooks';
import { useCounter } from '../useCounter';

describe('useCounter', () => {
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.count).toBe(0);

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

### Testing Error States
```javascript
it('should display error message on failure', async () => {
  const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));

  const { getByText } = render(
    <DataLoader fetch={mockFetch} />
  );

  await waitFor(() => {
    expect(getByText('Network error')).toBeTruthy();
  });
});
```

### Testing Platform-Specific Code
```javascript
import { Platform } from 'react-native';

describe('PlatformSpecificComponent', () => {
  describe('iOS', () => {
    beforeEach(() => {
      Platform.OS = 'ios';
    });

    it('should render iOS-specific UI', () => {
      const { getByTestId } = render(<PlatformSpecificComponent />);
      expect(getByTestId('ios-specific-element')).toBeTruthy();
    });
  });

  describe('Android', () => {
    beforeEach(() => {
      Platform.OS = 'android';
    });

    it('should render Android-specific UI', () => {
      const { getByTestId } = render(<PlatformSpecificComponent />);
      expect(getByTestId('android-specific-element')).toBeTruthy();
    });
  });
});
```

---

## Anti-Patterns

### ❌ Testing Implementation Details
```javascript
// Bad
it('should set state to loading', () => {
  const component = shallow(<MyComponent />);
  component.instance().setState({ loading: true });
  expect(component.state('loading')).toBe(true);
});

// Good
it('should show loading indicator when loading', () => {
  const { getByTestId } = render(<MyComponent loading />);
  expect(getByTestId('loading-indicator')).toBeTruthy();
});
```

### ❌ Snapshot Overuse
```javascript
// Bad - Snapshot for everything
it('should match snapshot', () => {
  const tree = renderer.create(<ComplexComponent />).toJSON();
  expect(tree).toMatchSnapshot();
});

// Good - Specific assertions
it('should render user name and email', () => {
  const { getByText } = render(
    <UserCard user={{ name: 'John', email: 'john@example.com' }} />
  );
  expect(getByText('John')).toBeTruthy();
  expect(getByText('john@example.com')).toBeTruthy();
});
```

### ❌ Dependent Tests
```javascript
// Bad - Tests depend on order
let user;

it('should create user', () => {
  user = createUser();
  expect(user).toBeDefined();
});

it('should update user', () => {
  // Depends on previous test
  updateUser(user);
});

// Good - Independent tests
it('should update user', () => {
  const user = createUser();
  const updated = updateUser(user);
  expect(updated.name).toBe('Updated Name');
});
```

### ❌ Testing Third-Party Libraries
```javascript
// Bad - Testing React Navigation itself
it('should navigate when navigate is called', () => {
  navigation.navigate('Screen');
  expect(navigation.navigate).toHaveBeenCalledWith('Screen');
});

// Good - Testing your navigation logic
it('should navigate to details screen with item data', () => {
  const { getByTestId } = render(<ItemList />);
  fireEvent.press(getByTestId('item-1'));

  expect(mockNavigate).toHaveBeenCalledWith('Details', {
    itemId: '1',
    itemName: 'Item 1'
  });
});
```

---

## Mocking Strategies

### Mocking Modules
```javascript
// __mocks__/@react-native-async-storage/async-storage.js
export default {
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
};
```

### Mocking Navigation
```javascript
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: { id: 'test-id' },
  }),
}));
```

### Mocking API Calls
```javascript
// Mock successful response
jest.mock('../api', () => ({
  fetchUser: jest.fn(() =>
    Promise.resolve({ id: '1', name: 'John' })
  ),
}));

// Mock with different responses per test
import * as api from '../api';

it('should handle API error', async () => {
  api.fetchUser.mockRejectedValueOnce(new Error('Network error'));
  // Test error handling
});
```

### Mocking Platform
```javascript
describe('Platform specific', () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Platform.OS = originalPlatform;
  });

  it('should work on iOS', () => {
    Platform.OS = 'ios';
    // Test iOS behavior
  });

  it('should work on Android', () => {
    Platform.OS = 'android';
    // Test Android behavior
  });
});
```

---

## Troubleshooting

### Common Issues and Solutions

#### "Cannot find module" errors
```bash
# Clear Jest cache
npm run jest -- --clearCache

# Check module resolution in jest.config.js
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

#### Test timeouts
```javascript
// Increase timeout for specific test
it('should load large dataset', async () => {
  // Test implementation
}, 10000); // 10 second timeout

// Global timeout in jest.config.js
testTimeout: 10000,
```

#### Async test not completing
```javascript
// ✅ Always return or await promises
it('should async operation', async () => {
  const result = await asyncOperation();
  expect(result).toBe('success');
});

// Or return the promise
it('should async operation', () => {
  return asyncOperation().then(result => {
    expect(result).toBe('success');
  });
});
```

#### React Native component not found
```javascript
// Mock native components in setup file
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaConsumer: ({ children }) => children(inset),
    useSafeAreaInsets: () => inset,
  };
});
```

#### State not updating in test
```javascript
// Use act() for state updates
import { act } from '@testing-library/react-native';

it('should update state', () => {
  const { getByTestId, getByText } = render(<Counter />);

  act(() => {
    fireEvent.press(getByTestId('increment-button'));
  });

  expect(getByText('Count: 1')).toBeTruthy();
});
```

---

## Code Review Checklist

### Before Submitting PR

#### Test Coverage
- [ ] All new features have tests
- [ ] All bug fixes have regression tests
- [ ] Coverage meets threshold (80% lines)
- [ ] No commented-out tests

#### Test Quality
- [ ] Tests are readable and well-named
- [ ] Tests follow project conventions
- [ ] Tests are independent
- [ ] No arbitrary timeouts or sleeps
- [ ] Appropriate test types used

#### Test Performance
- [ ] Unit tests run in < 100ms
- [ ] Integration tests run in < 500ms
- [ ] No unnecessary renders in tests
- [ ] Mocks are cleaned up properly

#### Documentation
- [ ] Complex tests have comments
- [ ] Test purpose is clear
- [ ] Setup/teardown logic is explained
- [ ] Any workarounds are documented

### Review Questions
1. **Can these tests fail for the right reasons?**
   - Will they catch real bugs?
   - Are they testing behavior, not implementation?

2. **Are the tests maintainable?**
   - Will they survive refactoring?
   - Are they easy to update?

3. **Do the tests provide confidence?**
   - Do they cover critical paths?
   - Are edge cases handled?

4. **Are the tests efficient?**
   - Do they run quickly?
   - Do they use appropriate test types?

---

## Performance Benchmarks

### Target Metrics
| Test Type | Target Time | Max Time |
|-----------|------------|----------|
| Unit Test | < 50ms | 100ms |
| Integration Test | < 200ms | 500ms |
| E2E Test | < 10s | 30s |
| Test Suite | < 2min | 5min |

### Monitoring Performance
```javascript
// Add to test
console.time('test-performance');
// ... test code
console.timeEnd('test-performance');

// Or use Jest's built-in timer
it('should be performant', () => {
  const start = performance.now();
  // ... test code
  const end = performance.now();
  expect(end - start).toBeLessThan(100);
});
```

---

## Resources

### Official Documentation
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Testing Library Principles](https://testing-library.com/docs/guiding-principles)

### Recommended Reading
- [Testing Trophy by Kent C. Dodds](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Effective Snapshot Testing](https://kentcdodds.com/blog/effective-snapshot-testing)

### Tools
- [Jest Runner for VS Code](https://marketplace.visualstudio.com/items?itemName=firsttris.vscode-jest-runner)
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/)

---

*Last Updated: 2025-09-27*
*Version: 1.0.0*
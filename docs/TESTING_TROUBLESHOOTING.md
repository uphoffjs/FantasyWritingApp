# Testing Troubleshooting Guide

## 🔧 Common Testing Issues and Solutions

This guide helps resolve common issues encountered when writing and running tests in the Fantasy Writing App.

---

## Table of Contents

1. [Setup Issues](#setup-issues)
2. [React Native Testing Library Issues](#react-native-testing-library-issues)
3. [Jest Configuration Issues](#jest-configuration-issues)
4. [Mock-Related Issues](#mock-related-issues)
5. [Async Testing Issues](#async-testing-issues)
6. [Navigation Testing Issues](#navigation-testing-issues)
7. [Store Testing Issues](#store-testing-issues)
8. [Platform-Specific Issues](#platform-specific-issues)
9. [Performance Issues](#performance-issues)
10. [Cypress Issues](#cypress-issues)

---

## Setup Issues

### Issue: "Cannot find module" errors

**Symptoms:**
```
Cannot find module '@/components/Button' from 'Button.test.tsx'
```

**Solutions:**

1. **Check Jest configuration:**
```javascript
// jest.config.js
module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
  },
};
```

2. **Clear Jest cache:**
```bash
npm run jest -- --clearCache
# or
yarn jest --clearCache
```

3. **Check tsconfig paths:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    }
  }
}
```

### Issue: "Unexpected token" errors

**Symptoms:**
```
SyntaxError: Unexpected token '<'
```

**Solutions:**

1. **Update transform configuration:**
```javascript
// jest.config.js
module.exports = {
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation)/)',
  ],
};
```

2. **Check Babel configuration:**
```javascript
// babel.config.js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Exclude nativewind in test environment
    process.env.NODE_ENV !== 'test' && 'nativewind/babel',
  ].filter(Boolean),
};
```

---

## React Native Testing Library Issues

### Issue: "Unable to find element with testID"

**Symptoms:**
```
Unable to find an element with testID: submit-button
```

**Solutions:**

1. **Verify testID is set correctly:**
```javascript
// Component
<TouchableOpacity testID="submit-button">
  <Text>Submit</Text>
</TouchableOpacity>

// Test
const { getByTestId } = render(<Component />);
const button = getByTestId('submit-button');
```

2. **Check if element is conditionally rendered:**
```javascript
// Wait for element to appear
await waitFor(() => {
  expect(getByTestId('submit-button')).toBeTruthy();
});
```

3. **Debug what's rendered:**
```javascript
const { debug } = render(<Component />);
debug(); // Prints the component tree
```

### Issue: "Text is not allowed outside of a <Text> component"

**Symptoms:**
```
Invariant Violation: Text strings must be rendered within a <Text> component
```

**Solutions:**

1. **Wrap text in Text component:**
```javascript
// ❌ Wrong
<View>Hello World</View>

// ✅ Correct
<View><Text>Hello World</Text></View>
```

2. **Check conditional rendering:**
```javascript
// ❌ Wrong
<View>{isLoading && 'Loading...'}</View>

// ✅ Correct
<View>{isLoading && <Text>Loading...</Text>}</View>
```

---

## Jest Configuration Issues

### Issue: Tests timing out

**Symptoms:**
```
Timeout - Async callback was not invoked within the 5000ms timeout
```

**Solutions:**

1. **Increase timeout for specific test:**
```javascript
it('should handle slow operation', async () => {
  // test code
}, 10000); // 10 second timeout
```

2. **Global timeout in Jest config:**
```javascript
// jest.config.js
module.exports = {
  testTimeout: 10000,
};
```

3. **Ensure async operations complete:**
```javascript
// ✅ Always await or return promises
it('should fetch data', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});
```

### Issue: "ReferenceError: regeneratorRuntime is not defined"

**Solutions:**

1. **Install and configure regenerator-runtime:**
```bash
npm install --save-dev @babel/runtime regenerator-runtime
```

2. **Import in setup file:**
```javascript
// src/test/setup.js
import 'regenerator-runtime/runtime';
```

---

## Mock-Related Issues

### Issue: Mock not working as expected

**Symptoms:**
```
Expected mock function to have been called, but it was not called
```

**Solutions:**

1. **Verify mock is properly set up:**
```javascript
// At top of file (hoisted)
jest.mock('../api', () => ({
  fetchData: jest.fn(),
}));

// In test
import { fetchData } from '../api';

beforeEach(() => {
  fetchData.mockClear();
});

it('should call fetchData', () => {
  fetchData.mockResolvedValue({ data: 'test' });
  // test code
});
```

2. **Use mockImplementation for dynamic behavior:**
```javascript
fetchData.mockImplementation(() => {
  if (someCondition) {
    return Promise.resolve({ data: 'success' });
  }
  return Promise.reject(new Error('failure'));
});
```

### Issue: "Cannot spy on a primitive value"

**Solutions:**

1. **Spy on object methods, not primitives:**
```javascript
// ❌ Wrong
const spy = jest.spyOn(5, 'toString');

// ✅ Correct
const obj = { method: () => 5 };
const spy = jest.spyOn(obj, 'method');
```

---

## Async Testing Issues

### Issue: Test completes before async operation

**Symptoms:**
```
Warning: An update to Component inside a test was not wrapped in act(...)
```

**Solutions:**

1. **Use waitFor for async updates:**
```javascript
import { waitFor } from '@testing-library/react-native';

it('should update after async operation', async () => {
  const { getByText } = render(<Component />);

  fireEvent.press(getByText('Load Data'));

  await waitFor(() => {
    expect(getByText('Data Loaded')).toBeTruthy();
  });
});
```

2. **Wrap state updates in act:**
```javascript
import { act } from '@testing-library/react-native';

it('should update state', () => {
  const { result } = renderHook(() => useCounter());

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});
```

### Issue: Promises not resolving in tests

**Solutions:**

1. **Flush promises:**
```javascript
// Helper function
const flushPromises = () => new Promise(resolve => setImmediate(resolve));

it('should resolve promises', async () => {
  triggerAsyncAction();
  await flushPromises();
  expect(something).toBe(true);
});
```

2. **Use fake timers correctly:**
```javascript
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

it('should handle timers', () => {
  const callback = jest.fn();
  setTimeout(callback, 1000);

  jest.advanceTimersByTime(1000);
  expect(callback).toHaveBeenCalled();
});
```

---

## Navigation Testing Issues

### Issue: Navigation mock not working

**Solutions:**

1. **Proper navigation mock setup:**
```javascript
// __mocks__/@react-navigation/native.js
const actualNav = jest.requireActual('@react-navigation/native');

module.exports = {
  ...actualNav,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
};
```

2. **Mock navigation in test:**
```javascript
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

it('should navigate', () => {
  const { getByText } = render(<Component />);
  fireEvent.press(getByText('Navigate'));
  expect(mockNavigate).toHaveBeenCalledWith('ScreenName');
});
```

---

## Store Testing Issues

### Issue: Store state not resetting between tests

**Solutions:**

1. **Reset store in beforeEach:**
```javascript
import { useStore } from '../store';

beforeEach(() => {
  // Reset to initial state
  useStore.setState(useStore.getState().reset());
  // or
  useStore.destroy();
  useStore.create();
});
```

2. **Use store provider wrapper:**
```javascript
const renderWithStore = (component, initialState = {}) => {
  const store = createStore(initialState);
  return render(
    <StoreProvider store={store}>
      {component}
    </StoreProvider>
  );
};
```

### Issue: Store updates not reflecting in component

**Solutions:**

1. **Ensure proper subscription:**
```javascript
it('should update when store changes', async () => {
  const { getByText, rerender } = render(<Component />);

  act(() => {
    useStore.getState().updateValue('new');
  });

  // Force re-render if needed
  rerender(<Component />);

  await waitFor(() => {
    expect(getByText('new')).toBeTruthy();
  });
});
```

---

## Platform-Specific Issues

### Issue: Platform.OS not mocking correctly

**Solutions:**

1. **Mock Platform module:**
```javascript
// For specific test
beforeEach(() => {
  Platform.OS = 'ios'; // or 'android', 'web'
});

// Global mock
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Platform.OS = 'ios';
  return RN;
});
```

2. **Test multiple platforms:**
```javascript
describe.each(['ios', 'android', 'web'])('on %s', (platform) => {
  beforeEach(() => {
    Platform.OS = platform;
  });

  it('should render platform-specific UI', () => {
    const { getByTestId } = render(<Component />);
    expect(getByTestId(`${platform}-specific`)).toBeTruthy();
  });
});
```

### Issue: Dimensions not working in tests

**Solutions:**

```javascript
// Mock Dimensions
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Dimensions.get = jest.fn().mockReturnValue({
    width: 375,
    height: 812,
    scale: 2,
    fontScale: 1,
  });
  return RN;
});
```

---

## Performance Issues

### Issue: Tests running slowly

**Solutions:**

1. **Run tests in parallel:**
```json
// package.json
{
  "scripts": {
    "test": "jest --maxWorkers=4"
  }
}
```

2. **Use focused tests during development:**
```javascript
// Only run this test
it.only('should work', () => {});

// Skip this test
it.skip('should work later', () => {});
```

3. **Optimize test setup:**
```javascript
// Move expensive setup outside of beforeEach
const expensiveData = generateLargeDataset();

describe('Tests', () => {
  // Reuse data across tests
  it('test 1', () => {
    useData(expensiveData);
  });
});
```

### Issue: Memory leaks in tests

**Solutions:**

1. **Clean up properly:**
```javascript
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  cleanup(); // from @testing-library/react-native
});
```

2. **Unmount components:**
```javascript
it('should clean up', () => {
  const { unmount } = render(<Component />);

  // Test code

  unmount(); // Clean up
});
```

---

## Cypress Issues

### Issue: "cy.visit() failed trying to load"

**Solutions:**

1. **Ensure dev server is running:**
```bash
# In one terminal
npm run web

# In another terminal
npm run cypress:open
```

2. **Check baseUrl in cypress.config.js:**
```javascript
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3002',
  },
};
```

### Issue: Element not visible/interactable

**Solutions:**

1. **Wait for element to be ready:**
```javascript
// Wait for element to be visible
cy.get('[data-cy="button"]').should('be.visible').click();

// Wait for specific condition
cy.get('[data-cy="list"]').should('have.length.gt', 0);
```

2. **Force interaction if needed:**
```javascript
// Only as last resort
cy.get('[data-cy="hidden-button"]').click({ force: true });
```

---

## Debug Techniques

### Console Debugging
```javascript
const { debug } = render(<Component />);
debug(); // Prints component tree
debug(element); // Prints specific element
```

### Query Debugging
```javascript
const { container } = render(<Component />);
console.log(prettyDOM(container));
```

### Screenshot Debugging (Cypress)
```javascript
cy.screenshot('debug-state');
cy.debug(); // Pause execution
cy.pause(); // Pause and allow manual debugging
```

---

## Environment-Specific Solutions

### Development Environment
```bash
# Run single test file
npm test -- Button.test.tsx

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Debug tests in VS Code
node --inspect-brk node_modules/.bin/jest --runInBand
```

### CI Environment
```yaml
# GitHub Actions example
- name: Run Tests
  run: |
    npm ci
    npm run test:ci
  env:
    CI: true
```

---

## Getting Help

### Resources
1. [React Native Testing Library Discord](https://discord.gg/testing-library)
2. [Jest GitHub Issues](https://github.com/facebook/jest/issues)
3. [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native-testing-library)

### Debug Checklist
- [ ] Error message copied exactly
- [ ] Minimal reproduction created
- [ ] Stack trace analyzed
- [ ] Related issues searched
- [ ] Documentation consulted

---

*Last Updated: 2025-09-27*
*Version: 1.0.0*
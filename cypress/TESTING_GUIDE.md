# Cypress Testing Guide for FantasyWritingApp

This guide documents all testing utilities, best practices, and common patterns for the FantasyWritingApp test suite.

## Table of Contents

1. [Overview](#overview)
2. [Test Utilities](#test-utilities)
3. [Best Practices](#best-practices)
4. [React Native Web Quirks](#react-native-web-quirks)
5. [Troubleshooting Guide](#troubleshooting-guide)
6. [Performance Guidelines](#performance-guidelines)

## Overview

The FantasyWritingApp test suite is built on Cypress with React Native Web, providing comprehensive testing capabilities including:

- Component testing with React Native Web compatibility
- Accessibility testing (WCAG 2.1 compliance)
- Performance monitoring and benchmarking
- Edge case and boundary condition testing
- Anti-flakiness utilities

### Test Suite Structure

```
cypress/
├── component/          # Component test files
├── e2e/               # End-to-end test files
├── fixtures/          # Test data and factories
├── support/           # Utilities and helpers
│   ├── accessibility-utils.ts      # WCAG compliance testing
│   ├── boundary-test-utils.ts      # Edge case testing
│   ├── performance-utils.ts        # Performance monitoring
│   ├── rapid-interaction-utils.ts  # Race condition prevention
│   ├── special-characters-utils.ts # Input sanitization
│   └── test-optimization-config.ts # Test optimization
└── TESTING_GUIDE.md   # This file
```

## Test Utilities

### Accessibility Testing (`accessibility-utils.ts`)

Comprehensive accessibility testing utilities for WCAG 2.1 compliance.

#### Basic Usage

```typescript
import { AccessibilityHelpers, ComponentAccessibilityTests } from '../support/accessibility-utils';

// Initialize axe-core
AccessibilityHelpers.initializeAxe();

// Check WCAG compliance
cy.checkAccessibility(); // Full page check
cy.checkAccessibility('[data-cy="component"]'); // Specific element

// Verify ARIA attributes
cy.verifyARIAAttributes('[data-cy="input"]', {
  'aria-required': 'true',
  'aria-invalid': 'false',
  'aria-describedby': 'help-text'
});

// Test keyboard navigation
cy.testKeyboardNavigation(['#input1', '#input2', '#submit']);

// Test screen reader announcement
cy.testScreenReaderAnnouncement('[role="alert"]', 'Error: Invalid input');
```

#### WCAG Compliance Levels

```typescript
// Test specific WCAG levels
cy.checkAccessibility(null, {
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
  }
});

// Test specific rules
cy.checkAccessibility(null, {
  runOnly: {
    type: 'rule',
    values: ['color-contrast', 'label', 'link-name']
  }
});
```

### Performance Testing (`performance-utils.ts`)

Monitor memory usage, detect leaks, and benchmark component performance.

#### Memory Management

```typescript
import { MemoryManagement } from '../support/performance-utils';

// Take memory snapshots
MemoryManagement.takeSnapshot('before-test');
// ... perform operations ...
MemoryManagement.takeSnapshot('after-test');

// Check for memory leaks
const leak = MemoryManagement.compareSnapshots('before-test', 'after-test');
expect(leak).to.be.lessThan(1000000); // 1MB threshold

// Clean up after tests
MemoryManagement.performCleanup(); // Full cleanup
MemoryManagement.cleanupDOM();      // DOM only
MemoryManagement.clearReactFiber(); // React cache
```

#### Performance Monitoring

```typescript
import { PerformanceMonitoring } from '../support/performance-utils';

// Time operations
const start = PerformanceMonitoring.startTiming('operation');
// ... perform operation ...
const duration = PerformanceMonitoring.endTiming('operation', start);

// Get statistics
const stats = PerformanceMonitoring.getStatistics('operation');
console.log(`Average: ${stats.avg}ms, P95: ${stats.p95}ms`);

// Use performance budgets
expect(duration).to.be.lessThan(TestConfig.performanceBudgets.componentMount);
```

#### Benchmarking

```typescript
import { BenchmarkHelpers } from '../support/test-optimization-config';

// Benchmark component render
await BenchmarkHelpers.benchmarkRender(
  'MyComponent',
  () => <MyComponent />,
  10 // iterations
);

// Compare performance
const results = await BenchmarkHelpers.comparePerformance([
  { name: 'Implementation A', fn: () => { /* ... */ } },
  { name: 'Implementation B', fn: () => { /* ... */ } }
], 10);
```

### Boundary Testing (`boundary-test-utils.ts`)

Test edge cases and boundary conditions systematically.

#### Numeric Boundaries

```typescript
import { BoundaryTestUtils } from '../support/boundary-test-utils';

// Test numeric input boundaries
BoundaryTestUtils.testNumericBoundaries('[data-cy="age-input"]', {
  min: 0,
  max: 120,
  integer: true
});

// Test with custom cases
BoundaryTestUtils.testNumericInput('[data-cy="price"]', [
  { value: -1, expected: 'invalid' },
  { value: 0, expected: 'valid' },
  { value: 999999, expected: 'valid' },
  { value: 1000000, expected: 'invalid' }
]);
```

#### String Length Boundaries

```typescript
// Test string length limits
BoundaryTestUtils.testStringLength('[data-cy="username"]', {
  minLength: 3,
  maxLength: 20,
  required: true
});

// Test with edge cases
const edgeCases = BoundaryTestUtils.generateStringBoundaries(100);
edgeCases.forEach(testCase => {
  cy.get('[data-cy="input"]').clear().type(testCase);
  // ... verify behavior ...
});
```

### Rapid Interaction Testing (`rapid-interaction-utils.ts`)

Prevent race conditions and test rapid user interactions.

#### Rapid Input Testing

```typescript
import { RapidInteractionUtils } from '../support/rapid-interaction-utils';

// Test rapid typing
cy.rapidType('[data-cy="search"]', 'test query', 0); // No delay

// Simulate rage clicking
cy.simulateRageClick('[data-cy="submit"]', {
  count: 20,
  interval: 50
});

// Test simultaneous interactions
RapidInteractionUtils.testSimultaneousClicks([
  '[data-cy="button1"]',
  '[data-cy="button2"]'
]);

// Debounce/throttle testing
cy.testDebouncedInput('[data-cy="search"]', {
  text: 'search term',
  debounceTime: 300
});
```

### Special Characters Testing (`special-characters-utils.ts`)

Test input sanitization and special character handling.

#### Security Testing

```typescript
import { SpecialCharacterTests } from '../support/special-characters-utils';

// Test XSS prevention
SpecialCharacterTests.testXSSPrevention('[data-cy="comment"]');

// Test SQL injection prevention
SpecialCharacterTests.testSQLInjectionPrevention('[data-cy="search"]');

// Test comprehensive security
cy.testSecurityVulnerabilities('[data-cy="form"]');
```

#### Unicode and Emoji Testing

```typescript
// Test Unicode support
SpecialCharacterTests.testUnicodeSupport('[data-cy="name"]');

// Test emoji handling
SpecialCharacterTests.testEmojiHandling('[data-cy="message"]', {
  shouldPreserve: true,
  maxLength: 280
});

// Test internationalization
const i18nCases = SpecialCharacters.internationalCharacters;
Object.entries(i18nCases).forEach(([language, text]) => {
  cy.get('[data-cy="input"]').clear().type(text);
  cy.get('[data-cy="output"]').should('contain', text);
});
```

## Best Practices

### 1. Always Use data-cy Selectors

```typescript
// ✅ Good
cy.get('[data-cy="submit-button"]').click();

// ❌ Bad
cy.get('.submit-btn').click();
cy.get('#submit').click();
```

### 2. Implement Proper Wait Strategies

```typescript
// ✅ Good - Wait for specific conditions
cy.get('[data-cy="loader"]').should('not.exist');
cy.get('[data-cy="content"]').should('be.visible');

// ❌ Bad - Arbitrary waits
cy.wait(2000);
```

### 3. Use Anti-Flakiness Utilities

```typescript
import { AntiFlakinessUtils } from '../support/performance-utils';

// ✅ Good - Retry with backoff
await AntiFlakinessUtils.retryWithBackoff(async () => {
  cy.get('[data-cy="dynamic-content"]').should('be.visible');
}, 3, 100);

// Wait for stable DOM
AntiFlakinessUtils.waitForStableDOM('[data-cy="container"]', 5000);
```

### 4. Clean Up After Tests

```typescript
afterEach(() => {
  // Clean up DOM
  MemoryManagement.cleanupDOM();
  
  // Clear timers
  MemoryManagement.clearAllTimers();
  
  // Clear React cache
  MemoryManagement.clearReactFiber();
  
  // Clear local storage
  cy.clearLocalStorage();
});
```

### 5. Test Accessibility in Every Component

```typescript
describe('Component', () => {
  it('should be accessible', () => {
    cy.mount(<Component />);
    cy.checkAccessibility();
    cy.testKeyboardNavigation(['[data-cy="input"]', '[data-cy="submit"]']);
  });
});
```

## React Native Web Quirks

### 1. testID vs data-cy

React Native Web automatically converts `testID` props to `data-cy` attributes in the DOM:

```tsx
// React Native component
<TouchableOpacity testID="submit-button">
  <Text>Submit</Text>
</TouchableOpacity>

// In Cypress tests
cy.get('[data-cy="submit-button"]').click();
```

### 2. Touch vs Click Events

React Native Web handles both touch and click events:

```typescript
// For mobile simulation
cy.get('[data-cy="button"]')
  .trigger('touchstart')
  .trigger('touchend');

// For desktop
cy.get('[data-cy="button"]').click();
```

### 3. ScrollView Behavior

React Native ScrollView behaves differently from web scrolling:

```typescript
// Use custom scroll commands
cy.get('[data-cy="scroll-view"]').scrollTo('bottom');

// Or trigger scroll events
cy.get('[data-cy="scroll-view"]').trigger('scroll', {
  scrollTop: 500
});
```

### 4. Text Components

All text must be wrapped in Text components:

```typescript
// This will fail - text not in Text component
cy.mount(<View>Some text</View>);

// This works
cy.mount(<View><Text>Some text</Text></View>);
```

### 5. Style Differences

React Native styles are objects, not CSS:

```typescript
// Check computed styles
cy.get('[data-cy="element"]').should(($el) => {
  const styles = window.getComputedStyle($el[0]);
  expect(styles.display).to.equal('flex'); // Default in RN
});
```

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Component Not Mounting

**Problem**: Component fails to mount in tests
```typescript
// Error: Cannot read property 'Text' of undefined
```

**Solution**: Ensure React Native Web is properly configured
```typescript
// cypress/support/component.tsx
import { configureReactNativeWeb } from './cypress-react-native-web';

before(() => {
  configureReactNativeWeb();
});
```

#### 2. Selectors Not Working

**Problem**: Cannot find elements with selectors
```typescript
// Error: Timed out retrying: Expected to find element: '[data-cy="button"]'
```

**Solution**: Check testID prop and verify conversion
```typescript
// Component
<Button testID="submit-button" />

// Test - use data-cy in tests
cy.get('[data-cy="submit-button"]');

// Debug - log available selectors
cy.get('body').then($body => {
  console.log($body.find('[data-cy]').map((i, el) => el.getAttribute('data-cy')));
});
```

#### 3. Async State Updates

**Problem**: State changes not reflected immediately
```typescript
// State update not visible in test
```

**Solution**: Wait for state updates
```typescript
// Use should with callback
cy.get('[data-cy="counter"]').should(($el) => {
  expect($el.text()).to.equal('5');
});

// Or use waitForStableDOM
AntiFlakinessUtils.waitForStableDOM('[data-cy="container"]');
```

#### 4. Memory Leaks

**Problem**: Tests consuming too much memory
```typescript
// Error: JavaScript heap out of memory
```

**Solution**: Implement proper cleanup
```typescript
afterEach(() => {
  MemoryManagement.performCleanup();
});

// For heavy tests
beforeEach(() => {
  MemoryManagement.forceGarbageCollection();
});
```

#### 5. Flaky Tests

**Problem**: Tests pass/fail inconsistently

**Solution**: Use anti-flakiness utilities
```typescript
// Retry mechanism
await AntiFlakinessUtils.retryWithBackoff(async () => {
  // Test logic
}, 3, 100);

// Wait for network idle
await AntiFlakinessUtils.waitForNetworkIdle(3000);

// Ensure element is interactable
AntiFlakinessUtils.ensureInteractable('[data-cy="button"]');
```

## Performance Guidelines

### Optimization Strategies

1. **Use Performance Budgets**
```typescript
const budgets = {
  componentMount: 100,   // ms
  interaction: 200,      // ms
  navigation: 300,       // ms
};
```

2. **Batch Operations**
```typescript
TestOptimization.batchDOMOperations([
  () => cy.get('[data-cy="input1"]').type('text1'),
  () => cy.get('[data-cy="input2"]').type('text2'),
]);
```

3. **Parallel Test Execution**
```typescript
await TestOptimization.runParallel(tasks, 3); // max concurrency
```

4. **Lazy Load Fixtures**
```typescript
const fixture = OptimizedHelpers.lazyFixture('large-dataset');
```

5. **Monitor Performance**
```typescript
// Add to test suite
setupPerformanceHooks();

// Generate report
after(() => {
  generatePerformanceReport();
});
```

### Memory Management Best Practices

1. **Regular Cleanup**: Clean up after each test
2. **Snapshot Comparison**: Monitor memory growth
3. **Garbage Collection**: Force GC when needed
4. **DOM Cleanup**: Remove test containers
5. **Event Listener Cleanup**: Remove all listeners

### Test Speed Optimization

1. **Minimize Waits**: Use conditions, not arbitrary delays
2. **Stub Network Calls**: Use fixtures for API responses
3. **Optimize Selectors**: Use specific data-cy attributes
4. **Batch Assertions**: Group related assertions
5. **Skip Animations**: Disable in test environment

## Continuous Improvement

### Metrics to Track

- Test execution time
- Memory usage
- Flakiness rate
- Coverage percentage
- Accessibility score

### Regular Audits

1. Weekly: Review flaky tests
2. Monthly: Performance audit
3. Quarterly: Accessibility review
4. Per Release: Full test suite validation

### Contributing

When adding new test utilities:

1. Document the utility purpose and usage
2. Add TypeScript types
3. Include example tests
4. Update this guide
5. Add to appropriate category

---

Last Updated: 2025-09-17
Version: 1.0.0
# React Native Web Testing Quirks & Solutions

This document covers specific quirks, issues, and solutions when testing React Native Web applications with Cypress.

## Table of Contents

1. [Component Differences](#component-differences)
2. [Event Handling Quirks](#event-handling-quirks)
3. [Styling & Layout Issues](#styling--layout-issues)
4. [Platform-Specific Behavior](#platform-specific-behavior)
5. [Testing Strategies](#testing-strategies)
6. [Common Pitfalls](#common-pitfalls)
7. [Solutions Reference](#solutions-reference)

## Component Differences

### Text Components

#### Quirk: Text Must Be in Text Components
React Native requires all text to be wrapped in `<Text>` components.

```tsx
// ❌ This will crash
<View>
  Hello World
</View>

// ✅ Correct
<View>
  <Text>Hello World</Text>
</View>
```

**Testing Impact**: Tests will fail if text is not properly wrapped.

```typescript
// Test will fail if text is not in Text component
cy.mount(<View>Test</View>); // Error!

// Correct test
cy.mount(<View><Text>Test</Text></View>);
```

### TouchableOpacity vs Button

#### Quirk: No Native Button Component
React Native doesn't have a traditional HTML button.

```tsx
// ❌ HTML approach (won't work)
<button onClick={handleClick}>Click me</button>

// ✅ React Native approach
<TouchableOpacity onPress={handlePress}>
  <Text>Click me</Text>
</TouchableOpacity>
```

**Testing Solution**:
```typescript
// Use testID for selection
cy.get('[data-cy="button"]').click(); // Works with TouchableOpacity
```

### TextInput Differences

#### Quirk: Different Event Names
React Native uses `onChangeText` instead of `onChange`.

```tsx
// React Native TextInput
<TextInput
  value={value}
  onChangeText={setValue} // Not onChange!
  testID="input"
/>
```

**Testing Solution**:
```typescript
// Cypress still uses .type() normally
cy.get('[data-cy="input"]').type('text');

// For clearing
cy.get('[data-cy="input"]').clear();
```

## Event Handling Quirks

### Touch Events

#### Quirk: Touch Events vs Click Events
Mobile components expect touch events, but Cypress uses click.

**Solution**: Create helper for touch simulation
```typescript
// cypress/support/commands.ts
Cypress.Commands.add('touch', (selector: string) => {
  cy.get(selector)
    .trigger('touchstart')
    .trigger('touchend');
});

// Usage
cy.touch('[data-cy="touchable"]');
```

### Gesture Handling

#### Quirk: Swipe and Pan Gestures
React Native gesture handlers don't work with standard Cypress.

**Solution**: Simulate gestures
```typescript
Cypress.Commands.add('swipeLeft', (selector: string) => {
  cy.get(selector)
    .trigger('touchstart', { position: 'right' })
    .trigger('touchmove', { position: 'center' })
    .trigger('touchmove', { position: 'left' })
    .trigger('touchend', { position: 'left' });
});
```

### Keyboard Events

#### Quirk: Different Keyboard Handling
React Native keyboard events differ from web.

```typescript
// React Native keyboard dismissal
import { Keyboard } from 'react-native';

// In component
Keyboard.dismiss();
```

**Testing Solution**:
```typescript
// Simulate keyboard dismissal
cy.get('body').click(0, 0); // Click outside
```

## Styling & Layout Issues

### Flexbox Default

#### Quirk: All Views are Flex Containers
React Native Views default to `display: flex` with `flexDirection: column`.

```tsx
// This has flex layout by default
<View>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</View>
```

**Testing Impact**:
```typescript
// Check layout
cy.get('[data-cy="container"]').should('have.css', 'display', 'flex');
cy.get('[data-cy="container"]').should('have.css', 'flex-direction', 'column');
```

### No CSS Classes

#### Quirk: Style Objects Instead of Classes
React Native uses style objects, not CSS classes.

```tsx
// ❌ Won't work
<View className="container">

// ✅ React Native way
<View style={styles.container}>
```

**Testing Solution**:
```typescript
// Can't select by class, use data-cy
cy.get('[data-cy="container"]'); // Not .container
```

### Absolute Positioning

#### Quirk: Different Position Behavior
Position absolute works differently in React Native.

```tsx
const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }
});
```

**Testing Impact**:
```typescript
// Check positioning
cy.get('[data-cy="overlay"]').should(($el) => {
  const styles = window.getComputedStyle($el[0]);
  expect(styles.position).to.equal('absolute');
});
```

## Platform-Specific Behavior

### Platform Detection

#### Quirk: Platform.OS Differences
Components may render differently based on platform.

```tsx
import { Platform } from 'react-native';

const MyComponent = () => {
  if (Platform.OS === 'web') {
    return <WebVersion />;
  }
  return <MobileVersion />;
};
```

**Testing Solution**:
```typescript
// Mock platform if needed
cy.window().then((win) => {
  win.Platform = { OS: 'web' };
});
```

### ScrollView Behavior

#### Quirk: ScrollView vs Web Scrolling
React Native ScrollView doesn't behave like web scroll.

```tsx
<ScrollView>
  <Content />
</ScrollView>
```

**Testing Solution**:
```typescript
// Custom scroll command
Cypress.Commands.add('scrollToBottom', (selector: string) => {
  cy.get(selector).scrollTo('bottom', { duration: 0 });
});

// Or trigger scroll event
cy.get('[data-cy="scroll-view"]').trigger('scroll', {
  target: { scrollTop: 1000 }
});
```

### Image Loading

#### Quirk: Image Component Requirements
React Native Image requires explicit dimensions.

```tsx
// ❌ Won't display
<Image source={{ uri: 'image.jpg' }} />

// ✅ With dimensions
<Image 
  source={{ uri: 'image.jpg' }}
  style={{ width: 200, height: 200 }}
/>
```

**Testing Solution**:
```typescript
// Wait for image load
cy.get('[data-cy="image"]').should('be.visible');
cy.get('[data-cy="image"]').should('have.attr', 'src');
```

## Testing Strategies

### Component Mounting

#### Strategy: Use TestProviders
Wrap components with necessary providers.

```typescript
// cypress/support/test-providers.tsx
export const TestProviders = ({ children }) => (
  <SafeAreaProvider>
    <NavigationContainer>
      {children}
    </NavigationContainer>
  </SafeAreaProvider>
);

// In tests
cy.mountWithProviders(<MyComponent />);
```

### Async State Updates

#### Strategy: Wait for State Changes
React Native state updates may be async.

```typescript
// Wait for state update
cy.get('[data-cy="counter"]').should('have.text', '5');

// Or use custom wait
cy.waitForState('[data-cy="loading"]', 'not.exist');
```

### Navigation Testing

#### Strategy: Mock Navigation
React Navigation requires special handling.

```typescript
// Mock navigation prop
const mockNavigation = {
  navigate: cy.stub(),
  goBack: cy.stub(),
};

cy.mount(<Screen navigation={mockNavigation} />);

// Verify navigation
cy.get('[data-cy="next-button"]').click();
cy.wrap(mockNavigation.navigate).should('have.been.calledWith', 'NextScreen');
```

## Common Pitfalls

### 1. testID vs data-cy Confusion

**Problem**: Using wrong selector attribute
```typescript
// Component has testID
<View testID="container">

// ❌ Wrong - looking for data-cy in source
cy.get('[testID="container"]'); // Won't work

// ✅ Right - React Native Web converts testID to data-cy
cy.get('[data-cy="container"]');
```

### 2. Style Property Access

**Problem**: Trying to access styles incorrectly
```typescript
// ❌ Wrong - React Native styles are objects
cy.get('[data-cy="element"]').should('have.css', 'backgroundColor', 'red');

// ✅ Right - Use computed styles
cy.get('[data-cy="element"]').should(($el) => {
  const styles = window.getComputedStyle($el[0]);
  expect(styles.backgroundColor).to.equal('rgb(255, 0, 0)');
});
```

### 3. Animation Interference

**Problem**: Animations causing test flakiness
```typescript
// Disable animations in test environment
const styles = StyleSheet.create({
  animated: {
    // Disable in tests
    ...(Cypress ? {} : {
      transform: [{ translateX: animatedValue }]
    })
  }
});
```

### 4. Modal Testing

**Problem**: React Native Modal renders outside normal tree
```typescript
// Solution: Select modal content directly
cy.get('[data-cy="modal-content"]').should('be.visible');

// Or check portal
cy.get('body').find('[data-cy="modal"]').should('exist');
```

### 5. FlatList/VirtualizedList

**Problem**: Virtualization hiding elements
```typescript
// Solution: Scroll to item first
cy.get('[data-cy="list"]').scrollTo('bottom');
cy.get('[data-cy="item-99"]').should('be.visible');

// Or disable virtualization in tests
<FlatList
  data={data}
  removeClippedSubviews={false} // For tests
  initialNumToRender={data.length} // Render all
/>
```

## Solutions Reference

### Custom Commands

```typescript
// cypress/support/react-native-commands.ts

// Touch simulation
Cypress.Commands.add('rnTouch', (selector) => {
  cy.get(selector).trigger('touchstart').trigger('touchend');
});

// Text input for RN
Cypress.Commands.add('rnType', (selector, text) => {
  cy.get(selector).type(text);
  cy.get(selector).trigger('blur'); // Trigger onEndEditing
});

// ScrollView scrolling
Cypress.Commands.add('rnScroll', (selector, direction) => {
  const scrollMap = {
    top: { x: 0, y: 0 },
    bottom: { x: 0, y: 9999 },
    left: { x: 0, y: 0 },
    right: { x: 9999, y: 0 },
  };
  
  cy.get(selector).scrollTo(scrollMap[direction].x, scrollMap[direction].y);
});

// Swipe gesture
Cypress.Commands.add('rnSwipe', (selector, direction) => {
  const positions = {
    left: { start: 'right', end: 'left' },
    right: { start: 'left', end: 'right' },
    up: { start: 'bottom', end: 'top' },
    down: { start: 'top', end: 'bottom' },
  };
  
  const { start, end } = positions[direction];
  cy.get(selector)
    .trigger('touchstart', { position: start })
    .trigger('touchmove', { position: end })
    .trigger('touchend', { position: end });
});
```

### Helper Utilities

```typescript
// cypress/support/rn-helpers.ts

export const RNHelpers = {
  // Wait for React Native to be ready
  waitForRN: () => {
    cy.window().should('have.property', '__REACT_NATIVE_BUNDLE_READY__');
  },
  
  // Mock Platform
  mockPlatform: (os: 'ios' | 'android' | 'web') => {
    cy.window().then((win) => {
      win.Platform = { OS: os };
    });
  },
  
  // Mock Dimensions
  mockDimensions: (width: number, height: number) => {
    cy.window().then((win) => {
      win.Dimensions = {
        get: () => ({ width, height }),
      };
    });
  },
  
  // Handle Safe Area
  mockSafeArea: (insets = { top: 0, bottom: 0, left: 0, right: 0 }) => {
    cy.window().then((win) => {
      win.__SAFE_AREA_INSETS__ = insets;
    });
  },
};
```

### Configuration

```typescript
// cypress/support/component.tsx
import { configureReactNativeWeb } from './cypress-react-native-web';

// Configure React Native Web
before(() => {
  configureReactNativeWeb();
  
  // Set up platform
  cy.window().then((win) => {
    win.Platform = { OS: 'web' };
  });
});

// Clean up after each test
afterEach(() => {
  // Clear React Native cache
  cy.window().then((win) => {
    if (win.__REACT_NATIVE_CACHE__) {
      win.__REACT_NATIVE_CACHE__.clear();
    }
  });
});
```

### Testing Patterns

```typescript
// Pattern: Testing responsive behavior
describe('Responsive Component', () => {
  [
    { device: 'mobile', width: 375, height: 667 },
    { device: 'tablet', width: 768, height: 1024 },
    { device: 'desktop', width: 1920, height: 1080 },
  ].forEach(({ device, width, height }) => {
    it(`should render correctly on ${device}`, () => {
      cy.viewport(width, height);
      RNHelpers.mockDimensions(width, height);
      
      cy.mount(<ResponsiveComponent />);
      
      // Device-specific assertions
      if (device === 'mobile') {
        cy.get('[data-cy="mobile-menu"]').should('be.visible');
      } else {
        cy.get('[data-cy="desktop-menu"]').should('be.visible');
      }
    });
  });
});

// Pattern: Testing platform-specific code
describe('Platform Specific', () => {
  ['ios', 'android', 'web'].forEach((platform) => {
    it(`should work on ${platform}`, () => {
      RNHelpers.mockPlatform(platform);
      
      cy.mount(<PlatformComponent />);
      
      // Platform-specific checks
      cy.get(`[data-cy="${platform}-content"]`).should('be.visible');
    });
  });
});
```

## Summary

Key takeaways for React Native Web testing:

1. **Always use testID** - Converts to data-cy automatically
2. **Expect flex layout** - All Views are flex containers
3. **No HTML elements** - Use RN components only
4. **Style objects** - Not CSS classes
5. **Touch events** - May need custom handling
6. **Platform awareness** - Components may render differently
7. **Async updates** - State changes may not be immediate
8. **Virtualization** - Lists may hide elements

Remember: React Native Web is a compatibility layer, not a 1:1 web framework. Understanding these quirks will make your tests more reliable and maintainable.

---

Last Updated: 2025-09-17
Version: 1.0.0
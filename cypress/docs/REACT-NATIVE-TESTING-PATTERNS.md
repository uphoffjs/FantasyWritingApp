# React Native Testing Patterns for Cypress

## 📱 Overview

This guide covers specific patterns and considerations for testing React Native applications through React Native Web using Cypress. These patterns address the unique challenges of testing cross-platform mobile-first applications in a web testing environment.

## 🎯 Key React Native Web Transformations

### Understanding the Bridge
React Native Web transforms React Native components and APIs to web equivalents:

| React Native | React Native Web (DOM) | Testing Implications |
|--------------|------------------------|---------------------|
| `<View>` | `<div>` | Standard div selectors work |
| `<Text>` | `<span>` | Text content in spans |
| `<TextInput>` | `<input>` | Standard input interactions |
| `<TouchableOpacity>` | `<div role="button">` | Click events work, touch simulation needed |
| `<ScrollView>` | `<div>` with scroll | Standard scroll commands |
| `<FlatList>` | `<div>` with virtualization | Special handling for virtual items |
| `testID="foo"` | `data-cy="foo"` | Automatic conversion |
| `AsyncStorage` | `localStorage` | Direct localStorage access |

## 🔧 Component Testing Patterns

### 1. Testing React Native Components

#### View Component Testing
```javascript
describe('React Native View', () => {
  it('should render View as div', () => {
    cy.mount(
      <View testID="container" style={{ padding: 20 }}>
        <Text testID="label">Hello World</Text>
      </View>
    );
    
    // * View becomes div with data-cy
    cy.get('[data-cy="container"]')
      .should('exist')
      .and('have.css', 'padding', '20px');
    
    // * Text becomes span
    cy.get('[data-cy="label"]')
      .should('have.text', 'Hello World');
  });
});
```

#### TextInput Component Testing
```javascript
describe('React Native TextInput', () => {
  it('should handle text input correctly', () => {
    let value = '';
    
    cy.mount(
      <TextInput
        testID="name-input"
        placeholder="Enter name"
        value={value}
        onChangeText={(text) => { value = text; }}
        autoCapitalize="words"
        keyboardType="default"
      />
    );
    
    // * TextInput becomes input element
    cy.get('[data-cy="name-input"]')
      .should('have.attr', 'placeholder', 'Enter name')
      .type('Gandalf the Grey')
      .should('have.value', 'Gandalf the Grey');
    
    // * Test React Native specific props
    cy.get('[data-cy="name-input"]')
      .should('have.attr', 'autocapitalize', 'words');
  });
});
```

#### TouchableOpacity Testing
```javascript
describe('TouchableOpacity', () => {
  it('should handle press events', () => {
    const onPress = cy.stub();
    const onLongPress = cy.stub();
    
    cy.mount(
      <TouchableOpacity
        testID="action-button"
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
      >
        <Text>Press Me</Text>
      </TouchableOpacity>
    );
    
    // * Regular press (tap)
    cy.get('[data-cy="action-button"]').click();
    cy.wrap(onPress).should('have.been.called');
    
    // * Long press simulation
    cy.get('[data-cy="action-button"]')
      .trigger('mousedown')
      .wait(500)
      .trigger('mouseup');
    cy.wrap(onLongPress).should('have.been.called');
    
    // * Check opacity change on press
    cy.get('[data-cy="action-button"]')
      .trigger('mousedown')
      .should('have.css', 'opacity', '0.7');
  });
});
```

### 2. Testing Scrollable Components

#### ScrollView Testing
```javascript
describe('ScrollView', () => {
  it('should handle scrolling', () => {
    const items = Array.from({ length: 50 }, (_, i) => `Item ${i}`);
    
    cy.mount(
      <ScrollView
        testID="scroll-container"
        style={{ height: 300 }}
      >
        {items.map(item => (
          <Text key={item} testID={`item-${item}`}>
            {item}
          </Text>
        ))}
      </ScrollView>
    );
    
    // * Check initial visibility
    cy.get('[data-cy="item-Item 0"]').should('be.visible');
    cy.get('[data-cy="item-Item 49"]').should('not.be.visible');
    
    // * Scroll to bottom
    cy.get('[data-cy="scroll-container"]').scrollTo('bottom');
    
    // * Check visibility after scroll
    cy.get('[data-cy="item-Item 49"]').should('be.visible');
  });
});
```

#### FlatList Testing (Virtualized Lists)
```javascript
describe('FlatList', () => {
  it('should handle virtualized rendering', () => {
    const data = Array.from({ length: 1000 }, (_, i) => ({
      id: `item-${i}`,
      title: `Item ${i}`
    }));
    
    cy.mount(
      <FlatList
        testID="flat-list"
        data={data}
        renderItem={({ item }) => (
          <Text testID={item.id}>{item.title}</Text>
        )}
        keyExtractor={item => item.id}
        initialNumToRender={10}
        windowSize={21}
      />
    );
    
    // * Only initial items are rendered
    cy.get('[data-cy^="item-"]').should('have.length.lessThan', 50);
    
    // * Scroll to trigger virtualization
    cy.get('[data-cy="flat-list"]').scrollTo(0, 5000);
    
    // * New items are rendered
    cy.get('[data-cy="item-100"]').should('exist');
    
    // * Old items might be unmounted (virtualization)
    cy.get('[data-cy="item-0"]').should('not.exist');
  });
});
```

### 3. Testing Navigation

#### React Navigation Testing
```javascript
describe('React Navigation', () => {
  it('should navigate between screens', () => {
    // * Mock navigation prop
    const navigation = {
      navigate: cy.stub(),
      goBack: cy.stub(),
      push: cy.stub(),
      replace: cy.stub()
    };
    
    cy.mount(
      <NavigationContainer>
        <HomeScreen navigation={navigation} />
      </NavigationContainer>
    );
    
    // * Test navigation calls
    cy.get('[data-cy="go-to-details"]').click();
    cy.wrap(navigation.navigate)
      .should('have.been.calledWith', 'Details', { id: 123 });
    
    // * Test back navigation
    cy.get('[data-cy="back-button"]').click();
    cy.wrap(navigation.goBack).should('have.been.called');
  });
  
  it('should handle deep linking', () => {
    // * Test URL-based navigation
    cy.visit('/app/elements/element-123');
    cy.get('[data-cy="element-editor"]').should('be.visible');
    cy.get('[data-cy="element-id"]').should('contain', 'element-123');
  });
});
```

## 📱 Mobile-Specific Patterns

### 1. Touch Gesture Simulation

```javascript
// cypress/support/commands/mobile/touchGestures.js
Cypress.Commands.add('swipe', (selector, direction, distance = 100) => {
  const directions = {
    left: { start: { x: 200, y: 100 }, end: { x: 100, y: 100 } },
    right: { start: { x: 100, y: 100 }, end: { x: 200, y: 100 } },
    up: { start: { x: 150, y: 200 }, end: { x: 150, y: 100 } },
    down: { start: { x: 150, y: 100 }, end: { x: 150, y: 200 } }
  };
  
  const gesture = directions[direction];
  
  cy.get(selector)
    .trigger('touchstart', {
      touches: [{ 
        clientX: gesture.start.x, 
        clientY: gesture.start.y 
      }]
    })
    .trigger('touchmove', {
      touches: [{ 
        clientX: gesture.end.x, 
        clientY: gesture.end.y 
      }]
    })
    .trigger('touchend');
});

// Usage
cy.swipe('[data-cy="element-card"]', 'left');
cy.get('[data-cy="delete-action"]').should('be.visible');
```

### 2. Keyboard Handling

```javascript
describe('Keyboard Interactions', () => {
  it('should handle keyboard events', () => {
    cy.mount(
      <TextInput
        testID="search-input"
        onSubmitEditing={onSearch}
        returnKeyType="search"
      />
    );
    
    // * Type and submit with enter
    cy.get('[data-cy="search-input"]')
      .type('dragon{enter}');
    
    // * Verify search was triggered
    cy.wrap(onSearch).should('have.been.calledWith', 'dragon');
  });
  
  it('should handle keyboard dismissal', () => {
    // * Simulate keyboard dismiss
    cy.get('[data-cy="input-field"]').focus();
    cy.get('body').click(0, 0); // Click outside
    cy.get('[data-cy="input-field"]').should('not.have.focus');
  });
});
```

### 3. Platform-Specific Testing

```javascript
describe('Platform-Specific Behavior', () => {
  it('should detect platform correctly', () => {
    cy.window().then((win) => {
      // * React Native Web sets Platform.OS to 'web'
      expect(win.Platform.OS).to.equal('web');
      
      // * Can override for testing
      win.Platform.OS = 'ios';
      cy.mount(<PlatformSpecificComponent />);
      cy.get('[data-cy="ios-specific"]').should('exist');
      
      win.Platform.OS = 'android';
      cy.mount(<PlatformSpecificComponent />);
      cy.get('[data-cy="android-specific"]').should('exist');
    });
  });
});
```

## 💾 Storage Testing Patterns

### 1. AsyncStorage (localStorage in Web)

```javascript
describe('AsyncStorage Testing', () => {
  it('should handle AsyncStorage operations', () => {
    // * Set data
    cy.window().then((win) => {
      // React Native AsyncStorage becomes localStorage
      win.localStorage.setItem(
        '@FantasyApp:user_preferences',
        JSON.stringify({ theme: 'dark', language: 'en' })
      );
    });
    
    // * Verify component reads from storage
    cy.mount(<PreferencesComponent />);
    cy.get('[data-cy="theme-selector"]')
      .should('have.value', 'dark');
    
    // * Test storage updates
    cy.get('[data-cy="theme-selector"]').select('light');
    
    cy.window().then((win) => {
      const prefs = JSON.parse(
        win.localStorage.getItem('@FantasyApp:user_preferences')
      );
      expect(prefs.theme).to.equal('light');
    });
  });
});
```

### 2. Zustand Store Testing

```javascript
describe('Zustand Store', () => {
  it('should persist state correctly', () => {
    // * Set initial store state
    cy.window().then((win) => {
      const initialState = {
        projects: [{ id: '1', name: 'Test Project' }],
        elements: []
      };
      
      win.localStorage.setItem(
        'fantasy-app-store',
        JSON.stringify(initialState)
      );
    });
    
    // * Mount component that uses store
    cy.mount(<ProjectList />);
    
    // * Verify store data is displayed
    cy.get('[data-cy="project-1"]')
      .should('contain', 'Test Project');
    
    // * Test store updates
    cy.get('[data-cy="add-project"]').click();
    cy.get('[data-cy="project-name"]').type('New Project');
    cy.get('[data-cy="save-project"]').click();
    
    // * Verify persistence
    cy.window().then((win) => {
      const state = JSON.parse(
        win.localStorage.getItem('fantasy-app-store')
      );
      expect(state.projects).to.have.length(2);
    });
  });
});
```

## 🎨 Style and Layout Testing

### 1. Flexbox Layout Testing

```javascript
describe('React Native Flexbox', () => {
  it('should handle flexbox layouts', () => {
    cy.mount(
      <View style={{ 
        flex: 1, 
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Text testID="left">Left</Text>
        <Text testID="center">Center</Text>
        <Text testID="right">Right</Text>
      </View>
    );
    
    // * Check flexbox conversion
    cy.get('[data-cy="left"]').parent()
      .should('have.css', 'display', 'flex')
      .and('have.css', 'flex-direction', 'row')
      .and('have.css', 'justify-content', 'space-between')
      .and('have.css', 'align-items', 'center');
  });
});
```

### 2. Responsive Testing

```javascript
describe('Responsive Design', () => {
  const viewports = [
    { name: 'iphone-x', width: 375, height: 812 },
    { name: 'ipad', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 }
  ];
  
  viewports.forEach(viewport => {
    it(`should render correctly on ${viewport.name}`, () => {
      cy.viewport(viewport.width, viewport.height);
      
      cy.mount(<ResponsiveComponent />);
      
      // * Mobile
      if (viewport.width < 768) {
        cy.get('[data-cy="mobile-menu"]').should('be.visible');
        cy.get('[data-cy="desktop-sidebar"]').should('not.exist');
      }
      // * Tablet
      else if (viewport.width < 1024) {
        cy.get('[data-cy="tablet-layout"]').should('be.visible');
      }
      // * Desktop
      else {
        cy.get('[data-cy="desktop-sidebar"]').should('be.visible');
        cy.get('[data-cy="mobile-menu"]').should('not.exist');
      }
    });
  });
});
```

## 🔄 Animation Testing

### 1. React Native Reanimated

```javascript
describe('Animations', () => {
  it('should test animated components', () => {
    cy.mount(<AnimatedComponent />);
    
    // * Trigger animation
    cy.get('[data-cy="animate-button"]').click();
    
    // * Wait for animation to start
    cy.wait(100);
    
    // * Check intermediate state
    cy.get('[data-cy="animated-view"]')
      .should('have.css', 'opacity')
      .and('match', /0\.\d+/);
    
    // * Wait for animation to complete
    cy.wait(500);
    
    // * Check final state
    cy.get('[data-cy="animated-view"]')
      .should('have.css', 'opacity', '1');
  });
});
```

## 🛠️ Common Patterns & Solutions

### Pattern 1: Modal Testing
```javascript
describe('Modal Component', () => {
  it('should handle modal lifecycle', () => {
    cy.mount(<ModalExample />);
    
    // * Open modal
    cy.get('[data-cy="open-modal"]').click();
    
    // * Modal backdrop and content
    cy.get('[data-cy="modal-backdrop"]').should('be.visible');
    cy.get('[data-cy="modal-content"]').should('be.visible');
    
    // * Test modal interaction
    cy.get('[data-cy="modal-input"]').type('Test Data');
    cy.get('[data-cy="modal-submit"]').click();
    
    // * Modal should close
    cy.get('[data-cy="modal-backdrop"]').should('not.exist');
  });
});
```

### Pattern 2: Pull-to-Refresh
```javascript
describe('Pull to Refresh', () => {
  it('should handle pull-to-refresh gesture', () => {
    cy.mount(<RefreshableList />);
    
    // * Simulate pull-to-refresh
    cy.get('[data-cy="scrollable-list"]')
      .trigger('touchstart', { touches: [{ clientY: 100 }] })
      .trigger('touchmove', { touches: [{ clientY: 200 }] })
      .trigger('touchend');
    
    // * Check refresh indicator
    cy.get('[data-cy="refresh-indicator"]').should('be.visible');
    
    // * Wait for refresh to complete
    cy.get('[data-cy="refresh-indicator"]', { timeout: 5000 })
      .should('not.exist');
    
    // * Verify data refreshed
    cy.get('[data-cy="list-item-0"]')
      .should('contain', 'Updated Data');
  });
});
```

### Pattern 3: Image Loading
```javascript
describe('Image Component', () => {
  it('should handle image loading states', () => {
    cy.mount(
      <Image
        testID="element-image"
        source={{ uri: 'https://example.com/image.png' }}
        onLoad={cy.stub().as('onLoad')}
        onError={cy.stub().as('onError')}
      />
    );
    
    // * Image converts to img tag
    cy.get('[data-cy="element-image"]')
      .should('have.attr', 'src', 'https://example.com/image.png');
    
    // * Wait for load event
    cy.get('@onLoad').should('have.been.called');
  });
});
```

## 🚨 Common Issues & Solutions

### Issue 1: testID Not Found
**Problem**: `testID` props not appearing in DOM.

**Solution**:
```javascript
// Ensure React Native Web is configured correctly
cy.get('[testID="my-element"]').should('not.exist');
cy.get('[data-cy="my-element"]').should('exist'); // Use data-cy instead
```

### Issue 2: Touch Events Not Working
**Problem**: Touch events not triggering correctly.

**Solution**:
```javascript
// Use mouse events as fallback
cy.get('[data-cy="touchable"]')
  .trigger('mousedown')
  .trigger('mouseup');
  
// Or use custom touch simulation
cy.simulateTouch('[data-cy="touchable"]', 'tap');
```

### Issue 3: FlatList Items Not Visible
**Problem**: Virtualized list items not in DOM.

**Solution**:
```javascript
// Scroll to make items visible
cy.get('[data-cy="flat-list"]').scrollTo(0, 1000);
cy.wait(100); // Wait for virtualization
cy.get('[data-cy="item-50"]').should('exist');
```

### Issue 4: AsyncStorage Not Persisting
**Problem**: AsyncStorage data lost between tests.

**Solution**:
```javascript
beforeEach(() => {
  // Preserve localStorage between tests
  cy.window().then((win) => {
    win.localStorage.setItem('preserve', 'true');
  });
});
```

## ✅ Best Practices

1. **Always use testID/data-cy** for element selection
2. **Test across multiple viewports** for responsive apps
3. **Simulate touch gestures** for mobile interactions
4. **Handle platform differences** explicitly
5. **Test navigation flows** comprehensively
6. **Mock native modules** when necessary
7. **Use custom commands** for repeated patterns
8. **Test offline scenarios** with network stubbing
9. **Validate accessibility** on all components
10. **Monitor performance** during tests

## 📚 Additional Resources

- [React Native Web Documentation](https://necolas.github.io/react-native-web/)
- [React Navigation Testing](https://reactnavigation.org/docs/testing/)
- [Cypress Mobile Testing](https://docs.cypress.io/guides/references/viewport)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
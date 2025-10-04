# Test Patterns Library

## 📚 Ready-to-Use Test Templates and Patterns

This document provides copy-paste ready test patterns for common scenarios in the Fantasy Writing App.

---

## Table of Contents

1. [Component Test Templates](#component-test-templates)
2. [Hook Test Patterns](#hook-test-patterns)
3. [Store Test Patterns](#store-test-patterns)
4. [Async Test Patterns](#async-test-patterns)
5. [Navigation Test Patterns](#navigation-test-patterns)
6. [Form Test Patterns](#form-test-patterns)
7. [List Test Patterns](#list-test-patterns)
8. [Modal Test Patterns](#modal-test-patterns)
9. [Error Handling Patterns](#error-handling-patterns)
10. [Performance Test Patterns](#performance-test-patterns)

---

## Component Test Templates

### Basic Component Template
```javascript
// __tests__/components/[ComponentName].test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { [ComponentName] } from '../../src/components/[ComponentName]';
import { renderWithProviders } from '../../src/test/testUtils';

describe('[ComponentName]', () => {
  // Default props for consistency
  const defaultProps = {
    // Add default prop values
  };

  // Clean up mocks between tests
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(
        <[ComponentName] {...defaultProps} />
      );
      expect(getByTestId('[component-name]')).toBeTruthy();
    });

    it('should render with custom props', () => {
      const { getByText } = render(
        <[ComponentName] {...defaultProps} title="Custom Title" />
      );
      expect(getByText('Custom Title')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should handle user interaction', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <[ComponentName] {...defaultProps} onPress={onPress} />
      );

      fireEvent.press(getByTestId('[action-button]'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('State Changes', () => {
    it('should update state on action', () => {
      const { getByTestId, getByText } = render(
        <[ComponentName] {...defaultProps} />
      );

      fireEvent.press(getByTestId('[toggle-button]'));
      expect(getByText('Active')).toBeTruthy();
    });
  });
});
```

### Component with Provider Template
```javascript
describe('[ComponentName] with Store', () => {
  const mockStore = {
    // Mock store state
    items: [],
    addItem: jest.fn(),
    removeItem: jest.fn(),
  };

  it('should interact with store', () => {
    const { getByTestId } = renderWithProviders(
      <[ComponentName] />,
      { store: mockStore }
    );

    fireEvent.press(getByTestId('add-button'));
    expect(mockStore.addItem).toHaveBeenCalled();
  });
});
```

---

## Hook Test Patterns

### Custom Hook Template
```javascript
// __tests__/hooks/use[HookName].test.tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { use[HookName] } from '../../src/hooks/use[HookName]';

describe('use[HookName]', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => use[HookName]());

    expect(result.current.value).toBe(initialValue);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should update value when action is called', () => {
    const { result } = renderHook(() => use[HookName]());

    act(() => {
      result.current.updateValue('new value');
    });

    expect(result.current.value).toBe('new value');
  });

  it('should handle async operations', async () => {
    const { result, waitForNextUpdate } = renderHook(() => use[HookName]());

    act(() => {
      result.current.fetchData();
    });

    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeDefined();
  });
});
```

### Hook with Dependencies Template
```javascript
describe('use[HookName] with dependencies', () => {
  it('should re-run when dependency changes', () => {
    const { result, rerender } = renderHook(
      ({ dep }) => use[HookName](dep),
      { initialProps: { dep: 'initial' } }
    );

    expect(result.current.value).toBe('initial-processed');

    rerender({ dep: 'updated' });

    expect(result.current.value).toBe('updated-processed');
  });
});
```

---

## Store Test Patterns

### Zustand Store Template
```javascript
// __tests__/store/[storeName].test.tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { use[StoreName] } from '../../src/store/[storeName]';

describe('[StoreName] Store', () => {
  beforeEach(() => {
    // Reset store to initial state
    const store = use[StoreName].getState();
    act(() => {
      store.reset();
    });
  });

  describe('Actions', () => {
    it('should add item to store', () => {
      const { result } = renderHook(() => use[StoreName]());

      act(() => {
        result.current.addItem({ id: '1', name: 'Test Item' });
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].name).toBe('Test Item');
    });

    it('should update item in store', () => {
      const { result } = renderHook(() => use[StoreName]());

      act(() => {
        result.current.addItem({ id: '1', name: 'Original' });
        result.current.updateItem('1', { name: 'Updated' });
      });

      expect(result.current.items[0].name).toBe('Updated');
    });

    it('should remove item from store', () => {
      const { result } = renderHook(() => use[StoreName]());

      act(() => {
        result.current.addItem({ id: '1', name: 'Test' });
        result.current.removeItem('1');
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('Selectors', () => {
    it('should compute derived state', () => {
      const { result } = renderHook(() => use[StoreName]());

      act(() => {
        result.current.addItem({ id: '1', completed: true });
        result.current.addItem({ id: '2', completed: false });
      });

      expect(result.current.completedCount).toBe(1);
      expect(result.current.pendingCount).toBe(1);
    });
  });

  describe('Persistence', () => {
    it('should persist to AsyncStorage', async () => {
      const { result } = renderHook(() => use[StoreName]());

      act(() => {
        result.current.addItem({ id: '1', name: 'Persistent' });
      });

      await act(async () => {
        await result.current.persist();
      });

      const stored = await AsyncStorage.getItem('[store-key]');
      expect(JSON.parse(stored)).toEqual(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({ name: 'Persistent' })
          ])
        })
      );
    });
  });
});
```

---

## Async Test Patterns

### API Call Testing
```javascript
describe('Async API Calls', () => {
  it('should handle successful API call', async () => {
    const mockData = { id: '1', name: 'Test' };
    const mockFetch = jest.fn().mockResolvedValue(mockData);

    const { getByTestId, getByText } = render(
      <DataComponent fetch={mockFetch} />
    );

    fireEvent.press(getByTestId('fetch-button'));

    // Check loading state
    expect(getByTestId('loading-indicator')).toBeTruthy();

    // Wait for data
    await waitFor(() => {
      expect(getByText('Test')).toBeTruthy();
    });

    // Loading should be gone
    expect(() => getByTestId('loading-indicator')).toThrow();
  });

  it('should handle API error', async () => {
    const mockFetch = jest.fn().mockRejectedValue(
      new Error('Network error')
    );

    const { getByTestId, getByText } = render(
      <DataComponent fetch={mockFetch} />
    );

    fireEvent.press(getByTestId('fetch-button'));

    await waitFor(() => {
      expect(getByText('Network error')).toBeTruthy();
    });

    // Should show retry button
    expect(getByTestId('retry-button')).toBeTruthy();
  });

  it('should handle timeout', async () => {
    jest.useFakeTimers();

    const mockFetch = jest.fn(() =>
      new Promise(resolve => setTimeout(resolve, 10000))
    );

    const { getByTestId, getByText } = render(
      <DataComponent fetch={mockFetch} timeout={5000} />
    );

    fireEvent.press(getByTestId('fetch-button'));

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(getByText('Request timeout')).toBeTruthy();
    });

    jest.useRealTimers();
  });
});
```

### Debounced Input Testing
```javascript
describe('Debounced Search', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should debounce search input', () => {
    const onSearch = jest.fn();
    const { getByTestId } = render(
      <SearchInput onSearch={onSearch} debounceMs={500} />
    );

    const input = getByTestId('search-input');

    // Type quickly
    fireEvent.changeText(input, 'a');
    fireEvent.changeText(input, 'ab');
    fireEvent.changeText(input, 'abc');

    // Should not call yet
    expect(onSearch).not.toHaveBeenCalled();

    // Fast-forward debounce time
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Should call once with final value
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('abc');
  });
});
```

---

## Navigation Test Patterns

### Screen Navigation
```javascript
describe('Navigation Flow', () => {
  const mockNavigate = jest.fn();
  const mockGoBack = jest.fn();

  beforeEach(() => {
    jest.mock('@react-navigation/native', () => ({
      useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
      }),
      useRoute: () => ({
        params: { id: 'test-123' },
      }),
    }));
  });

  it('should navigate to detail screen with params', () => {
    const { getByTestId } = render(<ListScreen />);

    fireEvent.press(getByTestId('item-1'));

    expect(mockNavigate).toHaveBeenCalledWith('Detail', {
      itemId: '1',
      from: 'ListScreen',
    });
  });

  it('should go back on cancel', () => {
    const { getByTestId } = render(<EditScreen />);

    fireEvent.press(getByTestId('cancel-button'));

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('should handle deep linking', () => {
    const { getByTestId } = render(
      <App initialUrl="/project/123/element/456" />
    );

    expect(mockNavigate).toHaveBeenCalledWith('Element', {
      projectId: '123',
      elementId: '456',
    });
  });
});
```

### Tab Navigation
```javascript
describe('Tab Navigation', () => {
  it('should switch between tabs', () => {
    const { getByTestId, getByText } = render(<TabNavigator />);

    // Initially on first tab
    expect(getByText('Home Content')).toBeTruthy();

    // Switch to second tab
    fireEvent.press(getByTestId('tab-profile'));
    expect(getByText('Profile Content')).toBeTruthy();

    // Switch back
    fireEvent.press(getByTestId('tab-home'));
    expect(getByText('Home Content')).toBeTruthy();
  });
});
```

---

## Form Test Patterns

### Form Validation
```javascript
describe('Form Validation', () => {
  it('should validate required fields', async () => {
    const { getByTestId, getByText } = render(<RegistrationForm />);

    // Submit without filling fields
    fireEvent.press(getByTestId('submit-button'));

    await waitFor(() => {
      expect(getByText('Email is required')).toBeTruthy();
      expect(getByText('Password is required')).toBeTruthy();
    });
  });

  it('should validate email format', async () => {
    const { getByTestId, getByText } = render(<RegistrationForm />);

    fireEvent.changeText(getByTestId('email-input'), 'invalid-email');
    fireEvent.press(getByTestId('submit-button'));

    await waitFor(() => {
      expect(getByText('Invalid email format')).toBeTruthy();
    });
  });

  it('should validate password strength', async () => {
    const { getByTestId, getByText } = render(<RegistrationForm />);

    fireEvent.changeText(getByTestId('password-input'), '123');
    fireEvent.press(getByTestId('submit-button'));

    await waitFor(() => {
      expect(getByText('Password must be at least 8 characters')).toBeTruthy();
    });
  });
});
```

### Form Submission
```javascript
describe('Form Submission', () => {
  it('should submit form with valid data', async () => {
    const onSubmit = jest.fn();
    const { getByTestId } = render(
      <ContactForm onSubmit={onSubmit} />
    );

    // Fill form
    fireEvent.changeText(getByTestId('name-input'), 'John Doe');
    fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
    fireEvent.changeText(getByTestId('message-input'), 'Test message');

    // Submit
    fireEvent.press(getByTestId('submit-button'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
      });
    });
  });

  it('should show success message after submission', async () => {
    const { getByTestId, getByText } = render(<ContactForm />);

    // Fill and submit
    fireEvent.changeText(getByTestId('name-input'), 'John');
    fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
    fireEvent.press(getByTestId('submit-button'));

    await waitFor(() => {
      expect(getByText('Form submitted successfully!')).toBeTruthy();
    });

    // Form should be reset
    expect(getByTestId('name-input').props.value).toBe('');
  });
});
```

---

## List Test Patterns

### List Rendering
```javascript
describe('List Component', () => {
  const mockItems = [
    { id: '1', title: 'Item 1', completed: false },
    { id: '2', title: 'Item 2', completed: true },
    { id: '3', title: 'Item 3', completed: false },
  ];

  it('should render all items', () => {
    const { getAllByTestId } = render(
      <ItemList items={mockItems} />
    );

    const items = getAllByTestId(/^item-/);
    expect(items).toHaveLength(3);
  });

  it('should render empty state', () => {
    const { getByText, queryByTestId } = render(
      <ItemList items={[]} />
    );

    expect(getByText('No items found')).toBeTruthy();
    expect(queryByTestId(/^item-/)).toBeNull();
  });

  it('should filter items', () => {
    const { getByTestId, getAllByTestId } = render(
      <ItemList items={mockItems} />
    );

    // Filter by completed
    fireEvent.press(getByTestId('filter-completed'));

    const items = getAllByTestId(/^item-/);
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('Item 2');
  });

  it('should sort items', () => {
    const { getByTestId, getAllByTestId } = render(
      <ItemList items={mockItems} />
    );

    // Sort alphabetically
    fireEvent.press(getByTestId('sort-alpha'));

    const items = getAllByTestId(/^item-title/);
    expect(items[0]).toHaveTextContent('Item 1');
    expect(items[1]).toHaveTextContent('Item 2');
    expect(items[2]).toHaveTextContent('Item 3');
  });
});
```

### Virtualized List
```javascript
describe('Virtualized List', () => {
  const generateItems = (count) =>
    Array.from({ length: count }, (_, i) => ({
      id: `${i}`,
      title: `Item ${i}`,
    }));

  it('should render only visible items', () => {
    const items = generateItems(1000);
    const { getAllByTestId } = render(
      <VirtualizedList
        items={items}
        itemHeight={50}
        containerHeight={500}
      />
    );

    // Should only render items that fit in viewport + buffer
    const renderedItems = getAllByTestId(/^item-/);
    expect(renderedItems.length).toBeLessThan(20);
  });

  it('should render more items on scroll', () => {
    const items = generateItems(100);
    const { getByTestId, getAllByTestId } = render(
      <VirtualizedList items={items} />
    );

    const list = getByTestId('virtual-list');

    // Initial render
    let renderedItems = getAllByTestId(/^item-/);
    const initialCount = renderedItems.length;

    // Scroll down
    fireEvent.scroll(list, {
      nativeEvent: { contentOffset: { y: 500 } },
    });

    // Should render different items
    renderedItems = getAllByTestId(/^item-/);
    expect(renderedItems[0]).not.toHaveTextContent('Item 0');
  });
});
```

---

## Modal Test Patterns

### Modal Lifecycle
```javascript
describe('Modal Component', () => {
  it('should open and close modal', () => {
    const { getByTestId, queryByTestId } = render(<ModalExample />);

    // Modal initially closed
    expect(queryByTestId('modal-content')).toBeNull();

    // Open modal
    fireEvent.press(getByTestId('open-modal-button'));
    expect(getByTestId('modal-content')).toBeTruthy();

    // Close modal
    fireEvent.press(getByTestId('close-modal-button'));
    expect(queryByTestId('modal-content')).toBeNull();
  });

  it('should close on backdrop press', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <Modal isVisible={true} onClose={onClose} />
    );

    fireEvent.press(getByTestId('modal-backdrop'));
    expect(onClose).toHaveBeenCalled();
  });

  it('should not close on content press', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <Modal isVisible={true} onClose={onClose} />
    );

    fireEvent.press(getByTestId('modal-content'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should handle keyboard', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <Modal isVisible={true} onClose={onClose} />
    );

    // Simulate ESC key (web)
    fireEvent.keyDown(getByTestId('modal'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
```

### Modal with Form
```javascript
describe('Modal with Form', () => {
  it('should submit form and close modal', async () => {
    const onSave = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <EditModal isVisible={true} onSave={onSave} />
    );

    // Fill form
    fireEvent.changeText(getByTestId('name-input'), 'Updated Name');

    // Submit
    fireEvent.press(getByTestId('save-button'));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({ name: 'Updated Name' });
      expect(queryByTestId('modal-content')).toBeNull();
    });
  });
});
```

---

## Error Handling Patterns

### Error Boundary Testing
```javascript
describe('Error Boundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('should catch and display error', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Test error')).toBeTruthy();
  });

  it('should recover on retry', () => {
    let shouldThrow = true;
    const MaybeThrow = () => {
      if (shouldThrow) throw new Error('Test error');
      return <Text>Success</Text>;
    };

    const { getByText, getByTestId, rerender } = render(
      <ErrorBoundary>
        <MaybeThrow />
      </ErrorBoundary>
    );

    expect(getByText('Test error')).toBeTruthy();

    // Fix the error
    shouldThrow = false;

    // Retry
    fireEvent.press(getByTestId('retry-button'));

    rerender(
      <ErrorBoundary>
        <MaybeThrow />
      </ErrorBoundary>
    );

    expect(getByText('Success')).toBeTruthy();
  });
});
```

### Network Error Handling
```javascript
describe('Network Error Handling', () => {
  it('should handle network failure', async () => {
    const { getByTestId, getByText } = render(<DataFetcher />);

    // Mock network failure
    global.fetch = jest.fn().mockRejectedValue(
      new Error('Network request failed')
    );

    fireEvent.press(getByTestId('fetch-button'));

    await waitFor(() => {
      expect(getByText('Network request failed')).toBeTruthy();
      expect(getByTestId('retry-button')).toBeTruthy();
    });
  });

  it('should retry on failure', async () => {
    let attempts = 0;
    global.fetch = jest.fn().mockImplementation(() => {
      attempts++;
      if (attempts < 3) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({ data: 'Success' });
    });

    const { getByTestId, getByText } = render(
      <DataFetcher retryCount={3} />
    );

    fireEvent.press(getByTestId('fetch-button'));

    await waitFor(() => {
      expect(getByText('Success')).toBeTruthy();
      expect(attempts).toBe(3);
    });
  });
});
```

---

## Performance Test Patterns

### Render Performance
```javascript
describe('Performance', () => {
  it('should render quickly', () => {
    const start = performance.now();

    const { getByTestId } = render(<ComplexComponent />);

    const end = performance.now();
    const renderTime = end - start;

    expect(renderTime).toBeLessThan(100); // 100ms threshold
  });

  it('should not re-render unnecessarily', () => {
    const renderSpy = jest.fn();

    const Component = React.memo(({ value }) => {
      renderSpy();
      return <Text>{value}</Text>;
    });

    const { rerender } = render(<Component value="test" />);
    expect(renderSpy).toHaveBeenCalledTimes(1);

    // Same props should not trigger re-render
    rerender(<Component value="test" />);
    expect(renderSpy).toHaveBeenCalledTimes(1);

    // Different props should trigger re-render
    rerender(<Component value="updated" />);
    expect(renderSpy).toHaveBeenCalledTimes(2);
  });
});
```

### Memory Leak Detection
```javascript
describe('Memory Leaks', () => {
  it('should clean up on unmount', () => {
    const cleanupSpy = jest.fn();

    const Component = () => {
      React.useEffect(() => {
        const timer = setTimeout(() => {}, 1000);
        return () => {
          cleanupSpy();
          clearTimeout(timer);
        };
      }, []);

      return <Text>Component</Text>;
    };

    const { unmount } = render(<Component />);
    unmount();

    expect(cleanupSpy).toHaveBeenCalled();
  });

  it('should unsubscribe from store on unmount', () => {
    const unsubscribeSpy = jest.fn();
    const mockStore = {
      subscribe: jest.fn(() => unsubscribeSpy),
    };

    const { unmount } = render(
      <ComponentWithStore store={mockStore} />
    );

    expect(mockStore.subscribe).toHaveBeenCalled();

    unmount();

    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
```

---

## Snapshot Testing Patterns

### When to Use Snapshots
```javascript
// ✅ Good use case: Static UI components
describe('Card Component', () => {
  it('should match snapshot for different states', () => {
    const { toJSON } = render(
      <Card title="Test" status="active" />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});

// ❌ Bad use case: Dynamic content
describe('UserList', () => {
  it('should NOT use snapshot for dynamic data', () => {
    // Instead, test specific properties
    const { getByText } = render(<UserList />);
    expect(getByText('John Doe')).toBeTruthy();
  });
});
```

### Updating Snapshots
```bash
# Update all snapshots
npm test -- -u

# Update specific test snapshots
npm test -- MyComponent.test.tsx -u

# Review snapshots before updating
npm test -- --watch
# Press 'i' to update snapshots interactively
```

---

## Testing Utilities

### Custom Render Function
```javascript
// test/testUtils.tsx
export const renderWithTheme = (component, theme = defaultTheme) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

export const renderWithNavigation = (component, initialParams = {}) => {
  return render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Test" component={() => component} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export const renderWithStore = (component, initialState = {}) => {
  const store = createStore(initialState);
  return render(
    <StoreProvider store={store}>
      {component}
    </StoreProvider>
  );
};
```

### Test Data Factories
```javascript
// test/factories.js
export const createUser = (overrides = {}) => ({
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createProject = (overrides = {}) => ({
  id: '1',
  name: 'Test Project',
  description: 'Test description',
  elements: [],
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createElement = (type = 'character', overrides = {}) => ({
  id: '1',
  type,
  name: 'Test Element',
  description: 'Test description',
  projectId: '1',
  ...overrides,
});
```

---

*Last Updated: 2025-09-27*
*Version: 1.0.0*
# Quick Development Reference - FantasyWritingApp

**React Native 0.75.4 + TypeScript 5.2.2 | Cross-Platform Development**

---

## 🚨 THE 8 GOLDEN RULES

**MANDATORY for every component:**

1. ✅ **Text in Text Component** - All text MUST be wrapped in `<Text>` tags
2. ✅ **testID on Interactive Elements** - Every touchable needs `testID` + `data-cy`
3. ✅ **StyleSheet.create()** - NEVER inline style objects, always use StyleSheet
4. ✅ **TypeScript Strict Mode** - Proper type definitions for all props/state
5. ✅ **Error Boundaries on Screens** - Every screen must be wrapped
6. ✅ **Loading/Error/Success States** - All async operations need 3 states
7. ✅ **Platform.select() for Platform Code** - Use Platform.select(), not if/else
8. ✅ **Images Need Dimensions** - All `<Image>` must have explicit width/height

---

## 📝 Component Template (Copy-Paste Ready)

```typescript
// ===================================================================
// MANDATORY COMPONENT TEMPLATE
// Follow this structure for ALL new components
// ===================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import type { FC } from 'react';

// ========================================
// 1. MANDATORY: Type Definitions
// ========================================
interface ExampleComponentProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  isDisabled?: boolean;
}

// ========================================
// 2. Component Definition
// ========================================
const ExampleComponent: FC<ExampleComponentProps> = ({
  title,
  subtitle,
  onPress,
  isDisabled = false,
}) => {
  // 3. MANDATORY: Loading/Error/Success states for async operations
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  // Async operation example
  const handleAsyncOperation = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await someAsyncOperation();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 4. MANDATORY: Text in Text component */}
      <Text style={styles.title}>{title}</Text>

      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {/* 5. MANDATORY: testID + data-cy on interactive elements */}
      <TouchableOpacity
        testID="example-button"
        data-cy="example-button"
        onPress={onPress}
        disabled={isDisabled || loading}
        style={[styles.button, isDisabled && styles.buttonDisabled]}
        accessibilityLabel={title}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>
          {loading ? 'Loading...' : 'Press Me'}
        </Text>
      </TouchableOpacity>

      {/* Show error state */}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

// ========================================
// 6. MANDATORY: StyleSheet.create()
// ========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    // 7. MANDATORY: Platform.select() for platform-specific styles
    ...Platform.select({
      web: {
        cursor: 'pointer',
        maxWidth: 600,
      },
      default: {},
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: 'red',
    marginTop: 8,
    fontSize: 14,
  },
});

// ========================================
// 8. Export (Screens need Error Boundary)
// ========================================
export default ExampleComponent;
```

---

## 🎯 Common Patterns

### Zustand Store Pattern

```typescript
// ===================================================================
// ZUSTAND STORE WITH ASYNCSTORAGE PERSISTENCE
// ===================================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define your state interface
interface ProjectState {
  // State
  currentProject: Project | null;
  projects: Project[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  loadProjects: () => Promise<void>;
  reset: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentProject: null,
      projects: [],
      isLoading: false,
      error: null,

      // Actions
      setCurrentProject: project => set({ currentProject: project }),

      addProject: project =>
        set(state => ({
          projects: [...state.projects, project],
        })),

      updateProject: (id, updates) =>
        set(state => ({
          projects: state.projects.map(p =>
            p.id === id ? { ...p, ...updates } : p,
          ),
        })),

      deleteProject: id =>
        set(state => ({
          projects: state.projects.filter(p => p.id !== id),
          currentProject:
            state.currentProject?.id === id ? null : state.currentProject,
        })),

      loadProjects: async () => {
        set({ isLoading: true, error: null });
        try {
          const projects = await fetchProjectsFromAPI();
          set({ projects, isLoading: false });
        } catch (err) {
          set({
            error:
              err instanceof Error ? err.message : 'Failed to load projects',
            isLoading: false,
          });
        }
      },

      reset: () =>
        set({
          currentProject: null,
          projects: [],
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: 'project-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Optional: Specify which keys to persist
      partialize: state => ({
        currentProject: state.currentProject,
        projects: state.projects,
      }),
    },
  ),
);

// Usage in component:
// const { currentProject, addProject } = useProjectStore();
```

### Type-Safe Navigation Pattern

```typescript
// ===================================================================
// REACT NAVIGATION 6 + TYPESCRIPT
// ===================================================================

// 1. Define navigation types in types/navigation.ts
export type RootStackParamList = {
  Home: undefined;
  ProjectDetails: { projectId: string };
  ElementEditor: { elementId: string; elementType: string };
  Settings: undefined;
};

// 2. Create typed hooks
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

// Navigation hook type
export type AppNavigation = NativeStackNavigationProp<RootStackParamList>;

// 3. Use in component
import { useNavigation, useRoute } from '@react-navigation/native';
import type { AppNavigation } from '@/types/navigation';
import type { RouteProp } from '@react-navigation/native';

const ProjectDetailsScreen = () => {
  // Type-safe navigation
  const navigation = useNavigation<AppNavigation>();

  // Type-safe route params
  type ProjectDetailsRouteProp = RouteProp<
    RootStackParamList,
    'ProjectDetails'
  >;
  const route = useRoute<ProjectDetailsRouteProp>();
  const { projectId } = route.params; // Type-safe!

  const handleNavigate = () => {
    // TypeScript validates params!
    navigation.navigate('ElementEditor', {
      elementId: '123',
      elementType: 'character',
    });
  };

  return (
    <View>
      <Text>Project ID: {projectId}</Text>
    </View>
  );
};
```

### Async Operation Pattern

```typescript
// ===================================================================
// ASYNC OPERATION WITH LOADING/ERROR/SUCCESS STATES
// ===================================================================

const MyComponent = () => {
  // State management for async operations
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle',
  );
  const [data, setData] = useState<MyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setState('loading');
    setError(null);

    try {
      const result = await api.getData();
      setData(result);
      setState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setState('error');
    }
  };

  // Render based on state
  if (state === 'loading') {
    return <ActivityIndicator size="large" />;
  }

  if (state === 'error') {
    return (
      <View>
        <Text style={styles.error}>{error}</Text>
        <Button title="Retry" onPress={fetchData} />
      </View>
    );
  }

  if (state === 'success' && data) {
    return <Text>{data.value}</Text>;
  }

  // Idle state
  return <Button title="Load Data" onPress={fetchData} />;
};
```

### Platform-Specific Code

```typescript
// ===================================================================
// PLATFORM HANDLING
// ===================================================================

import { Platform, StyleSheet } from 'react-native';

// Method 1: Platform.select() for styles (PREFERRED)
const styles = StyleSheet.create({
  container: {
    padding: 16,
    ...Platform.select({
      web: {
        maxWidth: 1200,
        margin: '0 auto',
        cursor: 'pointer',
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      default: {},
    }),
  },
});

// Method 2: Platform.select() for values
const hitSlop = Platform.select({
  web: 0,
  default: { top: 10, bottom: 10, left: 10, right: 10 },
});

// Method 3: Platform.OS for conditional rendering
import { Platform, View, Text } from 'react-native';

const MyComponent = () => {
  return (
    <View>
      {Platform.OS === 'web' && <Text>Web-specific content</Text>}

      {Platform.OS !== 'web' && <Text>Mobile-specific content</Text>}
    </View>
  );
};

// Method 4: Platform-specific files (for complex components)
// Create: Button.tsx, Button.ios.tsx, Button.android.tsx, Button.web.tsx
// Metro bundler automatically picks the right file
```

---

## ❌ Common Mistakes

### ❌ WRONG: Raw Text

```typescript
// ❌ NEVER DO THIS
<View>Hello World</View>
```

### ✅ CORRECT: Text Component

```typescript
// ✅ ALWAYS DO THIS
<View>
  <Text>Hello World</Text>
</View>
```

---

### ❌ WRONG: Inline Styles

```typescript
// ❌ NEVER DO THIS
<View style={{ padding: 16, backgroundColor: '#fff' }}>
  <Text style={{ fontSize: 20 }}>Title</Text>
</View>
```

### ✅ CORRECT: StyleSheet.create()

```typescript
// ✅ ALWAYS DO THIS
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
  },
});

<View style={styles.container}>
  <Text style={styles.title}>Title</Text>
</View>;
```

---

### ❌ WRONG: No testID

```typescript
// ❌ NEVER DO THIS
<TouchableOpacity onPress={handlePress}>
  <Text>Click Me</Text>
</TouchableOpacity>
```

### ✅ CORRECT: With testID + data-cy

```typescript
// ✅ ALWAYS DO THIS
<TouchableOpacity
  testID="click-button"
  data-cy="click-button"
  onPress={handlePress}
>
  <Text>Click Me</Text>
</TouchableOpacity>
```

---

### ❌ WRONG: Platform if/else chains

```typescript
// ❌ NEVER DO THIS
const buttonStyle = {};
if (Platform.OS === 'ios') {
  buttonStyle.shadowColor = '#000';
} else if (Platform.OS === 'android') {
  buttonStyle.elevation = 5;
} else if (Platform.OS === 'web') {
  buttonStyle.cursor = 'pointer';
}
```

### ✅ CORRECT: Platform.select()

```typescript
// ✅ ALWAYS DO THIS
const styles = StyleSheet.create({
  button: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 5,
      },
      web: {
        cursor: 'pointer',
      },
    }),
  },
});
```

---

### ❌ WRONG: No Loading States

```typescript
// ❌ NEVER DO THIS
const fetchData = async () => {
  const result = await api.getData();
  setData(result);
};
```

### ✅ CORRECT: Loading/Error/Success States

```typescript
// ✅ ALWAYS DO THIS
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchData = async () => {
  setLoading(true);
  setError(null);

  try {
    const result = await api.getData();
    setData(result);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error');
  } finally {
    setLoading(false);
  }
};
```

---

## 🔍 Quick TypeScript Reference

### Props Interface

```typescript
interface ComponentProps {
  // Required props
  title: string;
  id: number;

  // Optional props
  subtitle?: string;
  onPress?: () => void;

  // Props with defaults (use optional + default in destructuring)
  isActive?: boolean; // Default in: ({ isActive = false })

  // Union types
  variant: 'primary' | 'secondary' | 'danger';

  // Arrays
  items: string[];
  users: User[];

  // Objects
  config: {
    enabled: boolean;
    timeout: number;
  };

  // React children
  children?: React.ReactNode;
}
```

### State Types

```typescript
// Simple state
const [count, setCount] = useState<number>(0);
const [name, setName] = useState<string>('');

// Nullable state
const [user, setUser] = useState<User | null>(null);
const [error, setError] = useState<string | null>(null);

// Array state
const [items, setItems] = useState<Item[]>([]);

// Object state
const [form, setForm] = useState<FormData>({ name: '', email: '' });

// Union types for status
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
  'idle',
);
```

---

## 🧪 TDD Workflow with Test Validation

### Test-Driven Development Cycle

```
1. Write Test (Red) → 2. Implement Feature (Green) → 3. Validate Test → 4. Refactor (Clean)
       ↓                        ↓                            ↓                      ↓
   Test fails            Test passes               Test catches failures      Still passes
```

### Standard TDD Workflow

```typescript
// 1. WRITE TEST FIRST (Red Phase)
describe('User Authentication', () => {
  it('should sign in with valid credentials', () => {
    // Write test before implementation
    cy.visit('/');
    cy.get('[data-cy="email-input"]').type('test@example.com');
    cy.get('[data-cy="submit-button"]').click();
    cy.url().should('include', '/dashboard');
  });
});
// Test fails ❌ - Feature not implemented yet

// 2. IMPLEMENT FEATURE (Green Phase)
// Write minimum code to make test pass
const handleSignIn = async credentials => {
  const result = await authService.signIn(credentials);
  if (result.success) {
    navigate('/dashboard');
  }
};
// Test passes ✅

// 3. VALIDATE TEST (Mutation Check)
// Break code to ensure test catches failures
// See validation workflow below

// 4. REFACTOR (Clean Phase)
// Improve code quality while keeping tests green
```

### Test Validation Workflow (2 min per test)

**For E2E Tests:**

```bash
# 1. Test passes
SPEC=cypress/e2e/auth/signin.cy.ts npm run cypress:run:spec

# 2. Create validation branch
git checkout -b validate/signin-test

# 3. Break code (try each mutation):
# - Remove authService.signIn() call
# - Break navigation logic
# - Remove data-cy="submit-button"

# 4. Run test - verify it FAILS
SPEC=cypress/e2e/auth/signin.cy.ts npm run cypress:run:spec

# 5. Revert safely
git checkout main && git branch -D validate/signin-test

# 6. Document validation
// * Validated: catches missing auth logic
```

**For Unit Tests:**

```typescript
// Test for store action
describe('authStore', () => {
  it('updates user state on login', () => {
    // * Validated: catches missing state update
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.login({ email: 'test@test.com', id: '123' });
    });

    expect(result.current.user).toEqual({ email: 'test@test.com', id: '123' });
    expect(result.current.isAuthenticated).toBe(true);
  });
});

// Validation mutations:
// - Remove state update in login()
// - Skip isAuthenticated flag update
// - Return wrong user object
```

### Common Mutation Patterns

#### Component Tests (Unit)

- Remove conditional rendering logic
- Skip prop validation
- Break event handlers
- Remove error boundaries
- Skip loading state updates

#### Store Tests (Unit)

- Remove state updates
- Skip action dispatching
- Return wrong data shape
- Break computed values
- Remove middleware logic

#### E2E Integration Tests

- Remove API calls
- Break navigation/routing
- Skip validation logic
- Remove data-cy attributes
- Break error handling

### When to Validate Tests

**✅ Always Validate:**

- New test suites for untested features
- Critical user flows (auth, payments, data operations)
- Complex business logic
- Tests added during bug fixes

**⚠️ Consider Skipping:**

- Simple component rendering tests
- Proven stable tests (years in production)
- Obvious failure scenarios

### TDD Benefits

- **Design First**: Tests guide API design
- **Documentation**: Tests show intended behavior
- **Confidence**: Proven test coverage
- **Refactoring Safety**: Change code without fear
- **Bug Prevention**: Catch issues before production

---

## ✅ Pre-Commit Checklist

Before committing component code, verify:

- [ ] All text is wrapped in `<Text>` components
- [ ] Interactive elements have `testID` and `data-cy` attributes
- [ ] Styles use `StyleSheet.create()`
- [ ] Props have TypeScript interfaces
- [ ] Async operations have loading/error/success states
- [ ] Platform-specific code uses `Platform.select()`
- [ ] Images have explicit width/height dimensions
- [ ] Screen components wrapped in error boundaries
- [ ] `npm run lint` passes without errors
- [ ] Component follows the standard template structure
- [ ] **Tests validated** (for new test files: mutation testing completed)
- [ ] **Validation comments added** (test files document what failures they catch)

---

## 📚 Need More Details?

For comprehensive coverage, see:

- **[DEVELOPMENT-COMPLETE-REFERENCE.md](./DEVELOPMENT-COMPLETE-REFERENCE.md)** - Full development standards
- **[PROJECT-INFO.md](./PROJECT-INFO.md)** - Tech stack and project structure
- **[CLAUDE.md](../CLAUDE.md)** - Complete project documentation

---

**Version**: 1.0.0
**Last Updated**: 2025-10-02
**Status**: Active

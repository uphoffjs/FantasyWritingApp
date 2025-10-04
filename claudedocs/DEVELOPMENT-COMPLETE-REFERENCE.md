# Development Complete Reference - FantasyWritingApp

**Comprehensive Development Standards for React Native 0.75.4 + TypeScript 5.2.2**

---

## Table of Contents

1. [Component Development Standards](#component-development-standards)
2. [TypeScript Standards & Patterns](#typescript-standards--patterns)
3. [State Management (Zustand)](#state-management-zustand)
4. [Navigation (React Navigation 6)](#navigation-react-navigation-6)
5. [Platform Handling](#platform-handling)
6. [Performance Optimization](#performance-optimization)
7. [Accessibility Standards](#accessibility-standards)
8. [Error Handling Patterns](#error-handling-patterns)
9. [Backend Integration (Supabase)](#backend-integration-supabase)
10. [File Organization](#file-organization)

---

## Component Development Standards

### Component Structure

Every component should follow this structure:

```typescript
// 1. Imports (grouped)
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import type { FC } from 'react';

// 2. Type imports
import type { User, Project } from '@/types';

// 3. External imports
import { useProjectStore } from '@/store/projectStore';

// 4. Constants (if any)
const MAX_ITEMS = 10;
const DEFAULT_COLOR = '#007AFF';

// 5. Type definitions
interface ComponentProps {
  title: string;
  // ... props
}

// 6. Component definition
const MyComponent: FC<ComponentProps> = props => {
  // ... implementation
};

// 7. Styles
const styles = StyleSheet.create({
  // ... styles
});

// 8. Export
export default MyComponent;
```

### Component Types

#### 1. Presentational Components

- Pure UI components
- No business logic
- Props-driven rendering
- Should be memoized if used in lists

```typescript
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { FC } from 'react';

interface CardProps {
  title: string;
  description: string;
  imageUrl?: string;
}

const Card: FC<CardProps> = memo(({ title, description, imageUrl }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
});

Card.displayName = 'Card';

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
});

export default Card;
```

#### 2. Container Components

- Connect to stores
- Handle business logic
- Manage async operations
- Pass data to presentational components

```typescript
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useProjectStore } from '@/store/projectStore';
import ProjectList from '@/components/ProjectList';

const ProjectListContainer = () => {
  const { projects, loading, error, loadProjects } = useProjectStore();

  useEffect(() => {
    loadProjects();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return <ProjectList projects={projects} />;
};

export default ProjectListContainer;
```

#### 3. Screen Components

- Top-level navigation screens
- MUST have error boundaries
- Handle navigation
- Coordinate multiple components

```typescript
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Header from '@/components/Header';
import ProjectListContainer from '@/containers/ProjectListContainer';

const HomeScreen = () => {
  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <Header title="Projects" />
        <ScrollView>
          <ProjectListContainer />
        </ScrollView>
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default HomeScreen;
```

### Component Composition

Use composition over inheritance:

```typescript
// ✅ GOOD: Composition
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onPress: () => void;
}

const Button: FC<ButtonProps> = ({
  children,
  variant = 'primary',
  onPress,
}) => {
  return (
    <TouchableOpacity
      testID="button"
      style={[styles.button, styles[variant]]}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  );
};

// Usage
<Button variant="primary" onPress={handleSave}>
  <Icon name="save" />
  <Text>Save</Text>
</Button>;
```

### Conditional Rendering

```typescript
// ✅ GOOD: Clear conditional rendering
const MyComponent = ({ isLoading, error, data }) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  return <DataList data={data} />;
};

// ✅ GOOD: Inline conditional for optional elements
<View>
  <Text>{title}</Text>
  {subtitle && <Text>{subtitle}</Text>}
  {showAction && <Button onPress={handleAction}>Action</Button>}
</View>;
```

---

## TypeScript Standards & Patterns

### Strict TypeScript Configuration

Ensure `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Type Definitions

#### Props Interfaces

```typescript
// Basic props
interface UserCardProps {
  user: User;
  onPress?: () => void;
  showActions?: boolean;
}

// Props with children
interface ContainerProps {
  children: React.ReactNode;
  title?: string;
}

// Props with specific children types
interface TabsProps {
  children: React.ReactElement<TabProps> | React.ReactElement<TabProps>[];
  activeTab: string;
}

// Props with render functions
interface ListProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}
```

#### State Types

```typescript
// Simple state
const [count, setCount] = useState<number>(0);

// Nullable state
const [user, setUser] = useState<User | null>(null);

// Array state
const [items, setItems] = useState<Item[]>([]);

// Object state with interface
interface FormState {
  name: string;
  email: string;
  age: number;
}
const [form, setForm] = useState<FormState>({ name: '', email: '', age: 0 });

// Discriminated unions for complex state
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

const [state, setState] = useState<RequestState<User>>({ status: 'idle' });
```

#### Function Types

```typescript
// Event handlers
type ButtonPressHandler = () => void;
type InputChangeHandler = (text: string) => void;
type SubmitHandler = (data: FormData) => Promise<void>;

// Async functions
type FetchUserFunction = (userId: string) => Promise<User>;
type UpdateUserFunction = (
  userId: string,
  updates: Partial<User>,
) => Promise<void>;

// Callback props
interface ComponentProps {
  onSuccess: (result: Result) => void;
  onError: (error: Error) => void;
  onChange?: (value: string) => void;
}
```

### Generic Types

```typescript
// Generic component
interface SelectProps<T> {
  options: T[];
  value: T | null;
  onChange: (value: T) => void;
  renderOption: (option: T) => React.ReactNode;
  keyExtractor: (option: T) => string;
}

function Select<T>({
  options,
  value,
  onChange,
  renderOption,
  keyExtractor,
}: SelectProps<T>) {
  return (
    <View>
      {options.map(option => (
        <TouchableOpacity
          key={keyExtractor(option)}
          onPress={() => onChange(option)}
        >
          {renderOption(option)}
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Usage
<Select<User>
  options={users}
  value={selectedUser}
  onChange={setSelectedUser}
  renderOption={user => <Text>{user.name}</Text>}
  keyExtractor={user => user.id}
/>;
```

### Type Guards

```typescript
// Type guard function
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'email' in value
  );
}

// Usage
const handleData = (data: unknown) => {
  if (isUser(data)) {
    // TypeScript knows data is User here
    console.log(data.name);
  }
};

// Discriminated union type guard
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; size: number }
  | { kind: 'rectangle'; width: number; height: number };

function calculateArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.size ** 2;
    case 'rectangle':
      return shape.width * shape.height;
  }
}
```

---

## State Management (Zustand)

### Store Creation Pattern

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { immer } from 'zustand/middleware/immer';

// Define state interface
interface UserState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
  reset: () => void;
}

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Create store
export const useUserStore = create<UserState>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      login: async (email, password) => {
        set(state => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const user = await authService.login(email, password);
          set(state => {
            state.user = user;
            state.isAuthenticated = true;
            state.isLoading = false;
          });
        } catch (err) {
          set(state => {
            state.error = err instanceof Error ? err.message : 'Login failed';
            state.isLoading = false;
          });
        }
      },

      logout: () => {
        set(initialState);
        authService.logout();
      },

      updateProfile: async updates => {
        const currentUser = get().user;
        if (!currentUser) return;

        set(state => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const updatedUser = await userService.update(currentUser.id, updates);
          set(state => {
            state.user = updatedUser;
            state.isLoading = false;
          });
        } catch (err) {
          set(state => {
            state.error = err instanceof Error ? err.message : 'Update failed';
            state.isLoading = false;
          });
        }
      },

      setUser: user => set({ user, isAuthenticated: !!user }),

      reset: () => set(initialState),
    })),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
```

### Selectors for Performance

```typescript
// ✅ GOOD: Use selectors to prevent unnecessary re-renders
const ProjectScreen = () => {
  // Only re-renders when currentProject changes
  const currentProject = useProjectStore(state => state.currentProject);
  const setProject = useProjectStore(state => state.setCurrentProject);

  return <ProjectDetails project={currentProject} />;
};

// ❌ BAD: Component re-renders on ANY store change
const ProjectScreen = () => {
  const store = useProjectStore();
  return <ProjectDetails project={store.currentProject} />;
};
```

### Combining Multiple Stores

```typescript
// Multiple store subscriptions
const Dashboard = () => {
  const user = useUserStore(state => state.user);
  const projects = useProjectStore(state => state.projects);
  const settings = useSettingsStore(state => state.settings);

  return (
    <View>
      <UserProfile user={user} />
      <ProjectList projects={projects} />
      <SettingsPanel settings={settings} />
    </View>
  );
};
```

---

## Navigation (React Navigation 6)

### Type-Safe Navigation Setup

```typescript
// types/navigation.ts
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

// Define all screen params
export type RootStackParamList = {
  Home: undefined;
  ProjectList: undefined;
  ProjectDetails: { projectId: string };
  ElementEditor: {
    elementId: string;
    elementType: 'character' | 'location' | 'magic';
    mode: 'edit' | 'create';
  };
  Settings: undefined;
  Login: { redirect?: string };
};

// Navigation prop types
export type RootStackNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

// Route prop types for each screen
export type ProjectDetailsRouteProp = RouteProp<
  RootStackParamList,
  'ProjectDetails'
>;
export type ElementEditorRouteProp = RouteProp<
  RootStackParamList,
  'ElementEditor'
>;
export type LoginRouteProp = RouteProp<RootStackParamList, 'Login'>;

// Helper hook for typed navigation
export function useAppNavigation() {
  return useNavigation<RootStackNavigationProp>();
}
```

### Screen Implementation

```typescript
import { useNavigation, useRoute } from '@react-navigation/native';
import type { ProjectDetailsRouteProp } from '@/types/navigation';
import type { RootStackNavigationProp } from '@/types/navigation';

const ProjectDetailsScreen = () => {
  // Type-safe navigation
  const navigation = useNavigation<RootStackNavigationProp>();

  // Type-safe route params
  const route = useRoute<ProjectDetailsRouteProp>();
  const { projectId } = route.params;

  const handleEditElement = (elementId: string) => {
    // TypeScript validates params!
    navigation.navigate('ElementEditor', {
      elementId,
      elementType: 'character',
      mode: 'edit',
    });
  };

  return (
    <View>
      <Text>Project: {projectId}</Text>
      <Button onPress={() => handleEditElement('123')}>Edit Character</Button>
    </View>
  );
};
```

### Navigation Options

```typescript
import { useLayoutEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

const ProjectDetailsScreen = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Project Details',
      headerRight: () => (
        <TouchableOpacity testID="header-edit-button" onPress={handleEdit}>
          <Icon name="edit" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return <View>...</View>;
};
```

### Deep Linking

```typescript
// App.tsx navigation config
const linking = {
  prefixes: ['fantasyapp://', 'https://fantasyapp.com'],
  config: {
    screens: {
      Home: '',
      ProjectDetails: 'project/:projectId',
      ElementEditor: 'element/:elementType/:elementId',
      Settings: 'settings',
    },
  },
};

<NavigationContainer linking={linking}>
  <Stack.Navigator>{/* screens */}</Stack.Navigator>
</NavigationContainer>;
```

---

## Platform Handling

### Platform.select() for Styles

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
```

### Platform-Specific Components

```typescript
// Create platform-specific files
// Button.tsx - shared interface
// Button.ios.tsx - iOS implementation
// Button.android.tsx - Android implementation
// Button.web.tsx - Web implementation

// Button.tsx (shared)
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

// Button.ios.tsx
import { TouchableOpacity, Text } from 'react-native';
import type { ButtonProps } from './Button';

const Button: FC<ButtonProps> = ({ title, onPress, variant = 'primary' }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;

// Button.web.tsx
import type { ButtonProps } from './Button';

const Button: FC<ButtonProps> = ({ title, onPress, variant = 'primary' }) => {
  return (
    <button onClick={onPress} className={variant}>
      {title}
    </button>
  );
};

export default Button;
```

### Responsive Design

```typescript
import { useWindowDimensions } from 'react-native';

const ResponsiveComponent = () => {
  const { width, height } = useWindowDimensions();

  const isSmallScreen = width < 768;
  const isMediumScreen = width >= 768 && width < 1024;
  const isLargeScreen = width >= 1024;

  return (
    <View
      style={[
        styles.container,
        isSmallScreen && styles.containerSmall,
        isLargeScreen && styles.containerLarge,
      ]}
    >
      {isSmallScreen ? <MobileLayout /> : <DesktopLayout />}
    </View>
  );
};
```

---

## Performance Optimization

### React.memo

```typescript
import React, { memo } from 'react';

// ✅ GOOD: Memo for list items
const ListItem = memo<ListItemProps>(
  ({ item, onPress }) => {
    return (
      <TouchableOpacity onPress={() => onPress(item.id)}>
        <Text>{item.title}</Text>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return prevProps.item.id === nextProps.item.id;
  },
);

ListItem.displayName = 'ListItem';
```

### useMemo & useCallback

```typescript
const MyComponent = ({ items, filter }) => {
  // ✅ GOOD: Memoize expensive calculations
  const filteredItems = useMemo(() => {
    return items.filter(item => item.category === filter);
  }, [items, filter]);

  // ✅ GOOD: Memoize callbacks passed to child components
  const handleItemPress = useCallback(
    (itemId: string) => {
      navigation.navigate('Details', { itemId });
    },
    [navigation],
  );

  return (
    <FlatList
      data={filteredItems}
      renderItem={({ item }) => (
        <ListItem item={item} onPress={handleItemPress} />
      )}
    />
  );
};
```

### FlatList Optimization

```typescript
const OptimizedList = ({ data }) => {
  const renderItem = useCallback(({ item }) => <ListItem item={item} />, []);

  const keyExtractor = useCallback(item => item.id, []);

  const getItemLayout = useCallback(
    (data, index) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={10}
    />
  );
};
```

---

## Accessibility Standards

### Required Accessibility Props

```typescript
// Buttons and touchables
<TouchableOpacity
  testID="save-button"
  accessibilityLabel="Save project"
  accessibilityHint="Saves your project to the cloud"
  accessibilityRole="button"
  onPress={handleSave}
>
  <Text>Save</Text>
</TouchableOpacity>

// Text inputs
<TextInput
  testID="project-name-input"
  accessibilityLabel="Project name"
  accessibilityHint="Enter a name for your project"
  placeholder="Project name"
  value={name}
  onChangeText={setName}
/>

// Images
<Image
  source={imageSource}
  accessibilityLabel="Project cover image"
  accessible={true}
  style={styles.image}
/>
```

### Touch Target Sizes

```typescript
// Minimum 44x44 points for touch targets
const styles = StyleSheet.create({
  button: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Or use hitSlop for small visuals
<TouchableOpacity
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  onPress={handlePress}
>
  <SmallIcon />
</TouchableOpacity>;
```

---

## Error Handling Patterns

### Error Boundary

```typescript
// components/ErrorBoundary.tsx
import React, { Component, type ReactNode } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error tracking service
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Button title="Try Again" onPress={this.handleReset} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
});
```

### Async Error Handling

```typescript
const MyComponent = () => {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle',
  );
  const [error, setError] = useState<string | null>(null);

  const handleOperation = async () => {
    setState('loading');
    setError(null);

    try {
      await performAsyncOperation();
      setState('success');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred';

      setError(errorMessage);
      setState('error');

      // Log to error tracking
      console.error('Operation failed:', err);
    }
  };

  if (state === 'error') {
    return (
      <ErrorDisplay
        message={error || 'Unknown error'}
        onRetry={handleOperation}
      />
    );
  }

  return <View>...</View>;
};
```

---

## Backend Integration (Supabase)

### Query Patterns

```typescript
import { supabase } from '@/lib/supabase';

// Fetch data
export async function fetchProjects(userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  return data;
}

// Insert data
export async function createProject(
  project: Omit<Project, 'id' | 'created_at'>,
) {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`);
  }

  return data;
}

// Update data
export async function updateProject(id: string, updates: Partial<Project>) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update project: ${error.message}`);
  }

  return data;
}

// Delete data
export async function deleteProject(id: string) {
  const { error } = await supabase.from('projects').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete project: ${error.message}`);
  }
}
```

### Real-Time Subscriptions

```typescript
useEffect(() => {
  const subscription = supabase
    .channel('projects')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `user_id=eq.${userId}`,
      },
      payload => {
        console.log('Change received!', payload);

        if (payload.eventType === 'INSERT') {
          // Handle insert
        } else if (payload.eventType === 'UPDATE') {
          // Handle update
        } else if (payload.eventType === 'DELETE') {
          // Handle delete
        }
      },
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [userId]);
```

---

## File Organization

### Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components
│   │   ├── Button/
│   │   ├── Card/
│   │   └── Input/
│   ├── native/         # Native-only components
│   └── web/            # Web-only components
├── screens/            # Screen components
│   ├── HomeScreen/
│   ├── ProjectScreen/
│   └── SettingsScreen/
├── navigation/         # Navigation setup
│   ├── AppNavigator.tsx
│   └── types.ts
├── store/              # Zustand stores
│   ├── userStore.ts
│   ├── projectStore.ts
│   └── settingsStore.ts
├── services/           # API and business logic
│   ├── api/
│   ├── auth/
│   └── storage/
├── hooks/              # Custom hooks
│   ├── useAuth.ts
│   └── useProjects.ts
├── utils/              # Utility functions
│   ├── validation.ts
│   └── formatting.ts
├── types/              # TypeScript types
│   ├── models.ts
│   ├── navigation.ts
│   └── api.ts
└── constants/          # Constants
    ├── colors.ts
    └── config.ts
```

### Naming Conventions

- **Components**: PascalCase (`Button.tsx`, `UserCard.tsx`)
- **Screens**: PascalCase with "Screen" suffix (`HomeScreen.tsx`)
- **Stores**: camelCase with "Store" suffix (`userStore.ts`)
- **Hooks**: camelCase with "use" prefix (`useAuth.ts`)
- **Utils**: camelCase (`validation.ts`, `formatDate.ts`)
- **Types**: PascalCase for interfaces/types (`User`, `Project`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ITEMS`, `API_URL`)

---

**Version**: 1.0.0
**Last Updated**: 2025-10-02
**Status**: Active

**Related Documentation:**

- [QUICK-DEV-REFERENCE.md](./QUICK-DEV-REFERENCE.md) - Quick development guide
- [PROJECT-INFO.md](./PROJECT-INFO.md) - Tech stack and project info
- [CLAUDE.md](../CLAUDE.md) - Complete project documentation

# React Native Style Guide

## Overview
This style guide establishes coding standards and best practices for React Native development in the FantasyWritingApp. Following these guidelines ensures consistency, maintainability, and testability across the codebase.

---

## Component Structure

### File Organization
```typescript
// 1. Imports (grouped and ordered)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../providers/ThemeProvider';
import { Button } from '../components/Button';
import { WorldElement } from '../types/models';

// 2. TypeScript interfaces
interface ComponentProps {
  title: string;
  onPress: () => void;
  testID?: string;  // Always include testID in props
}

// 3. Component definition
export function ComponentName({ title, onPress, testID }: ComponentProps) {
  // Component logic
}

// 4. Styles (using StyleSheet.create)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  }
});
```

---

## Core React Native Components

### NEVER Use HTML Elements
```typescript
// ❌ WRONG - HTML elements
<div className="container">
  <span>Text content</span>
  <button onClick={handleClick}>Click me</button>
</div>

// ✅ CORRECT - React Native components
<View style={styles.container}>
  <Text>Text content</Text>
  <TouchableOpacity onPress={handlePress} testID="action-button">
    <Text>Click me</Text>
  </TouchableOpacity>
</View>
```

### Component Mapping
| HTML Element | React Native Component |
|--------------|----------------------|
| `<div>` | `<View>` |
| `<span>`, `<p>`, `<h1>` | `<Text>` |
| `<button>` | `<TouchableOpacity>` or `<Pressable>` |
| `<input>` | `<TextInput>` |
| `<img>` | `<Image>` |
| `<a>` | `<TouchableOpacity>` + `Linking.openURL()` |
| `<select>` | Custom Picker component |
| `<textarea>` | `<TextInput multiline>` |

---

## Styling

### Always Use StyleSheet.create()
```typescript
// ❌ WRONG - Inline styles or className
<View style={{ flex: 1, padding: 20 }}>
<View className="flex-1 p-5">

// ✅ CORRECT - StyleSheet.create()
<View style={styles.container}>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  }
});
```

### Platform-Specific Styling
```typescript
const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
      }
    })
  }
});
```

### Dynamic Styles with Theme
```typescript
// Use theme provider for consistent theming
const { theme } = useTheme();

const dynamicStyles = useMemo(() =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
    }
  }), [theme]
);
```

---

## Testing Requirements

### MANDATORY: testID Attributes
**Every interactive component MUST have a testID for testing:**

```typescript
// ✅ CORRECT - All interactive elements have testID
<TouchableOpacity testID="submit-button" onPress={handleSubmit}>
  <Text>Submit</Text>
</TouchableOpacity>

<TextInput
  testID="email-input"
  value={email}
  onChangeText={setEmail}
/>

<Switch
  testID="theme-toggle"
  value={isDarkMode}
  onValueChange={setIsDarkMode}
/>
```

### testID Naming Conventions
```typescript
// Format: [context]-[element]-[action/type]
testID="login-button"           // Screen context + element
testID="create-character-modal" // Action + element + type
testID="character-name-input"   // Entity + field + type
testID="nav-home-tab"           // Navigation element
testID="delete-item-55"         // Action + element + unique ID
```

### Using getTestProps Utility
```typescript
import { getTestProps } from '../utils/react-native-web-polyfills';

// For web compatibility (converts testID to data-cy)
<TouchableOpacity
  {...getTestProps('submit-button')}
  onPress={handleSubmit}
>
```

---

## Event Handlers

### Use Correct Event Names
```typescript
// ❌ WRONG - Web events
<TouchableOpacity onClick={handleClick}>
<TextInput onChange={handleChange}>

// ✅ CORRECT - React Native events
<TouchableOpacity onPress={handlePress}>
<TextInput onChangeText={handleChangeText}>
```

### Event Handler Naming
```typescript
// Use handle[Entity][Action] pattern
const handleSubmitForm = () => {};
const handleDeleteCharacter = () => {};
const handleToggleTheme = () => {};
```

---

## Text Handling

### Text Must Be in Text Component
```typescript
// ❌ WRONG - Text outside Text component
<View>Hello World</View>
<TouchableOpacity>Click me</TouchableOpacity>

// ✅ CORRECT - All text in Text component
<View>
  <Text>Hello World</Text>
</View>
<TouchableOpacity>
  <Text>Click me</Text>
</TouchableOpacity>
```

### Text Styling
```typescript
// Apply text styles to Text component, not container
<View style={styles.container}>
  <Text style={styles.title}>Title</Text>
  <Text style={styles.description}>Description</Text>
</View>

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  description: {
    fontSize: 16,
    color: '#666',
  }
});
```

---

## Platform-Specific Code

### Platform Detection
```typescript
import { Platform } from 'react-native';

// Simple platform checks
if (Platform.OS === 'ios') {
  // iOS specific code
}

// Platform.select for values
const iconName = Platform.select({
  ios: 'ios-settings',
  android: 'md-settings',
  web: 'settings',
});
```

### Platform-Specific Files
```
ComponentName.tsx         // Shared/default implementation
ComponentName.ios.tsx     // iOS-specific
ComponentName.android.tsx // Android-specific
ComponentName.web.tsx     // Web-specific
```

React Native will automatically import the correct file based on platform.

---

## Navigation

### TypeScript with React Navigation
```typescript
// Define navigation types
type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  Settings: undefined;
};

// Use typed navigation
const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
navigation.navigate('Profile', { userId: '123' });
```

### Screen Components
```typescript
interface ScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
  route: RouteProp<RootStackParamList, 'Profile'>;
}

export function ProfileScreen({ navigation, route }: ScreenProps) {
  const { userId } = route.params;
  // Screen implementation
}
```

---

## Storage

### Use AsyncStorage, Not localStorage
```typescript
// ❌ WRONG - Web storage
localStorage.setItem('user', JSON.stringify(userData));
const user = JSON.parse(localStorage.getItem('user'));

// ✅ CORRECT - AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.setItem('user', JSON.stringify(userData));
const userString = await AsyncStorage.getItem('user');
const user = userString ? JSON.parse(userString) : null;
```

---

## Performance

### Optimize Re-renders
```typescript
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }) => {
  // Component that shouldn't re-render often
});

// Use useCallback for event handlers
const handlePress = useCallback(() => {
  // Handle press
}, [dependency]);

// Use useMemo for expensive computations
const computedValue = useMemo(() => {
  return expensiveComputation(data);
}, [data]);
```

### FlatList Optimization
```typescript
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  // Performance optimizations
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  windowSize={10}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

---

## Accessibility

### Always Include Accessibility Props
```typescript
<TouchableOpacity
  testID="submit-button"
  accessibilityRole="button"
  accessibilityLabel="Submit form"
  accessibilityHint="Double tap to submit the form"
  accessibilityState={{ disabled: isLoading }}
>
  <Text>Submit</Text>
</TouchableOpacity>

<TextInput
  testID="email-input"
  accessibilityLabel="Email address"
  accessibilityHint="Enter your email address"
  accessible={true}
/>
```

---

## Error Handling

### Use Error Boundaries
```typescript
// Wrap screens and major components
<ErrorBoundary fallback={<ErrorScreen />}>
  <YourComponent />
</ErrorBoundary>
```

### Handle Async Errors
```typescript
const [error, setError] = useState<Error | null>(null);
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await api.getData();
    // Handle data
  } catch (err) {
    setError(err as Error);
    // Log to error service
  } finally {
    setLoading(false);
  }
};
```

---

## Comments and Documentation

### Use Better Comments Syntax
```typescript
// * Important information or highlights
// ! Warnings, deprecated code, or critical issues
// ? Questions or areas needing clarification
// TODO: Tasks to complete or improve
// // Commented out code (double slash for strikethrough)

// * This component handles user authentication
// ! DEPRECATED: Use useAuthStore() instead
// ? Should we add rate limiting here?
// TODO: Add password strength validation
```

---

## Component Checklist

Before considering a component complete, verify:

- [ ] Uses only React Native components (no HTML elements)
- [ ] All styles use StyleSheet.create()
- [ ] testID props on all interactive elements
- [ ] Proper event handlers (onPress, not onClick)
- [ ] All text wrapped in Text components
- [ ] Platform-specific code handled appropriately
- [ ] Error states handled
- [ ] Loading states implemented
- [ ] Accessibility props included
- [ ] TypeScript types defined
- [ ] Component documented with Better Comments

---

## Common Patterns

### Loading State Pattern
```typescript
if (isLoading) {
  return (
    <View style={styles.centerContainer} testID="loading-indicator">
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}
```

### Empty State Pattern
```typescript
if (!data || data.length === 0) {
  return (
    <View style={styles.emptyContainer} testID="empty-state">
      <Text style={styles.emptyText}>No items found</Text>
      <Button title="Create First Item" onPress={handleCreate} />
    </View>
  );
}
```

### Error State Pattern
```typescript
if (error) {
  return (
    <View style={styles.errorContainer} testID="error-state">
      <Text style={styles.errorText}>{error.message}</Text>
      <Button title="Retry" onPress={handleRetry} testID="retry-button" />
    </View>
  );
}
```

---

## Migration from Web

### Common Conversion Issues
1. **className to style**: Replace all className with style={styles.name}
2. **onClick to onPress**: Convert all click handlers
3. **div/span to View/Text**: Use proper RN components
4. **CSS to StyleSheet**: Convert all CSS to StyleSheet objects
5. **localStorage to AsyncStorage**: Use RN storage solution

---

## Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Platform-Specific Code](https://reactnative.dev/docs/platform-specific-code)

---

*Last Updated: 2025-09-26*
*Version: 1.0.0*
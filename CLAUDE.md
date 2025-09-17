# CLAUDE.md - FantasyWritingApp Development Guide

This file provides comprehensive guidance to Claude Code (claude.ai/code) for developing the FantasyWritingApp React Native project.

## Project Overview

**FantasyWritingApp** is a cross-platform creative writing application built with React Native that helps fiction writers craft, organize, and manage their stories. It provides tools for story creation, character development, scene management, and chapter organization across iOS, Android, and web platforms.

## Tech Stack

### Core Technologies
- **Framework**: React Native 0.75.4
- **Language**: TypeScript 5.2.2
- **State Management**: Zustand with AsyncStorage persistence
- **Navigation**: React Navigation 6
- **Styling**: React Native StyleSheet + Tailwind (via NativeWind for web)
- **Testing**: Cypress (E2E for web), Jest + React Native Testing Library
- **Build Tools**: Metro (mobile), Webpack (web)
- **Package Manager**: npm

### Platform-Specific
- **Web**: React Native Web + Webpack configuration
- **iOS**: Native iOS modules via CocoaPods
- **Android**: Native Android modules via Gradle

## Project Structure

```
FantasyWritingApp/
├── src/                        # Source code
│   ├── components/            # Reusable UI components
│   │   ├── common/           # Cross-platform components
│   │   ├── native/           # Mobile-specific components
│   │   └── web/              # Web-specific components
│   ├── screens/              # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── StoryEditor.tsx
│   │   ├── CharacterManager.tsx
│   │   └── SceneEditor.tsx
│   ├── navigation/           # Navigation configuration
│   ├── store/                # State management (Zustand)
│   │   ├── storyStore.ts
│   │   ├── characterStore.ts
│   │   └── settingsStore.ts
│   ├── types/                # TypeScript definitions
│   │   ├── story.types.ts
│   │   ├── character.types.ts
│   │   └── scene.types.ts
│   ├── utils/                # Utility functions
│   │   ├── platform.ts       # Platform detection
│   │   └── storage.ts        # AsyncStorage helpers
│   └── styles/               # Shared styles
├── ios/                       # iOS-specific code
├── android/                   # Android-specific code
├── web/                       # Web-specific configuration
│   └── webpack.config.js
├── cypress/                   # Cypress tests
│   ├── e2e/                  # E2E tests
│   ├── fixtures/             # Test data factories
│   └── support/              # Test utilities
└── __tests__/                # Jest unit tests
```

## React Native Development Guidelines

### Cross-Platform Components

#### Platform-Specific Code
```tsx
import { Platform, StyleSheet } from 'react-native';

// Platform detection
const isWeb = Platform.OS === 'web';
const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';

// Platform-specific styling
const styles = StyleSheet.create({
  container: {
    padding: 16,
    ...Platform.select({
      ios: {
        paddingTop: 20,
      },
      android: {
        paddingTop: 10,
      },
      web: {
        maxWidth: 1200,
        marginHorizontal: 'auto',
      },
    }),
  },
});

// Platform-specific components
const StoryEditor = () => {
  if (Platform.OS === 'web') {
    return <WebRichTextEditor />;
  }
  return <NativeTextEditor />;
};
```

#### Responsive Design for Web
```tsx
import { Dimensions, useWindowDimensions } from 'react-native';

const ResponsiveComponent = () => {
  const { width, height } = useWindowDimensions();
  
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;
  
  return (
    <View style={[
      styles.container,
      isTablet && styles.tabletLayout,
      isDesktop && styles.desktopLayout,
    ]}>
      {/* Responsive content */}
    </View>
  );
};
```

### Component Best Practices

#### Testable Components with data-cy
```tsx
// ✅ ALWAYS add data-cy attributes for Cypress testing
import { View, Text, TouchableOpacity, TextInput } from 'react-native';

export const StoryCard = ({ story, onPress }) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      // React Native Web will convert this to data-cy in DOM
      testID="story-card"
      accessibilityLabel={`Story: ${story.title}`}
    >
      <View testID={`story-card-${story.id}`}>
        <Text testID="story-title">{story.title}</Text>
        <Text testID="story-word-count">{story.wordCount} words</Text>
      </View>
    </TouchableOpacity>
  );
};

// For web-specific testing attributes
import { Platform } from 'react-native';

const getTestProps = (id: string) => {
  if (Platform.OS === 'web') {
    return { 'data-cy': id };
  }
  return { testID: id };
};

<TextInput {...getTestProps('story-title-input')} />
```

#### Accessibility First
```tsx
// ✅ Include accessibility props in all interactive components
<TouchableOpacity
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Create new story"
  accessibilityHint="Opens the story creation form"
  onPress={handleCreateStory}
>
  <Text>Create Story</Text>
</TouchableOpacity>

// For form inputs
<TextInput
  accessible={true}
  accessibilityLabel="Story title"
  accessibilityHint="Enter the title for your story"
  placeholder="Enter story title..."
/>
```

### State Management with Zustand

#### Store Setup for React Native
```typescript
// src/store/storyStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface StoryStore {
  stories: Story[];
  currentStory: Story | null;
  createStory: (story: Partial<Story>) => void;
  updateStory: (id: string, updates: Partial<Story>) => void;
  deleteStory: (id: string) => void;
}

// Use AsyncStorage for mobile, localStorage for web
const storage = Platform.OS === 'web' 
  ? createJSONStorage(() => localStorage)
  : createJSONStorage(() => AsyncStorage);

export const useStoryStore = create<StoryStore>()(
  persist(
    (set, get) => ({
      stories: [],
      currentStory: null,
      
      createStory: (storyData) => {
        const newStory: Story = {
          id: Date.now().toString(),
          title: '',
          content: '',
          wordCount: 0,
          chapters: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          ...storyData,
        };
        
        set((state) => ({
          stories: [...state.stories, newStory],
          currentStory: newStory,
        }));
      },
      
      updateStory: (id, updates) => {
        set((state) => ({
          stories: state.stories.map((story) =>
            story.id === id 
              ? { ...story, ...updates, updatedAt: new Date() }
              : story
          ),
          currentStory: state.currentStory?.id === id
            ? { ...state.currentStory, ...updates }
            : state.currentStory,
        }));
      },
      
      deleteStory: (id) => {
        set((state) => ({
          stories: state.stories.filter((story) => story.id !== id),
          currentStory: state.currentStory?.id === id 
            ? null 
            : state.currentStory,
        }));
      },
    }),
    {
      name: 'fantasy-writing-app-stories',
      storage,
    }
  )
);
```

### Navigation Setup

#### React Navigation Configuration
```typescript
// src/navigation/AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Type-safe navigation
export type RootStackParamList = {
  Home: undefined;
  StoryEditor: { storyId: string };
  CharacterManager: { storyId: string };
  SceneEditor: { storyId: string; sceneId?: string };
};

const StoryStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="StoryEditor" component={StoryEditor} />
    <Stack.Screen name="CharacterManager" component={CharacterManager} />
    <Stack.Screen name="SceneEditor" component={SceneEditor} />
  </Stack.Navigator>
);

export const AppNavigator = () => {
  // Use tabs for mobile, stack for web
  if (Platform.OS === 'web') {
    return (
      <NavigationContainer>
        <StoryStack />
      </NavigationContainer>
    );
  }
  
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Stories" component={StoryStack} />
        <Tab.Screen name="Characters" component={CharacterScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
```

## Cypress Testing for React Native Web

### Setup for React Native Web Testing
```typescript
// cypress/e2e/story-creation.cy.ts
describe('Story Creation', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3002'); // Web dev server
    cy.viewport('iphone-x'); // Test mobile viewport
  });

  it('creates a new story', () => {
    // React Native Web converts testID to data-cy
    cy.get('[data-cy="create-story-button"]').click();
    cy.get('[data-cy="story-title-input"]').type('My Fantasy Novel');
    cy.get('[data-cy="story-genre-select"]').select('Fantasy');
    cy.get('[data-cy="save-story-button"]').click();
    
    // Verify navigation and persistence
    cy.url().should('include', '/story/');
    cy.get('[data-cy="story-title"]').should('contain', 'My Fantasy Novel');
  });

  it('works on different viewports', () => {
    // Test responsive behavior
    cy.viewport('iphone-x');
    cy.get('[data-cy="mobile-menu"]').should('be.visible');
    
    cy.viewport('ipad-2');
    cy.get('[data-cy="tablet-sidebar"]').should('be.visible');
    
    cy.viewport('macbook-15');
    cy.get('[data-cy="desktop-layout"]').should('be.visible');
  });
});
```

### Testing Touch Interactions
```typescript
// cypress/support/commands.ts
Cypress.Commands.add('swipe', (selector: string, direction: 'left' | 'right') => {
  cy.get(selector)
    .trigger('touchstart', { position: 'center' })
    .trigger('touchmove', { 
      position: direction === 'left' ? 'left' : 'right' 
    })
    .trigger('touchend');
});

// Usage in tests
cy.swipe('[data-cy="story-card"]', 'left');
cy.get('[data-cy="delete-option"]').should('be.visible');
```

## Development Commands

```bash
# Install dependencies
npm install
cd ios && pod install  # iOS only

# Start development
npm run web            # Start web dev server (port 3002)
npm run ios           # Start iOS simulator
npm run android       # Start Android emulator
npm run start         # Start Metro bundler

# Testing
npm run test          # Run Jest unit tests
npm run test:watch    # Watch mode for Jest
npm run cypress:open  # Open Cypress for web testing
npm run cypress:run   # Run Cypress headlessly
npm run test:e2e      # Run all E2E tests

# Building
npm run build:web     # Build for web production
npm run build:ios     # Build iOS app
npm run build:android # Build Android APK

# Linting & Formatting
npm run lint          # ESLint
npm run lint:fix      # Fix linting issues
npm run format        # Prettier formatting
npm run typecheck     # TypeScript checking
```

## Platform-Specific Considerations

### iOS Development
```tsx
// iOS-specific features
import { SafeAreaView, KeyboardAvoidingView } from 'react-native';

const IOSScreen = () => (
  <SafeAreaView style={styles.container}>
    <KeyboardAvoidingView 
      behavior="padding"
      keyboardVerticalOffset={100}
    >
      {/* Your content */}
    </KeyboardAvoidingView>
  </SafeAreaView>
);
```

### Android Development
```tsx
// Android-specific handling
import { BackHandler, ToastAndroid } from 'react-native';

useEffect(() => {
  const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    () => {
      // Handle Android back button
      if (canGoBack) {
        navigation.goBack();
        return true;
      }
      return false;
    }
  );
  
  return () => backHandler.remove();
}, []);
```

### Web Development
```tsx
// Web-specific features
import { Platform, ScrollView } from 'react-native';

const WebScrollView = ({ children }) => (
  <ScrollView
    style={styles.scrollView}
    // Web-specific props
    {...(Platform.OS === 'web' && {
      showsVerticalScrollIndicator: true,
      style: { height: '100vh' },
    })}
  >
    {children}
  </ScrollView>
);
```

## Performance Optimization

### React Native Performance Tips
```tsx
// 1. Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.data.id === nextProps.data.id;
});

// 2. Optimize lists with FlashList (better than FlatList)
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={stories}
  renderItem={({ item }) => <StoryCard story={item} />}
  estimatedItemSize={100}
  keyExtractor={(item) => item.id}
/>

// 3. Lazy load screens
const StoryEditor = React.lazy(() => import('./screens/StoryEditor'));

// 4. Use InteractionManager for expensive operations
import { InteractionManager } from 'react-native';

useEffect(() => {
  InteractionManager.runAfterInteractions(() => {
    // Expensive operation after animations complete
    loadLargeDataset();
  });
}, []);
```

## Common React Native Pitfalls & Solutions

### 1. Text Must Be in Text Component
```tsx
// ❌ Wrong
<View>
  Some text
</View>

// ✅ Correct
<View>
  <Text>Some text</Text>
</View>
```

### 2. Image Requires Dimensions
```tsx
// ❌ Wrong
<Image source={{ uri: imageUrl }} />

// ✅ Correct
<Image 
  source={{ uri: imageUrl }}
  style={{ width: 200, height: 200 }}
/>
```

### 3. Styles Are Not CSS
```tsx
// ❌ Wrong - CSS syntax
const styles = StyleSheet.create({
  container: {
    margin: '10px auto', // Strings not allowed
    display: 'flex',     // Implicit in React Native
  }
});

// ✅ Correct - React Native syntax
const styles = StyleSheet.create({
  container: {
    margin: 10,
    alignSelf: 'center',
  }
});
```

### 4. No Hover States on Mobile
```tsx
// Handle press states instead
const [isPressed, setIsPressed] = useState(false);

<TouchableOpacity
  onPressIn={() => setIsPressed(true)}
  onPressOut={() => setIsPressed(false)}
  style={[styles.button, isPressed && styles.buttonPressed]}
>
  <Text>Press Me</Text>
</TouchableOpacity>
```

## Writing Domain Types

```typescript
// src/types/story.types.ts
export interface Story {
  id: string;
  title: string;
  content: string;
  summary?: string;
  genre: 'fantasy' | 'scifi' | 'mystery' | 'romance' | 'thriller';
  status: 'draft' | 'published' | 'archived';
  wordCount: number;
  chapters: Chapter[];
  characters: string[]; // Character IDs
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  orderIndex: number;
  wordCount: number;
  status: 'draft' | 'published';
  scenes?: Scene[];
}

export interface Character {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  description: string;
  backstory: string;
  personality: string[];
  goals: string[];
  relationships: CharacterRelationship[];
  storyIds: string[];
  appearance?: CharacterAppearance;
}

export interface Scene {
  id: string;
  title: string;
  content: string;
  chapterId: string;
  characters: string[]; // Character IDs in scene
  location?: string;
  timeOfDay?: string;
  mood?: string;
  orderIndex: number;
}
```

## Git Workflow

### Branching Strategy
```bash
# Feature development
git checkout -b feature/rich-text-editor
git checkout -b feature/character-profiles
git checkout -b bugfix/story-save-crash
git checkout -b enhancement/performance-optimization

# Commit messages
git commit -m "feat: add rich text editor for story content"
git commit -m "fix: resolve crash when saving story with special characters"
git commit -m "perf: optimize story list rendering with FlashList"
git commit -m "docs: update React Native setup instructions"
git commit -m "test: add Cypress tests for character creation"
```

## Testing Strategy

### Test Pyramid for React Native
1. **Unit Tests (Jest)**: 60% - Business logic, utilities, stores
2. **Component Tests (React Native Testing Library)**: 25% - Component behavior
3. **E2E Tests (Cypress for Web, Detox for Mobile)**: 15% - Critical user flows

### Testing Checklist
- [ ] All interactive elements have `testID` (mobile) or `data-cy` (web)
- [ ] Components are accessible with proper labels
- [ ] Error states are handled and tested
- [ ] Loading states are implemented
- [ ] Cross-platform behavior is verified
- [ ] Responsive design works on all viewports
- [ ] Offline functionality is tested
- [ ] Performance is acceptable on low-end devices

## Important Instructions for Claude

### React Native Development Rules

1. **ALWAYS use React Native components**, never HTML elements:
   - Use `View` not `div`
   - Use `Text` not `p` or `span`
   - Use `TouchableOpacity` not `button`
   - Use `TextInput` not `input`
   - Use `ScrollView` or `FlatList` not custom scroll

2. **ALWAYS add testID attributes** for testing:
   - Add `testID` prop to all interactive components
   - Use semantic names like `testID="create-story-button"`
   - For web, these automatically become `data-cy` attributes

3. **ALWAYS handle platform differences**:
   - Use `Platform.select()` for platform-specific code
   - Test on both mobile and web viewports
   - Consider touch vs mouse interactions

4. **ALWAYS follow React Native styling**:
   - Use `StyleSheet.create()` for styles
   - No CSS strings, only style objects
   - Remember flexbox is default
   - Dimensions need explicit values

5. **ALWAYS ensure accessibility**:
   - Add `accessible={true}` to interactive elements
   - Include `accessibilityLabel` and `accessibilityHint`
   - Use `accessibilityRole` appropriately

6. **ALWAYS consider performance**:
   - Use `React.memo` for expensive components
   - Implement proper list virtualization
   - Lazy load screens and heavy components
   - Optimize images and assets

### Writing App Specific Rules

1. **Domain Terminology**:
   - Use "Story" not "Project"
   - Use "Chapter" not "Section"
   - Use "Scene" for sub-chapter content
   - Use "Character" for people in stories

2. **Features to Prioritize**:
   - Story creation and editing
   - Chapter management
   - Character development
   - Scene organization
   - Word count tracking
   - Auto-save functionality

3. **Testing Focus**:
   - Test story CRUD operations
   - Test chapter navigation
   - Test character management
   - Test auto-save
   - Test cross-platform consistency

### Before ANY Pull Request

1. Run all tests: `npm run test && npm run cypress:run`
2. Check TypeScript: `npm run typecheck`
3. Lint code: `npm run lint`
4. Test on web: `npm run web`
5. Test on iOS simulator (Mac only): `npm run ios`
6. Test on Android emulator: `npm run android`
7. Verify accessibility
8. Check responsive design

### Code Quality Standards

Every piece of code must:
- Work on iOS, Android, and Web
- Have proper TypeScript types
- Include error handling
- Have loading states
- Be accessible
- Include appropriate test coverage
- Follow React Native best practices
- Use consistent styling patterns

## Git Operations

### Smart Git Workflow

This project uses intelligent git operations to maintain consistent version control practices.

#### Available Commands

##### Status Analysis
```bash
/sc:git status
# Provides comprehensive repository state analysis
# Shows staged/unstaged changes with recommendations
# Identifies branch state and sync status
```

##### Smart Commits
```bash
/sc:git commit --smart-commit
# Analyzes changes and generates conventional commit message
# Follows format: type(scope): description
# Types: feat, fix, docs, style, refactor, test, chore
```

##### Branch Management
```bash
/sc:git branch feature/new-feature
# Creates branch following naming conventions
# Patterns: feature/, bugfix/, hotfix/, release/

/sc:git merge feature-branch --interactive
# Guided merge with conflict resolution assistance
# Provides step-by-step conflict resolution
```

#### Git Workflow Best Practices

1. **Commit Message Format**:
   ```
   type(scope): subject
   
   body (optional)
   
   footer (optional)
   ```
   
   Examples:
   - `feat(stories): add chapter reordering functionality`
   - `fix(auth): resolve token refresh issue`
   - `docs(readme): update installation instructions`

2. **Branch Naming Conventions**:
   - **Feature branches**: `feature/description-of-feature`
   - **Bug fixes**: `bugfix/issue-number-description`
   - **Hot fixes**: `hotfix/critical-issue-description`
   - **Release branches**: `release/version-number`

3. **Workflow Process**:
   ```bash
   # 1. Create feature branch from dev
   git checkout dev
   git pull origin dev
   git checkout -b feature/new-feature
   
   # 2. Make changes and commit
   /sc:git commit --smart-commit
   
   # 3. Push to remote
   git push -u origin feature/new-feature
   
   # 4. Create pull request to dev
   # After review and approval, merge to dev
   
   # 5. Periodically merge dev to main for releases
   ```

4. **Pre-Commit Checklist**:
   - Run tests: `npm test`
   - Check types: `npm run typecheck`
   - Lint code: `npm run lint`
   - Test on web: `npm run web`
   - Verify no console errors

5. **Merge Conflict Resolution**:
   ```bash
   # Use interactive merge for assistance
   /sc:git merge branch-name --interactive
   
   # Or manually:
   git merge branch-name
   # Resolve conflicts in files
   git add resolved-files
   git commit
   ```

#### Repository Configuration

The repository follows this branch structure:
- **main**: Production-ready code
- **dev**: Active development branch
- **feature/***: Individual feature branches
- **bugfix/***: Bug fix branches
- **hotfix/***: Emergency production fixes

All pull requests should target the `dev` branch unless they are hotfixes for production issues.
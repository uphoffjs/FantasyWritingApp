# CLAUDE.md - FantasyWritingApp Development Guide

This file provides comprehensive guidance to Claude Code (claude.ai/code) for developing the FantasyWritingApp React Native project.

## 🚨 MANDATORY PRE-CODE CHECKLIST
Before writing ANY code, you MUST:
1. ✅ Read this entire CLAUDE.md file if not already done in this session
2. ✅ Always include helpful code comments explaining complex logic
3. ✅ Use only `data-cy` attributes for test selectors (NEVER use CSS classes, IDs, or other selectors)
4. ✅ Run `npm run lint` before marking tasks complete
5. ✅ Fix code first when tests fail, then verify test correctness if code appears correct
6. ✅ Read existing files with Read tool before editing

**REMINDER**: After compacting/compression, ALWAYS re-read this file first!

---

## Project Overview

**FantasyWritingApp** is a cross-platform creative writing application built with React Native that helps fiction writers craft, organize, and manage their stories. It provides tools for story creation, character development, scene management, and chapter organization across iOS, Android, and web platforms.

## Key Concepts

### What are "Elements"?
Elements are the building blocks of fictional worlds:
- **Characters**: Protagonists, antagonists, supporting characters
- **Locations**: Cities, kingdoms, buildings, geographical features  
- **Magic/Power Systems**: How supernatural abilities work
- **Cultures/Societies**: Different groups and their ways of life
- **Creatures/Species**: Non-human beings (dragons, elves, etc.)
- **Organizations**: Guilds, armies, governments
- **Religions/Belief Systems**: Faiths, philosophies, mythologies
- **Technologies**: Tools, weapons, inventions
- **Historical Events**: Important past occurrences
- **Languages**: Communication systems, dialects

### Core Features
1. **Dynamic Questionnaires**: Each element type has customizable questions to guide writers
2. **Relationship Management**: Link elements together (e.g., "character rules location")
3. **Project Organization**: Multiple projects for different stories/worlds
4. **Templates**: Pre-built and custom templates for each element category
5. **Progress Tracking**: Completion percentage for each element
6. **Import/Export**: JSON export/import for backup and sharing

### Quick Commands
```bash
# Development
npm run web            # Start web dev server (port 3002)
npm run ios           # Start iOS simulator
npm run android       # Start Android emulator
npm run lint          # Run linter (MANDATORY before commits)

# Testing
npm run test          # Run Jest unit tests
npm run cypress:open  # Open Cypress UI
npm run cypress:run   # Run Cypress headlessly

# Build & Deploy
npm run build:web     # Build for web production
npm run build:ios     # Build iOS app
npm run build:android # Build Android APK

# Supabase Database Management
npm run supabase      # Run Supabase CLI tool
npm run supabase:fix-rls  # Apply RLS policy fixes
npm run supabase:interactive  # Interactive database query mode

# Git operations (when requested)
git commit           # Create well-formatted commit with conventional format
```

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

---

## Core Development Rules

### 1. Code Comments Policy (Better Comments)
- **Always include helpful code comments** using Better Comments patterns for visibility
- **Better Comments Syntax** (works with Better Comments VS Code extension):
  - `// !` - Important warnings, security issues, breaking changes (red)
  - `// ?` - Questions, design decisions needing review (blue)
  - `// TODO:` - Tasks that need to be done, improvements needed (orange)
  - `// *` - Highlights, important notes, section headers (green)
  - `// //` - Deprecated code marked for removal (strikethrough)
- **Usage Guidelines**:
  - Use `// !` for security warnings, critical performance issues, hardcoded values
  - Use `// ?` for architectural decisions that need team discussion
  - Use `// TODO:` for incomplete features, refactoring opportunities
  - Use `// *` for explaining complex logic, cross-platform considerations
  - Use `// //` for temporary workarounds or legacy code
- Comments should explain "why" not just "what"
- Document complex business logic inline
- Write self-documenting code with clear function/variable names

### 2. Testing Selectors
- **ONLY use `data-cy` attributes** - This is the ONLY acceptable selector strategy
- **NEVER use**: CSS classes, IDs, tag names, text content, or any other selector
- If a `data-cy` attribute doesn't exist, ADD IT TO THE CODE FIRST
- Use kebab-case naming: `data-cy="submit-button"`
- For React Native: use `testID` which converts to `data-cy` on web

### 3. Code Quality Standards
- **Run `npm run lint` MANDATORY** before marking any task complete
- No `console.log` statements in production code
- All components MUST have error boundaries
- Validate and sanitize ALL user inputs
- Never expose sensitive data or API keys

### 4. Development Workflow

#### Before Writing Code
1. ✅ Read existing file(s) with Read tool first
2. ✅ Check if framework/library exists in package.json
3. ✅ Identify existing patterns and conventions
4. ✅ Verify elements have `data-cy`/`testID` attributes (add if missing)
5. ✅ All components made and edited should be mobile first

#### During Development
1. ✅ Follow import organization and component structure
2. ✅ Include helpful code comments
3. ✅ Add `data-cy`/`testID` attributes using kebab-case
4. ✅ Implement error handling (loading/success/error states)
5. ✅ Add error boundaries
6. ✅ Validate and sanitize user inputs
7. ✅ Write tests as you code (TDD approach)

#### After Writing Code
1. ✅ Run `npm run lint` (MANDATORY)
2. ✅ Check browser console for errors
3. ✅ Test on mobile/tablet/desktop viewports
4. ✅ Run all tests
5. ✅ Verify no sensitive data exposed

### NEVER Do These
- ❌ Skip reading files before editing
- ❌ Use selectors other than `data-cy`/`testID`
- ❌ Commit without running lint
- ❌ Create feature branches unless explicitly requested
- ❌ Use if statements in Cypress tests
- ❌ Skip tests to make suite pass
- ❌ Leave console.log statements in code

---

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

## Testing Philosophy & Requirements

### Core Testing Principles
1. **When tests fail**: Assume code is wrong FIRST, then verify test correctness if code appears correct
2. **Test independence**: Each test must pass in isolation
3. **No conditional logic**: ABSOLUTELY NO `if` statements in Cypress tests
4. **Comprehensive coverage**: Test happy paths AND edge cases
5. **Test Structure**: Use Arrange → Act → Assert pattern

### Cypress Testing Rules

#### Mandatory in EVERY Test
- **`cy.comprehensiveDebug()`** in every `beforeEach` hook - THIS IS MANDATORY
- **`cy.cleanState()`** to reset application state before each test
- Use `function()` syntax (not arrow functions) for hooks to access `this.currentTest`
- Single flat describe blocks (never nest)
- Clear test naming that describes expected behavior
- NEVER use conditional logic (if/else statements) in tests

#### Test File Structure
```javascript
// * MANDATORY structure for all Cypress tests
describe('Feature Name', () => {
  // ! MUST use function() syntax, not arrow functions
  beforeEach(function() {
    // ! MANDATORY: comprehensive debugging
    cy.comprehensiveDebug();
    
    // ! MANDATORY: clean state before any operations
    cy.cleanState();
    
    // Setup test data if needed
    cy.setupTestData();
    
    // Visit the app
    cy.visit('http://localhost:3002');
    
    // Set viewport for React Native Web testing
    cy.viewport('iphone-x'); // Mobile-first testing
  });
  
  afterEach(function() {
    // Capture debug info on failure
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
  
  it('should perform specific behavior', () => {
    // * Arrange: Set up test conditions
    cy.get('[data-cy="element"]').should('be.visible');
    
    // * Act: Perform the action being tested
    cy.get('[data-cy="action-button"]').click();
    
    // * Assert: Verify the expected outcome
    cy.get('[data-cy="result"]').should('contain', 'expected text');
  });
});
```

#### Custom Commands for React Native Web
```javascript
// cypress/support/commands.ts

// * Comprehensive debugging command (MANDATORY in all tests - NO EXCEPTIONS)
Cypress.Commands.add('comprehensiveDebug', () => {
  const timestamp = new Date().toISOString();
  cy.task('log', `[${timestamp}] Test started: ${Cypress.currentTest.title}`);
  
  // Log browser info
  cy.window().then((win) => {
    cy.task('log', `Browser: ${win.navigator.userAgent}`);
    cy.task('log', `Viewport: ${win.innerWidth}x${win.innerHeight}`);
  });
  
  // Log any console errors
  cy.on('window:before:load', (win) => {
    cy.stub(win.console, 'error').callsFake((...args) => {
      cy.task('log', `Console Error: ${args.join(' ')}`);
    });
  });
});

// * Clean state before tests
Cypress.Commands.add('cleanState', () => {
  // Clear AsyncStorage (React Native Web)
  cy.window().then((win) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
  
  // Clear any persisted Zustand stores
  cy.clearAllSessionStorage();
  cy.clearAllLocalStorage();
});

// * Capture failure debug info
Cypress.Commands.add('captureFailureDebug', () => {
  const testName = Cypress.currentTest.title;
  const timestamp = Date.now();
  
  // Screenshot with meaningful name
  cy.screenshot(`failed-${testName}-${timestamp}`);
  
  // Log current URL and any visible errors
  cy.url().then((url) => {
    cy.task('log', `Failed at URL: ${url}`);
  });
  
  // Capture any React Native error boundaries
  cy.get('[data-cy="error-boundary"]', { timeout: 0 }).then(($el) => {
    if ($el.length) {
      cy.task('log', `Error boundary triggered: ${$el.text()}`);
    }
  });
});

// * React Native Web specific - handle touch interactions
Cypress.Commands.add('swipe', (selector: string, direction: 'left' | 'right' | 'up' | 'down') => {
  const positions = {
    left: { start: 'right', end: 'left' },
    right: { start: 'left', end: 'right' },
    up: { start: 'bottom', end: 'top' },
    down: { start: 'top', end: 'bottom' }
  };
  
  cy.get(selector)
    .trigger('touchstart', { position: positions[direction].start })
    .trigger('touchmove', { position: positions[direction].end })
    .trigger('touchend');
});

// * Setup test data for React Native app
Cypress.Commands.add('setupTestData', () => {
  // Create default test story
  const testStory = {
    id: 'test-story-1',
    title: 'Test Fantasy Story',
    genre: 'fantasy',
    content: 'Test content',
    createdAt: new Date().toISOString()
  };
  
  // Store in AsyncStorage format for React Native
  cy.window().then((win) => {
    win.localStorage.setItem(
      'fantasy-writing-app-stories',
      JSON.stringify({ stories: [testStory] })
    );
  });
});
```

#### Testing React Native Web Components
```typescript
// cypress/e2e/story-creation.cy.ts
describe('Story Creation - React Native Web', () => {
  beforeEach(function() {
    // ! MANDATORY debugging
    cy.comprehensiveDebug();
    cy.cleanState();
    
    cy.visit('http://localhost:3002');
    cy.viewport('iphone-x'); // Mobile-first
  });
  
  afterEach(function() {
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  it('creates a new story with React Native components', () => {
    // * Test React Native TouchableOpacity
    cy.get('[data-cy="create-story-button"]').click();
    
    // * Test React Native TextInput
    cy.get('[data-cy="story-title-input"]')
      .type('My Fantasy Novel')
      .should('have.value', 'My Fantasy Novel');
    
    // * Test React Native Picker/Select
    cy.get('[data-cy="story-genre-picker"]').click();
    cy.get('[data-cy="genre-option-fantasy"]').click();
    
    // * Test form submission
    cy.get('[data-cy="save-story-button"]').click();
    
    // * Verify navigation (React Navigation)
    cy.url().should('include', '/story/');
    cy.get('[data-cy="story-title"]').should('contain', 'My Fantasy Novel');
    
    // * Verify persistence (AsyncStorage/Zustand)
    cy.reload();
    cy.get('[data-cy="story-title"]').should('contain', 'My Fantasy Novel');
  });

  it('handles responsive viewports correctly', () => {
    // * Mobile viewport
    cy.viewport('iphone-x');
    cy.get('[data-cy="mobile-navigation"]').should('be.visible');
    cy.get('[data-cy="desktop-sidebar"]').should('not.exist');
    
    // * Tablet viewport
    cy.viewport('ipad-2');
    cy.get('[data-cy="tablet-layout"]').should('be.visible');
    
    // * Desktop viewport
    cy.viewport('macbook-15');
    cy.get('[data-cy="desktop-sidebar"]').should('be.visible');
    cy.get('[data-cy="mobile-navigation"]').should('not.exist');
  });

  it('handles touch gestures on mobile', () => {
    cy.viewport('iphone-x');
    
    // * Test swipe to delete
    cy.get('[data-cy="story-card-1"]').should('be.visible');
    cy.swipe('[data-cy="story-card-1"]', 'left');
    cy.get('[data-cy="delete-action"]').should('be.visible');
    
    // * Test pull to refresh
    cy.swipe('[data-cy="story-list"]', 'down');
    cy.get('[data-cy="refresh-indicator"]').should('be.visible');
  });

  it('validates form inputs properly', () => {
    cy.get('[data-cy="create-story-button"]').click();
    
    // * Test empty submission
    cy.get('[data-cy="save-story-button"]').click();
    cy.get('[data-cy="error-message"]').should('contain', 'Title is required');
    
    // * Test validation rules
    cy.get('[data-cy="story-title-input"]').type('a'); // Too short
    cy.get('[data-cy="save-story-button"]').click();
    cy.get('[data-cy="error-message"]').should('contain', 'Title must be at least 3 characters');
    
    // * Test successful submission
    cy.get('[data-cy="story-title-input"]').clear().type('Valid Story Title');
    cy.get('[data-cy="save-story-button"]').click();
    cy.get('[data-cy="error-message"]').should('not.exist');
  });
});
```

### Testing Coverage Requirements
- **Test Pyramid Distribution**:
  - 50-60% Unit tests (Jest + React Native Testing Library)
  - 25-35% Component tests (React Native Testing Library)
  - 15-20% E2E tests (Cypress for Web, Detox for Mobile)
  - 100% critical user paths must have E2E coverage
  
- **ALL new features must include**:
  - Comprehensive E2E tests covering happy path and edge cases
  - Component tests for UI components
  - Unit tests for utilities and business logic
  - API tests for Supabase endpoints
  - Cross-platform tests (mobile/tablet/desktop viewports)

### Debugging Failed Tests

#### Step-by-Step Debugging Process
1. **Check debug output**:
   - Look in `cypress/debug-logs/` for detailed logs
   - Review screenshots in `cypress/screenshots/`
   - Check video recordings in `cypress/videos/`

2. **Analyze failure patterns**:
   - Is it a timing issue? Add appropriate waits
   - Is it a selector issue? Verify `data-cy` attributes exist
   - Is it a state issue? Check `cy.cleanState()` is working

3. **Fix the CODE first**:
   - Assume the implementation is wrong
   - Check React Native component rendering
   - Verify testID → data-cy conversion

4. **Verify test logic** (only if code appears correct):
   - Check test is using correct selectors
   - Verify assertions match expected behavior
   - Ensure test data setup is correct

5. **NEVER DO**:
   - Add `if` statements to make tests pass
   - Skip failing tests
   - Use `.only()` to avoid running other tests
   - Modify test expectations to match broken behavior

#### Common React Native Web Testing Issues

1. **testID not converting to data-cy**:
   ```javascript
   // ❌ Wrong - testID might not convert
   <TouchableOpacity testID="button">
   
   // ✅ Correct - explicit platform handling
   <TouchableOpacity {...Platform.select({
     web: { 'data-cy': 'button' },
     default: { testID: 'button' }
   })}>
   ```

2. **Timing issues with React Native animations**:
   ```javascript
   // Wait for React Native animations
   cy.get('[data-cy="animated-view"]').should('be.visible');
   cy.wait(500); // Wait for animation to complete
   ```

3. **AsyncStorage not persisting**:
   ```javascript
   // Ensure AsyncStorage is mocked properly
   cy.window().then((win) => {
     // Check localStorage is being used on web
     expect(win.localStorage.getItem('key')).to.exist;
   });
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

# Supabase Database Management
npm run supabase      # Run interactive Supabase CLI
npm run supabase:fix-rls  # Apply Row Level Security fixes
npm run supabase:interactive  # Interactive query mode
# Direct usage:
node scripts/supabase-cli.js "SELECT * FROM projects"
node scripts/supabase-cli.js --file scripts/simple-fix-rls.sql
```

## App Debugging & Error Diagnostics

### When App Fails to Launch - Claude's Diagnostic Workflow

When the app fails to launch or shows errors, Claude follows this systematic diagnostic process:

#### 1. Check Webpack Dev Server Output
```bash
# * Check for compilation errors in running webpack process
# Look for ERROR or FAIL in the output
# Claude uses: BashOutput tool to check background processes
```

#### 2. Verify HTTP Response
```bash
# * Check if app server is responding
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# Should return 200 for success
```

#### 3. Run Automated E2E Tests
```bash
# * Run Cypress tests to capture console errors
npm run cypress:run -- --spec "cypress/e2e/app-launch.cy.ts"
# Tests will capture and report any console errors
```

#### 4. Check TypeScript Compilation
```bash
# * Look for TypeScript errors
npm run typecheck
# Fix any type errors before proceeding
```

#### 5. Verify Dependencies
```bash
# * Check for missing or conflicting dependencies
npm ls
# Look for unmet peer dependencies or version conflicts
```

### Error Boundary Implementation

Claude will check for and implement error boundaries to catch React runtime errors:

```tsx
// * Add to App.tsx or create ErrorBoundary.tsx
import React from 'react';
import { View, Text } from 'react-native';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    // * Update state so next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // * Log error to console for debugging
    console.error('App Error Boundary:', error, errorInfo);
    // TODO: Send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <View testID="error-boundary" style={{ padding: 20 }}>
          <Text>Something went wrong. Please refresh the app.</Text>
          <Text>{this.state.error?.message}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// * Wrap App component
export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
```

### Console Error Capture

Claude can implement automatic error capturing:

```javascript
// * Add to index.web.js or App.tsx initialization
if (Platform.OS === 'web') {
  // * Capture all uncaught errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', {
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno,
      stack: event.error?.stack
    });

    // * Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement error reporting
    }
  });

  // * Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
}
```

### What Claude Cannot Do

Claude cannot directly:
- Access your browser's DevTools console
- See client-side errors that aren't logged to server
- Debug visual rendering issues without screenshots

### What You Should Do

When encountering errors:

1. **Open Browser DevTools** (F12 or right-click → Inspect)
2. **Check Console Tab** for red error messages
3. **Look at Network Tab** for failed API requests
4. **Take Screenshots** of any visual issues
5. **Copy Error Messages** and share with Claude

Example error report to Claude:
```
Error in console:
TypeError: Cannot read property 'map' of undefined
  at ProjectList (ProjectList.tsx:45)
  at renderWithHooks (react-dom.development.js:14985)
```

### Common Error Patterns & Solutions

| Error Pattern | Likely Cause | Claude's Fix |
|--------------|--------------|--------------|
| "Cannot read property of undefined" | Missing null checks | Add optional chaining (?.) |
| "Module not found" | Missing dependency | Run npm install |
| "Invalid hook call" | Hook rules violation | Check hook usage rules |
| "Text strings must be rendered" | Raw text in View | Wrap in Text component |
| "Network request failed" | API connection issue | Check Supabase/backend |

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

### Test File Naming Convention
- **E2E Tests**: `[feature]-[action].cy.ts`
  - Example: `element-creation.cy.ts`, `project-management.cy.ts`
- **Component Tests**: `[ComponentName].cy.tsx`
  - Example: `ElementCard.cy.tsx`, `ProjectList.cy.tsx`
- **Unit Tests**: `[module].test.ts`
  - Example: `storyStore.test.ts`, `validation.test.ts`

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

---

## Quick Reference

### Essential Rules Checklist
- [ ] Code has helpful comments
- [ ] Only `data-cy`/`testID` attributes for selectors
- [ ] Lint passes (`npm run lint`)
- [ ] Tests written and passing
- [ ] Error handling implemented
- [ ] Accessibility verified
- [ ] No console.log statements
- [ ] No sensitive data exposed
- [ ] Read existing files before editing

### Common Commands
```bash
npm run web          # Start web development
npm run lint         # Check code quality (MANDATORY)
npm run test         # Run unit tests
npm run cypress:open # Open Cypress UI

# Building
npm run build:web    # Build for web
npm run build:ios    # Build iOS app
npm run build:android # Build Android app
```

### File Paths
- Component tests: `/cypress/component/`
- E2E tests: `/cypress/e2e/`
- Support files: `/cypress/support/`
- Components: `/src/components/`
- Screens: `/src/screens/`
- Store: `/src/store/`
- Types: `/src/types/`
- Utils: `/src/utils/`

---

**Remember**: After compacting or starting a new session, ALWAYS re-read this file first!
# Project Information - FantasyWritingApp

**Technical specifications, project structure, and workflow guides.**

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Platform Handling](#platform-handling)
5. [React Native Pitfalls](#react-native-pitfalls)
6. [Git Workflow](#git-workflow)
7. [TODO Archive Management](#todo-archive-management)
8. [Testing Coverage Requirements](#testing-coverage-requirements)
9. [Error Handling](#error-handling)

---

## Project Overview

**FantasyWritingApp**: Cross-platform creative writing app (React Native) for managing stories, characters, scenes, and chapters.

**Core Elements**: Characters, Locations, Magic Systems, Cultures, Creatures, Organizations, Religions, Technologies, Historical Events, Languages

---

## Tech Stack

- **Framework**: React Native 0.75.4 + TypeScript 5.2.2
- **State**: Zustand with AsyncStorage
- **Navigation**: React Navigation 6
- **Testing**: Cypress (web E2E), Jest
- **Platforms**: iOS, Android, Web (port 3002)
- **Backend**: Supabase

---

## Project Structure

```
src/
├── components/       # UI components (common/native/web)
├── screens/         # Screen components
├── store/          # Zustand stores
├── types/          # TypeScript definitions
├── navigation/     # React Navigation
├── utils/          # Utilities
cypress/            # E2E tests
├── e2e/           # Test specs
├── support/       # Commands & utilities
```

### File Paths Reference

- `/cypress/e2e/` - E2E tests
- `/cypress/support/` - Custom commands
- `/src/components/` - Components
- `/src/screens/` - Screens
- `/src/store/` - Zustand stores
- `/src/types/` - TypeScript types

---

## Platform Handling

- **Web**: `Platform.OS === 'web'`
- **Mobile**: Touch events, no hover states
- **Responsive**: useWindowDimensions()
- **Storage**: AsyncStorage (mobile) / localStorage (web)

### Platform-Specific Code

```typescript
// Platform selection
const styles = Platform.select({
  web: webStyles,
  ios: iosStyles,
  android: androidStyles,
  default: defaultStyles,
});

// Platform checking
if (Platform.OS === 'web') {
  // Web-specific logic
}

// Responsive dimensions
const { width, height } = useWindowDimensions();
```

---

## React Native Pitfalls

### Common Issues to Avoid

1. **Text must be in Text component**

   ```typescript
   // ❌ WRONG
   <View>Plain text here</View>

   // ✅ CORRECT
   <View><Text>Plain text here</Text></View>
   ```

2. **Images need explicit dimensions**

   ```typescript
   // ❌ WRONG
   <Image source={require('./img.png')} />

   // ✅ CORRECT
   <Image
     source={require('./img.png')}
     style={{ width: 100, height: 100 }}
   />
   ```

3. **No CSS strings in styles**

   ```typescript
   // ❌ WRONG
   <View style="background-color: red;" />

   // ✅ CORRECT
   <View style={{ backgroundColor: 'red' }} />
   ```

4. **No hover states on mobile**

   ```typescript
   // ❌ WRONG
   <TouchableOpacity style={{ ':hover': { opacity: 0.5 } }} />

   // ✅ CORRECT - Use onPressIn/onPressOut
   <TouchableOpacity
     onPressIn={() => setPressed(true)}
     onPressOut={() => setPressed(false)}
   />
   ```

5. **Use testID (converts to data-cy on web)**
   ```typescript
   // ✅ CORRECT
   <TouchableOpacity
     testID="submit-button" // Converts to data-cy on web
     data-cy="submit-button" // Explicit for web
   />
   ```

---

## Git Workflow

### Branch Strategy

```bash
# Feature branches only (never main)
git checkout -b feature/[name]
git checkout -b feature/add-character-creator
git checkout -b feature/improve-sync

# Commit with conventional commits
git commit -m "feat: add character creation form"
git commit -m "fix: resolve sync conflict issue"
git commit -m "docs: update testing guide"
git commit -m "refactor: simplify store logic"
```

### Conventional Commit Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **refactor**: Code refactoring
- **test**: Test additions/changes
- **chore**: Maintenance tasks
- **style**: Code style/formatting

---

## TODO Archive Management

### Archive Policy

All completed or deprecated `todo.md` files should be archived to maintain workspace hygiene and historical tracking.

### Directory Structure

```
claudedocs/
└── archive/
    └── todo/
        ├── todo-20250930-091954.md
        ├── todo-20250928-143022.md
        └── todo-20250925-120015.md
```

### Naming Convention

**Format:** `todo-YYYYMMDD-HHMMSS.md`

- **YYYY**: Year (e.g., 2025)
- **MM**: Month (01-12)
- **DD**: Day (01-31)
- **HH**: Hour (00-23)
- **MM**: Minute (00-59)
- **SS**: Second (00-59)

**Examples:**

- `todo-20250930-091954.md` - Archived Sep 30, 2025 at 09:19:54 AM
- `todo-20250928-143022.md` - Archived Sep 28, 2025 at 02:30:22 PM

### When to Archive

Archive `todo.md` when:

- ✅ All tasks are completed
- ⚠️ File becomes deprecated/outdated
- 🔄 Starting new project phase with fresh TODO
- 📦 End of sprint/milestone

### Archiving Process

```bash
# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")

# Move to archive with timestamp
mv todo.md claudedocs/archive/todo/todo-$TIMESTAMP.md

# Create new todo.md if needed
touch todo.md
```

### Retention Policy

- **Active Archive**: Keep last 30 days in `claudedocs/archive/todo/`
- **Long-term**: Move files older than 30 days to `claudedocs/archive/todo/old/` (optional)
- **Never delete**: Maintain historical record for project tracking

### Quick Access Commands

```bash
# List archived TODOs by date
ls -lt claudedocs/archive/todo/

# Find specific TODO
ls claudedocs/archive/todo/ | grep "20250930"

# View most recent archived TODO
cat $(ls -t claudedocs/archive/todo/todo-*.md | head -1)
```

---

## Testing Coverage Requirements

**Realistic Targets** (Per Cypress.io):

- **Lines**: 80% (75-85% range acceptable)
- **Branches**: 75% (70-80% realistic)
- **Functions**: 80% (75-85% good)
- **Critical paths**: 90% E2E (100% unrealistic)
- **Note**: Avoid 100% targets - they're unrealistic per Cypress.io

### Coverage Philosophy

- Focus on critical user paths
- Don't chase 100% coverage
- Quality over quantity
- Test behavior, not implementation

---

## Error Handling

### Requirements

- **Error boundaries required** on all components
- **Loading/error/success states** for async operations
- **Network error handling** with cy.intercept()
- **Console error capture** in tests

### Error Boundary Example

```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <Text>Something went wrong.</Text>;
    }
    return this.props.children;
  }
}
```

### Network Error Handling

```typescript
// In components
try {
  const data = await fetchData();
  setData(data);
  setError(null);
} catch (err) {
  setError(err.message);
  setData(null);
} finally {
  setLoading(false);
}

// In tests
cy.intercept('GET', '/api/data', {
  statusCode: 500,
  body: { error: 'Server error' },
}).as('apiError');

cy.visit('/page');
cy.wait('@apiError');
cy.get('[data-cy="error-message"]').should('be.visible');
```

---

## Additional Resources

### Documentation

- [CLAUDE.md](../CLAUDE.md) - Quick reference
- [QUICK-TEST-REFERENCE.md](../cypress/docs/QUICK-TEST-REFERENCE.md) - Test template
- [CYPRESS-COMPLETE-REFERENCE.md](./CYPRESS-COMPLETE-REFERENCE.md) - Complete Cypress guide
- [TEST-RESULTS-MANAGEMENT.md](./TEST-RESULTS-MANAGEMENT.md) - Test reporting

### Context Management

- [CONTEXT_MANAGEMENT_GUIDE.md](../CONTEXT_MANAGEMENT_GUIDE.md)
- [SESSION_BEST_PRACTICES.md](../SESSION_BEST_PRACTICES.md)
- [QUICK_REFERENCE.md](../QUICK_REFERENCE.md)
- [claude-save-and-clear-workflow.md](../claude-save-and-clear-workflow.md)

---

**Version**: 1.0
**Last Updated**: 2025-10-02
**For**: FantasyWritingApp

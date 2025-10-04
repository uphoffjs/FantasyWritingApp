# Cypress Custom Commands

This directory contains all custom Cypress commands organized by category for easy discovery and maintenance.

## 📁 Directory Structure

```
commands/
├── auth/                    # Authentication & session management
│   ├── auth.ts             # Standard auth commands (login, logout)
│   ├── session.ts          # Session management with cy.session()
│   ├── mock-auth.ts        # Mock Supabase authentication
│   └── index.ts
│
├── database/                # Database operations
│   ├── mock-database.ts    # Mock Supabase database CRUD
│   └── index.ts
│
├── debug/                   # Debug & testing utilities
│   ├── comprehensive-debug.ts      # cy.comprehensiveDebug()
│   ├── build-error-capture.ts      # Build error detection
│   └── index.ts
│
├── elements/                # World element management
│   ├── core.ts             # Create, edit, delete elements
│   ├── management.ts       # Bulk operations, import/export
│   ├── validation.ts       # Element verification commands
│   ├── character.ts        # Character-specific commands
│   ├── story.ts            # Story-specific commands
│   └── index.ts
│
├── mocking/                 # Error mocking & testing
│   ├── error-mocking.ts    # cy.mockSupabaseError()
│   └── index.ts
│
├── navigation/              # Navigation commands
│   ├── navigation.ts       # navigateToHome(), navigateToStories(), etc.
│   └── index.ts
│
├── performance/             # Performance monitoring
│   ├── performance-monitoring.ts
│   └── index.ts
│
├── projects/                # Project management
│   ├── core.ts             # Create, edit, delete projects
│   ├── management.ts       # Bulk operations, filtering
│   └── index.ts
│
├── responsive/              # Responsive & mobile testing
│   ├── responsive.ts       # Viewport helpers
│   ├── react-native-commands.ts
│   ├── touch.ts            # Touch gestures
│   ├── viewport-helpers.ts
│   └── index.ts
│
├── seeding/                 # Data seeding
│   └── index.ts            # Test data generation
│
├── selectors/               # Selector helpers
│   ├── selectors.ts        # getByTestId(), getByDataCy(), etc.
│   └── index.ts
│
├── utility/                 # General utilities
│   ├── utility.ts          # Stub, spy commands
│   └── index.ts
│
├── wait/                    # Wait helpers
│   ├── wait-helpers.js     # Smart wait commands (no arbitrary waits)
│   └── index.ts
│
├── index.ts                 # Main entry point - imports all commands
└── README.md                # This file
```

## 🔍 Finding Commands

### By Category

- **Authentication**: [auth/](auth/) - Login, logout, session management, mock auth
- **Database**: [database/](database/) - Mock database operations
- **Debug**: [debug/](debug/) - Comprehensive debugging, error capture
- **Elements**: [elements/](elements/) - World element CRUD and management
- **Mocking**: [mocking/](mocking/) - Error simulation for testing
- **Navigation**: [navigation/](navigation/) - Screen navigation
- **Performance**: [performance/](performance/) - Performance monitoring
- **Projects**: [projects/](projects/) - Project CRUD and management
- **Responsive**: [responsive/](responsive/) - Viewport and mobile testing
- **Selectors**: [selectors/](selectors/) - Test selector helpers
- **Utilities**: [utility/](utility/) - Stub, spy, general helpers
- **Wait**: [wait/](wait/) - Smart wait commands

### By Command Name

**Authentication & Session:**
- `cy.login()` - [auth/auth.ts](auth/auth.ts)
- `cy.logout()` - [auth/auth.ts](auth/auth.ts)
- `cy.sessionLogin()` - [auth/session.ts](auth/session.ts)
- `cy.mockSupabaseAuth()` - [auth/mock-auth.ts](auth/mock-auth.ts)
- `cy.cleanMockAuth()` - [auth/mock-auth.ts](auth/mock-auth.ts)

**Database:**
- `cy.mockSupabaseDatabase()` - [database/mock-database.ts](database/mock-database.ts)

**Debug:**
- `cy.comprehensiveDebug()` - [debug/comprehensive-debug.ts](debug/comprehensive-debug.ts)
- `cy.captureFailureDebug()` - [debug/comprehensive-debug.ts](debug/comprehensive-debug.ts)
- `cy.checkForBuildErrors()` - [debug/build-error-capture.ts](debug/build-error-capture.ts)

**Elements:**
- `cy.createElement()` - [elements/core.ts](elements/core.ts)
- `cy.openElement()` - [elements/core.ts](elements/core.ts)
- `cy.deleteElement()` - [elements/core.ts](elements/core.ts)
- `cy.editElement()` - [elements/core.ts](elements/core.ts)

**Mocking:**
- `cy.mockSupabaseError()` - [mocking/error-mocking.ts](mocking/error-mocking.ts)

**Navigation:**
- `cy.navigateToHome()` - [navigation/navigation.ts](navigation/navigation.ts)
- `cy.navigateToStories()` - [navigation/navigation.ts](navigation/navigation.ts)
- `cy.navigateToCharacters()` - [navigation/navigation.ts](navigation/navigation.ts)

**Projects:**
- `cy.createProject()` - [projects/core.ts](projects/core.ts)
- `cy.openProject()` - [projects/core.ts](projects/core.ts)
- `cy.deleteProject()` - [projects/core.ts](projects/core.ts)

**Selectors:**
- `cy.getByTestId()` - [selectors/selectors.ts](selectors/selectors.ts)
- `cy.getByDataCy()` - [selectors/selectors.ts](selectors/selectors.ts)
- `cy.clickButton()` - [selectors/selectors.ts](selectors/selectors.ts)
- `cy.getModal()` - [selectors/selectors.ts](selectors/selectors.ts)

**Wait Helpers:**
- `cy.waitForPageLoad()` - [wait/wait-helpers.js](wait/wait-helpers.js)
- `cy.waitForModal()` - [wait/wait-helpers.js](wait/wait-helpers.js)
- `cy.smartWait()` - [wait/wait-helpers.js](wait/wait-helpers.js)

## ✅ Benefits of This Organization

1. **Easy Discovery**: Find commands by category or use case
2. **Clear Ownership**: Each file has a single, well-defined purpose
3. **Better Maintainability**: Changes are isolated to specific files
4. **Reduced Conflicts**: Smaller files reduce merge conflicts
5. **Improved IntelliSense**: TypeScript definitions map cleanly to files
6. **Faster Iteration**: Work on specific features without touching unrelated code

## 📝 Adding New Commands

1. **Choose the right category** (or create a new one if needed)
2. **Create the command file** in the category directory
3. **Add the import** to the category's `index.ts`
4. **Update TypeScript declarations** in `cypress/support/index.d.ts`
5. **Document the command** in this README

## 🚀 Best Practices

- **One command per export**: Each command should be focused and reusable
- **Clear naming**: Command names should describe what they do
- **Good documentation**: Add JSDoc comments with examples
- **Type safety**: Always include TypeScript declarations
- **Follow Cypress patterns**: Use recommended Cypress.io best practices

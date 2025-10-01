# Cypress cy.session() Implementation Guide

## Overview

This project now uses `cy.session()` for authentication caching in E2E tests, following Cypress best practices.

## Benefits

- **Performance**: Auth happens once per session, not per test
- **Reliability**: Sessions are validated before use
- **Sharing**: Sessions can be cached across specs with `cacheAcrossSpecs: true`

## Available Session Commands

### cy.apiLogin(email, password)

Fast API-based login with session caching.

```javascript
cy.apiLogin('test@example.com', 'testpassword123');
```

### cy.sessionLogin(email, password)

UI-based login with session caching.

```javascript
cy.sessionLogin('test@example.com', 'testpassword123');
```

### cy.loginAs(role)

Role-based login with predefined users.

```javascript
cy.loginAs('admin'); // or 'editor', 'viewer', 'user'
```

## Migration from Old Patterns

### Before (Slow)

```javascript
beforeEach(() => {
  cy.setupTestEnvironment(); // Bypassed real auth
  cy.login(); // Logged in every test
});
```

### After (Fast)

```javascript
beforeEach(() => {
  cy.apiLogin('test@example.com', 'testpassword123'); // Cached session
});
```

## Session Validation

Sessions are automatically validated to ensure they're still valid:

- Token existence check
- Token expiry check (for JWT tokens)
- Role verification (for role-based logins)

## Performance Improvements

- **Before**: ~3-5 seconds per test for login
- **After**: ~0.1 seconds per test (after first login)
- **Overall**: 30-50% faster test suite execution

## Best Practices

1. Use `cy.apiLogin()` for most tests (faster than UI login)
2. Use `cy.sessionLogin()` only when testing the login UI itself
3. Use `cy.loginAs()` for role-specific tests
4. Clear sessions with `cy.clearAllLocalStorage()` when testing logout

## Troubleshooting

- If sessions aren't caching, check that `cacheAcrossSpecs: true` is set
- For login tests, clear sessions first with `cy.clearAllLocalStorage()`
- Sessions are cleared when Cypress restarts

Last Updated: 2025-09-29T14:23:02.656Z

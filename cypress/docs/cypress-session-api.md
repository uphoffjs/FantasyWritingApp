# Cypress Session API Documentation

*Source: https://docs.cypress.io/api/commands/session*

## Overview

`cy.session()` is a powerful Cypress command that caches and restores browser session data (cookies, `localStorage`, and `sessionStorage`) between tests. This command significantly improves test performance by eliminating the need to repeat authentication steps for each test while maintaining proper test isolation.

---

## Syntax

```javascript
cy.session(id, setup)
cy.session(id, setup, options)
```

### Arguments

| Argument | Type | Description |
|----------|------|-------------|
| `id` | String, Array, Object | Unique identifier for the cached session. Arrays and objects are deterministically serialized. |
| `setup` | Function | **Required**. Function that establishes the session (e.g., login steps) |
| `options` | Object | **Optional**. Configuration object |

### Options Object

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `validate` | Function | - | Validates the created or restored session |
| `cacheAcrossSpecs` | Boolean | `false` | Shares cached session across all spec files |

---

## How cy.session() Works

### Session Creation Flow

1. **Clear Phase**: Clears all active session data (cookies, localStorage, sessionStorage)
2. **Setup Phase**: Executes the `setup` function to establish the session
3. **Cache Phase**: Saves the session data to cache with the provided `id`
4. **Validation Phase**: Runs the `validate` function (if provided)

### Session Restoration Flow

1. **Check Cache**: Looks for existing session with matching `id`
2. **Clear Current**: Clears all active session data
3. **Restore**: Loads cached session data into the browser
4. **Validation**: Runs the `validate` function to ensure session is still valid
5. **Re-creation**: If validation fails, runs `setup` again to create fresh session

---

## Basic Examples

### Simple Login Session
```javascript
describe('Dashboard', () => {
  beforeEach(() => {
    cy.session('admin', () => {
      cy.visit('/login')
      cy.get('[data-test=username]').type('admin@example.com')
      cy.get('[data-test=password]').type('password123')
      cy.get('[data-test=submit]').click()
      cy.url().should('include', '/dashboard')
    })
    cy.visit('/dashboard')
  })

  it('shows user data', () => {
    cy.get('[data-test=welcome]').should('contain', 'Welcome Admin')
  })
})
```

### Session with Validation
```javascript
cy.session('user-john', () => {
  cy.visit('/login')
  cy.get('#email').type('john@example.com')
  cy.get('#password').type('password')
  cy.get('#submit').click()
}, {
  validate() {
    // Check if we're still logged in
    cy.request('/api/whoami').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.email).to.eq('john@example.com')
    })
  }
})
```

### Dynamic Session IDs
```javascript
// Include all unique parameters in the session ID
function login(username, password, role) {
  cy.session([username, role], () => {
    cy.visit('/login')
    cy.get('[data-test=username]').type(username)
    cy.get('[data-test=password]').type(password)
    cy.get('[data-test=role]').select(role)
    cy.get('[data-test=submit]').click()
  })
}

// Creates different sessions for different parameters
login('admin', 'pass123', 'administrator')
login('user', 'pass456', 'viewer')
```

---

## Advanced Patterns

### Custom Commands with cy.session()
```javascript
// cypress/support/commands.js
Cypress.Commands.add('login', (email, password) => {
  cy.session(
    email, // Use email as unique identifier
    () => {
      cy.visit('/login')
      cy.get('[data-test=email]').type(email)
      cy.get('[data-test=password]').type(password)
      cy.get('[data-test=submit]').click()

      // Wait for redirect
      cy.url().should('not.include', '/login')
    },
    {
      validate() {
        // Check if session is still valid
        cy.getCookie('session_token').should('exist')
      }
    }
  )
})

// Usage in tests
beforeEach(() => {
  cy.login('user@example.com', 'password')
  cy.visit('/dashboard')
})
```

### Cross-Domain Sessions
```javascript
cy.session('multi-domain-user', () => {
  // Login to primary domain
  cy.visit('https://app.example.com/login')
  cy.get('#username').type('user')
  cy.get('#password').type('pass')
  cy.get('#submit').click()

  // Establish session on secondary domain
  cy.origin('https://api.example.com', () => {
    cy.visit('/authorize')
    cy.get('#approve').click()
  })
})
```

### Caching Across Specs
```javascript
// Share session between all spec files
cy.session('shared-admin', () => {
  cy.visit('/login')
  cy.get('#email').type('admin@example.com')
  cy.get('#password').type('adminpass')
  cy.get('#submit').click()
}, {
  cacheAcrossSpecs: true, // Session persists across spec files
  validate() {
    cy.request('/api/admin/verify').its('status').should('eq', 200)
  }
})
```

### Multiple User Roles
```javascript
// cypress/support/commands.js
const users = {
  admin: { email: 'admin@example.com', password: 'admin123', role: 'admin' },
  editor: { email: 'editor@example.com', password: 'edit123', role: 'editor' },
  viewer: { email: 'viewer@example.com', password: 'view123', role: 'viewer' }
}

Cypress.Commands.add('loginAs', (userType) => {
  const user = users[userType]

  cy.session([userType, user.email], () => {
    cy.visit('/login')
    cy.get('[data-test=email]').type(user.email)
    cy.get('[data-test=password]').type(user.password)
    cy.get('[data-test=submit]').click()
    cy.url().should('include', '/dashboard')
  }, {
    validate() {
      cy.window().then((win) => {
        const userData = win.localStorage.getItem('user')
        expect(userData).to.not.be.null
        const parsedUser = JSON.parse(userData)
        expect(parsedUser.role).to.eq(user.role)
      })
    }
  })
})

// Usage
it('admin can delete posts', () => {
  cy.loginAs('admin')
  cy.visit('/posts')
  cy.get('[data-test=delete-btn]').should('be.visible')
})

it('viewer cannot delete posts', () => {
  cy.loginAs('viewer')
  cy.visit('/posts')
  cy.get('[data-test=delete-btn]').should('not.exist')
})
```

---

## Session Validation

### Validation Function Behavior
The session is considered **invalid** if the validate function:
- Throws an exception
- Contains any failing Cypress command
- Returns `false` explicitly
- Has its last command yield `false`

### Validation Examples
```javascript
// API-based validation
{
  validate() {
    cy.request('/api/auth/check').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.authenticated).to.be.true
    })
  }
}

// Cookie-based validation
{
  validate() {
    cy.getCookie('auth_token').should('exist')
    cy.getCookie('auth_token').then((cookie) => {
      expect(cookie.value).to.not.be.empty
      expect(cookie.httpOnly).to.be.true
    })
  }
}

// localStorage validation
{
  validate() {
    cy.window().then((win) => {
      const token = win.localStorage.getItem('jwt_token')
      expect(token).to.not.be.null

      // Decode and check token expiry
      const payload = JSON.parse(atob(token.split('.')[1]))
      expect(payload.exp * 1000).to.be.greaterThan(Date.now())
    })
  }
}

// Multiple validation checks
{
  validate() {
    // Check cookie
    cy.getCookie('session_id').should('exist')

    // Check localStorage
    cy.window().its('localStorage.user').should('not.be.null')

    // Check API endpoint
    cy.request({
      url: '/api/validate',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
  }
}
```

---

## Configuration

### cypress.config.js Settings
```javascript
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    // Test isolation affects session behavior
    testIsolation: true, // Default: clears page between tests

    // Session-specific settings (Cypress 12+)
    experimentalSessionAndOrigin: true, // Enable cross-origin support

    setupNodeEvents(on, config) {
      // Clear all sessions before run
      on('before:run', () => {
        console.log('Clearing all cached sessions')
      })
    }
  }
})
```

### Test Isolation Impact
```javascript
// With testIsolation: true (default)
describe('With isolation', () => {
  beforeEach(() => {
    cy.session('user', loginSetup)
    cy.visit('/') // Page is cleared, need to visit
  })
})

// With testIsolation: false
describe('Without isolation', { testIsolation: false }, () => {
  beforeEach(() => {
    cy.session('user', loginSetup)
    // Page state may persist, visit may not be needed
  })
})
```

---

## Common Use Cases

### 1. Single User Throughout Suite
```javascript
describe('User Dashboard', () => {
  before(() => {
    // Create session once for entire suite
    cy.session('dashboard-user', () => {
      cy.visit('/login')
      cy.login('user@example.com', 'password')
    }, {
      cacheAcrossSpecs: true
    })
  })

  beforeEach(() => {
    // Restore session before each test
    cy.session('dashboard-user')
    cy.visit('/dashboard')
  })

  it('test 1', () => { /* ... */ })
  it('test 2', () => { /* ... */ })
})
```

### 2. Different Users Per Test
```javascript
describe('Role-based Access', () => {
  it('admin sees all features', () => {
    cy.session('admin', () => loginAs('admin'))
    cy.visit('/features')
    cy.get('[data-test=admin-panel]').should('be.visible')
  })

  it('user sees limited features', () => {
    cy.session('user', () => loginAs('user'))
    cy.visit('/features')
    cy.get('[data-test=admin-panel]').should('not.exist')
  })
})
```

### 3. API Token Authentication
```javascript
cy.session('api-user', () => {
  cy.request('POST', '/api/auth/token', {
    username: 'api_user',
    password: 'api_pass'
  }).then((response) => {
    window.localStorage.setItem('api_token', response.body.token)
  })
}, {
  validate() {
    cy.window().then((win) => {
      const token = win.localStorage.getItem('api_token')
      cy.request({
        url: '/api/validate',
        headers: { 'Authorization': `Bearer ${token}` }
      }).its('status').should('eq', 200)
    })
  }
})
```

### 4. Social Login (OAuth)
```javascript
cy.session('google-user', () => {
  cy.visit('/login')
  cy.get('[data-test=google-login]').click()

  // Handle OAuth flow
  cy.origin('https://accounts.google.com', { args: { email, password } },
    ({ email, password }) => {
      cy.get('#identifierId').type(email)
      cy.get('#identifierNext').click()
      cy.get('[name="password"]').type(password)
      cy.get('#passwordNext').click()
    }
  )

  // Back to our app
  cy.url().should('include', '/dashboard')
})
```

---

## Debugging Sessions

### View Session Details
```javascript
// In Cypress Test Runner, sessions appear in command log
// Click on session command to see:
// - Session ID
// - Status (created/restored/recreated)
// - Validation results
// - Timing information

// Programmatic debugging
cy.session('debug-session', () => {
  cy.visit('/login')
  // Login steps
}).then(() => {
  cy.task('log', 'Session created/restored successfully')
})
```

### Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Session not persisting | Ensure unique `id` and check `validate` function |
| Validation always fails | Check token expiry, API endpoints, cookie settings |
| Session shared unexpectedly | Make `id` more specific, include all varying parameters |
| Cross-domain issues | Enable `experimentalSessionAndOrigin` in config |
| Slow session creation | Optimize `setup` function, remove unnecessary waits |

### Force Session Recreation
```javascript
// Clear specific session
cy.session('user', loginSetup, {
  validate() {
    // Force recreation by failing validation
    if (Cypress.env('FORCE_NEW_SESSION')) {
      throw new Error('Forcing new session')
    }
    // Normal validation
    cy.getCookie('session').should('exist')
  }
})

// Clear all sessions (in support file)
before(() => {
  if (Cypress.env('CLEAR_SESSIONS')) {
    cy.clearAllSessionStorage()
  }
})
```

---

## Best Practices

### ✅ DO's
1. **Include all unique parameters in session ID**
   ```javascript
   cy.session([username, environment, role], setupFn)
   ```

2. **Always validate sessions**
   ```javascript
   cy.session('user', setup, {
     validate() {
       cy.request('/api/auth/check').its('status').should('eq', 200)
     }
   })
   ```

3. **Call cy.visit() after cy.session()**
   ```javascript
   cy.session('user', setup)
   cy.visit('/dashboard') // Navigate after session restore
   ```

4. **Use descriptive session IDs**
   ```javascript
   cy.session('admin-full-permissions', setup)
   // Not: cy.session('user1', setup)
   ```

5. **Create custom commands for common patterns**
   ```javascript
   Cypress.Commands.add('loginWithSession', (username, password) => {
     cy.session(username, () => {
       // Login logic
     })
   })
   ```

### ❌ DON'Ts
1. **Don't use random or timestamp-based IDs**
   ```javascript
   // Bad: Creates new session every time
   cy.session(Date.now(), setup)
   ```

2. **Don't share sessions between different user types**
   ```javascript
   // Bad: Same session for different roles
   cy.session('user', () => login(username))
   ```

3. **Don't skip validation for critical sessions**
   ```javascript
   // Bad: No validation
   cy.session('admin', adminLogin)
   ```

4. **Don't modify session data directly**
   ```javascript
   // Bad: Manually modifying cached session
   window.sessionStorage.setItem('key', 'value')
   ```

---

## Migration Guide

### From Traditional Login Commands
```javascript
// Before: Repeated login in each test
beforeEach(() => {
  cy.visit('/login')
  cy.get('#email').type('user@example.com')
  cy.get('#password').type('password')
  cy.get('#submit').click()
})

// After: Cached session
beforeEach(() => {
  cy.session('user', () => {
    cy.visit('/login')
    cy.get('#email').type('user@example.com')
    cy.get('#password').type('password')
    cy.get('#submit').click()
  })
  cy.visit('/') // Navigate after session
})
```

### From cy.login() Custom Command
```javascript
// Before: Custom command without caching
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login')
  cy.get('#email').type(email)
  cy.get('#password').type(password)
  cy.get('#submit').click()
})

// After: Custom command with session caching
Cypress.Commands.add('login', (email, password) => {
  cy.session(email, () => {
    cy.visit('/login')
    cy.get('#email').type(email)
    cy.get('#password').type(password)
    cy.get('#submit').click()
  }, {
    validate() {
      cy.getCookie('auth').should('exist')
    }
  })
})
```

---

## Performance Considerations

### Session Creation Time
- Initial session creation: Includes full setup execution
- Subsequent restores: Near-instantaneous (milliseconds)
- Failed validation: Triggers full recreation

### Optimization Strategies
1. **Minimize setup complexity**
   - Remove unnecessary waits
   - Use API login when possible
   - Avoid UI interactions if not required

2. **Efficient validation**
   - Quick checks (cookies, localStorage)
   - Avoid slow API calls unless necessary
   - Cache validation results when possible

3. **Strategic caching**
   - Use `cacheAcrossSpecs: true` for stable sessions
   - Group tests using same session
   - Clear sessions only when necessary

### Performance Example
```javascript
// Slow: UI-based login
cy.session('slow', () => {
  cy.visit('/login')
  cy.get('#email').type('user@example.com')
  cy.get('#password').type('password')
  cy.get('#submit').click()
  cy.wait(2000) // Unnecessary wait
})

// Fast: API-based login
cy.session('fast', () => {
  cy.request('POST', '/api/login', {
    email: 'user@example.com',
    password: 'password'
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token)
  })
})
```

---

## Related Commands
- `cy.clearCookie()` - Clear specific cookie
- `cy.clearCookies()` - Clear all cookies
- `cy.clearLocalStorage()` - Clear localStorage
- `cy.clearAllSessionStorage()` - Clear all session storage
- `cy.getCookie()` - Get specific cookie
- `cy.setCookie()` - Set a cookie

---

## Additional Resources
- [Cypress Session API Documentation](https://docs.cypress.io/api/commands/session)
- [Authentication Guide](https://docs.cypress.io/guides/end-to-end-testing/authentication)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Cross-Origin Testing](https://docs.cypress.io/guides/guides/cross-origin-testing)

---

*Note: `cy.session()` requires Cypress 8.2.0 or higher. Some features like `cacheAcrossSpecs` require Cypress 12.0.0 or higher.*
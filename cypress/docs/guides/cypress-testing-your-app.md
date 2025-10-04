# Testing Your App - Cypress Documentation

_Source: https://docs.cypress.io/app/end-to-end-testing/testing-your-app_

## Overview

This guide provides comprehensive strategies for testing web applications using Cypress, focusing on effective end-to-end testing approaches. Cypress is optimized for local development testing, providing developers with powerful tools to control the testing environment, seed data, and handle authentication.

---

## Step 1: Start Your Local Development Server

### Why Start a Local Development Server?

Testing locally gives you the ability to:

- **Control the server environment**: You have complete control over the server configuration
- **Seed data and reset state**: Easily prepare test data and clean up between tests
- **Disable security features**: Remove obstacles for testing (CORS, authentication, etc.)
- **Create test-specific routes**: Add endpoints specifically for testing purposes
- **Build applications while writing tests**: Develop features and tests simultaneously

### Best Practices

⚠️ **Important**: Don't try to start a web server from within Cypress scripts. Your server should be running before Cypress starts.

### Starting Your Server

Common methods to start your development server:

```bash
# Examples for different frameworks
npm start           # Generic Node.js apps
npm run dev         # Vite/Next.js
ng serve           # Angular
rails server       # Ruby on Rails
```

---

## Step 2: Visit Your Server

### Basic Test Structure

Create your first test in `cypress/e2e/home_page.cy.js`:

```javascript
describe('The Home Page', () => {
  it('successfully loads', () => {
    cy.visit('http://localhost:8080'); // Change URL to match your dev environment
  });
});
```

### Running the Test

```bash
npx cypress open
# or
npx cypress run
```

---

## Step 3: Configure Cypress

### Setting the Base URL

Instead of hardcoding URLs in every test, configure a `baseUrl` in `cypress.config.js`:

```javascript
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
});
```

Now your tests can use relative URLs:

```javascript
describe('The Home Page', () => {
  it('successfully loads', () => {
    cy.visit('/'); // Uses baseUrl
  });
});
```

---

## Testing Strategies

### Seeding Data

Three primary methods for preparing test data:

#### 1. Using `cy.exec()` - Run System Commands

```javascript
describe('The Home Page', () => {
  beforeEach(() => {
    // Reset and seed database using npm scripts
    cy.exec('npm run db:reset && npm run db:seed');
  });

  it('displays seeded posts', () => {
    cy.visit('/');
    cy.contains('First Post').should('be.visible');
  });
});
```

#### 2. Using `cy.task()` - Run Node.js Code

```javascript
// In cypress.config.js
module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        'db:seed': () => {
          // Node.js database seeding code here
          return seedDatabase();
        },
      });
    },
  },
});

// In your test
beforeEach(() => {
  cy.task('db:seed');
});
```

#### 3. Using `cy.request()` - Make HTTP Requests

```javascript
describe('The Home Page', () => {
  beforeEach(() => {
    // Seed specific test data via API
    cy.request('POST', '/test/seed/user', {
      name: 'Jane',
      email: 'jane@example.com',
    });

    cy.request('POST', '/test/seed/post', {
      title: 'First Post',
      authorId: 1,
      body: 'This is a test post...',
    });
  });

  it('displays the seeded post', () => {
    cy.visit('/');
    cy.contains('First Post').should('be.visible');
  });
});
```

### Stubbing the Server

Instead of seeding real data, you can stub server responses:

```javascript
describe('The Home Page', () => {
  beforeEach(() => {
    // Stub the API response
    cy.intercept('GET', '/api/posts', {
      fixture: 'posts.json',
    }).as('getPosts');

    cy.intercept('GET', '/api/users/*', {
      statusCode: 200,
      body: {
        id: 1,
        name: 'Jane Lane',
        email: 'jane@example.com',
      },
    }).as('getUser');
  });

  it('displays stubbed data', () => {
    cy.visit('/');
    cy.wait('@getPosts');
    cy.contains('Stubbed Post Title').should('be.visible');
  });
});
```

### Advantages of Stubbing

- ✅ No server state mutations between tests
- ✅ Force edge cases and error conditions
- ✅ Faster test execution
- ✅ Test the frontend independently

---

## Authentication and Login Strategies

### Testing the Full Login Flow

First, comprehensively test your login functionality:

```javascript
describe('The Login Page', () => {
  beforeEach(() => {
    // Seed a test user
    cy.request('POST', '/test/seed/user', {
      username: 'jane.lane',
      password: 'password123',
    })
      .its('body')
      .as('currentUser');
  });

  it('sets auth cookie when logging in via form submission', function () {
    const { username, password } = this.currentUser;

    cy.visit('/login');

    // Fill out the form
    cy.get('input[name=username]').type(username);
    cy.get('input[name=password]').type(`${password}{enter}`);

    // Verify we're logged in
    cy.url().should('include', '/dashboard');
    cy.getCookie('your-session-cookie').should('exist');
    cy.get('[data-cy=user-avatar]').should('be.visible');
  });
});
```

### Creating a Custom Login Command

For other tests that require authentication, create a reusable command:

```javascript
// In cypress/support/commands.js
Cypress.Commands.add('login', (username, password) => {
  cy.session(
    username,
    () => {
      cy.visit('/login');
      cy.get('input[name=username]').type(username);
      cy.get('input[name=password]').type(`${password}{enter}`, { log: false });
      cy.url().should('include', '/dashboard');
    },
    {
      validate: () => {
        // Verify the session is still valid
        cy.getCookie('your-session-cookie').should('exist');
      },
      cacheAcrossSpecs: true,
    },
  );
});
```

### Using the Login Command

```javascript
describe('Dashboard Features', () => {
  beforeEach(() => {
    // Login is cached across tests
    cy.login('jane.lane', 'password123');
    cy.visit('/dashboard');
  });

  it('displays user dashboard', () => {
    cy.contains('Welcome, Jane').should('be.visible');
  });

  it('allows creating new posts', () => {
    cy.get('[data-cy=new-post-button]').click();
    // Test continues...
  });
});
```

### Programmatic Login (Fastest Method)

For the fastest authentication, bypass the UI entirely:

```javascript
Cypress.Commands.add('loginByApi', (username, password) => {
  cy.request('POST', '/api/login', {
    username,
    password,
  }).then(response => {
    window.localStorage.setItem('authToken', response.body.token);
    cy.setCookie('session', response.body.session);
  });
});

// Usage
beforeEach(() => {
  cy.loginByApi('jane.lane', 'password123');
  cy.visit('/dashboard');
});
```

---

## Best Practices

### ✅ DO's

1. **Test against local servers** for maximum control
2. **Use `baseUrl`** configuration to avoid hardcoding URLs
3. **Create custom commands** for common operations
4. **Use `cy.session()`** to cache authentication state
5. **Seed data** appropriately for each test scenario
6. **Clean state** before each test, not after
7. **Stub external services** to isolate your application

### ❌ DON'Ts

1. **Don't start servers from Cypress** - Have them running beforehand
2. **Don't share test state** between tests - Each test should be independent
3. **Don't test external sites** - Only test your own application
4. **Don't use production APIs** in tests - Use test-specific endpoints
5. **Don't hardcode wait times** - Use assertions instead
6. **Don't test implementation details** - Focus on user behavior

---

## Common Patterns

### Testing with Different User Roles

```javascript
describe('Role-based Access', () => {
  it('admin can see admin panel', () => {
    cy.login('admin@example.com', 'adminpass');
    cy.visit('/admin');
    cy.get('[data-cy=admin-panel]').should('be.visible');
  });

  it('regular user cannot access admin panel', () => {
    cy.login('user@example.com', 'userpass');
    cy.visit('/admin');
    cy.url().should('include', '/unauthorized');
  });
});
```

### Testing Error States

```javascript
describe('Error Handling', () => {
  it('displays error message on failed login', () => {
    cy.visit('/login');
    cy.get('input[name=username]').type('invalid@example.com');
    cy.get('input[name=password]').type('wrongpassword{enter}');

    cy.get('[data-cy=error-message]')
      .should('be.visible')
      .and('contain', 'Invalid credentials');
  });

  it('handles network errors gracefully', () => {
    cy.intercept('POST', '/api/login', {
      statusCode: 500,
      body: { error: 'Internal Server Error' },
    });

    cy.visit('/login');
    cy.get('input[name=username]').type('user@example.com');
    cy.get('input[name=password]').type('password{enter}');

    cy.get('[data-cy=error-message]').should('contain', 'Something went wrong');
  });
});
```

### Testing Forms

```javascript
describe('Form Validation', () => {
  beforeEach(() => {
    cy.visit('/signup');
  });

  it('validates required fields', () => {
    cy.get('form').submit();
    cy.get('[data-cy=username-error]').should(
      'contain',
      'Username is required',
    );
    cy.get('[data-cy=email-error]').should('contain', 'Email is required');
    cy.get('[data-cy=password-error]').should(
      'contain',
      'Password is required',
    );
  });

  it('validates email format', () => {
    cy.get('input[name=email]').type('invalid-email');
    cy.get('form').submit();
    cy.get('[data-cy=email-error]').should('contain', 'Invalid email format');
  });

  it('successfully submits with valid data', () => {
    cy.get('input[name=username]').type('newuser');
    cy.get('input[name=email]').type('new@example.com');
    cy.get('input[name=password]').type('SecurePass123!');
    cy.get('form').submit();

    cy.url().should('include', '/welcome');
  });
});
```

---

## Additional Resources

- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Network Requests](https://docs.cypress.io/guides/guides/network-requests)
- [Variables and Aliases](https://docs.cypress.io/guides/core-concepts/variables-and-aliases)
- [Custom Commands](https://docs.cypress.io/api/cypress-api/custom-commands)
- [Session API](https://docs.cypress.io/api/commands/session)

---

_Note: This documentation is based on Cypress best practices for end-to-end testing. Always refer to the official Cypress documentation for the most up-to-date information._

# Cypress Testing Types

## Overview

Cypress supports multiple testing types to validate different aspects of your application. Each type serves a specific purpose and follows distinct patterns for optimal testing coverage.

## E2E (End-to-End) Testing

### What is E2E Testing?

E2E testing validates complete user workflows by testing your application as a real user would interact with it. These tests run against the full application stack, including frontend, backend, database, and any external services.

### When to Use E2E Tests

- **Critical user journeys**: Login, checkout, registration
- **Integration points**: API calls, third-party services
- **Cross-browser compatibility**: Different browsers and devices
- **Complete workflows**: Multi-step processes that span multiple pages

### E2E Test Structure

```javascript
// cypress/e2e/user-authentication.cy.js
describe('User Authentication', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('allows user to login with valid credentials', () => {
    // * Test the complete login workflow
    cy.get('[data-cy="email-input"]').type('user@example.com')
    cy.get('[data-cy="password-input"]').type('password123')
    cy.get('[data-cy="login-button"]').click()
    
    // ! Verify user is redirected to dashboard
    cy.url().should('include', '/dashboard')
    cy.get('[data-cy="user-welcome"]').should('contain', 'Welcome back')
  })

  it('shows error for invalid credentials', () => {
    cy.get('[data-cy="email-input"]').type('invalid@example.com')
    cy.get('[data-cy="password-input"]').type('wrongpassword')
    cy.get('[data-cy="login-button"]').click()
    
    // ? Check that error message appears
    cy.get('[data-cy="error-message"]')
      .should('be.visible')
      .and('contain', 'Invalid credentials')
  })
})
```

### E2E Best Practices

1. **Test Critical Paths**: Focus on business-critical workflows
2. **Use Real Data**: Test with realistic data scenarios
3. **Minimize Test Count**: E2E tests are slower; focus on high-value scenarios
4. **Independent Tests**: Each test should be able to run in isolation
5. **Stable Selectors**: Use `data-cy` attributes for reliable element selection

## Component Testing

### What is Component Testing?

Component testing validates individual components in isolation, allowing you to test component logic, props, state changes, and user interactions without the complexity of the full application.

### When to Use Component Tests

- **Component behavior**: Props, state, events
- **UI interactions**: Clicks, form inputs, keyboard events
- **Component logic**: Calculations, transformations
- **Edge cases**: Error states, loading states, empty states

### Component Test Structure

```javascript
// cypress/component/StoryCard.cy.tsx
import { StoryCard } from '../../src/components/StoryCard'
import { mount } from 'cypress/react'

describe('StoryCard Component', () => {
  const mockStory = {
    id: '1',
    title: 'My Fantasy Novel',
    wordCount: 5000,
    status: 'draft',
    createdAt: new Date('2024-01-01')
  }

  it('renders story information correctly', () => {
    mount(<StoryCard story={mockStory} />)
    
    // * Verify all story details are displayed
    cy.get('[data-cy="story-title"]').should('contain', 'My Fantasy Novel')
    cy.get('[data-cy="story-word-count"]').should('contain', '5,000 words')
    cy.get('[data-cy="story-status"]').should('contain', 'draft')
  })

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = cy.stub()
    mount(<StoryCard story={mockStory} onEdit={onEdit} />)
    
    cy.get('[data-cy="edit-button"]').click()
    cy.then(() => {
      expect(onEdit).to.have.been.calledWith(mockStory.id)
    })
  })

  it('shows delete confirmation on delete click', () => {
    mount(<StoryCard story={mockStory} />)
    
    cy.get('[data-cy="delete-button"]').click()
    cy.get('[data-cy="delete-confirmation"]').should('be.visible')
    
    // ? Test both confirm and cancel actions
    cy.get('[data-cy="confirm-delete"]').should('be.visible')
    cy.get('[data-cy="cancel-delete"]').should('be.visible')
  })

  it('handles loading state', () => {
    mount(<StoryCard story={mockStory} isLoading={true} />)
    
    cy.get('[data-cy="story-card-skeleton"]').should('be.visible')
    cy.get('[data-cy="story-title"]').should('not.exist')
  })
})
```

### Component Testing Best Practices

1. **Test in Isolation**: Mock external dependencies
2. **Test Props**: Verify component responds to prop changes
3. **Test Events**: Ensure callbacks are called correctly
4. **Test States**: Loading, error, empty, success states
5. **Use Real DOM**: Component tests run in real browser environment

## API Testing

### What is API Testing?

API testing validates your application's backend services, endpoints, and data contracts without the UI layer. These tests focus on request/response cycles, data validation, and service integration.

### When to Use API Tests

- **Backend logic**: Business rules, calculations
- **Data validation**: Input validation, schema compliance
- **Service integration**: Third-party APIs, microservices
- **Performance**: Response times, load handling

### API Test Structure

```javascript
// cypress/e2e/api/stories-api.cy.js
describe('Stories API', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:3001'
  
  beforeEach(() => {
    // * Setup authentication token
    cy.request('POST', `${apiUrl}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    }).then((response) => {
      window.localStorage.setItem('authToken', response.body.token)
    })
  })

  it('creates a new story', () => {
    const newStory = {
      title: 'Test Story',
      content: 'This is a test story content',
      genre: 'fantasy'
    }

    cy.request({
      method: 'POST',
      url: `${apiUrl}/api/stories`,
      headers: {
        'Authorization': `Bearer ${window.localStorage.getItem('authToken')}`
      },
      body: newStory
    }).then((response) => {
      // ! Verify response structure and data
      expect(response.status).to.eq(201)
      expect(response.body).to.have.property('id')
      expect(response.body.title).to.eq(newStory.title)
      expect(response.body.wordCount).to.be.a('number')
      expect(response.body.createdAt).to.be.a('string')
    })
  })

  it('retrieves user stories', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/api/stories`,
      headers: {
        'Authorization': `Bearer ${window.localStorage.getItem('authToken')}`
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.be.an('array')
      
      // ? Verify story structure if stories exist
      if (response.body.length > 0) {
        const story = response.body[0]
        expect(story).to.have.all.keys('id', 'title', 'content', 'wordCount', 'createdAt', 'updatedAt')
      }
    })
  })

  it('handles invalid story creation', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/api/stories`,
      headers: {
        'Authorization': `Bearer ${window.localStorage.getItem('authToken')}`
      },
      body: {
        // Missing required title field
        content: 'Story without title'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body).to.have.property('error')
      expect(response.body.error).to.contain('title')
    })
  })

  it('validates authentication required', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/api/stories`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body).to.have.property('error')
    })
  })
})
```

### API Testing Best Practices

1. **Test Status Codes**: Verify correct HTTP status responses
2. **Validate Response Schema**: Check data structure and types
3. **Test Error Handling**: Invalid inputs, unauthorized access
4. **Performance Assertions**: Response time expectations
5. **Environment Variables**: Use different configs for test environments

## Testing Strategy

### Test Pyramid Distribution

```
     /\     E2E Tests (15%)
    /  \    - Critical user journeys
   /____\   - Integration scenarios
  /      \  
 /Component\ Component Tests (25%)
/  Tests   \ - UI component behavior
\__________/ - Component logic
/            \ 
/  Unit Tests  \ Unit Tests (60%)
\______________/ - Business logic
                 - Utility functions
```

### Choosing the Right Test Type

| Test Type | Use When | Advantages | Disadvantages |
|-----------|----------|------------|---------------|
| **E2E** | Testing complete user workflows | High confidence, realistic scenarios | Slow, brittle, expensive to maintain |
| **Component** | Testing UI components in isolation | Fast feedback, real DOM testing | Limited scope, requires mocking |
| **API** | Testing backend logic and services | Fast, focused on data contracts | No UI validation |

### Test Configuration

```javascript
// cypress.config.js
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3002',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    viewportWidth: 1280,
    viewportHeight: 720
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack'
    },
    supportFile: 'cypress/support/component.js',
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    indexHtmlFile: 'cypress/support/component-index.html'
  },

  env: {
    apiUrl: 'http://localhost:3001',
    coverage: true
  }
})
```

## Integration with React Native Web

### Testing React Native Components

```javascript
// cypress/component/StoryEditor.cy.tsx
import { StoryEditor } from '../../src/screens/StoryEditor'
import { mount } from 'cypress/react'

describe('StoryEditor - React Native Web', () => {
  it('handles text input correctly', () => {
    mount(<StoryEditor />)
    
    // * React Native TextInput becomes HTML input on web
    cy.get('[data-cy="story-title-input"]')
      .should('have.attr', 'placeholder', 'Enter story title...')
      .type('My New Story')
      .should('have.value', 'My New Story')
  })

  it('responds to touch interactions', () => {
    mount(<StoryEditor />)
    
    // * TouchableOpacity becomes button on web
    cy.get('[data-cy="save-button"]')
      .should('be.visible')
      .click()
    
    // ? Verify save action was triggered
    cy.get('[data-cy="save-success"]').should('be.visible')
  })

  it('handles responsive layouts', () => {
    // Test mobile viewport
    cy.viewport('iphone-x')
    mount(<StoryEditor />)
    cy.get('[data-cy="mobile-toolbar"]').should('be.visible')
    
    // Test desktop viewport
    cy.viewport('macbook-15')
    cy.get('[data-cy="desktop-sidebar"]').should('be.visible')
  })
})
```

### Cross-Platform Testing Considerations

1. **Element Mapping**: React Native components map to HTML elements on web
2. **Touch vs Click**: Touch interactions become click events
3. **Platform Detection**: Test platform-specific code paths
4. **Responsive Design**: Verify layouts across different screen sizes
5. **Accessibility**: Ensure accessibility props work on web

## Debugging and Troubleshooting

### Common Issues and Solutions

```javascript
// Problem: Test is flaky due to timing
// ❌ Bad - using arbitrary waits
cy.wait(2000)
cy.get('[data-cy="dynamic-content"]').should('be.visible')

// ✅ Good - wait for specific conditions
cy.get('[data-cy="loading-spinner"]').should('not.exist')
cy.get('[data-cy="dynamic-content"]').should('be.visible')

// Problem: Element not found
// ❌ Bad - assuming element exists immediately
cy.get('[data-cy="modal"]').click()

// ✅ Good - wait for element to exist
cy.get('[data-cy="open-modal-button"]').click()
cy.get('[data-cy="modal"]').should('be.visible').click()

// Problem: Async operations not waited for
// ❌ Bad - not handling async
cy.get('[data-cy="save-button"]').click()
cy.get('[data-cy="success-message"]').should('be.visible')

// ✅ Good - wait for async operation
cy.get('[data-cy="save-button"]').click()
cy.intercept('POST', '/api/stories').as('saveStory')
cy.wait('@saveStory')
cy.get('[data-cy="success-message"]').should('be.visible')
```

### Test Debugging Tools

```javascript
// Use .debug() to inspect elements
cy.get('[data-cy="complex-element"]').debug()

// Use .pause() to pause test execution
cy.get('[data-cy="form"]').pause()

// Log values for debugging
cy.get('[data-cy="counter"]').then(($el) => {
  cy.log('Counter value:', $el.text())
})

// Take screenshots during test
cy.screenshot('before-action')
cy.get('[data-cy="action-button"]').click()
cy.screenshot('after-action')
```

## Performance Testing

### Response Time Assertions

```javascript
// Measure and assert response times
cy.intercept('GET', '/api/stories').as('getStories')
cy.visit('/stories')
cy.wait('@getStories').then((interception) => {
  // ! Ensure API responds within 2 seconds
  expect(interception.response.duration).to.be.lessThan(2000)
})

// Measure page load performance
cy.visit('/stories', {
  onBeforeLoad: (win) => {
    win.performance.mark('start')
  },
  onLoad: (win) => {
    win.performance.mark('end')
    win.performance.measure('pageLoad', 'start', 'end')
  }
})

cy.window().then((win) => {
  const measure = win.performance.getEntriesByName('pageLoad')[0]
  expect(measure.duration).to.be.lessThan(3000)
})
```

This comprehensive guide covers all testing types available in Cypress and provides practical examples for implementing each type in your React Native Web application.
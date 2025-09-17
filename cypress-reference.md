# Cypress Testing Framework - Complete Reference Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Core Features](#core-features)
3. [Installation & Setup](#installation--setup)
4. [Commands Reference](#commands-reference)
5. [Best Practices](#best-practices)
6. [Testing Patterns](#testing-patterns)
7. [Component Testing](#component-testing)
8. [React Native Testing with Cypress](#react-native-testing-with-cypress)
9. [Configuration](#configuration)
10. [Common Patterns](#common-patterns)

---

## Introduction

Cypress is a modern web testing tool designed to address key pain points developers and QA engineers face when testing web applications. It provides comprehensive solutions for testing across different aspects of web development.

### Mission Statement
> "Our mission is to build a thriving testing solution that enhances productivity, makes testing an enjoyable experience, and generates developer happiness."

### Key Differentiators
- **Native Browser Access**: Direct interaction with application objects
- **Automatic Waiting**: Eliminates need for manual async handling
- **Debugging Tools**: Integrated snapshots and time-travel debugging
- **Consistent Results**: Flake-resistant test execution

### Unique Architecture
Cypress operates differently from traditional testing tools like Selenium:
- Runs directly in the browser's run loop
- Provides native access to application objects
- Offers real-time synchronization between test runner and application

---

## Core Features

### Testing Capabilities
- **End-to-End Testing**: Simulate real user interactions in the browser
- **Component Testing**: Test individual UI components across frameworks
- **Accessibility Testing**: Identify potential accessibility issues
- **UI Coverage**: Visualize test coverage across application

---

## Installation & Setup

### Quick Installation

#### Standard Installation
```bash
# Install Cypress as dev dependency
npm install cypress --save-dev

# or using Yarn
yarn add cypress --dev

# or using pnpm
pnpm add -D cypress
```

#### React Native Installation
```bash
# Core Cypress installation
npm install --save-dev cypress

# React Native Web dependencies for testing
npm install --save-dev react-native-web react-dom

# Cypress React support
npm install --save-dev @cypress/react @cypress/webpack-dev-server

# Additional React Native Web dependencies
npm install --save-dev @babel/plugin-proposal-export-namespace-from
npm install --save-dev @babel/plugin-transform-react-jsx
```

### Initial Setup
```bash
# Open Cypress for the first time
npx cypress open

# Run tests in headless mode
npx cypress run
```

### Project Structure
```
cypress/
├── e2e/                 # End-to-end test files
├── component/           # Component test files
├── fixtures/            # Test data files
├── support/             # Support files and custom commands
│   ├── commands.js      # Custom commands
│   └── e2e.js          # E2E support file
└── downloads/           # Downloaded files during tests
```

---

## Commands Reference

### Queries
Queries read application state and return a subject for further actions.

#### `.get(selector)`
Find DOM elements by selector
```javascript
cy.get('[data-cy="submit"]')
cy.get('.class-name')
cy.get('#id')
```

#### `.contains(content)`
Select DOM element by text content
```javascript
cy.contains('Submit')
cy.contains('[data-cy="article"]', 'My Article')
```

#### `.find(selector)`
Find descendant elements
```javascript
cy.get('.parent').find('.child')
```

#### `.first()` / `.last()`
Select first or last item in collection
```javascript
cy.get('li').first()
cy.get('li').last()
```

#### `.eq(index)`
Select element at specific index
```javascript
cy.get('li').eq(2) // Third item (0-indexed)
```

### Assertions

#### `.should(chainers, value)`
Assert on application state with automatic retries
```javascript
cy.get('[data-cy="input"]')
  .should('be.visible')
  .should('have.value', 'expected value')
  .should('have.class', 'active')
```

Common chainers:
- `be.visible` / `not.be.visible`
- `exist` / `not.exist`
- `have.length`
- `have.value`
- `have.text`
- `have.class`
- `be.checked`
- `be.disabled` / `be.enabled`

#### `.and()`
Alias for `.should()`, useful for chaining assertions
```javascript
cy.get('[data-cy="form"]')
  .should('be.visible')
  .and('have.class', 'active')
  .and('contain', 'Submit')
```

### Actions

#### `.click()`
Click a DOM element
```javascript
cy.get('[data-cy="button"]').click()
cy.get('[data-cy="button"]').click({ force: true }) // Force click
cy.get('[data-cy="button"]').dblclick() // Double click
cy.get('[data-cy="button"]').rightclick() // Right click
```

#### `.type(text)`
Type into an input
```javascript
cy.get('[data-cy="input"]').type('Hello World')
cy.get('[data-cy="input"]').type('{enter}') // Special keys
cy.get('[data-cy="input"]').clear().type('New text') // Clear then type
```

#### `.check()` / `.uncheck()`
Check or uncheck checkboxes/radio buttons
```javascript
cy.get('[type="checkbox"]').check()
cy.get('[type="checkbox"]').uncheck()
cy.get('[type="radio"]').check('value')
```

#### `.select(value)`
Select an option in a dropdown
```javascript
cy.get('select').select('option-value')
cy.get('select').select(['option1', 'option2']) // Multi-select
```

#### `.scrollIntoView()`
Scroll element into view
```javascript
cy.get('[data-cy="footer"]').scrollIntoView()
cy.scrollTo('bottom')
cy.scrollTo(0, 500)
```

### Network Requests

#### `.intercept()`
Spy and stub network requests
```javascript
// Spy on requests
cy.intercept('GET', '/api/users').as('getUsers')
cy.wait('@getUsers')

// Stub responses
cy.intercept('GET', '/api/users', { fixture: 'users.json' })

// Dynamic stubbing
cy.intercept('POST', '/api/users', (req) => {
  req.reply({
    statusCode: 201,
    body: { id: 123, name: req.body.name }
  })
})
```

#### `.request()`
Make HTTP requests
```javascript
cy.request('GET', '/api/users')
cy.request({
  method: 'POST',
  url: '/api/users',
  body: { name: 'Jane' }
})
```

### Other Useful Commands

#### `.fixture()`
Load test data
```javascript
cy.fixture('users.json').then((users) => {
  cy.get('[data-cy="name"]').type(users[0].name)
})
```

#### `.task()`
Execute Node.js code
```javascript
// In cypress.config.js
module.exports = {
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          console.log(message)
          return null
        }
      })
    }
  }
}

// In test
cy.task('log', 'Hello from Node')
```

#### `.screenshot()`
Capture screenshots
```javascript
cy.screenshot()
cy.screenshot('my-screenshot')
cy.get('[data-cy="header"]').screenshot()
```

---

## Best Practices

### 1. Test Organization

#### Independent Tests
```javascript
// ✅ Good - Tests can run independently
describe('User Dashboard', () => {
  beforeEach(() => {
    cy.visit('/dashboard')
    cy.login() // Custom command
  })

  it('displays user profile', () => {
    cy.get('[data-cy="profile"]').should('be.visible')
  })

  it('shows recent activity', () => {
    cy.get('[data-cy="activity"]').should('have.length.greaterThan', 0)
  })
})

// ❌ Bad - Tests depend on each other
it('test 1', () => {
  cy.visit('/page')
  // Sets up state
})

it('test 2', () => {
  // Depends on state from test 1
})
```

### 2. Element Selection

#### Use Data Attributes
```javascript
// ✅ Best Practice - Use data-cy attributes
cy.get('[data-cy="submit-button"]').click()
cy.get('[data-testid="user-email"]').type('user@example.com')

// ❌ Avoid - Brittle selectors
cy.get('.btn.btn-primary').click() // Classes can change
cy.get('#submit').click() // IDs might not be unique
cy.contains('Submit').click() // Text can change
```

#### React Native Element Selection
```javascript
// ✅ React Native Best Practice - Use testID consistently
// React Native component
<TouchableOpacity testID="submit-button" onPress={handleSubmit}>
  <Text testID="submit-text">Submit</Text>
</TouchableOpacity>

// Cypress test - testID becomes data-testid in web
cy.get('[data-testid="submit-button"]').click()
cy.get('[data-testid="submit-text"]').should('contain.text', 'Submit')

// ✅ Cross-platform helper
const getTestProps = (testID) => {
  if (Platform.OS === 'web') {
    return { 'data-cy': testID }
  }
  return { testID }
}

// Usage in component
<TouchableOpacity {...getTestProps('submit-button')}>
  <Text>Submit</Text>
</TouchableOpacity>

// Usage in test
cy.get('[data-cy="submit-button"]').click()

// ❌ Avoid - React Native specific selectors that don't work in web
cy.get('TouchableOpacity').click() // Component names don't translate to DOM
cy.get('[onPress]').click() // Props don't become DOM attributes
```

### 3. Waiting Strategies

#### Use Explicit Waits
```javascript
// ✅ Good - Wait for specific conditions
cy.intercept('GET', '/api/data').as('getData')
cy.get('[data-cy="load-button"]').click()
cy.wait('@getData')

// ✅ Good - Assert on element state
cy.get('[data-cy="spinner"]').should('not.exist')
cy.get('[data-cy="content"]').should('be.visible')

// ❌ Bad - Arbitrary waits
cy.wait(5000) // Avoid fixed waits
```

### 4. Custom Commands

Create reusable commands in `cypress/support/commands.js`:
```javascript
// Login command
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login')
    cy.get('[data-cy="email"]').type(email)
    cy.get('[data-cy="password"]').type(password)
    cy.get('[data-cy="submit"]').click()
    cy.url().should('include', '/dashboard')
  })
})

// Usage in tests
cy.login('user@example.com', 'password123')
```

### 5. Assertions

#### Comprehensive Assertions
```javascript
// ✅ Good - Multiple assertions in one test
it('displays product correctly', () => {
  cy.visit('/products/1')
  
  cy.get('[data-cy="product-card"]').within(() => {
    cy.get('[data-cy="title"]').should('have.text', 'Product Name')
    cy.get('[data-cy="price"]').should('contain', '$99.99')
    cy.get('[data-cy="add-to-cart"]').should('be.enabled')
    cy.get('[data-cy="image"]').should('be.visible')
  })
})

// ❌ Avoid - Tiny tests with single assertions
it('has title', () => {
  cy.get('[data-cy="title"]').should('exist')
})

it('has price', () => {
  cy.get('[data-cy="price"]').should('exist')
})
```

### 6. State Management

#### Reset State Before Tests
```javascript
// ✅ Good - Reset in beforeEach
beforeEach(() => {
  cy.task('db:reset') // Reset database
  cy.clearCookies()
  cy.clearLocalStorage()
})

// ❌ Bad - Reset in afterEach (can fail and affect next test)
afterEach(() => {
  // Cleanup here is risky
})
```

---

## Testing Patterns

### Page Object Pattern
```javascript
// cypress/support/pages/LoginPage.js
class LoginPage {
  visit() {
    cy.visit('/login')
  }

  fillEmail(email) {
    cy.get('[data-cy="email"]').type(email)
  }

  fillPassword(password) {
    cy.get('[data-cy="password"]').type(password)
  }

  submit() {
    cy.get('[data-cy="submit"]').click()
  }

  login(email, password) {
    this.fillEmail(email)
    this.fillPassword(password)
    this.submit()
  }
}

export default new LoginPage()

// Usage in test
import loginPage from '../support/pages/LoginPage'

it('logs in successfully', () => {
  loginPage.visit()
  loginPage.login('user@example.com', 'password')
  cy.url().should('include', '/dashboard')
})
```

### Testing Forms
```javascript
describe('Form Validation', () => {
  it('validates required fields', () => {
    cy.visit('/signup')
    
    // Submit empty form
    cy.get('[data-cy="submit"]').click()
    
    // Check validation messages
    cy.get('[data-cy="email-error"]').should('contain', 'Email is required')
    cy.get('[data-cy="password-error"]').should('contain', 'Password is required')
    
    // Fill form correctly
    cy.get('[data-cy="email"]').type('user@example.com')
    cy.get('[data-cy="password"]').type('StrongPass123!')
    cy.get('[data-cy="confirm-password"]').type('StrongPass123!')
    
    // Submit should work now
    cy.get('[data-cy="submit"]').click()
    cy.url().should('include', '/welcome')
  })
})
```

### Testing Lists and Tables
```javascript
describe('Data Table', () => {
  it('filters and sorts data', () => {
    cy.visit('/users')
    
    // Check initial data
    cy.get('[data-cy="user-row"]').should('have.length', 10)
    
    // Apply filter
    cy.get('[data-cy="search"]').type('John')
    cy.get('[data-cy="user-row"]').should('have.length.lessThan', 10)
    
    // Sort by name
    cy.get('[data-cy="sort-name"]').click()
    cy.get('[data-cy="user-row"]').first()
      .should('contain', 'Alice') // Assuming alphabetical
    
    // Sort reverse
    cy.get('[data-cy="sort-name"]').click()
    cy.get('[data-cy="user-row"]').first()
      .should('contain', 'Zoe')
  })
})
```

---

## Component Testing

### Setup for React
```javascript
// cypress.config.js
import { defineConfig } from 'cypress'

export default defineConfig({
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite', // or 'webpack'
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
  },
})
```

### Setup for React Native
```javascript
// cypress.config.js
import { defineConfig } from 'cypress'

export default defineConfig({
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig: {
        resolve: {
          alias: {
            'react-native$': 'react-native-web',
          },
          extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.jsx', '.ts', '.tsx'],
        },
        module: {
          rules: [
            {
              test: /\.(js|jsx|ts|tsx)$/,
              exclude: /node_modules/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
                  plugins: ['react-native-web/babel'],
                },
              },
            },
          ],
        },
      },
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    // Mobile-first viewport for React Native testing
    viewportWidth: 375,
    viewportHeight: 812,
  },
})
```

### Example Component Test

#### Standard React Component
```javascript
// Button.cy.jsx
import Button from './Button'

describe('Button Component', () => {
  it('renders with text', () => {
    cy.mount(<Button>Click me</Button>)
    cy.get('button').should('have.text', 'Click me')
  })

  it('handles click events', () => {
    const onClick = cy.stub()
    cy.mount(<Button onClick={onClick}>Click me</Button>)
    
    cy.get('button').click()
    cy.wrap(onClick).should('have.been.called')
  })

  it('can be disabled', () => {
    cy.mount(<Button disabled>Click me</Button>)
    cy.get('button').should('be.disabled')
  })
})
```

#### React Native Component
```javascript
// StoryCard.cy.jsx
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import StoryCard from './StoryCard'

describe('StoryCard Component', () => {
  const mockStory = {
    id: '1',
    title: 'My Fantasy Story',
    wordCount: 1250,
    status: 'draft'
  }

  it('renders React Native components correctly', () => {
    const onPress = cy.stub().as('onPress')
    
    cy.mount(<StoryCard story={mockStory} onPress={onPress} />)
    
    // React Native Text components (converted to div by React Native Web)
    cy.get('[data-testid="story-title"]').should('contain.text', 'My Fantasy Story')
    cy.get('[data-testid="word-count"]').should('contain.text', '1250 words')
    cy.get('[data-testid="status"]').should('contain.text', 'draft')
  })

  it('handles TouchableOpacity interactions', () => {
    const onPress = cy.stub().as('onPress')
    
    cy.mount(<StoryCard story={mockStory} onPress={onPress} />)
    
    // TouchableOpacity converts to div with role="button"
    cy.get('[data-testid="story-card"]').click()
    cy.get('@onPress').should('have.been.calledOnceWith', mockStory)
  })

  it('has proper accessibility attributes', () => {
    cy.mount(<StoryCard story={mockStory} onPress={() => {}} />)
    
    // React Native accessibility props become ARIA attributes
    cy.get('[data-testid="story-card"]')
      .should('have.attr', 'role', 'button')
      .should('have.attr', 'aria-label')
      .should('not.have.attr', 'aria-disabled')
  })

  it('works across different viewports', () => {
    // Test mobile viewport
    cy.viewport(375, 812)
    cy.mount(<StoryCard story={mockStory} onPress={() => {}} />)
    cy.get('[data-testid="story-card"]').should('be.visible')

    // Test tablet viewport
    cy.viewport(768, 1024)
    cy.get('[data-testid="story-card"]').should('be.visible')
  })
})
```

---

## React Native Testing with Cypress

### Overview

React Native testing with Cypress leverages React Native Web as the testing platform, providing a way to test React Native components and applications in a web environment. This approach offers significant advantages for cross-platform applications that target both mobile and web platforms.

#### React Native Web as Testing Platform

React Native Web transforms React Native components into web-compatible components, allowing Cypress to interact with them as standard DOM elements. This enables comprehensive testing of React Native applications without requiring device simulators or emulators.

#### Why Cypress for React Native

**Advantages:**
- **Cross-Platform Coverage**: Test React Native components that run on iOS, Android, and web
- **Real Browser Environment**: Test in actual browsers with real user interactions
- **Developer Experience**: Familiar web testing tools and debugging capabilities
- **CI/CD Integration**: Easy integration with existing web-based CI/CD pipelines
- **Visual Testing**: Screenshots and visual regression testing capabilities

**Key Benefits:**
- No device/simulator requirements for basic component testing
- Faster test execution compared to native testing tools
- Better debugging tools and time-travel capabilities
- Integration with existing web development workflows

#### Architectural Considerations

**Testing Architecture:**
```
React Native App
├── Mobile (iOS/Android) - Native testing tools (Detox, Appium)
├── Web (React Native Web) - Cypress testing ✅
└── Shared Components - Cypress component tests ✅
```

**What Cypress Can Test:**
- ✅ Component behavior and rendering
- ✅ User interactions (touch, gestures)
- ✅ Navigation flows
- ✅ State management
- ✅ Form validation
- ✅ API integration
- ✅ Responsive design

**Limitations:**
- ❌ Native mobile features (camera, GPS, push notifications)
- ❌ Platform-specific native modules
- ❌ Device-specific performance testing
- ❌ Actual mobile browser testing
- ❌ Native gesture recognition beyond basic touch events

#### When to Use Cypress vs Native Testing Tools

**Use Cypress When:**
- Testing shared React Native components
- Testing web version of React Native app
- Component-level testing and validation
- Testing business logic and state management
- Cross-platform UI consistency testing
- Rapid development and debugging

**Use Native Tools (Detox/Appium) When:**
- Testing native mobile features
- Testing platform-specific functionality
- Performance testing on actual devices
- Testing native gestures and animations
- App store submission testing
- End-to-end mobile app testing

### Setup & Configuration

#### Installation for React Native

```bash
# Core Cypress installation
npm install --save-dev cypress

# React Native Web dependencies
npm install --save-dev react-native-web react-dom

# Cypress React support
npm install --save-dev @cypress/react @cypress/webpack-dev-server

# Additional React Native Web dependencies
npm install --save-dev @babel/plugin-proposal-export-namespace-from
npm install --save-dev @babel/plugin-transform-react-jsx
```

#### Package.json Scripts

```json
{
  "scripts": {
    "web": "webpack serve --config webpack.config.js --port 3002",
    "cypress:open": "cypress open",
    "cypress:run": "cypress run",
    "test:components": "cypress run --component",
    "test:e2e": "cypress run --e2e",
    "test:e2e:web": "npm run web & cypress run --e2e --config baseUrl=http://localhost:3002"
  }
}
```

#### Webpack Configuration for React Native Web

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './index.web.js', // or your web entry point
  
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: [
              '@babel/plugin-proposal-export-namespace-from',
              '@babel/plugin-transform-react-jsx',
              // React Native Web preset
              'react-native-web/babel',
            ],
          },
        },
      },
    ],
  },
  
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
    },
    extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.jsx', '.ts', '.tsx'],
  },
  
  devServer: {
    static: {
      directory: path.join(__dirname, 'web'),
    },
    port: 3002,
    historyApiFallback: true,
  },
};
```

#### Babel Setup and Transformations

```javascript
// babel.config.js
module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-transform-react-jsx',
    // React Native Web transformations
    'react-native-web/babel',
  ],
  overrides: [
    {
      test: /\.tsx?$/,
      presets: ['@babel/preset-typescript'],
    },
  ],
};
```

#### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src",
    "cypress"
  ],
  "exclude": [
    "node_modules",
    "ios",
    "android"
  ]
}
```

#### Cypress Configuration for React Native

```javascript
// cypress.config.js
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3002',
    viewportWidth: 375,  // iPhone width
    viewportHeight: 812, // iPhone height
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    setupNodeEvents(on, config) {
      // React Native specific tasks
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
        
        // Reset React Native async storage
        clearAsyncStorage() {
          // Implementation to clear AsyncStorage
          return null
        },
      })
    },
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig: require('./webpack.config.js'),
    },
    
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.js',
    
    // React Native component testing setup
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser = {}, launchOptions) => {
        // Add React Native debugging flags
        if (browser.name === 'chrome') {
          launchOptions.args.push('--disable-web-security')
        }
        return launchOptions
      })
    },
  },
  
  // Mobile-first viewport settings
  viewportWidth: 375,
  viewportHeight: 812,
  
  // React Native specific timeouts
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  responseTimeout: 10000,
})
```

#### Support File Configuration

```javascript
// cypress/support/component.js
import './commands'
import { mount } from 'cypress/react'

// React Native Web support
import 'react-native-web/dist/index.css'

// Augment the Cypress namespace to include type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
      swipe(direction: 'left' | 'right' | 'up' | 'down'): Chainable<void>
      longPress(): Chainable<void>
      mockAsyncStorage(data: Record<string, any>): Chainable<void>
    }
  }
}

Cypress.Commands.add('mount', mount)
```

### React Native Component Testing

#### Mounting React Native Components

```javascript
// Example React Native component
// StoryCard.jsx
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

const StoryCard = ({ story, onPress }) => {
  return (
    <TouchableOpacity 
      testID={`story-card-${story.id}`}
      onPress={onPress}
      style={styles.card}
      accessible={true}
      accessibilityLabel={`Story: ${story.title}`}
    >
      <View>
        <Text testID="story-title" style={styles.title}>
          {story.title}
        </Text>
        <Text testID="story-word-count" style={styles.wordCount}>
          {story.wordCount} words
        </Text>
        <Text testID="story-status" style={styles.status}>
          {story.status}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  wordCount: {
    fontSize: 14,
    color: '#666666',
  },
  status: {
    fontSize: 12,
    textTransform: 'uppercase',
    color: '#999999',
  },
})

export default StoryCard
```

```javascript
// StoryCard.cy.jsx
import StoryCard from './StoryCard'

describe('StoryCard Component', () => {
  const mockStory = {
    id: '1',
    title: 'My Fantasy Adventure',
    wordCount: 1250,
    status: 'draft',
  }

  it('renders story information correctly', () => {
    const onPress = cy.stub().as('onPress')
    
    cy.mount(<StoryCard story={mockStory} onPress={onPress} />)
    
    // Test React Native Text components
    cy.get('[data-cy="story-title"]').should('contain.text', 'My Fantasy Adventure')
    cy.get('[data-cy="story-word-count"]').should('contain.text', '1250 words')
    cy.get('[data-cy="story-status"]').should('contain.text', 'draft')
  })

  it('handles press events', () => {
    const onPress = cy.stub().as('onPress')
    
    cy.mount(<StoryCard story={mockStory} onPress={onPress} />)
    
    // Test React Native TouchableOpacity
    cy.get('[data-cy="story-card-1"]').click()
    cy.get('@onPress').should('have.been.calledOnce')
  })

  it('is accessible', () => {
    cy.mount(<StoryCard story={mockStory} onPress={() => {}} />)
    
    // Test accessibility attributes
    cy.get('[data-cy="story-card-1"]')
      .should('have.attr', 'aria-label', 'Story: My Fantasy Adventure')
      .should('have.attr', 'role', 'button')
  })
})
```

#### Provider Wrapping

```javascript
// Testing with React Navigation
import { NavigationContainer } from '@react-navigation/navigation'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator()

const NavigationWrapper = ({ children }) => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Test" component={() => children} />
    </Stack.Navigator>
  </NavigationContainer>
)

// Component test with navigation
describe('StoryScreen with Navigation', () => {
  it('navigates correctly', () => {
    cy.mount(
      <NavigationWrapper>
        <StoryScreen />
      </NavigationWrapper>
    )
    
    cy.get('[data-cy="create-story-button"]').click()
    // Test navigation behavior
  })
})
```

```javascript
// Testing with State Management (Zustand)
import { useStoryStore } from '../store/storyStore'

// Reset store before each test
beforeEach(() => {
  useStoryStore.setState({
    stories: [],
    currentStory: null,
  })
})

describe('StoryList with Store', () => {
  it('displays stories from store', () => {
    // Set up initial store state
    const testStories = [
      { id: '1', title: 'Story 1', wordCount: 100 },
      { id: '2', title: 'Story 2', wordCount: 200 },
    ]
    
    useStoryStore.setState({ stories: testStories })
    
    cy.mount(<StoryList />)
    
    cy.get('[data-cy="story-card"]').should('have.length', 2)
    cy.get('[data-cy="story-card"]').first()
      .should('contain.text', 'Story 1')
  })
})
```

#### Handling Platform-Specific Code

```javascript
// Component with platform detection
import { Platform } from 'react-native'

const PlatformComponent = () => {
  const isWeb = Platform.OS === 'web'
  
  return (
    <View testID="platform-component">
      {isWeb ? (
        <Text testID="web-text">Web Version</Text>
      ) : (
        <Text testID="mobile-text">Mobile Version</Text>
      )}
    </View>
  )
}

// Test platform-specific rendering
describe('Platform-Specific Component', () => {
  it('renders web version', () => {
    // Mock Platform.OS
    cy.stub(Platform, 'OS').value('web')
    
    cy.mount(<PlatformComponent />)
    
    cy.get('[data-cy="web-text"]').should('be.visible')
    cy.get('[data-cy="mobile-text"]').should('not.exist')
  })
})
```

#### Mocking Native Modules

```javascript
// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: cy.stub().resolves(null),
  setItem: cy.stub().resolves(),
  removeItem: cy.stub().resolves(),
  clear: cy.stub().resolves(),
}

// Custom command for AsyncStorage mocking
Cypress.Commands.add('mockAsyncStorage', (data = {}) => {
  cy.window().then((win) => {
    win.AsyncStorage = {
      ...mockAsyncStorage,
      getItem: cy.stub().callsFake((key) => Promise.resolve(data[key] || null)),
    }
  })
})

// Usage in tests
describe('Persistent Storage', () => {
  it('loads data from AsyncStorage', () => {
    cy.mockAsyncStorage({
      'user-preferences': JSON.stringify({ theme: 'dark' }),
    })
    
    cy.mount(<SettingsScreen />)
    
    cy.get('[data-cy="theme-toggle"]').should('have.attr', 'aria-checked', 'true')
  })
})
```

### Selector Strategies

#### testID to data-cy Conversion

React Native Web automatically converts `testID` props to `data-testid` attributes in the DOM, which Cypress can then target:

```javascript
// React Native component
<TouchableOpacity testID="submit-button">
  <Text>Submit</Text>
</TouchableOpacity>

// Cypress test - target with data-testid
cy.get('[data-testid="submit-button"]').click()

// Or use the testID directly (Cypress supports this)
cy.get('[data-cy="submit-button"]').click() // If using data-cy wrapper
```

#### Creating a testID Helper

```javascript
// utils/testHelpers.js
import { Platform } from 'react-native'

export const getTestProps = (testID) => {
  if (Platform.OS === 'web') {
    return { 'data-cy': testID }
  }
  return { testID }
}

// Usage in components
import { getTestProps } from '../utils/testHelpers'

<TouchableOpacity {...getTestProps('submit-button')}>
  <Text>Submit</Text>
</TouchableOpacity>

// In Cypress tests
cy.get('[data-cy="submit-button"]').click()
```

#### accessibilityLabel Usage

```javascript
// React Native component with accessibility
<TouchableOpacity
  testID="story-card"
  accessible={true}
  accessibilityLabel={`Story titled ${story.title}`}
  accessibilityHint="Tap to open story editor"
>
  <Text>{story.title}</Text>
</TouchableOpacity>

// Cypress test using accessibility attributes
describe('Accessibility Testing', () => {
  it('has proper accessibility labels', () => {
    cy.mount(<StoryCard story={mockStory} />)
    
    cy.get('[data-testid="story-card"]')
      .should('have.attr', 'aria-label', 'Story titled My Fantasy Adventure')
      .should('have.attr', 'title', 'Tap to open story editor')
  })
})
```

#### Platform-Specific Selectors

```javascript
// Different selectors for different platforms
const getSelector = (testID) => {
  if (Cypress.env('platform') === 'web') {
    return `[data-cy="${testID}"]`
  }
  return `[data-testid="${testID}"]`
}

// Usage
cy.get(getSelector('submit-button')).click()
```

#### React Native Web DOM Structure

Understanding how React Native components map to DOM elements:

```javascript
// React Native structure
<View>
  <Text>Hello World</Text>
  <TouchableOpacity>
    <Text>Click me</Text>
  </TouchableOpacity>
</View>

// Resulting DOM structure (React Native Web)
<div>
  <div>Hello World</div>
  <div role="button" tabindex="0">
    <div>Click me</div>
  </div>
</div>
```

### Testing React Native Elements

#### View, Text, ScrollView Testing

```javascript
describe('React Native Core Components', () => {
  it('tests View and Text components', () => {
    const Component = () => (
      <View testID="container" style={{ padding: 20 }}>
        <Text testID="heading">Story Title</Text>
        <Text testID="content">Story content goes here...</Text>
      </View>
    )
    
    cy.mount(<Component />)
    
    // Test View container
    cy.get('[data-testid="container"]')
      .should('be.visible')
      .should('have.css', 'padding', '20px')
    
    // Test Text components
    cy.get('[data-testid="heading"]').should('contain.text', 'Story Title')
    cy.get('[data-testid="content"]').should('contain.text', 'Story content')
  })
  
  it('tests ScrollView behavior', () => {
    const ScrollComponent = () => (
      <ScrollView testID="scroll-container" style={{ height: 200 }}>
        {Array.from({ length: 20 }, (_, i) => (
          <Text key={i} testID={`item-${i}`}>Item {i}</Text>
        ))}
      </ScrollView>
    )
    
    cy.mount(<ScrollComponent />)
    
    // Test scroll behavior
    cy.get('[data-testid="scroll-container"]').scrollTo('bottom')
    cy.get('[data-testid="item-19"]').should('be.visible')
    
    cy.get('[data-testid="scroll-container"]').scrollTo('top')
    cy.get('[data-testid="item-0"]').should('be.visible')
  })
})
```

#### TouchableOpacity/Pressable Interactions

```javascript
describe('Touchable Components', () => {
  it('handles TouchableOpacity interactions', () => {
    const onPress = cy.stub().as('onPress')
    const onPressIn = cy.stub().as('onPressIn')
    const onPressOut = cy.stub().as('onPressOut')
    
    const ButtonComponent = () => (
      <TouchableOpacity
        testID="touchable-button"
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.7}
      >
        <Text>Press me</Text>
      </TouchableOpacity>
    )
    
    cy.mount(<ButtonComponent />)
    
    // Test press interactions
    cy.get('[data-testid="touchable-button"]')
      .trigger('mousedown')
      .trigger('mouseup')
      .click()
    
    cy.get('@onPressIn').should('have.been.called')
    cy.get('@onPressOut').should('have.been.called')
    cy.get('@onPress').should('have.been.called')
  })
  
  it('tests Pressable with press states', () => {
    const Component = () => (
      <Pressable testID="pressable-button">
        {({ pressed }) => (
          <Text testID="button-text" style={{ opacity: pressed ? 0.5 : 1 }}>
            {pressed ? 'Pressed' : 'Press me'}
          </Text>
        )}
      </Pressable>
    )
    
    cy.mount(<Component />)
    
    cy.get('[data-testid="button-text"]').should('contain.text', 'Press me')
    
    // Test press state change
    cy.get('[data-testid="pressable-button"]').trigger('mousedown')
    cy.get('[data-testid="button-text"]').should('contain.text', 'Pressed')
  })
})
```

#### TextInput Handling

```javascript
describe('TextInput Component', () => {
  it('handles text input and events', () => {
    const onChangeText = cy.stub().as('onChangeText')
    const onFocus = cy.stub().as('onFocus')
    const onBlur = cy.stub().as('onBlur')
    
    const InputComponent = () => (
      <TextInput
        testID="story-title-input"
        placeholder="Enter story title..."
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    )
    
    cy.mount(<InputComponent />)
    
    // Test input interactions
    cy.get('[data-testid="story-title-input"]')
      .should('have.attr', 'placeholder', 'Enter story title...')
      .focus()
      .type('My New Story')
      .blur()
    
    cy.get('@onFocus').should('have.been.called')
    cy.get('@onChangeText').should('have.been.calledWith', 'My New Story')
    cy.get('@onBlur').should('have.been.called')
  })
  
  it('validates input constraints', () => {
    const Component = () => (
      <TextInput
        testID="character-limit-input"
        maxLength={100}
        multiline={true}
        numberOfLines={4}
      />
    )
    
    cy.mount(<Component />)
    
    // Test maxLength constraint
    const longText = 'a'.repeat(150)
    cy.get('[data-testid="character-limit-input"]')
      .type(longText)
      .should('have.value', 'a'.repeat(100))
  })
})
```

#### Modal and Overlay Testing

```javascript
describe('Modal Component', () => {
  it('shows and hides modal', () => {
    const ModalComponent = () => {
      const [visible, setVisible] = React.useState(false)
      
      return (
        <View>
          <TouchableOpacity 
            testID="open-modal-button" 
            onPress={() => setVisible(true)}
          >
            <Text>Open Modal</Text>
          </TouchableOpacity>
          
          <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            testID="story-modal"
          >
            <View testID="modal-content">
              <Text>Modal Content</Text>
              <TouchableOpacity 
                testID="close-modal-button"
                onPress={() => setVisible(false)}
              >
                <Text>Close</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      )
    }
    
    cy.mount(<ModalComponent />)
    
    // Test modal opening
    cy.get('[data-testid="story-modal"]').should('not.be.visible')
    cy.get('[data-testid="open-modal-button"]').click()
    cy.get('[data-testid="story-modal"]').should('be.visible')
    cy.get('[data-testid="modal-content"]').should('be.visible')
    
    // Test modal closing
    cy.get('[data-testid="close-modal-button"]').click()
    cy.get('[data-testid="story-modal"]').should('not.be.visible')
  })
})
```

#### FlatList/SectionList Testing

```javascript
describe('FlatList Component', () => {
  it('renders list items correctly', () => {
    const stories = Array.from({ length: 20 }, (_, i) => ({
      id: i.toString(),
      title: `Story ${i + 1}`,
      wordCount: (i + 1) * 100,
    }))
    
    const StoryList = () => (
      <FlatList
        testID="story-list"
        data={stories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View testID={`story-item-${item.id}`}>
            <Text testID={`story-title-${item.id}`}>{item.title}</Text>
            <Text testID={`story-words-${item.id}`}>{item.wordCount} words</Text>
          </View>
        )}
        ListEmptyComponent={<Text testID="empty-list">No stories</Text>}
      />
    )
    
    cy.mount(<StoryList />)
    
    // Test list rendering
    cy.get('[data-testid="story-list"]').should('be.visible')
    cy.get('[data-testid^="story-item-"]').should('have.length', 20)
    
    // Test specific items
    cy.get('[data-testid="story-title-0"]').should('contain.text', 'Story 1')
    cy.get('[data-testid="story-words-0"]').should('contain.text', '100 words')
    
    // Test scrolling to load more items
    cy.get('[data-testid="story-list"]').scrollTo('bottom')
    cy.get('[data-testid="story-item-19"]').should('be.visible')
  })
  
  it('shows empty state', () => {
    const EmptyList = () => (
      <FlatList
        testID="empty-story-list"
        data={[]}
        keyExtractor={(item) => item.id}
        renderItem={() => null}
        ListEmptyComponent={<Text testID="empty-message">No stories found</Text>}
      />
    )
    
    cy.mount(<EmptyList />)
    
    cy.get('[data-testid="empty-message"]').should('contain.text', 'No stories found')
  })
})
```

### React Native Specific Patterns

#### Navigation Testing

```javascript
// Testing React Navigation
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator()

const HomeScreen = ({ navigation }) => (
  <View testID="home-screen">
    <Text>Home Screen</Text>
    <TouchableOpacity 
      testID="go-to-story-button"
      onPress={() => navigation.navigate('Story', { storyId: '123' })}
    >
      <Text>Go to Story</Text>
    </TouchableOpacity>
  </View>
)

const StoryScreen = ({ route }) => (
  <View testID="story-screen">
    <Text testID="story-id">Story ID: {route.params?.storyId}</Text>
  </View>
)

describe('Navigation Testing', () => {
  it('navigates between screens', () => {
    const NavigationTest = () => (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Story" component={StoryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    )
    
    cy.mount(<NavigationTest />)
    
    // Test initial screen
    cy.get('[data-testid="home-screen"]').should('be.visible')
    
    // Test navigation
    cy.get('[data-testid="go-to-story-button"]').click()
    cy.get('[data-testid="story-screen"]').should('be.visible')
    cy.get('[data-testid="story-id"]').should('contain.text', 'Story ID: 123')
  })
})
```

#### Navigation Mocking Strategies

```javascript
// Mock navigation for component testing
const mockNavigation = {
  navigate: cy.stub().as('navigate'),
  goBack: cy.stub().as('goBack'),
  push: cy.stub().as('push'),
  reset: cy.stub().as('reset'),
}

describe('Navigation Component Tests', () => {
  it('calls navigation methods', () => {
    const ComponentWithNavigation = ({ navigation }) => (
      <View>
        <TouchableOpacity 
          testID="navigate-button"
          onPress={() => navigation.navigate('Profile')}
        >
          <Text>Go to Profile</Text>
        </TouchableOpacity>
      </View>
    )
    
    cy.mount(<ComponentWithNavigation navigation={mockNavigation} />)
    
    cy.get('[data-testid="navigate-button"]').click()
    cy.get('@navigate').should('have.been.calledWith', 'Profile')
  })
})
```

#### Screen Transition Testing

```javascript
// Test screen transitions with animations
describe('Screen Transitions', () => {
  it('handles transition animations', () => {
    const AnimatedTransition = () => {
      const [showSecondScreen, setShowSecondScreen] = React.useState(false)
      
      return (
        <View testID="transition-container">
          {!showSecondScreen ? (
            <View testID="first-screen">
              <TouchableOpacity 
                testID="transition-button"
                onPress={() => setShowSecondScreen(true)}
              >
                <Text>Go to Second Screen</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View testID="second-screen">
              <Text>Second Screen</Text>
            </View>
          )}
        </View>
      )
    }
    
    cy.mount(<AnimatedTransition />)
    
    cy.get('[data-testid="first-screen"]').should('be.visible')
    cy.get('[data-testid="transition-button"]').click()
    
    // Wait for transition to complete
    cy.get('[data-testid="second-screen"]', { timeout: 5000 }).should('be.visible')
    cy.get('[data-testid="first-screen"]').should('not.exist')
  })
})
```

#### Deep Linking Tests

```javascript
// Test deep linking behavior
describe('Deep Linking', () => {
  it('handles deep link navigation', () => {
    // Mock the deep link URL
    cy.window().then((win) => {
      win.history.pushState({}, '', '/story/123?edit=true')
    })
    
    const DeepLinkApp = () => {
      const [params, setParams] = React.useState({})
      
      React.useEffect(() => {
        const url = new URL(window.location.href)
        const storyId = url.pathname.split('/').pop()
        const edit = url.searchParams.get('edit')
        setParams({ storyId, edit })
      }, [])
      
      return (
        <View testID="deep-link-container">
          <Text testID="story-id">Story: {params.storyId}</Text>
          <Text testID="edit-mode">Edit: {params.edit}</Text>
        </View>
      )
    }
    
    cy.mount(<DeepLinkApp />)
    
    cy.get('[data-testid="story-id"]').should('contain.text', 'Story: 123')
    cy.get('[data-testid="edit-mode"]').should('contain.text', 'Edit: true')
  })
})
```

#### State Management

```javascript
// Testing with Zustand store
import { create } from 'zustand'

const useStoryStore = create((set) => ({
  stories: [],
  addStory: (story) => set((state) => ({ 
    stories: [...state.stories, story] 
  })),
  removeStory: (id) => set((state) => ({ 
    stories: state.stories.filter(s => s.id !== id) 
  })),
}))

describe('Zustand Store Testing', () => {
  beforeEach(() => {
    // Reset store before each test
    useStoryStore.setState({ stories: [] })
  })
  
  it('manages story state correctly', () => {
    const StoryManager = () => {
      const { stories, addStory, removeStory } = useStoryStore()
      
      return (
        <View>
          <TouchableOpacity 
            testID="add-story-button"
            onPress={() => addStory({ id: '1', title: 'New Story' })}
          >
            <Text>Add Story</Text>
          </TouchableOpacity>
          
          {stories.map((story) => (
            <View key={story.id} testID={`story-${story.id}`}>
              <Text testID={`story-title-${story.id}`}>{story.title}</Text>
              <TouchableOpacity 
                testID={`remove-story-${story.id}`}
                onPress={() => removeStory(story.id)}
              >
                <Text>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
          
          <Text testID="story-count">Count: {stories.length}</Text>
        </View>
      )
    }
    
    cy.mount(<StoryManager />)
    
    // Test initial state
    cy.get('[data-testid="story-count"]').should('contain.text', 'Count: 0')
    
    // Test adding story
    cy.get('[data-testid="add-story-button"]').click()
    cy.get('[data-testid="story-count"]').should('contain.text', 'Count: 1')
    cy.get('[data-testid="story-title-1"]').should('contain.text', 'New Story')
    
    // Test removing story
    cy.get('[data-testid="remove-story-1"]').click()
    cy.get('[data-testid="story-count"]').should('contain.text', 'Count: 0')
  })
})
```

#### AsyncStorage Mocking

```javascript
// Custom command for AsyncStorage testing
Cypress.Commands.add('mockAsyncStorage', (initialData = {}) => {
  cy.window().then((win) => {
    const storage = { ...initialData }
    
    win.AsyncStorage = {
      getItem: cy.stub().callsFake((key) => {
        return Promise.resolve(storage[key] || null)
      }),
      setItem: cy.stub().callsFake((key, value) => {
        storage[key] = value
        return Promise.resolve()
      }),
      removeItem: cy.stub().callsFake((key) => {
        delete storage[key]
        return Promise.resolve()
      }),
      clear: cy.stub().callsFake(() => {
        Object.keys(storage).forEach(key => delete storage[key])
        return Promise.resolve()
      }),
      getAllKeys: cy.stub().callsFake(() => {
        return Promise.resolve(Object.keys(storage))
      }),
    }
  })
})

describe('AsyncStorage Integration', () => {
  it('persists and retrieves data', () => {
    cy.mockAsyncStorage({
      'user-settings': JSON.stringify({ theme: 'dark', notifications: true })
    })
    
    const SettingsComponent = () => {
      const [settings, setSettings] = React.useState(null)
      
      React.useEffect(() => {
        const loadSettings = async () => {
          const data = await AsyncStorage.getItem('user-settings')
          setSettings(JSON.parse(data))
        }
        loadSettings()
      }, [])
      
      const saveSettings = async (newSettings) => {
        await AsyncStorage.setItem('user-settings', JSON.stringify(newSettings))
        setSettings(newSettings)
      }
      
      if (!settings) return <Text testID="loading">Loading...</Text>
      
      return (
        <View>
          <Text testID="theme">Theme: {settings.theme}</Text>
          <TouchableOpacity 
            testID="toggle-theme"
            onPress={() => saveSettings({ 
              ...settings, 
              theme: settings.theme === 'dark' ? 'light' : 'dark' 
            })}
          >
            <Text>Toggle Theme</Text>
          </TouchableOpacity>
        </View>
      )
    }
    
    cy.mount(<SettingsComponent />)
    
    // Test initial load from AsyncStorage
    cy.get('[data-testid="theme"]').should('contain.text', 'Theme: dark')
    
    // Test saving to AsyncStorage
    cy.get('[data-testid="toggle-theme"]').click()
    cy.get('[data-testid="theme"]').should('contain.text', 'Theme: light')
  })
})
```

#### Context API Testing

```javascript
// Testing React Context
const ThemeContext = React.createContext()

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = React.useState('light')
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

const ThemedComponent = () => {
  const { theme, setTheme } = React.useContext(ThemeContext)
  
  return (
    <View testID="themed-component">
      <Text testID="current-theme">Current theme: {theme}</Text>
      <TouchableOpacity 
        testID="toggle-theme"
        onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        <Text>Toggle Theme</Text>
      </TouchableOpacity>
    </View>
  )
}

describe('Context API Testing', () => {
  it('provides and updates context values', () => {
    cy.mount(
      <ThemeProvider>
        <ThemedComponent />
      </ThemeProvider>
    )
    
    cy.get('[data-testid="current-theme"]').should('contain.text', 'light')
    cy.get('[data-testid="toggle-theme"]').click()
    cy.get('[data-testid="current-theme"]').should('contain.text', 'dark')
  })
})
```

#### State Persistence Validation

```javascript
// Test state persistence across app lifecycle
describe('State Persistence', () => {
  it('maintains state across app restarts', () => {
    // Mock the persistence layer
    cy.mockAsyncStorage()
    
    const PersistentCounter = () => {
      const [count, setCount] = React.useState(0)
      
      // Load persisted state
      React.useEffect(() => {
        const loadCount = async () => {
          const savedCount = await AsyncStorage.getItem('counter')
          if (savedCount) {
            setCount(parseInt(savedCount, 10))
          }
        }
        loadCount()
      }, [])
      
      // Persist state changes
      React.useEffect(() => {
        AsyncStorage.setItem('counter', count.toString())
      }, [count])
      
      return (
        <View>
          <Text testID="counter">Count: {count}</Text>
          <TouchableOpacity 
            testID="increment"
            onPress={() => setCount(c => c + 1)}
          >
            <Text>+</Text>
          </TouchableOpacity>
        </View>
      )
    }
    
    // Mount component and interact
    cy.mount(<PersistentCounter />)
    cy.get('[data-testid="counter"]').should('contain.text', 'Count: 0')
    cy.get('[data-testid="increment"]').click()
    cy.get('[data-testid="counter"]').should('contain.text', 'Count: 1')
    
    // Simulate app restart by remounting
    cy.mount(<PersistentCounter />)
    cy.get('[data-testid="counter"]').should('contain.text', 'Count: 1')
  })
})
```

### Platform-Specific Considerations

#### Cross-Platform Testing Strategy

```javascript
// Test responsive design across device sizes
describe('Cross-Platform Responsive Design', () => {
  const ResponsiveComponent = () => {
    const [screenData, setScreenData] = React.useState({})
    
    React.useEffect(() => {
      const updateScreenData = () => {
        setScreenData({
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height,
        })
      }
      
      updateScreenData()
      const subscription = Dimensions.addEventListener('change', updateScreenData)
      return () => subscription?.remove()
    }, [])
    
    const isTablet = screenData.width >= 768
    const isMobile = screenData.width < 768
    
    return (
      <View testID="responsive-container">
        {isMobile && <Text testID="mobile-layout">Mobile Layout</Text>}
        {isTablet && <Text testID="tablet-layout">Tablet Layout</Text>}
        <Text testID="dimensions">
          {screenData.width} x {screenData.height}
        </Text>
      </View>
    )
  }
  
  it('adapts to mobile viewport', () => {
    cy.viewport(375, 812) // iPhone X
    cy.mount(<ResponsiveComponent />)
    
    cy.get('[data-testid="mobile-layout"]').should('be.visible')
    cy.get('[data-testid="tablet-layout"]').should('not.exist')
    cy.get('[data-testid="dimensions"]').should('contain.text', '375 x 812')
  })
  
  it('adapts to tablet viewport', () => {
    cy.viewport(1024, 768) // iPad
    cy.mount(<ResponsiveComponent />)
    
    cy.get('[data-testid="tablet-layout"]').should('be.visible')
    cy.get('[data-testid="mobile-layout"]').should('not.exist')
    cy.get('[data-testid="dimensions"]').should('contain.text', '1024 x 768')
  })
})
```

#### Platform Detection in Tests

```javascript
// Test platform-specific behavior
describe('Platform-Specific Behavior', () => {
  it('behaves differently on web vs mobile', () => {
    const PlatformComponent = () => {
      const isWeb = Platform.OS === 'web'
      
      return (
        <View testID="platform-container">
          {isWeb ? (
            <TouchableOpacity testID="web-button">
              <Text>Web Click Handler</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity testID="mobile-button">
              <Text>Mobile Touch Handler</Text>
            </TouchableOpacity>
          )}
        </View>
      )
    }
    
    // Since we're always testing in web environment
    cy.mount(<PlatformComponent />)
    cy.get('[data-testid="web-button"]').should('be.visible')
    cy.get('[data-testid="mobile-button"]').should('not.exist')
  })
})
```

#### Responsive Design Testing

```javascript
// Test breakpoint-based layouts
describe('Responsive Breakpoints', () => {
  const BREAKPOINTS = {
    mobile: 375,
    tablet: 768,
    desktop: 1024,
  }
  
  const BreakpointComponent = () => {
    const { width } = useWindowDimensions()
    
    const getLayout = () => {
      if (width >= BREAKPOINTS.desktop) return 'desktop'
      if (width >= BREAKPOINTS.tablet) return 'tablet'
      return 'mobile'
    }
    
    return (
      <View testID="breakpoint-container">
        <Text testID="current-layout">{getLayout()}</Text>
        <Text testID="current-width">{width}</Text>
      </View>
    )
  }
  
  Object.entries(BREAKPOINTS).forEach(([breakpoint, width]) => {
    it(`displays ${breakpoint} layout at ${width}px`, () => {
      cy.viewport(width, 600)
      cy.mount(<BreakpointComponent />)
      
      cy.get('[data-testid="current-layout"]').should('contain.text', breakpoint)
      cy.get('[data-testid="current-width"]').should('contain.text', width.toString())
    })
  })
})
```

#### Mobile Viewport Testing

```javascript
// Test common mobile device viewports
const DEVICE_VIEWPORTS = {
  'iPhone SE': { width: 375, height: 667 },
  'iPhone 12': { width: 390, height: 844 },
  'iPhone 12 Pro Max': { width: 428, height: 926 },
  'iPad': { width: 768, height: 1024 },
  'iPad Pro': { width: 1024, height: 1366 },
}

describe('Mobile Device Testing', () => {
  Object.entries(DEVICE_VIEWPORTS).forEach(([device, viewport]) => {
    it(`works on ${device}`, () => {
      cy.viewport(viewport.width, viewport.height)
      
      const MobileApp = () => (
        <View testID="mobile-app" style={{ flex: 1, padding: 20 }}>
          <Text testID="device-info">
            Testing on {device}: {viewport.width}x{viewport.height}
          </Text>
          <TouchableOpacity testID="main-action">
            <Text>Main Action</Text>
          </TouchableOpacity>
        </View>
      )
      
      cy.mount(<MobileApp />)
      
      // Verify layout works on this device
      cy.get('[data-testid="mobile-app"]').should('be.visible')
      cy.get('[data-testid="device-info"]')
        .should('contain.text', device)
        .should('contain.text', `${viewport.width}x${viewport.height}`)
      
      // Test main interaction works
      cy.get('[data-testid="main-action"]').should('be.visible').click()
    })
  })
})
```

#### React Native Web Limitations

```javascript
// Test handling of unsupported features
describe('React Native Web Limitations', () => {
  it('handles missing native modules gracefully', () => {
    // Mock a native module that doesn't exist in web
    const ComponentWithNativeModule = () => {
      const [hasNativeFeature, setHasNativeFeature] = React.useState(false)
      
      React.useEffect(() => {
        // Simulate checking for native feature availability
        if (Platform.OS !== 'web') {
          // Would use actual native module here
          setHasNativeFeature(true)
        }
      }, [])
      
      return (
        <View testID="native-feature-component">
          {hasNativeFeature ? (
            <Text testID="native-available">Native feature available</Text>
          ) : (
            <Text testID="native-unavailable">Using web fallback</Text>
          )}
        </View>
      )
    }
    
    cy.mount(<ComponentWithNativeModule />)
    
    // In web environment, should show fallback
    cy.get('[data-testid="native-unavailable"]').should('be.visible')
    cy.get('[data-testid="native-available"]').should('not.exist')
  })
  
  it('handles performance considerations', () => {
    // Test that large lists perform reasonably in web
    const LargeList = () => {
      const [items] = React.useState(
        Array.from({ length: 1000 }, (_, i) => ({ id: i, text: `Item ${i}` }))
      )
      
      return (
        <FlatList
          testID="large-list"
          data={items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Text testID={`item-${item.id}`}>{item.text}</Text>
          )}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )
    }
    
    cy.mount(<LargeList />)
    
    // Should render efficiently without blocking
    cy.get('[data-testid="large-list"]').should('be.visible')
    cy.get('[data-testid="item-0"]').should('be.visible')
    
    // Scrolling should work smoothly
    cy.get('[data-testid="large-list"]').scrollTo('bottom')
    cy.get('[data-testid="item-999"]').should('be.visible')
  })
})
```

### Gesture and Animation Testing

#### Touch Event Simulation

```javascript
// Custom commands for touch events
Cypress.Commands.add('swipe', { prevSubject: 'element' }, (subject, direction) => {
  const startPosition = direction === 'left' ? 'right' : 'left'
  const endPosition = direction
  
  cy.wrap(subject)
    .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
    .trigger('touchmove', { touches: [{ clientX: 200, clientY: 100 }] })
    .trigger('touchend')
})

Cypress.Commands.add('longPress', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject)
    .trigger('touchstart')
    .wait(1000) // Long press duration
    .trigger('touchend')
})

describe('Gesture Testing', () => {
  it('handles swipe gestures', () => {
    const SwipeableCard = () => {
      const [swiped, setSwiped] = React.useState(false)
      
      return (
        <View 
          testID="swipeable-card"
          onTouchEnd={() => setSwiped(true)}
          style={{ 
            width: 300, 
            height: 100, 
            backgroundColor: swiped ? 'red' : 'blue' 
          }}
        >
          <Text testID="swipe-status">
            {swiped ? 'Swiped!' : 'Swipe me'}
          </Text>
        </View>
      )
    }
    
    cy.mount(<SwipeableCard />)
    
    cy.get('[data-testid="swipe-status"]').should('contain.text', 'Swipe me')
    cy.get('[data-testid="swipeable-card"]').swipe('left')
    cy.get('[data-testid="swipe-status"]').should('contain.text', 'Swiped!')
  })
  
  it('handles long press gestures', () => {
    const LongPressComponent = () => {
      const [longPressed, setLongPressed] = React.useState(false)
      
      return (
        <TouchableOpacity
          testID="long-press-target"
          onLongPress={() => setLongPressed(true)}
          delayLongPress={500}
        >
          <Text testID="long-press-status">
            {longPressed ? 'Long pressed!' : 'Long press me'}
          </Text>
        </TouchableOpacity>
      )
    }
    
    cy.mount(<LongPressComponent />)
    
    cy.get('[data-testid="long-press-status"]').should('contain.text', 'Long press me')
    cy.get('[data-testid="long-press-target"]').longPress()
    cy.get('[data-testid="long-press-status"]').should('contain.text', 'Long pressed!')
  })
})
```

#### Swipe Gesture Testing

```javascript
describe('Advanced Swipe Gestures', () => {
  it('tests swipe-to-delete functionality', () => {
    const SwipeToDelete = () => {
      const [items, setItems] = React.useState([
        { id: 1, text: 'Item 1' },
        { id: 2, text: 'Item 2' },
        { id: 3, text: 'Item 3' },
      ])
      const [swipedItem, setSwipedItem] = React.useState(null)
      
      const handleSwipe = (itemId) => {
        setSwipedItem(itemId)
      }
      
      const handleDelete = (itemId) => {
        setItems(items.filter(item => item.id !== itemId))
        setSwipedItem(null)
      }
      
      return (
        <View testID="swipe-to-delete-list">
          {items.map((item) => (
            <View key={item.id} testID={`item-container-${item.id}`}>
              <View
                testID={`swipeable-item-${item.id}`}
                onTouchEnd={() => handleSwipe(item.id)}
                style={{ 
                  flexDirection: 'row',
                  transform: swipedItem === item.id ? 'translateX(-100px)' : 'translateX(0)'
                }}
              >
                <Text testID={`item-text-${item.id}`}>{item.text}</Text>
              </View>
              
              {swipedItem === item.id && (
                <TouchableOpacity
                  testID={`delete-button-${item.id}`}
                  onPress={() => handleDelete(item.id)}
                  style={{ position: 'absolute', right: 0, top: 0 }}
                >
                  <Text>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )
    }
    
    cy.mount(<SwipeToDelete />)
    
    // Verify initial state
    cy.get('[data-testid="item-text-1"]').should('contain.text', 'Item 1')
    cy.get('[data-testid="delete-button-1"]').should('not.exist')
    
    // Test swipe to reveal delete button
    cy.get('[data-testid="swipeable-item-1"]').swipe('left')
    cy.get('[data-testid="delete-button-1"]').should('be.visible')
    
    // Test delete functionality
    cy.get('[data-testid="delete-button-1"]').click()
    cy.get('[data-testid="item-container-1"]').should('not.exist')
    cy.get('[data-testid="item-text-2"]').should('be.visible')
  })
})
```

#### Animated Component Testing

```javascript
describe('Animation Testing', () => {
  it('tests fade in animation', () => {
    const FadeInComponent = () => {
      const [visible, setVisible] = React.useState(false)
      const [opacity, setOpacity] = React.useState(0)
      
      const fadeIn = () => {
        setVisible(true)
        // Simulate animation
        setTimeout(() => setOpacity(1), 100)
      }
      
      return (
        <View testID="fade-container">
          <TouchableOpacity testID="trigger-fade" onPress={fadeIn}>
            <Text>Trigger Fade In</Text>
          </TouchableOpacity>
          
          {visible && (
            <View 
              testID="fade-target"
              style={{ 
                opacity,
                transition: 'opacity 0.3s ease-in-out'
              }}
            >
              <Text>Faded in content</Text>
            </View>
          )}
        </View>
      )
    }
    
    cy.mount(<FadeInComponent />)
    
    // Test initial state
    cy.get('[data-testid="fade-target"]').should('not.exist')
    
    // Trigger animation
    cy.get('[data-testid="trigger-fade"]').click()
    
    // Test that element appears
    cy.get('[data-testid="fade-target"]').should('be.visible')
    
    // Test that opacity changes (may need to wait for animation)
    cy.get('[data-testid="fade-target"]')
      .should('have.css', 'opacity', '1')
  })
  
  it('tests slide animation', () => {
    const SlideComponent = () => {
      const [position, setPosition] = React.useState('translateX(-100%)')
      
      const slideIn = () => {
        setPosition('translateX(0)')
      }
      
      return (
        <View testID="slide-container">
          <TouchableOpacity testID="trigger-slide" onPress={slideIn}>
            <Text>Slide In</Text>
          </TouchableOpacity>
          
          <View 
            testID="slide-target"
            style={{ 
              transform: position,
              transition: 'transform 0.3s ease-in-out'
            }}
          >
            <Text>Sliding content</Text>
          </View>
        </View>
      )
    }
    
    cy.mount(<SlideComponent />)
    
    // Test initial position
    cy.get('[data-testid="slide-target"]')
      .should('have.css', 'transform', 'matrix(1, 0, 0, 1, -100, 0)') // translateX(-100%)
    
    // Trigger slide
    cy.get('[data-testid="trigger-slide"]').click()
    
    // Test final position
    cy.get('[data-testid="slide-target"]')
      .should('have.css', 'transform', 'none') // translateX(0)
  })
})
```

#### Keyboard Interaction Testing

```javascript
describe('Keyboard Interaction Testing', () => {
  it('handles keyboard events in text inputs', () => {
    const KeyboardComponent = () => {
      const [text, setText] = React.useState('')
      const [submitted, setSubmitted] = React.useState(false)
      
      const handleSubmit = () => {
        setSubmitted(true)
      }
      
      return (
        <View testID="keyboard-container">
          <TextInput
            testID="keyboard-input"
            value={text}
            onChangeText={setText}
            onSubmitEditing={handleSubmit}
            placeholder="Type and press enter"
          />
          
          <Text testID="input-value">Current: {text}</Text>
          
          {submitted && (
            <Text testID="submitted-indicator">Submitted!</Text>
          )}
        </View>
      )
    }
    
    cy.mount(<KeyboardComponent />)
    
    // Test typing
    cy.get('[data-testid="keyboard-input"]')
      .type('Hello World')
    
    cy.get('[data-testid="input-value"]')
      .should('contain.text', 'Current: Hello World')
    
    // Test enter key submission
    cy.get('[data-testid="keyboard-input"]')
      .type('{enter}')
    
    cy.get('[data-testid="submitted-indicator"]')
      .should('be.visible')
  })
  
  it('tests keyboard shortcuts', () => {
    const ShortcutComponent = () => {
      const [shortcutTriggered, setShortcutTriggered] = React.useState('')
      
      React.useEffect(() => {
        const handleKeyDown = (event) => {
          if (event.ctrlKey && event.key === 's') {
            event.preventDefault()
            setShortcutTriggered('Save shortcut triggered')
          }
          if (event.ctrlKey && event.key === 'n') {
            event.preventDefault()
            setShortcutTriggered('New shortcut triggered')
          }
        }
        
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
      }, [])
      
      return (
        <View testID="shortcut-container">
          <Text testID="shortcut-status">
            {shortcutTriggered || 'No shortcuts triggered'}
          </Text>
        </View>
      )
    }
    
    cy.mount(<ShortcutComponent />)
    
    // Test Ctrl+S shortcut
    cy.get('body').type('{ctrl+s}')
    cy.get('[data-testid="shortcut-status"]')
      .should('contain.text', 'Save shortcut triggered')
    
    // Test Ctrl+N shortcut
    cy.get('body').type('{ctrl+n}')
    cy.get('[data-testid="shortcut-status"]')
      .should('contain.text', 'New shortcut triggered')
  })
})
```

### Best Practices for React Native

#### Component Test Organization

```javascript
// Recommended file structure for React Native Cypress tests

// src/components/StoryCard/StoryCard.cy.tsx
import StoryCard from './StoryCard'
import { mockStories } from '../../../cypress/fixtures/stories'

describe('StoryCard Component', () => {
  // Test data setup
  const defaultProps = {
    story: mockStories[0],
    onPress: cy.stub().as('onPress'),
  }
  
  // Reusable mount helper
  const mountStoryCard = (props = {}) => {
    return cy.mount(<StoryCard {...defaultProps} {...props} />)
  }
  
  describe('Rendering', () => {
    it('displays story information', () => {
      mountStoryCard()
      
      cy.get('[data-testid="story-title"]')
        .should('contain.text', defaultProps.story.title)
      cy.get('[data-testid="story-word-count"]')
        .should('contain.text', `${defaultProps.story.wordCount} words`)
    })
    
    it('handles empty states', () => {
      mountStoryCard({ 
        story: { ...defaultProps.story, title: '', wordCount: 0 } 
      })
      
      cy.get('[data-testid="story-title"]').should('be.empty')
      cy.get('[data-testid="story-word-count"]').should('contain.text', '0 words')
    })
  })
  
  describe('Interactions', () => {
    it('calls onPress when tapped', () => {
      mountStoryCard()
      
      cy.get('[data-testid="story-card"]').click()
      cy.get('@onPress').should('have.been.calledOnceWith', defaultProps.story)
    })
    
    it('handles long press', () => {
      const onLongPress = cy.stub().as('onLongPress')
      mountStoryCard({ onLongPress })
      
      cy.get('[data-testid="story-card"]').longPress()
      cy.get('@onLongPress').should('have.been.called')
    })
  })
  
  describe('Accessibility', () => {
    it('has proper accessibility attributes', () => {
      mountStoryCard()
      
      cy.get('[data-testid="story-card"]')
        .should('have.attr', 'aria-label')
        .should('have.attr', 'role', 'button')
        .should('not.have.attr', 'aria-disabled')
    })
    
    it('supports keyboard navigation', () => {
      mountStoryCard()
      
      cy.get('[data-testid="story-card"]')
        .focus()
        .type('{enter}')
      
      cy.get('@onPress').should('have.been.called')
    })
  })
})
```

#### Test Data Management

```javascript
// cypress/fixtures/stories.js
export const mockStories = [
  {
    id: '1',
    title: 'The Dragon\'s Tale',
    content: 'Once upon a time in a land far away...',
    wordCount: 1250,
    status: 'draft',
    genre: 'fantasy',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
    chapters: [],
  },
  {
    id: '2',
    title: 'Space Adventures',
    content: 'In the year 3000, humanity had spread across the galaxy...',
    wordCount: 2500,
    status: 'published',
    genre: 'scifi',
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-04T00:00:00.000Z',
    chapters: [
      {
        id: 'ch1',
        title: 'Chapter 1: The Beginning',
        content: 'Chapter content...',
        orderIndex: 0,
      },
    ],
  },
]

export const mockCharacters = [
  {
    id: 'char1',
    name: 'Elena Brightblade',
    role: 'protagonist',
    description: 'A brave knight with a mysterious past',
    storyIds: ['1'],
  },
  {
    id: 'char2',
    name: 'Captain Zara',
    role: 'protagonist', 
    description: 'A skilled space pilot',
    storyIds: ['2'],
  },
]

// Factory functions for test data
export const createStory = (overrides = {}) => ({
  id: Date.now().toString(),
  title: 'Test Story',
  content: '',
  wordCount: 0,
  status: 'draft',
  genre: 'fantasy',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  chapters: [],
  ...overrides,
})

export const createCharacter = (overrides = {}) => ({
  id: Date.now().toString(),
  name: 'Test Character',
  role: 'supporting',
  description: 'A test character',
  storyIds: [],
  ...overrides,
})
```

#### Mock Utilities Setup

```javascript
// cypress/support/mockUtils.js

// Navigation mocks
export const createMockNavigation = (overrides = {}) => ({
  navigate: cy.stub().as('navigate'),
  goBack: cy.stub().as('goBack'),
  push: cy.stub().as('push'),
  replace: cy.stub().as('replace'),
  reset: cy.stub().as('reset'),
  setParams: cy.stub().as('setParams'),
  ...overrides,
})

// Route mocks
export const createMockRoute = (params = {}, overrides = {}) => ({
  params,
  name: 'TestScreen',
  key: 'test-screen-key',
  ...overrides,
})

// Store mocks
export const mockStoryStore = {
  stories: [],
  currentStory: null,
  createStory: cy.stub().as('createStory'),
  updateStory: cy.stub().as('updateStory'),
  deleteStory: cy.stub().as('deleteStory'),
  setCurrentStory: cy.stub().as('setCurrentStory'),
}

// AsyncStorage mock utilities
export const setupAsyncStorageMock = (initialData = {}) => {
  return {
    getItem: cy.stub().callsFake(key => Promise.resolve(initialData[key] || null)),
    setItem: cy.stub().callsFake((key, value) => {
      initialData[key] = value
      return Promise.resolve()
    }),
    removeItem: cy.stub().callsFake(key => {
      delete initialData[key]
      return Promise.resolve()
    }),
    clear: cy.stub().callsFake(() => {
      Object.keys(initialData).forEach(key => delete initialData[key])
      return Promise.resolve()
    }),
  }
}

// Dimension mock utilities
export const mockDimensions = (width = 375, height = 812) => {
  cy.stub(Dimensions, 'get').callsFake((dim) => {
    if (dim === 'window' || dim === 'screen') {
      return { width, height }
    }
    return { width: 0, height: 0 }
  })
}

// Platform mock utilities
export const mockPlatform = (os = 'ios') => {
  cy.stub(Platform, 'OS').value(os)
  cy.stub(Platform, 'select').callsFake((obj) => obj[os] || obj.default)
}
```

#### Shared Test Helpers

```javascript
// cypress/support/testHelpers.js

// Component mounting with common providers
export const mountWithProviders = (component, options = {}) => {
  const { 
    navigationMock,
    storeMock,
    themeMock = 'light',
    ...mountOptions 
  } = options
  
  const Wrapper = ({ children }) => {
    let wrapped = children
    
    // Wrap with theme provider if needed
    if (themeMock) {
      wrapped = (
        <ThemeProvider theme={themeMock}>
          {wrapped}
        </ThemeProvider>
      )
    }
    
    // Wrap with navigation if needed
    if (navigationMock) {
      wrapped = (
        <NavigationContainer>
          {wrapped}
        </NavigationContainer>
      )
    }
    
    return wrapped
  }
  
  return cy.mount(
    <Wrapper>
      {component}
    </Wrapper>,
    mountOptions
  )
}

// Common test patterns
export const testAccessibility = (selector) => {
  cy.get(selector)
    .should('have.attr', 'aria-label')
    .should('not.have.attr', 'aria-hidden', 'true')
}

export const testResponsiveBreakpoint = (component, breakpoint) => {
  const viewports = {
    mobile: { width: 375, height: 812 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1024, height: 768 },
  }
  
  const viewport = viewports[breakpoint]
  cy.viewport(viewport.width, viewport.height)
  mountWithProviders(component)
  
  cy.get('[data-testid*="layout"]').should('be.visible')
}

// Form testing helpers
export const fillForm = (formData) => {
  Object.entries(formData).forEach(([field, value]) => {
    cy.get(`[data-testid="${field}"]`).type(value)
  })
}

export const submitForm = (submitSelector = '[data-testid="submit-button"]') => {
  cy.get(submitSelector).click()
}

// List testing helpers
export const testListRendering = (listSelector, expectedCount) => {
  cy.get(listSelector).should('be.visible')
  cy.get(`${listSelector} [data-testid*="item-"]`).should('have.length', expectedCount)
}

export const testListEmpty = (listSelector, emptySelector) => {
  cy.get(listSelector).should('be.visible')
  cy.get(`${listSelector} [data-testid*="item-"]`).should('have.length', 0)
  cy.get(emptySelector).should('be.visible')
}
```

#### Common Testing Scenarios

```javascript
// Form validation in React Native
describe('Form Validation Scenarios', () => {
  it('validates story creation form', () => {
    const StoryForm = () => {
      const [title, setTitle] = React.useState('')
      const [genre, setGenre] = React.useState('')
      const [errors, setErrors] = React.useState({})
      
      const validateForm = () => {
        const newErrors = {}
        
        if (!title.trim()) {
          newErrors.title = 'Title is required'
        } else if (title.length < 3) {
          newErrors.title = 'Title must be at least 3 characters'
        }
        
        if (!genre) {
          newErrors.genre = 'Genre is required'
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
      }
      
      const handleSubmit = () => {
        if (validateForm()) {
          // Form is valid
        }
      }
      
      return (
        <View testID="story-form">
          <TextInput
            testID="title-input"
            value={title}
            onChangeText={setTitle}
            placeholder="Enter story title"
          />
          {errors.title && (
            <Text testID="title-error" style={{ color: 'red' }}>
              {errors.title}
            </Text>
          )}
          
          <Picker
            testID="genre-picker"
            selectedValue={genre}
            onValueChange={setGenre}
          >
            <Picker.Item label="Select genre..." value="" />
            <Picker.Item label="Fantasy" value="fantasy" />
            <Picker.Item label="Sci-Fi" value="scifi" />
          </Picker>
          {errors.genre && (
            <Text testID="genre-error" style={{ color: 'red' }}>
              {errors.genre}
            </Text>
          )}
          
          <TouchableOpacity testID="submit-button" onPress={handleSubmit}>
            <Text>Create Story</Text>
          </TouchableOpacity>
        </View>
      )
    }
    
    cy.mount(<StoryForm />)
    
    // Test empty form validation
    cy.get('[data-testid="submit-button"]').click()
    cy.get('[data-testid="title-error"]').should('contain.text', 'Title is required')
    cy.get('[data-testid="genre-error"]').should('contain.text', 'Genre is required')
    
    // Test minimum length validation
    cy.get('[data-testid="title-input"]').type('ab')
    cy.get('[data-testid="submit-button"]').click()
    cy.get('[data-testid="title-error"]').should('contain.text', 'at least 3 characters')
    
    // Test valid form
    cy.get('[data-testid="title-input"]').clear().type('My Fantasy Story')
    cy.get('[data-testid="genre-picker"]').select('fantasy')
    cy.get('[data-testid="submit-button"]').click()
    cy.get('[data-testid="title-error"]').should('not.exist')
    cy.get('[data-testid="genre-error"]').should('not.exist')
  })
})

// List rendering and virtualization
describe('List Performance Scenarios', () => {
  it('handles large story lists efficiently', () => {
    const stories = Array.from({ length: 1000 }, (_, i) => ({
      id: i.toString(),
      title: `Story ${i + 1}`,
      wordCount: (i + 1) * 100,
    }))
    
    const StoryList = () => (
      <FlatList
        testID="large-story-list"
        data={stories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View testID={`story-${item.id}`}>
            <Text testID={`title-${item.id}`}>{item.title}</Text>
            <Text testID={`words-${item.id}`}>{item.wordCount} words</Text>
          </View>
        )}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={21}
        removeClippedSubviews={true}
      />
    )
    
    cy.mount(<StoryList />)
    
    // Test initial rendering
    cy.get('[data-testid="large-story-list"]').should('be.visible')
    
    // Test that only initial items are rendered
    cy.get('[data-testid="story-0"]').should('be.visible')
    cy.get('[data-testid="story-19"]').should('be.visible')
    cy.get('[data-testid="story-100"]').should('not.exist')
    
    // Test virtual scrolling
    cy.get('[data-testid="large-story-list"]').scrollTo('50%')
    cy.get('[data-testid="story-500"]').should('be.visible')
    
    // Test scroll to end
    cy.get('[data-testid="large-story-list"]').scrollTo('bottom')
    cy.get('[data-testid="story-999"]').should('be.visible')
  })
})

// Image loading and caching
describe('Image Handling Scenarios', () => {
  it('handles image loading states', () => {
    const ImageComponent = () => {
      const [loading, setLoading] = React.useState(true)
      const [error, setError] = React.useState(false)
      
      return (
        <View testID="image-container">
          {loading && <Text testID="loading-indicator">Loading image...</Text>}
          {error && <Text testID="error-indicator">Failed to load image</Text>}
          
          <Image
            testID="story-cover"
            source={{ uri: 'https://example.com/cover.jpg' }}
            style={{ width: 200, height: 300 }}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false)
              setError(true)
            }}
          />
        </View>
      )
    }
    
    cy.mount(<ImageComponent />)
    
    // Test loading state
    cy.get('[data-testid="loading-indicator"]').should('be.visible')
    
    // Simulate image load success
    cy.get('[data-testid="story-cover"]').trigger('load')
    cy.get('[data-testid="loading-indicator"]').should('not.exist')
    cy.get('[data-testid="error-indicator"]').should('not.exist')
  })
})

// Network request handling
describe('Network Request Scenarios', () => {
  it('handles API request states', () => {
    const ApiComponent = () => {
      const [loading, setLoading] = React.useState(false)
      const [data, setData] = React.useState(null)
      const [error, setError] = React.useState(null)
      
      const fetchData = async () => {
        setLoading(true)
        setError(null)
        
        try {
          // Simulate API call
          await new Promise((resolve, reject) => {
            setTimeout(() => {
              if (Math.random() > 0.5) {
                resolve({ stories: ['Story 1', 'Story 2'] })
              } else {
                reject(new Error('Network error'))
              }
            }, 1000)
          })
          
          setData({ stories: ['Story 1', 'Story 2'] })
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }
      
      return (
        <View testID="api-component">
          <TouchableOpacity testID="fetch-button" onPress={fetchData}>
            <Text>Fetch Stories</Text>
          </TouchableOpacity>
          
          {loading && <Text testID="loading">Loading...</Text>}
          {error && <Text testID="error">Error: {error}</Text>}
          {data && (
            <View testID="data-container">
              {data.stories.map((story, index) => (
                <Text key={index} testID={`story-${index}`}>{story}</Text>
              ))}
            </View>
          )}
        </View>
      )
    }
    
    cy.mount(<ApiComponent />)
    
    // Mock successful response
    cy.window().then((win) => {
      cy.stub(win, 'fetch').resolves({
        ok: true,
        json: () => Promise.resolve({ stories: ['Story 1', 'Story 2'] })
      })
    })
    
    cy.get('[data-testid="fetch-button"]').click()
    cy.get('[data-testid="loading"]').should('be.visible')
    
    cy.get('[data-testid="data-container"]').should('be.visible')
    cy.get('[data-testid="story-0"]').should('contain.text', 'Story 1')
    cy.get('[data-testid="story-1"]').should('contain.text', 'Story 2')
  })
})

// Authentication flows
describe('Authentication Flow Scenarios', () => {
  it('handles login flow', () => {
    const AuthFlow = () => {
      const [user, setUser] = React.useState(null)
      const [loggingIn, setLoggingIn] = React.useState(false)
      
      const login = async (username, password) => {
        setLoggingIn(true)
        
        // Simulate login API call
        setTimeout(() => {
          if (username === 'testuser' && password === 'password') {
            setUser({ id: '1', username })
          }
          setLoggingIn(false)
        }, 1000)
      }
      
      const logout = () => {
        setUser(null)
      }
      
      if (user) {
        return (
          <View testID="authenticated-view">
            <Text testID="welcome-message">Welcome, {user.username}!</Text>
            <TouchableOpacity testID="logout-button" onPress={logout}>
              <Text>Logout</Text>
            </TouchableOpacity>
          </View>
        )
      }
      
      return (
        <View testID="login-view">
          <TextInput
            testID="username-input"
            placeholder="Username"
            defaultValue="testuser"
          />
          <TextInput
            testID="password-input"
            placeholder="Password"
            secureTextEntry={true}
            defaultValue="password"
          />
          <TouchableOpacity 
            testID="login-button" 
            onPress={() => login('testuser', 'password')}
            disabled={loggingIn}
          >
            <Text>{loggingIn ? 'Logging in...' : 'Login'}</Text>
          </TouchableOpacity>
        </View>
      )
    }
    
    cy.mount(<AuthFlow />)
    
    // Test login form
    cy.get('[data-testid="login-view"]').should('be.visible')
    cy.get('[data-testid="username-input"]').should('have.value', 'testuser')
    cy.get('[data-testid="password-input"]').should('have.value', 'password')
    
    // Test login process
    cy.get('[data-testid="login-button"]').click()
    cy.get('[data-testid="login-button"]').should('contain.text', 'Logging in...')
    
    // Test successful authentication
    cy.get('[data-testid="authenticated-view"]').should('be.visible')
    cy.get('[data-testid="welcome-message"]').should('contain.text', 'Welcome, testuser!')
    
    // Test logout
    cy.get('[data-testid="logout-button"]').click()
    cy.get('[data-testid="login-view"]').should('be.visible')
  })
})
```

### Troubleshooting React Native Tests

#### Common Issues

**"Cannot call cy.stub() outside test" fixes:**

```javascript
// ❌ Wrong - stub outside test
const mockNavigation = {
  navigate: cy.stub(), // This will fail
}

describe('Navigation Tests', () => {
  it('navigates correctly', () => {
    // Test code
  })
})

// ✅ Correct - stub inside test or beforeEach
describe('Navigation Tests', () => {
  let mockNavigation
  
  beforeEach(() => {
    mockNavigation = {
      navigate: cy.stub().as('navigate'),
      goBack: cy.stub().as('goBack'),
    }
  })
  
  it('navigates correctly', () => {
    cy.mount(<Component navigation={mockNavigation} />)
    // Test code
  })
})
```

**Module resolution errors:**

```javascript
// cypress.config.js - Fix module resolution
export default defineConfig({
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig: {
        resolve: {
          alias: {
            'react-native$': 'react-native-web',
            'react-native/Libraries/EventEmitter/NativeEventEmitter$': 
              'react-native-web/dist/vendor/react-native/NativeEventEmitter',
          },
          extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },
})
```

**React Native Web compatibility:**

```javascript
// Handle React Native Web differences
describe('React Native Web Compatibility', () => {
  it('handles platform differences', () => {
    // Mock Platform.OS for consistent testing
    cy.window().then((win) => {
      win.Platform = { OS: 'web' }
    })
    
    const PlatformComponent = () => {
      const isWeb = Platform.OS === 'web'
      return (
        <Text testID="platform-text">
          {isWeb ? 'Web Platform' : 'Native Platform'}
        </Text>
      )
    }
    
    cy.mount(<PlatformComponent />)
    cy.get('[data-testid="platform-text"]').should('contain.text', 'Web Platform')
  })
})
```

**Port conflicts and configuration:**

```javascript
// package.json - Use different ports for different services
{
  "scripts": {
    "web": "webpack serve --port 3002",
    "cypress:open": "cypress open --config baseUrl=http://localhost:3002",
    "cypress:run": "cypress run --config baseUrl=http://localhost:3002",
    "test:dev": "concurrently \"npm run web\" \"wait-on http://localhost:3002 && cypress open\""
  }
}

// cypress.config.js - Configure port consistently
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3002',
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig: require('./webpack.config.js'),
    },
  },
})
```

#### Debugging Techniques

**Component inspection:**

```javascript
describe('Component Debugging', () => {
  it('inspects component state and props', () => {
    const DebuggableComponent = ({ initialValue }) => {
      const [value, setValue] = React.useState(initialValue)
      
      return (
        <View testID="debuggable-component">
          <Text testID="current-value">{value}</Text>
          <TouchableOpacity 
            testID="increment-button"
            onPress={() => setValue(v => v + 1)}
          >
            <Text>Increment</Text>
          </TouchableOpacity>
        </View>
      )
    }
    
    cy.mount(<DebuggableComponent initialValue={5} />)
    
    // Debug component state
    cy.get('[data-testid="current-value"]').then(($el) => {
      cy.log('Current value:', $el.text())
    })
    
    cy.get('[data-testid="increment-button"]').click()
    
    cy.get('[data-testid="current-value"]').then(($el) => {
      cy.log('Value after increment:', $el.text())
    })
  })
})
```

**React DevTools integration:**

```javascript
// Add React DevTools support in development
// webpack.config.js
module.exports = {
  // ... other config
  resolve: {
    alias: {
      'react-dom$': 'react-dom/profiling',
      'scheduler/tracing': 'scheduler/tracing-profiling',
    },
  },
}

// In tests, you can access React DevTools
cy.window().then((win) => {
  if (win.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    cy.log('React DevTools available')
  }
})
```

**Network debugging:**

```javascript
describe('Network Debugging', () => {
  beforeEach(() => {
    // Log all network requests
    cy.intercept('**', (req) => {
      cy.log(`${req.method} ${req.url}`)
      req.continue()
    })
  })
  
  it('debugs API calls', () => {
    // Intercept and log specific API calls
    cy.intercept('GET', '/api/stories', (req) => {
      cy.log('Stories API called', req.query)
      req.reply({ stories: [] })
    }).as('getStories')
    
    cy.mount(<StoriesComponent />)
    
    cy.wait('@getStories').then((interception) => {
      cy.log('API Response:', interception.response.body)
    })
  })
})
```

**Performance profiling:**

```javascript
describe('Performance Profiling', () => {
  it('measures component render time', () => {
    const start = performance.now()
    
    const HeavyComponent = () => {
      // Simulate expensive computation
      const expensiveValue = useMemo(() => {
        return Array.from({ length: 1000 }, (_, i) => i * i)
      }, [])
      
      return (
        <FlatList
          testID="heavy-list"
          data={expensiveValue}
          renderItem={({ item }) => <Text>{item}</Text>}
        />
      )
    }
    
    cy.mount(<HeavyComponent />).then(() => {
      const end = performance.now()
      cy.log(`Render time: ${end - start}ms`)
      
      // Assert performance threshold
      expect(end - start).to.be.lessThan(1000)
    })
    
    cy.get('[data-testid="heavy-list"]').should('be.visible')
  })
})
```

### Integration Examples

#### Complete Test Example

Here's a comprehensive example testing a React Native screen component with navigation, state, and user interactions:

```javascript
// StoryEditorScreen.cy.tsx
import StoryEditorScreen from './StoryEditorScreen'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useStoryStore } from '../../store/storyStore'
import { mockStories } from '../../../cypress/fixtures/stories'

const Stack = createNativeStackNavigator()

// Test wrapper with navigation
const StoryEditorWrapper = ({ storyId }) => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen 
        name="StoryEditor" 
        component={StoryEditorScreen}
        initialParams={{ storyId }}
      />
    </Stack.Navigator>
  </NavigationContainer>
)

describe('StoryEditorScreen Integration', () => {
  beforeEach(() => {
    // Reset store state
    useStoryStore.setState({
      stories: mockStories,
      currentStory: mockStories[0],
    })
    
    // Mock AsyncStorage
    cy.mockAsyncStorage({
      'story-autosave-1': JSON.stringify({
        content: 'Auto-saved content...',
        timestamp: Date.now(),
      })
    })
    
    // Mock keyboard behavior
    cy.window().then((win) => {
      win.Keyboard = {
        addListener: cy.stub(),
        removeListener: cy.stub(),
      }
    })
  })
  
  describe('Story Loading', () => {
    it('loads existing story', () => {
      cy.mount(<StoryEditorWrapper storyId="1" />)
      
      // Test story content loads
      cy.get('[data-testid="story-title-input"]')
        .should('have.value', mockStories[0].title)
      
      cy.get('[data-testid="story-content-editor"]')
        .should('contain.text', mockStories[0].content)
      
      cy.get('[data-testid="word-count"]')
        .should('contain.text', `${mockStories[0].wordCount} words`)
    })
    
    it('handles non-existent story', () => {
      cy.mount(<StoryEditorWrapper storyId="nonexistent" />)
      
      // Should show error state
      cy.get('[data-testid="story-not-found"]').should('be.visible')
      cy.get('[data-testid="back-button"]').should('be.visible')
    })
    
    it('recovers auto-saved content', () => {
      cy.mount(<StoryEditorWrapper storyId="1" />)
      
      // Should show auto-save recovery dialog
      cy.get('[data-testid="autosave-recovery-modal"]').should('be.visible')
      cy.get('[data-testid="autosave-content-preview"]')
        .should('contain.text', 'Auto-saved content...')
      
      // Test recovery acceptance
      cy.get('[data-testid="accept-autosave-button"]').click()
      
      cy.get('[data-testid="story-content-editor"]')
        .should('contain.text', 'Auto-saved content...')
    })
  })
  
  describe('Content Editing', () => {
    it('edits story title', () => {
      cy.mount(<StoryEditorWrapper storyId="1" />)
      
      const newTitle = 'Updated Story Title'
      
      cy.get('[data-testid="story-title-input"]')
        .clear()
        .type(newTitle)
      
      // Test that store updates
      cy.get('[data-testid="story-title-input"]').should('have.value', newTitle)
      
      // Test auto-save indicator
      cy.get('[data-testid="save-indicator"]').should('contain.text', 'Saving...')
      cy.get('[data-testid="save-indicator"]', { timeout: 3000 })
        .should('contain.text', 'Saved')
    })
    
    it('edits story content with rich text', () => {
      cy.mount(<StoryEditorWrapper storyId="1" />)
      
      const newContent = 'This is the new story content with **bold** text.'
      
      cy.get('[data-testid="story-content-editor"]')
        .clear()
        .type(newContent)
      
      // Test word count updates
      cy.get('[data-testid="word-count"]')
        .should('not.contain.text', mockStories[0].wordCount.toString())
      
      // Test formatting toolbar
      cy.get('[data-testid="format-bold-button"]').click()
      cy.get('[data-testid="story-content-editor"]')
        .should('have.css', 'font-weight', '700')
    })
    
    it('handles large content efficiently', () => {
      const largeContent = 'Large content. '.repeat(10000)
      
      cy.mount(<StoryEditorWrapper storyId="1" />)
      
      cy.get('[data-testid="story-content-editor"]')
        .clear()
        .type(largeContent.substring(0, 1000)) // Type subset for performance
      
      // Should handle large content without performance issues
      cy.get('[data-testid="word-count"]')
        .should('be.visible')
        .should('not.contain.text', '0 words')
      
      // Auto-save should still work
      cy.get('[data-testid="save-indicator"]', { timeout: 5000 })
        .should('contain.text', 'Saved')
    })
  })
  
  describe('Navigation and State', () => {
    it('navigates to character manager', () => {
      const mockNavigate = cy.stub().as('navigate')
      
      cy.mount(<StoryEditorWrapper storyId="1" />)
      
      cy.get('[data-testid="open-character-manager"]').click()
      
      // Should navigate with story context
      cy.get('@navigate').should('have.been.calledWith', 'CharacterManager', {
        storyId: '1'
      })
    })
    
    it('handles back navigation with unsaved changes', () => {
      cy.mount(<StoryEditorWrapper storyId="1" />)
      
      // Make changes
      cy.get('[data-testid="story-title-input"]')
        .clear()
        .type('Unsaved changes')
      
      // Attempt to navigate back
      cy.get('[data-testid="back-button"]').click()
      
      // Should show unsaved changes dialog
      cy.get('[data-testid="unsaved-changes-modal"]').should('be.visible')
      cy.get('[data-testid="save-and-exit-button"]').should('be.visible')
      cy.get('[data-testid="discard-changes-button"]').should('be.visible')
      cy.get('[data-testid="cancel-exit-button"]').should('be.visible')
    })
    
    it('persists state across navigation', () => {
      cy.mount(<StoryEditorWrapper storyId="1" />)
      
      const updatedTitle = 'Navigation Test Title'
      
      // Make changes
      cy.get('[data-testid="story-title-input"]')
        .clear()
        .type(updatedTitle)
      
      // Wait for auto-save
      cy.get('[data-testid="save-indicator"]', { timeout: 3000 })
        .should('contain.text', 'Saved')
      
      // Simulate navigation away and back
      cy.mount(<StoryEditorWrapper storyId="2" />) // Different story
      cy.mount(<StoryEditorWrapper storyId="1" />) // Back to original
      
      // Should restore the updated title
      cy.get('[data-testid="story-title-input"]')
        .should('have.value', updatedTitle)
    })
  })
  
  describe('Responsive Design', () => {
    it('adapts to mobile portrait', () => {
      cy.viewport(375, 812)
      cy.mount(<StoryEditorWrapper storyId="1" />)
      
      // Mobile layout should be visible
      cy.get('[data-testid="mobile-editor-layout"]').should('be.visible')
      cy.get('[data-testid="desktop-sidebar"]').should('not.exist')
      
      // Toolbar should be collapsed
      cy.get('[data-testid="collapsed-toolbar"]').should('be.visible')
      cy.get('[data-testid="expanded-toolbar"]').should('not.exist')
    })
    
    it('adapts to tablet landscape', () => {
      cy.viewport(1024, 768)
      cy.mount(<StoryEditorWrapper storyId="1" />)
      
      // Tablet layout with sidebar
      cy.get('[data-testid="tablet-editor-layout"]').should('be.visible')
      cy.get('[data-testid="sidebar-panel"]').should('be.visible')
      
      // Expanded toolbar
      cy.get('[data-testid="expanded-toolbar"]').should('be.visible')
    })
  })
  
  describe('Accessibility', () => {
    it('supports keyboard navigation', () => {
      cy.mount(<StoryEditorWrapper storyId="1" />)
      
      // Tab through interactive elements
      cy.get('[data-testid="story-title-input"]').focus()
      cy.focused().should('have.attr', 'data-testid', 'story-title-input')
      
      cy.focused().tab()
      cy.focused().should('have.attr', 'data-testid', 'story-content-editor')
      
      cy.focused().tab()
      cy.focused().should('have.attr', 'data-testid', 'save-button')
    })
    
    it('has proper ARIA labels', () => {
      cy.mount(<StoryEditorWrapper storyId="1" />)
      
      cy.get('[data-testid="story-title-input"]')
        .should('have.attr', 'aria-label', 'Story title')
        .should('have.attr', 'aria-describedby')
      
      cy.get('[data-testid="story-content-editor"]')
        .should('have.attr', 'aria-label', 'Story content editor')
        .should('have.attr', 'role', 'textbox')
        .should('have.attr', 'aria-multiline', 'true')
      
      cy.get('[data-testid="word-count"]')
        .should('have.attr', 'aria-live', 'polite')
    })
    
    it('supports screen readers', () => {
      cy.mount(<StoryEditorWrapper storyId="1" />)
      
      // Test that status updates are announced
      cy.get('[data-testid="story-title-input"]').type('New title')
      
      cy.get('[data-testid="save-status"]')
        .should('have.attr', 'aria-live', 'polite')
        .should('contain.text', 'Saved')
    })
  })
  
  describe('Error Handling', () => {
    it('handles save errors gracefully', () => {
      // Mock save failure
      cy.intercept('POST', '/api/stories/1', { 
        statusCode: 500,
        body: { error: 'Save failed' }
      })
      
      cy.mount(<StoryEditorWrapper storyId="1" />)
      
      cy.get('[data-testid="story-title-input"]')
        .clear()
        .type('This will fail to save')
      
      // Should show error state
      cy.get('[data-testid="save-error"]', { timeout: 5000 })
        .should('be.visible')
        .should('contain.text', 'Failed to save changes')
      
      cy.get('[data-testid="retry-save-button"]').should('be.visible')
    })
    
    it('handles network connectivity issues', () => {
      cy.mount(<StoryEditorWrapper storyId="1" />)
      
      // Simulate going offline
      cy.window().then((win) => {
        cy.stub(win.navigator, 'onLine').value(false)
        win.dispatchEvent(new Event('offline'))
      })
      
      cy.get('[data-testid="offline-indicator"]')
        .should('be.visible')
        .should('contain.text', 'Working offline')
      
      // Changes should queue for sync
      cy.get('[data-testid="story-title-input"]')
        .clear()
        .type('Offline changes')
      
      cy.get('[data-testid="sync-pending"]')
        .should('contain.text', 'Changes will sync when online')
    })
  })
  
  describe('Performance', () => {
    it('handles auto-save efficiently', () => {
      cy.mount(<StoryEditorWrapper storyId="1" />)
      
      const startTime = performance.now()
      
      // Make rapid changes
      for (let i = 0; i < 10; i++) {
        cy.get('[data-testid="story-content-editor"]')
          .type(`Change ${i}. `)
      }
      
      // Should debounce save operations
      cy.get('[data-testid="save-indicator"]', { timeout: 3000 })
        .should('contain.text', 'Saved')
      
      cy.then(() => {
        const endTime = performance.now()
        expect(endTime - startTime).to.be.lessThan(5000)
      })
    })
  })
})
```

#### CI/CD for React Native

**GitHub Actions Workflow:**

```yaml
# .github/workflows/react-native-cypress.yml
name: React Native Cypress Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  cypress-tests:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          npm ci
          # Install React Native Web dependencies
          npm install react-native-web react-dom
      
      - name: Build React Native Web
        run: |
          npm run build:web
        env:
          NODE_ENV: production
      
      - name: Start React Native Web server
        run: |
          npm run web:serve &
          npx wait-on http://localhost:3002
        env:
          PORT: 3002
      
      - name: Run Cypress component tests
        uses: cypress-io/github-action@v6
        with:
          command: npm run cypress:run:component
          browser: chrome
          record: true
          parallel: true
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Run Cypress E2E tests
        uses: cypress-io/github-action@v6
        with:
          command: npm run cypress:run:e2e
          wait-on: 'http://localhost:3002'
          wait-on-timeout: 120
          browser: chrome
          record: true
          parallel: true
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          CYPRESS_baseUrl: http://localhost:3002
      
      - name: Upload screenshots
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots
      
      - name: Upload videos
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: cypress-videos
          path: cypress/videos

  mobile-build-test:
    runs-on: macos-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup iOS
        run: |
          cd ios
          pod install
      
      - name: Build iOS for testing
        run: |
          npx react-native build-ios --mode Debug
      
      - name: Run iOS unit tests
        run: |
          xcodebuild test -workspace ios/FantasyWritingApp.xcworkspace \
            -scheme FantasyWritingApp -destination 'platform=iOS Simulator,name=iPhone 14'

  android-build-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Android for testing
        run: |
          cd android
          ./gradlew assembleDebug
      
      - name: Run Android unit tests
        run: |
          cd android
          ./gradlew test
```

**Build Configuration:**

```javascript
// webpack.prod.config.js - Production build for CI
const path = require('path')

module.exports = {
  mode: 'production',
  entry: './index.web.js',
  
  output: {
    path: path.resolve(__dirname, 'web-build'),
    filename: 'bundle.[contenthash].js',
    publicPath: '/',
  },
  
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: [
              'react-native-web/babel',
            ],
          },
        },
      },
    ],
  },
  
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
    },
    extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.jsx', '.ts', '.tsx'],
  },
  
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
}
```

**Test Execution Strategies:**

```json
{
  "scripts": {
    "test:cypress:component": "cypress run --component --browser chrome",
    "test:cypress:e2e": "cypress run --e2e --browser chrome",
    "test:cypress:mobile": "cypress run --config viewportWidth=375,viewportHeight=812",
    "test:cypress:tablet": "cypress run --config viewportWidth=768,viewportHeight=1024",
    "test:cypress:desktop": "cypress run --config viewportWidth=1024,viewportHeight=768",
    "test:ci": "npm run test:cypress:component && npm run test:cypress:e2e",
    "test:cross-platform": "npm run test:cypress:mobile && npm run test:cypress:tablet && npm run test:cypress:desktop"
  }
}
```

**Platform-Specific CI Setup:**

```yaml
# Platform matrix testing
strategy:
  matrix:
    viewport: [mobile, tablet, desktop]
    browser: [chrome, firefox, edge]
    
steps:
  - name: Run tests for ${{ matrix.viewport }} on ${{ matrix.browser }}
    run: |
      npm run test:cypress:${{ matrix.viewport }}
    env:
      CYPRESS_browser: ${{ matrix.browser }}
```

**Artifact Management:**

```yaml
# Store test artifacts
- name: Archive test results
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: test-results-${{ matrix.viewport }}-${{ matrix.browser }}
    path: |
      cypress/screenshots
      cypress/videos
      cypress/reports
    retention-days: 30

- name: Publish test report
  uses: dorny/test-reporter@v1
  if: success() || failure()
  with:
    name: Cypress Tests - ${{ matrix.viewport }}
    path: cypress/reports/junit.xml
    reporter: java-junit
```

---

## Installation & Setup

### cypress.config.js

#### Standard Configuration
```javascript
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    
    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    // Test isolation
    testIsolation: true,
    
    // Retries
    retries: {
      runMode: 2,
      openMode: 0,
    },
    
    setupNodeEvents(on, config) {
      // Node event listeners
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
      })
    },
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
  
  // Environment variables
  env: {
    apiUrl: 'http://localhost:3001',
    auth_username: 'testuser',
    auth_password: 'testpass',
  },
})
```

#### React Native Configuration
```javascript
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3002', // Different port for React Native Web
    viewportWidth: 375,  // iPhone width for mobile-first testing
    viewportHeight: 812, // iPhone height
    video: false,
    screenshotOnRunFailure: true,
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // React Native specific timeouts (mobile can be slower)
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    
    setupNodeEvents(on, config) {
      // React Native specific tasks
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
        
        // Reset React Native AsyncStorage
        clearAsyncStorage() {
          // Implementation to clear AsyncStorage for tests
          return null
        },
      })
    },
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig: {
        resolve: {
          alias: {
            'react-native$': 'react-native-web',
            'react-native/Libraries/EventEmitter/NativeEventEmitter$': 
              'react-native-web/dist/vendor/react-native/NativeEventEmitter',
          },
          extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.jsx', '.ts', '.tsx'],
        },
        module: {
          rules: [
            {
              test: /\.(js|jsx|ts|tsx)$/,
              exclude: /node_modules/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
                  plugins: ['react-native-web/babel'],
                },
              },
            },
          ],
        },
      },
    },
    
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.js',
    
    // Mobile-first viewport settings
    viewportWidth: 375,
    viewportHeight: 812,
    
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser = {}, launchOptions) => {
        // React Native debugging flags
        if (browser.name === 'chrome') {
          launchOptions.args.push('--disable-web-security')
        }
        return launchOptions
      })
    },
  },
  
  // Environment variables
  env: {
    apiUrl: 'http://localhost:3001',
    auth_username: 'testuser',
    auth_password: 'testpass',
    platform: 'web', // Useful for platform-specific test logic
  },
})
```

### Environment Variables
```javascript
// Access in tests
const apiUrl = Cypress.env('apiUrl')
const username = Cypress.env('auth_username')

// Override via CLI
// cypress run --env apiUrl=http://staging.example.com
```

---

## Common Patterns

### Authentication

#### Standard Web Authentication
```javascript
// Using cy.session() for efficient auth
Cypress.Commands.add('login', (username = 'testuser', password = 'testpass') => {
  cy.session(
    [username, password],
    () => {
      cy.visit('/login')
      cy.get('[data-cy="username"]').type(username)
      cy.get('[data-cy="password"]').type(password)
      cy.get('[data-cy="submit"]').click()
      cy.url().should('include', '/dashboard')
    },
    {
      validate() {
        cy.getCookie('auth-token').should('exist')
      },
    }
  )
})

// Usage
beforeEach(() => {
  cy.login()
  cy.visit('/protected-page')
})
```

#### React Native Authentication
```javascript
// Mock AsyncStorage for React Native authentication
Cypress.Commands.add('loginReactNative', (username = 'testuser', password = 'testpass') => {
  cy.session(
    [username, password],
    () => {
      // Mock AsyncStorage for authentication state
      cy.mockAsyncStorage({
        'auth-token': 'mock-jwt-token',
        'user-data': JSON.stringify({ 
          id: '1', 
          username, 
          email: `${username}@example.com` 
        })
      })

      cy.visit('/')
      
      // Should redirect to authenticated state
      cy.get('[data-testid="user-welcome"]', { timeout: 10000 })
        .should('contain.text', `Welcome, ${username}`)
    },
    {
      validate() {
        // Validate AsyncStorage contains auth token
        cy.window().then((win) => {
          expect(win.AsyncStorage.getItem('auth-token')).to.not.be.null
        })
      },
    }
  )
})

// Usage
beforeEach(() => {
  cy.loginReactNative()
  cy.visit('/stories') // Navigate to protected screen
})

// Custom command for AsyncStorage mocking
Cypress.Commands.add('mockAsyncStorage', (data = {}) => {
  cy.window().then((win) => {
    const storage = { ...data }
    
    win.AsyncStorage = {
      getItem: cy.stub().callsFake((key) => Promise.resolve(storage[key] || null)),
      setItem: cy.stub().callsFake((key, value) => {
        storage[key] = value
        return Promise.resolve()
      }),
      removeItem: cy.stub().callsFake((key) => {
        delete storage[key]
        return Promise.resolve()
      }),
      clear: cy.stub().callsFake(() => {
        Object.keys(storage).forEach(key => delete storage[key])
        return Promise.resolve()
      }),
    }
  })
})
```

### API Testing
```javascript
describe('API Tests', () => {
  it('creates a new user', () => {
    cy.request({
      method: 'POST',
      url: '/api/users',
      body: {
        name: 'Jane Doe',
        email: 'jane@example.com',
      },
    }).then((response) => {
      expect(response.status).to.eq(201)
      expect(response.body).to.have.property('id')
      expect(response.body.name).to.eq('Jane Doe')
    })
  })

  it('handles errors correctly', () => {
    cy.request({
      method: 'POST',
      url: '/api/users',
      body: { name: '' }, // Invalid data
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.error).to.include('Name is required')
    })
  })
})
```

### File Upload
```javascript
it('uploads a file', () => {
  cy.visit('/upload')
  
  cy.get('[data-cy="file-input"]').selectFile('cypress/fixtures/image.png')
  
  // Or drag and drop
  cy.get('[data-cy="drop-zone"]').selectFile('cypress/fixtures/document.pdf', {
    action: 'drag-drop'
  })
  
  cy.get('[data-cy="upload-button"]').click()
  cy.get('[data-cy="success-message"]').should('be.visible')
})
```

### React Native Specific Commands

#### Touch Gestures
```javascript
// Custom commands for React Native gestures
Cypress.Commands.add('swipe', { prevSubject: 'element' }, (subject, direction) => {
  const startPosition = direction === 'left' ? 'right' : 'left'
  const endPosition = direction
  
  cy.wrap(subject)
    .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
    .trigger('touchmove', { touches: [{ clientX: 200, clientY: 100 }] })
    .trigger('touchend')
})

Cypress.Commands.add('longPress', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject)
    .trigger('touchstart')
    .wait(1000) // Long press duration
    .trigger('touchend')
})

// Usage
cy.get('[data-testid="story-card"]').swipe('left')
cy.get('[data-testid="menu-button"]').longPress()
```

#### React Native Navigation
```javascript
// Mock React Navigation
Cypress.Commands.add('mockNavigation', () => {
  cy.window().then((win) => {
    win.ReactNavigation = {
      navigate: cy.stub().as('navigate'),
      goBack: cy.stub().as('goBack'),
      reset: cy.stub().as('reset'),
    }
  })
})

// Usage
beforeEach(() => {
  cy.mockNavigation()
})

it('navigates correctly', () => {
  cy.get('[data-testid="go-to-story"]').click()
  cy.get('@navigate').should('have.been.calledWith', 'Story', { id: '123' })
})
```

#### State Management Testing
```javascript
// Reset Zustand store state
Cypress.Commands.add('resetStoryStore', () => {
  cy.window().then((win) => {
    if (win.useStoryStore) {
      win.useStoryStore.setState({
        stories: [],
        currentStory: null,
      })
    }
  })
})

// Mock store with test data
Cypress.Commands.add('seedStoryStore', (stories) => {
  cy.window().then((win) => {
    if (win.useStoryStore) {
      win.useStoryStore.setState({
        stories,
        currentStory: stories[0] || null,
      })
    }
  })
})

// Usage
beforeEach(() => {
  cy.resetStoryStore()
})

it('displays stories from store', () => {
  const testStories = [
    { id: '1', title: 'Test Story', wordCount: 100 }
  ]
  
  cy.seedStoryStore(testStories)
  cy.visit('/')
  
  cy.get('[data-testid="story-card"]').should('have.length', 1)
})
```

#### Responsive Design Testing
```javascript
// Test across React Native viewports
Cypress.Commands.add('testResponsive', (callback) => {
  const viewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'iPad Pro', width: 1024, height: 1366 },
  ]
  
  viewports.forEach((viewport) => {
    cy.viewport(viewport.width, viewport.height)
    cy.log(`Testing on ${viewport.name}: ${viewport.width}x${viewport.height}`)
    callback(viewport)
  })
})

// Usage
cy.testResponsive((viewport) => {
  cy.visit('/')
  cy.get('[data-testid="main-content"]').should('be.visible')
  
  if (viewport.width >= 768) {
    cy.get('[data-testid="sidebar"]').should('be.visible')
  } else {
    cy.get('[data-testid="mobile-menu"]').should('be.visible')
  }
})
```

### Accessibility Testing
```javascript
// Install cypress-axe
// npm install --save-dev cypress-axe

// In support/commands.js
import 'cypress-axe'

// In tests
describe('Accessibility', () => {
  it('has no detectable a11y violations', () => {
    cy.visit('/')
    cy.injectAxe()
    
    // Check entire page
    cy.checkA11y()
    
    // Check specific element
    cy.checkA11y('[data-cy="main-content"]')
    
    // Exclude certain rules
    cy.checkA11y(null, {
      rules: {
        'color-contrast': { enabled: false }
      }
    })
  })
})
```

### Visual Testing
```javascript
// Using Percy (install @percy/cypress)
it('visual regression test', () => {
  cy.visit('/home')
  cy.percySnapshot('Homepage')
  
  // Open modal
  cy.get('[data-cy="open-modal"]').click()
  cy.percySnapshot('Homepage with modal')
})

// Using built-in screenshots
it('captures screenshots', () => {
  cy.visit('/dashboard')
  cy.screenshot('dashboard-full')
  
  cy.get('[data-cy="chart"]').screenshot('chart-only')
})
```

---

## Anti-Patterns to Avoid

### ❌ Don't Share State Between Tests
```javascript
// Bad
let sharedUser

it('creates user', () => {
  // Creates and stores user
  sharedUser = createUser()
})

it('updates user', () => {
  // Uses shared user - fragile!
  updateUser(sharedUser)
})
```

### ❌ Don't Use After Hooks for Cleanup
```javascript
// Bad
afterEach(() => {
  cy.task('db:cleanup') // Might not run if test fails
})

// Good
beforeEach(() => {
  cy.task('db:reset') // Always runs before test
})
```

### ❌ Don't Test External Services
```javascript
// Bad
it('logs in via Google', () => {
  cy.visit('/login')
  cy.get('[data-cy="google-login"]').click()
  // Trying to interact with Google's auth page - won't work!
})

// Good
it('logs in programmatically', () => {
  cy.request('POST', '/api/auth/test-login', {
    provider: 'google',
    testUser: true
  })
})
```

### ❌ Don't Use Brittle Selectors
```javascript
// Bad
cy.get('.btn.btn-lg.btn-primary:nth-child(2)')
cy.get('#__next > div > div.container > button')
cy.contains('Submit') // Text might change

// Good
cy.get('[data-cy="submit-button"]')
cy.get('[data-testid="form-submit"]')
```

### ❌ Don't Use Fixed Waits
```javascript
// Bad
cy.wait(5000) // Arbitrary wait

// Good
cy.intercept('GET', '/api/data').as('getData')
cy.wait('@getData')
// or
cy.get('[data-cy="spinner"]').should('not.exist')
```

---

## Debugging Tips

### Using debugger
```javascript
it('debug test', () => {
  cy.visit('/page')
  cy.get('[data-cy="button"]').then(($el) => {
    debugger // Pause here in DevTools
  })
})
```

### Using cy.pause()
```javascript
it('pause test', () => {
  cy.visit('/page')
  cy.get('[data-cy="input"]').type('text')
  cy.pause() // Pause test execution
  cy.get('[data-cy="submit"]').click()
})
```

### Using cy.debug()
```javascript
cy.get('[data-cy="element"]')
  .debug() // Logs element info to console
  .click()
```

### Console Logging
```javascript
cy.get('[data-cy="element"]').then(($el) => {
  console.log('Element:', $el)
  cy.log('Element text:', $el.text()) // Logs to Command Log
})
```

---

## Continuous Integration

### GitHub Actions Example
```yaml
# .github/workflows/cypress.yml
name: Cypress Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start application
        run: npm start &
        env:
          CI: true
      
      - name: Run Cypress tests
        uses: cypress-io/github-action@v5
        with:
          wait-on: 'http://localhost:3000'
          wait-on-timeout: 120
          browser: chrome
          record: true
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Resources

- [Official Cypress Documentation](https://docs.cypress.io)
- [Cypress Real World App](https://github.com/cypress-io/cypress-realworld-app)
- [Cypress Examples](https://github.com/cypress-io/cypress-example-recipes)
- [Cypress Discord Community](https://discord.gg/cypress)

---

This reference guide covers the essential aspects of Cypress testing. For specific use cases or advanced topics, refer to the official documentation.
# Cypress Configuration Reference

*Source: https://docs.cypress.io/app/references/configuration*

## Overview

Cypress can be configured via a configuration file (`cypress.config.js` or `cypress.config.ts`), environment variables, command line arguments, or plugin code. This document provides a comprehensive reference for all configuration options.

---

## Configuration File Structure

### Basic Configuration

```javascript
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  // Global configuration options
  e2e: {
    // E2E specific options
  },
  component: {
    // Component testing specific options
  }
})
```

### TypeScript Configuration

```typescript
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
})
```

---

## Global Configuration Options

### Core Settings

| Option | Default | Description |
|--------|---------|-------------|
| `clientCertificates` | `[]` | An array of client certificates to use for browser requests |
| `env` | `{}` | Any values to be set as environment variables |
| `includeShadowDom` | `false` | Whether to traverse shadow DOM boundaries when querying for elements |
| `numTestsKeptInMemory` | `0/50` | The number of tests for which snapshots and command data are kept in memory |
| `port` | `null` | Port used to host Cypress. Normally this is a randomly generated port |
| `redirectionLimit` | `20` | The number of times that the application under test can redirect before erroring |
| `reporter` | `spec` | The reporter used during `cypress run` |
| `reporterOptions` | `null` | Options used by the specified reporter |
| `retries` | `{ runMode: 0, openMode: 0 }` | The number of times to retry a failing test |
| `watchForFileChanges` | `true` | Whether Cypress will watch and restart tests on test file changes |

### Timeouts

| Option | Default (ms) | Description |
|--------|-------------|-------------|
| `defaultCommandTimeout` | `4000` | Time to wait for DOM based commands before timing out |
| `execTimeout` | `60000` | Time to wait for `cy.exec()` to finish executing |
| `taskTimeout` | `60000` | Time to wait for `cy.task()` to finish executing |
| `pageLoadTimeout` | `60000` | Time to wait for page transition events |
| `requestTimeout` | `5000` | Time to wait for HTTP requests |
| `responseTimeout` | `30000` | Time to wait for a response to cy.request() |

### Browser Settings

| Option | Default | Description |
|--------|---------|-------------|
| `chromeWebSecurity` | `true` | Enable Chromium-based browser's Web Security for same-origin policy |
| `blockHosts` | `null` | A String or Array of hosts that should be blocked from traffic |
| `userAgent` | `null` | Enables you to override the default user agent |
| `modifyObstructiveCode` | `true` | Whether Cypress will search for and replace obstructive code |

### Viewport

| Option | Default | Description |
|--------|---------|-------------|
| `viewportHeight` | `660` | Default height in pixels for the viewport |
| `viewportWidth` | `1000` | Default width in pixels for the viewport |

### Screenshots & Videos

| Option | Default | Description |
|--------|---------|-------------|
| `screenshotsFolder` | `cypress/screenshots` | Path to folder where screenshots will be saved |
| `screenshotOnRunFailure` | `true` | Whether to take a screenshot on test failure |
| `trashAssetsBeforeRuns` | `true` | Whether to trash assets within screenshotsFolder and videosFolder before runs |
| `video` | `false` | Whether to capture video of the test run |
| `videoCompression` | `false` | The quality setting for video compression (0-51) |
| `videosFolder` | `cypress/videos` | Path to folder where videos will be saved |

### Animation & Scrolling

| Option | Default | Description |
|--------|---------|-------------|
| `animationDistanceThreshold` | `5` | Distance in pixels an element must exceed to be considered animating |
| `waitForAnimations` | `true` | Whether to wait for elements to finish animating before executing commands |
| `scrollBehavior` | `top` | Viewport position where element should be scrolled before executing commands |

---

## E2E Testing Configuration

### E2E Specific Options

```javascript
module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    testIsolation: true,
    experimentalRunAllSpecs: false,
    experimentalOriginDependencies: false,
    slowTestThreshold: 10000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    }
  }
})
```

| Option | Default | Description |
|--------|---------|-------------|
| `baseUrl` | `null` | URL used as prefix for `cy.visit()` or `cy.request()` |
| `experimentalRunAllSpecs` | `false` | Enables the "Run All Specs" UI feature |
| `experimentalOriginDependencies` | `false` | Enables support for `cy.origin()` dependencies |
| `experimentalWebKitSupport` | `false` | Enables support for WebKit (Safari) browser testing |
| `setupNodeEvents` | `null` | Function for registering node events |
| `slowTestThreshold` | `10000` (10s) | Time in ms to consider a test "slow" |
| `specPattern` | `cypress/e2e/**/*.cy.{js,jsx,ts,tsx}` | Glob pattern for finding E2E test files |
| `supportFile` | `cypress/support/e2e.{js,jsx,ts,tsx}` | Path to file loaded before test files |
| `testIsolation` | `true` | Ensures clean browser context between tests |

### Node Events Setup

```javascript
setupNodeEvents(on, config) {
  // Task plugin
  on('task', {
    log(message) {
      console.log(message)
      return null
    }
  })

  // File preprocessing
  on('file:preprocessor', webpackPreprocessor)

  // Before/After run
  on('before:run', (details) => {
    console.log('Running tests:', details)
  })

  on('after:run', (results) => {
    console.log('Tests complete:', results)
  })

  // Modify config
  config.baseUrl = process.env.BASE_URL || config.baseUrl
  return config
}
```

---

## Component Testing Configuration

### Component Specific Options

```javascript
module.exports = defineConfig({
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig: require('./webpack.config.js')
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.js',
    indexHtmlFile: 'cypress/support/component-index.html'
  }
})
```

| Option | Default | Description |
|--------|---------|-------------|
| `devServer` | `null` | Dev server configuration for component testing |
| `indexHtmlFile` | `cypress/support/component-index.html` | HTML file for mounting components |
| `specPattern` | `**/*.cy.{js,jsx,ts,tsx}` | Glob pattern for component test files |
| `supportFile` | `cypress/support/component.{js,jsx,ts,tsx}` | Path to file loaded before component tests |

### Dev Server Configuration Examples

#### React with Webpack

```javascript
component: {
  devServer: {
    framework: 'react',
    bundler: 'webpack',
    webpackConfig: require('./webpack.config.js')
  }
}
```

#### Vue with Vite

```javascript
component: {
  devServer: {
    framework: 'vue',
    bundler: 'vite'
  }
}
```

---

## Folders and Files Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `downloadsFolder` | `cypress/downloads` | Path to folder for downloads during test run |
| `fileServerFolder` | Root project folder | Path to folder where files are served |
| `fixturesFolder` | `cypress/fixtures` | Path to folder containing fixture files |
| `integrationFolder` | *(deprecated)* | Use `specPattern` instead |
| `pluginsFile` | *(deprecated)* | Use `setupNodeEvents` instead |
| `supportFolder` | `cypress/support` | Path to folder containing support files |

---

## Environment-Specific Configuration

### Using Environment Variables

```javascript
// cypress.config.js
module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    env: {
      apiUrl: process.env.API_URL,
      auth_username: process.env.AUTH_USERNAME,
      auth_password: process.env.AUTH_PASSWORD
    }
  }
})
```

### Multiple Configuration Files

```javascript
// cypress.config.js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Load environment-specific config
      const environmentName = config.env.environmentName || 'local'
      const environmentFilename = `./cypress/config/${environmentName}.json`
      const environmentConfig = require(environmentFilename)

      return { ...config, ...environmentConfig }
    }
  }
})
```

### Configuration Precedence

Configuration values are resolved in the following order (highest to lowest priority):

1. Command Line Arguments
2. Environment Variables
3. `cypress.env.json`
4. `cypress.config.js`
5. Default values

---

## Advanced Configuration Examples

### Complete E2E Configuration

```javascript
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  // Global options
  viewportWidth: 1920,
  viewportHeight: 1080,
  video: true,
  videoCompression: 32,
  screenshotOnRunFailure: true,
  trashAssetsBeforeRuns: true,

  // Timeouts
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  responseTimeout: 10000,

  // Environment variables
  env: {
    apiUrl: 'http://localhost:3001',
    coverage: true
  },

  // Retries
  retries: {
    runMode: 2,
    openMode: 0
  },

  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/tests/**/*.spec.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    testIsolation: true,

    setupNodeEvents(on, config) {
      // Code coverage
      require('@cypress/code-coverage/task')(on, config)

      // Custom tasks
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
        seedDatabase() {
          // Database seeding logic
          return null
        }
      })

      return config
    }
  }
})
```

### Component Testing with Custom Webpack

```javascript
const { defineConfig } = require('cypress')
const webpackConfig = require('./webpack.config.js')

module.exports = defineConfig({
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig: {
        ...webpackConfig,
        mode: 'development',
        devtool: 'eval-source-map'
      }
    },
    specPattern: 'src/**/*.spec.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.js'
  }
})
```

### Multi-Environment Configuration

```javascript
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      const environment = config.env.environment || 'development'

      const urls = {
        development: 'http://localhost:3000',
        staging: 'https://staging.example.com',
        production: 'https://example.com'
      }

      config.baseUrl = urls[environment]

      // Different test patterns per environment
      if (environment === 'production') {
        config.specPattern = 'cypress/e2e/smoke/**/*.cy.js'
      }

      return config
    }
  }
})
```

---

## Configuration Tips & Best Practices

### 1. Use `defineConfig()` for Type Safety

Always wrap your configuration with `defineConfig()` for IntelliSense support:

```javascript
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  // Your config here - with autocomplete!
})
```

### 2. Organize Configuration by Environment

Create separate config files for different environments:

```
cypress/
  config/
    local.json
    staging.json
    production.json
```

### 3. Use Environment Variables for Sensitive Data

Never commit sensitive data. Use environment variables:

```javascript
env: {
  apiKey: process.env.CYPRESS_API_KEY,
  password: process.env.CYPRESS_PASSWORD
}
```

### 4. Configure Retries Appropriately

Different retry strategies for CI vs local development:

```javascript
retries: {
  runMode: 2,    // CI/CD pipeline
  openMode: 0    // Local development
}
```

### 5. Optimize Video Settings for CI

Balance file size vs quality:

```javascript
video: true,
videoCompression: 32,  // 0-51 (lower = better quality)
```

---

## Common Configuration Patterns

### Mobile Testing Configuration

```javascript
module.exports = defineConfig({
  viewportWidth: 375,
  viewportHeight: 667,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
  e2e: {
    baseUrl: 'http://localhost:3000'
  }
})
```

### API Testing Configuration

```javascript
module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001/api',
    specPattern: 'cypress/api/**/*.cy.{js,ts}',
    supportFile: 'cypress/support/api.js'
  }
})
```

### Cross-Browser Testing

```javascript
module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Browser-specific configuration
      if (config.browser.name === 'chrome') {
        config.chromeWebSecurity = false
      }

      if (config.browser.name === 'firefox') {
        config.firefoxGcInterval = {
          runMode: 1,
          openMode: null
        }
      }

      return config
    }
  }
})
```

---

## Debugging Configuration Issues

### View Resolved Configuration

```bash
# Print resolved configuration
cypress info

# Open Cypress with debug output
DEBUG=cypress:* cypress open
```

### Common Issues and Solutions

1. **Configuration not loading**: Ensure file is named `cypress.config.js` or `cypress.config.ts`
2. **TypeScript config errors**: Install `@types/node` and ensure `tsconfig.json` is configured
3. **Environment variables not working**: Check variable names start with `CYPRESS_` or are explicitly passed
4. **Paths not resolving**: Use `path.resolve()` for absolute paths

---

## Additional Resources

- [Configuration API](https://docs.cypress.io/api/cypress-api/config)
- [Environment Variables](https://docs.cypress.io/guides/guides/environment-variables)
- [Plugins Guide](https://docs.cypress.io/guides/tooling/plugins-guide)
- [TypeScript Support](https://docs.cypress.io/guides/tooling/typescript-support)

---

*Note: This reference covers Cypress configuration options. Always check the official documentation for the most up-to-date information and newly added features.*
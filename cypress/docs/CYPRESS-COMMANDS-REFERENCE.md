# Cypress Commands Reference

Comprehensive reference for all available Cypress commands in the FantasyWritingApp project.

## Quick Start Commands

### Most Common
```bash
# Component tests (recommended - most reliable)
npm run test:component:electron

# E2E tests
npm run test:e2e

# Open Cypress UI for interactive testing
npm run test:component:open
```

## Component Testing Commands

### Standard Component Tests
```bash
# Run all component tests with Chrome (headless)
npm run test:component

# Run all component tests with Electron (most reliable)
npm run test:component:electron

# Open component tests in interactive mode
npm run test:component:open
```

### Parallel Component Tests
```bash
# Run component tests in parallel (requires Cypress Dashboard)
npm run test:component:parallel
```

### Direct Cypress Component Commands
```bash
# Run all component tests with Chrome
npx cypress run --component --browser chrome --headless

# Run all component tests with Electron
npx cypress run --component --browser electron --headless

# Run specific component test file
npx cypress run --component --spec "cypress/component/elements/ElementCard.cy.tsx"

# Run component tests with specific browser
npx cypress run --component --browser firefox --headless

# Open component tests interactively
npx cypress open --component
```

## E2E Testing Commands

### Standard E2E Tests
```bash
# Run all E2E tests (starts web server automatically)
npm run test:e2e

# Open E2E tests in interactive mode
npm run test:e2e:open
```

### Parallel E2E Tests
```bash
# Run E2E tests in parallel (requires Cypress Dashboard)
npm run test:e2e:parallel
```

### Direct Cypress E2E Commands
```bash
# Run all E2E tests with Chrome
npx cypress run --browser chrome --headless

# Run all E2E tests with Electron
npx cypress run --browser electron --headless

# Run specific E2E test file
npx cypress run --spec "cypress/e2e/auth/login.cy.ts"

# Run E2E tests with custom baseUrl
npx cypress run --config baseUrl=http://localhost:3001

# Open E2E tests interactively
npx cypress open
```

## Combined Testing Commands

### Run All Tests
```bash
# Run both component and E2E tests sequentially
npm run test:all

# Run both component and E2E tests in parallel (requires Cypress Dashboard)
npm run test:all:parallel
```

## Browser-Specific Commands

### Chrome Browser
```bash
# Component tests with Chrome
npx cypress run --component --browser chrome --headless
npx cypress open --component --browser chrome

# E2E tests with Chrome
npx cypress run --browser chrome --headless
npx cypress open --browser chrome
```

### Electron Browser (Most Reliable)
```bash
# Component tests with Electron
npx cypress run --component --browser electron --headless
npx cypress open --component --browser electron

# E2E tests with Electron
npx cypress run --browser electron --headless
npx cypress open --browser electron
```

### Firefox Browser
```bash
# Component tests with Firefox
npx cypress run --component --browser firefox --headless
npx cypress open --component --browser firefox

# E2E tests with Firefox
npx cypress run --browser firefox --headless
npx cypress open --browser firefox
```

### Edge Browser
```bash
# Component tests with Edge
npx cypress run --component --browser edge --headless
npx cypress open --component --browser edge

# E2E tests with Edge
npx cypress run --browser edge --headless
npx cypress open --browser edge
```

## Maintenance Commands

### Cleanup Commands
```bash
# Clean up processes and ports before running tests
npm run pre-test:cleanup

# Reset Chrome browser for Cypress (fixes CDP issues)
npm run chrome:reset

# Complete fix: reset Chrome + run component tests
npm run test:fix
```

### Manual Cleanup
```bash
# Kill processes on port 3003
lsof -ti :3003 | xargs kill -9

# Kill all Chrome processes
pkill -f "Google Chrome"

# Kill webpack processes
pkill -f webpack

# Run the Chrome reset script directly
bash scripts/reset-chrome-cypress.sh
```

## Advanced Commands

### Spec Pattern Commands
```bash
# Run tests matching a pattern
npx cypress run --spec "cypress/component/**/*Card*.cy.tsx"
npx cypress run --spec "cypress/e2e/**/*auth*.cy.ts"

# Run multiple specific files
npx cypress run --spec "cypress/component/elements/ElementCard.cy.tsx,cypress/component/forms/ElementForm.cy.tsx"

# Exclude certain specs
npx cypress run --spec "cypress/component/**/*.cy.tsx" --exclude "**/debug/**"
```

### Configuration Override Commands
```bash
# Override viewport size
npx cypress run --config viewportWidth=1920,viewportHeight=1080

# Override default timeout
npx cypress run --config defaultCommandTimeout=10000

# Override video recording
npx cypress run --config video=true

# Override screenshots
npx cypress run --config screenshotOnRunFailure=false

# Multiple config overrides
npx cypress run --config "baseUrl=http://localhost:3001,video=true,screenshotOnRunFailure=true"
```

### Environment Variable Commands
```bash
# Set environment variables
npx cypress run --env MOCK_AUTH_ENABLED=false
npx cypress run --env TEST_USER_EMAIL=admin@test.com,TEST_USER_PASSWORD=admin123

# Component tests with environment variables
npx cypress run --component --env IS_REACT_NATIVE_WEB=true,PLATFORM=web
```

### Debug and Development Commands
```bash
# Run with debug output
DEBUG=cypress:* npx cypress run --component

# Open dev tools automatically
npx cypress open --component --browser chrome --headed

# Run tests with custom user agent
npx cypress run --browser chrome --headed --config "userAgent=CustomTestAgent/1.0"

# Run with network stubbing disabled
npx cypress run --config "experimentalNetworkStubbing=false"
```

### Recording and Reporting Commands
```bash
# Record test runs (requires Cypress Dashboard key)
npx cypress run --record --key your-dashboard-key

# Record with custom run name
npx cypress run --record --key your-dashboard-key --name "Feature Branch Tests"

# Record with tags
npx cypress run --record --key your-dashboard-key --tag "component,regression"

# Parallel execution with recording
npx cypress run --record --parallel --key your-dashboard-key
```

## Utility Commands

### Information Commands
```bash
# Show Cypress installation info
npx cypress info

# Verify Cypress installation
npx cypress verify

# Show version information
npx cypress version

# Open Cypress cache folder
npx cypress cache path
```

### Cache Management Commands
```bash
# Clear Cypress cache
npx cypress cache clear

# List cached Cypress versions
npx cypress cache list

# Install Cypress (if missing)
npx cypress install
```

## Troubleshooting Commands

### When Tests Won't Start
```bash
# 1. Reset everything
npm run chrome:reset

# 2. Try with Electron instead of Chrome
npm run test:component:electron

# 3. Manual cleanup and retry
npm run pre-test:cleanup
npm run test:component

# 4. Check what's using ports
lsof -i :3002
lsof -i :3003

# 5. Force kill all browsers
pkill -f "Google Chrome"
pkill -f "firefox"
pkill -f "electron"
```

### When Chrome Won't Connect
```bash
# Reset Chrome profiles and cache
npm run chrome:reset

# Use Electron instead (most reliable)
npm run test:component:electron

# Try Firefox as alternative
npx cypress run --component --browser firefox --headless

# Run with additional Chrome flags
npx cypress run --component --browser chrome --headed --config "chromeWebSecurity=false"
```

### Debug Test Failures
```bash
# Run single test file with debug output
DEBUG=cypress:* npx cypress run --spec "cypress/component/elements/ElementCard.cy.tsx"

# Open test in headed mode to see browser
npx cypress run --component --browser chrome --headed --no-exit

# Run with video recording enabled
npx cypress run --config video=true,videosFolder=cypress/videos

# Capture screenshots on failure
npx cypress run --config screenshotOnRunFailure=true,screenshotsFolder=cypress/screenshots
```

## Project-Specific Commands

### With Start-Server-and-Test
```bash
# Start web server and run E2E tests
start-server-and-test web http://localhost:3002 "cypress run --browser chrome --headless"

# Start on different port
start-server-and-test "PORT=3001 npm run web" http://localhost:3001 "cypress run"
```

### React Native Web Specific
```bash
# Component tests with RN Web environment
npx cypress run --component --env IS_REACT_NATIVE_WEB=true,PLATFORM=web,TOUCH_EVENTS_ENABLED=true

# Mobile viewport testing
npx cypress run --component --config viewportWidth=375,viewportHeight=812

# Test with mobile user agent
npx cypress run --component --config "userAgent=Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)"
```

## Command Combinations

### Complete Test Suite
```bash
# Run everything with maximum reliability
npm run chrome:reset && npm run test:component:electron && npm run test:e2e
```

### Development Workflow
```bash
# Quick component test cycle
npm run pre-test:cleanup && npx cypress open --component --browser electron
```

### CI/CD Pipeline
```bash
# Headless, reliable, with recording
npm run pre-test:cleanup && npx cypress run --component --browser electron --record --parallel
```

---

## Notes

- **Electron browser** is most reliable for headless testing
- **Chrome browser** works well in interactive mode but may have CDP issues in headless
- Always run `npm run pre-test:cleanup` if you encounter port conflicts
- Use `npm run chrome:reset` if Chrome won't connect to DevTools Protocol
- Component tests run on port 3003, E2E tests use port 3002
- All test commands automatically clean up processes before running

For more detailed information, see the other documentation files in `/cypress/docs/`.
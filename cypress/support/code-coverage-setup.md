# Code Coverage Setup for Cypress

## Installation Requirements

To enable code coverage, you need to install the following packages:

```bash
# Fix npm cache permissions first (if needed):
sudo chown -R $(whoami) ~/.npm

# Install code coverage packages:
npm install --save-dev @cypress/code-coverage babel-plugin-istanbul nyc
```

## Configuration Files

### 1. NYC Configuration (.nycrc.json)
✅ Already created with:
- 80% line coverage requirement
- 75% branch coverage requirement
- 80% function coverage requirement
- HTML, text, and LCOV reporters
- Proper exclusions for test files

### 2. Babel Configuration
Add to your babel.config.js or .babelrc:

```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Only add istanbul plugin in test environment
    process.env.NODE_ENV === 'test' && [
      'babel-plugin-istanbul',
      {
        exclude: ['**/*.cy.{js,jsx,ts,tsx}', '**/*.test.{js,jsx,ts,tsx}']
      }
    ]
  ].filter(Boolean)
};
```

### 3. Cypress Configuration
Add to cypress.config.ts:

```typescript
import { defineConfig } from 'cypress';
import codeCoverageTask from '@cypress/code-coverage/task';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Implement code coverage
      codeCoverageTask(on, config);

      // ... other configurations
      return config;
    }
  },
  component: {
    setupNodeEvents(on, config) {
      // Implement code coverage for component tests
      codeCoverageTask(on, config);

      return config;
    }
  }
});
```

### 4. Cypress Support File
Add to cypress/support/e2e.ts and cypress/support/component.ts:

```typescript
// Import code coverage support
import '@cypress/code-coverage/support';

// ... rest of your support file
```

## Usage

### Running Tests with Coverage

```bash
# Run all tests with coverage
npm run cypress:run

# Open Cypress UI with coverage
npm run cypress:open

# Generate coverage report after tests
npx nyc report
```

### Viewing Coverage Reports

After running tests, coverage reports will be available at:
- HTML Report: `coverage/index.html`
- Console Summary: Run `npx nyc report --reporter=text`
- LCOV Report: `coverage/lcov.info` (for CI integration)

### Package.json Scripts

Add these scripts to package.json:

```json
{
  "scripts": {
    "test:coverage": "cypress run && nyc report",
    "coverage:report": "nyc report --reporter=html --reporter=text",
    "coverage:check": "nyc check-coverage"
  }
}
```

## Coverage Thresholds

Current thresholds configured in .nycrc.json:
- **Lines**: 80% (warning at <80%, error at <70%)
- **Statements**: 80%
- **Functions**: 80%
- **Branches**: 75%

## Best Practices

1. **Incremental Coverage**: Focus on critical paths first
2. **Component Coverage**: Prioritize high-value components
3. **Integration Coverage**: Ensure E2E tests cover user journeys
4. **Regular Monitoring**: Check coverage trends in CI/CD

## Troubleshooting

### Issue: Coverage not collecting
- Ensure babel-plugin-istanbul is configured
- Check that @cypress/code-coverage/support is imported
- Verify NODE_ENV is set correctly

### Issue: Low coverage numbers
- Check exclusion patterns in .nycrc.json
- Ensure all source files are instrumented
- Verify tests are actually executing code paths

### Issue: Performance degradation
- Coverage instrumentation adds overhead
- Consider running coverage only in CI
- Use `--no-coverage` flag for local development

## CI/CD Integration

For GitHub Actions:

```yaml
- name: Run Cypress tests with coverage
  run: npm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
    flags: cypress
```

## Next Steps

1. Install required npm packages (see Installation Requirements above)
2. Update babel and cypress configurations
3. Run tests with coverage enabled
4. Review initial coverage report
5. Set up CI/CD integration
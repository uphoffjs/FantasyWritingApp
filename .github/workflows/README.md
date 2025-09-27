# CI/CD Configuration Guide

## Overview

This directory contains GitHub Actions workflows for continuous integration and deployment of the FantasyWritingApp. The CI/CD pipeline ensures code quality through automated testing, linting, and deployment processes.

## Workflows

### 1. Cypress E2E Tests (`cypress-e2e.yml`)

**Purpose**: Runs end-to-end tests using Cypress to validate user journeys.

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

**Features**:
- ✅ Parallel test execution (4 containers)
- ✅ Test recording to Cypress Cloud
- ✅ Artifact storage (screenshots, videos)
- ✅ Automatic PR comments with results
- ✅ Failure notifications

**Required Secrets**:
- `CYPRESS_RECORD_KEY`: For Cypress Cloud recording
- `TEST_API_URL`: Test environment API endpoint
- `SLACK_WEBHOOK_URL`: (Optional) For Slack notifications

### 2. Jest Unit Tests (`jest-unit-tests.yml`)

**Purpose**: Runs unit tests with Jest and React Native Testing Library.

**Triggers**:
- Push to `main`, `develop`, or `feature/**` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

**Features**:
- ✅ Coverage reporting with thresholds
- ✅ Multi-platform testing (Ubuntu, macOS, Windows)
- ✅ Node.js version matrix (16, 18, 20)
- ✅ Codecov integration
- ✅ PR comments with coverage stats

**Coverage Thresholds**:
- Lines: 80%
- Branches: 75%
- Functions: 80%
- Statements: 80%

## Setup Instructions

### 1. Cypress Cloud Setup

1. Create account at [Cypress Cloud](https://cloud.cypress.io)
2. Get your project's `recordKey`
3. Add to GitHub Secrets:
   ```
   CYPRESS_RECORD_KEY=your-record-key-here
   ```

### 2. Codecov Setup

1. Create account at [Codecov](https://codecov.io)
2. Add repository
3. Get upload token
4. Add to GitHub Secrets:
   ```
   CODECOV_TOKEN=your-codecov-token
   ```

### 3. Slack Notifications (Optional)

1. Create Slack webhook URL
2. Add to GitHub Secrets:
   ```
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
   ```

### 4. Required npm Scripts

Ensure `package.json` has these scripts:

```json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint src --ext .ts,.tsx,.js,.jsx",
    "build:web": "webpack --mode production",
    "web": "webpack serve --port 3002",
    "cypress:run": "cypress run",
    "cypress:open": "cypress open"
  }
}
```

## Local Testing

### Run Workflows Locally with Act

Install [act](https://github.com/nektos/act) to test workflows locally:

```bash
# Install act
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash  # Linux

# Run specific workflow
act -W .github/workflows/cypress-e2e.yml

# Run with secrets
act -W .github/workflows/cypress-e2e.yml -s CYPRESS_RECORD_KEY=xxx

# Run specific job
act -j cypress-run -W .github/workflows/cypress-e2e.yml
```

### Test Scripts Locally

```bash
# Run E2E tests
npm run cypress:run

# Run unit tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## Workflow Triggers

### Automatic Triggers

| Event | Cypress E2E | Jest Unit | Deployment |
|-------|-------------|-----------|------------|
| Push to main | ✅ | ✅ | ✅ |
| Push to develop | ✅ | ✅ | ❌ |
| Push to feature/* | ❌ | ✅ | ❌ |
| Pull Request | ✅ | ✅ | ❌ |
| Schedule (daily) | ✅ | ❌ | ❌ |

### Manual Triggers

All workflows can be triggered manually via GitHub Actions UI:

1. Go to Actions tab
2. Select workflow
3. Click "Run workflow"
4. Choose branch and parameters

## Artifacts

### Cypress E2E Artifacts

- **Screenshots**: Captured on test failure
- **Videos**: Always captured for debugging
- **Test Reports**: HTML reports with results

Location: `Actions → Workflow Run → Artifacts`

### Jest Coverage Artifacts

- **Coverage Report**: HTML coverage report
- **lcov.info**: Coverage data file
- **Test Results**: JUnit XML reports

## Performance Optimization

### Parallel Execution

Cypress tests run in 4 parallel containers to reduce execution time:

```yaml
strategy:
  matrix:
    containers: [1, 2, 3, 4]
```

### Caching

The workflows use caching to speed up builds:

1. **Node modules cache**: Based on `package-lock.json`
2. **Cypress binary cache**: Stores Cypress installation
3. **Build artifacts**: Shared between jobs

### Resource Limits

- **Timeout**: 30 minutes per job
- **Parallel jobs**: 4 for E2E, 9 for unit tests (3 OS × 3 Node versions)
- **Retention**: Artifacts kept for 90 days

## Troubleshooting

### Common Issues

#### 1. Cypress Tests Failing in CI but Passing Locally

**Cause**: Different environment or timing issues

**Solution**:
- Increase timeouts: `cy.wait('@api', { timeout: 10000 })`
- Check environment variables
- Use `cypress run --headed` locally to match CI

#### 2. Coverage Thresholds Not Met

**Cause**: New code without tests

**Solution**:
- Add tests for new code
- Temporarily adjust thresholds (not recommended)
- Use `/* istanbul ignore next */` for untestable code

#### 3. Workflow Not Triggering

**Cause**: Branch protection or path filters

**Solution**:
- Check branch protection rules
- Verify workflow triggers match your branch
- Check if paths filter is excluding your changes

### Debug Mode

Enable debug logging in workflows:

```yaml
env:
  ACTIONS_RUNNER_DEBUG: true
  ACTIONS_STEP_DEBUG: true
```

Or for Cypress:

```yaml
env:
  DEBUG: cypress:*
```

## Best Practices

1. **Keep workflows DRY**: Use composite actions for repeated steps
2. **Fail fast**: Set `fail-fast: false` only when needed
3. **Use concurrency**: Limit concurrent workflow runs
4. **Secret management**: Never hardcode secrets
5. **Artifact cleanup**: Set retention policies

## Monitoring

### GitHub Status Checks

Required status checks for PR merge:

- ✅ Cypress E2E Tests
- ✅ Jest Unit Tests (80% coverage)
- ✅ Linting
- ✅ TypeScript Check

### Metrics to Track

1. **Test execution time**: Target < 10 minutes
2. **Test flakiness**: Target < 1%
3. **Coverage trends**: Should increase over time
4. **Failure rate**: Track and investigate patterns

## Contributing

When adding new workflows:

1. Follow naming convention: `{tool}-{purpose}.yml`
2. Add documentation to this README
3. Include error handling and notifications
4. Test locally with `act`
5. Add required secrets to repository settings

## Security

### Secret Scanning

GitHub automatically scans for exposed secrets. Additionally:

1. Use environment-specific secrets
2. Rotate secrets regularly
3. Limit secret access to required workflows
4. Audit secret usage in Security tab

### Dependency Updates

Dependabot configured to update:
- GitHub Actions versions
- npm dependencies
- Docker base images

## Support

For CI/CD issues:

1. Check workflow run logs
2. Review this documentation
3. Search existing issues
4. Create new issue with:
   - Workflow name
   - Error message
   - Steps to reproduce
   - Expected behavior

---

Last Updated: 2025-09-27
Maintained by: DevOps Team
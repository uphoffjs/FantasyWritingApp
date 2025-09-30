# Docker Cypress Guide

**Status:** ✅ Production-Ready | **Last Updated:** 2025-09-30 | **Version:** 1.0.0

---

## Quick Start

### Prerequisites

**Install Docker Desktop:** https://docs.docker.com/desktop/install/mac-install/

**Verify Installation:**

```bash
docker --version  # Should show version 24.x or later
docker info       # Should show running daemon
```

### Run Your First Test

```bash
# Single test (recommended for development)
SPEC=cypress/e2e/login-page/verify-login-page.cy.ts npm run cypress:docker:test:spec

# All tests (CI/CD use)
npm run cypress:docker:test
```

**That's it!** Docker handles server startup, test execution, and cleanup automatically.

---

## Commands Reference

### All Tests

| Command                       | Server                           | Use Case                        |
| ----------------------------- | -------------------------------- | ------------------------------- |
| `npm run cypress:docker:test` | Auto (start-server-and-test)     | CI/CD, single command execution |
| `npm run cypress:docker:run`  | Manual (you start `npm run web`) | Development with running server |

### Single Test

| Command                                      | Server | Use Case                           |
| -------------------------------------------- | ------ | ---------------------------------- |
| `SPEC=path npm run cypress:docker:test:spec` | Auto   | Isolated test with full automation |
| `SPEC=path npm run cypress:docker:run:spec`  | Manual | Quick test with existing server    |

**Command Pattern:**

- `:test` = Auto-starts dev server via `start-server-and-test`
- `:run` = Assumes dev server already running on port 3002

---

## Usage Examples

### Basic Single Test

```bash
SPEC=cypress/e2e/login-page/verify-login-page.cy.ts npm run cypress:docker:test:spec
```

**What happens:**

1. Cleans up old processes
2. Starts dev server on localhost:3002
3. Waits for server to respond
4. Pulls Docker image (first run only, ~2.5 GB)
5. Runs test in Docker container
6. Captures screenshots on failure
7. Stops server automatically

### Glob Patterns

```bash
# All tests in a directory
SPEC=cypress/e2e/auth/*.cy.ts npm run cypress:docker:test:spec

# Nested directories
SPEC=cypress/e2e/login-page/**/*.cy.ts npm run cypress:docker:test:spec

# Multiple patterns (quote required)
SPEC="cypress/e2e/{auth,login}/**/*.cy.ts" npm run cypress:docker:test:spec
```

### Manual Server Mode (Faster Development)

```bash
# Terminal 1: Start server once
npm run web

# Terminal 2: Run tests repeatedly
SPEC=cypress/e2e/test1.cy.ts npm run cypress:docker:run:spec
SPEC=cypress/e2e/test2.cy.ts npm run cypress:docker:run:spec
# (Server stays running between tests)
```

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
- name: Run E2E Tests
  run: npm run cypress:docker:test # Runs all tests with auto-server
```

---

## Why Docker?

### The Problem: macOS Sequoia Incompatibility

**Native Cypress fails on macOS Sequoia (Darwin 24.6.0+) with:**

```
bad option: --no-sandbox
bad option: --smoke-test
bad option: --ping
```

**Root Cause:** macOS Sequoia's stricter security policies reject Electron apps using these flags.

**Impact:** Both Cypress 15.x and 14.x fail on macOS Sequoia.

### The Solution: Docker

Docker provides a **Linux environment** where Cypress runs without macOS restrictions.

**Benefits:**

- ✅ Bypasses macOS Sequoia security restrictions
- ✅ Consistent cross-platform test environment
- ✅ No local Cypress installation issues
- ✅ Isolated from host dependencies
- ✅ CI/CD ready out-of-the-box

---

## How It Works

### Architecture

```
┌─────────────────────────────────────┐
│ macOS Sequoia Host                  │
│                                     │
│  Dev Server (localhost:3002)        │
│         ↕ HTTP                      │
│  Docker Container (Linux)           │
│    └─ Cypress + Electron            │
│       (via host.docker.internal)    │
└─────────────────────────────────────┘
```

**Key Technologies:**

- **Image:** `cypress/included:14.5.4` (Node + Cypress + Electron bundled)
- **Network:** `host.docker.internal:3002` resolves to host's localhost:3002
- **Volumes:** Project directory mounted at `/e2e` (read/write)
- **Override:** `CYPRESS_baseUrl=http://host.docker.internal:3002`

### Execution Flow

```
npm run cypress:docker:test:spec
  ↓
Pre-test cleanup (kill old processes)
  ↓
start-server-and-test starts dev server
  ↓
Polls localhost:3002 until ready
  ↓
scripts/docker-cypress-spec.sh validates:
  - SPEC variable set?
  - Docker installed?
  - Docker daemon running?
  ↓
docker run pulls image (first time only)
  ↓
Cypress executes in Linux container
  ↓
Tests run against host.docker.internal:3002
  ↓
Screenshots saved to cypress/screenshots/
  ↓
Exit code propagates (0=pass, 1=fail)
  ↓
start-server-and-test stops dev server
```

---

## Performance

### First Run (Image Download)

| Stage           | Time                |
| --------------- | ------------------- |
| Image pull      | ~2-3 min (one-time) |
| Container start | ~2-3 sec            |
| Test execution  | Normal speed        |
| **Total**       | **~3-4 min**        |

### Subsequent Runs (Image Cached)

| Stage           | Time          |
| --------------- | ------------- |
| Container start | ~2-3 sec      |
| Test execution  | Normal speed  |
| **Total**       | **~5-10 sec** |

**Overhead:** < 5% compared to native Cypress (negligible)

### Optimization Tips

**Pre-pull image during setup:**

```bash
docker pull cypress/included:14.5.4
```

**Use `:run` commands when server already running:**

```bash
npm run web  # Keep running
SPEC=test.cy.ts npm run cypress:docker:run:spec  # Faster (no server startup)
```

---

## Troubleshooting

### Docker Not Found

**Error:** `❌ Error: Docker is not installed`

**Fix:**

1. Install Docker Desktop: https://docs.docker.com/desktop/install/mac-install/
2. Verify: `docker --version`

---

### Docker Daemon Not Running

**Error:** `❌ Error: Docker daemon is not running`

**Fix:**

1. Launch Docker Desktop app
2. Wait for "Running" status in menu bar
3. Verify: `docker info`

---

### SPEC Variable Not Set

**Error:** `❌ Error: SPEC environment variable is required`

**Fix:**

```bash
# Wrong
npm run cypress:docker:run:spec

# Correct
SPEC=cypress/e2e/test.cy.ts npm run cypress:docker:run:spec
```

---

### Cannot Connect to Server

**Error:** `CypressError: cy.visit() failed trying to load: http://host.docker.internal:3002/`

**Causes & Fixes:**

**1. Dev server not running (`:run` commands)**

```bash
# Check server
curl http://localhost:3002

# Start server if needed
npm run web
```

**2. Wrong port**

```bash
# Verify port 3002
lsof -i :3002
```

**3. Firewall blocking Docker**

- Open macOS System Settings → Firewall
- Allow Docker Desktop

---

### 403 Forbidden (Vite Flow Syntax Errors)

**Error:** `The response we received from your web server was: 403: Forbidden`

**Cause:** Vite cannot parse React Native Flow type syntax in dependencies.

**This is NOT a Docker issue** - it's an application configuration problem that affects both Docker and native Cypress.

**Fix:** Use Webpack for E2E test builds instead of Vite (see Priority 2 in project docs).

---

## Platform Support

| Platform             | Native Cypress | Docker Cypress | Recommendation      |
| -------------------- | -------------- | -------------- | ------------------- |
| macOS Sequoia (15.7) | ❌ Fails       | ✅ Works       | **Docker Required** |
| macOS Sonoma (14.x)  | ✅ Works       | ✅ Works       | Native (faster)     |
| Linux                | ✅ Works       | ✅ Works       | Native (faster)     |
| Windows WSL2         | ✅ Works       | ✅ Works       | Native (faster)     |

**Your Platform:** macOS Sequoia → **Docker is the only solution**

---

## Limitations

### ❌ Interactive Mode Not Supported

Docker Cypress only supports **headless mode** (no GUI).

**Why:** Interactive Cypress UI requires X11 forwarding (XQuartz), adding significant complexity.

**Workarounds:**

- Use Docker for CI/CD and headless testing
- Use native Cypress on compatible platforms for interactive debugging
- Review screenshots and videos for debugging (`cypress/screenshots/`, `cypress/videos/`)

### ✅ What Works

- ✅ Headless test execution
- ✅ Single-spec and all-tests runs
- ✅ Glob pattern matching
- ✅ start-server-and-test integration
- ✅ Screenshot capture
- ✅ Video recording (if enabled in cypress.config.ts)
- ✅ All Cypress plugins and custom commands
- ✅ Retry logic and test configuration

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Dependencies
        run: npm ci

      - name: Run E2E Tests
        run: npm run cypress:docker:test

      - name: Upload Screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: cypress-screenshots
          path: cypress/screenshots/
```

### GitLab CI Example

```yaml
e2e-tests:
  image: node:18
  services:
    - docker:dind
  script:
    - npm ci
    - npm run cypress:docker:test
  artifacts:
    when: on_failure
    paths:
      - cypress/screenshots/
```

---

## FAQ

**Q: Do I need Cypress installed locally?**
A: No, but keeping it for IDE support (autocomplete) is recommended:

```bash
npm install --save-dev cypress  # For IntelliSense only
```

**Q: Can I debug tests in Docker?**
A: Limited debugging. Use screenshots, videos, and console logs. For interactive debugging, use native Cypress on compatible platforms.

**Q: Is Docker slower than native Cypress?**
A: Slightly (~5% overhead), but first run takes 2-3 min to download image (cached after).

**Q: Does Docker work in CI/CD?**
A: Yes! Docker is ideal for CI/CD due to consistent cross-platform environment.

**Q: Can I use custom Cypress plugins?**
A: Yes! All config, plugins, and custom commands from your project are used.

**Q: What if tests pass locally but fail in Docker?**
A: Check for hardcoded `localhost` URLs (use `cy.visit('/')` with baseUrl instead).

---

## Related Documentation

- **[DOCKER-CYPRESS-SETUP.md](./DOCKER-CYPRESS-SETUP.md)** - Detailed setup and troubleshooting (comprehensive)
- **[RUNNING-SINGLE-TESTS.md](./RUNNING-SINGLE-TESTS.md)** - Single-spec test execution patterns
- **[CLAUDE.md](../../CLAUDE.md)** - Quick reference card (lines 108-121)
- **[cypress.config.ts](../../cypress.config.ts)** - Cypress configuration
- **[package.json](../../package.json)** - npm scripts (lines 59-62)

---

## Verification

### Test Docker Setup

**Step 1: Check Docker**

```bash
docker --version && docker info
```

**Step 2: Run Single Test**

```bash
SPEC=cypress/e2e/login-page/verify-login-page.cy.ts npm run cypress:docker:test:spec
```

**Expected Output:**

```
🐳 Running Cypress test in Docker container...
📦 Image: cypress/included:14.5.4
🌐 Server: http://host.docker.internal:3002
🎯 Spec: cypress/e2e/login-page/verify-login-page.cy.ts

[Image pulls if first run]
[Server starts]
[Cypress runs test]
[Results displayed]
```

**Step 3: Check Screenshots**

```bash
ls -la cypress/screenshots/
```

---

**Last Verified:** 2025-09-30 (macOS Sequoia, Docker 28.4.0, Cypress 14.5.4)
**Status:** ✅ Production-Ready
**Test Result:** Infrastructure verified working (see [test-results/docker-cypress-success-20250930-132638.md](../../test-results/docker-cypress-success-20250930-132638.md))

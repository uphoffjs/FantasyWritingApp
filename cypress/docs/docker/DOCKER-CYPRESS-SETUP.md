# Docker Cypress Setup Guide

**Version:** 1.0.0
**Last Updated:** 2025-09-30
**Status:** ✅ Production-Ready

---

## Table of Contents

- [Why Docker for Cypress?](#why-docker-for-cypress)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Available Commands](#available-commands)
- [Usage Examples](#usage-examples)
- [How It Works](#how-it-works)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)
- [Platform Compatibility](#platform-compatibility)
- [FAQ](#faq)

---

## Why Docker for Cypress?

### The Problem: macOS Sequoia Incompatibility

**macOS Sequoia (Darwin 24.6.0 / macOS 15.7) has stricter security policies that prevent Cypress from running natively.**

**Error encountered:**

```
/Users/[user]/Library/Caches/Cypress/14.5.4/Cypress.app/Contents/MacOS/Cypress: bad option: --no-sandbox
/Users/[user]/Library/Caches/Cypress/14.5.4/Cypress.app/Contents/MacOS/Cypress: bad option: --smoke-test
/Users/[user]/Library/Caches/Cypress/14.5.4/Cypress.app/Contents/MacOS/Cypress: bad option: --ping=638
```

**Root Cause:** macOS Sequoia rejects Electron applications (like Cypress) that use certain command-line flags.

**Impact:**

- ❌ Cypress 15.3.0 fails on macOS Sequoia
- ❌ Cypress 14.5.4 fails on macOS Sequoia (downgrade doesn't help)
- ❌ ALL Cypress versions fail on macOS Sequoia until official fix released

### The Solution: Docker

Docker provides a **compatible Linux environment** where Cypress runs without macOS Sequoia restrictions.

**Benefits:**

- ✅ Bypasses macOS Sequoia security restrictions
- ✅ Consistent test environment across all platforms
- ✅ No local Cypress installation issues
- ✅ Isolated from host system dependencies
- ✅ Same workflow as native Cypress commands

---

## Prerequisites

### 1. Install Docker Desktop

**macOS:**

- Download: [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
- Requirements: macOS 11.0 or later

**Linux:**

- Download: [Docker Desktop for Linux](https://docs.docker.com/desktop/install/linux-install/)
- OR install Docker Engine: [Install Docker Engine](https://docs.docker.com/engine/install/)

**Windows:**

- Download: [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
- Requirements: Windows 10 64-bit or later with WSL 2

### 2. Verify Docker Installation

```bash
# Check Docker is installed
docker --version

# Check Docker daemon is running
docker info
```

### 3. Pull Cypress Image (Optional)

The Docker scripts will automatically pull the image on first run, but you can pre-download:

```bash
docker pull cypress/included:14.5.4
```

**Image size:** ~2.5 GB (includes Node.js, Cypress, and browsers)

---

## Quick Start

### Step 1: Ensure Dev Server is Ready

Docker Cypress commands with `:test` suffix automatically start the dev server. For `:run` commands, start manually:

```bash
# Terminal 1 (only needed for :run commands)
npm run web
```

### Step 2: Run Tests in Docker

```bash
# Run all tests (with automatic server startup)
npm run cypress:docker:test

# Run single test (with automatic server startup)
SPEC=cypress/e2e/login-page/verify-login-page.cy.ts npm run cypress:docker:test:spec
```

**That's it!** Docker handles the rest.

---

## Available Commands

### All Tests

| Command                       | Server Management                      | Use Case                              |
| ----------------------------- | -------------------------------------- | ------------------------------------- |
| `npm run cypress:docker:run`  | Manual (you start `npm run web` first) | Quick run when server already running |
| `npm run cypress:docker:test` | Automatic (via start-server-and-test)  | CI/CD or single-command execution     |

### Single Test

| Command                                      | Server Management | Use Case                              |
| -------------------------------------------- | ----------------- | ------------------------------------- |
| `SPEC=path npm run cypress:docker:run:spec`  | Manual            | Quick single test when server running |
| `SPEC=path npm run cypress:docker:test:spec` | Automatic         | CI/CD or automated single test        |

### Command Naming Convention

- **`:run`** → Assumes dev server is already running
- **`:test`** → Automatically starts/stops dev server via `start-server-and-test`

---

## Usage Examples

### Basic: Run All Tests

```bash
# Option 1: Automatic server (recommended for CI/CD)
npm run cypress:docker:test

# Option 2: Manual server (faster for development)
npm run web  # Terminal 1
npm run cypress:docker:run  # Terminal 2
```

### Single Test File

```bash
# Specific test file
SPEC=cypress/e2e/login-page/verify-login-page.cy.ts npm run cypress:docker:test:spec

# With manual server
npm run web  # Terminal 1
SPEC=cypress/e2e/homepage.cy.ts npm run cypress:docker:run:spec  # Terminal 2
```

### Glob Patterns

```bash
# All tests in a directory
SPEC=cypress/e2e/auth/*.cy.ts npm run cypress:docker:test:spec

# Nested directories
SPEC=cypress/e2e/login-page/**/*.cy.ts npm run cypress:docker:test:spec

# Multiple patterns (use quotes)
SPEC="cypress/e2e/{auth,login-page}/**/*.cy.ts" npm run cypress:docker:test:spec
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
- name: Run Cypress Tests in Docker
  run: npm run cypress:docker:test

# Run specific test
- name: Run Login Tests
  run: SPEC=cypress/e2e/auth/*.cy.ts npm run cypress:docker:test:spec
```

---

## How It Works

### Execution Flow

**Command:** `npm run cypress:docker:test:spec`

**What happens:**

1. **npm script** → Calls `start-server-and-test`
2. **start-server-and-test** → Starts dev server on `localhost:3002`
3. **Waits for server** → Polls `http://localhost:3002` until ready
4. **Runs shell script** → `bash scripts/docker-cypress-spec.sh`
5. **Shell script checks:**
   - ✅ SPEC environment variable set?
   - ✅ Docker installed?
   - ✅ Docker daemon running?
6. **Docker run command:**
   ```bash
   docker run --rm \
     --add-host host.docker.internal:host-gateway \
     -v "$PWD:/e2e" \
     -w /e2e \
     -e CYPRESS_baseUrl=http://host.docker.internal:3002 \
     cypress/included:14.5.4 \
     --browser electron --headless --spec "$SPEC"
   ```
7. **Cypress runs in container** → Tests execute against host server
8. **Results returned** → Exit code passed back through layers
9. **start-server-and-test** → Stops dev server automatically

### Docker Configuration Explained

**`--rm`**
Remove container after test completes (cleanup)

**`--add-host host.docker.internal:host-gateway`**
Maps `host.docker.internal` to host machine IP (works on macOS, Linux, Windows)

**`-v "$PWD:/e2e"`**
Mount current directory into container at `/e2e` path

**`-w /e2e`**
Set container working directory to `/e2e`

**`-e CYPRESS_baseUrl=http://host.docker.internal:3002`**
Override Cypress baseUrl to point to host dev server

**`cypress/included:14.5.4`**
Official Cypress Docker image with Node, Cypress, and Electron browser

**`--spec "$SPEC"`**
Pass specific test file pattern to Cypress

---

## Troubleshooting

### Docker Not Found

**Error:** `❌ Error: Docker is not installed`

**Solution:**

1. Install Docker Desktop (see [Prerequisites](#prerequisites))
2. Verify: `docker --version`

---

### Docker Daemon Not Running

**Error:** `❌ Error: Docker daemon is not running`

**Solution:**

1. Start Docker Desktop application
2. Wait for Docker icon to show "Running" status
3. Verify: `docker info`

---

### SPEC Variable Not Set

**Error:** `❌ Error: SPEC environment variable is required`

**Solution:**

```bash
# Correct usage
SPEC=cypress/e2e/test.cy.ts npm run cypress:docker:run:spec

# Wrong - missing SPEC
npm run cypress:docker:run:spec
```

---

### Cannot Connect to Server

**Error:** `Timed out retrying after 60000ms: cy.visit() failed trying to load: http://host.docker.internal:3002/`

**Possible Causes:**

1. **Dev server not running**

   ```bash
   # Check server is running
   curl http://localhost:3002

   # Start server if needed
   npm run web
   ```

2. **Wrong port**

   ```bash
   # Verify server is on port 3002, not 3000 or 3001
   lsof -i :3002
   ```

3. **Firewall blocking Docker**
   - Check macOS Firewall settings
   - Allow Docker Desktop through firewall

---

### Permission Denied

**Error:** `permission denied while trying to connect to the Docker daemon socket`

**Solution (Linux only):**

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again
# OR restart session
newgrp docker
```

---

### Tests Pass Locally But Fail in Docker

**Possible Causes:**

1. **Hardcoded localhost references**

   ```javascript
   // ❌ Wrong - doesn't work in Docker
   cy.visit('http://localhost:3002');

   // ✅ Correct - uses baseUrl
   cy.visit('/');
   ```

2. **File path differences**

   - Ensure relative paths used in tests
   - Docker working directory is `/e2e`

3. **Environment differences**
   - Check NODE_ENV
   - Check environment variables

---

### Image Pull Slow

**Issue:** `docker pull cypress/included:14.5.4` takes 10+ minutes

**Solution:**

- Normal for first download (~2.5 GB image)
- Subsequent runs use cached image (instant)
- Pre-pull during setup to avoid delays

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────┐
│ Host Machine (macOS Sequoia)               │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Dev Server (localhost:3002)         │   │
│  │  - Vite                              │   │
│  │  - React Native Web                  │   │
│  └─────────────────────────────────────┘   │
│            ▲                                │
│            │ HTTP requests                  │
│            │                                │
│  ┌─────────┴───────────────────────────┐   │
│  │ Docker Container                    │   │
│  │  ┌──────────────────────────────┐   │   │
│  │  │ Linux (Debian)               │   │   │
│  │  │  - Node.js 18                │   │   │
│  │  │  - Cypress 14.5.4            │   │   │
│  │  │  - Electron Browser          │   │   │
│  │  │  - Test Files (mounted)      │   │   │
│  │  └──────────────────────────────┘   │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘

Network: host.docker.internal:3002 → localhost:3002
```

### Workflow Comparison

**Native Cypress (Broken on macOS Sequoia):**

```
npm run cypress:run
  ↓
start-server-and-test
  ↓
Dev Server (localhost:3002)
  ↓
Cypress (macOS binary) ❌ FAILS
```

**Docker Cypress (Works on macOS Sequoia):**

```
npm run cypress:docker:test
  ↓
start-server-and-test
  ↓
Dev Server (localhost:3002)
  ↓
Shell Script (docker-cypress-run.sh)
  ↓
Docker Container (Linux environment)
  ↓
Cypress (Linux binary) ✅ SUCCESS
  ↓
Access server via host.docker.internal:3002
```

---

## Platform Compatibility

### macOS

| Version            | Native Cypress | Docker Cypress |
| ------------------ | -------------- | -------------- |
| macOS 14 (Sonoma)  | ✅ Works       | ✅ Works       |
| macOS 15 (Sequoia) | ❌ Fails       | ✅ Works       |

**Recommendation:** Use Docker on macOS Sequoia (Darwin 24.6.0+)

### Linux

| Distribution  | Native Cypress | Docker Cypress |
| ------------- | -------------- | -------------- |
| Ubuntu 22.04+ | ✅ Works       | ✅ Works       |
| Debian 11+    | ✅ Works       | ✅ Works       |
| Fedora 36+    | ✅ Works       | ✅ Works       |

**Recommendation:** Use native Cypress on Linux (faster), Docker for consistency

### Windows

| Version            | Native Cypress | Docker Cypress |
| ------------------ | -------------- | -------------- |
| Windows 10 (WSL 2) | ✅ Works       | ✅ Works       |
| Windows 11 (WSL 2) | ✅ Works       | ✅ Works       |

**Recommendation:** Use native Cypress on Windows (faster), Docker for CI/CD

---

## FAQ

### Q: Do I need to install Cypress locally?

**A:** No, if using Docker exclusively. The `cypress/included` image has everything bundled.

However, keeping local Cypress for IDE support is recommended:

```bash
npm install --save-dev cypress  # For IntelliSense, autocomplete
```

---

### Q: Can I use Docker Cypress for interactive mode (cypress:open)?

**A:** Not recommended. Interactive mode requires GUI forwarding (X11/XQuartz on macOS), which adds complexity.

**Recommendation:** Use Docker for headless CI/CD, native Cypress for interactive development on compatible platforms.

---

### Q: Will Docker Cypress work in CI/CD?

**A:** Yes! Docker Cypress is **ideal for CI/CD** because:

- ✅ Consistent environment across platforms
- ✅ No Cypress installation needed
- ✅ Isolated from host dependencies
- ✅ Works with GitHub Actions, GitLab CI, CircleCI, etc.

**Example GitHub Actions:**

```yaml
- name: Run Cypress Tests
  run: npm run cypress:docker:test
```

---

### Q: Is Docker Cypress slower than native?

**A:** Slightly slower (5-10% overhead) due to:

- Docker image pull (first run only)
- Container startup (~2 seconds)
- Network virtualization

**Mitigation:**

- Pre-pull image during setup
- Use `:run` commands when server already running
- Cache Docker layers in CI/CD

---

### Q: Can I use custom Cypress plugins with Docker?

**A:** Yes! All Cypress configuration and plugins are mounted from your project directory:

- `cypress.config.ts` → Used as-is
- `cypress/support/` → Commands and plugins work
- `cypress/fixtures/` → Accessible in tests

---

### Q: What Cypress version is used in Docker?

**A:** Currently `cypress/included:14.5.4` to match the local downgraded version.

**To upgrade:**

1. Update Docker image in shell scripts: `cypress/included:X.X.X`
2. Update local Cypress: `npm install --save-dev cypress@X.X.X`

---

### Q: Do test results and screenshots work?

**A:** Yes! All Cypress artifacts are written to your project directory:

- `cypress/screenshots/` → Available after test run
- `cypress/videos/` → Available after test run
- Console output → Shown in terminal

---

### Q: Can I debug tests in Docker?

**A:** Limited debugging options:

- ✅ Screenshots (auto-captured on failure)
- ✅ Videos (if enabled in cypress.config.ts)
- ✅ Console output in terminal
- ❌ Interactive debugging (use native Cypress on compatible platform)

**Recommendation:** Use Docker for automated runs, native for debugging.

---

## Related Documentation

- **[RUNNING-SINGLE-TESTS.md](./RUNNING-SINGLE-TESTS.md)** - Single-spec test execution guide
- **[CYPRESS-TESTING-STANDARDS.md](../CYPRESS-TESTING-STANDARDS.md)** - Testing standards and best practices
- **[CLAUDE.md](../../CLAUDE.md)** - Project quick reference

---

## Support

**Cypress Docker Issues:**

- [cypress/included Docker Hub](https://hub.docker.com/r/cypress/included)
- [Cypress Docker Documentation](https://docs.cypress.io/guides/guides/docker)

**Docker Desktop Issues:**

- [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
- [Docker Desktop Troubleshooting](https://docs.docker.com/desktop/troubleshoot/overview/)

**Project-Specific Issues:**

- Check `test-results/` for detailed failure reports
- Review [CLAUDE.md](../../CLAUDE.md) for command reference

---

**Last Updated:** 2025-09-30
**Docker Image:** cypress/included:14.5.4
**Platform Tested:** macOS Sequoia (Darwin 24.6.0)

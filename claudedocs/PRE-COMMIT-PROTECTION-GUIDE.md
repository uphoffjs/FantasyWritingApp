# Pre-Commit Protection System

## Overview

This project implements a comprehensive pre-commit protection system that ensures code quality and prevents unauthorized modifications to critical test files. Every commit is automatically validated through three quality gates before being allowed.

## Quality Gates

### Gate 1: Protected Files Check 🛡️

**Purpose**: Prevents modifications to critical files that must remain stable

**Protected Files**:
- `cypress/e2e/login-page-tests/verify-login-page.cy.ts` - Critical login test
- `scripts/check-protected-files.js` - Protection enforcement script
- `scripts/pre-commit-test.sh` - Pre-commit test runner

**Why These Files Are Protected**:
These files form the foundation of our quality assurance process. The login test verifies core functionality before every commit, and the protection scripts ensure this safety mechanism cannot be bypassed.

**What Happens If Modified**:
If you attempt to commit changes to any protected file, the commit will be blocked with a detailed error message explaining which files are protected and why.

### Gate 2: Lint Checks 🔍

**Purpose**: Ensures code quality and consistency

**What Gets Checked**:
- ESLint rules for JavaScript/TypeScript files
- Import statement validation
- Cypress test import validation
- Prettier formatting for JSON/Markdown files

**Configuration**: See [package.json](../package.json) `lint-staged` section

### Gate 3: Critical Test Suite 🧪

**Purpose**: Verifies that core login functionality works before any commit

**Test Executed**:
- **File**: `cypress/e2e/login-page-tests/verify-login-page.cy.ts`
- **Method**: Docker (as specified in [CLAUDE.md](../CLAUDE.md))
- **Command**: `SPEC=cypress/e2e/login-page-tests/verify-login-page.cy.ts npm run cypress:docker:test:spec`

**Why Docker**:
Docker ensures a consistent, isolated testing environment across all development machines, preventing "works on my machine" issues.

**What Happens If Test Fails**:
The commit is blocked, and you'll see:
1. Detailed test failure output
2. Instructions for debugging
3. Links to relevant documentation

---

## System Architecture

### File Structure

```
.husky/
└── pre-commit                          # Main pre-commit hook
scripts/
├── protected-files.json                # Protected files configuration
├── check-protected-files.js            # Protection enforcement script
└── pre-commit-test.sh                  # Critical test runner
cypress/e2e/login-page-tests/
└── verify-login-page.cy.ts            # Critical login test (PROTECTED)
```

### Execution Flow

```
Developer attempts commit
         ↓
    Gate 1: Protected Files Check
    ├─ Pass → Continue
    └─ Fail → BLOCK COMMIT
         ↓
    Gate 2: Lint Checks
    ├─ Pass → Continue
    └─ Fail → BLOCK COMMIT
         ↓
    Gate 3: Critical Test
    ├─ Pass → ALLOW COMMIT ✅
    └─ Fail → BLOCK COMMIT ❌
```

---

## Usage Guide

### Normal Development Workflow

1. **Make your changes** as usual
2. **Stage your changes**: `git add .`
3. **Attempt commit**: `git commit -m "your message"`
4. **Wait for validation**: All three gates run automatically
5. **Commit succeeds** if all gates pass ✅

### If Protected File Check Fails

**Error Message**:
```
❌ ERROR: Attempt to modify protected files detected!

The following protected files have been modified:

  ❌ cypress/e2e/login-page-tests/verify-login-page.cy.ts
     Reason: Critical pre-commit test - modifications require special approval
```

**Resolution**:
```bash
# Unstage the protected file
git reset HEAD cypress/e2e/login-page-tests/verify-login-page.cy.ts

# Commit your other changes
git commit -m "your message"

# Contact project maintainer for protected file approval
```

### If Lint Check Fails

**Resolution**:
```bash
# Fix automatically where possible
npm run lint

# Or manually fix the reported issues
# Then try committing again
```

### If Critical Test Fails

**Error Message**:
```
❌ Pre-commit test FAILED - commit BLOCKED

🚫 The commit has been blocked because the critical login page test failed.
```

**Resolution Steps**:
1. **Review the test output** to understand the failure
2. **Fix the code** that's causing the test to fail
3. **Test manually**:
   ```bash
   SPEC=cypress/e2e/login-page-tests/verify-login-page.cy.ts npm run cypress:docker:test:spec
   ```
4. **Try committing again** once the test passes

**Debugging Resources**:
- [CYPRESS-COMPLETE-REFERENCE.md](./CYPRESS-COMPLETE-REFERENCE.md) - Complete Cypress guide
- [TEST-RESULTS-MANAGEMENT.md](./TEST-RESULTS-MANAGEMENT.md) - Test failure analysis
- [QUICK-TEST-REFERENCE.md](../cypress/docs/QUICK-TEST-REFERENCE.md) - Quick test guide

---

## Configuration

### Adding New Protected Files

Edit [scripts/protected-files.json](../scripts/protected-files.json):

```json
{
  "protected": [
    {
      "path": "path/to/your/file.ts",
      "reason": "Why this file is protected",
      "allowedModifiers": []
    }
  ]
}
```

### Modifying Protected Files (Emergency Only)

**⚠️ IMPORTANT**: This should only be done with project maintainer approval

**Process**:
1. **Request approval** from project maintainer
2. **Document the reason** for modification
3. **Temporarily disable protection**:
   ```bash
   # Edit .husky/pre-commit and comment out Gate 1
   # OR
   # Use --no-verify flag (NOT RECOMMENDED)
   git commit --no-verify -m "Emergency fix with approval"
   ```
4. **Re-enable protection immediately** after commit
5. **Verify protection** works:
   ```bash
   # Try modifying protected file and committing
   # Should be blocked
   ```

### Disabling Pre-Commit Checks (Not Recommended)

**⚠️ WARNING**: Bypassing these checks removes critical quality assurance

**Only use in genuine emergencies**:
```bash
git commit --no-verify -m "Emergency commit"
```

**When this might be necessary**:
- Production emergency requiring immediate hotfix
- Pre-commit test infrastructure is broken (rare)
- Working in emergency maintenance window

**After using --no-verify**:
1. Verify your commit didn't break anything
2. Run the checks manually:
   ```bash
   node scripts/check-protected-files.js
   npm run lint
   SPEC=cypress/e2e/login-page-tests/verify-login-page.cy.ts npm run cypress:docker:test:spec
   ```

---

## Maintenance

### Monitoring Pre-Commit System Health

**Weekly Check**:
```bash
# Verify protection script works
node scripts/check-protected-files.js

# Verify test script works
bash scripts/pre-commit-test.sh
```

**Monthly Check**:
1. Review protected files list - are they still critical?
2. Check if new files should be protected
3. Verify Docker test still runs in reasonable time
4. Update documentation if process changes

### Troubleshooting

#### Pre-Commit Hook Not Running

**Symptoms**: Commits succeed without any checks

**Solutions**:
```bash
# Reinstall husky hooks
npm run prepare

# Verify .husky/pre-commit exists and is executable
ls -la .husky/pre-commit
chmod +x .husky/pre-commit

# Check git hooks path
git config core.hooksPath
```

#### Protection Check False Positives

**Symptoms**: Protected file check blocks commits even when protected files weren't modified

**Solutions**:
```bash
# Verify which files are actually staged
git diff --cached --name-only

# Check protected-files.json paths are correct
cat scripts/protected-files.json
```

#### Docker Test Hangs or Times Out

**Symptoms**: Pre-commit test never completes

**Solutions**:
1. **Check Docker is running**: `docker ps`
2. **Verify dev server isn't already running**: `lsof -ti :3002`
3. **Check Docker resources**: Ensure Docker has enough memory/CPU
4. **Test manually**: Run the command outside pre-commit hook
5. **Check logs**: See [DOCKER-CYPRESS-GUIDE.md](../cypress/docs/DOCKER-CYPRESS-GUIDE.md)

---

## FAQ

### Why do we run a test on every commit?

Running the critical login test ensures that core functionality isn't accidentally broken. Catching issues at commit time is faster and cheaper than finding them in CI/CD or production.

### Why use Docker for the test?

Docker ensures consistent test execution across all development machines, regardless of local environment differences. This prevents "works on my machine" problems.

### Can I skip the test for minor changes?

No. Even small changes can have unexpected side effects. The test is quick (typically 30-60 seconds) and provides crucial safety.

### What if the test fails but my changes are unrelated?

If the test was passing before your changes and fails after, your changes likely affected something unexpected. Investigate the failure - this is the system working as intended.

If the test was already failing (broken main branch), coordinate with the team to fix it before proceeding.

### Why can't I modify the test file?

The test file is the foundation of our commit quality gate. Allowing modifications could accidentally break or weaken the test, defeating its purpose. Changes require special review.

### How long does the pre-commit process take?

Typical timing:
- Protected file check: < 1 second
- Lint checks: 2-5 seconds
- Critical test: 30-60 seconds
- **Total: ~30-65 seconds**

### What happens in CI/CD?

The CI/CD pipeline runs a more comprehensive test suite. The pre-commit hook is a fast safety check, while CI/CD provides full coverage.

---

## For Claude AI Assistant

### Understanding This System

When working with this codebase:

1. **Never modify protected files** without explicit user approval and documented reason
2. **Never suggest bypassing pre-commit hooks** unless genuine emergency
3. **Always test changes** before committing
4. **If pre-commit fails**, investigate and fix the root cause, don't bypass

### Protected Files - DO NOT MODIFY

These files are protected by the pre-commit system:
- `cypress/e2e/login-page-tests/verify-login-page.cy.ts`
- `scripts/check-protected-files.js`
- `scripts/pre-commit-test.sh`

**If asked to modify these files**:
1. Inform the user they are protected
2. Explain the protection reason
3. Only proceed with explicit approval and documentation

### Pre-Commit Commands - DO NOT MODIFY

The following commands are used by the pre-commit system and must not be changed:
- `SPEC=cypress/e2e/login-page-tests/verify-login-page.cy.ts npm run cypress:docker:test:spec`
- Any command in `scripts/pre-commit-test.sh`
- Any command in `scripts/check-protected-files.js`

### Testing Before Commit

Always run the pre-commit checks manually before attempting to commit:
```bash
# Check protected files
node scripts/check-protected-files.js

# Run lint
npm run lint

# Run critical test
SPEC=cypress/e2e/login-page-tests/verify-login-page.cy.ts npm run cypress:docker:test:spec
```

### If Pre-Commit Fails

1. **Analyze the failure output**
2. **Fix the root cause** (don't bypass)
3. **Test the fix** manually
4. **Try committing again**
5. **Document the issue** if it was non-obvious

### Emergency Bypass Protocol

Only suggest `--no-verify` if:
- User explicitly requests it
- Genuine emergency situation
- User understands the risks
- Plan exists to verify changes afterward

---

## Related Documentation

- [CLAUDE.md](../CLAUDE.md) - Main project guide
- [CYPRESS-COMPLETE-REFERENCE.md](./CYPRESS-COMPLETE-REFERENCE.md) - Cypress testing guide
- [TEST-RESULTS-MANAGEMENT.md](./TEST-RESULTS-MANAGEMENT.md) - Test failure documentation
- [DOCKER-CYPRESS-GUIDE.md](../cypress/docs/DOCKER-CYPRESS-GUIDE.md) - Docker testing setup

---

**Version**: 1.0
**Last Updated**: 2025-10-02
**Maintainer**: Project Team

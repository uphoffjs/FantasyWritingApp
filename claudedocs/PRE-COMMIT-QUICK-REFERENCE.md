# Pre-Commit Protection - Quick Reference

## What Runs on Every Commit

Every commit automatically runs three quality gates:

1. **🛡️ Protected Files Check** - Blocks modification of critical files
2. **🔍 Lint Checks** - Ensures code quality and consistency
3. **🧪 Critical Test** - Runs login page verification test in Docker

**Total Time**: ~30-65 seconds

---

## Protected Files (Cannot Be Modified)

- `cypress/e2e/login-page-tests/verify-login-page.cy.ts` - Critical login test
- `scripts/check-protected-files.js` - Protection script
- `scripts/pre-commit-test.sh` - Test runner script

**To modify these files**: Contact project maintainer for approval

---

## If Your Commit Is Blocked

### Protected File Error

```bash
# Unstage the protected file
git reset HEAD <protected-file>

# Commit other changes
git commit -m "your message"
```

### Lint Error

```bash
# Fix automatically
npm run lint

# Then commit again
```

### Test Failure

```bash
# Fix the code causing the failure
# Test manually to verify
SPEC=cypress/e2e/login-page-tests/verify-login-page.cy.ts npm run cypress:docker:test:spec

# Commit again
```

---

## Manual Pre-Commit Check

Run all checks before committing:

```bash
# Protected files check
node scripts/check-protected-files.js

# Lint check
npm run lint

# Critical test
SPEC=cypress/e2e/login-page-tests/verify-login-page.cy.ts npm run cypress:docker:test:spec
```

---

## Emergency Bypass (Use Sparingly)

**⚠️ Only for genuine emergencies**:

```bash
git commit --no-verify -m "Emergency fix"
```

**After emergency bypass**:
1. Run checks manually (see above)
2. Verify nothing is broken
3. Document why bypass was necessary

---

## For Full Details

See [PRE-COMMIT-PROTECTION-GUIDE.md](./PRE-COMMIT-PROTECTION-GUIDE.md) for:
- Complete system architecture
- Troubleshooting guide
- Configuration details
- FAQ

---

**Quick Help**:
- Protected files: See [protected-files.json](../scripts/protected-files.json)
- Test debugging: [TEST-RESULTS-MANAGEMENT.md](./TEST-RESULTS-MANAGEMENT.md)
- Docker issues: [DOCKER-CYPRESS-GUIDE.md](../cypress/docs/DOCKER-CYPRESS-GUIDE.md)

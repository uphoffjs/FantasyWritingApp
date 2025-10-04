# Docker Cypress Fix Plan - Hardcoded URL Issue

**Created:** 2025-10-01
**Status:** Ready to implement
**Priority:** HIGH - Blocking all Docker Cypress tests

---

## Problem Analysis

### Root Cause Identified ✅

**Issue:** Hardcoded `http://localhost:3002` URLs in test files bypass Cypress `baseUrl` configuration

**Impact:** 17 test failures in Docker environment (tests try to connect to `127.0.0.1:3002` inside container instead of `host.docker.internal:3002`)

**Affected Files:**

1. `cypress/e2e/login-navigation.cy.ts` - 16 occurrences
2. `cypress/e2e/sync/sync-services.cy.ts` - 1 occurrence

### Why This Fails in Docker

```typescript
// ❌ CURRENT (BROKEN in Docker)
cy.visit('http://localhost:3002/login');

// Inside Docker container:
// - localhost = 127.0.0.1 (container's localhost)
// - Server is on host machine at host.docker.internal:3002
// - Connection refused because nothing listening on container's port 3002

// ✅ CORRECT (Works in both native and Docker)
cy.visit('/login');

// Cypress uses baseUrl from config:
// - Native: baseUrl = 'http://localhost:3002' (from cypress.config.ts line 10)
// - Docker: baseUrl = 'http://host.docker.internal:3002' (from CYPRESS_baseUrl env var)
```

### Configuration Verification ✅

**cypress.config.ts (Line 10):**

```typescript
baseUrl: process.env.CYPRESS_baseUrl || 'http://localhost:3002';
```

**scripts/docker-cypress-run.sh (Line 42):**

```bash
-e CYPRESS_baseUrl=http://host.docker.internal:3002
```

**Conclusion:** Configuration is correct. The problem is hardcoded URLs in test files.

---

## Fix Plan

### Step 1: Replace Hardcoded URLs in login-navigation.cy.ts

**File:** `cypress/e2e/login-navigation.cy.ts`
**Occurrences:** 16

**Find:**

```typescript
cy.visit('http://localhost:3002');
cy.visit('http://localhost:3002/login');
cy.visit('http://localhost:3002/dashboard');
cy.visit('http://localhost:3002/profile');
```

**Replace with:**

```typescript
cy.visit('/');
cy.visit('/login');
cy.visit('/dashboard');
cy.visit('/profile');
```

**Implementation:**

```bash
# Automated replacement using sed
sed -i '' "s|cy.visit('http://localhost:3002')|cy.visit('/')|g" cypress/e2e/login-navigation.cy.ts
sed -i '' 's|cy.visit("http://localhost:3002")|cy.visit("/")|g' cypress/e2e/login-navigation.cy.ts
sed -i '' "s|cy.visit('http://localhost:3002/|cy.visit('/|g" cypress/e2e/login-navigation.cy.ts
sed -i '' 's|cy.visit("http://localhost:3002/|cy.visit("/|g' cypress/e2e/login-navigation.cy.ts
```

### Step 2: Replace Hardcoded URL in sync/sync-services.cy.ts

**File:** `cypress/e2e/sync/sync-services.cy.ts`
**Occurrences:** 1

**Find:**

```typescript
cy.visit('http://localhost:3002/app/projects');
```

**Replace with:**

```typescript
cy.visit('/app/projects');
```

**Implementation:**

```bash
sed -i '' "s|cy.visit('http://localhost:3002/|cy.visit('/|g" cypress/e2e/sync/sync-services.cy.ts
```

### Step 3: Verification

**Check for any remaining hardcoded URLs:**

```bash
grep -r "http://localhost:3002" cypress/e2e --include="*.ts" --include="*.js"
# Should return 0 results after fix
```

**Verify replacement correctness:**

```bash
grep -r "cy.visit('/" cypress/e2e/login-navigation.cy.ts
grep -r "cy.visit('/app/projects')" cypress/e2e/sync/sync-services.cy.ts
```

### Step 4: Testing

**Test in native environment:**

```bash
npm run web  # Terminal 1
npm run cypress:open  # Terminal 2
# Manually run login-navigation.cy.ts and sync-services.cy.ts
```

**Test in Docker environment:**

```bash
npm run cypress:docker:test
# Should now connect successfully to host.docker.internal:3002
```

---

## Expected Results After Fix

### Before Fix (Current State)

**Docker Test Results:**

- ❌ 48+ failures due to ECONNREFUSED
- ❌ Tests cannot connect to server
- ✅ 2 passing (tests without hardcoded URLs)

**Error Pattern:**

```
CypressError: cy.visit() failed trying to load:
http://localhost:3002/

Error: connect ECONNREFUSED 127.0.0.1:3002
```

### After Fix (Expected)

**Docker Test Results:**

- ✅ All tests connect to server successfully
- ✅ Tests use host.docker.internal:3002 via baseUrl
- ✅ Pass rate increases significantly (infrastructure issue resolved)

**Success Pattern:**

```
✓ Test connects to http://host.docker.internal:3002/
✓ Page loads successfully
✓ Tests execute normally
```

---

## Implementation Steps

### Quick Fix (5 minutes)

```bash
# 1. Fix login-navigation.cy.ts
sed -i '' "s|cy.visit('http://localhost:3002|cy.visit('|g" cypress/e2e/login-navigation.cy.ts
sed -i '' 's|cy.visit("http://localhost:3002|cy.visit("|g' cypress/e2e/login-navigation.cy.ts

# 2. Fix sync/sync-services.cy.ts
sed -i '' "s|cy.visit('http://localhost:3002|cy.visit('|g" cypress/e2e/sync/sync-services.cy.ts

# 3. Verify
grep -r "http://localhost:3002" cypress/e2e --include="*.ts" --include="*.js"

# 4. Test
npm run cypress:docker:test
```

### Comprehensive Fix Script

Create `scripts/fix-hardcoded-urls.sh`:

```bash
#!/bin/bash

echo "🔧 Fixing hardcoded localhost URLs in Cypress tests..."

# Count occurrences before fix
BEFORE=$(grep -r "http://localhost:3002" cypress/e2e --include="*.ts" --include="*.js" | wc -l)
echo "📊 Found $BEFORE hardcoded URLs"

# Fix login-navigation.cy.ts
echo "📝 Fixing cypress/e2e/login-navigation.cy.ts..."
sed -i '' "s|cy.visit('http://localhost:3002|cy.visit('|g" cypress/e2e/login-navigation.cy.ts
sed -i '' 's|cy.visit("http://localhost:3002|cy.visit("|g' cypress/e2e/login-navigation.cy.ts

# Fix sync/sync-services.cy.ts
echo "📝 Fixing cypress/e2e/sync/sync-services.cy.ts..."
sed -i '' "s|cy.visit('http://localhost:3002|cy.visit('|g" cypress/e2e/sync/sync-services.cy.ts
sed -i '' 's|cy.visit("http://localhost:3002|cy.visit("|g' cypress/e2e/sync/sync-services.cy.ts

# Count occurrences after fix
AFTER=$(grep -r "http://localhost:3002" cypress/e2e --include="*.ts" --include="*.js" | wc -l)

echo ""
echo "✅ Fix complete!"
echo "   Before: $BEFORE hardcoded URLs"
echo "   After:  $AFTER hardcoded URLs"

if [ "$AFTER" -eq 0 ]; then
  echo "🎉 All hardcoded URLs successfully replaced!"
else
  echo "⚠️  Warning: $AFTER URLs still remain. Manual review needed."
  grep -r "http://localhost:3002" cypress/e2e --include="*.ts" --include="*.js"
fi
```

---

## Best Practices Going Forward

### ✅ DO (Correct Pattern)

```typescript
// Use relative URLs with baseUrl
cy.visit('/');
cy.visit('/login');
cy.visit('/dashboard');
cy.visit('/app/projects');

// Cypress automatically prepends baseUrl:
// - Native: http://localhost:3002 + /login = http://localhost:3002/login
// - Docker: http://host.docker.internal:3002 + /login = http://host.docker.internal:3002/login
```

### ❌ DON'T (Anti-pattern)

```typescript
// Never hardcode full URLs
cy.visit('http://localhost:3002'); // ❌ Breaks in Docker
cy.visit('http://localhost:3002/login'); // ❌ Bypasses baseUrl config
cy.visit('http://127.0.0.1:3002/page'); // ❌ Even worse
```

### Exceptions (When Absolute URLs Are Needed)

```typescript
// Testing external sites or different domains
cy.visit('https://example.com'); // ✅ OK - external site

// Testing different ports (rare)
cy.visit('http://localhost:3003'); // ⚠️ Use Cypress.config('baseUrl') instead

// Correct way for dynamic URLs
const baseUrl = Cypress.config('baseUrl');
cy.visit(`${baseUrl}/login`); // ✅ Uses config, works everywhere
```

---

## Validation Checklist

### Pre-Fix Validation

- [x] Identified root cause (hardcoded localhost URLs)
- [x] Confirmed cypress.config.ts is correct
- [x] Confirmed docker script is correct
- [x] Listed all affected files (2 files, 17 occurrences)
- [x] Created fix script

### Post-Fix Validation

- [ ] Run grep to verify 0 hardcoded URLs remain
- [ ] Lint tests pass (`npm run lint`)
- [ ] TypeScript compilation passes (`npx tsc --noEmit`)
- [ ] Native Cypress tests pass (`npm run cypress:run`)
- [ ] Docker Cypress tests pass (`npm run cypress:docker:test`)
- [ ] No new failures introduced
- [ ] Git commit with fix

---

## Additional Recommendations

### 1. Add ESLint Rule (Future)

Prevent hardcoded URLs from being added in future:

```javascript
// .eslintrc.js
rules: {
  'no-restricted-syntax': [
    'error',
    {
      selector: "CallExpression[callee.object.name='cy'][callee.property.name='visit'] > Literal[value=/^http:\\/\\/(localhost|127\\.0\\.0\\.1)/]",
      message: "Don't use hardcoded localhost URLs. Use relative paths with baseUrl instead."
    }
  ]
}
```

### 2. Documentation Update

Update CLAUDE.md to include:

```markdown
## Cypress URL Best Practices

**✅ DO:** Use relative URLs
cy.visit('/')
cy.visit('/login')

**❌ DON'T:** Hardcode localhost URLs
cy.visit('http://localhost:3002') // Breaks in Docker
```

### 3. CI/CD Pipeline

Ensure Docker Cypress tests run in CI/CD to catch these issues early:

```yaml
# .github/workflows/test.yml
- name: Run Cypress Tests (Docker)
  run: npm run cypress:docker:test
```

---

## Timeline

**Estimated Time:** 10 minutes

- Fix implementation: 2 minutes
- Testing (native): 3 minutes
- Testing (Docker): 5 minutes

**Complexity:** LOW - Simple find/replace operation

**Risk:** LOW - Change is backwards compatible

---

## Success Criteria

✅ **Primary Goal:** Docker Cypress tests connect to server successfully

**Metrics:**

- 0 hardcoded `http://localhost:3002` URLs in test files
- 0 ECONNREFUSED errors in Docker test runs
- All tests that passed in native also pass in Docker
- No new test failures introduced

---

## Rollback Plan

If fix causes issues:

```bash
# Revert changes
git checkout cypress/e2e/login-navigation.cy.ts
git checkout cypress/e2e/sync/sync-services.cy.ts

# Or use git revert
git revert <commit-hash>
```

---

## Related Documentation

- [cypress/docs/DOCKER-CYPRESS-GUIDE.md](DOCKER-CYPRESS-GUIDE.md) - Docker Cypress setup
- [cypress/docs/cypress-best-practices.md](cypress-best-practices.md) - Cypress best practices
- [CLAUDE.md](../../CLAUDE.md) - Project testing standards

---

**Status:** 🟢 Ready to implement
**Next Step:** Run fix script and test
**Owner:** Development Team
**Priority:** HIGH - Blocking Docker Cypress functionality

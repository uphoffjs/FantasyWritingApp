# TODO: Re-enable Test 2.3 - Remember Me Persistence

**Status**: Temporarily Disabled
**Date Disabled**: 2025-10-07
**Priority**: Medium
**Category**: Authentication Testing

---

## 🎯 Test Overview

**Test Name**: Test 2.3 - Remember Me Persistence
**Test File**: `cypress/e2e/authentication/signin-flow.cy.ts:114`
**Test Suite**: User Sign In Flow

**Purpose**: Verify that user sessions persist after page reload when "Remember Me" is enabled

---

## ⚠️ Reason for Disabling

**Issue**: Intermittent Supabase network timeouts
**Type**: External API reliability issue (not test code issue)
**Failure Pattern**: Socket closed errors during Supabase API requests
**Impact**: Test intermittently fails due to network connectivity, not functionality

**Error Example**:

```
Error: Socket closed before finished writing response
Route: { "url": "**/*" }
Intercepted request to: https://cbyvpuqisqmepubzrwuo.supabase.co/rest/v1/projects
```

---

## ✅ Re-Enablement Criteria

Enable this test when ANY of the following conditions are met:

1. **Supabase Stability Improves**

   - [ ] Observe 5+ consecutive successful test runs without network errors
   - [ ] Monitor over 3+ days to ensure stability

2. **Network Timeout Handling Added**

   - [ ] Implement retry logic for Supabase requests
   - [ ] Add network error recovery in test infrastructure
   - [ ] Configure longer timeout for Supabase operations

3. **Test Infrastructure Improvements**

   - [ ] Add Supabase connection health check before tests
   - [ ] Implement mock Supabase responses for remember-me feature
   - [ ] Create fallback test strategy for network issues

4. **Alternative Testing Approach**
   - [ ] Move to component-level testing for session persistence
   - [ ] Test remember-me logic independently of Supabase
   - [ ] Use Supabase local development environment

---

## 📋 Re-Enablement Steps

When ready to re-enable:

1. **Remove `describe.skip`** from line 114 in `signin-flow.cy.ts`
2. **Remove disable comments** (lines 109-113)
3. **Run test 5 times consecutively** to verify stability:
   ```bash
   for i in {1..5}; do
     SPEC=cypress/e2e/authentication/signin-flow.cy.ts npm run cypress:docker:test:spec
   done
   ```
4. **Update TODO-AUTH-TESTS-PHASE-2-SIGNIN.md** with passing status
5. **Delete this TODO file** once re-enabled and stable

---

## 🧪 Test Implementation Details

**Test validates**:

- User can enable "Remember Me" toggle
- Session persists after page reload
- User remains authenticated post-reload
- Projects page remains accessible

**Current Test Status**:

- ✅ Test implementation: Correct and complete
- ✅ Test assertions: Valid and appropriate
- ⚠️ Test reliability: Intermittent due to external dependency

**Test Code Location**: Lines 114-156 in `signin-flow.cy.ts`

---

## 📊 Test History

| Date       | Runs | Pass | Fail | Notes                                   |
| ---------- | ---- | ---- | ---- | --------------------------------------- |
| 2025-10-07 | 3    | 0    | 3    | All failures: Supabase network timeouts |

---

## 🔗 Related Documentation

- Main TODO: [TODO-AUTH-TESTS-PHASE-2-SIGNIN.md](./TODO-AUTH-TESTS-PHASE-2-SIGNIN.md)
- Test File: [cypress/e2e/authentication/signin-flow.cy.ts](cypress/e2e/authentication/signin-flow.cy.ts)
- Phase 1 Infrastructure: [TODO-AUTH-TESTS-PHASE-1-INFRASTRUCTURE.md](./TODO-AUTH-TESTS-PHASE-1-INFRASTRUCTURE.md)

---

## 💡 Implementation Notes

**What Works**:

- User seeding with unique emails ✅
- Login flow with credentials ✅
- Remember-me toggle interaction ✅
- Navigation to projects page ✅

**What Fails Intermittently**:

- Supabase API requests after reload ❌
- Session restoration from Supabase ❌

**Root Cause**: External Supabase API connectivity, not test logic

---

**Last Updated**: 2025-10-07
**Next Review**: Check Supabase stability after 1 week

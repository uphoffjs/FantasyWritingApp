# Test 2.2 Debugging Breakthrough - 2025-10-09

## Root Cause Identified

The error state is NOT updating after `setError()` is called, even with `flushSync()`.

### Evidence

1. `flushSync(() => { setError(errorMessage) })` is called and logs "error set"
2. useEffect NEVER fires after the setError call
3. Component renders 21+ times with error=null
4. NO render ever shows error as truthy

### Theories

1. React state update is being blocked/ignored
2. Something is immediately clearing error back to null
3. Component re-mounting between setError calls
4. Zustand state update causing stale closure

### Key Discovery

The Zustand `isLoading` state change causes LoginScreen to re-render AFTER signIn returns but BEFORE our setError is processed. This creates a race condition.

### Files Modified

- src/screens/LoginScreen.web.tsx: Added flushSync, extensive logging
- cypress/e2e/authentication/signin-flow.cy.ts: Using it.only() on Test 2.2

### Next Approach

Try completely different error handling - maybe use Zustand for error state or use a ref with force update.

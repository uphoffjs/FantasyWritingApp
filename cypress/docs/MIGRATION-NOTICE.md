# ⚠️ IMPORTANT: Documentation Migration Notice

## New Single Source of Truth

As of **2025-09-25**, all Cypress testing documentation has been consolidated into:

### 📍 **[/cypress/CYPRESS-TESTING-STANDARDS.md](../CYPRESS-TESTING-STANDARDS.md)**

This document is now the **ONLY authoritative source** for testing standards and patterns.

## Document Status

| Document | Status | Action |
|----------|---------|---------|
| **CYPRESS-TESTING-STANDARDS.md** | ✅ **ACTIVE** | **USE THIS** |
| ADVANCED-TESTING-STRATEGY.md | ⚠️ Deprecated | Reference only |
| cypress-best-practices.md | ⚠️ Deprecated | Reference only |
| /CLAUDE.md (testing section) | ⚠️ Outdated | Use for project info only |

## Key Changes

1. **Selector Priority**: Now standardized as `data-cy` → `data-test` → `data-testid` → `role`
2. **Timeouts**: `responseTimeout` standardized to 30000ms
3. **Coverage**: Realistic targets (75-80%), not 100%
4. **Session Management**: Comprehensive patterns with validation
5. **Debug Commands**: Full `comprehensiveDebug()` implementation included

## Migration Steps

1. **Read** the new [CYPRESS-TESTING-STANDARDS.md](../CYPRESS-TESTING-STANDARDS.md)
2. **Update** existing tests to follow the new patterns
3. **Use** the validation script: `npm run validate:tests`
4. **Reference** only the new standards document

## Quick Links

- [View New Standards](../CYPRESS-TESTING-STANDARDS.md)
- [Discrepancy Analysis](./TESTING-DOCUMENTATION-DISCREPANCIES.md)
- [Official Cypress Docs](https://docs.cypress.io/guides/references/best-practices)

---

*This migration was completed based on the comprehensive analysis in [TESTING-DOCUMENTATION-DISCREPANCIES.md](./TESTING-DOCUMENTATION-DISCREPANCIES.md)*
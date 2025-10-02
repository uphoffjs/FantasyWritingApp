# FantasyWritingApp - Claude Quick Reference

**Streamlined reference with links to detailed documentation.**

---

## 🚨 MANDATORY CHECKLIST

1. ✅ Read existing files before editing (use Read tool)
2. ✅ Use ONLY `data-cy` attributes for test selectors (React Native: `testID`)
3. ✅ Run `npm run lint` before marking tasks complete
4. ✅ Include helpful code comments (Better Comments syntax)
5. ✅ Fix code first when tests fail
6. ✅ Mobile-first development
7. ✅ Clear context every 90 minutes (see Context Management below)
8. ✅ **Create test failure report when Cypress tests fail** (see TEST-RESULTS-MANAGEMENT.md)

---

## 📖 Documentation Strategy for Claude

**For efficient context usage, read files in THIS ORDER:**

### Test Writing (90% of cases)

1. **[cypress/docs/QUICK-TEST-REFERENCE.md](cypress/docs/QUICK-TEST-REFERENCE.md)** - START HERE (269 lines)
   - Test template with mandatory hooks
   - Three golden rules
   - Common patterns & examples
   - Quick selector/assertion reference

### Detailed Cypress Reference (when needed)

2. **[claudedocs/CYPRESS-COMPLETE-REFERENCE.md](claudedocs/CYPRESS-COMPLETE-REFERENCE.md)** (~500 lines)
   - All Cypress commands
   - URL best practices
   - Testing rules & standards
   - Selector strategies
   - Session management
   - Data seeding
   - Debug process

### Test Failure Analysis (when tests fail)

3. **[claudedocs/TEST-RESULTS-MANAGEMENT.md](claudedocs/TEST-RESULTS-MANAGEMENT.md)** (~200 lines)
   - Test reporting standards
   - Failure documentation
   - Report generation
   - Results management

### Full Testing Documentation (deep-dive only)

4. **Only read these for deep-dive:**
   - [cypress/docs/cypress-best-practices.md](cypress/docs/cypress-best-practices.md) - Comprehensive practices (1,384 lines)
   - [cypress/docs/cypress-writing-organizing-tests.md](cypress/docs/cypress-writing-organizing-tests.md) - Complete guide (1,251 lines)

### Context Savings

- **Test writing**: 269 lines (~3.5% context) instead of 960 lines (~12.5% context)
- **Savings**: **72% reduction** for typical use cases

---

## 🎨 Development Strategy for Claude

**For efficient context usage, read files in THIS ORDER:**

### Component Development (90% of cases)

1. **[claudedocs/QUICK-DEV-REFERENCE.md](claudedocs/QUICK-DEV-REFERENCE.md)** - START HERE (280 lines)
   - Component template with 8 golden rules
   - Common patterns (Zustand, Navigation, Async)
   - Quick TypeScript reference
   - Common mistakes (Wrong vs Right)

### Detailed Development Reference (when needed)

2. **[claudedocs/DEVELOPMENT-COMPLETE-REFERENCE.md](claudedocs/DEVELOPMENT-COMPLETE-REFERENCE.md)** (~550 lines)
   - Component development standards
   - TypeScript patterns
   - State management (Zustand)
   - Navigation (React Navigation 6)
   - Platform handling
   - Performance optimization
   - Accessibility standards
   - Error handling patterns
   - Backend integration (Supabase)

### Project Information (for setup/architecture)

3. **[claudedocs/PROJECT-INFO.md](claudedocs/PROJECT-INFO.md)** (~135 lines)
   - Tech stack
   - Project structure
   - Platform handling
   - React Native pitfalls
   - Git workflow
   - TODO archive guide

### Context Savings

- **Component development**: 280 lines (~3.7% context) instead of 550 lines (~7.2% context)
- **Savings**: **49% reduction** for typical use cases
- **Full docs available** when needed without loading everything upfront

---

## 🧠 Context Management

### Quick Context Commands

```bash
# The Golden Sequence™ - Use every 90 minutes
/sc:save                          # Save config
write_memory("checkpoint", state) # Save context
/clear                           # Clear conversation
/sc:load                         # Reload config
read_memory("checkpoint")        # Restore context
```

### Context Health Monitoring

| Indicator          | Action Required   |
| ------------------ | ----------------- |
| **Slow responses** | Clear immediately |
| **90+ minutes**    | Proactive clear   |
| **Before break**   | Save checkpoint   |
| **Task complete**  | Update memory     |
| **End of day**     | Save EOD summary  |

### Essential Memory Keys

```bash
"checkpoint"        # Current work state
"EOD"              # End of day summary
"feature_[name]"   # Feature-specific context
"bug_[id]"         # Debug session state
"temp_*"           # Temporary (delete after use)
```

### Context Documentation

- **[CONTEXT_MANAGEMENT_GUIDE.md](./CONTEXT_MANAGEMENT_GUIDE.md)** - Comprehensive context strategies
- **[SESSION_BEST_PRACTICES.md](./SESSION_BEST_PRACTICES.md)** - Optimal session patterns
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Command cheat sheet
- **[claude-save-and-clear-workflow.md](./claude-save-and-clear-workflow.md)** - Clear workflow

### When to Clear Context

- ✅ Every 90-120 minutes (mandatory)
- ✅ Before complex operations
- ✅ When responses feel slow
- ✅ After completing major features
- ✅ Before/after debugging sessions

---

## 🚀 Quick Start Commands

```bash
# Development
npm run web           # Dev server (port 3002)
npm run lint          # MANDATORY before commits

# Testing - Single Test (RECOMMENDED)
SPEC=path/to/test.cy.ts npm run cypress:run:spec
SPEC=path/to/test.cy.ts npm run cypress:open:spec

# Testing - All Tests
npm run cypress:open  # Interactive UI
npm run cypress:run   # Headless
npm run test:e2e      # Alias

# Other Tests
npm run test          # Jest unit tests
npm run test:component # Cypress component tests
npm run build:web     # Production build

# Docker (macOS Sequoia only)
npm run cypress:docker:test  # All tests + auto-server
SPEC=path/to/test.cy.ts npm run cypress:docker:test:spec
```

**⚠️ CRITICAL**: Always use `npm run` scripts, NEVER `npx cypress` or direct `cypress` commands!

---

## 💬 Better Comments Syntax

Use these prefixes for clear, categorized comments throughout the codebase:

```javascript
// * Highlights - Important information
// ! Alerts - Warnings, deprecated code, or critical issues
// ? Questions - Queries or areas needing clarification
// TODO: Tasks - Items to complete or improve
// // Strikethrough - Commented out code (double slash)

// Examples:
// * This component handles user authentication
// ! DEPRECATED: Use useAuthStore() instead of this function
// ? Should we add rate limiting to this endpoint?
// TODO: Add error boundary to this component
// // const oldImplementation = legacy();
```

---

## 📁 File Paths Reference

- `/cypress/e2e/` - E2E tests
- `/cypress/support/` - Custom commands
- `/cypress/docs/` - Test documentation
- `/src/components/` - Components
- `/src/screens/` - Screens
- `/src/store/` - Zustand stores
- `/src/types/` - TypeScript types
- `/claudedocs/` - Extended documentation

---

## 📚 Extended Documentation Map

### Testing References

- [QUICK-TEST-REFERENCE.md](cypress/docs/QUICK-TEST-REFERENCE.md) - Test template (269 lines)
- [CYPRESS-COMPLETE-REFERENCE.md](claudedocs/CYPRESS-COMPLETE-REFERENCE.md) - Complete Cypress guide (~500 lines)
- [cypress-best-practices.md](cypress/docs/cypress-best-practices.md) - Comprehensive practices
- [cypress-writing-organizing-tests.md](cypress/docs/cypress-writing-organizing-tests.md) - Complete test guide
- [DOCKER-CYPRESS-GUIDE.md](cypress/docs/DOCKER-CYPRESS-GUIDE.md) - Docker setup
- [CUSTOM-COMMANDS-REFERENCE.md](cypress/docs/CUSTOM-COMMANDS-REFERENCE.md) - Custom commands

### Project Information

- [PROJECT-INFO.md](claudedocs/PROJECT-INFO.md) - Tech stack & structure (~135 lines)
- [TEST-RESULTS-MANAGEMENT.md](claudedocs/TEST-RESULTS-MANAGEMENT.md) - Test reporting (~200 lines)

### Context Management

- [CONTEXT_MANAGEMENT_GUIDE.md](./CONTEXT_MANAGEMENT_GUIDE.md) - Context strategies
- [SESSION_BEST_PRACTICES.md](./SESSION_BEST_PRACTICES.md) - Session patterns
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Command cheat sheet
- [claude-save-and-clear-workflow.md](./claude-save-and-clear-workflow.md) - Clear workflow

---

## 🎯 Quick Tips

### For Test Writing

1. Read [QUICK-TEST-REFERENCE.md](cypress/docs/QUICK-TEST-REFERENCE.md) first
2. Copy the mandatory test template
3. Use `data-cy` attributes for all selectors
4. Run single test with `SPEC=path npm run cypress:run:spec`
5. Create failure report if test fails

### For Debugging

1. Ensure server runs first: `npm run web`
2. Check [CYPRESS-COMPLETE-REFERENCE.md](claudedocs/CYPRESS-COMPLETE-REFERENCE.md) for debug process
3. Use relative URLs (not hardcoded localhost)
4. Check [TEST-RESULTS-MANAGEMENT.md](claudedocs/TEST-RESULTS-MANAGEMENT.md) for failure analysis

### For Project Setup

1. See [PROJECT-INFO.md](claudedocs/PROJECT-INFO.md) for tech stack
2. Follow Git workflow with feature branches
3. Use conventional commits
4. Archive completed TODOs

---

## ⚡ Context-Efficient Workflow

**Typical Test Writing Session:**

```
1. Read QUICK-TEST-REFERENCE.md (269 lines)
2. Write test using template
3. Run test: SPEC=path npm run cypress:run:spec
4. If fails: Read TEST-RESULTS-MANAGEMENT.md
5. If passes: Done! (Used only ~3.5% context)
```

**Compare to old approach:**

- Old: Read entire CLAUDE.md (960 lines = ~12.5% context)
- New: Read QUICK-TEST-REFERENCE.md (269 lines = ~3.5% context)
- **Savings: 72% reduction**

---

**Version**: 2.0
**Last Updated**: 2025-10-02
**Previous Version**: [claudedocs/archive/CLAUDE-v1-backup.md](claudedocs/archive/CLAUDE-v1-backup.md)

**After compacting: Re-read this file for context**

# Git Workflow - GitHub Flow

## Current Branch Strategy

**Active Workflow: GitHub Flow**

- `main` - Production-ready code (always deployable)
- Feature branches - Short-lived branches for specific work

**Key Principle:** Main branch is always in a deployable state

---

## GitHub Flow Overview

```
main ─────────●──────────●─────────●───→ (production-ready)
              ↗         ↗         ↗
feature/auth ●────────┘
feature/ui ──────●──────┘
fix/bug ───────────●──────────────┘
```

**Benefits:**

- ✅ Simple and scalable
- ✅ Feature isolation
- ✅ Always deployable main branch
- ✅ Easy collaboration with PRs
- ✅ Works great with CI/CD

---

## Core Workflow

### 1. Starting New Work

```bash
# 1. Ensure main is up to date
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/descriptive-name
# or: fix/bug-description
# or: docs/documentation-update
```

### 2. Development Cycle

```bash
# 1. Make changes
# ... edit files ...

# 2. Stage changes
git add -A

# 3. Commit with conventional message
git commit -m "feat(scope): description

- Detailed change 1
- Detailed change 2

Notes: Any special considerations"
```

**Commit Types (Conventional Commits):**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `chore`: Maintenance
- `refactor`: Code restructuring
- `test`: Tests
- `style`: Formatting

### 3. Pre-commit Quality Gates

**Automatic validation on every commit:**

1. ✅ Protected files check
2. ✅ Lint validation (ESLint)
3. ✅ Critical E2E test (Docker-based)

**When lint fails:**

```bash
# Option 1: Fix the issues (preferred)
npm run lint --fix
git add -A
git commit -m "message"

# Option 2: Bypass (use sparingly)
git commit --no-verify -m "message

Note: Reason for bypassing hooks"
```

### 4. Merging to Main

```bash
# 1. Update main branch
git checkout main
git pull origin main

# 2. Merge feature branch
git merge --no-ff feature/branch-name
# --no-ff preserves feature branch history

# 3. Push to remote
git push origin main

# 4. Delete feature branch
git branch -d feature/branch-name
```

### 5. Deployment

```bash
# Main branch is always deployable
# Deploy after successful merge
git checkout main
git pull origin main
# ... deploy to production ...
```

---

## Complete Workflow Examples

### Example 1: New Feature

```bash
# 1. Start feature
git checkout main
git pull origin main
git checkout -b feature/password-reset

# 2. Develop (multiple commits)
# ... edit auth.js ...
git add auth.js
git commit -m "feat(auth): add reset token generation"

# ... edit api.js ...
git add api.js
git commit -m "feat(auth): add reset endpoint"

# ... edit UI ...
git add src/components/
git commit -m "feat(auth): add password reset UI"

# 3. Merge to main
git checkout main
git pull origin main
git merge --no-ff feature/password-reset
git push origin main

# 4. Clean up
git branch -d feature/password-reset

# 5. Deploy
# ... deploy main branch ...
```

### Example 2: Bug Fix

```bash
# 1. Create fix branch
git checkout main
git pull origin main
git checkout -b fix/login-validation

# 2. Fix and test
# ... edit code ...
git add -A
git commit -m "fix(auth): validate email format before submit

- Added regex validation
- Updated error messages
- Added unit tests

Fixes #123"

# 3. Merge to main
git checkout main
git merge --no-ff fix/login-validation
git push origin main

# 4. Clean up
git branch -d fix/login-validation
```

### Example 3: Multiple Parallel Features

```bash
# Feature A: Authentication
git checkout main
git checkout -b feature/jwt-auth
# ... work on auth ...
git commit -m "feat(auth): implement JWT"

# Feature B: UI (switch without merging A)
git checkout main
git checkout -b feature/dark-mode
# ... work on UI ...
git commit -m "feat(ui): add dark mode"

# Merge Feature A first
git checkout main
git merge --no-ff feature/jwt-auth
git push origin main

# Continue Feature B
git checkout feature/dark-mode
# ... finish work ...
git commit -m "feat(ui): complete dark mode implementation"

# Merge Feature B
git checkout main
git merge --no-ff feature/dark-mode
git push origin main

# Clean up both
git branch -d feature/jwt-auth
git branch -d feature/dark-mode
```

---

## Branch Naming Conventions

### Format: `type/description-with-dashes`

**Feature branches:**

- `feature/user-authentication`
- `feature/export-to-pdf`
- `feature/real-time-sync`

**Bug fixes:**

- `fix/login-validation-error`
- `fix/memory-leak-in-sync`
- `fix/broken-navigation`

**Documentation:**

- `docs/api-reference`
- `docs/setup-guide`
- `docs/contributing`

**Performance improvements:**

- `perf/optimize-render`
- `perf/reduce-bundle-size`

**Refactoring:**

- `refactor/extract-auth-service`
- `refactor/simplify-state-management`

---

## Collaboration with Pull Requests

### When Team Grows

```bash
# 1. Create feature branch
git checkout main
git pull origin main
git checkout -b feature/new-feature

# 2. Develop and commit
git add -A
git commit -m "feat: add new feature"

# 3. Push feature branch to remote
git push -u origin feature/new-feature

# 4. Create Pull Request via GitHub UI
# - Add description
# - Request reviewers
# - Link related issues

# 5. After PR approval, merge via GitHub
# - GitHub auto-deletes remote branch

# 6. Update local
git checkout main
git pull origin main
git branch -d feature/new-feature
```

### PR Best Practices

**PR Title:** `feat(scope): descriptive title`

**PR Description Template:**

```markdown
## Summary

Brief description of changes

## Changes Made

- Change 1
- Change 2
- Change 3

## Testing

- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if UI changes)

[Add screenshots]

## Related Issues

Closes #123
```

---

## Common Operations

### Check Current State

```bash
git status                    # Working tree status
git branch                    # List local branches
git branch -a                 # List all branches
git log --oneline -10         # Recent commits
git log --graph --oneline -10 # Visual commit graph
```

### Branch Management

```bash
# List branches with last commit
git branch -vv

# Delete local branch
git branch -d branch-name

# Delete remote branch
git push origin --delete branch-name

# Rename current branch
git branch -m new-name
```

### Keeping Feature Branch Updated

```bash
# Option 1: Merge main into feature (safer)
git checkout feature/branch
git merge main

# Option 2: Rebase feature on main (cleaner history)
git checkout feature/branch
git rebase main
# WARNING: Only use if branch not pushed yet
```

---

## Emergency Procedures

### Undo Last Commit (Not Pushed)

```bash
# Keep changes
git reset --soft HEAD~1

# Discard changes (DANGEROUS)
git reset --hard HEAD~1
```

### Undo Merge (Not Pushed)

```bash
git reset --hard ORIG_HEAD
```

### Fix Pushed Mistake

```bash
# Create revert commit
git revert HEAD
git push origin main

# Never force push to main!
```

### Recover Deleted Branch

```bash
# Find commit hash
git reflog

# Recreate branch
git checkout -b branch-name <commit-hash>
```

---

## Quality Gates Integration

### Pre-commit Hooks

**Automatic checks before every commit:**

1. **Protected Files Check**

   - Prevents modification of critical files
   - `scripts/check-protected-files.js`

2. **Lint Validation**

   - ESLint with max 0 warnings
   - Auto-fixes applied when possible

3. **Critical E2E Test**
   - Login verification test (Docker)
   - Ensures core functionality works
   - ~30-60 seconds

**Bypassing hooks (use sparingly):**

```bash
git commit --no-verify -m "message"
```

### When to Bypass

✅ **Acceptable:**

- Documentation-only changes
- Non-code files (README, etc.)
- When fixes are coming from merge

❌ **Not Acceptable:**

- Code changes with actual errors
- To save time on important features
- Production-bound code

---

## Best Practices

### Commit Frequency

✅ **Good:**

- Commit after each logical change
- Commit when tests pass
- 5-20 commits per feature branch

❌ **Bad:**

- One giant commit per feature
- Incomplete/broken commits
- Commits with unrelated changes

### Feature Branch Lifetime

✅ **Good:**

- 1-3 days maximum
- Merge as soon as feature complete
- Small, focused features

❌ **Bad:**

- Weeks-old feature branches
- Branches with multiple features
- Long-lived divergent branches

### Main Branch Protection

✅ **Always:**

- Keep main deployable
- Test before merging
- Use quality gates

❌ **Never:**

- Force push to main
- Merge broken code
- Skip testing

---

## Migration Notes

### From Main + Dev (2025-10-05)

**What changed:**

- ❌ Deleted `dev` branch (local + remote)
- ✅ Using `main` as single truth source
- ✅ Creating feature branches as needed
- ✅ Pre-commit hooks remain active

**Rationale:**

- Simpler workflow for solo dev
- Better feature isolation
- Industry-standard approach
- Easier collaboration when team grows
- Clear production state

**Old workflow:**

```
dev → main
```

**New workflow:**

```
feature/* → main
```

---

## Current State (as of 2025-10-05)

**Active Branches:**

- `main` - Latest: c857e26 "Merge branch 'dev' into feature/fantasy-color-migration"

**Branch Synchronization:**

- ✅ Main is production-ready
- ✅ All feature branches can be created from main
- ✅ Pre-commit hooks active

**Workflow Status:**

- ✅ Using GitHub Flow
- ✅ Single main branch
- ✅ Feature branches as needed
- ✅ Ready for collaboration

---

## Quick Reference

### Daily Workflow

```bash
# Morning: Start new feature
git checkout main && git pull
git checkout -b feature/my-feature

# During day: Commit often
git add -A
git commit -m "feat: description"

# End of day: Merge if complete
git checkout main
git merge --no-ff feature/my-feature
git push origin main
git branch -d feature/my-feature
```

### Common Commands

```bash
# Status check
git status
git branch

# Create feature
git checkout -b feature/name

# Commit work
git add -A
git commit -m "type: description"

# Merge to main
git checkout main
git merge --no-ff feature/name
git push origin main

# Clean up
git branch -d feature/name
```

---

**Last Updated:** 2025-10-05
**Workflow:** GitHub Flow
**Agent:** Claude (Sonnet 4.5)
**Project:** FantasyWritingApp

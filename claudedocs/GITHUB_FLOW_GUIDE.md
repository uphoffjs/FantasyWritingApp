# GitHub Flow - Complete Guide

**Quick Start:** This is a streamlined guide to GitHub Flow for FantasyWritingApp. See [GIT_WORKFLOW.md](GIT_WORKFLOW.md) for comprehensive reference.

---

## What is GitHub Flow?

**Simple branching model with one rule:**

> Main branch is always deployable

```
main ───●───────●───────●───→ (always production-ready)
       ↗       ↗       ↗
feature/*   fix/*   docs/*
```

---

## The 5-Step Workflow

### 1️⃣ Create Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/my-feature
```

**Branch naming:**

- `feature/` - New functionality
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code improvements
- `perf/` - Performance optimizations

### 2️⃣ Develop & Commit

```bash
# Make changes
# ... edit files ...

# Stage and commit
git add -A
git commit -m "feat(scope): description

- Detail 1
- Detail 2"
```

**Commit often:**

- After each logical change
- When tests pass
- Multiple commits per feature = ✅

### 3️⃣ Quality Gates

**Automatic on every commit:**

1. Protected files check
2. ESLint validation
3. E2E test (Docker)

**If lint fails:**

```bash
npm run lint --fix
git add -A
git commit -m "fix: lint errors"
```

### 4️⃣ Merge to Main

```bash
git checkout main
git pull origin main
git merge --no-ff feature/my-feature
git push origin main
```

**Why `--no-ff`?**

- Preserves feature branch history
- Clear merge commits
- Easy to revert if needed

### 5️⃣ Clean Up

```bash
git branch -d feature/my-feature
```

**Done!** Main is updated and ready to deploy.

---

## Complete Examples

### Example 1: New Feature (Multiple Commits)

```bash
# 1. Start
git checkout main && git pull
git checkout -b feature/export-pdf

# 2. Implement step by step
# Add basic export
git add src/services/export.ts
git commit -m "feat(export): add PDF export service"

# Add UI button
git add src/components/ExportButton.tsx
git commit -m "feat(export): add export button to toolbar"

# Add tests
git add __tests__/export.test.ts
git commit -m "test(export): add PDF export tests"

# 3. Merge
git checkout main
git merge --no-ff feature/export-pdf
git push origin main

# 4. Clean up
git branch -d feature/export-pdf
```

### Example 2: Quick Bug Fix

```bash
# 1. Create fix branch
git checkout main && git pull
git checkout -b fix/login-error

# 2. Fix and test
# ... edit code ...
git add -A
git commit -m "fix(auth): handle null email in login

- Added null check
- Updated error message
- Added test case

Fixes #123"

# 3. Merge immediately
git checkout main
git merge --no-ff fix/login-error
git push origin main

# 4. Delete branch
git branch -d fix/login-error
```

### Example 3: Working on Multiple Features

```bash
# Start Feature A
git checkout main
git checkout -b feature/dark-mode
# ... work on dark mode ...
git commit -m "feat(ui): add dark mode toggle"

# Need to start Feature B while A isn't done
git checkout main
git checkout -b feature/notifications
# ... work on notifications ...
git commit -m "feat(notify): add notification system"

# Feature B is done first
git checkout main
git merge --no-ff feature/notifications
git push origin main
git branch -d feature/notifications

# Continue Feature A
git checkout feature/dark-mode
# ... finish work ...
git commit -m "feat(ui): complete dark mode implementation"

# Merge Feature A
git checkout main
git merge --no-ff feature/dark-mode
git push origin main
git branch -d feature/dark-mode
```

---

## Common Scenarios

### Keep Feature Branch Updated

**If main changes while working on feature:**

```bash
# Option 1: Merge main into feature (safer)
git checkout feature/my-feature
git merge main
git commit -m "Merge main into feature/my-feature"

# Option 2: Rebase (cleaner, riskier)
git checkout feature/my-feature
git rebase main
# Only if branch not pushed to remote!
```

### Feature Branch Conflicts

```bash
# During merge
git checkout main
git merge --no-ff feature/my-feature
# CONFLICT in file.txt

# 1. Resolve in editor
# ... fix conflicts ...

# 2. Stage resolved files
git add file.txt

# 3. Complete merge
git commit
```

### Abandoned Feature

```bash
# Delete unmerged branch (force)
git branch -D feature/abandoned-idea

# If pushed to remote
git push origin --delete feature/abandoned-idea
```

---

## Quality & Best Practices

### Commit Messages

✅ **Good:**

```
feat(auth): implement password reset flow

- Added email validation
- Created reset token system
- Updated UI with reset form

Tested with 50 users in staging
```

❌ **Bad:**

```
fix stuff
updates
wip
```

### Feature Branch Lifespan

✅ **Good:**

- 1-3 days maximum
- 5-20 commits
- Focused on single feature
- Merged as soon as complete

❌ **Bad:**

- Week+ old branches
- 50+ commits
- Multiple unrelated features
- Waiting to "perfect" before merge

### Main Branch Protection

✅ **Always:**

- Keep deployable
- Test before merge
- Use quality gates
- Merge with `--no-ff`

❌ **Never:**

- Force push
- Merge broken code
- Skip pre-commit hooks
- Direct commits to main (use feature branches)

---

## Pre-commit Hooks

### What Runs Automatically

**Every commit triggers:**

1. **Protected Files Check** (~1s)

   - Blocks changes to critical test files
   - Prevents accidental breakage

2. **ESLint Validation** (~10-15s)

   - Runs on all staged files
   - Auto-fixes when possible
   - Blocks commit if errors remain

3. **Critical E2E Test** (~30-60s)
   - Runs login verification in Docker
   - Ensures core functionality works
   - Prevents breaking main app flow

### Bypassing Hooks

```bash
# Use --no-verify (sparingly!)
git commit --no-verify -m "docs: update README"
```

**When acceptable:**

- Documentation-only changes
- Non-code files
- When fixes coming from merge

**When NOT acceptable:**

- Code with lint errors
- Broken functionality
- Production-bound code

---

## Collaboration (When Team Grows)

### Pull Request Workflow

```bash
# 1. Create feature branch
git checkout main && git pull
git checkout -b feature/new-feature

# 2. Develop
git add -A
git commit -m "feat: add new feature"

# 3. Push branch to remote
git push -u origin feature/new-feature

# 4. Create PR on GitHub
# - Add description
# - Request reviewers
# - Link issues

# 5. After approval, merge via GitHub UI
# GitHub auto-deletes remote branch

# 6. Update local
git checkout main
git pull origin main
git branch -d feature/new-feature
```

### PR Template

```markdown
## Summary

Brief description of changes

## Changes

- Change 1
- Change 2

## Testing

- [x] Unit tests pass
- [x] E2E tests pass
- [x] Manual testing complete

## Screenshots

[If UI changes]

## Issues

Closes #123
```

---

## Troubleshooting

### "Branch already exists"

```bash
# Delete existing branch
git branch -d feature/name

# Or use different name
git checkout -b feature/name-v2
```

### "Cannot merge uncommitted changes"

```bash
# Option 1: Commit changes
git add -A
git commit -m "feat: description"

# Option 2: Stash changes
git stash
# ... do merge ...
git stash pop
```

### "Conflict during merge"

```bash
# 1. See conflicted files
git status

# 2. Open files, resolve conflicts
# Look for <<<<<<< HEAD markers

# 3. Stage resolved files
git add file.txt

# 4. Complete merge
git commit
```

### "Accidentally committed to main"

```bash
# Not pushed yet
git reset --soft HEAD~1
git checkout -b feature/my-feature
git commit -m "feat: description"

# Already pushed - create fix
git revert HEAD
git push origin main
```

---

## Cheat Sheet

### Daily Workflow

```bash
# Morning
git checkout main && git pull
git checkout -b feature/today

# During work
git add -A && git commit -m "feat: progress"

# End of day
git checkout main
git merge --no-ff feature/today
git push origin main
git branch -d feature/today
```

### Common Commands

```bash
# Check status
git status
git branch

# Create branch
git checkout -b feature/name

# Switch branches
git checkout branch-name

# Commit
git add -A
git commit -m "type: description"

# Merge
git checkout main
git merge --no-ff feature/name

# Push
git push origin main

# Delete branch
git branch -d feature/name
```

### Emergency Commands

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# See all branches
git branch -a

# See commit history
git log --oneline -10

# Recover deleted branch
git reflog
git checkout -b branch-name <hash>
```

---

## Why GitHub Flow?

**Perfect for FantasyWritingApp because:**

✅ **Simple** - Easy to understand and follow
✅ **Safe** - Main always deployable
✅ **Flexible** - Work on multiple features in parallel
✅ **Scalable** - Easily add team members with PRs
✅ **Quality** - Pre-commit hooks enforce standards
✅ **Fast** - Short-lived branches, quick merges
✅ **Standard** - Industry-standard workflow

**Compared to alternatives:**

| Feature          | Trunk-Based | Main+Dev | GitHub Flow | Git Flow   |
| ---------------- | ----------- | -------- | ----------- | ---------- |
| Complexity       | ⭐          | ⭐⭐     | ⭐⭐⭐      | ⭐⭐⭐⭐⭐ |
| Safety           | ⭐⭐        | ⭐⭐⭐   | ⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐ |
| Solo Efficiency  | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐ | ⭐⭐⭐⭐    | ⭐⭐       |
| Team Scalability | ⭐⭐        | ⭐⭐     | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐ |

---

## Next Steps

1. ✅ Read this guide
2. ✅ Try creating your first feature branch
3. ✅ Make a commit and see pre-commit hooks run
4. ✅ Merge back to main
5. ✅ Refer to [GIT_WORKFLOW.md](GIT_WORKFLOW.md) for deep-dive

**Remember:** Main branch is always deployable! 🚀

---

**Last Updated:** 2025-10-05
**Workflow:** GitHub Flow
**Project:** FantasyWritingApp

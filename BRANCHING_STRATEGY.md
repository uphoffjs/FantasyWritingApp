# Git Branching Strategy

## Branch Structure

### Main Branches
- **`main`**: Production-ready code only. Protected branch. All code here should be stable and deployed.
- **`dev`**: Main development branch for integration testing. All feature branches merge here first.

### Feature Branches
Created from `dev` branch:
- **`feature/`**: New features (e.g., `feature/rich-text-editor`)
- **`bugfix/`**: Bug fixes (e.g., `bugfix/fix-story-save`)
- **`enhancement/`**: Small improvements (e.g., `enhancement/improve-ui-responsiveness`)
- **`hotfix/`**: Critical fixes for production (created from `main`)

## Workflow

### Standard Development Flow
```bash
# 1. Start new feature from dev
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name

# 2. Work on feature
git add .
git commit -m "feat: add story editor with auto-save"

# 3. Keep branch updated with dev
git checkout dev
git pull origin dev
git checkout feature/your-feature-name
git merge dev

# 4. Push feature branch
git push origin feature/your-feature-name

# 5. Create PR to dev (not main)
# After review and merge to dev, dev will be merged to main periodically
```

### Hotfix Flow (Emergency)
```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 2. Fix the issue
git add .
git commit -m "hotfix: resolve critical data loss issue"

# 3. Push and create PRs to both main AND dev
git push origin hotfix/critical-bug
```

## Commit Message Convention

Follow conventional commits format:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Formatting, missing semicolons, etc.
- `refactor:` Code restructuring
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `chore:` Maintenance tasks
- `build:` Build system changes

## Pull Request Guidelines

### PR to dev branch
1. Ensure all tests pass (`npm run test && npm run cypress:run`)
2. Update documentation if needed
3. Include clear description of changes
4. Reference any related issues
5. Request review from team members

### PR to main branch
1. Only merge from dev when stable
2. All tests must pass
3. Code review required
4. Version bump if applicable
5. Update changelog

## Branch Protection Rules

### main branch
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date
- Include administrators in restrictions

### dev branch
- Require pull request reviews
- Require status checks to pass
- Allow force pushes (admin only)

## Release Process

1. Ensure dev is stable with all features for release
2. Create PR from dev to main
3. Run full test suite
4. Review and approve
5. Merge to main
6. Tag release version
7. Deploy from main

## Best Practices

1. **Keep branches small and focused** - One feature per branch
2. **Regular merges** - Keep feature branches updated with dev
3. **Clean up branches** - Delete merged branches
4. **Test before merging** - Always run tests locally
5. **Meaningful commits** - Clear, descriptive commit messages
6. **Document breaking changes** - Note in PR description
7. **Review your own PR first** - Self-review before requesting others
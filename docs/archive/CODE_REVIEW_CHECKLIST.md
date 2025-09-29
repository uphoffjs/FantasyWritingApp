# Code Review Checklist

## 📋 Pull Request Review Guide

Use this checklist when reviewing PRs to ensure code quality, test coverage, and maintainability.

---

## Before Review

### PR Description
- [ ] **Clear title** describing the change
- [ ] **Links to issue/ticket** if applicable
- [ ] **Description explains** what changed and why
- [ ] **Breaking changes** are clearly documented
- [ ] **Screenshots/videos** for UI changes
- [ ] **Testing instructions** provided

---

## Code Quality

### General Code Quality
- [ ] **No commented code** (unless explaining complex logic)
- [ ] **No console.log statements** in production code
- [ ] **No hardcoded values** (use constants/config)
- [ ] **No TODO comments** for incomplete work
- [ ] **Consistent naming** conventions followed
- [ ] **DRY principle** - no unnecessary duplication
- [ ] **SOLID principles** followed where applicable

### React Native Specific
- [ ] **React Native components used** (View, Text, TouchableOpacity)
- [ ] **No HTML elements** (div, span, button)
- [ ] **StyleSheet.create()** used for styles
- [ ] **Platform.select()** for platform-specific code
- [ ] **No className attributes** (no NativeWind)
- [ ] **testID attributes** on all interactive elements
- [ ] **Proper imports** from 'react-native'

### TypeScript
- [ ] **No `any` types** (unless absolutely necessary with explanation)
- [ ] **Interfaces defined** for component props
- [ ] **Types defined** for complex objects
- [ ] **Proper type exports** for reusable types
- [ ] **No type casting** without justification

---

## Testing

### Test Coverage
- [ ] **All new features** have tests
- [ ] **All bug fixes** have regression tests
- [ ] **Coverage meets thresholds** (80% lines, 75% branches)
- [ ] **Critical paths** have integration tests
- [ ] **E2E tests** for user journeys (if applicable)

### Test Quality
- [ ] **Tests are independent** (can run in any order)
- [ ] **Tests are readable** with clear descriptions
- [ ] **No skipped tests** without explanation
- [ ] **No arbitrary timeouts** (cy.wait(3000))
- [ ] **Proper async handling** (waitFor, async/await)
- [ ] **Mocks cleaned up** properly
- [ ] **Tests follow naming conventions**

### Test Performance
- [ ] **Unit tests < 100ms**
- [ ] **Integration tests < 500ms**
- [ ] **No unnecessary renders** in tests
- [ ] **Efficient test setup/teardown**

---

## Performance

### Component Performance
- [ ] **React.memo()** used for expensive components
- [ ] **useMemo/useCallback** used appropriately
- [ ] **No inline functions** in props (when avoidable)
- [ ] **Lists use FlatList** or virtualization
- [ ] **Images are optimized** and lazy loaded
- [ ] **No unnecessary re-renders**

### Bundle Size
- [ ] **No unused imports**
- [ ] **No large libraries** for simple tasks
- [ ] **Code splitting** implemented where needed
- [ ] **Tree shaking** friendly code

---

## Security

### Data Handling
- [ ] **No sensitive data** in code/commits
- [ ] **No API keys** or secrets hardcoded
- [ ] **Input validation** on all user inputs
- [ ] **Output sanitization** for displayed data
- [ ] **Proper error messages** (no stack traces to users)

### Authentication & Authorization
- [ ] **Auth checks** on protected routes
- [ ] **Token handling** is secure
- [ ] **No sensitive data** in AsyncStorage without encryption
- [ ] **HTTPS only** for API calls

---

## Accessibility

### Component Accessibility
- [ ] **accessibilityLabel** on interactive elements
- [ ] **accessibilityRole** properly set
- [ ] **accessibilityState** for dynamic states
- [ ] **Keyboard navigation** works properly
- [ ] **Screen reader** compatible

---

## Documentation

### Code Documentation
- [ ] **Complex logic explained** with comments
- [ ] **Function/component purpose** documented
- [ ] **Props documented** with JSDoc/TypeScript
- [ ] **README updated** if needed
- [ ] **API changes documented**

---

## Architecture & Design

### Code Organization
- [ ] **Files in correct location** (components/, screens/, utils/)
- [ ] **Logical file naming** that matches component
- [ ] **Single responsibility** per component/function
- [ ] **Proper separation** of concerns
- [ ] **Reusable components** extracted where appropriate

### State Management
- [ ] **Appropriate state location** (local vs global)
- [ ] **No unnecessary global state**
- [ ] **Store actions** are atomic and clear
- [ ] **Selectors used** for computed values
- [ ] **State updates** are immutable

---

## Git & Version Control

### Commit Quality
- [ ] **Atomic commits** (one logical change per commit)
- [ ] **Meaningful commit messages** following convention
- [ ] **No merge commits** in feature branches (rebase instead)
- [ ] **Branch up-to-date** with target branch

---

## Platform Compatibility

### Cross-Platform
- [ ] **Works on iOS** (if applicable)
- [ ] **Works on Android** (if applicable)
- [ ] **Works on Web** (if applicable)
- [ ] **Platform-specific code** properly handled
- [ ] **.web.tsx files** created when needed

---

## Error Handling

### Error Management
- [ ] **Try-catch blocks** for async operations
- [ ] **Error boundaries** for component errors
- [ ] **Meaningful error messages** for users
- [ ] **Error logging** for debugging
- [ ] **Graceful degradation** when possible

---

## Quick Review Checklist

For quick reviews, ensure these critical items:

### 🚨 Critical (Must Fix)
- [ ] No security vulnerabilities
- [ ] No breaking changes without documentation
- [ ] Tests are passing
- [ ] No runtime errors

### ⚠️ Important (Should Fix)
- [ ] Test coverage adequate
- [ ] Performance considerations addressed
- [ ] React Native best practices followed
- [ ] No console.log statements

### 💡 Suggestions (Consider)
- [ ] Code could be more DRY
- [ ] Additional tests would help
- [ ] Documentation could be improved
- [ ] Performance optimizations possible

---

## Review Comments Template

### Requesting Changes
```
🚨 **[Critical/Important/Suggestion]**: [Issue description]

**Problem**: [What's wrong]
**Solution**: [How to fix]
**Example**:
```[code example]```
```

### Approving with Suggestions
```
✅ **Approved** with minor suggestions:

1. [Suggestion 1]
2. [Suggestion 2]

These can be addressed in a follow-up PR if needed.
```

### Questions
```
❓ **Question**: [Your question]

Could you explain [specific part]? This would help me understand [context].
```

---

## Automated Checks

Before manual review, ensure these pass:

### CI/CD Pipeline
- [ ] **Build succeeds** on all platforms
- [ ] **Tests pass** (unit, integration, E2E)
- [ ] **Linting passes** (ESLint, TypeScript)
- [ ] **Coverage thresholds** met
- [ ] **Bundle size** within limits

### Pre-commit Hooks
- [ ] **Prettier formatting** applied
- [ ] **ESLint rules** satisfied
- [ ] **TypeScript compilation** succeeds
- [ ] **Tests run** successfully

---

## Special Considerations

### New Dependencies
- [ ] **Necessity justified** (can't be done with existing tools)
- [ ] **License compatible** with project
- [ ] **Actively maintained** (recent updates)
- [ ] **Security audited** (no known vulnerabilities)
- [ ] **Size appropriate** for functionality
- [ ] **React Native compatible**

### Database Changes
- [ ] **Migration provided** (if applicable)
- [ ] **Backward compatible** (or breaking change documented)
- [ ] **Performance impact** considered
- [ ] **Indexes added** where needed

### API Changes
- [ ] **Backward compatible** (or versioned)
- [ ] **Documentation updated**
- [ ] **Error responses** defined
- [ ] **Rate limiting** considered
- [ ] **Authentication** required where needed

---

## Post-Review

### After Approval
- [ ] **Squash commits** if needed
- [ ] **Update branch** with latest target
- [ ] **Verify CI passes** after updates
- [ ] **Delete feature branch** after merge

### Follow-up Items
- [ ] **Create issues** for suggested improvements
- [ ] **Update documentation** if needed
- [ ] **Communicate changes** to team
- [ ] **Monitor** for any issues post-deploy

---

## Review Priorities

### P0 - Block Merge
- Security vulnerabilities
- Breaking functionality
- Failed tests
- Build failures

### P1 - Fix Before Merge
- Missing tests for new features
- Performance regressions
- Accessibility issues
- Code quality violations

### P2 - Fix Soon
- Minor code improvements
- Additional test coverage
- Documentation updates
- Refactoring opportunities

### P3 - Future Consideration
- Nice-to-have features
- Style preferences
- Optional optimizations

---

## Time Guidelines

### Review Time Estimates
- **Small PR** (<100 lines): 15-30 minutes
- **Medium PR** (100-500 lines): 30-60 minutes
- **Large PR** (500+ lines): 60+ minutes (consider splitting)

### Response Time
- **Initial review**: Within 24 hours
- **Follow-up reviews**: Within 4 hours
- **Urgent/blocking**: ASAP (within 2 hours)

---

*Last Updated: 2025-09-27*
*Version: 1.0.0*
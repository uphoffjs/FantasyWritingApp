# Cypress Selector Standards

## 📋 Overview

This document defines the selector standards for Cypress tests in the FantasyWritingApp project. Following these standards ensures maintainable, reliable, and fast-running tests.

## ✅ Required Selector Patterns

### 1. **Use data-cy Attributes** (MANDATORY)

```typescript
// ✅ CORRECT - Using data-cy
cy.get('[data-cy="submit-button"]').click();
cy.getByDataCy('submit-button').click(); // Custom command

// ❌ WRONG - Using other selectors
cy.get('.submit-btn').click(); // CSS class
cy.get('#submitButton').click(); // ID
cy.get('button').click(); // Tag
cy.contains('Submit').click(); // Text only
```

### 2. **Naming Conventions for data-cy**

Use kebab-case with descriptive names:

```typescript
// Component types
data-cy="[component]-[action]"
data-cy="[component]-[element]-[modifier]"

// Examples:
data-cy="user-profile-card"
data-cy="submit-button"
data-cy="modal-close-button"
data-cy="element-card-title"
data-cy="create-project-modal"
```

### 3. **Standard Naming Patterns**

| Component Type | Pattern            | Example                          |
| -------------- | ------------------ | -------------------------------- |
| Buttons        | `[action]-button`  | `data-cy="submit-button"`        |
| Inputs         | `[field]-input`    | `data-cy="email-input"`          |
| Modals         | `[name]-modal`     | `data-cy="create-element-modal"` |
| Cards          | `[type]-card`      | `data-cy="project-card"`         |
| Forms          | `[name]-form`      | `data-cy="login-form"`           |
| Lists          | `[content]-list`   | `data-cy="element-list"`         |
| Items          | `[type]-item-[id]` | `data-cy="element-item-1"`       |

## 🚫 Anti-Patterns to Avoid

### 1. **Arbitrary Waits**

```typescript
// ❌ WRONG
cy.wait(3000); // Fixed time wait

// ✅ CORRECT
cy.get('[data-cy="loading"]').should('not.exist');
cy.get('[data-cy="content"]').should('be.visible');
```

### 2. **Brittle Selectors**

```typescript
// ❌ WRONG - Will break if text changes
cy.contains('Submit Form');

// ❌ WRONG - Will break if classes change
cy.get('.btn.btn-primary.submit');

// ❌ WRONG - Will break if structure changes
cy.get('div > div > button:nth-child(2)');

// ✅ CORRECT
cy.get('[data-cy="submit-button"]');
```

### 3. **Module-Level cy.stub()**

```typescript
// ❌ WRONG
const mockFunction = cy.stub(); // At module level

// ✅ CORRECT
beforeEach(() => {
  const mockFunction = cy.stub();
});
```

## 🔧 Custom Commands

Use these custom commands for better readability:

```typescript
// Preferred custom commands
cy.getByDataCy('element-name'); // Get by data-cy
cy.findByDataCy('child-element'); // Find within parent
cy.clickButton('Submit'); // Click button with fallback
cy.typeIntoField('email', 'test@example.com'); // Type into field
```

## 📝 Implementation in Components

### React Native Components

```tsx
<TouchableOpacity
  testID="submit-button" // For React Native
  data-cy="submit-button" // For web/Cypress
  onPress={handleSubmit}
>
  <Text>Submit</Text>
</TouchableOpacity>
```

### Web Components

```tsx
<button data-cy="submit-button" onClick={handleSubmit}>
  Submit
</button>
```

## 🔍 ESLint Enforcement

The following ESLint rules are configured to enforce these standards:

1. **Warn on non-data-cy selectors** in `cy.get()` and `cy.find()`
2. **Warn on arbitrary waits** like `cy.wait(3000)`
3. **Suggest data-cy usage** in `cy.contains()`

Run `npm run lint` to check compliance.

## 🎯 Migration Guide

For existing tests using incorrect selectors:

1. **Add data-cy to component**:

   ```tsx
   // Before
   <button className="submit-btn">

   // After
   <button className="submit-btn" data-cy="submit-button">
   ```

2. **Update test selector**:

   ```typescript
   // Before
   cy.get('.submit-btn').click();

   // After
   cy.get('[data-cy="submit-button"]').click();
   ```

3. **Use migration script** (if available):
   ```bash
   npm run migrate:selectors
   ```

## 📊 Benefits

- **Maintainability**: Tests don't break when styling changes
- **Readability**: Clear what element is being tested
- **Performance**: Direct attribute selection is faster
- **Debugging**: Easy to identify elements in DevTools
- **Consistency**: Same patterns across all tests

## 🔗 Related Documentation

- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [CYPRESS-TESTING-STANDARDS.md](./CYPRESS-TESTING-STANDARDS.md)
- [Better Comments Syntax](../CLAUDE.md#better-comments-syntax)

## 💡 Quick Reference

```typescript
// Component with all standard attributes
<div
  data-cy="element-card" // Cypress selector
  testID="element-card" // React Native
  className="card element-card" // Styling
  id="element-123" // Unique ID if needed
>
  <h3 data-cy="element-card-title">{title}</h3>
  <p data-cy="element-card-description">{description}</p>
  <button data-cy="element-card-edit-button">Edit</button>
  <button data-cy="element-card-delete-button">Delete</button>
</div>;

// Test using these selectors
cy.get('[data-cy="element-card"]').should('be.visible');
cy.get('[data-cy="element-card-title"]').should('contain', 'Test Element');
cy.get('[data-cy="element-card-edit-button"]').click();
```

---

**Remember**: Good selectors make tests reliable, maintainable, and easy to understand! 🚀

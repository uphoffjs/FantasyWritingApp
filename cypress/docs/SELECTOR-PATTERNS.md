# Cypress Selector Patterns for React Native Web

## Overview

This document defines the standard selector patterns for Cypress tests in the FantasyWritingApp React Native Web project. Following these patterns ensures consistent, reliable, and maintainable tests.

## Primary Pattern: `testID` → `data-testid`

React Native Web automatically converts the `testID` prop to `data-testid` attribute in the DOM. This is our primary selector strategy.

### In React Native Components

```tsx
// ✅ CORRECT - Add testID to all interactive components
<TouchableOpacity testID="create-story-button" onPress={handleCreate}>
  <Text>Create Story</Text>
</TouchableOpacity>

<TextInput 
  testID="story-title-input"
  placeholder="Enter story title"
  value={title}
  onChangeText={setTitle}
/>

<View testID="story-card">
  <Text testID="story-card-title">{story.title}</Text>
  <Text testID="story-card-word-count">{story.wordCount} words</Text>
</View>
```

### In Cypress Tests

```typescript
// ✅ CORRECT - Use getRN() custom command for robust selection
cy.getRN('create-story-button').rnClick();
cy.getRN('story-title-input').rnType('My New Story');
cy.getRN('story-card-title').should('contain', 'My New Story');

// Alternative: Direct data-testid selector (when not using RN commands)
cy.get('[data-testid="create-story-button"]').click();
```

## Naming Convention: kebab-case

All testID values should use kebab-case for consistency:

```typescript
// ✅ CORRECT
"story-title-input"
"character-card"
"save-button"
"element-browser"
"category-toggle-general"

// ❌ INCORRECT
"storyTitleInput"    // camelCase
"story_title_input"  // snake_case
"STORY-TITLE-INPUT"  // UPPERCASE
```

## Hierarchical Structure

Use a parent-child naming pattern for related elements:

```typescript
// Parent container
testID="story-card"

// Child elements
testID="story-card-title"
testID="story-card-author"
testID="story-card-word-count"
testID="story-card-edit-btn"
testID="story-card-delete-btn"

// In tests
cy.getRN('story-card').within(() => {
  cy.getRN('story-card-title').should('be.visible');
  cy.getRN('story-card-edit-btn').rnClick();
});
```

## Element Type Prefixes

Use consistent prefixes to identify element types:

```typescript
// Buttons
testID="btn-create-story"
testID="btn-save"
testID="btn-cancel"

// Inputs
testID="input-story-title"
testID="input-search"
testID="textarea-story-content"

// Modals
testID="modal-create-element"
testID="modal-confirm-delete"

// Lists
testID="list-characters"
testID="list-item-character-0"
testID="list-item-character-1"

// Forms
testID="form-story-details"
testID="form-field-title"
testID="form-field-genre"
```

## Fallback Strategies

When testID is not available, our custom `getRN()` command provides automatic fallbacks:

### Priority Order:
1. **Test attributes** (data-testid, data-cy, testID)
2. **Accessibility attributes** (aria-label, role)
3. **Semantic attributes** (placeholder, name, id)
4. **Content selectors** (last resort, logs warning)

```typescript
// Component might be missing testID
<TouchableOpacity 
  accessibilityLabel="Create new story"
  onPress={handleCreate}
>
  <Text>Create</Text>
</TouchableOpacity>

// getRN() will find it via accessibility fallback
cy.getRN('Create new story').rnClick();
// Console will show: ⚠️ getRN fallback: Add testID to component!
```

## React Native Web Specific Commands

Use our custom RN-aware commands for better compatibility:

```typescript
// Text input with proper event handling
cy.getRN('story-title-input').rnType('My Story');
cy.getRN('story-title-input').rnClearAndType('New Title');

// Touch-aware clicking
cy.getRN('create-button').rnClick();

// Focus/blur handling
cy.getRN('story-content').rnFocus();
cy.getRN('story-content').rnBlur();

// Select/dropdown handling
cy.getRN('genre-select').rnSelect('Fantasy');

// Swipe gestures
cy.getRN('story-list').rnSwipe('up', 100);

// Long press
cy.getRN('story-card').rnLongPress(500);

// Wait for React Native updates
cy.getRN('modal').should('be.visible');
cy.waitForRN(); // Wait for RN to finish rendering

// Toggle switches
cy.getRN('auto-save-switch').rnToggleSwitch();

// Scroll to element
cy.getRN('chapter-10').rnScrollTo('center');
```

## Common Patterns

### Modal Testing
```typescript
// Opening a modal
cy.getRN('btn-create-story').rnClick();
cy.getRN('modal-create-story').should('be.visible');
cy.waitForRN();

// Interacting within modal
cy.getRN('modal-create-story').within(() => {
  cy.getRN('input-story-title').rnType('My Story');
  cy.getRN('btn-save').rnClick();
});
```

### List Item Testing
```typescript
// Testing dynamic list items
cy.getRN('list-stories').within(() => {
  cy.getRN('list-item-story-0').should('exist');
  cy.getRN('list-item-story-1').should('exist');
});

// Or using index
stories.forEach((story, index) => {
  cy.getRN(`list-item-story-${index}`).should('contain', story.title);
});
```

### Form Testing
```typescript
// Complete form flow
cy.getRN('form-story-details').within(() => {
  cy.getRN('input-title').rnType('Epic Fantasy');
  cy.getRN('select-genre').rnSelect('Fantasy');
  cy.getRN('textarea-summary').rnType('An epic tale...');
  cy.getRN('btn-submit').rnClick();
});
```

### Category Expansion (Accordion)
```typescript
// Expanding collapsed sections
cy.getRN('category-toggle-general').rnClick();
cy.waitForRN();
cy.getRN('category-content-general').should('be.visible');
```

## Anti-Patterns to Avoid

```typescript
// ❌ AVOID: Content-based selectors (fragile)
cy.contains('Create Story').click();

// ❌ AVOID: CSS classes (implementation details)
cy.get('.story-button').click();

// ❌ AVOID: Complex selectors
cy.get('div > div > button:nth-child(2)').click();

// ❌ AVOID: Mixed naming conventions
testID="storyTitle"  // Should be "story-title"

// ❌ AVOID: Generic IDs
testID="button"  // Too generic
testID="input"   // Not specific enough

// ❌ AVOID: Using standard Cypress commands for RN components
cy.get('[data-testid="input"]').type('text'); // Use .rnType() instead
```

## Migration Guide

For existing tests that need updating:

```typescript
// OLD: Content-based
cy.contains('Create').click();

// STEP 1: Add testID to component
<TouchableOpacity testID="btn-create" onPress={handleCreate}>
  <Text>Create</Text>
</TouchableOpacity>

// STEP 2: Update test to use getRN
cy.getRN('btn-create').rnClick();

// OLD: Standard Cypress commands
cy.get('[data-testid="input"]').type('Hello');
cy.get('[data-testid="button"]').click();

// NEW: React Native aware commands
cy.getRN('input').rnType('Hello');
cy.getRN('button').rnClick();
```

## Debugging Selectors

When selectors aren't working:

```typescript
// 1. Check if element exists in DOM
cy.get('body').then($body => {
  console.log('All testids:', $body.find('[data-testid]').map((i, el) => el.getAttribute('data-testid')));
});

// 2. Use getRN with logging
cy.getRN('my-element'); // Will log fallback warnings

// 3. Check React Native Web conversion
cy.window().then(win => {
  console.log('React Native Web active:', !!win.document.querySelector('[data-testid]'));
});

// 4. Verify element visibility
cy.getRN('my-element').should('exist').should('be.visible');
```

## Best Practices Summary

1. **Always add testID** to interactive components
2. **Use kebab-case** for all testID values
3. **Use getRN()** command for element selection
4. **Use RN-specific commands** (rnClick, rnType, etc.)
5. **Add waitForRN()** after state changes
6. **Follow hierarchical naming** for related elements
7. **Document missing testIDs** as test maintenance tasks
8. **Avoid content selectors** except as last resort
9. **Test on multiple viewports** (mobile, tablet, desktop)
10. **Keep selectors simple and semantic**

## Quick Reference

| Element Type | testID Pattern | Example |
|-------------|---------------|---------|
| Button | `btn-{action}` | `btn-create-story` |
| Input | `input-{field}` | `input-story-title` |
| Select | `select-{field}` | `select-genre` |
| Modal | `modal-{name}` | `modal-create-element` |
| List | `list-{items}` | `list-characters` |
| List Item | `list-item-{type}-{index}` | `list-item-character-0` |
| Card | `card-{type}` | `card-story` |
| Form | `form-{name}` | `form-story-details` |
| Toggle | `toggle-{feature}` | `toggle-auto-save` |
| Tab | `tab-{name}` | `tab-characters` |
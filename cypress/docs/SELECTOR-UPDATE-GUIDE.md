# Cypress Selector Update Guide

**Status:** Planned - Not Yet Implemented
**Priority:** Phase 2 - High Priority (P1)
**Estimated Effort:** 3-4 hours

---

## Overview

Two test files use `cy.contains()` selectors which violate Cypress best practices. They need to be updated to use `data-cy` attributes instead.

**Files Requiring Updates:**
1. `cypress/e2e/scenes/scene-editor.cy.ts` - 21 instances
2. `cypress/e2e/characters/character-full-workflow.cy.ts` - 26 instances

---

## Why This Matters

**Cypress Best Practices (from official docs):**
- ❌ **DON'T:** Use `cy.contains('text')` - text changes frequently
- ✅ **DO:** Use `data-cy` attributes - stable, semantic selectors

**Problems with cy.contains():**
- Breaks when text content changes
- Breaks when translations are added
- Unclear what element is being selected
- Slower than attribute selectors

---

## Implementation Process

### Step 1: Analyze cy.contains() Usage

**scene-editor.cy.ts (21 instances):**
```typescript
cy.contains('Opening Scene').should('be.visible')        // Line 57
cy.contains('Battle Scene').should('be.visible')         // Line 88
cy.contains('Test Scene').click()                        // Line 149
cy.contains('Hero').should('be.visible')                 // Line 161
// ... 17 more instances
```

**character-full-workflow.cy.ts (26 instances):**
```typescript
cy.contains('Test Fantasy Epic').should('be.visible')    // Line 27
cy.contains('Gandalf the Grey').should('be.visible')     // Line 53
cy.contains('best friend of Frodo Baggins')              // Line 132
// ... 23 more instances
```

### Step 2: Identify Source Components

**For each cy.contains() call:**
1. Determine what component renders that text
2. Find the component file in `src/`
3. Note the component's purpose and structure

**Example:**
```typescript
// Test: cy.contains('Opening Scene').should('be.visible')
// Component: src/components/SceneCard.tsx or similar
// Need to add: data-cy="scene-card-title" to the title element
```

### Step 3: Add data-cy Attributes

**Component Update Pattern:**
```tsx
// Before:
<Text style={styles.sceneTitle}>{scene.title}</Text>

// After:
<Text
  data-cy={`scene-title-${scene.id}`}  // Dynamic ID
  // OR
  data-cy="scene-card-title"           // Static selector
  style={styles.sceneTitle}
>
  {scene.title}
</Text>
```

**Naming Convention:**
- Cards: `[type]-card` (e.g., `scene-card`, `character-card`)
- Titles: `[type]-title` (e.g., `scene-title`, `character-name`)
- Buttons: `[action]-button` (e.g., `delete-button`, `save-button`)
- Dynamic: `[type]-[id]` (e.g., `scene-title-${scene.id}`)

### Step 4: Update Test Selectors

**Replacement Pattern:**
```typescript
// Before:
cy.contains('Opening Scene').should('be.visible')

// After:
cy.get('[data-cy="scene-card-title"]').should('contain', 'Opening Scene')
// OR (if using dynamic IDs):
cy.get('[data-cy^="scene-title-"]').first().should('contain', 'Opening Scene')
```

### Step 5: Verify Changes

```bash
# Run the specific test file
SPEC=cypress/e2e/scenes/scene-editor.cy.ts npm run cypress:run:spec

# Verify no broken selectors
npm run lint
```

---

## Detailed Replacement Plan

### scene-editor.cy.ts Updates

| Line | Current Selector | Replacement | Component |
|------|-----------------|-------------|-----------|
| 57 | `cy.contains('Opening Scene')` | `cy.get('[data-cy="scene-card-title"]')` | SceneCard |
| 88-90 | `cy.contains('Battle Scene')` | `cy.get('[data-cy^="scene-card-"]')` | SceneList |
| 149 | `cy.contains('Test Scene').click()` | `cy.get('[data-cy="scene-card"]').click()` | SceneCard |
| 161-162 | `cy.contains('Hero')` | `cy.get('[data-cy="character-tag"]')` | CharacterTag |
| 173-174 | `cy.contains('Revised Test Scene')` | `cy.get('[data-cy="scene-title"]')` | SceneEditor |
| 236-242 | Chapter section contains | `cy.get('[data-cy="scene-title"]')` | ChapterSection |
| 247 | `cy.contains('Rising Action').click()` | `cy.get('[data-cy="scene-card"]').click()` | SceneCard |
| 260 | Chapter contains verification | `cy.get('[data-cy="scene-title"]')` | ChapterSection |
| 284 | Search results | `cy.get('[data-cy="scene-search-result"]')` | SearchResults |
| 297 | Scene selection | `cy.get('[data-cy="scene-card"]').click()` | SceneCard |
| 308 | Deleted scene check | `cy.get('[data-cy="scene-card"]').should('not.exist')` | SceneList |
| 314 | Duplicate source | `cy.get('[data-cy="scene-card"]').first().click()` | SceneCard |
| 329 | Duplicated scene | `cy.get('[data-cy="scene-title"]')` | SceneEditor |
| 355 | Persistence check | `cy.get('[data-cy="scene-title"]')` | SceneEditor |
| 374 | Export button | `cy.get('[data-cy="export-button"]')` | SceneEditor |

### character-full-workflow.cy.ts Updates

| Line | Current Selector | Replacement | Component |
|------|-----------------|-------------|-----------|
| 27-28 | `cy.contains('Test Fantasy Epic')` | `cy.get('[data-cy="story-title"]')` | StoryCard |
| 53 | `cy.contains('Gandalf the Grey')` | `cy.get('[data-cy="character-name"]')` | CharacterCard |
| 73 | Character selection | `cy.get('[data-cy="character-card"]').click()` | CharacterCard |
| 132 | Relationship text | `cy.get('[data-cy="relationship-description"]')` | RelationshipDisplay |
| 186-187 | Updated character | `cy.get('[data-cy="character-name"]')` | CharacterEditor |
| 210-216 | Mode toggle | `cy.get('[data-cy="mode-indicator"]')` | ProfileMode |
| 223 | Mode check | `cy.get('[data-cy="mode-indicator"]')` | ProfileMode |
| 268-269 | Search results | `cy.get('[data-cy="character-search-result"]')` | SearchResults |
| 275 | Filter results | `cy.get('[data-cy="character-card"]')` | CharacterList |
| 284 | Character selection | `cy.get('[data-cy="character-card"]').click()` | CharacterCard |
| 294 | Deleted character | `cy.get('[data-cy="character-card"]')` | CharacterList |
| 341 | Export button | `cy.get('[data-cy="export-button"]')` | CharacterEditor |
| 357 | Error message | `cy.get('[data-cy="error-message"]')` | ErrorDisplay |
| 367 | Validation error | `cy.get('[data-cy="validation-error"]')` | FormValidation |
| 434-435 | Voice guide | `cy.get('[data-cy="voice-pattern"]')` | VoiceGuide |
| 460-462 | Character tags | `cy.get('[data-cy^="character-tag-"]')` | CharacterTags |
| 466 | Tag removal | Tag already has data-cy | CharacterTags |
| 501 | Pagination result | `cy.get('[data-cy="character-card"]')` | CharacterList |

---

## Component Files to Modify

**Likely Locations (need verification):**
- `src/components/Scene/SceneCard.tsx`
- `src/components/Scene/SceneEditor.tsx`
- `src/components/Scene/SceneList.tsx`
- `src/components/Character/CharacterCard.tsx`
- `src/components/Character/CharacterEditor.tsx`
- `src/components/Character/CharacterList.tsx`
- `src/components/Story/StoryCard.tsx`
- `src/components/common/ErrorDisplay.tsx`
- `src/components/common/SearchResults.tsx`

---

## Validation Checklist

After completing selector updates:

- [ ] All `cy.contains()` calls replaced with `data-cy` selectors
- [ ] All components have appropriate `data-cy` attributes
- [ ] Tests pass: `npm run cypress:run`
- [ ] Lint passes: `npm run lint`
- [ ] No console warnings about selectors
- [ ] Selectors follow naming convention
- [ ] Documentation updated in component files

---

## Risk Assessment

**Low Risk:**
- Adding `data-cy` attributes to components (backward compatible)
- Updating test selectors (isolated to test files)

**Medium Risk:**
- Finding correct component files (may take investigation)
- Ensuring dynamic selectors work with various data states

**Mitigation:**
- Test incrementally (one file at a time)
- Verify each replacement before moving to next
- Keep backup of original test files

---

## Estimated Time Breakdown

| Task | Time | Notes |
|------|------|-------|
| Analyze cy.contains() usage | 15 min | Already done in this doc |
| Identify component files | 30-45 min | May require codebase exploration |
| Add data-cy attributes | 1-2 hours | ~20 components to update |
| Update test selectors | 1 hour | 47 replacements total |
| Test and verify | 30-45 min | Run tests, fix issues |
| **Total** | **3-4 hours** | Conservative estimate |

---

## Next Steps

1. **Identify Component Files:**
   ```bash
   # Search for components rendering scene/character titles
   grep -r "scene.title\|character.name" src/components/
   ```

2. **Create Branch:**
   ```bash
   git checkout -b refactor/selector-updates
   ```

3. **Update Incrementally:**
   - Start with scene-editor.cy.ts (smaller file)
   - Test after each component update
   - Move to character-full-workflow.cy.ts

4. **Verify:**
   ```bash
   npm run cypress:run
   npm run lint
   ```

---

**Created:** October 1, 2025
**Status:** Ready for implementation
**Priority:** P1 - High Priority

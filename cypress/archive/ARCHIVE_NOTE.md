# Component Tests Archive Note

**Date Archived**: 2025-09-27
**Reason**: Migration to Jest + React Native Testing Library

## Background

As part of the React Native testing strategy implementation (Phase 3), all Cypress component tests have been archived. Component testing has been migrated to Jest + React Native Testing Library (RNTL) for better React Native compatibility.

## What Was Archived

- **77 Cypress component tests** from `cypress/component/`
- Tests covered components like:
  - UI components (Button, TextInput, etc.)
  - Forms and modals
  - Navigation components
  - Error handling components
  - Visualization components

## Current Testing Strategy

- **Component Tests**: Jest + RNTL (in `__tests__/` directory)
- **E2E Tests**: Cypress (focusing on user journeys in `cypress/e2e/`)
- **Integration Tests**: Jest for store and API testing

## Migration Status

- ✅ 11 components migrated to Jest + RNTL
- 📋 Remaining components will be migrated as needed
- 🚀 E2E tests refocused on user journeys only

## Reference

These archived tests can still be referenced for:
- Test case ideas
- Edge cases to cover
- Component behavior expectations

However, they should NOT be run as Cypress is no longer used for component testing.

## See Also

- `/TODO.md` - Current testing strategy
- `/__tests__/` - New component test location
- `/cypress/e2e/` - User journey E2E tests
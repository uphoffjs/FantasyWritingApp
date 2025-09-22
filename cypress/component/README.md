# Component Tests Organization

This directory contains organized Cypress component tests for the FantasyWritingApp React Native project.

## 📁 Directory Structure

### `/forms` (10 files)
Form-related component tests including:
- BaseElementForm variations (debug, incremental, isolated, minimal, simple, stateless)
- BasicQuestionsSelector tests
- ElementForms tests

### `/elements` (11 files)
Element management component tests:
- ElementBrowser
- ElementCard
- ElementEditor and ElementEditorComponents
- CreateElementModal
- RelationshipGraph, RelationshipList, RelationshipModal
- LinkModal
- SpeciesSelector

### `/projects` (4 files)
Project management tests:
- CreateProjectModal
- EditProjectModal
- ProjectCard
- ProjectList

### `/ui` (15 files)
Core UI component tests:
- Button
- TextInput variations (basic, performance, rapid, etc.)
- TagInput and TagMultiSelect
- LoadingSpinner
- ProgressBar
- Toast
- RichTextEditor
- ImageUpload
- MarkdownExportModal

### `/navigation` (4 files)
Navigation component tests:
- Header
- Breadcrumb
- MobileNavigation
- MobileComponents

### `/sync` (4 files)
Synchronization and data management tests:
- SyncComponents
- SyncQueueAndConflict
- SyncQueueStatus
- AutoSaveIndicator

### `/visualization` (9 files)
Data visualization and list rendering tests:
- CompletionHeatmap variations (core, edge, interactions, simple)
- GraphComponents
- VirtualizedElementList
- VirtualizedList
- VirtualizationComponents

### `/performance` (1 file)
Performance-related tests:
- PerformanceComponents

### `/utilities` (10 files)
Utility components and misc tests:
- GlobalSearch
- SearchResults
- MilestoneSystem
- ProgressReport
- TemplateComponents
- TemplateEditor
- SpecialtyComponents
- UtilityComponents
- COMPONENT-TEST-TEMPLATE (for reference)
- test-single

### `/errors` (3 files)
Error handling component tests:
- ErrorBoundary
- ErrorMessage
- ErrorNotification

### `/_helpers`
Helper utilities and mock components for testing

## 🎯 Running Tests

### Run all component tests
```bash
npm run cypress:open -- --component
```

### Run specific folder tests
```bash
# Run all form tests
npx cypress run --component --spec "cypress/component/forms/**/*.cy.tsx"

# Run all UI tests
npx cypress run --component --spec "cypress/component/ui/**/*.cy.tsx"

# Run all element tests
npx cypress run --component --spec "cypress/component/elements/**/*.cy.tsx"
```

### Run individual test file
```bash
npx cypress run --component --spec "cypress/component/ui/Button.cy.tsx"
```

## 📝 Test Naming Conventions

- `ComponentName.cy.tsx` - Main test file
- `ComponentName.simple.cy.tsx` - Simplified/minimal test version
- `ComponentName.performance.cy.tsx` - Performance-focused tests
- `ComponentName.edge.cy.tsx` - Edge case tests
- `ComponentName.interactions.cy.tsx` - User interaction tests

## ✅ Test Coverage

All tests follow these patterns:
- Use `data-cy` attributes for selectors (NEVER CSS classes or IDs)
- Include `cy.comprehensiveDebug()` in beforeEach hooks
- Mobile-first viewport testing (`iphone-x` default)
- Clean state between tests
- No conditional logic in tests
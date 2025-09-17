#!/bin/bash

echo "Updating remaining Cypress test files with data-cy selectors..."

# Component test files that need updating
component_files=(
    "cypress/component/SyncComponents.cy.tsx"
    "cypress/component/GraphComponents.cy.tsx"
    "cypress/component/VirtualizedList.cy.tsx"
    "cypress/component/CompletionHeatmap.interactions.cy.tsx"
    "cypress/component/ErrorBoundary.cy.tsx"
    "cypress/component/Breadcrumb.cy.tsx"
    "cypress/component/TemplateComponents.cy.tsx"
    "cypress/component/ElementEditorComponents.cy.tsx"
    "cypress/component/ElementEditor.cy.tsx"
    "cypress/component/ProjectList.cy.tsx"
    "cypress/component/VirtualizationComponents.cy.tsx"
    "cypress/component/SpecialtyComponents.cy.tsx"
    "cypress/component/SpeciesSelector.cy.tsx"
    "cypress/component/CompletionHeatmap.cy.tsx"
    "cypress/component/VirtualizedElementList.cy.tsx"
    "cypress/component/SearchResults.cy.tsx"
    "cypress/component/ProjectCard.cy.tsx"
    "cypress/component/RelationshipModal.cy.tsx"
    "cypress/component/ElementCard.cy.tsx"
    "cypress/component/ElementBrowser.cy.tsx"
    "cypress/component/EditProjectModal.cy.tsx"
    "cypress/component/CompletionHeatmap.core.cy.tsx"
    "cypress/component/ErrorMessage.cy.tsx"
    "cypress/component/CreateProjectModal.cy.tsx"
    "cypress/component/TemplateEditor.cy.tsx"
    "cypress/component/RelationshipList.cy.tsx"
    "cypress/component/MobileComponents.cy.tsx"
    "cypress/component/RichTextEditor.cy.tsx"
    "cypress/component/MarkdownExportModal.cy.tsx"
    "cypress/component/RelationshipGraph.cy.tsx"
    "cypress/component/TagInput.cy.tsx"
    "cypress/component/CompletionHeatmap.edge.cy.tsx"
    "cypress/component/ProgressReport.cy.tsx"
    "cypress/component/Header.cy.tsx"
    "cypress/component/Toast.cy.tsx"
    "cypress/component/ElementForms.cy.tsx"
    "cypress/component/PerformanceComponents.cy.tsx"
    "cypress/component/ErrorNotification.cy.tsx"
    "cypress/component/UtilityComponents.cy.tsx"
    "cypress/component/CreateElementModal.cy.tsx"
    "cypress/component/ImageUpload.cy.tsx"
    "cypress/component/SyncQueueAndConflict.cy.tsx"
    "cypress/component/MilestoneSystem.cy.tsx"
    "cypress/component/MobileNavigation.cy.tsx"
    "cypress/component/GlobalSearch.cy.tsx"
    "cypress/component/LinkModal.cy.tsx"
    "cypress/component/TagMultiSelect.cy.tsx"
)

# E2E test files
e2e_files=(
    "cypress/e2e/scenes/scene-editor.cy.ts"
    "cypress/e2e/smoke/basic-functionality.cy.ts"
    "cypress/e2e/navigation/navigation.cy.ts"
    "cypress/e2e/characters/character-full-workflow.cy.ts"
    "cypress/e2e/characters/character-editor.cy.ts"
    "cypress/e2e/stories/story-crud.cy.ts"
    "cypress/e2e/auth/authentication.cy.ts"
)

# Reference files
reference_files=(
    "cypress/reference/project-crud.cy.ts"
    "cypress/reference/navigation.cy.ts"
    "cypress/reference/element-full-workflow.cy.ts"
    "cypress/reference/element-editor.cy.ts"
    "cypress/reference/authentication.cy.ts"
)

# Update function
update_file() {
    local file=$1
    if [ -f "$file" ]; then
        # Replace [data-cy=" with [data-testid="
        sed -i '' 's/\[data-cy="/\[data-testid="/g' "$file"
        # Replace [data-cy=' with [data-testid='
        sed -i '' "s/\[data-cy='/\[data-testid='/g" "$file"
        # Replace data-cy= with data-testid= (for attribute references)
        sed -i '' 's/data-cy=/data-testid=/g' "$file"
        # Replace getByDataCy with getByTestId if present
        sed -i '' 's/getByDataCy/getByTestId/g' "$file"
        echo "✅ Updated: $file"
    else
        echo "⚠️ File not found: $file"
    fi
}

# Process all component files
echo "Updating component test files..."
for file in "${component_files[@]}"; do
    update_file "$file"
done

# Process all E2E files
echo "Updating E2E test files..."
for file in "${e2e_files[@]}"; do
    update_file "$file"
done

# Process all reference files
echo "Updating reference test files..."
for file in "${reference_files[@]}"; do
    update_file "$file"
done

# Update command files
echo "Updating command and support files..."
update_file "cypress/support/commands.ts"

echo ""
echo "✨ Selector update complete!"
echo "Total files processed: $((${#component_files[@]} + ${#e2e_files[@]} + ${#reference_files[@]} + 1))"
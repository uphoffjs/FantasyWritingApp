#!/bin/bash

# Script to update all Cypress test files from data-cy to data-testid selectors
# This is needed because React Native Web converts testID to data-testid, not data-cy

echo "Starting to update Cypress selectors from data-cy to data-testid..."

# Find all Cypress test files
CYPRESS_TEST_FILES=$(find cypress/component -name "*.cy.tsx" -o -name "*.cy.ts")

# Count total files
TOTAL_FILES=$(echo "$CYPRESS_TEST_FILES" | wc -l)
echo "Found $TOTAL_FILES test files to update"

# Counter for updated files
UPDATED=0

# Process each file
for file in $CYPRESS_TEST_FILES; do
    if [ -f "$file" ]; then
        # Check if file contains data-cy
        if grep -q '\[data-cy=' "$file"; then
            echo "Updating: $file"
            
            # Create backup
            cp "$file" "$file.backup"
            
            # Replace [data-cy=" with [data-testid="
            sed -i '' 's/\[data-cy="/\[data-testid="/g' "$file"
            
            # Remove backup if successful
            if [ $? -eq 0 ]; then
                rm "$file.backup"
                ((UPDATED++))
            else
                echo "Error updating $file, restoring backup"
                mv "$file.backup" "$file"
            fi
        fi
    fi
done

echo ""
echo "Update complete!"
echo "Updated $UPDATED files out of $TOTAL_FILES total files"
echo ""
echo "Next steps:"
echo "1. Run 'npm run cypress:run' to verify the fixes"
echo "2. Check if tests pass with the new selectors"
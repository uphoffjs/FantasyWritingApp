#!/bin/bash

# * Find all potentially missing components
echo "🔍 Searching for missing components..."
echo ""

MISSING_COMPONENTS=(
  "ElementFooter"
  "ElementImages"
  "ElementRelationships"
  "ElementTags"
  "LinkModal"
  "SpeciesSelector"
  "Header"
  "EmailVerificationBanner"
  "MigrationPrompt"
  "AccountMenu"
)

for component in "${MISSING_COMPONENTS[@]}"; do
  echo "📦 Searching for: $component"
  results=$(find src -name "*${component}*" -type f 2>/dev/null | head -5)
  if [ -z "$results" ]; then
    echo "   ❌ NOT FOUND"
  else
    echo "   ✅ Found:"
    echo "$results" | sed 's/^/      /'
  fi
  echo "---"
done

echo ""
echo "📊 Summary of missing component search complete"
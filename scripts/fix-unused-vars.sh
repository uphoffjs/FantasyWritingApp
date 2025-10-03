#!/bin/bash
# Fix unused variables by prefixing with underscore

# Get all files with unused variable errors
npm run lint 2>&1 | \
  grep "no-unused-vars" | \
  grep "error" | \
  awk '{print $1}' | \
  sort -u | \
  while read file; do
    if [ -f "$file" ]; then
      echo "Processing: $file"
      # Let eslint try to fix automatically
      npx eslint "$file" --fix --quiet 2>/dev/null || true
    fi
  done

echo "Done! Run 'npm run lint' to check remaining errors."

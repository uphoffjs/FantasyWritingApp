#!/bin/bash

# Open Cypress with specific spec file
# Usage: SPEC=path/to/test.cy.ts npm run cypress:open:spec

if [ -z "$SPEC" ]; then
  echo "Error: SPEC environment variable is required"
  echo "Usage: SPEC=cypress/e2e/test-name.cy.ts npm run cypress:open:spec"
  exit 1
fi

# Run start-server-and-test with the spec file
start-server-and-test web http://localhost:3002 "cypress open --browser electron --spec $SPEC"

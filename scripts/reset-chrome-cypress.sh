#!/bin/bash

# * Reset Chrome for Cypress - Fixes CDP connection issues
echo "🔧 Resetting Chrome for Cypress..."

# * Kill all Chrome processes
echo "Stopping Chrome processes..."
pkill -f "Google Chrome" || true
pkill -f chrome || true
sleep 2

# * Clear Cypress Chrome profiles
echo "Clearing Cypress Chrome profiles..."
rm -rf "$HOME/Library/Application Support/Cypress/cy/production/browsers/chrome-stable" 2>/dev/null || true
rm -rf "$HOME/Library/Application Support/Cypress/cy/development/browsers/chrome-stable" 2>/dev/null || true

# * Clear Chrome's Cypress-specific cache
echo "Clearing Chrome cache..."
rm -rf "$HOME/Library/Caches/Google/Chrome/Default/Cache" 2>/dev/null || true
rm -rf "$HOME/Library/Caches/Google/Chrome/Default/Code Cache" 2>/dev/null || true

# * Clear Cypress cache if needed
echo "Checking Cypress cache..."
if [ -d "$HOME/Library/Caches/Cypress" ]; then
    echo "Cypress cache found, keeping binary but clearing temp files..."
    find "$HOME/Library/Caches/Cypress" -name "*.tmp" -delete 2>/dev/null || true
fi

# * Kill any processes on common Cypress ports
echo "Clearing ports..."
lsof -ti :3002 | xargs kill -9 2>/dev/null || true
lsof -ti :3003 | xargs kill -9 2>/dev/null || true

echo "✅ Chrome reset complete!"
echo ""
echo "You can now run Cypress tests with:"
echo "  npm run test:component"
echo "  npm run test:e2e"
echo ""
echo "If issues persist, try:"
echo "  1. Restart your computer"
echo "  2. Update Chrome: /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --version"
echo "  3. Reinstall Cypress: npm install --save-dev cypress@latest"
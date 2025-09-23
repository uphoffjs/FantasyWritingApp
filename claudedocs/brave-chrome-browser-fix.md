# Cypress Brave/Chrome Browser Issue - Deep Analysis & Solutions

## Problem Summary
Cypress opens Brave browser instead of Chrome, even when Chrome is explicitly specified with `--browser chrome` flag.

## Root Cause Analysis

### Investigation Results
1. **Both browsers installed**:
   - Chrome: `/Applications/Google Chrome.app` (v118.0.5993.88)
   - Brave: `/Applications/Brave Browser.app`

2. **Cypress detection**: Only detects Chrome, not Brave
3. **System default browser**: Safari (not Brave)
4. **Chrome executable**: Genuine Chrome binary, not symlinked

### Likely Cause
When Cypress UI opens, it may be selecting Brave from the browser dropdown because:
- Both browsers are Chromium-based with similar signatures
- Brave may be appearing as "Chrome" in the UI due to user-agent masquerading
- The UI selection overrides command-line flags

## Solution Methods

### Method 1: Force Chrome via Full Path (RECOMMENDED)
```bash
# Using environment variable
CYPRESS_BROWSER_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
npx cypress open --component

# Or create an alias in ~/.zshrc or ~/.bash_profile
alias cypress-chrome='CYPRESS_BROWSER_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npx cypress open'
```

### Method 2: Update Package.json Scripts
```json
{
  "scripts": {
    "cypress:component:chrome": "CYPRESS_BROWSER_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' cypress open --component",
    "cypress:e2e:chrome": "CYPRESS_BROWSER_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' cypress open"
  }
}
```

### Method 3: Cypress Configuration Override
Add to `cypress.config.ts`:
```typescript
export default defineConfig({
  e2e: {
    // Force Chrome browser
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.name === 'chrome') {
          // Force the exact Chrome path
          browser.path = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
        }
        return launchOptions;
      });
      return config;
    }
  },
  component: {
    // Same for component testing
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.name === 'chrome') {
          browser.path = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
        }
        return launchOptions;
      });
      return config;
    }
  }
});
```

### Method 4: Temporary Brave Disable
```bash
# Temporarily rename Brave to prevent detection
sudo mv "/Applications/Brave Browser.app" "/Applications/Brave Browser.app.disabled"

# Run Cypress (will only find Chrome)
npm run cypress:open

# Restore Brave afterward
sudo mv "/Applications/Brave Browser.app.disabled" "/Applications/Brave Browser.app"
```

### Method 5: Create Custom Launch Script
Create `scripts/cypress-chrome.sh`:
```bash
#!/bin/bash

# Kill any existing Cypress/Chrome processes
pkill -f cypress || true
pkill -f Chrome || true
sleep 2

# Set Chrome path explicitly
export CYPRESS_BROWSER_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Launch Cypress with Chrome
if [ "$1" = "component" ]; then
  npx cypress open --component --browser chrome
else
  npx cypress open --e2e --browser chrome
fi
```

Make it executable:
```bash
chmod +x scripts/cypress-chrome.sh
```

Use it:
```bash
./scripts/cypress-chrome.sh component  # For component tests
./scripts/cypress-chrome.sh            # For E2E tests
```

## Permanent Fix Implementation

### Step 1: Environment Variable
Add to `~/.zshrc` or `~/.bash_profile`:
```bash
export CYPRESS_BROWSER_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

### Step 2: VS Code Settings
If using VS Code, add to `.vscode/settings.json`:
```json
{
  "terminal.integrated.env.osx": {
    "CYPRESS_BROWSER_PATH": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  }
}
```

### Step 3: Project-specific .env
Create `.env.local`:
```
CYPRESS_BROWSER_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome
```

## Verification Steps
1. Close all browser instances
2. Kill all Cypress processes: `pkill -f cypress`
3. Use the explicit path method: `CYPRESS_BROWSER_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npx cypress open --component`
4. In Cypress UI, verify Chrome is selected in the browser dropdown
5. If Brave still opens, manually select Chrome from the dropdown in the Cypress UI

## Important Notes
- The `--browser chrome` flag sets the initial selection but can be overridden by UI selection
- The Cypress UI remembers your last browser choice - check the dropdown
- Using the full executable path is the most reliable method
- This issue is specific to having multiple Chromium-based browsers installed

## Quick Command Reference
```bash
# Most reliable launch command
CYPRESS_BROWSER_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npx cypress open --component

# Alternative with explicit selection
npx cypress open --component --browser "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```
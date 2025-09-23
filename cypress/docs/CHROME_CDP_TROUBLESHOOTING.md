# Chrome DevTools Protocol Connection Issues - Troubleshooting Guide

## 🔴 Problem Description

When running Cypress tests with Chrome browser, you may encounter the following error:
```
Still waiting to connect to Chrome, retrying in 1 second (attempt X/62)
Cypress failed to make a connection to the Chrome DevTools Protocol after retrying for 50 seconds.
Error: connect ECONNREFUSED 127.0.0.1:XXXXX
```

## 🔍 Root Cause

Chrome 118 (and some older versions) have compatibility issues with the Chrome DevTools Protocol (CDP) when running in headless mode with Cypress 14.5.4. This prevents Cypress from establishing the required connection to control the browser.

## ✅ Solutions

### Solution 1: Use Electron Browser (Recommended)

Electron browser works reliably with Cypress and doesn't have CDP issues.

```bash
# For component tests
npm run test:component:electron

# For E2E tests
npx cypress run --e2e --browser electron --headless

# For interactive mode
npx cypress open --component --browser electron
```

### Solution 2: Reset Chrome and Cypress Profiles

Run the Chrome reset script to clear any corrupted profiles:

```bash
# Run the reset script
bash scripts/reset-chrome-cypress.sh

# Or manually:
pkill -f "Google Chrome"
rm -rf ~/Library/Application\ Support/Cypress/cy/production/browsers/chrome-stable
rm -rf ~/Library/Application\ Support/Cypress/cy/development/browsers/chrome-stable
```

### Solution 3: Use Chrome with Special Flags

The cypress.config.ts has been updated with Chrome launch flags:

```javascript
on('before:browser:launch', (browser, launchOptions) => {
  if (browser.family === 'chromium' && browser.name !== 'electron') {
    launchOptions.args.push('--disable-gpu');
    launchOptions.args.push('--no-sandbox');
    launchOptions.args.push('--disable-dev-shm-usage');
    launchOptions.args.push('--disable-web-security');
    launchOptions.args.push('--disable-features=IsolateOrigins,site-per-process');
    return launchOptions;
  }
});
```

### Solution 4: Update Chrome

Chrome 118 is outdated (from October 2023). Update to the latest version:

1. Download latest Chrome from https://www.google.com/chrome/
2. Install and restart your computer
3. Verify version: `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --version`

## 🛠️ Prevention

### Package.json Scripts

The following scripts have been added to handle Chrome issues:

```json
{
  "scripts": {
    "pre-test:cleanup": "lsof -ti :3003 | xargs kill -9 2>/dev/null || true && pkill -f webpack || true && pkill -f 'Google Chrome' || true && sleep 2",
    "chrome:reset": "bash scripts/reset-chrome-cypress.sh",
    "test:fix": "npm run chrome:reset && npm run test:component",
    "test:component:electron": "npm run pre-test:cleanup && cypress run --component --browser electron --headless"
  }
}
```

### Port Conflicts

If you see `Error: listen EADDRINUSE: address already in use ::1:3003`:

```bash
# Kill processes on port 3003
lsof -ti :3003 | xargs kill -9

# Or use the cleanup script
npm run pre-test:cleanup
```

## 📊 Browser Compatibility Matrix

| Browser | Version | Headless | Interactive | Status |
|---------|---------|----------|-------------|--------|
| Electron | Latest | ✅ | ✅ | **Recommended** |
| Chrome | 118 | ❌ | ⚠️ | CDP Issues |
| Chrome | 120+ | ✅ | ✅ | Works with flags |
| Firefox | Latest | ✅ | ✅ | Alternative option |

## 🚀 Quick Commands

```bash
# Best option - always works
npm run test:component:electron

# After Chrome reset
npm run test:fix

# Interactive mode with Electron
npx cypress open --component --browser electron

# Check what's using ports
lsof -i :3002
lsof -i :3003
```

## ❓ FAQ

**Q: Why does Chrome work in interactive mode but not headless?**
A: Interactive mode uses different CDP connection settings. Headless mode requires stricter protocol compliance.

**Q: Will updating Chrome fix the issue permanently?**
A: Usually yes, but Electron is more reliable for CI/CD environments.

**Q: Can I use Firefox instead?**
A: Yes, Firefox is a good alternative: `npx cypress run --browser firefox`

**Q: Why does Electron work when Chrome doesn't?**
A: Electron is built specifically for automation and has better integration with Node.js-based tools like Cypress.

## 📝 Additional Resources

- [Cypress Browser Launching](https://docs.cypress.io/guides/guides/launching-browsers)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Cypress Configuration](https://docs.cypress.io/guides/references/configuration)

---

**Last Updated**: September 23, 2025
**Affects**: Chrome 118 with Cypress 14.5.4
**Solution Status**: ✅ Workaround implemented (use Electron)
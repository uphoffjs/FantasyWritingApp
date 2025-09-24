# Critical Dependencies Audit

**Date**: 2025-09-24
**Project**: FantasyWritingApp

## Core Dependencies for Vite Compatibility

### ✅ React Native Web Stack
- **react-native-web**: `0.21.1` - Latest version, fully compatible with Vite
- **react-native-svg**: `15.13.0` - Will need vite-plugin-svgr for compatibility
- **@react-navigation/native**: `6.1.18` - Compatible, may need CommonJS plugin

### ✅ State Management
- **zustand**: `5.0.8` - Latest major version, excellent Vite compatibility
- **@react-native-async-storage/async-storage**: `2.2.0` - Known module resolution issues with strict ESM
  - ⚠️ Currently causing build failures in Webpack
  - Will need special handling in Vite config

## Vite Compatibility Assessment

| Package | Version | Vite Compatibility | Notes |
|---------|---------|-------------------|--------|
| react-native-web | 0.21.1 | ✅ Excellent | Native ESM support |
| react-native-svg | 15.13.0 | ⚠️ Needs plugin | Requires vite-plugin-svgr |
| @react-navigation/native | 6.1.18 | ✅ Good | May need CommonJS handling |
| zustand | 5.0.8 | ✅ Excellent | Pure ESM, tree-shakeable |
| @react-native-async-storage/async-storage | 2.2.0 | ⚠️ Problematic | Module resolution issues |

## Required Vite Plugins

Based on the dependency audit, we'll need:
1. **@vitejs/plugin-react** - React support with Fast Refresh
2. **vite-plugin-react-native-web** - React Native Web compatibility
3. **@originjs/vite-plugin-commonjs** - For CommonJS modules
4. **vite-plugin-svgr** - SVG as React components
5. **rollup-plugin-node-polyfills** - Node.js polyfills

## Migration Considerations

### High Priority Issues
1. **AsyncStorage Module Resolution**: Currently breaking builds, needs immediate fix
   - Solution: Add explicit alias in Vite config
   - May need to patch the package

2. **SVG Handling**: react-native-svg requires special configuration
   - Solution: vite-plugin-svgr with proper config

### Medium Priority
1. **CommonJS Modules**: Some React Native packages use CommonJS
   - Solution: @originjs/vite-plugin-commonjs

2. **Node Polyfills**: Some packages expect Node.js globals
   - Solution: rollup-plugin-node-polyfills

## Recommendations

1. **Fix AsyncStorage first** - This is blocking production builds
2. **Install Vite with all compatibility plugins** upfront to avoid issues
3. **Create comprehensive aliases** for React Native packages
4. **Test each major dependency** individually after Vite setup

## Next Steps
1. Install Vite core dependencies
2. Install all compatibility plugins
3. Configure comprehensive module resolution
4. Test AsyncStorage specifically
5. Validate each critical dependency works

---

*This audit will be updated as migration progresses*
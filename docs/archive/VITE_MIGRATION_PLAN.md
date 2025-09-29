# Vite Migration Plan for FantasyWritingApp

## Executive Summary

This document outlines a comprehensive migration strategy from Webpack to Vite for the FantasyWritingApp React Native Web project. The migration addresses critical performance issues identified in TODO.md, specifically the 3-5 minute test execution timeouts caused by Webpack's bundling overhead.

**Key Benefits:**
- **10-20x faster test execution**: From 3-5 minutes to 15-30 seconds
- **Instant dev server startup**: <1 second vs 4-5 seconds
- **Near-instant HMR**: <100ms vs variable slow reloads
- **Reduced bundle size**: 10-20% smaller through better tree-shaking
- **Simplified configuration**: 70% less configuration code
- **Better developer experience**: Modern ESM-first approach

## Current State Analysis

### Pain Points
1. **Test Performance Crisis**
   - Component tests timing out after 3-5 minutes
   - Despite aggressive webpack.test.js optimizations
   - Blocking continuous integration workflows

2. **Development Velocity**
   - Slow initial builds (~4-5 seconds)
   - Inconsistent HMR performance
   - Complex webpack configuration (200+ lines)

3. **Technical Debt**
   - Multiple webpack configs to maintain
   - Complex babel transformation pipeline
   - Heavy node_modules transformations

### Current Architecture
- **Build Tool**: Webpack 5.101.3
- **Entry Point**: index.web.entry.js
- **Dev Server**: Port 3002 (E2E), Port 3003 (Component tests)
- **Key Dependencies**: React Native Web, React Navigation, Zustand
- **Test Framework**: Cypress with webpack dev server

## Migration Strategy Overview

### 4-Phase Approach
1. **Phase 1**: Parallel Setup (1-2 days, Low Risk)
2. **Phase 2**: Component Test Migration (2-3 days, Medium Risk)
3. **Phase 3**: Development Server Migration (2-3 days, Medium Risk)
4. **Phase 4**: Production Build Migration (3-4 days, High Risk)

**Total Timeline**: 8-12 days of development effort

## Phase 1: Parallel Setup (Days 1-2)

### Objectives
- Install and configure Vite alongside existing Webpack
- Validate React Native Web compatibility
- Establish baseline functionality

### Implementation Steps

#### 1.1 Install Dependencies
```bash
npm install --save-dev \
  vite@^5.0.0 \
  @vitejs/plugin-react@^4.2.0 \
  vite-plugin-react-native-web@^1.0.0 \
  @originjs/vite-plugin-commonjs@^1.0.3 \
  vite-plugin-svgr@^4.2.0 \
  rollup-plugin-node-polyfills@^0.2.1
```

#### 1.2 Create vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { reactNativeWeb } from 'vite-plugin-react-native-web';
import commonjs from '@originjs/vite-plugin-commonjs';
import svgr from 'vite-plugin-svgr';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react({
      fastRefresh: true,
      babel: {
        plugins: [
          ['@babel/plugin-transform-class-properties', { loose: true }],
        ]
      }
    }),
    reactNativeWeb(),
    commonjs({
      include: ['react-native-svg/**']
    }),
    svgr(),
  ],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'react-native-svg': 'react-native-svg/lib/commonjs',
    },
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js'],
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    rollupOptions: {
      plugins: [nodePolyfills()],
    },
  },
  define: {
    'process.env': process.env,
    global: 'globalThis',
  },
});
```

#### 1.3 Add NPM Scripts
```json
{
  "scripts": {
    "vite:dev": "vite",
    "vite:build": "vite build",
    "vite:preview": "vite preview"
  }
}
```

### Validation Criteria
- ✅ Vite dev server starts successfully on port 5173
- ✅ Basic React Native Web components render
- ✅ No console errors or warnings
- ✅ Navigation works correctly

## Phase 2: Component Test Migration (Days 3-5)

### Objectives
- Configure Cypress to use Vite for component testing
- Achieve <60 second test execution time
- Maintain test coverage

### Implementation Steps

#### 2.1 Install Cypress Vite Plugin
```bash
npm install --save-dev @cypress/vite-dev-server
```

#### 2.2 Update cypress.config.ts
```typescript
import { defineConfig } from 'cypress';
import vitePreprocessor from '@cypress/vite-dev-server';

export default defineConfig({
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
      viteConfig: require('./vite.config.ts'),
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
  },
  // ... existing e2e config
});
```

#### 2.3 Create Optimized Test Config
```typescript
// vite.config.test.ts
export default defineConfig({
  ...baseConfig,
  mode: 'test',
  optimizeDeps: {
    entries: ['cypress/component/**/*.cy.{ts,tsx}'],
    force: true,
  },
  server: {
    port: 3003,
    fs: {
      strict: false,
    },
  },
});
```

### Validation Criteria
- ✅ All component tests pass
- ✅ Test execution time <60 seconds
- ✅ No flaky tests introduced
- ✅ Coverage metrics maintained

## Phase 3: Development Server Migration (Days 6-8)

### Objectives
- Replace webpack dev server with Vite
- Update all development scripts
- Ensure feature parity

### Implementation Steps

#### 3.1 Update Entry Point
Create `index.html` for Vite:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fantasy Writing App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.web.entry.js"></script>
  </body>
</html>
```

#### 3.2 Update NPM Scripts
```json
{
  "scripts": {
    "dev": "vite --port 3002",
    "web": "vite --port 3002",
    "dev:webpack": "webpack serve --mode development", // Keep as fallback
  }
}
```

#### 3.3 Environment Variables
Update to use `import.meta.env`:
```typescript
// Before: process.env.REACT_APP_*
// After: import.meta.env.VITE_*
```

### Validation Criteria
- ✅ Dev server starts in <2 seconds
- ✅ HMR updates in <200ms
- ✅ All features work identically to webpack version
- ✅ No regression in functionality

## Phase 4: Production Build Migration (Days 9-12)

### Objectives
- Migrate production builds to Vite
- Optimize bundle size and performance
- Validate deployment compatibility

### Implementation Steps

#### 4.1 Production Configuration
```typescript
// vite.config.prod.ts
export default defineConfig({
  ...baseConfig,
  mode: 'production',
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-native-web'],
          navigation: ['@react-navigation/native', '@react-navigation/native-stack'],
        },
      },
    },
  },
});
```

#### 4.2 Update Build Scripts
```json
{
  "scripts": {
    "build": "vite build",
    "build:analyze": "vite build --mode analyze",
    "build:webpack": "webpack --config webpack.prod.js" // Fallback
  }
}
```

### Validation Criteria
- ✅ Production build completes in <30 seconds
- ✅ Bundle size reduced by 10-20%
- ✅ All features work in production
- ✅ Performance metrics improved
- ✅ Successful deployment to hosting

## Risk Assessment & Mitigation

### High Risk Items
1. **React Native Package Compatibility**
   - **Risk**: Some RN packages may not work with Vite
   - **Mitigation**: Test critical packages early, maintain webpack fallback

2. **Production Build Differences**
   - **Risk**: Rollup may produce different output than webpack
   - **Mitigation**: Extensive testing, gradual rollout with feature flags

### Medium Risk Items
1. **Developer Workflow Changes**
   - **Risk**: Team needs to adapt to new tooling
   - **Mitigation**: Documentation, training session, migration guide

2. **CI/CD Pipeline Updates**
   - **Risk**: Build scripts and pipelines need updating
   - **Mitigation**: Update in parallel, test thoroughly

### Low Risk Items
1. **Component Testing**
   - **Risk**: Minimal, isolated environment
   - **Mitigation**: Keep webpack config as backup

## Success Metrics

### Performance Targets
| Metric | Current (Webpack) | Target (Vite) | Minimum Acceptable |
|--------|------------------|---------------|-------------------|
| Dev Server Startup | 4-5 seconds | <1 second | <2 seconds |
| HMR Update | Variable/slow | <100ms | <200ms |
| Component Tests | 3-5 minutes | 15-30 seconds | <60 seconds |
| Production Build | ~30-60 seconds | 10-20 seconds | <30 seconds |
| Bundle Size | Baseline | -20% | -10% |

### Quality Targets
- Zero functional regressions
- Maintain or improve test coverage
- No increase in bug reports
- Developer satisfaction improvement

## Rollback Plan

Each phase can be independently rolled back:

### Phase Rollback Procedures
1. **Phase 1**: Simply remove Vite dependencies and config
2. **Phase 2**: Revert cypress.config.ts to use webpack
3. **Phase 3**: Switch npm scripts back to webpack
4. **Phase 4**: Use build:webpack for production

### Emergency Rollback
```bash
# Full rollback script
git checkout main
npm run build:webpack
npm run dev:webpack
```

## Timeline & Resources

### Development Timeline
- **Week 1**: Phase 1 & 2 (Parallel setup + Component tests)
- **Week 2**: Phase 3 (Development server)
- **Week 3**: Phase 4 (Production build) + Testing
- **Week 4**: Documentation, training, and monitoring

### Resource Requirements
- 1-2 developers for implementation
- QA testing throughout migration
- DevOps support for CI/CD updates

## Next Steps

1. **Approval**: Get stakeholder buy-in on migration plan
2. **Branch Creation**: Create `feature/vite-migration` branch
3. **Phase 1 Start**: Begin with parallel setup
4. **Weekly Reviews**: Progress checkpoints
5. **Go/No-Go Decisions**: After each phase

## Appendix

### A. Package Version Recommendations
```json
{
  "vite": "^5.0.0",
  "@vitejs/plugin-react": "^4.2.0",
  "vite-plugin-react-native-web": "^1.0.0",
  "@cypress/vite-dev-server": "^5.0.0"
}
```

### B. Configuration Mapping

| Webpack Config | Vite Equivalent |
|----------------|-----------------|
| entry | index.html with script module |
| output.path | build.outDir |
| resolve.alias | resolve.alias |
| module.rules | plugins |
| devServer.port | server.port |
| optimization | build.rollupOptions |

### C. Common Migration Issues

1. **Import.meta.env undefined**
   - Solution: Add proper TypeScript types

2. **CommonJS modules not working**
   - Solution: Use @originjs/vite-plugin-commonjs

3. **Process is not defined**
   - Solution: Define in vite.config.ts

4. **React Native SVG issues**
   - Solution: Proper alias configuration

### D. Useful Commands

```bash
# Development
npm run vite:dev

# Build
npm run vite:build

# Preview production build
npm run vite:preview

# Run tests with Vite
npm run test:component

# Analyze bundle
npm run build:analyze
```

---

**Document Version**: 1.0
**Created**: 2025-09-24
**Status**: Ready for Review
**Author**: Claude Code Analysis

**Note**: This plan is designed for incremental migration with minimal risk. Each phase can be completed independently with rollback capability. Do not begin implementation until this plan is reviewed and approved.
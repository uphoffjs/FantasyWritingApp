# Web Compatibility Guide

**Version**: 1.0.0
**Last Updated**: 2025-09-27
**Status**: Active

## Overview

This guide documents the web compatibility patterns and conventions for the FantasyWritingApp following the React Native conversion. It provides guidelines for creating and maintaining `.web.tsx` files and ensuring optimal performance on web platforms.

## Table of Contents

1. [Platform-Specific File Patterns](#platform-specific-file-patterns)
2. [When to Use .web.tsx Files](#when-to-use-webtsx-files)
3. [Implementation Guidelines](#implementation-guidelines)
4. [Current Web-Specific Files](#current-web-specific-files)
5. [Performance Optimizations](#performance-optimizations)
6. [Testing Requirements](#testing-requirements)
7. [Best Practices](#best-practices)

---

## Platform-Specific File Patterns

### File Naming Convention

React Native's Metro bundler automatically selects platform-specific files based on the following pattern:

```
ComponentName.tsx          # Default/Native implementation
ComponentName.web.tsx      # Web-specific implementation
ComponentName.ios.tsx      # iOS-specific implementation
ComponentName.android.tsx  # Android-specific implementation
```

### Current Implementation Status

✅ **All 11 web-specific files have corresponding native versions**

| Component | Native File | Web File | Purpose |
|-----------|------------|----------|---------|
| ElementCard | ✅ | ✅ | Optimized card rendering for web |
| CreateElementModal | ✅ | ✅ | Web-optimized modal behavior |
| ProgressRing | ✅ | ✅ | Web-safe SVG rendering |
| ElementEditor | ✅ | ✅ | Web form optimizations |
| ElementBrowser | ✅ | ✅ | Web list virtualization |
| TemplateSelector | ✅ | ✅ | Web dropdown behavior |
| RelationshipManager | ✅ | ✅ | Complex web interactions |
| LoginScreen | ✅ | ✅ | Web authentication flow |
| ProjectScreen | ✅ | ✅ | Web layout optimizations |
| ElementScreen | ✅ | ✅ | Web navigation patterns |
| ProjectListScreen | ✅ | ✅ | Web grid layouts |

---

## When to Use .web.tsx Files

### ✅ Use .web.tsx When:

1. **Web-Specific Optimizations Needed**
   - Custom CSS animations not available in React Native
   - Web-only performance optimizations (e.g., CSS Grid, Flexbox features)
   - Browser-specific features (e.g., clipboard API, file downloads)

2. **Different User Interaction Patterns**
   - Hover states for desktop browsers
   - Right-click context menus
   - Keyboard shortcuts beyond basic navigation
   - Drag and drop functionality

3. **Web-Specific Dependencies**
   - Using web-only libraries (e.g., web-specific charts, rich text editors)
   - Integrating with browser APIs
   - SEO optimizations (meta tags, structured data)

4. **Performance Considerations**
   - Avoiding ThemeProvider overhead on web
   - Using CSS-in-JS for better web performance
   - Implementing virtual scrolling differently for web

5. **Layout Differences**
   - Responsive grid layouts for larger screens
   - Multi-column layouts for desktop
   - Fixed headers/footers for web navigation

### ❌ Don't Use .web.tsx When:

1. **Component Logic is Identical**
   - Simple components that render the same on all platforms
   - No platform-specific optimizations needed
   - Using only React Native core components

2. **Maintenance Overhead**
   - Minor styling differences that can be handled with `Platform.select()`
   - Single conditional statements would suffice
   - Changes would need to be duplicated across files

---

## Implementation Guidelines

### 1. Interface Consistency

**Always maintain the same TypeScript interface across platform files:**

```typescript
// ComponentName.tsx (native)
interface ComponentNameProps {
  title: string;
  onPress: () => void;
  testID?: string;
}

// ComponentName.web.tsx (web)
interface ComponentNameProps {
  title: string;
  onPress: () => void;  // Same prop name, even if implementation differs
  testID?: string;
}
```

### 2. Import Management

**Native Version:**
```typescript
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
```

**Web Version:**
```typescript
import React from 'react';
// Can still use react-native-web components
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
// Or use HTML elements with proper styling
```

### 3. Theme Handling

**Pattern 1: Optional Theme Hook (Recommended)**
```typescript
// Native version uses theme
const theme = useTheme();

// Web version with fallback
const useOptionalTheme = () => {
  try {
    return useTheme();
  } catch {
    return null;  // Fallback to hardcoded values
  }
};
```

**Pattern 2: Hardcoded Values for Web**
```typescript
// Web version with static theme
const webTheme = {
  colors: {
    primary: '#C9A961',
    secondary: '#8B4513',
    text: '#1A1613',
    background: '#F5F2E8'
  }
};
```

### 4. Event Handling

**Ensure consistent event names across platforms:**
```typescript
// Both native and web use 'onPress'
<TouchableOpacity onPress={handleAction}>

// Web can add additional web-only events
<div
  onClick={handleAction}      // Maps to onPress
  onMouseEnter={handleHover}  // Web-only
  onContextMenu={handleRightClick}  // Web-only
>
```

### 5. Testing Compatibility

**Always include testID for cross-platform testing:**
```typescript
// Native
<View testID="element-card" />

// Web
<div data-testid="element-card" />
// Or use getTestProps utility
<div {...getTestProps('element-card')} />
```

---

## Current Web-Specific Files

### Components (7 files)

1. **ElementCard.web.tsx**
   - Removes ThemeProvider dependency
   - Uses hardcoded color values
   - Optimized for web rendering

2. **CreateElementModal.web.tsx**
   - Web-optimized modal behavior
   - Better keyboard handling for web forms
   - CSS transitions instead of React Native animations

3. **ProgressRing.web.tsx**
   - Web-safe SVG rendering
   - No ThemeProvider dependency
   - CSS animations for smooth progress

4. **ElementEditor.web.tsx**
   - HTML form elements for better web UX
   - Native browser validation
   - Web-specific input types

5. **ElementBrowser.web.tsx**
   - CSS Grid for responsive layouts
   - Virtual scrolling optimized for web
   - Hover interactions

6. **TemplateSelector.web.tsx**
   - Native HTML select for better accessibility
   - Browser-native dropdown behavior

7. **RelationshipManager.web.tsx**
   - Drag-and-drop for web
   - Complex mouse interactions
   - Web-specific visualization

### Screens (4 files)

1. **LoginScreen.web.tsx**
   - Web authentication flow
   - Browser password management
   - Social login integrations

2. **ProjectScreen.web.tsx**
   - Responsive layout for desktop
   - Multi-column view
   - Keyboard navigation

3. **ElementScreen.web.tsx**
   - Web-specific navigation patterns
   - Browser history integration
   - Deep linking support

4. **ProjectListScreen.web.tsx**
   - CSS Grid layouts
   - Responsive card sizing
   - Hover preview states

---

## Performance Optimizations

### Bundle Size Optimization

```javascript
// webpack.config.js or metro.config.js
module.exports = {
  resolver: {
    resolverMainFields: ['react-native', 'browser', 'main'],
    // Platform-specific extensions
    platforms: ['web', 'ios', 'android'],
  },
  // Web-specific optimizations
  web: {
    // Enable code splitting
    asyncChunks: true,
    // Tree shaking
    optimization: {
      usedExports: true,
      sideEffects: false,
    }
  }
};
```

### Lazy Loading

```typescript
// Web version can use React.lazy
const HeavyComponent = React.lazy(() => import('./HeavyComponent.web'));

// Native version imports directly
import HeavyComponent from './HeavyComponent';
```

### Image Optimization

```typescript
// Web version
<img
  src={imageSrc}
  loading="lazy"  // Native lazy loading
  srcSet={srcSet}  // Responsive images
/>

// Native version
<Image
  source={{ uri: imageSrc }}
  resizeMode="cover"
/>
```

---

## Testing Requirements

### Cross-Platform Test Coverage

1. **Unit Tests (Jest + React Native Testing Library)**
   ```typescript
   // Test both implementations
   describe('ComponentName', () => {
     describe('Native', () => {
       jest.mock('../ComponentName', () => require('../ComponentName.tsx'));
       // Native tests
     });

     describe('Web', () => {
       jest.mock('../ComponentName', () => require('../ComponentName.web.tsx'));
       // Web tests
     });
   });
   ```

2. **E2E Tests (Cypress for Web)**
   ```javascript
   // cypress/e2e/web-specific.cy.js
   describe('Web-Specific Features', () => {
     it('handles hover states', () => {
       cy.get('[data-cy="element-card"]').trigger('mouseenter');
       cy.get('[data-cy="hover-menu"]').should('be.visible');
     });
   });
   ```

3. **Browser Compatibility Testing**
   - Chrome (latest 2 versions)
   - Firefox (latest 2 versions)
   - Safari (latest 2 versions)
   - Edge (latest 2 versions)

### Performance Testing

```javascript
// performance-test.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'json',
    port: chrome.port
  };

  const runnerResult = await lighthouse('http://localhost:3002', options);

  // Check performance metrics
  const { performance } = runnerResult.lhr.categories;
  expect(performance.score).toBeGreaterThan(0.9); // 90+ score
}
```

---

## Best Practices

### 1. Code Organization

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx          # Native implementation
│   │   ├── Button.web.tsx      # Web implementation
│   │   ├── Button.test.tsx     # Shared tests
│   │   └── index.ts            # Export logic
```

### 2. Conditional Exports

```typescript
// index.ts
import { Platform } from 'react-native';

// Metro bundler handles this automatically, but for clarity:
export { Button } from './Button';  // Will auto-select .web.tsx on web
```

### 3. Shared Utilities

```typescript
// utils/platform.ts
export const isWeb = Platform.OS === 'web';
export const isNative = Platform.OS !== 'web';
export const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

// Use for minor differences
const styles = StyleSheet.create({
  container: {
    padding: isWeb ? 24 : 16,
    ...Platform.select({
      web: { cursor: 'pointer' },
      default: {}
    })
  }
});
```

### 4. Type Safety

```typescript
// types/platform.ts
export interface WebOnlyProps {
  onHover?: () => void;
  onRightClick?: () => void;
}

export interface NativeOnlyProps {
  onLongPress?: () => void;
}

// Component props
interface ComponentProps extends
  Partial<WebOnlyProps>,
  Partial<NativeOnlyProps> {
  // Shared props
  title: string;
  onPress: () => void;
}
```

### 5. Documentation

Always document platform differences in component files:

```typescript
/**
 * Button Component
 *
 * Platform Differences:
 * - Web: Supports hover states and right-click
 * - Native: Supports long press and haptic feedback
 *
 * @platform web, ios, android
 */
```

---

## Linting Rules

### ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    // Enforce platform-specific imports
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['*.web', '*.ios', '*.android'],
          message: 'Use platform-agnostic imports. Platform selection is automatic.'
        }
      ]
    }],

    // Ensure testID presence
    'react/require-testid': ['warn', {
      testIDAttribute: 'testID',
      requiredFor: ['TouchableOpacity', 'Pressable', 'Button']
    }]
  },

  overrides: [
    {
      // Web-specific rules
      files: ['*.web.tsx', '*.web.ts'],
      rules: {
        // Allow web-specific patterns
        'no-restricted-globals': 'off',
        // Allow DOM manipulation for web
        'no-undef': ['error', { typeof: true }]
      }
    }
  ]
};
```

### Custom Lint Rules

```javascript
// eslint-rules/platform-consistency.js
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure .web.tsx files have corresponding native files'
    }
  },
  create(context) {
    return {
      Program(node) {
        const filename = context.getFilename();
        if (filename.endsWith('.web.tsx')) {
          const nativeFile = filename.replace('.web.tsx', '.tsx');
          if (!fs.existsSync(nativeFile)) {
            context.report({
              node,
              message: 'Web-specific file missing corresponding native implementation'
            });
          }
        }
      }
    };
  }
};
```

---

## Migration Checklist

When creating a new `.web.tsx` file:

- [ ] Create corresponding native `.tsx` file
- [ ] Maintain identical TypeScript interfaces
- [ ] Include testID/data-testid attributes
- [ ] Document platform differences in comments
- [ ] Add tests for both implementations
- [ ] Verify bundle size impact
- [ ] Test on all target browsers
- [ ] Update this documentation if patterns change

---

## Troubleshooting

### Common Issues and Solutions

1. **Module Resolution Errors**
   ```
   Error: Cannot find module './Component.web'
   Solution: Let Metro bundler handle platform selection automatically
   ```

2. **Theme Provider Errors on Web**
   ```
   Error: Cannot read property 'theme' of undefined
   Solution: Use optional theme pattern with fallbacks
   ```

3. **Event Handler Mismatches**
   ```
   Warning: Unknown event handler property onPress
   Solution: Map onPress to onClick for HTML elements
   ```

4. **Style Differences**
   ```
   Issue: Styles look different on web vs native
   Solution: Use StyleSheet.create() for consistent styling
   ```

---

## Resources

- [React Native Web Documentation](https://necolas.github.io/react-native-web/)
- [Platform-Specific Code Guide](https://reactnative.dev/docs/platform-specific-code)
- [Metro Bundler Configuration](https://facebook.github.io/metro/docs/configuration)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Cypress Web Testing](https://www.cypress.io/)

---

**Maintained by**: Development Team
**Review Schedule**: Quarterly
**Next Review**: Q1 2025
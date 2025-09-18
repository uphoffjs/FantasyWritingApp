# Storybook Usage Guide

## 📚 Overview

Storybook is our component development environment for building, documenting, and testing UI components in isolation. It's configured to work with React Native Web, allowing us to develop components that work across iOS, Android, and Web platforms.

## 🚀 Quick Start

### Running Storybook

```bash
# Start Storybook development server
npm run storybook

# Storybook will be available at:
# http://localhost:6006
```

### Building Storybook for Production

```bash
# Build static Storybook site
npm run build-storybook

# Output will be in storybook-static/
```

## 📁 Project Structure

```
src/
├── stories/                    # Storybook stories
│   ├── Button.stories.ts      # Example button stories
│   ├── Header.stories.ts      # Header component stories
│   ├── Page.stories.ts        # Page layout stories
│   └── DesignTokens.stories.tsx # Design system documentation
├── components/                 # React Native components
│   ├── common/                # Shared components
│   ├── native/                # Mobile-specific
│   └── web/                   # Web-specific
└── design-tokens/             # Design system tokens
    └── tokens.ts              # Color and style tokens

.storybook/                    # Storybook configuration
├── main.ts                    # Main configuration
└── preview.ts                 # Global decorators and parameters
```

## 📝 Writing Stories

### Basic Story Structure

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

// Meta configuration
const meta = {
  title: 'Category/ComponentName',  // Organization in sidebar
  component: MyComponent,
  parameters: {
    layout: 'centered',  // or 'fullscreen', 'padded'
    docs: {
      description: {
        component: 'Component description for docs'
      }
    }
  },
  tags: ['autodocs'],  // Auto-generate documentation
  argTypes: {
    // Define controls for props
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger']
    },
    size: {
      control: 'radio',
      options: ['small', 'medium', 'large']
    }
  }
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// Individual stories
export const Default: Story = {
  args: {
    label: 'Click me',
    variant: 'primary'
  }
};

export const Secondary: Story = {
  args: {
    label: 'Secondary Action',
    variant: 'secondary'
  }
};

// Story with play function for interactions
export const Interactive: Story = {
  args: {
    label: 'Test me'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
  }
};
```

### React Native Component Stories

For React Native components that work on web:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';

const Card = ({ title, content }) => (
  <View style={styles.card}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.content}>{content}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: '#F5F0E6',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: '#666',
  }
});

const meta = {
  title: 'Components/Card',
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;
```

## 🎨 Design Tokens Integration

Our design tokens are integrated into Storybook for consistent styling:

```typescript
import { tokens } from '../design-tokens/tokens';

// Use tokens in your components
const styles = {
  backgroundColor: tokens.color.ui.parchment[100],
  color: tokens.color.ui.ink.primary,
  borderColor: tokens.color.ui.metals.gold,
};
```

View all design tokens at: http://localhost:6006/?path=/story/design-system-color-tokens--all-tokens

## 🧪 Testing in Storybook

### Interaction Testing

```typescript
import { within, userEvent, expect } from '@storybook/test';

export const FormSubmission: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Find elements
    const emailInput = canvas.getByLabelText('Email');
    const submitButton = canvas.getByRole('button', { name: /submit/i });
    
    // Interact
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(submitButton);
    
    // Assert
    await expect(canvas.getByText('Success!')).toBeInTheDocument();
  }
};
```

### Accessibility Testing

```typescript
// In preview.ts
export const parameters = {
  a11y: {
    // Accessibility options
    element: '#storybook-root',
    config: {},
    options: {},
    manual: true,
  },
};
```

## 🎛️ Addons

### Essential Addons

1. **Controls** - Dynamically edit props
2. **Actions** - Log actions (onClick, onChange, etc.)
3. **Viewport** - Test responsive designs
4. **Docs** - Auto-generated documentation
5. **A11y** - Accessibility testing

### Using Addons

```typescript
// Viewport addon for responsive testing
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'iphone12',
    },
  },
};

// Actions addon for event logging
export const Clickable: Story = {
  argTypes: {
    onClick: { action: 'clicked' },
    onChange: { action: 'changed' },
  },
};
```

## 🎯 Best Practices

### 1. Organization

- Group related components using folder structure in `title`
- Use consistent naming: `Category/Subcategory/ComponentName`
- Keep stories close to components

### 2. Documentation

- Add component descriptions in meta
- Document each prop in argTypes
- Include usage examples in MDX docs

### 3. Story Variations

- Create stories for each significant state
- Include edge cases (empty, loading, error)
- Test with realistic data

### 4. Cross-Platform

- Test components in different viewports
- Ensure touch interactions work
- Verify keyboard navigation

## 🔧 Configuration

### Main Configuration (`.storybook/main.ts`)

```typescript
export default {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-react-native-web',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
};
```

### Preview Configuration (`.storybook/preview.ts`)

```typescript
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

// Global decorators
export const decorators = [
  (Story) => (
    <div style={{ padding: '1rem' }}>
      <Story />
    </div>
  ),
];
```

## 📚 Component Categories

### Atoms
- Buttons
- Inputs
- Typography
- Icons
- Badges

### Molecules
- Cards
- Form Fields
- Navigation Items
- List Items

### Organisms
- Headers
- Forms
- Modals
- Lists
- Sidebars

### Templates
- Page Layouts
- Dashboard
- Settings Page
- Content Pages

## 🚀 Deployment

### GitHub Pages

```yaml
# .github/workflows/storybook.yml
name: Deploy Storybook

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build-storybook
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./storybook-static
```

## 🔍 Troubleshooting

### Common Issues

1. **Component not rendering**
   - Check React Native Web compatibility
   - Verify imports are correct
   - Ensure styles are web-compatible

2. **Styles not applying**
   - Use StyleSheet.create() for React Native components
   - Check platform-specific code
   - Verify token imports

3. **Story not appearing**
   - Check file naming (*.stories.tsx)
   - Verify story export
   - Check title path in meta

## 📖 Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [React Native Web](https://necolas.github.io/react-native-web/)
- [Storybook Addons](https://storybook.js.org/addons)
- [Component Story Format](https://storybook.js.org/docs/react/api/csf)

## 🎯 Quick Commands

```bash
# Development
npm run storybook          # Start Storybook dev server

# Building
npm run build-storybook     # Build static Storybook

# Testing
npm run test-storybook      # Run Storybook tests

# Linting
npm run lint:stories        # Lint story files
```

---

For more information, visit Storybook at http://localhost:6006 when running locally.
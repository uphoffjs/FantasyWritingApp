# Storybook Usage Guide

## Overview
This guide covers how to use Storybook for developing, testing, and documenting React Native components in the FantasyWritingApp.

## Quick Start

### Starting Storybook
```bash
# Start Storybook development server
npm run storybook

# Access at http://localhost:6006
```

### Finding Components
1. Navigate to http://localhost:6006
2. Use the sidebar to browse component categories:
   - **Atoms**: Basic building blocks (Button, Icon, Text)
   - **Molecules**: Simple component groups (FormField, Card)
   - **Organisms**: Complex components (Header, Form, List)
   - **Pages**: Full page layouts (LoginScreen, ProjectList)

## Development Workflow

### 1. Component-First Development
```tsx
// 1. Create component in src/components/
// 2. Create story in src/stories/
// 3. Test variations in Storybook
// 4. Integrate into app screens
```

### 2. Creating Stories

#### Basic Story Structure
```tsx
// src/stories/atoms/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../components/common/Button';

const meta = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    title: 'Click Me',
    variant: 'primary',
  },
};
```

### 3. Testing Variations

#### Using Controls
- Modify props in real-time using the Controls panel
- Test different states and edge cases
- Export configurations for documentation

#### Responsive Testing
- Use viewport addon to test mobile/tablet/desktop
- Verify responsive behavior matches mockups
- Document breakpoint-specific behaviors

### 4. Accessibility Testing
- A11y tab shows accessibility violations
- Color contrast checking
- Keyboard navigation testing
- Screen reader compatibility

## Best Practices

### Component Organization

```
src/stories/
├── atoms/           # Basic elements
│   ├── Button.stories.tsx
│   ├── Icon.stories.tsx
│   └── Text.stories.tsx
├── molecules/       # Composed components
│   ├── Card.stories.tsx
│   ├── FormField.stories.tsx
│   └── ListItem.stories.tsx
├── organisms/       # Complex components
│   ├── Header.stories.tsx
│   ├── ElementForm.stories.tsx
│   └── ProjectGrid.stories.tsx
└── pages/          # Full screens
    ├── Login.stories.tsx
    └── ProjectList.stories.tsx
```

### Story Naming Conventions

```tsx
// Use descriptive names for story exports
export const Default: Story = {};
export const Loading: Story = {};
export const Error: Story = {};
export const Empty: Story = {};
export const WithData: Story = {};
export const Mobile: Story = {};
export const Desktop: Story = {};
```

### Testing States

Always include stories for:
1. **Default state** - Component with minimal props
2. **Loading state** - Show loading indicators
3. **Error state** - Display error handling
4. **Empty state** - No data scenarios
5. **Full state** - Maximum content/features
6. **Edge cases** - Long text, special characters

### Platform-Specific Stories

```tsx
// Show platform differences
export const IOS: Story = {
  parameters: {
    platform: 'ios',
  },
};

export const Android: Story = {
  parameters: {
    platform: 'android',
  },
};

export const Web: Story = {
  parameters: {
    platform: 'web',
  },
};
```

## Using Design Tokens

### Accessing Tokens in Stories

```tsx
import { tokens } from '../../shared-styles/fantasy-tokens';

export const Themed: Story = {
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: tokens.colors.background.primary }}>
        <Story />
      </div>
    ),
  ],
};
```

### Testing Theme Variations

```tsx
// Test light and dark themes
export const LightTheme: Story = {
  parameters: {
    theme: 'light',
  },
};

export const DarkTheme: Story = {
  parameters: {
    theme: 'dark',
  },
};
```

## Integration with Development

### Mockups → Storybook → App Flow

1. **Design in Mockups** 
   - Create/update HTML mockups
   - Test responsive design
   - Get stakeholder approval

2. **Build in Storybook**
   - Create component with stories
   - Test all states and variations
   - Verify against mockups

3. **Integrate in App**
   - Import tested component
   - Connect to state management
   - Add business logic

### Using with Cypress

```tsx
// Reference Storybook components in Cypress tests
cy.visit('http://localhost:6006/iframe.html?id=atoms-button--primary');
cy.get('[data-cy="button"]').should('be.visible');
```

## Addons Usage

### Controls Addon
- Dynamically edit props
- Test edge cases
- Export prop combinations

### Viewport Addon
- Test responsive designs
- Mobile/tablet/desktop presets
- Custom viewport sizes

### A11y Addon
- Automatic accessibility checks
- WCAG 2.1 compliance
- Color contrast validation
- Keyboard navigation testing

### Actions Addon
- Log component interactions
- Debug event handlers
- Verify callback props

## Common Patterns

### Form Components
```tsx
export const FormValidation: Story = {
  args: {
    value: '',
    error: 'This field is required',
    touched: true,
  },
  play: async ({ canvasElement }) => {
    // Automated interaction testing
    const input = within(canvasElement).getByRole('textbox');
    await userEvent.type(input, 'test@example.com');
  },
};
```

### List Components
```tsx
export const VirtualizedList: Story = {
  args: {
    items: Array.from({ length: 1000 }, (_, i) => ({
      id: `item-${i}`,
      title: `Item ${i}`,
    })),
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};
```

### Modal/Dialog Components
```tsx
export const OpenModal: Story = {
  args: {
    isOpen: true,
    title: 'Confirm Action',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '500px' }}>
        <Story />
      </div>
    ),
  ],
};
```

## Troubleshooting

### Common Issues

**Component not rendering:**
- Check import paths
- Verify React Native Web compatibility
- Ensure proper webpack configuration

**Styles not applying:**
- Import shared tokens correctly
- Use StyleSheet.create for React Native
- Check platform-specific styles

**Controls not working:**
- Define argTypes properly
- Use correct control types
- Check prop forwarding

**Story not appearing:**
- Export story as named export
- Ensure default export is meta
- Check story file naming (*.stories.tsx)

## Quick Commands

```bash
# Start Storybook
npm run storybook

# Build static Storybook
npm run build-storybook

# Run Storybook tests
npm run test-storybook

# Update snapshots
npm run test-storybook -u
```

## Resources

- [Storybook Documentation](https://storybook.js.org/docs/react/get-started/introduction)
- [React Native Web + Storybook](https://storybook.js.org/blog/storybook-for-react-native-web/)
- [Component Story Format](https://storybook.js.org/docs/react/api/csf)
- [Addon Documentation](https://storybook.js.org/addons)

## Next Steps

1. Explore existing stories in `/src/stories`
2. Create a story for your next component
3. Test different variations and states
4. Use Controls to experiment with props
5. Check accessibility with the a11y addon
6. Document patterns for team reference
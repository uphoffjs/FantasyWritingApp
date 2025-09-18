# FantasyWritingApp Design System

## Overview
The FantasyWritingApp design system provides a unified visual language and component library for building consistent, accessible, and beautiful interfaces across iOS, Android, and Web platforms.

## Core Principles

### 1. **Fantasy-First Aesthetic**
- Rich, immersive colors inspired by fantasy literature
- Elegant typography that enhances readability
- Subtle animations that bring magic to interactions

### 2. **Cross-Platform Consistency**
- Unified token system across all platforms
- Platform-aware adaptations that feel native
- Responsive design that works everywhere

### 3. **Accessibility by Default**
- WCAG 2.1 AA compliance minimum
- High contrast ratios for readability
- Keyboard navigation support
- Screen reader optimization

### 4. **Performance Optimized**
- Lightweight components
- Efficient asset loading
- Smooth animations (60fps)
- Optimized for mobile devices

## Design Tokens

### Color System

Our color palette is organized into semantic tokens that adapt to light and dark themes:

#### Primary Colors
```css
--color-primary-50: #e8f4f1;  /* Lightest mint */
--color-primary-100: #c5e4dc;
--color-primary-200: #9fd3c5;
--color-primary-300: #76c2ad;
--color-primary-400: #55b59b;
--color-primary-500: #2da888;  /* Primary brand */
--color-primary-600: #239a7c;
--color-primary-700: #008970;
--color-primary-800: #007862;
--color-primary-900: #005d48;  /* Darkest */
```

#### Semantic Colors
- **Success**: Green tones for positive actions
- **Warning**: Amber for caution states
- **Error**: Red for errors and destructive actions
- **Info**: Blue for informational content

#### Theme-Aware Usage
```tsx
// Automatically switches based on theme
backgroundColor: tokens.colors.background.primary
color: tokens.colors.text.primary
borderColor: tokens.colors.border.default
```

### Typography Scale

Based on a modular scale with 1.25 ratio:

```css
--font-size-xs: 0.75rem;    /* 12px - Captions */
--font-size-sm: 0.875rem;   /* 14px - Body small */
--font-size-base: 1rem;     /* 16px - Body default */
--font-size-lg: 1.125rem;   /* 18px - Body large */
--font-size-xl: 1.25rem;    /* 20px - H4 */
--font-size-2xl: 1.5rem;    /* 24px - H3 */
--font-size-3xl: 1.875rem;  /* 30px - H2 */
--font-size-4xl: 2.25rem;   /* 36px - H1 */
```

#### Font Families
- **Heading**: 'Cinzel', serif (fantasy aesthetic)
- **Body**: 'Crimson Text', serif (readable)
- **UI**: System fonts for interface elements
- **Mono**: 'Fira Code' for code/technical content

### Spacing System

8px grid system for consistent spacing:

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.5rem;   /* 24px */
--space-6: 2rem;     /* 32px */
--space-8: 3rem;     /* 48px */
--space-10: 4rem;    /* 64px */
```

### Breakpoints

Mobile-first responsive design:

```css
/* Mobile: 0-767px (default) */
/* Tablet: 768px-1023px */
@media (min-width: 768px) { }

/* Desktop: 1024px-1439px */
@media (min-width: 1024px) { }

/* Large Desktop: 1440px+ */
@media (min-width: 1440px) { }
```

## Component Library

### Atomic Design Structure

#### Atoms (Basic Building Blocks)
- **Button**: Primary, Secondary, Danger variants
- **Input**: Text, Password, Textarea
- **Icon**: SVG icon system
- **Text**: Heading, Body, Caption styles
- **Badge**: Status indicators
- **Avatar**: User profile images

#### Molecules (Composed Components)
- **FormField**: Label + Input + Error
- **Card**: Container with content
- **ListItem**: Icon + Text + Action
- **Toast**: Notification messages
- **Modal**: Dialog overlay
- **Dropdown**: Select menu

#### Organisms (Complex Components)
- **Header**: Navigation bar
- **Form**: Complete form with validation
- **ProjectGrid**: Responsive card grid
- **ElementEditor**: Rich text editor
- **SearchResults**: Filtered list view
- **CompletionHeatmap**: Progress visualization

#### Templates (Page Layouts)
- **AuthLayout**: Login/Register pages
- **DashboardLayout**: Main app layout
- **EditorLayout**: Full-screen editor
- **SettingsLayout**: Preferences pages

### Component States

Every component supports these states:
1. **Default**: Normal appearance
2. **Hover**: Desktop cursor interaction
3. **Active**: Being pressed/clicked
4. **Focus**: Keyboard navigation
5. **Disabled**: Not interactive
6. **Loading**: Async operation
7. **Error**: Validation failure
8. **Success**: Positive feedback

## Patterns & Guidelines

### Forms
- Label all inputs clearly
- Show validation inline
- Provide helpful error messages
- Use progressive disclosure
- Group related fields

### Navigation
- Consistent placement across screens
- Clear active state indicators
- Breadcrumbs for deep navigation
- Mobile-optimized touch targets (44px min)

### Feedback
- Immediate visual response to actions
- Loading states for async operations
- Success/error messages
- Progress indicators for long tasks

### Empty States
- Helpful illustrations
- Clear call-to-action
- Guidance for next steps
- Positive, encouraging tone

### Accessibility
- All interactive elements have labels
- Color alone never conveys meaning
- Focus indicators are visible
- Touch targets are 44x44px minimum
- Error messages are announced

## Animation & Motion

### Principles
- **Purposeful**: Animations guide attention
- **Quick**: 200-300ms for most transitions
- **Smooth**: 60fps performance target
- **Subtle**: Enhance, don't distract

### Common Animations
```css
/* Micro-interactions */
--duration-instant: 100ms;
--duration-quick: 200ms;
--duration-normal: 300ms;
--duration-slow: 500ms;

/* Easing functions */
--ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-in-out: cubic-bezier(0.645, 0.045, 0.355, 1);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
```

## Platform Adaptations

### iOS
- San Francisco font for UI
- iOS-specific gestures (swipe)
- Native navigation patterns
- Platform haptics

### Android
- Roboto font for UI
- Material Design influences
- FAB for primary actions
- Platform-specific back handling

### Web
- Responsive layouts
- Hover states
- Keyboard shortcuts
- Browser-specific optimizations

## Implementation

### Using Design Tokens

#### In React Native
```tsx
import { tokens } from '@/shared-styles/fantasy-tokens';

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.colors.background.primary,
    padding: tokens.spacing.md,
  },
  text: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.body.fontSize,
  },
});
```

#### In HTML Mockups
```css
@import '../src/shared-styles/fantasy-tokens.css';

.card {
  background: var(--color-background-card);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
}
```

#### In Storybook
```tsx
import { tokens } from '@/shared-styles/fantasy-tokens';

export const Default = {
  args: {
    backgroundColor: tokens.colors.primary[500],
  },
};
```

### Theme Switching

```tsx
// Automatic theme detection
const theme = useColorScheme(); // 'light' | 'dark'

// Manual theme toggle
const { theme, toggleTheme } = useTheme();

// Apply theme-aware styles
const styles = getThemedStyles(theme);
```

## Tools & Resources

### Development Tools
- **Storybook**: Component documentation and testing
- **HTML Mockups**: Rapid design iteration
- **Style Dictionary**: Token generation
- **Figma**: Design source files (if available)

### Scripts
```bash
# Sync design tokens
npm run sync-tokens

# Watch token changes
npm run sync-tokens:watch

# Build token documentation
npm run tokens:build

# Optimize assets
npm run optimize-assets
```

### File Locations
```
/src/shared-styles/        # Design tokens
/src/design-tokens/        # Token configuration
/mockups/css/             # Mockup styles
/src/components/          # React Native components
/src/stories/             # Storybook stories
```

## Best Practices

### Do's ✅
- Use semantic color tokens, not hex values
- Follow the 8px spacing grid
- Test on all target platforms
- Maintain WCAG AA compliance
- Use platform-appropriate patterns

### Don'ts ❌
- Don't create one-off colors
- Don't use arbitrary spacing values
- Don't ignore platform conventions
- Don't skip accessibility testing
- Don't over-animate interfaces

## Contribution Guidelines

### Adding New Components
1. Design in mockups first
2. Create Storybook story
3. Build React Native component
4. Test across platforms
5. Document usage patterns
6. Update design system docs

### Modifying Tokens
1. Update TypeScript tokens
2. Run sync script
3. Test in all contexts
4. Update documentation
5. Communicate changes

### Review Checklist
- [ ] Follows design token system
- [ ] Responsive on all breakpoints
- [ ] Accessible (WCAG AA)
- [ ] Platform adaptations work
- [ ] Documented in Storybook
- [ ] Tested with real data
- [ ] Performance optimized

## Version History

### v1.0.0 - Initial Design System
- Core token system established
- Base component library
- Cross-platform support
- Documentation created

### Future Enhancements
- Advanced animation system
- More component variants
- Figma design kit
- Automated visual testing
- Design system versioning
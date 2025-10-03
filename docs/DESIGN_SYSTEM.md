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

Our color palette is built around the **Fantasy Tome Theme** (`fantasyTomeColors.ts`), creating an immersive medieval aesthetic with excellent accessibility.

#### Fantasy Tome Color System (Updated: Oct 2025)

The color system has been migrated from Tailwind CSS to our custom Fantasy Theme, providing:

- **Medieval aesthetic**: Parchment backgrounds and ink-based text colors
- **WCAG AA compliance**: All color combinations meet accessibility standards (4.5:1 text, 3:1 UI)
- **Semantic clarity**: Colors organized by purpose and meaning

See [COLOR_MAPPING.md](../claudedocs/COLOR_MAPPING.md) for complete migration details.

#### Parchment (Backgrounds)

```tsx
import { fantasyTomeColors } from '@/constants/fantasyTomeColors';

// Background colors - warm, aged parchment tones
parchment.vellum: '#FFF8E7'   // Main background, cream warmth
parchment.aged: '#F9F2E3'     // Card backgrounds, slightly aged
parchment.shadow: '#F0E6D2'   // Hover states, shadowed paper
parchment.dark: '#E8DCC0'     // Deep shadows, well-aged
parchment.border: '#C4A574'   // Border color, darker visibility
```

#### Ink (Text Colors)

```tsx
// Text colors - rich ink tones for readability
ink.black: '#1A1613'    // Primary text, rich black ink
ink.brown: '#332518'    // Secondary text, dark sepia
ink.faded: '#4A3C30'    // Muted text, readable faded
ink.light: '#5C4A3A'    // Disabled text, still readable
ink.scribe: '#0F0C0A'   // Emphasis text, darkest ink
```

#### Element Colors (11 Categories)

Each category has `primary`, `secondary`, and `light` variants:

- **Character**: Purple tones for character elements
- **Location**: Earth tones for places
- **Item**: Amber/gold for objects
- **Magic**: Deep purple for magical elements
- **Culture**: Warm browns for cultural elements
- **Creature**: Forest greens for beings
- **Organization**: Blue tones for groups
- **Religion**: Sacred gold tones
- **Technology**: Steel grays
- **History**: Aged brown tones
- **Language**: Scholarly blues

#### Semantic Colors

```tsx
// Accessible semantic colors with light variants
semantic.success: '#2D5016'        // Forest green (success)
semantic.successLight: '#E8F5E9'   // Light green background
semantic.warning: '#A73A00'        // Flame orange (warning)
semantic.warningLight: '#FFF3E0'   // Light orange background
semantic.error: '#6B0000'          // Blood red (error)
semantic.errorLight: '#FFEBEE'     // Light red background
semantic.info: '#215B8C'           // Sky blue (info)
semantic.infoLight: '#E3F2FD'      // Light blue background
```

#### UI States

```tsx
// Interaction states - subtle ink washes
states.hover: 'rgba(26, 22, 19, 0.05)'      // Subtle ink wash
states.active: 'rgba(26, 22, 19, 0.1)'      // Deeper ink wash
states.focus: 'rgba(255, 215, 0, 0.3)'      // Gold glow
states.disabled: 'rgba(139, 115, 85, 0.3)'  // Faded overlay
states.selected: 'rgba(102, 51, 153, 0.1)'  // Magic purple tint
```

#### Migration Notes (October 2025)

- **Migrated from**: Tailwind CSS color literals (369 instances)
- **Migrated to**: Fantasy Tome Theme (`fantasyTomeColors.ts`)
- **Files affected**: 13 production files
- **Accessibility**: All mappings maintain WCAG AA compliance
- **Visual consistency**: Fantasy medieval theme preserved across all components
- **Documentation**: See `claudedocs/COLOR_MAPPING.md` for complete mapping details

#### Usage Examples

```tsx
import { fantasyTomeColors } from '@/constants/fantasyTomeColors';

// Background with text
const styles = StyleSheet.create({
  container: {
    backgroundColor: fantasyTomeColors.parchment.vellum,
  },
  heading: {
    color: fantasyTomeColors.ink.black,
  },
  subtext: {
    color: fantasyTomeColors.ink.faded,
  },
});

// Semantic states
const errorStyles = {
  backgroundColor: fantasyTomeColors.semantic.errorLight,
  color: fantasyTomeColors.semantic.error,
  borderColor: fantasyTomeColors.semantic.error,
};

// Element-specific colors
const characterCard = {
  backgroundColor: fantasyTomeColors.elements.character.light,
  borderColor: fantasyTomeColors.elements.character.primary,
};
```

### Typography Scale

Based on a modular scale with 1.25 ratio:

```css
--font-size-xs: 0.75rem; /* 12px - Captions */
--font-size-sm: 0.875rem; /* 14px - Body small */
--font-size-base: 1rem; /* 16px - Body default */
--font-size-lg: 1.125rem; /* 18px - Body large */
--font-size-xl: 1.25rem; /* 20px - H4 */
--font-size-2xl: 1.5rem; /* 24px - H3 */
--font-size-3xl: 1.875rem; /* 30px - H2 */
--font-size-4xl: 2.25rem; /* 36px - H1 */
```

#### Font Families

- **Heading**: 'Cinzel', serif (fantasy aesthetic)
- **Body**: 'Crimson Text', serif (readable)
- **UI**: System fonts for interface elements
- **Mono**: 'Fira Code' for code/technical content

### Spacing System

8px grid system for consistent spacing:

```css
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.5rem; /* 24px */
--space-6: 2rem; /* 32px */
--space-8: 3rem; /* 48px */
--space-10: 4rem; /* 64px */
```

### Breakpoints

Mobile-first responsive design:

```css
/* Mobile: 0-767px (default) */
/* Tablet: 768px-1023px */
@media (min-width: 768px) {
}

/* Desktop: 1024px-1439px */
@media (min-width: 1024px) {
}

/* Large Desktop: 1440px+ */
@media (min-width: 1440px) {
}
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

- Use Fantasy Tome colors from `fantasyTomeColors.ts`, not hex values
- Import colors: `import { fantasyTomeColors } from '@/constants/fantasyTomeColors'`
- Follow the 8px spacing grid
- Test on all target platforms
- Maintain WCAG AA compliance (all Fantasy colors are pre-verified)
- Use platform-appropriate patterns
- Reference `claudedocs/COLOR_MAPPING.md` for color usage guidance

### Don'ts ❌

- Don't use hex color literals directly (use Fantasy Tome colors)
- Don't create one-off colors outside the Fantasy Theme
- Don't use arbitrary spacing values
- Don't ignore platform conventions
- Don't skip accessibility testing
- Don't over-animate interfaces
- Don't use Tailwind CSS colors (migrated to Fantasy Theme)

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

# @fantasywritingapp/ui-library

Reusable UI component library for FantasyWritingApp - a cross-platform creative writing application.

## Features

- 🎨 **Cross-Platform Components** - Works on iOS, Android, and Web
- 🎭 **Theme Support** - Light and dark modes with fantasy-themed styling
- ♿ **Accessible** - WCAG 2.1 AA compliant components
- 📱 **Responsive** - Mobile-first design with desktop optimization
- 🏗️ **Atomic Design** - Organized as Atoms, Molecules, and Organisms
- 📚 **Storybook Documentation** - Interactive component playground
- 🎯 **TypeScript** - Full type safety and IntelliSense support

## Installation

```bash
npm install @fantasywritingapp/ui-library
# or
yarn add @fantasywritingapp/ui-library
```

## Usage

### Basic Setup

```tsx
import { ThemeProvider, Button, Card } from '@fantasywritingapp/ui-library';

function App() {
  return (
    <ThemeProvider mode="light">
      <Card>
        <Button variant="primary" onPress={() => console.log('Clicked!')}>
          Create Story
        </Button>
      </Card>
    </ThemeProvider>
  );
}
```

### Using Components

#### Atoms
```tsx
import { Button, Text, Icon, Badge, Spinner } from '@fantasywritingapp/ui-library';

// Button with icon
<Button variant="secondary" icon="plus" onPress={handleAdd}>
  Add Character
</Button>

// Text with typography variant
<Text variant="heading1">Chapter Title</Text>

// Loading spinner
<Spinner size="large" color="primary" />

// Badge for status
<Badge type="success">Published</Badge>
```

#### Molecules
```tsx
import { Card, Input, Modal, Toast } from '@fantasywritingapp/ui-library';

// Card with content
<Card title="Story Overview" elevation={2}>
  <Text>Your story content...</Text>
</Card>

// Input field
<Input
  label="Story Title"
  placeholder="Enter your story title..."
  value={title}
  onChangeText={setTitle}
/>

// Modal dialog
<Modal visible={showModal} onClose={() => setShowModal(false)}>
  <Text>Save changes?</Text>
</Modal>
```

#### Organisms
```tsx
import { ElementCard, ProjectCard, QuestionnaireForm } from '@fantasywritingapp/ui-library';

// Element card for characters, locations, etc.
<ElementCard
  element={{
    id: '1',
    name: 'Gandalf',
    type: 'character',
    description: 'A wise wizard...'
  }}
  onPress={handleElementPress}
/>

// Project card for stories
<ProjectCard
  project={{
    id: '1',
    title: 'The Fantasy Novel',
    progress: 75,
    wordCount: 50000
  }}
  onPress={handleProjectOpen}
/>
```

### Theming

The library includes built-in light and dark themes with fantasy-inspired colors:

```tsx
import { ThemeProvider, useTheme } from '@fantasywritingapp/ui-library';

function ThemedComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button onPress={toggleTheme}>
      Current theme: {theme.mode}
    </Button>
  );
}

// Wrap your app
<ThemeProvider mode="dark">
  <ThemedComponent />
</ThemeProvider>
```

### Platform-Specific Styling

```tsx
import { Platform } from 'react-native';
import { Button } from '@fantasywritingapp/ui-library';

<Button
  style={{
    ...Platform.select({
      ios: { paddingTop: 20 },
      android: { elevation: 4 },
      web: { cursor: 'pointer' }
    })
  }}
>
  Platform-aware Button
</Button>
```

## Component API

### Button
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' \| 'tertiary' | 'primary' | Button style variant |
| size | 'small' \| 'medium' \| 'large' | 'medium' | Button size |
| icon | string | undefined | Icon name from react-native-vector-icons |
| disabled | boolean | false | Disable interactions |
| loading | boolean | false | Show loading spinner |
| onPress | () => void | required | Press handler |

### Card
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string | undefined | Card header title |
| elevation | number | 1 | Shadow depth (0-5) |
| padding | number | 16 | Internal padding |
| onPress | () => void | undefined | Make card pressable |

### Input
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | undefined | Field label |
| placeholder | string | undefined | Placeholder text |
| value | string | required | Input value |
| onChangeText | (text: string) => void | required | Change handler |
| error | string | undefined | Error message |
| multiline | boolean | false | Enable multiline |

## Development

### Setup
```bash
# Clone the repository
git clone https://github.com/fantasywritingapp/ui-library

# Install dependencies
npm install

# Start Storybook
npm run storybook
```

### Building
```bash
# Build the library
npm run build

# Run tests
npm test

# Watch mode
npm run build:watch
```

### Publishing
```bash
# Build and publish
npm run prepublishOnly
npm publish
```

## Testing

Components are tested using:
- Jest for unit tests
- React Native Testing Library for component tests
- Storybook for visual testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Storybook

View the component library in Storybook:

```bash
npm run storybook
```

Then open http://localhost:6007

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## License

MIT © FantasyWritingApp Team
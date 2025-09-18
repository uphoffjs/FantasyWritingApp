import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View, Text, TouchableOpacity, Platform, StyleSheet, ScrollView, Switch } from 'react-native';
import { TextInput } from '../components/TextInput';

// * Platform detection component to show current platform
const PlatformIndicator = () => {
  const currentPlatform = Platform.OS;
  const platformColor = {
    ios: '#007AFF', // iOS blue
    android: '#4CAF50', // Android green
    web: '#FF6B6B', // Web red
  }[currentPlatform] || '#666';

  return (
    <View style={platformStyles.indicator}>
      <Text style={[platformStyles.indicatorText, { color: platformColor }]}>
        Current Platform: {currentPlatform.toUpperCase()}
      </Text>
      <Text style={platformStyles.indicatorSubtext}>
        {Platform.Version && `Version: ${Platform.Version}`}
      </Text>
    </View>
  );
};

// * Component showing platform-specific UI differences
const PlatformDifferencesShowcase = () => {
  const [switchValue, setSwitchValue] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  return (
    <ScrollView style={showcaseStyles.container}>
      <PlatformIndicator />
      
      {/* Text Input Differences */}
      <View style={showcaseStyles.section}>
        <Text style={showcaseStyles.sectionTitle}>Text Input Styling</Text>
        <Text style={showcaseStyles.description}>
          Notice how the font family and styling differs between platforms
        </Text>
        <TextInput
          label="Platform-specific Input"
          placeholder="Type something..."
          value={inputValue}
          onChangeText={setInputValue}
          testID="platform-input"
        />
      </View>

      {/* Button/TouchableOpacity Differences */}
      <View style={showcaseStyles.section}>
        <Text style={showcaseStyles.sectionTitle}>Touch Feedback</Text>
        <Text style={showcaseStyles.description}>
          iOS: Opacity change | Android: Ripple effect | Web: Hover states
        </Text>
        <TouchableOpacity
          style={showcaseStyles.button}
          activeOpacity={Platform.OS === 'ios' ? 0.7 : 0.8}
          testID="platform-button"
        >
          <Text style={showcaseStyles.buttonText}>
            {Platform.select({
              ios: '🍎 iOS Button',
              android: '🤖 Android Button',
              web: '🌐 Web Button',
              default: 'Button',
            })}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Switch Component */}
      <View style={showcaseStyles.section}>
        <Text style={showcaseStyles.sectionTitle}>Native Controls</Text>
        <Text style={showcaseStyles.description}>
          Switch appearance varies by platform
        </Text>
        <View style={showcaseStyles.switchContainer}>
          <Text>Toggle Switch:</Text>
          <Switch
            value={switchValue}
            onValueChange={setSwitchValue}
            trackColor={{ false: '#767577', true: Platform.select({
              ios: '#007AFF',
              android: '#4CAF50',
              default: '#81b0ff',
            })}}
            thumbColor={Platform.OS === 'android' ? (switchValue ? '#fff' : '#f4f3f4') : '#f4f3f4'}
            testID="platform-switch"
          />
        </View>
      </View>

      {/* Typography Differences */}
      <View style={showcaseStyles.section}>
        <Text style={showcaseStyles.sectionTitle}>Typography</Text>
        <Text style={[showcaseStyles.text, showcaseStyles.defaultFont]}>
          Default System Font
        </Text>
        <Text style={[showcaseStyles.text, { fontWeight: 'bold' }]}>
          Bold Text Rendering
        </Text>
        <Text style={[showcaseStyles.text, { fontStyle: 'italic' }]}>
          Italic Text Support
        </Text>
      </View>

      {/* Spacing & Layout */}
      <View style={showcaseStyles.section}>
        <Text style={showcaseStyles.sectionTitle}>Platform Spacing</Text>
        <View style={showcaseStyles.spacingDemo}>
          <View style={[showcaseStyles.box, { backgroundColor: '#007AFF' }]} />
          <View style={[showcaseStyles.box, { backgroundColor: '#4CAF50' }]} />
          <View style={[showcaseStyles.box, { backgroundColor: '#FF6B6B' }]} />
        </View>
      </View>
    </ScrollView>
  );
};

// * Accessibility-focused component
const AccessibilityShowcase = () => {
  return (
    <View style={accessibilityStyles.container}>
      <Text style={accessibilityStyles.title}>Accessibility Features</Text>
      
      <TouchableOpacity
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Create new project"
        accessibilityHint="Double tap to create a new fantasy writing project"
        style={accessibilityStyles.button}
        testID="accessible-button"
      >
        <Text style={accessibilityStyles.buttonText}>Accessible Button</Text>
      </TouchableOpacity>

      <TextInput
        label="Accessible Input"
        placeholder="Enter project name..."
        accessible={true}
        accessibilityLabel="Project name input"
        accessibilityHint="Enter the name for your fantasy writing project"
        testID="accessible-input"
      />

      <View
        accessible={true}
        accessibilityRole="text"
        accessibilityLabel="Platform information"
      >
        <Text style={accessibilityStyles.info}>
          Current platform supports:{'\n'}
          • Screen readers: {Platform.OS !== 'web' ? 'Yes' : 'Limited'}{'\n'}
          • Voice control: {Platform.OS === 'ios' ? 'Yes' : 'Varies'}{'\n'}
          • Keyboard navigation: Yes
        </Text>
      </View>
    </View>
  );
};

// * Responsive behavior component
const ResponsiveShowcase = () => {
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  return (
    <View 
      style={responsiveStyles.container}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setDimensions({ width, height });
      }}
    >
      <Text style={responsiveStyles.title}>Responsive Behavior</Text>
      <Text style={responsiveStyles.info}>
        Container: {Math.round(dimensions.width)} × {Math.round(dimensions.height)}
      </Text>

      <View style={responsiveStyles.grid}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <View key={item} style={responsiveStyles.gridItem}>
            <Text style={responsiveStyles.gridText}>Item {item}</Text>
          </View>
        ))}
      </View>

      <Text style={responsiveStyles.breakpointInfo}>
        {dimensions.width < 768 ? '📱 Mobile Layout' :
         dimensions.width < 1024 ? '📱 Tablet Layout' :
         '🖥️ Desktop Layout'}
      </Text>
    </View>
  );
};

// Styles
const platformStyles = StyleSheet.create({
  indicator: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  indicatorText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  indicatorSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

const showcaseStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  button: {
    backgroundColor: Platform.select({
      ios: '#007AFF',
      android: '#4CAF50',
      web: '#FF6B6B',
    }),
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
    marginVertical: 4,
  },
  defaultFont: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }),
  },
  spacingDemo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  box: {
    width: 60,
    height: 60,
    borderRadius: Platform.select({
      ios: 12,
      android: 8,
      web: 4,
    }),
  },
});

const accessibilityStyles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  info: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    marginTop: 20,
  },
});

const responsiveStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridItem: {
    width: '50%',
    padding: 8,
    ...Platform.select({
      web: {
        '@media (min-width: 768px)': {
          width: '33.333%',
        },
        '@media (min-width: 1024px)': {
          width: '16.666%',
        },
      },
    }),
  },
  gridText: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    textAlign: 'center',
    borderRadius: 8,
  },
  breakpointInfo: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

// * Meta configuration
const meta: Meta<typeof PlatformDifferencesShowcase> = {
  title: 'Platform/Platform Differences',
  component: PlatformDifferencesShowcase,
  parameters: {
    // * Enable viewport addon for this story
    viewport: {
      defaultViewport: 'responsive',
    },
    // * Documentation
    docs: {
      description: {
        component: 'Showcase of platform-specific UI differences between iOS, Android, and Web platforms in React Native.',
      },
    },
  },
  // * Tags for organization
  tags: ['autodocs', 'platform', 'mobile', 'responsive'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// * Stories
export const PlatformDifferences: Story = {
  render: () => <PlatformDifferencesShowcase />,
  parameters: {
    docs: {
      description: {
        story: 'Shows how UI components render differently on iOS, Android, and Web platforms.',
      },
    },
  },
};

export const IOSView: Story = {
  render: () => <PlatformDifferencesShowcase />,
  parameters: {
    viewport: {
      defaultViewport: 'iPhone12',
    },
    docs: {
      description: {
        story: 'iOS-specific view using iPhone 12 viewport.',
      },
    },
  },
};

export const AndroidView: Story = {
  render: () => <PlatformDifferencesShowcase />,
  parameters: {
    viewport: {
      defaultViewport: 'pixel5',
    },
    docs: {
      description: {
        story: 'Android-specific view using Pixel 5 viewport.',
      },
    },
  },
};

export const TabletView: Story = {
  render: () => <PlatformDifferencesShowcase />,
  parameters: {
    viewport: {
      defaultViewport: 'iPadMini',
    },
    docs: {
      description: {
        story: 'Tablet view using iPad Mini viewport.',
      },
    },
  },
};

export const AccessibilityFeatures: Story = {
  render: () => <AccessibilityShowcase />,
  parameters: {
    a11y: {
      // * Enable accessibility testing
      element: '#storybook-root',
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
    docs: {
      description: {
        story: 'Demonstrates accessibility features and best practices for React Native components.',
      },
    },
  },
};

export const ResponsiveBehavior: Story = {
  render: () => <ResponsiveShowcase />,
  parameters: {
    viewport: {
      defaultViewport: 'responsive',
    },
    docs: {
      description: {
        story: 'Shows how components adapt to different screen sizes and orientations.',
      },
    },
  },
};
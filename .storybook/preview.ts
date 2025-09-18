import type { Preview } from '@storybook/react-webpack5'
import { ThemeDecorator } from './ThemeDecorator'

// * Custom viewport configurations for React Native platforms
const customViewports = {
  // iOS devices
  iPhoneSE: {
    name: 'iPhone SE',
    styles: {
      width: '375px',
      height: '667px',
    },
  },
  iPhone12: {
    name: 'iPhone 12/13/14',
    styles: {
      width: '390px',
      height: '844px',
    },
  },
  iPhone14Pro: {
    name: 'iPhone 14 Pro',
    styles: {
      width: '393px',
      height: '852px',
    },
  },
  iPhone14ProMax: {
    name: 'iPhone 14 Pro Max',
    styles: {
      width: '430px',
      height: '932px',
    },
  },
  iPadMini: {
    name: 'iPad Mini',
    styles: {
      width: '768px',
      height: '1024px',
    },
  },
  iPadPro11: {
    name: 'iPad Pro 11"',
    styles: {
      width: '834px',
      height: '1194px',
    },
  },
  iPadPro12: {
    name: 'iPad Pro 12.9"',
    styles: {
      width: '1024px',
      height: '1366px',
    },
  },
  // Android devices
  pixel5: {
    name: 'Pixel 5',
    styles: {
      width: '393px',
      height: '851px',
    },
  },
  galaxyS20: {
    name: 'Samsung Galaxy S20',
    styles: {
      width: '360px',
      height: '800px',
    },
  },
  galaxyS21: {
    name: 'Samsung Galaxy S21',
    styles: {
      width: '384px',
      height: '854px',
    },
  },
  galaxyTab: {
    name: 'Samsung Galaxy Tab S7',
    styles: {
      width: '753px',
      height: '1280px',
    },
  },
  // Web responsive breakpoints
  mobileSmall: {
    name: 'Mobile Small',
    styles: {
      width: '320px',
      height: '568px',
    },
  },
  mobileMedium: {
    name: 'Mobile Medium',
    styles: {
      width: '375px',
      height: '667px',
    },
  },
  mobileLarge: {
    name: 'Mobile Large',
    styles: {
      width: '414px',
      height: '896px',
    },
  },
  tablet: {
    name: 'Tablet',
    styles: {
      width: '768px',
      height: '1024px',
    },
  },
  desktop: {
    name: 'Desktop',
    styles: {
      width: '1024px',
      height: '768px',
    },
  },
  desktopLarge: {
    name: 'Desktop Large',
    styles: {
      width: '1440px',
      height: '900px',
    },
  },
  desktop4K: {
    name: 'Desktop 4K',
    styles: {
      width: '2560px',
      height: '1440px',
    },
  },
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    // * Viewport configuration for responsive testing
    viewport: {
      viewports: {
        ...customViewports,
      },
      defaultViewport: 'responsive',
    },
    // * Layout options for better visualization
    layout: 'centered',
    // * Background configuration for dark/light mode testing
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#FFFFFF',
        },
        {
          name: 'dark',
          value: '#1a1a1a',
        },
        {
          name: 'fantasy-light',
          value: '#F5F0E8', // From fantasy theme
        },
        {
          name: 'fantasy-dark',
          value: '#1F1B24', // From fantasy theme
        },
      ],
    },
  },
  // * Global decorators for all stories
  decorators: [
    ThemeDecorator, // * Apply theme switching decorator
    (Story) => (
      <div style={{ padding: '1rem' }}>
        <Story />
      </div>
    ),
  ],
  // * Global types for toolbar controls
  globalTypes: {
    platform: {
      name: 'Platform',
      description: 'Platform for component',
      defaultValue: 'web',
      toolbar: {
        icon: 'mobile',
        items: ['ios', 'android', 'web'],
        showName: true,
      },
    },
  },
};

export default preview;
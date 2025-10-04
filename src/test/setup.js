// * Main test setup file for React Native Testing Library
// * Configures mocks for React Native modules and global test utilities

// ! Silence warnings in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render') ||
     args[0].includes('Warning: An update to') ||
     args[0].includes('not wrapped in act'))
  ) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Animated:') ||
     args[0].includes('VirtualizedLists'))
  ) {
    return;
  }
  originalConsoleWarn.call(console, ...args);
};

// * Mock React Native modules - removed NativeAnimatedHelper as it's handled by preset

// * Mock AsyncStorage - using __mocks__ directory pattern
jest.mock('@react-native-async-storage/async-storage');

// * Mock React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      push: jest.fn(),
      pop: jest.fn(),
      popToTop: jest.fn(),
      replace: jest.fn(),
      reset: jest.fn(),
      setOptions: jest.fn(),
      setParams: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      isFocused: jest.fn(() => true),
      canGoBack: jest.fn(() => false),
      getParent: jest.fn(),
      getState: jest.fn(),
      dispatch: jest.fn(),
    }),
    useRoute: () => ({
      key: 'test-route-key',
      name: 'TestScreen',
      params: {},
    }),
    useFocusEffect: jest.fn(),
    useIsFocused: jest.fn(() => true),
    NavigationContainer: ({ children }) => children,
    createNavigationContainerRef: jest.fn(() => ({
      current: {
        navigate: jest.fn(),
        goBack: jest.fn(),
        getCurrentRoute: jest.fn(),
        getRootState: jest.fn(),
        isReady: jest.fn(() => true),
      },
    })),
  };
});

// * Mock React Navigation Stack
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(() => ({
    Navigator: ({ children }) => children,
    Screen: () => null,
  })),
}));

// * Mock React Navigation Bottom Tabs
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: jest.fn(() => ({
    Navigator: ({ children }) => children,
    Screen: () => null,
  })),
}));

// * Mock React Navigation Drawer
jest.mock('@react-navigation/drawer', () => ({
  createDrawerNavigator: jest.fn(() => ({
    Navigator: ({ children }) => children,
    Screen: () => null,
  })),
}));

// * Mock Platform API
const mockPlatform = {
  OS: 'ios',
  Version: '14.0',
  select: jest.fn((obj) => obj.ios || obj.default),
  isPad: false,
  isTVOS: false,
  isTV: false,
  constants: {
    reactNativeVersion: {
      major: 0,
      minor: 81,
      patch: 4,
    },
  },
};

Object.defineProperty(mockPlatform, 'constants', {
  get: () => ({
    reactNativeVersion: { major: 0, minor: 81, patch: 4 },
  }),
});

jest.mock('react-native/Libraries/Utilities/Platform', () => mockPlatform, { virtual: true });

// * Mock Dimensions API
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  default: {
    get: jest.fn((dimension) => {
      if (dimension === 'window') {
        return { width: 375, height: 812, scale: 2, fontScale: 1 };
      }
      if (dimension === 'screen') {
        return { width: 375, height: 812, scale: 2, fontScale: 1 };
      }
      return { width: 0, height: 0, scale: 0, fontScale: 0 };
    }),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
    set: jest.fn(),
  },
  get: jest.fn((dimension) => {
    if (dimension === 'window') {
      return { width: 375, height: 812, scale: 2, fontScale: 1 };
    }
    if (dimension === 'screen') {
      return { width: 375, height: 812, scale: 2, fontScale: 1 };
    }
    return { width: 0, height: 0, scale: 0, fontScale: 0 };
  }),
}), { virtual: true });

// * Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: (component) => component,
    Directions: {},
    GestureHandlerRootView: View,
  };
});

// * Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  Reanimated.default.call = () => {};

  return Reanimated;
});

// * Mock react-native-screens
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  ScreenContainer: ({ children }) => children,
  Screen: ({ children }) => children,
  NativeScreen: ({ children }) => children,
  ScreenStack: ({ children }) => children,
  ScreenStackHeaderConfig: ({ children }) => children,
}));

// * Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  const frame = { width: 375, height: 812, x: 0, y: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    SafeAreaInsetsContext: {
      Provider: ({ children }) => children,
      Consumer: ({ children }) => children(inset),
    },
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => frame,
    initialWindowMetrics: { insets: inset, frame },
  };
});

// * Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');
jest.mock('react-native-vector-icons/FontAwesome', () => 'FontAwesome');

// * Mock react-native-svg
jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Circle: 'Circle',
  Ellipse: 'Ellipse',
  G: 'G',
  Text: 'Text',
  TSpan: 'TSpan',
  TextPath: 'TextPath',
  Path: 'Path',
  Polygon: 'Polygon',
  Polyline: 'Polyline',
  Line: 'Line',
  Rect: 'Rect',
  Use: 'Use',
  Image: 'Image',
  Symbol: 'Symbol',
  Defs: 'Defs',
  LinearGradient: 'LinearGradient',
  RadialGradient: 'RadialGradient',
  Stop: 'Stop',
  ClipPath: 'ClipPath',
  Pattern: 'Pattern',
  Mask: 'Mask',
  default: 'Svg',
}));

// * Global test utilities
global.__reanimatedWorkletInit = jest.fn();
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    ok: true,
    status: 200,
  })
);

// * Add custom matchers from @testing-library/jest-native
// ? Note: If using @testing-library/react-native v12.4+, matchers are built-in
// TODO: Remove @testing-library/jest-native and use built-in matchers
try {
  require('@testing-library/jest-native/extend-expect');
} catch (error) {
  // ! Matchers might be built into newer versions
  console.log('Jest matchers from @testing-library/react-native will be used');
}

// * Export test utilities for use in tests
module.exports = {
  // * Helper to reset all mocks
  resetAllMocks: () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  },
};
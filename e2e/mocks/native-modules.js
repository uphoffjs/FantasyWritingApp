/**
 * Native Module Mocks for Detox Testing
 * Mocks platform-specific native modules
 */

// * Mock React Native modules that may not be available in test environment
const mockNativeModules = {
  // * AsyncStorage mock
  AsyncStorage: {
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
  },

  // * Platform mock
  Platform: {
    OS: 'ios', // Default to iOS, can be overridden
    Version: 14,
    select: jest.fn((options) => options.ios || options.default),
    constants: {
      reactNativeVersion: {
        major: 0,
        minor: 75,
        patch: 4,
      },
    },
  },

  // * Dimensions mock
  Dimensions: {
    get: jest.fn((dimension) => {
      if (dimension === 'window') {
        return {
          width: 375,
          height: 812,
          scale: 3,
          fontScale: 1,
        };
      }
      if (dimension === 'screen') {
        return {
          width: 375,
          height: 812,
          scale: 3,
          fontScale: 1,
        };
      }
    }),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },

  // * Keyboard mock
  Keyboard: {
    dismiss: jest.fn(),
    addListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  },

  // * Alert mock
  Alert: {
    alert: jest.fn((title, message, buttons) => {
      if (buttons && buttons.length > 0) {
        // Simulate pressing the first button
        const firstButton = buttons[0];
        if (firstButton.onPress) {
          firstButton.onPress();
        }
      }
    }),
    prompt: jest.fn(),
  },

  // * Linking mock
  Linking: {
    openURL: jest.fn(() => Promise.resolve()),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },

  // * StatusBar mock
  StatusBar: {
    setBarStyle: jest.fn(),
    setBackgroundColor: jest.fn(),
    setHidden: jest.fn(),
    setTranslucent: jest.fn(),
    setNetworkActivityIndicatorVisible: jest.fn(),
    currentHeight: 44,
  },

  // * AppState mock
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
    removeEventListener: jest.fn(),
  },

  // * NetInfo mock
  NetInfo: {
    fetch: jest.fn(() =>
      Promise.resolve({
        type: 'wifi',
        isConnected: true,
        isInternetReachable: true,
        details: {
          isConnectionExpensive: false,
        },
      })
    ),
    addEventListener: jest.fn(() => jest.fn()),
  },

  // * Geolocation mock
  Geolocation: {
    getCurrentPosition: jest.fn((success, error) => {
      success({
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
          altitude: null,
          accuracy: 5,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });
    }),
    watchPosition: jest.fn(() => 1),
    clearWatch: jest.fn(),
    stopObserving: jest.fn(),
  },

  // * PermissionsAndroid mock (for Android testing)
  PermissionsAndroid: {
    request: jest.fn(() => Promise.resolve('granted')),
    requestMultiple: jest.fn(() =>
      Promise.resolve({
        'android.permission.CAMERA': 'granted',
        'android.permission.WRITE_EXTERNAL_STORAGE': 'granted',
        'android.permission.READ_EXTERNAL_STORAGE': 'granted',
      })
    ),
    check: jest.fn(() => Promise.resolve(true)),
    PERMISSIONS: {
      CAMERA: 'android.permission.CAMERA',
      WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
    },
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
      NEVER_ASK_AGAIN: 'never_ask_again',
    },
  },

  // * Share mock
  Share: {
    share: jest.fn(() => Promise.resolve({ action: 'sharedAction' })),
    sharedAction: 'sharedAction',
    dismissedAction: 'dismissedAction',
  },

  // * Vibration mock
  Vibration: {
    vibrate: jest.fn(),
    cancel: jest.fn(),
  },

  // * Clipboard mock
  Clipboard: {
    setString: jest.fn(),
    getString: jest.fn(() => Promise.resolve('')),
  },

  // * BackHandler mock (Android)
  BackHandler: {
    addEventListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
    removeEventListener: jest.fn(),
    exitApp: jest.fn(),
  },
};

// * Helper function to mock a specific platform
function setPlatform(os) {
  mockNativeModules.Platform.OS = os;
  mockNativeModules.Platform.select = jest.fn((options) => {
    if (os === 'ios') {
      return options.ios || options.default;
    } else if (os === 'android') {
      return options.android || options.default;
    }
    return options.default;
  });
}

// * Helper function to mock network state
function setNetworkState(isConnected) {
  mockNativeModules.NetInfo.fetch = jest.fn(() =>
    Promise.resolve({
      type: isConnected ? 'wifi' : 'none',
      isConnected,
      isInternetReachable: isConnected,
      details: {
        isConnectionExpensive: false,
      },
    })
  );
}

// * Helper function to mock app state
function setAppState(state) {
  mockNativeModules.AppState.currentState = state;
}

// * Helper function to mock dimensions
function setDimensions(width, height) {
  const dimensions = {
    width,
    height,
    scale: 3,
    fontScale: 1,
  };

  mockNativeModules.Dimensions.get = jest.fn((dimension) => {
    if (dimension === 'window' || dimension === 'screen') {
      return dimensions;
    }
  });
}

module.exports = {
  mockNativeModules,
  setPlatform,
  setNetworkState,
  setAppState,
  setDimensions,
};
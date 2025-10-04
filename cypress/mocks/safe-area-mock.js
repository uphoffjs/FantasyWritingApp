/**
 * Mock for react-native-safe-area-context
 * Used in Cypress tests to prevent import errors
 */

const React = require('react');

// Mock safe area insets
const mockInsets = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const mockFrame = {
  x: 0,
  y: 0,
  width: 375,
  height: 812,
};

// SafeAreaProvider component
const SafeAreaProvider = ({ children, initialMetrics }) => children;

// SafeAreaView component
const SafeAreaView = ({ children, edges, mode, ...props }) => children;

// SafeAreaInsetsContext
const SafeAreaInsetsContext = React.createContext({
  insets: mockInsets,
  frame: mockFrame,
});

// Hooks
const useSafeAreaInsets = () => mockInsets;
const useSafeAreaFrame = () => mockFrame;

// HOCs
const withSafeAreaInsets = (Component) => Component;

// Edge constants
const Edge = {
  TOP: 'top',
  RIGHT: 'right',
  BOTTOM: 'bottom',
  LEFT: 'left',
};

const EdgeInsets = {
  MAXIMUM_LENGTH: Number.MAX_SAFE_INTEGER,
};

// SafeAreaFrameContext
const SafeAreaFrameContext = React.createContext(mockFrame);

module.exports = {
  SafeAreaProvider,
  SafeAreaView,
  SafeAreaInsetsContext,
  SafeAreaFrameContext,
  useSafeAreaInsets,
  useSafeAreaFrame,
  withSafeAreaInsets,
  Edge,
  EdgeInsets,

  // Additional exports for compatibility
  SafeAreaConsumer: SafeAreaInsetsContext.Consumer,
  initialWindowMetrics: {
    insets: mockInsets,
    frame: mockFrame,
  },

  // Deprecated but might still be used
  useSafeArea: useSafeAreaInsets,
  SafeAreaViewForceInset: {
    top: 'always',
    bottom: 'always',
    left: 'always',
    right: 'always',
    vertical: 'always',
    horizontal: 'always',
  },
};
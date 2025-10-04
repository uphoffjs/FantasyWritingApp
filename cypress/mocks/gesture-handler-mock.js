/**
 * Mock for react-native-gesture-handler
 * Used in Cypress tests to prevent import errors
 */

const React = require('react');

// Mock gesture handler components
const createMockComponent = (name) => {
  const Component = ({ children, ...props }) => children || null;
  Component.displayName = name;
  return Component;
};

// Gesture components
module.exports = {
  // Gesture Handlers
  TapGestureHandler: createMockComponent('TapGestureHandler'),
  PanGestureHandler: createMockComponent('PanGestureHandler'),
  PinchGestureHandler: createMockComponent('PinchGestureHandler'),
  RotationGestureHandler: createMockComponent('RotationGestureHandler'),
  LongPressGestureHandler: createMockComponent('LongPressGestureHandler'),
  ForceTouchGestureHandler: createMockComponent('ForceTouchGestureHandler'),
  FlingGestureHandler: createMockComponent('FlingGestureHandler'),
  NativeViewGestureHandler: createMockComponent('NativeViewGestureHandler'),
  RawButton: createMockComponent('RawButton'),
  BaseButton: createMockComponent('BaseButton'),
  RectButton: createMockComponent('RectButton'),
  BorderlessButton: createMockComponent('BorderlessButton'),

  // Touchables
  TouchableHighlight: createMockComponent('TouchableHighlight'),
  TouchableNativeFeedback: createMockComponent('TouchableNativeFeedback'),
  TouchableOpacity: createMockComponent('TouchableOpacity'),
  TouchableWithoutFeedback: createMockComponent('TouchableWithoutFeedback'),

  // Components
  ScrollView: createMockComponent('ScrollView'),
  FlatList: createMockComponent('FlatList'),
  Switch: createMockComponent('Switch'),
  TextInput: createMockComponent('TextInput'),
  DrawerLayoutAndroid: createMockComponent('DrawerLayoutAndroid'),

  // Swipeable components
  Swipeable: createMockComponent('Swipeable'),
  DrawerLayout: createMockComponent('DrawerLayout'),

  // Handler state
  State: {
    UNDETERMINED: 0,
    FAILED: 1,
    BEGAN: 2,
    CANCELLED: 3,
    ACTIVE: 4,
    END: 5,
  },

  // Directions
  Directions: {
    RIGHT: 1,
    LEFT: 2,
    UP: 4,
    DOWN: 8,
  },

  // Gesture Handler Root View
  GestureHandlerRootView: createMockComponent('GestureHandlerRootView'),

  // Other utilities
  gestureHandlerRootHOC: (Component) => Component,
  createNativeWrapper: (Component) => Component,
};
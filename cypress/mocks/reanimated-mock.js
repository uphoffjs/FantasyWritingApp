/**
 * Mock for react-native-reanimated
 * Used in Cypress tests to prevent import errors
 */

const React = require('react');

// Mock Animated API
const Animated = {
  Value: class AnimatedValue {
    constructor(value) {
      this._value = value;
    }
    setValue(value) {
      this._value = value;
    }
    setOffset() {}
    flattenOffset() {}
    extractOffset() {}
    addListener() {}
    removeListener() {}
    removeAllListeners() {}
    interpolate() {
      return new AnimatedValue(0);
    }
  },

  View: ({ children, ...props }) => children,
  Text: ({ children, ...props }) => children,
  Image: ({ children, ...props }) => children,
  ScrollView: ({ children, ...props }) => children,
  FlatList: ({ children, ...props }) => children,
  SectionList: ({ children, ...props }) => children,

  event: () => () => {},
  add: () => new Animated.Value(0),
  subtract: () => new Animated.Value(0),
  multiply: () => new Animated.Value(0),
  divide: () => new Animated.Value(0),
  modulo: () => new Animated.Value(0),
  diffClamp: () => new Animated.Value(0),

  delay: () => ({ start: () => {} }),
  sequence: () => ({ start: () => {} }),
  parallel: () => ({ start: () => {} }),
  stagger: () => ({ start: () => {} }),
  loop: () => ({ start: () => {} }),

  timing: () => ({ start: () => {} }),
  spring: () => ({ start: () => {} }),
  decay: () => ({ start: () => {} }),

  createAnimatedComponent: (Component) => Component,
};

// Hooks
const useAnimatedStyle = () => ({});
const useSharedValue = (initialValue) => ({ value: initialValue });
const useAnimatedGestureHandler = () => ({});
const useDerivedValue = () => ({ value: 0 });
const useAnimatedScrollHandler = () => () => {};
const useAnimatedReaction = () => {};
const useAnimatedRef = () => React.useRef();
const useAnimatedProps = () => ({});

// Worklets
const runOnJS = (fn) => fn;
const runOnUI = (fn) => fn;

// Easing functions
const Easing = {
  linear: () => {},
  ease: () => {},
  quad: () => {},
  cubic: () => {},
  poly: () => {},
  sin: () => {},
  circle: () => {},
  exp: () => {},
  elastic: () => {},
  back: () => {},
  bounce: () => {},
  bezier: () => {},
  in: () => {},
  out: () => {},
  inOut: () => {},
};

// Layout animations
const Layout = {
  duration: () => Layout,
  delay: () => Layout,
  springify: () => Layout,
};

const FadeIn = Layout;
const FadeOut = Layout;
const SlideInRight = Layout;
const SlideOutLeft = Layout;

module.exports = {
  default: Animated,
  ...Animated,

  // Hooks
  useAnimatedStyle,
  useSharedValue,
  useAnimatedGestureHandler,
  useDerivedValue,
  useAnimatedScrollHandler,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedProps,

  // Worklets
  runOnJS,
  runOnUI,
  withTiming: () => 0,
  withSpring: () => 0,
  withDecay: () => 0,
  withDelay: () => 0,
  withSequence: () => 0,
  withRepeat: () => 0,
  cancelAnimation: () => {},

  // Easing
  Easing,

  // Layout animations
  Layout,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,

  // Other utilities
  interpolate: () => 0,
  interpolateColor: () => '#000000',
  makeMutable: (value) => ({ value }),
  measure: () => ({}),
  scrollTo: () => {},
};
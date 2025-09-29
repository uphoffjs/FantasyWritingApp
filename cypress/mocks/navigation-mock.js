/**
 * Mock for @react-navigation/native
 * Used in Cypress tests to prevent import errors
 */

// * Simple mock function that works without Jest
const mockFn = (returnValue) => {
  const fn = (...args) => typeof returnValue === 'function' ? returnValue(...args) : returnValue;
  fn.mockImplementation = () => fn;
  fn.mockReturnValue = () => fn;
  return fn;
};

module.exports = {
  // Navigation hooks
  useNavigation: () => ({
    navigate: mockFn(),
    goBack: mockFn(),
    push: mockFn(),
    pop: mockFn(),
    popToTop: mockFn(),
    replace: mockFn(),
    reset: mockFn(),
    setOptions: mockFn(),
    setParams: mockFn(),
    getParent: mockFn(),
    getState: mockFn(),
    addListener: mockFn(),
    removeListener: mockFn(),
    isFocused: mockFn(true),
    canGoBack: mockFn(true),
  }),

  useRoute: () => ({
    key: 'test-route',
    name: 'TestScreen',
    params: {},
  }),

  useFocusEffect: mockFn(),
  useIsFocused: () => true,

  // Navigation components
  NavigationContainer: ({ children }) => children,

  // Navigation utilities
  CommonActions: {
    navigate: mockFn(),
    reset: mockFn(),
    goBack: mockFn(),
  },

  StackActions: {
    push: mockFn(),
    pop: mockFn(),
    popToTop: mockFn(),
    replace: mockFn(),
  },

  // Theme
  DefaultTheme: {
    dark: false,
    colors: {
      primary: 'rgb(0, 122, 255)',
      background: 'rgb(242, 242, 242)',
      card: 'rgb(255, 255, 255)',
      text: 'rgb(28, 28, 30)',
      border: 'rgb(216, 216, 216)',
      notification: 'rgb(255, 59, 48)',
    },
  },

  DarkTheme: {
    dark: true,
    colors: {
      primary: 'rgb(10, 132, 255)',
      background: 'rgb(1, 1, 1)',
      card: 'rgb(18, 18, 18)',
      text: 'rgb(229, 229, 231)',
      border: 'rgb(39, 39, 41)',
      notification: 'rgb(255, 69, 58)',
    },
  },

  useTheme: () => ({
    dark: false,
    colors: {
      primary: 'rgb(0, 122, 255)',
      background: 'rgb(242, 242, 242)',
      card: 'rgb(255, 255, 255)',
      text: 'rgb(28, 28, 30)',
      border: 'rgb(216, 216, 216)',
      notification: 'rgb(255, 59, 48)',
    },
  }),
};
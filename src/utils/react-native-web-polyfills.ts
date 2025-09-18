// React Native Web Polyfills and Compatibility Layer
// This file provides comprehensive polyfills and fixes for React Native Web compatibility issues

import { Platform } from 'react-native';

// Initialize global polyfills
export function initializePolyfills() {
  if (typeof window !== 'undefined') {
    // Global object polyfill
    if (typeof global === 'undefined') {
      (window as any).global = window;
    }
    
    // Process polyfill for some packages
    if (typeof process === 'undefined') {
      (window as any).process = { env: { NODE_ENV: 'development' } };
    }
    
    // RequestAnimationFrame polyfill
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = (callback: FrameRequestCallback) => {
        return window.setTimeout(callback, 1000 / 60);
      };
    }
    
    // CancelAnimationFrame polyfill
    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = (id: number) => {
        clearTimeout(id);
      };
    }
    
    // Performance.now polyfill
    if (!window.performance || !window.performance.now) {
      const startTime = Date.now();
      if (!window.performance) {
        (window as any).performance = {};
      }
      window.performance.now = () => Date.now() - startTime;
    }
  }
}

// Helper to ensure testID attributes are properly converted to data-testid for web
export function getTestProps(testId: string, isWeb = Platform.OS === 'web') {
  if (isWeb) {
    return {
      'data-testid': testId,
      'data-cy': testId, // Also add data-cy for backward compatibility
      testID: testId,
      accessibilityTestID: testId,
      accessible: true,
    };
  }
  return {
    testID: testId,
    accessibilityTestID: testId,
    accessible: true,
  };
}

// Helper to ensure proper event handling in React Native Web
export function createWebCompatibleEvent(type: string, detail?: any) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return new CustomEvent(type, { detail, bubbles: true, cancelable: true });
  }
  return null;
}

// Helper to handle synthetic events properly
export function handleSyntheticEvent(callback: Function) {
  return (event: any) => {
    // For React Native Web, ensure the event has the expected properties
    if (Platform.OS === 'web') {
      const syntheticEvent = {
        nativeEvent: event.nativeEvent || event,
        target: event.target,
        currentTarget: event.currentTarget,
        type: event.type,
        bubbles: event.bubbles !== undefined ? event.bubbles : true,
        cancelable: event.cancelable !== undefined ? event.cancelable : true,
        defaultPrevented: event.defaultPrevented || false,
        eventPhase: event.eventPhase || 2,
        isTrusted: event.isTrusted !== undefined ? event.isTrusted : true,
        timeStamp: event.timeStamp || Date.now(),
        preventDefault: () => event.preventDefault?.(),
        stopPropagation: () => event.stopPropagation?.(),
      };
      callback(syntheticEvent);
    } else {
      callback(event);
    }
  };
}

// Helper for handling text input events consistently
export function handleTextInputChange(onChange?: (text: string) => void, onChangeText?: (text: string) => void) {
  return (event: any) => {
    const text = Platform.OS === 'web' 
      ? (event.target?.value ?? event.nativeEvent?.text ?? '')
      : (event.nativeEvent?.text ?? '');
    
    // Call both handlers if they exist
    onChange?.(text);
    onChangeText?.(text);
  };
}

// Helper for handling select/picker events
export function handleSelectChange(onChange?: (value: string) => void) {
  return (event: any) => {
    const value = Platform.OS === 'web'
      ? (event.target?.value ?? '')
      : (event.nativeEvent?.value ?? '');
    
    onChange?.(value);
  };
}

// Helper to ensure proper style object format for React Native Web
export function normalizeStyles(styles: any) {
  if (!styles) return {};
  
  // If it's already an object, return as-is
  if (typeof styles === 'object' && !Array.isArray(styles)) {
    return styles;
  }
  
  // If it's an array, merge all objects
  if (Array.isArray(styles)) {
    return styles.reduce((acc, style) => {
      if (style) {
        return { ...acc, ...normalizeStyles(style) };
      }
      return acc;
    }, {});
  }
  
  return {};
}

// Helper to handle platform-specific component props
export function getPlatformProps(webProps: any = {}, nativeProps: any = {}) {
  return Platform.OS === 'web' ? webProps : nativeProps;
}

// Helper to ensure proper accessibility props
export function getAccessibilityProps(label: string, hint?: string, role?: string) {
  const props: any = {
    accessible: true,
    accessibilityLabel: label,
  };
  
  if (hint) {
    props.accessibilityHint = hint;
  }
  
  if (role) {
    props.accessibilityRole = role;
    if (Platform.OS === 'web') {
      props.role = role; // Web also uses the role attribute
    }
  }
  
  return props;
}

// Helper for handling keyboard events
export function handleKeyPress(onEnter?: () => void, onEscape?: () => void) {
  return (event: any) => {
    const key = event.nativeEvent?.key || event.key;
    
    if (key === 'Enter' && onEnter) {
      event.preventDefault?.();
      onEnter();
    } else if (key === 'Escape' && onEscape) {
      event.preventDefault?.();
      onEscape();
    }
  };
}

// Polyfill for React Native's InteractionManager on web
export const InteractionManagerWeb = {
  runAfterInteractions: (callback: () => void) => {
    if (Platform.OS === 'web') {
      // On web, use requestAnimationFrame for similar behavior
      requestAnimationFrame(callback);
    } else {
      // On native, use the actual InteractionManager
      const { InteractionManager } = require('react-native');
      InteractionManager.runAfterInteractions(callback);
    }
  },
  
  createInteractionHandle: () => {
    return {
      cancel: () => {},
    };
  },
};

// Polyfill for React Native's LayoutAnimation on web
export const LayoutAnimationWeb = {
  configureNext: (config: any, onAnimationDidEnd?: () => void) => {
    if (Platform.OS === 'web') {
      // On web, just call the callback immediately
      onAnimationDidEnd?.();
    } else {
      const { LayoutAnimation } = require('react-native');
      LayoutAnimation.configureNext(config, onAnimationDidEnd);
    }
  },
  
  create: (duration: number, type: string, creationProp: string) => {
    return {
      duration,
      type,
      property: creationProp,
    };
  },
  
  Types: {
    linear: 'linear',
    easeIn: 'easeIn',
    easeOut: 'easeOut',
    easeInEaseOut: 'easeInEaseOut',
    spring: 'spring',
  },
  
  Properties: {
    opacity: 'opacity',
    scaleX: 'scaleX',
    scaleY: 'scaleY',
    scaleXY: 'scaleXY',
  },
};

// Initialize polyfills on import
if (Platform.OS === 'web') {
  initializePolyfills();
}

// Export utility to check if running in test environment
export const isTestEnvironment = () => {
  if (typeof window !== 'undefined') {
    return !!(window as any).Cypress || process.env.NODE_ENV === 'test';
  }
  return process.env.NODE_ENV === 'test';
};

// Export helper to wait for React Native Web to be ready
export const waitForReactNativeWeb = () => {
  return new Promise((resolve) => {
    if (Platform.OS === 'web') {
      // Give React Native Web time to initialize
      setTimeout(resolve, 100);
    } else {
      resolve(undefined);
    }
  });
};
// React Native Web Polyfills
// This file provides polyfills for React Native Web compatibility

// Polyfill for requestIdleCallback (not available in all browsers)
if (typeof window !== 'undefined' && !window.requestIdleCallback) {
  window.requestIdleCallback = function(callback, options) {
    const start = Date.now();
    return setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
      });
    }, options?.timeout || 1);
  };

  window.cancelIdleCallback = function(id) {
    clearTimeout(id);
  };
}

// Export empty object as default
export default {};
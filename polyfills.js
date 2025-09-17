// Polyfills for React Native Web compatibility

// Global polyfill
if (typeof window !== 'undefined') {
  if (typeof global === 'undefined') {
    window.global = window;
  }
  
  // Process polyfill for some packages
  if (typeof process === 'undefined') {
    window.process = { env: { NODE_ENV: 'development' } };
  }
}
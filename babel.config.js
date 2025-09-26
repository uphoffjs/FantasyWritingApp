module.exports = function(api) {
  // Detect web builds through multiple methods
  const isWeb = api.env('production') ||
                process.env.WEBPACK === 'true' ||
                process.env.npm_lifecycle_event === 'web' ||
                process.env.npm_lifecycle_event === 'dev' ||
                process.env.npm_lifecycle_event?.startsWith('dev:');

  // * Detect test environment
  const isTest = api.env('test') || process.env.NODE_ENV === 'test';

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: isWeb || isTest ? [] : ['nativewind/babel'],
  };
};

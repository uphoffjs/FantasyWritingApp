module.exports = function(api) {
  // Detect web builds through multiple methods
  const isWeb = api.env('production') ||
                process.env.WEBPACK === 'true' ||
                process.env.npm_lifecycle_event === 'web' ||
                process.env.npm_lifecycle_event === 'dev' ||
                process.env.npm_lifecycle_event?.startsWith('dev:');

  // * Detect test environment
  const isTest = api.env('test') || process.env.NODE_ENV === 'test';

  // * Base plugins array
  const plugins = [];

  // * Add NativeWind only for non-web and non-test environments
  if (!isWeb && !isTest) {
    plugins.push('nativewind/babel');
  }

  // * Add explicit class property plugins with consistent 'loose' mode for all environments
  // * This fixes the Babel configuration conflict with Cypress
  plugins.push(
    ['@babel/plugin-transform-class-properties', { loose: true }],
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['@babel/plugin-transform-private-property-in-object', { loose: true }]
  );

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins,
  };
};

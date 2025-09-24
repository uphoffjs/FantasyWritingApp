// * Optimized webpack configuration for Cypress component tests
// * Focused on fast build times and minimal transformations
const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './index.web.entry.js',

  // * Performance optimizations
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.webpack-cache'),
    // * Cache invalidation based on package versions
    buildDependencies: {
      config: [__filename],
      package: [path.resolve(__dirname, 'package-lock.json')]
    },
    // * Aggressive caching for test builds
    compression: false,
    profile: false,
    maxAge: 86400000, // 24 hours
    allowCollectingMemory: true
  },

  // * Minimal output for tests
  output: {
    path: path.resolve(__dirname, 'dist-test'),
    filename: '[name].js',
    publicPath: '/',
    globalObject: 'this',
    // * Skip hashing for test builds
    clean: false
  },

  // * Faster source maps for tests
  devtool: 'eval-cheap-module-source-map',

  // * Optimized build performance
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
    minimize: false,
    concatenateModules: false,
    usedExports: false,
    providedExports: false,
    sideEffects: false,
    // * Single runtime for faster builds
    runtimeChunk: false
  },

  // * Minimal logging for performance
  infrastructureLogging: {
    level: 'error'
  },

  stats: 'errors-only',

  // * Ignore warnings for test builds
  ignoreWarnings: [
    { module: /.*/ }
  ],

  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      'react-native-svg': 'react-native-svg/lib/commonjs'
    },
    extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.ts', '.tsx', '.json'],
    fullySpecified: false,
    // * Add proper module resolution paths
    modules: [
      path.resolve(__dirname, 'src'),
      path.resolve(__dirname, 'node_modules'),
      'node_modules'
    ],
    // * Simplified fallbacks for tests
    fallback: {
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      util: false,
      timers: require.resolve('timers-browserify'),
      "react-native-document-picker": false,
      "react-native-fs": false,
      "react-native-share": false,
      "@react-native-picker/picker": false,
      "@react-native-community/datetimepicker": false
    },
    // * Cache module resolution
    cache: true,
    // * Skip symlinks for faster resolution
    symlinks: false
  },

  module: {
    // * Skip parsing for known large libraries
    noParse: /jquery|lodash|moment/,

    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        // * Include all React Native related modules that need transpilation
        exclude: /node_modules\/(?!(react-native.*|@react-native.*|@react-navigation.*|react-native-gesture-handler|react-native-reanimated|react-native-safe-area-context|react-native-screens|react-native-svg)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            // * Aggressive caching
            cacheDirectory: true,
            cacheCompression: false,
            compact: false,
            // * Minimal babel config for tests
            configFile: false,
            babelrc: false,
            presets: [
              ['@babel/preset-env', {
                modules: false,
                // * Target modern browsers for tests
                targets: { chrome: '90' },
                // * Skip polyfills for tests
                useBuiltIns: false
              }],
              ['@babel/preset-react', {
                runtime: 'automatic',
                development: true
              }],
              ['@babel/preset-typescript', {
                // * Faster TS transpilation
                onlyRemoveTypeImports: true,
                allowDeclareFields: true
              }]
            ],
            plugins: [
              // * Minimal plugin set but include necessary transforms
              ['@babel/plugin-transform-runtime', {
                helpers: true,
                regenerator: true
              }],
              // * Fix loose mode warnings for react-native-svg
              ['@babel/plugin-transform-class-properties', { loose: true }],
              ['@babel/plugin-transform-private-methods', { loose: true }],
              ['@babel/plugin-transform-private-property-in-object', { loose: true }],
              'react-native-web'
            ]
          }
        }
      },
      {
        // * Special handling for react-native-svg modules to fix ESM/CJS conflicts
        test: /node_modules[/\\]react-native-svg[/\\].*\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                modules: 'commonjs', // * Force CommonJS for react-native-svg
                targets: { esmodules: false }
              }],
              ['@babel/preset-react', { runtime: 'automatic' }]
            ],
            plugins: [
              '@babel/plugin-transform-modules-commonjs',
              // * Fix loose mode warnings for react-native-svg
              ['@babel/plugin-transform-class-properties', { loose: true }],
              ['@babel/plugin-transform-private-methods', { loose: true }],
              ['@babel/plugin-transform-private-property-in-object', { loose: true }]
            ]
          }
        }
      },
      {
        // * Fix module resolution for ESM modules
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false
        }
      },
      {
        // * Simplified CSS handling for tests
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              // * Skip CSS modules for tests
              modules: false,
              sourceMap: false
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource'
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(true),
      'process.env.NODE_ENV': JSON.stringify('test'),
      'global': 'window'
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
      // * Required for sinon and react-native-web
      setImmediate: ['timers-browserify', 'setImmediate'],
      clearImmediate: ['timers-browserify', 'clearImmediate']
    }),
    // * Progress plugin for visibility
    new webpack.ProgressPlugin({
      activeModules: false,
      entries: false,
      modules: false,
      dependencies: false,
      percentBy: null
    })
  ],

  // * Optimized dev server for tests
  devServer: {
    port: 3003,
    host: 'localhost',
    hot: false, // * Disable HMR for tests
    liveReload: false, // * Disable live reload for tests
    compress: false, // * Skip compression for local tests
    historyApiFallback: false,
    // * Minimal middleware configuration
    devMiddleware: {
      writeToDisk: false,
      stats: 'errors-only'
    },
    client: {
      logging: 'error',
      overlay: false,
      progress: false
    },
    // * Skip opening browser for tests
    open: false,
    static: {
      directory: path.join(__dirname, 'web'),
      publicPath: '/',
      serveIndex: false,
      watch: false // * Don't watch files during tests
    },
    // * Faster server startup
    setupExitSignals: false,
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },

  // * Performance hints disabled for tests
  performance: {
    hints: false
  },

  // * Watch options for development
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 300,
    poll: false
  }
};
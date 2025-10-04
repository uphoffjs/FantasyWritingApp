/**
 * Webpack Configuration for Cypress Tests
 *
 * Handles React Native Web compatibility and module resolution
 * for both E2E and Component tests
 */

const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',

  // * Set NODE_ENV to 'test' to ensure NativeWind is excluded
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('test'),
    }),
  ],

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],

    // Alias React Native modules to prevent import errors in E2E tests
    alias: {
      // React Native Web aliasing
      'react-native$': 'react-native-web',

      // Mock AsyncStorage for E2E tests
      '@react-native-async-storage/async-storage$': path.resolve(__dirname, 'mocks/async-storage-mock.js'),

      // Other React Native modules that might cause issues
      'react-native-vector-icons': path.resolve(__dirname, 'mocks/vector-icons-mock.js'),
      'react-native-gesture-handler': path.resolve(__dirname, 'mocks/gesture-handler-mock.js'),
      'react-native-reanimated': path.resolve(__dirname, 'mocks/reanimated-mock.js'),
      'react-native-safe-area-context': path.resolve(__dirname, 'mocks/safe-area-mock.js'),
      '@react-navigation/native': path.resolve(__dirname, 'mocks/navigation-mock.js')
    },

    // Fallback for Node.js modules
    fallback: {
      "fs": false,
      "path": false,
      "crypto": false
    }
  },

  module: {
    rules: [
      // TypeScript/TSX files
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            // * Force test environment to exclude NativeWind
            envName: 'test',
            presets: [
              '@babel/preset-typescript',
              '@babel/preset-react',
              ['@babel/preset-env', { modules: false }]
            ],
            plugins: [
              // * Use newer plugin names with consistent 'loose' mode to fix Babel conflicts
              ['@babel/plugin-transform-class-properties', { loose: true }],
              ['@babel/plugin-transform-private-methods', { loose: true }],
              ['@babel/plugin-transform-private-property-in-object', { loose: true }],
              '@babel/plugin-transform-runtime'
            ],
            // * Ignore PostCSS/NativeWind processing
            compact: false
          }
        }
      },

      // JavaScript/JSX files
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            // * Force test environment
            envName: 'test',
            presets: [
              '@babel/preset-react',
              ['@babel/preset-env', { modules: false }]
            ],
            compact: false
          }
        }
      },

      // Handle Flow types in React Native modules
      {
        test: /\.js$/,
        include: /node_modules[/\\]react-native/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-flow']
          }
        }
      },

      // CSS files
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },

      // Asset files
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset/resource'
      }
    ]
  },

  // Ignore warnings about module size
  performance: {
    hints: false
  },

  // Source maps for debugging
  devtool: 'eval-source-map'
};
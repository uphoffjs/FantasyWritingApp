// * Webpack configuration for Cypress component tests
// ! Specifically designed to handle React Native Web without Flow type issues

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',

  entry: './cypress/support/component.tsx',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  resolve: {
    // * Extension resolution order for React Native Web
    extensions: [
      '.web.tsx', '.web.ts', '.web.jsx', '.web.js',
      '.tsx', '.ts', '.jsx', '.js'
    ],

    alias: {
      // ! Critical: Redirect ALL react-native imports to react-native-web
      'react-native$': 'react-native-web',
      'react-native/': 'react-native-web/dist/',

      // * Specific module aliases
      'react-native-svg': 'react-native-svg/lib/commonjs',
      'merge-options': path.resolve(__dirname, 'src/utils/merge-options-wrapper.js'),

      // * Project aliases
      '@': path.resolve(__dirname, 'src'),
    },
  },

  module: {
    rules: [
      // * TypeScript and JavaScript handling
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules\/(?!(react-native-.*|@react-native.*)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript',
            ],
            plugins: [
              ['@babel/plugin-transform-class-properties', { loose: true }],
              ['@babel/plugin-transform-private-methods', { loose: true }],
              ['@babel/plugin-transform-private-property-in-object', { loose: true }],
            ],
          },
        },
      },

      // * CSS handling
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },

      // * Asset handling
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },

      // ! Ignore Flow files completely
      {
        test: /\.flow$/,
        use: 'ignore-loader',
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './cypress/support/component-index.html',
    }),
  ],

  // * Performance optimizations for tests
  performance: {
    hints: false,
  },

  // * Dev server configuration for Cypress
  devServer: {
    port: 3003,
    hot: true,
    static: {
      directory: path.join(__dirname, 'public'),
    },
  },
};
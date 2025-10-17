const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const CopyPlugin = require('copy-webpack-plugin');

// Get port from environment variable or use defaults
const PORT = process.env.PORT || 3002; // ! Changed from 3000 to match Vite port
const _FALLBACK_PORTS = [3001, 5000, 5173, 8000, 8080, 8081, 9000]; // Unused but kept for reference

module.exports = {
  entry: './index.web.entry.js',
  optimization: {
    runtimeChunk: 'single'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    publicPath: '/',
    globalObject: 'this'
  },
  infrastructureLogging: {
    level: 'error'
  },
  ignoreWarnings: [
    {
      module: /react-native-worklets/,
      message: /Critical dependency/
    },
    // * Suppress cypress-axe warnings about require and require.resolve
    // * These are false positives since Cypress provides these in its context
    {
      module: /cypress-axe/,
      message: /Critical dependency/
    }
  ],
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      // * Map react-native-svg to react-native-svg/lib/commonjs for web compatibility
      'react-native-svg': 'react-native-svg/lib/commonjs'
    },
    extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.ts', '.tsx', '.json'],
    fullySpecified: false,
    fallback: {
      "fs": false,
      "path": false,
      "crypto": false,
      "stream": false,
      "util": false,
      "react-native-document-picker": false,
      "react-native-fs": false,
      "react-native-share": false,
      "@react-native-picker/picker": false,
      "@react-native-community/datetimepicker": false
    }
  },
  module: {
    rules: [
      // ! Rule 1: Process src/ files with TypeScript (NO Flow preset)
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: [
          /node_modules/
        ],
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            configFile: false,
            babelrc: false,
            presets: [
              ['@babel/preset-env', { modules: false }],
              ['@babel/preset-react', { runtime: 'automatic' }],
              ['@babel/preset-typescript', { onlyRemoveTypeImports: true }]
            ],
            plugins: [
              // ! Removed @babel/plugin-transform-runtime completely - it was breaking named exports
              ['@babel/plugin-transform-class-properties', { loose: true }],
              ['@babel/plugin-transform-private-methods', { loose: true }],
              ['@babel/plugin-transform-private-property-in-object', { loose: true }]
              // ! Removed react-native-web plugin - it was converting named exports to default export
            ]
          }
        }
      },
      // ! Rule 2: ONLY process react-native core (NOT @react-navigation)
      // ! @react-navigation is already built as ES modules and should not be transformed
      {
        test: /\.(js|jsx)$/,
        include: /node_modules\/(react-native|@react-native(?!\/@react-navigation)|react-native-gesture-handler|react-native-reanimated|react-native-safe-area-context|react-native-screens|react-native-svg)(?!\/@react-navigation)/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            configFile: false,
            babelrc: false,
            presets: [
              '@babel/preset-flow', // ! Strip Flow types from React Native
              ['@babel/preset-env', { modules: false }],
              ['@babel/preset-react', { runtime: 'automatic' }]
            ],
            plugins: [
              ['@babel/plugin-transform-runtime', {
                helpers: true,
                regenerator: true,
                useESModules: true
              }],
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
                modules: 'commonjs',  // * Force CommonJS for react-native-svg
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
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[name].[hash].[ext]'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new Dotenv({
      systemvars: true
    }),
    new HtmlWebpackPlugin({
      template: './web/index.html',
      filename: 'index.html'
    }),
    new CopyPlugin({
      patterns: [
        { from: 'web/manifest.json', to: 'manifest.json' },
        { from: 'web/service-worker-dev.js', to: 'service-worker.js' },
        { from: 'web/icon-192.png', to: 'icon-192.png', noErrorOnMissing: true },
        { from: 'web/icon-512.png', to: 'icon-512.png', noErrorOnMissing: true },
        { from: 'web/favicon.ico', to: 'favicon.ico', noErrorOnMissing: true },
        { from: 'web/favicon.png', to: 'favicon.png', noErrorOnMissing: true }
      ]
    }),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'global': 'window'
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ],
  devServer: {
    port: PORT,
    // Automatically find an available port if the specified port is busy
    allowedHosts: 'all',
    host: '0.0.0.0', // ! Changed from 'localhost' to bind to all interfaces for Docker compatibility
    historyApiFallback: true,
    hot: true,  // Enable hot module replacement
    liveReload: true, // Enable live reloading
    // * Only auto-open browser during manual development, not during automated tests
    open: process.env.CI || process.env.CYPRESS_TEST ? false : {
      // * Configure to open in Chrome browser
      app: {
        name: process.platform === 'darwin'
          ? 'Google Chrome' // macOS app name
          : process.platform === 'win32'
          ? 'chrome' // Windows executable name
          : 'google-chrome', // Linux executable name
        // ! Platform-specific browser arguments
        arguments: process.platform === 'linux'
          ? ['--new-window'] // Linux may need this
          : [] // macOS and Windows don't need arguments
      }
    },
    static: {
      directory: path.join(__dirname, 'web'),
      publicPath: '/'
    },
    devMiddleware: {
      writeToDisk: false  // Improve performance by not writing to disk
    },
    client: {
      logging: 'info',
      overlay: {
        errors: true,
        warnings: false
      },
      progress: true
    },
    // Custom setup to handle port finding
    onListening: function (devServer) {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }
      const port = devServer.server.address().port;
      console.log(`\n🚀 Fantasy Element Builder is running on port ${port}`);
      console.log(`📱 Open http://localhost:${port} in your browser\n`);
    }
  }
};
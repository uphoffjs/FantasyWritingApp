const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const CopyPlugin = require('copy-webpack-plugin');

// Get port from environment variable or use defaults
const PORT = process.env.PORT || 3000;
const FALLBACK_PORTS = [3001, 5000, 5173, 8000, 8080, 8081, 9000];

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
    }
  ],
  resolve: {
    alias: {
      'react-native$': 'react-native-web'
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
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules\/(?!(react-native.*|@react-native.*|@react-navigation.*|react-native-gesture-handler|react-native-reanimated|react-native-safe-area-context|react-native-screens)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            // Don't use babel.config.js for web builds
            configFile: false,
            babelrc: false,
            presets: [
              ['@babel/preset-env', { modules: false }],
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript'
            ],
            plugins: [
              ['@babel/plugin-transform-runtime', {
                helpers: true,
                regenerator: true
              }],
              'react-native-web'
              // NativeWind babel plugin removed for web builds - causes PostCSS async issues
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
    host: 'localhost', // Use localhost for better compatibility
    historyApiFallback: true,
    hot: true,  // Enable hot module replacement
    liveReload: true, // Enable live reloading
    open: {
      // * Configure to open in Brave browser
      app: {
        name: 'Brave Browser',
        // ! Platform-specific browser paths
        arguments: process.platform === 'darwin' 
          ? [] // macOS doesn't need arguments
          : process.platform === 'win32'
          ? [] // Windows doesn't need arguments
          : ['--new-window'] // Linux may need this
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
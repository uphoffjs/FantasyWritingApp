// * Add Vite-specific polyfills
// ! TEMP: Commented out to bypass Vite Flow syntax errors
// import 'react-native-gesture-handler';
import './src/index.css';

// ! Important: Check for Vite vs Webpack
if (import.meta.env?.MODE) {
  console.log('Running with Vite in', import.meta.env.MODE, 'mode');
}

// Existing entry code...
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// * Web-specific setup
if (typeof document !== 'undefined') {
  AppRegistry.registerComponent(appName, () => App);
  AppRegistry.runApplication(appName, {
    initialProps: {},
    rootTag: document.getElementById('root'),
  });
}
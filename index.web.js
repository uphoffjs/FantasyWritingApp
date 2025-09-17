// CSS import removed - NativeWind handles styles through Tailwind classes
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Register the app
AppRegistry.registerComponent(appName, () => App);

// Run the app
AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root')
});
import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Discovery from './app/index';

function App() {
  return <SafeAreaProvider><StatusBar style="dark" /><Discovery /></SafeAreaProvider>;
}

registerRootComponent(App);

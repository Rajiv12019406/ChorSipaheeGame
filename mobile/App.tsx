import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppNavigator} from './src/navigation/AppNavigator';
import {useGameStore} from './src/store/gameStore';
import {colors} from './src/theme/colors';

function App() {
  const loadPersisted = useGameStore(s => s.loadPersisted);
  const bindSocket = useGameStore(s => s.bindSocket);

  useEffect(() => {
    void loadPersisted();
    bindSocket();
  }, [loadPersisted, bindSocket]);

  return (
    <GestureHandlerRootView style={{flex: 1, backgroundColor: colors.bg}}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;

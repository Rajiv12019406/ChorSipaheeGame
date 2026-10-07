import React from 'react';
import {NavigationContainer, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {RootStackParamList} from './types';
import {SplashScreen} from '../screens/SplashScreen';
import {HomeScreen} from '../screens/HomeScreen';
import {JoinGameScreen} from '../screens/JoinGameScreen';
import {LobbyScreen} from '../screens/LobbyScreen';
import {HostSetupScreen} from '../screens/HostSetupScreen';
import {GameScreen} from '../screens/GameScreen';
import {GameOverScreen} from '../screens/GameOverScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {colors} from '../theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bgElevated,
    text: colors.text,
    border: colors.border,
    primary: colors.gold,
  },
};

export function AppNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: {backgroundColor: colors.bg},
        }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="JoinGame" component={JoinGameScreen} />
        <Stack.Screen name="Lobby" component={LobbyScreen} />
        <Stack.Screen name="HostSetup" component={HostSetupScreen} />
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{gestureEnabled: false}}
        />
        <Stack.Screen name="GameOver" component={GameOverScreen} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            headerShown: true,
            headerTitle: 'Settings',
            headerTintColor: colors.gold,
            headerStyle: {backgroundColor: colors.bg},
            headerShadowVisible: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

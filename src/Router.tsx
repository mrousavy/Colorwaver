import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Camera} from 'react-native-vision-camera';
import {App} from './App';
import type {Routes} from './Routes';
import {Splash} from './Splash';

const Stack = createNativeStackNavigator<Routes>();

export function Router() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const result = await Camera.getCameraPermissionStatus();
        setHasPermission(result === 'authorized');
      } catch (e) {
        setHasPermission(false);
      }
    })();
  }, []);

  if (hasPermission == null) {
    return <View style={styles.blackscreen} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
        initialRouteName={hasPermission ? 'App' : 'Splash'}>
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="App" component={App} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  blackscreen: {
    flex: 1,
    backgroundColor: 'black',
  },
});

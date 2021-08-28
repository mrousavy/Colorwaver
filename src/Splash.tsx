import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useState} from 'react';
import {Alert, Linking, Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Camera} from 'react-native-vision-camera';
import {Routes} from './Routes';

type Props = NativeStackScreenProps<Routes, 'Splash'>;

export function Splash({navigation}: Props) {
  console.log('re-rendering Splash.');
  const [hasPermission, setHasPermission] = useState(false);

  const requestPermission = useCallback(async () => {
    try {
      const result = await Camera.requestCameraPermission();
      setHasPermission(result === 'authorized');
    } catch (e) {
      Alert.alert(
        'Failed to request permission!',
        'Failed to request Camera permission. Please verify that you have granted Camera Permission in your Settings app.',
      );
      await Linking.openSettings();
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const result = await Camera.getCameraPermissionStatus();
        setHasPermission(result === 'authorized');
      } catch (e) {
        Alert.alert(
          'Failed to get permission!',
          'Failed to get Camera permission. Please verify that you have granted Camera Permission in your Settings app.',
        );
      }
    })();
  }, []);

  useEffect(() => {
    if (hasPermission) {
      navigation.replace('App');
    }
  }, [hasPermission, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={requestPermission}>
        <Text>Request Permission</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
});

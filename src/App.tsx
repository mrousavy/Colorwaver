import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {Camera} from 'react-native-vision-camera';
import {Routes} from './Routes';

type Props = NativeStackScreenProps<Routes, 'App'>;

export function App(props: Props) {
  console.log('re-rendering App.');
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const requestPermission = async () => {
      try {
        const result = await Camera.getCameraPermissionStatus();
        setHasPermission(result === 'authorized');
      } catch (e) {
        Alert.alert(
          'Failed to request permissions!',
          'Failed to request Camera permission. Please verify that you have granted Camera Permission in your Settings app.',
        );
      }
    };
    requestPermission();
  }, []);

  return (
    <View style={styles.container}>
      <Text>HEllo!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
  },
});

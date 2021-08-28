import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {Camera} from 'react-native-vision-camera';

export function Router() {
  console.log('re-rendering Router.');
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
      <Text>Hello!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
  },
});

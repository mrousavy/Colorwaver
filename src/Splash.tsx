import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useState} from 'react';
import {Alert, Image, Linking, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Camera} from 'react-native-vision-camera';
import {Routes} from './Routes';

const IMAGE = require('./assets/11.png');

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
      <Image source={IMAGE} style={styles.backgroundImage} />

      <Text style={styles.header}>Welcome to{'\n'}Colorwaver.</Text>

      <View style={styles.permissionsContainer}>
        <Text style={styles.permissionText}>
          Colorwaver needs <Text style={styles.bold}>Camera permission</Text>.{' '}
          <Text style={styles.hyperlink} onPress={requestPermission}>
            Grant
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  backgroundImage: {
    position: 'absolute',
    opacity: 0.4,
    bottom: 0,
    left: 0,
  },
  header: {
    fontSize: 38,
    fontWeight: 'bold',
    maxWidth: '80%',
  },
  permissionsContainer: {
    marginTop: 30,
  },
  permissionText: {
    fontSize: 18,
    maxWidth: '80%',
  },
  hyperlink: {
    color: '#007aff',
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
});

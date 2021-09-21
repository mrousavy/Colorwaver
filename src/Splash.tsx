import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useState} from 'react';
import {Alert, Image, Linking, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Camera} from 'react-native-vision-camera';
import type {Routes} from './Routes';

const IMAGE = require('./assets/icon.png');

type Props = NativeStackScreenProps<Routes, 'Splash'>;

export function Splash({navigation}: Props) {
  const [hasPermission, setHasPermission] = useState(false);

  const requestPermission = useCallback(async () => {
    try {
      const result = await Camera.requestCameraPermission();
      if (result === 'authorized') {
        setHasPermission(true);
      } else {
        await Linking.openSettings();
      }
    } catch (e) {
      Alert.alert(
        'Failed to request permission!',
        'Failed to request Camera permission. Please verify that you have granted Camera Permission in your Settings app.',
      );
      await Linking.openSettings();
    }
  }, []);

  useEffect(() => {
    if (hasPermission) {
      navigation.navigate('App');
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
    width: 256,
    height: 256,
    opacity: 0.4,
    bottom: 0,
    left: -70,
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
